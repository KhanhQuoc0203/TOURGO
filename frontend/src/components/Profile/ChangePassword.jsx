import React, { useState } from 'react';
import { changePassword } from '../../api/tourApi';
import './ChangePassword.css';

export default function ChangePassword() {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới và xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await changePassword({
        old_password: oldPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      setMessage(res.message || 'Đổi mật khẩu thành công');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(
        err.response?.data?.old_password ||
        err.response?.data?.confirm_password ||
        err.response?.data?.detail ||
        'Đổi mật khẩu thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="change-password-card">
      <h2>Đổi mật khẩu</h2>
      <form onSubmit={handleSubmit}>
        <label>Mật khẩu cũ</label>
        <input
          type="password"
          value={oldPassword}
          onChange={(e) => setOldPassword(e.target.value)}
        />

        <label>Mật khẩu mới</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />

        <label>Xác nhận mật khẩu mới</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Đang lưu...' : 'Lưu mật khẩu'}
        </button>

        {message && <div className="success-text">{message}</div>}
        {error && <div className="error-text">{error}</div>}
      </form>
    </div>
  );
}