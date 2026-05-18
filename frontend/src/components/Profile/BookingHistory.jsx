import React, { useEffect, useState } from 'react';
import { getMyBookings } from '../../api/tourApi';
import './BookingHistory.css';

const sections = [
  { key: 'upcoming', label: 'Sắp đi' },
  { key: 'completed', label: 'Đã đi' },
  { key: 'cancelled', label: 'Đã hủy' },
  { key: 'pending', label: 'Chờ thanh toán' },
];

export default function BookingHistory() {
  const [bookings, setBookings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getMyBookings();
        setBookings(res.bookings);
      } catch (error) {
        console.error('Lỗi lấy lịch sử đặt tour:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) return <div className="loading">Đang tải lịch sử đặt tour...</div>;

  if (!bookings) return <div className="loading">Không có dữ liệu.</div>;

  return (
    <div className="booking-history-card">
      <h2>Lịch sử đặt tour</h2>

      {sections.map((section) => (
        <div key={section.key} className="booking-section">
          <h3>{section.label}</h3>
          {bookings[section.key]?.length === 0 ? (
            <p className="empty-text">Không có tour trong mục này.</p>
          ) : (
            bookings[section.key].map((item) => (
              <div key={item.id} className="booking-row">
                <div className="booking-left">
                  <img
                    src={item.tour_image || 'https://via.placeholder.com/120'}
                    alt={item.tour_title}
                  />
                  <div>
                    <h4>{item.tour_title}</h4>
                    <p>{item.tour_address}</p>
                  </div>
                </div>
                <div className="booking-right">
                  <p><strong>Ngày khởi hành:</strong> {item.tour_departure_date}</p>
                  <p><strong>Trạng thái:</strong> {item.status_display}</p>
                  <p><strong>Tổng tiền:</strong> {Number(item.total_price).toLocaleString()} VNĐ</p>
                </div>
              </div>
            ))
          )}
        </div>
      ))}
    </div>
  );
}