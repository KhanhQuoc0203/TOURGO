import React, { useEffect, useState } from 'react';
import { updateProfile } from '../../api/tourApi';
import './ProfileInfo.css';

export default function ProfileInfo({ user, onProfileUpdated }) {
  const [phone, setPhone] = useState(user?.phone || '');
  const [avatar, setAvatar] = useState(user?.avatar || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setPhone(user?.phone || '');
    setAvatar(user?.avatar || '');
  }, [user]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      const res = await updateProfile({ phone, avatar });
      onProfileUpdated(res.user);
      setMessage(res.message || 'Cập nhật thành công');
    } catch (err) {
      setError(
        err.response?.data?.phone ||
        err.response?.data?.avatar ||
        err.response?.data?.detail ||
        'Cập nhật thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-info-card">
      <div className="profile-header">
        <img
          src={avatar || 'https://www.w3schools.com/howto/img_avatar.png'}
          alt="Avatar"
          className="profile-avatar"
        />
        <h2>{user?.username}</h2>
        <span className="profile-role">{user?.role}</span>
      </div>

      <div className="profile-details">
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

      <form className="profile-update-form" onSubmit={handleSubmit}>
        <label>Số điện thoại mới</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="Nhập số điện thoại"
        />

        <label>Link ảnh đại diện</label>
        <input
          type="text"
          value={avatar}
          onChange={(e) => setAvatar(e.target.value)}
          placeholder="Nhập URL ảnh đại diện"
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>

        {message && <div className="success-text">{message}</div>}
        {error && <div className="error-text">{error}</div>}
      </form>
    </div>
  );
}