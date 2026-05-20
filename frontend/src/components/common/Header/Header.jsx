import React, { useState } from 'react'; // Bổ sung useState
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Bổ sung useNavigate
import Logo from '../../../assets/logo.png'; 
import Search from '../../../assets/search.png';
import User from '../../../assets/user.png';
import './Header.css';

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate(); // Hook để điều hướng trang
  
  // State để quản lý từ khóa tìm kiếm
  const [searchTerm, setSearchTerm] = useState('');

  const token = localStorage.getItem('access_token');
  const username = localStorage.getItem('username');
  const role = localStorage.getItem('role');

  // Hàm để kiểm tra xem link có đang active hay không
  const isActive = (path) => location.pathname === path;

  // Hàm xử lý khi người dùng nhấn tìm kiếm
  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      // Chuyển hướng sang trang của Hà kèm theo từ khóa q
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm(''); // Reset ô nhập sau khi search
    }
  };

  return (
    <header className="header-container">
      <nav className="navbar">
        <div className="navbar-logo">
          <img src={Logo} alt="Travela Logo" />
          <span>H2KT</span>
        </div>
        
        <ul className="navbar-links">
          <li className={isActive('/') ? 'active' : ''}>
            <Link to="/">Trang Chủ</Link>
          </li>
          <li className={isActive('/introduce') ? 'active' : ''}>
            <Link to="/introduce">Giới Thiệu</Link>
          </li>
          <li className={isActive('/tours') ? 'active' : ''}>
            <Link to="/tours">Tours</Link>
          </li>
          <li className={isActive('/destinations') ? 'active' : ''}>
            <Link to="/destinations">Điểm Đến</Link>
          </li>
          <li className={isActive('/contact') ? 'active' : ''}>
            <Link to="/contact">Liên Hệ</Link>
          </li>
          {(role === 'PROVIDER' || role === 'ADMIN') && (
            <li className={isActive('/provider/dashboard') ? 'active' : ''}>
              <Link to="/provider/dashboard" style={{ color: '#fff', fontWeight: 'bold' }}>Kênh Nhà Cung Cấp</Link>
            </li>
          )}
        </ul>

        <div className="navbar-actions">
          {/* Bọc icon Search vào form để xử lý nhập liệu */}
          <form className="search-wrapper" onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#f5f5f5', borderRadius: '20px', padding: '2px 10px', marginRight: '10px' }}>
            <input 
              type="text" 
              placeholder="Tìm tour..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ border: 'none', background: 'transparent', outline: 'none', padding: '5px', width: '120px' }}
            />
            <button type="submit" className="btn-search" style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              <img src={Search} alt="search" />
            </button>
          </form>

          <Link to="/bookings" className="btn-book">Book Now ↗</Link>
          
          <div className="auth-section">
            <Link to={token ? "/profile" : "/login"}>
              <img src={User} alt="user" className="auth-icon" />
            </Link>
            <div className="auth-buttons">
              {token ? (
                <>
                  <Link to="/profile" className="auth-link username-link" title="Trang cá nhân">{username}</Link>
                  <span className="auth-divider">|</span>
                  <button onClick={() => {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    localStorage.removeItem('username');
                    window.location.href = '/login';
                  }} className="auth-btn-text">Đăng xuất</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="auth-link">Đăng nhập</Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}