import React, { useEffect, useState } from 'react';
import { getMyBookingsFlat, cancelBooking } from '../../../api/tourApi';
import Navbar from '../../../components/layout/Navbar';
import './MyOrders.css';

export default function MyOrders() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBookings = async () => {
        try {
            const data = await getMyBookingsFlat();
            setBookings(data);
        } catch (error) {
            console.error("Lỗi lấy danh sách đơn hàng:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleCancel = async (id) => {
        if (window.confirm("Bạn có chắc chắn muốn hủy đơn hàng này không?")) {
            try {
                await cancelBooking(id);
                alert("Hủy đơn hàng thành công!");
                fetchBookings(); // Tải lại danh sách
            } catch (error) {
                alert(error.response?.data?.error || "Không thể hủy đơn hàng!");
            }
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'pending': return 'Chờ thanh toán';
            case 'confirmed': return 'Đã xác nhận';
            case 'cancelled': return 'Đã hủy';
            default: return status;
        }
    };

    if (loading) return <div className="loading">Đang tải danh sách đơn hàng...</div>;

    return (
        <div className="my-orders-page">
            <Navbar />
            <div className="my-orders-container">
                <h1>Đơn hàng của tôi</h1>
                {bookings.length === 0 ? (
                    <div className="no-bookings">
                        <p>Bạn chưa có đơn hàng nào.</p>
                        <a href="/" className="btn-go-home">Khám phá tour ngay</a>
                    </div>
                ) : (
                    <div className="bookings-list">
                        {bookings.map(booking => (
                            <div key={booking.id} className={`booking-item ${booking.status}`}>
                                <div className="booking-info">
                                    <div className="tour-thumb">
                                        <img src={booking.tour_details?.image_url || 'https://via.placeholder.com/150'} alt={booking.tour_details?.title} />
                                    </div>
                                    <div className="booking-details">
                                        <h3>{booking.tour_details?.title}</h3>
                                        <p><span>Mã đơn:</span> #{booking.id}</p>
                                        <p><span>Số người:</span> {booking.number_of_people}</p>
                                        <p><span>Ngày đặt:</span> {new Date(booking.created_at).toLocaleDateString('vi-VN')}</p>
                                        <p className="total-price"><span>Tổng tiền:</span> {Number(booking.total_price).toLocaleString()} VNĐ</p>
                                    </div>
                                </div>
                                <div className="booking-actions">
                                    <span className={`status-badge ${booking.status}`}>
                                        {getStatusText(booking.status)}
                                    </span>
                                    {booking.status === 'pending' && (
                                        <button 
                                            className="btn-cancel"
                                            onClick={() => handleCancel(booking.id)}
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
