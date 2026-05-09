import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import './PaymentSelection.css';
import { QrCode, ChevronLeft, CheckCircle } from 'lucide-react';

export default function PaymentSelection() {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [qrData, setQrData] = useState(null);
    const [showQR, setShowQR] = useState(false);

    // 1. Lấy thông tin đơn hàng
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const res = await axiosClient.get(`tours/bookings/${bookingId}/`);
                setBooking(res.data);
            } catch (err) {
                console.error("Không tìm thấy đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    // 2. Hàm xử lý khi nhấn nút Thanh toán (Tạo mã VietQR)
    const handleProcessPayment = async () => {
        try {
            const res = await axiosClient.post('tours/create-vietqr/', { 
                booking_id: bookingId 
            });
            setQrData(res.data);
            setShowQR(true);
        } catch (error) {
            alert("Lỗi tạo mã VietQR. Vui lòng thử lại!");
        }
    };

    if (loading) return <div className="loading">Đang tải thông tin thanh toán...</div>;
    if (!booking) return <div className="error">Đơn hàng không tồn tại!</div>;

    return (
        <div className="payment-page">
            <div className="payment-container">
                <h2>Thanh toán đơn hàng</h2>
                
                <div className="order-summary">
                    <h3>Tóm tắt đơn hàng</h3>
                    <p>Tour: <strong>{booking.tour_details?.title}</strong></p>
                    <p>Ngày đi: <strong>{booking.booking_date}</strong></p>
                    <p>Số người: <strong>{booking.number_of_people}</strong></p>
                    <hr />
                    <p className="total-row">
                        Tổng tiền: <span className="price">{Number(booking.total_price).toLocaleString()} VNĐ</span>
                    </p>
                </div>

                {!showQR ? (
                    <div className="payment-options-single">
                        <div className="method-info">
                            <QrCode size={32} color="#005baa" />
                            <div>
                                <strong>Chuyển khoản VietQR</strong>
                                <p>Quét mã QR để thanh toán nhanh qua ứng dụng ngân hàng</p>
                            </div>
                        </div>
                        <div className="payment-actions">
                            <button onClick={() => navigate(-1)} className="btn-back">
                                <ChevronLeft size={20} /> Quay lại
                            </button>
                            <button onClick={handleProcessPayment} className="btn-pay">
                                HIỆN MÃ QR THANH TOÁN
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="qr-display-section">
                        <h3>Quét mã để thanh toán</h3>
                        <div className="qr-image-container">
                            <img src={qrData.qr_url} alt="VietQR" />
                        </div>
                        <div className="transfer-details">
                            <div className="detail-item">
                                <span>Ngân hàng:</span>
                                <strong>{qrData.bank_id}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Số tài khoản:</span>
                                <strong>{qrData.account_no}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Chủ tài khoản:</span>
                                <strong>{qrData.account_name}</strong>
                            </div>
                            <div className="detail-item">
                                <span>Số tiền:</span>
                                <strong className="price">{Number(qrData.amount).toLocaleString()} VNĐ</strong>
                            </div>
                            <div className="detail-item">
                                <span>Nội dung:</span>
                                <strong className="copy-text">{qrData.content}</strong>
                            </div>
                        </div>
                        <div className="qr-footer">
                            <p>Hệ thống sẽ tự động xác nhận sau khi nhận được tiền.</p>
                            <button 
                                className="btn-paid" 
                                onClick={async () => {
                                    try {
                                        await axiosClient.post(`tours/bookings/${bookingId}/confirm-payment/`);
                                        navigate(`/payment-result?vnp_ResponseCode=00&vnp_TxnRef=${bookingId}&vnp_Amount=${qrData.amount * 100}`);
                                    } catch (err) {
                                        alert("Lỗi gửi thông báo thanh toán.");
                                    }
                                }}
                            >
                                <CheckCircle size={20} /> TÔI ĐÃ CHUYỂN KHOẢN
                            </button>
                            <button className="btn-change-method" onClick={() => setShowQR(false)}>
                                Quay lại
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}