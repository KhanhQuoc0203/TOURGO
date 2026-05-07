import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import './PaymentSelection.css';
import VNPayLogo from '../../../assets/vnpay.jpg'; 

export default function PaymentSelection() {
    const { bookingId } = useParams(); // Lấy ID đơn hàng từ thanh địa chỉ
    const navigate = useNavigate();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);

    // 1. Lấy thông tin đơn hàng để hiển thị tóm tắt
    useEffect(() => {
        const fetchBooking = async () => {
            try {
                // Giả sử Khánh đã có API lấy chi tiết booking theo ID
                const res = await axiosClient.get(`tours/bookings/${bookingId}/`);
                setBooking(res.data);
                console.log("Dữ liệu đơn hàng thực tế:", res.data);
            } catch (err) {
                console.error("Không tìm thấy đơn hàng:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId]);

    // 2. Hàm xử lý khi nhấn nút Thanh toán (Khang kết nối)
    const handleProcessPayment = async () => {
        try {
            // Gọi API của Khánh để lấy link VNPay
            const res = await axiosClient.post('tours/create-payment/', { 
                booking_id: bookingId 
            });
            
            if (res.data.payment_url) {
                // Lệnh quan trọng để chuyển sang trang VNPay
                window.location.href = res.data.payment_url;
            }
        } catch (error) {
            alert("Lỗi tạo liên kết thanh toán. Vui lòng thử lại!");
        }
    };

    if (loading) return <div className="loading">Đang tải thông tin thanh toán...</div>;
    if (!booking) return <div className="error">Đơn hàng không tồn tại!</div>;

    return (
        <div className="payment-page">
            
            <div className="payment-container">
                <h2>Chọn phương thức thanh toán</h2>
                
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

                <div className="payment-options">
                    <p>Chọn cổng thanh toán:</p>
                    <label className="option-item active">
                        <input type="radio" name="payment" value="vnpay" defaultChecked />
                        <div className="option-content">
                            <img src={VNPayLogo} alt="VNPay" />
                            <span>Thanh toán qua VNPay (Thẻ ATM / QR Code)</span>
                        </div>
                    </label>
                </div>

                <div className="payment-actions">
                    <button onClick={() => navigate(-1)} className="btn-back">Quay lại</button>
                    <button onClick={handleProcessPayment} className="btn-pay">TIẾN HÀNH THANH TOÁN</button>
                </div>
            </div>
        </div>
    );
}