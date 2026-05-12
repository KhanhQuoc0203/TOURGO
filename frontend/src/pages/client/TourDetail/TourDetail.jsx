import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getTourById } from '../../../api/tourApi';
import axiosClient from '../../../api/axiosClient';
import Navbar from '../../../components/layout/Navbar';
import Swal from 'sweetalert2';
// --- Swiper ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './TourDetail.css';
import ImageUploadModal from '../../../components/tour/ImageUploadModal';

// --- Bản đồ Leaflet ---
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

let DefaultIcon = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function TourDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    // --- State cho Booking: Chỉ giữ số người vì ngày lấy từ Tour ---
    const [bookingData, setBookingData] = useState({
        numPeople: 1
    });

    // --- Hàm xử lý đặt tour (Đã fix logic nghiệp vụ) ---
   const handleBookingSubmit = async () => {
    try {
        const payload = {
            tour: tour.id,
            number_of_people: bookingData.numPeople,
            booking_date: tour.departure_date 
        };
        
        const res = await axiosClient.post('tours/book/', payload); 

        // Thông báo thành công đẹp mắt
        Swal.fire({
            title: 'Thành công!',
            text: 'Bạn đã đặt tour thành công. Đang chuyển đến trang thanh toán...',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false
        });

        setTimeout(() => {
            navigate(`/payment/${res.data.id}`); 
        }, 2000);
        
    } catch (error) {
        const serverErrors = error.response?.data;

        // Cấu hình thông báo lỗi chung
        let errorMsg = "Có lỗi xảy ra, vui lòng thử lại!";
        let errorTitle = "Lỗi đặt tour";

        if (serverErrors?.date_error) {
            errorMsg = serverErrors.date_error;
            errorTitle = "Lỗi ngày khởi hành";
        } else if (serverErrors?.slot_error) {
            errorMsg = serverErrors.slot_error;
            errorTitle = "Tour đã hết chỗ";
        } else if (serverErrors?.people_error) {
            errorMsg = serverErrors.people_error;
            errorTitle = "Lỗi số lượng người";
        }

        // Hiển thị thông báo lỗi bằng SweetAlert2
        Swal.fire({
            title: errorTitle,
            text: errorMsg,
            icon: 'error',
            confirmButtonText: 'Đã hiểu',
            confirmButtonColor: '#e67e22' // Màu cam trùng với theme của bạn
        });
    }
};
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [userRes, tourDetail] = await Promise.all([
                    axiosClient.get('me/').catch(() => ({ data: null })),
                    getTourById(id)
                ]);
                setCurrentUser(userRes.data);
                setTour(tourDetail);
            } catch (error) {
                console.error("Lỗi lấy dữ liệu:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="loading">Đang tải thông tin tour...</div>;
    if (!tour) return <div className="error">Không tìm thấy tour này!</div>;

    const isOwner = currentUser && (currentUser.id === tour.creator || currentUser.is_staff || currentUser.role === 'ADMIN');

    // Logic xử lý ảnh cũ của bạn
    const formatImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/1200x500';
        if (url.startsWith('http')) return url;
        return `http://127.0.0.1:8000${url}`;
    };
    const displayImages = (tour.tour_images?.length > 0 ? tour.tour_images.map(img => img.image) : [tour.image_url]).map(img => formatImageUrl(img));

    return (
        <div className="tour-detail-page">
            <Navbar />
            <div className="tour-detail-container">
                {/* Phần 1: Carousel Ảnh (Giữ nguyên giao diện) */}
                <div className="tour-carousel-wrapper">
                    <Swiper modules={[Navigation, Pagination, Autoplay]} navigation pagination={{ clickable: true }} autoplay={{ delay: 3000 }} className="tour-swiper">
                        {displayImages.map((imgSrc, index) => (
                            <SwiperSlide key={index}>
                                <div className="tour-slide-item"><img src={imgSrc} alt="Tour" /></div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="tour-title-overlay">
                        <h1>{tour.title}</h1>
                        <p className="tour-address-info"><i className="fas fa-map-marker-alt"></i> {tour.address}</p>
                    </div>
                </div>

                <div className="tour-content-layout">
                    {/* Phần 2: Nội dung chính */}
                    <main className="tour-main">
                        <section className="info-badges">
                            <div className="badge-item">
                                <span className="label">Thời gian:</span>
                                <span className="value">2 Ngày 1 Đêm</span>
                            </div>
                            <div className="badge-item">
                                <span className="label">Khởi hành:</span>
                                <span className="value" style={{fontWeight: 'bold', color: '#e67e22'}}>{tour.departure_date || "Liên hệ"}</span>
                            </div>
                            <div className="badge-item">
                                <span className="label">Chỗ trống:</span>
                                <span className="value">{tour.slots} đơn</span>
                            </div>
                        </section>

                        <section className="description">
                            <h3>Giới thiệu tour</h3>
                            <p>{tour.description}</p>
                        </section>
                        
                        {/* MapContainer giữ nguyên như code cũ của bạn */}
                        <section className="tour-map-section">
                            <h3>Vị trí điểm đến</h3>
                            {tour.latitude && tour.longitude && (
                                <MapContainer center={[tour.latitude, tour.longitude]} zoom={13} style={{ height: '400px', width: '100%', borderRadius: '12px' }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <Marker position={[tour.latitude, tour.longitude]}><Popup>{tour.address}</Popup></Marker>
                                </MapContainer>
                            )}
                        </section>
                    </main>

                    {/* Phần 3: Sidebar đặt tour (Giao diện cũ + Logic mới) */}
                    <aside className="tour-sidebar">
                        <div className="booking-card">
                            <p className="price-tag">Giá trọn gói:</p>
                            <h2 className="price-amount">{Number(tour.price).toLocaleString('vi-VN')} VNĐ</h2>

                            <div className="booking-form" style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Đặt Tour Ngay</h3>
                                
                                {/* HIỂN THỊ NGÀY CỐ ĐỊNH (Không cho chọn lung tung nữa) */}
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Ngày khởi hành (Cố định):</label>
                                <div style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd', background: '#f9f9f9', fontWeight: 'bold' }}>
                                    {tour.departure_date || "Chưa có ngày"}
                                </div>
                                
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Số lượng người (1-100):</label>
                                <input 
                                    type="number" 
                                    min="1" max="100"
                                    style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }}
                                    value={bookingData.numPeople} 
                                    onChange={(e) => setBookingData({numPeople: parseInt(e.target.value) || 1})} 
                                />
                                
                                <div className="total-temp" style={{ marginBottom: '20px', padding: '10px', background: '#fff7ed', borderRadius: '5px' }}>
                                    <span style={{ fontSize: '14px' }}>Thanh toán trọn gói:</span><br/>
                                    <strong style={{ color: '#e67e22', fontSize: '18px' }}>
                                        {Number(tour.price).toLocaleString('vi-VN')} VNĐ
                                    </strong>
                                </div>
                                
                                <button 
                                    onClick={handleBookingSubmit} 
                                    className="btn-book-now" 
                                    disabled={tour.slots <= 0}
                                    style={{ width: '100%', background: tour.slots > 0 ? '#e67e22' : '#ccc', color: 'white', padding: '15px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: tour.slots > 0 ? 'pointer' : 'not-allowed' }}
                                >
                                    {tour.slots > 0 ? 'XÁC NHẬN ĐẶT TOUR' : 'HẾT LƯỢT ĐẶT'}
                                </button>
                            </div>

                            {isOwner && (
                                <button className="btn-add-photos" onClick={() => setIsUploadModalOpen(true)} style={{ marginTop: '10px', width: '100%', background: '#3498db', color: 'white', padding: '12px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}>
                                    <i className="fas fa-images"></i> THÊM ẢNH TOUR
                                </button>
                            )}

                            <div className="creator-info" style={{ marginTop: '20px' }}>
                                <p><strong>Người tổ chức:</strong> {tour.creator_name}</p>
                                <p><strong>Số điện thoại:</strong> {tour.creator_phone}</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <ImageUploadModal tourId={id} isOpen={isUploadModalOpen} onClose={() => setIsUploadModalOpen(false)} onSuccess={() => window.location.reload()} />
        </div>
    );
}