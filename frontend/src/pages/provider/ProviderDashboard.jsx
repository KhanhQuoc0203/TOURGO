import React, { useEffect, useState } from 'react';
import { getProviderTours, createProviderTour, uploadTourImages } from '../../api/tourApi';
import './ProviderDashboard.css';

export default function ProviderDashboard() {
  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    departure_date: '',
    slots: '',
    latitude: '',
    longitude: '',
    description: '',
    image_url: '' // Optional default image URL
  });

  // Selected files for multiple image upload
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [filePreviews, setFilePreviews] = useState([]);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchTours();
  }, []);

  const fetchTours = async () => {
    try {
      setLoading(true);
      const data = await getProviderTours();
      setTours(data);
    } catch (error) {
      console.error('Lỗi lấy danh sách tour nhà cung cấp:', error);
      setMessage({ type: 'error', text: 'Không thể tải danh sách tour của bạn. Vui lòng kiểm tra quyền truy cập!' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);

    // Create image previews
    const previews = files.map(file => URL.createObjectURL(file));
    setFilePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage({ type: '', text: '' });

    try {
      // 1. Tạo tour mới thông qua API POST của Khánh
      const newTour = await createProviderTour({
        title: formData.title,
        address: formData.address,
        price: parseFloat(formData.price),
        departure_date: formData.departure_date,
        slots: parseInt(formData.slots),
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
        description: formData.description,
        image_url: formData.image_url || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80'
      });

      const newTourId = newTour.id;

      // 2. Nếu có chọn thêm ảnh album, thực hiện upload lên backend (Khang)
      if (selectedFiles.length > 0) {
        await uploadTourImages(newTourId, selectedFiles);
      }

      // Success
      setMessage({ type: 'success', text: 'Chúc mừng! Bạn đã đăng ký và tạo tour du lịch mới thành công.' });

      // Reset Form
      setFormData({
        title: '',
        address: '',
        price: '',
        departure_date: '',
        slots: '',
        latitude: '',
        longitude: '',
        description: '',
        image_url: ''
      });
      setSelectedFiles([]);
      setFilePreviews([]);

      // Close Modal and Refresh
      setTimeout(() => {
        setShowCreateModal(false);
        fetchTours();
        setMessage({ type: '', text: '' });
      }, 2000);

    } catch (error) {
      console.error('Lỗi tạo tour mới:', error);
      let errMsg = 'Đã có lỗi xảy ra trong quá trình tạo tour. Vui lòng kiểm tra lại!';
      if (error.response?.data) {
        if (typeof error.response.data === 'object') {
          errMsg = Object.entries(error.response.data)
            .map(([key, val]) => `${key}: ${Array.isArray(val) ? val.join(', ') : val}`)
            .join(' | ');
        } else if (typeof error.response.data === 'string') {
          errMsg = error.response.data;
        }
      }
      setMessage({ type: 'error', text: errMsg });
    } finally {
      setSubmitting(false);
    }
  };
  // Helper to get first uploaded album image or main image_url, avoiding default beach placeholder
  const getTourDisplayImage = (tour) => {
    if (tour.tour_images && tour.tour_images.length > 0) {
      const imgPath = tour.tour_images[0].image;
      if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
        return imgPath;
      }
      return `http://127.0.0.1:8000${imgPath}`;
    }
    if (tour.image_url) {
      if (tour.image_url.startsWith('http://') || tour.image_url.startsWith('https://')) {
        return tour.image_url;
      }
      return `http://127.0.0.1:8000${tour.image_url}`;
    }
    return 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80';
  };

  // Helper currency formatter
  const formatPrice = (value) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
  };

  return (
    <div className="provider-dashboard-container">
      <div className="dashboard-header-section">
        <div>
          <h1 className="dashboard-title">Kênh Nhà Cung Cấp</h1>
          <p className="dashboard-subtitle">Quản lý và đăng tải các tour du lịch độc quyền của bạn</p>
        </div>
        <button className="btn-add-tour" onClick={() => setShowCreateModal(true)}>
          <span className="plus-icon">+</span> Đăng Tour Mới
        </button>
      </div>

      {/* STATISTICS PANELS */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{tours.length}</div>
          <div className="stat-label">Tổng số Tour đã đăng</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-value">
            {tours.reduce((total, tour) => total + (tour.slots || 0), 0)}
          </div>
          <div className="stat-label">Tổng số vé còn trống</div>
        </div>
        <div className="stat-card info">
          <div className="stat-value">
            {tours.filter(t => new Date(t.departure_date) > new Date()).length}
          </div>
          <div className="stat-label">Tour sắp khởi hành</div>
        </div>
      </div>

      {/* ERROR/SUCCESS ALERTS */}
      {message.text && (
        <div className={`alert-box ${message.type === 'success' ? 'success' : 'error'}`}>
          {message.text}
        </div>
      )}

      {/* TOUR MANAGEMENT SECTION */}
      <h2 className="section-title">Danh sách Tour của bạn</h2>

      {loading ? (
        <div className="loading-spinner">Đang tải danh sách các tour...</div>
      ) : tours.length === 0 ? (
        <div className="empty-state">
          <h3>Bạn chưa đăng tải tour nào</h3>
          <p>Hãy bắt đầu quảng bá thương hiệu du lịch của bạn bằng cách thêm tour đầu tiên!</p>
          <button className="btn-add-tour-empty" onClick={() => setShowCreateModal(true)}>Đăng ngay</button>
        </div>
      ) : (
        <div className="tours-grid">
          {tours.map(tour => (
            <div key={tour.id} className="provider-tour-card">
              <div className="tour-card-image-wrapper">
                <img
                  src={getTourDisplayImage(tour)}
                  alt={tour.title}
                  className="tour-card-image"
                />
                <span className="tour-card-price-badge">{formatPrice(tour.price)}</span>
              </div>
              <div className="tour-card-body">
                <h3 className="tour-card-title">{tour.title}</h3>
                <div className="tour-card-details">
                  <p><strong>📍 Địa điểm:</strong> {tour.address}</p>
                  <p><strong>📅 Ngày đi:</strong> {tour.departure_date}</p>
                  <p><strong>🎟️ Còn trống:</strong> {tour.slots} chỗ</p>
                  {tour.latitude && tour.longitude && (
                    <p className="coordinates-tag">📌 Tọa độ: {tour.latitude}, {tour.longitude}</p>
                  )}
                </div>
                <div className="tour-card-footer">
                  <span className="status-badge active">Đang hoạt động</span>
                  {tour.tour_images && tour.tour_images.length > 0 && (
                    <span className="images-count-badge">📸 {tour.tour_images.length} ảnh</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE NEW TOUR MODAL */}
      {showCreateModal && (
        <div className="modal-backdrop">
          <div className="modal-content">
            <div className="modal-header">
              <h2>ĐĂNG TOUR DU LỊCH MỚI</h2>
              <button className="btn-close-modal" onClick={() => {
                setShowCreateModal(false);
                setSelectedFiles([]);
                setFilePreviews([]);
              }}>×</button>
            </div>

            <form onSubmit={handleSubmit} className="create-tour-form">
              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="title">Tên Tour: <span className="required">*</span></label>
                  <input
                    type="text"
                    id="title"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Tour Đảo Phú Quốc 3 Ngày 2 Đêm"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="address">Địa điểm / Địa chỉ: <span className="required">*</span></label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: Phú Quốc, Kiên Giang"
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="price">Giá Tour (VNĐ): <span className="required">*</span></label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 3500000"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="departure_date">Ngày khởi hành: <span className="required">*</span></label>
                  <input
                    type="date"
                    id="departure_date"
                    name="departure_date"
                    value={formData.departure_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="slots">Số lượng chỗ (Vé): <span className="required">*</span></label>
                  <input
                    type="number"
                    id="slots"
                    name="slots"
                    value={formData.slots}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 30"
                    required
                  />
                </div>
              </div>

              <div className="form-row-3">
                <div className="form-group">
                  <label htmlFor="image_url">Ảnh đại diện chính (Link URL):</label>
                  <input
                    type="url"
                    id="image_url"
                    name="image_url"
                    value={formData.image_url}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="latitude">Vĩ độ (Lat - Tùy chọn):</label>
                  <input
                    type="number"
                    step="any"
                    id="latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 10.2899"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="longitude">Kinh độ (Lng - Tùy chọn):</label>
                  <input
                    type="number"
                    step="any"
                    id="longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleInputChange}
                    placeholder="Ví dụ: 103.9840"
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả lịch trình & Dịch vụ đi kèm: <span className="required">*</span></label>
                <textarea
                  id="description"
                  name="description"
                  rows="4"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Mô tả chi tiết các ngày đi, điểm tham quan, các khách sạn lưu trú, ăn uống..."
                  required
                />
              </div>

              {/* ALBUM IMAGE UPLOADER */}
              <div className="form-group file-upload-section">
                <label>Album ảnh bổ sung cho Tour:</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="album-images"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="file-input-hidden"
                  />
                  <label htmlFor="album-images" className="btn-file-select">
                    📸 Chọn ảnh từ thiết bị ({selectedFiles.length} đã chọn)
                  </label>
                </div>
                {filePreviews.length > 0 && (
                  <div className="file-previews-container">
                    {filePreviews.map((preview, index) => (
                      <div key={index} className="preview-item">
                        <img src={preview} alt={`preview-${index}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  disabled={submitting}
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedFiles([]);
                    setFilePreviews([]);
                  }}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-submit" disabled={submitting}>
                  {submitting ? 'Đang gửi dữ liệu...' : ' Phát Hành Tour Ngay'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
