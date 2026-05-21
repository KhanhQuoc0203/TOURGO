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
        console.log("DATA:", data);

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

  // ... (giữ nguyên phần useEffect và useState bên trên)

  return (
    <div className="home-container">
      {/* Giữ nguyên phần Header/Hero của bạn */}
      <header className="hero-section" style={{ backgroundImage: `url(${BackGroundImage})` }}>
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">TOURS DU LỊCH</h1>
        </div>
      </header>

      <div className="tour-list-container">
        <h2 className="section-title">Danh sách tour hấp dẫn</h2>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <div className="tour-grid">
           {tours.map((tour) => (
          /* 2. Bao bọc Card bằng Link, truyền ID vào đường dẫn */
            <Link to={`/tours/${tour.id}`} key={tour.id} className="tour-card-link">
              <div className="tour-card">
                <div className="tour-image">
                  <img src={tour.image || 'https://via.placeholder.com/300x200'} alt={tour.name} />
                </div>
                <div className="tour-info">
                  <h3>{tour.title}</h3>     
                  <p className="tour-price">
                    {new Intl.NumberFormat('vi-VN').format(tour.price)} VNĐ
                  </p>
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