import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import './Login.css';
import travelImg from '../../assets/travel.png';

export default function Login() {
  const navigate = useNavigate();

  const [loginData, setLoginData] = useState({
    username: '',
    password: ''
  });

  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setLoginData({ ...loginData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axiosClient.post('users/login/', loginData);

      console.log(response.data);
      // Lưu token và thông tin user mới
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      localStorage.setItem('username', response.data.username);
      localStorage.setItem('role', response.data.role);

      setErrorMsg('');
      navigate('/');
    } catch (error) {
      console.error("Lỗi đăng nhập:", error.response?.data);
      setErrorMsg("Sai tài khoản hoặc mật khẩu!");
    }
  };

  return (
    <div className="login-container">
      {/* IMAGE */}
      <div className="login-image-section">
        <img src={travelImg} alt="Travel Illustration" className="illustration" />
      </div>

      {/* FORM */}
      <div className="login-form-section">
        <div className="form-wrapper">
          <h2 className="form-title">ĐĂNG NHẬP</h2>

          <form className="login-form" onSubmit={handleSubmit}>
            {/* USERNAME */}
            <div className="input-group">
              <label>Tên đăng nhập: <span>*</span></label>
              <input
                type="text"
                name="username"
                placeholder="Nhập tên đăng nhập"
                value={loginData.username}
                onChange={handleChange}
                required
              />
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <label>Mật khẩu: <span>*</span></label>
              <input
                type="password"
                name="password"
                placeholder="Nhập mật khẩu"
                value={loginData.password}
                onChange={handleChange}
                className={errorMsg ? "input-error" : ""}
                required
              />
            </div>

            {/* ERROR MESSAGE */}
            {errorMsg && <p className="error-message">{errorMsg}</p>}

            {/* OPTIONS */}
            <div className="form-options">
              <label className="remember-me">
                <input type="checkbox" name="remember" />
                <span>Nhớ mật khẩu</span>
              </label>
              <Link to="/forgot-password" className="forgot-link">
                Quên mật khẩu
              </Link>
            </div>

            {/* BUTTON */}
            <button type="submit" className="btn-login">
              ĐĂNG NHẬP
            </button>

            {/* REGISTER */}
            <div className="register-footer">
              <p>Chưa có tài khoản?</p>
              <Link to="/register" className="register-link">
                Đăng ký ngay
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}