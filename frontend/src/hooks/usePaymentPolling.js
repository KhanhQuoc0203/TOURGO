// frontend/src/hooks/usePaymentPolling.js

import { useState, useEffect, useRef, useCallback } from 'react';
import axiosClient from '../api/axiosClient';

/**
 * Hook polling trạng thái thanh toán.
 * Tự động gọi API mỗi `interval` ms cho đến khi thanh toán xong
 * hoặc hết số lần thử tối đa.
 *
 * Cách dùng:
 *   const { paymentData, isLoading, isSuccess, isFailed, error, stopPolling }
 *     = usePaymentPolling(bookingId, { onSuccess, onFailed });
 */
const usePaymentPolling = (bookingId, options = {}) => {
  const {
    interval = 3000,       // Gọi API mỗi 3 giây
    maxAttempts = 40,      // Tối đa 40 lần = 2 phút
    onSuccess = null,      // Callback khi thanh toán thành công
    onFailed = null,       // Callback khi thanh toán thất bại
    enabled = true,        // Có bật polling không
  } = options;

  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [pollingState, setPollingState] = useState('idle');
  // idle | polling | success | failed | timeout | stopped

  const timerRef = useRef(null);
  const attemptRef = useRef(0);
  const isMountedRef = useRef(true);

  // Dọn dẹp timer
  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Dừng polling thủ công
  const stopPolling = useCallback(() => {
    clearTimer();
    setPollingState('stopped');
  }, [clearTimer]);

  // Gọi API một lần
  const fetchStatus = useCallback(async () => {
    if (!bookingId || !isMountedRef.current) return;

    setIsLoading(true);
    attemptRef.current += 1;
    setAttemptCount(attemptRef.current);

    try {
      const res = await axiosClient.get(
        `/bookings/${bookingId}/payment-status/`
      );
      const data = res.data;

      if (!isMountedRef.current) return;

      setPaymentData(data);
      setError(null);

      // Thanh toán thành công
      if (data.is_paid) {
        setPollingState('success');
        clearTimer();
        onSuccess?.(data);
        return;
      }

      // Thanh toán thất bại / bị huỷ
      const failedStatuses = ['FAILED', 'failed', 'CANCELLED', 'cancelled'];
      if (
        failedStatuses.includes(data.payment_status) ||
        failedStatuses.includes(data.booking_status)
      ) {
        setPollingState('failed');
        clearTimer();
        onFailed?.(data);
        return;
      }

      // Hết lượt thử
      if (attemptRef.current >= maxAttempts) {
        setPollingState('timeout');
        clearTimer();
        return;
      }

      // Nếu backend nói không cần poll nữa
      if (!data.poll_again) {
        clearTimer();
        return;
      }

      // Tiếp tục poll sau `interval` ms
      if (isMountedRef.current) {
        setPollingState('polling');
        timerRef.current = setTimeout(fetchStatus, interval);
      }

    } catch (err) {
      if (!isMountedRef.current) return;

      const errMsg =
        err.response?.data?.error ||
        err.message ||
        'Không thể kiểm tra trạng thái thanh toán.';
      setError(errMsg);

      // Thử lại nếu còn lượt (lỗi mạng tạm thời)
      if (attemptRef.current < maxAttempts && isMountedRef.current) {
        timerRef.current = setTimeout(fetchStatus, interval);
      } else {
        setPollingState('timeout');
      }
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [bookingId, interval, maxAttempts, onSuccess, onFailed, clearTimer]);

  // Bắt đầu polling khi bookingId thay đổi hoặc enabled = true
  useEffect(() => {
    isMountedRef.current = true;

    if (!enabled || !bookingId) return;

    attemptRef.current = 0;
    setAttemptCount(0);
    setPollingState('polling');
    setPaymentData(null);
    setError(null);

    fetchStatus();

    return () => {
      isMountedRef.current = false;
      clearTimer();
    };
  }, [bookingId, enabled]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    paymentData,
    isLoading,
    error,
    attemptCount,
    stopPolling,

    // Các trạng thái tiện dùng trong UI
    isPolling: pollingState === 'polling',
    isSuccess: pollingState === 'success',
    isFailed: pollingState === 'failed',
    isTimeout: pollingState === 'timeout',
    isStopped: pollingState === 'stopped',
    pollingState,
  };
};

export default usePaymentPolling;