import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './Profile.css';
import api from '../../api/axios.js'

export default function Profile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const response = await api.get('me/');
                setUser(response.data);
            } catch (error) {
                console.error("Lỗi lấy thông tin cá nhân:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchMe();
         const interval = setInterval(() => {
        api.get('me/'); // trigger refresh nếu cần
    }, 20000); // mỗi 20s

    return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        window.location.href = '/login';
    };

    if (loading) return <div className="loading">Đang tải...</div>;

    return (
        <div className="profile-container">
            <div className="profile-card">
                <div className="profile-header">
                    <img 
                        src="https://www.w3schools.com/howto/img_avatar.png" 
                        alt="Avatar" 
                        className="profile-avatar"
                    />
                    <h2>{user?.username}</h2>
                    <span className="profile-role">{user?.role}</span>
                </div>
                
                <div className="profile-info">
                    <div className="info-item">
                        <label>Email:</label>
                        <span>{user?.email || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <label>Số điện thoại:</label>
                        <span>{user?.phone || 'N/A'}</span>
                    </div>
                    <div className="info-item">
                        <label>ID người dùng:</label>
                        <span>#{user?.id}</span>
                    </div>
                </div>

                <div className="profile-actions">
                    <button onClick={handleLogout} className="btn-logout">
                        ĐĂNG XUẤT
                    </button>
                    
                    <Link to="/my-orders" className="btn-orders">
                        CHI TIẾT ĐƠN HÀNG
                    </Link>
                </div>
            </div>
        </div>
    );
}
