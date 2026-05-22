import { Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import BackGroundImage from '../../assets/background_home_1.jpg';
import { getTours } from '../../api/tourApi.js';
import './Home.css';

export default function Home() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTours = async () => {
      try {
        const data = await getTours();
        setTours(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setTours([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTours();
  }, []);

  // --- LOGIC GỘP TOUR NỔI BẬT ---
  const approvedTours = tours.filter(tour => tour.status === 'approved');

  // Lấy Top 2 tour giá cao nhất
  const topPrice = [...approvedTours]
    .sort((a, b) => Number(b.price) - Number(a.price))
    .slice(0, 2);

  // Lấy Top 2 tour có người đăng ký nhiều nhất (slots ít nhất)
  const topHot = [...approvedTours]
    .sort((a, b) => Number(a.slots) - Number(b.slots))
    .slice(0, 2);

  // Gộp lại, lọc trùng ID, và lấy đúng 3 cái
  const featuredTours = Array.from(new Map([...topPrice, ...topHot].map(item => [item.id, item])).values())
    .slice(0, 3);

  return (
    <div className="home-container">
      <header className="hero-section" style={{ backgroundImage: `url(${BackGroundImage})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">TOURS DU LỊCH</h1>
        </div>
      </header>

      {/* PHẦN DUY NHẤT: DANH SÁCH TOUR HẤP DẪN */}
      <div className="tour-list-container">
        <h2 className="section-title">Danh sách tour hấp dẫn</h2>
        
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="tour-grid">
            {featuredTours.map((tour) => (
              <Link to={`/tours/${tour.id}`} key={tour.id} className="tour-card-link">
                <div className="tour-card" style={{ border: '2px solid #3498db' }}>
                  {/* Badge hiển thị nếu là tour hot */}
                  <div className="tour-image" style={{ position: 'relative' }}>
                    <img src={tour.image || 'https://via.placeholder.com/300x200'} alt={tour.title} />
                    <span style={{ position: 'absolute', top: '10px', left: '10px', background: '#3498db', color: '#fff', padding: '5px 10px', borderRadius: '5px', fontSize: '12px', fontWeight: 'bold' }}>
                      NỔI BẬT
                    </span>
                  </div>
                  <div className="tour-info">
                    <h3>{tour.title}</h3>
                    <p className="tour-price">
                      {new Intl.NumberFormat('vi-VN').format(tour.price)} VNĐ
                    </p>
                    <p style={{ fontSize: '12px', color: '#666' }}>🎟️ Còn {tour.slots} chỗ</p>
                    <button className="btn-detail">Xem chi tiết</button>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}