import React, { useEffect, useState } from 'react';
import usePaymentPolling from '../../../hooks/usePaymentPolling';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Home, ShoppingBag } from 'lucide-react';
import './PaymentResult.css';

export default function PaymentResult() {
    const location = useLocation();
    const navigate = useNavigate();
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);
    const [bookingId, setBookingId] = useState(null);

    const { paymentData, isSuccess: isPollingSuccess } = usePaymentPolling(bookingId, {
    enabled: !!bookingId,
    onSuccess: (data) => {
        // Cập nhật thêm booking_code vào result khi polling xác nhận
        setResult(prev => prev ? {
            ...prev,
            bookingCode: data.booking_code,
            tourName: data.tour_name,
        } : prev);
    },
});

    useEffect(() => {
        // Lấy query parameters từ URL mà VNPay trả về
        const queryParams = new URLSearchParams(location.search);
        const responseCode = queryParams.get('vnp_ResponseCode');
        const amount = queryParams.get('vnp_Amount');
        const orderInfo = queryParams.get('vnp_OrderInfo');
        const txnRef = queryParams.get('vnp_TxnRef');

        if (responseCode === '00') {
            // Lấy bookingId từ vnp_TxnRef (ví dụ TxnRef = "42_20250116103000" → bookingId = 42)
            const parsedBookingId = txnRef ? parseInt(txnRef.split('_')[0]) : null;
            setBookingId(parsedBookingId);

            setResult({
                status: 'success',
                message: 'Thanh toán thành công!',
                subMessage: 'Cảm ơn bạn đã tin tưởng TOURGO. Vé điện tử đã được gửi tới email của bạn.',
                amount: parseInt(amount) / 100,
                txnRef: txnRef
            });
        } 
        else {
            setResult({
                status: 'error',
                message: 'Thanh toán thất bại',
                subMessage: 'Có lỗi xảy ra trong quá trình giao dịch. Vui lòng thử lại hoặc liên hệ hỗ trợ.',
                code: responseCode
            });
        }
        setLoading(false);
    }, [location]);

    if (loading) return <div className="loading-screen">Đang xác thực giao dịch...</div>;

    return (
        <div className="result-page">
            <div className={`result-card ${result.status}`}>
                <div className="icon-wrapper">
                    {result.status === 'success' ? (
                        <CheckCircle size={80} color="#22c55e" />
                    ) : (
                        <XCircle size={80} color="#ef4444" />
                    )}
                </div>
                
                <h1>{result.message}</h1>
                <p className="sub-message">{result.subMessage}</p>

                {result.status === 'success' && (
                    <div className="details-box">
                        {result.bookingCode && (
                            <div className="detail-item">
                                <span>Mã đặt tour:</span>
                                <strong className="booking-code-display">{result.bookingCode}</strong>
                            </div>
                        )}
                        {result.tourName && (
                            <div className="detail-item">
                                <span>Tour:</span>
                                <strong>{result.tourName}</strong>
                            </div>
                        )}
                        <div className="detail-item">
                            <span>Mã giao dịch:</span>
                            <strong>{result.txnRef}</strong>
                        </div>
                        <div className="detail-item">
                            <span>Số tiền:</span>
                            <strong className="amount">{result.amount.toLocaleString()} VNĐ</strong>
                        </div>
                    </div>
)}

                <div className="action-buttons">
                    <button onClick={() => navigate('/')} className="btn-home">
                        <Home size={20} /> Quay về trang chủ
                    </button>
                    <button onClick={() => navigate('/my-orders')} className="btn-orders">
                        <ShoppingBag size={20} /> Đơn hàng của tôi
                    </button>
                </div>
            </div>
        </div>
    );
}
