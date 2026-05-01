import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getTourById } from '../../../api/tourApi';
import axiosClient from '../../../api/axiosClient';
import Navbar from '../../../components/layout/Navbar';

// --- Thêm Swiper cho Hà ---
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './TourDetail.css';
import ImageUploadModal from '../../../components/tour/ImageUploadModal';


import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';


let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
});
L.Marker.prototype.options.icon = DefaultIcon;

export default function TourDetail() {
    const { id } = useParams();
    const [tour, setTour] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentUser, setCurrentUser] = useState(null);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await axiosClient.get('me/');
                setCurrentUser(res.data);
            } catch (err) {
                console.log("Not logged in");
            }
        };
        fetchMe();

        const fetchDetail = async () => {
            try {
                const data = await getTourById(id);
                setTour(data);
            } catch (error) {
                console.error("Lỗi lấy chi tiết tour:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDetail();
    }, [id]);

    const handleUploadSuccess = () => {
        // Tải lại dữ liệu tour để cập nhật danh sách ảnh
        setLoading(true);
        getTourById(id).then(data => {
            setTour(data);
            setLoading(false);
        });
    };

    const isOwner = currentUser && tour && (
        currentUser.id === tour.creator ||
        currentUser.is_staff ||
        currentUser.role === 'ADMIN'
    );

    if (loading) return <div className="loading">Đang tải thông tin tour...</div>;
    if (!tour) return <div className="error">Không tìm thấy tour này!</div>;

    const formatImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/1200x500';
        if (url.startsWith('http')) return url;
        // Nếu là đường dẫn tương đối, nối thêm URL của backend
        return `http://127.0.0.1:8000${url}`;
    };

    // Chuẩn bị danh sách ảnh cho Carousel
    const displayImages = (tour.tour_images && tour.tour_images.length > 0
        ? tour.tour_images.map(img => img.image)
        : [tour.image_url]).map(img => formatImageUrl(img));

    return (
        <div className="tour-detail-page">
            <Navbar />
            <div className="tour-detail-container">
                {/* Phần 1: Carousel Ảnh (Thay thế cho tour-hero cũ của Hà) */}
                <div className="tour-carousel-wrapper">
                    <Swiper
                        modules={[Navigation, Pagination, Autoplay]}
                        spaceBetween={0}
                        slidesPerView={1}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3000 }}
                        className="tour-swiper"
                    >
                        {displayImages.map((imgSrc, index) => (
                            <SwiperSlide key={index}>
                                <div className="tour-slide-item">
                                    <img src={imgSrc} alt={`Tour detail ${index}`} />
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="tour-title-overlay">
                        <h1>{tour.title}</h1>
                        <p className="tour-address-info"><i className="fas fa-map-marker-alt"></i> {tour.address}</p>
                    </div>
                </div>

                <div className="tour-content-layout">
                    {/* Phần 2: Nội dung bên trái */}
                    <main className="tour-main">
                        <section className="info-badges">
                            <div className="badge-item">
                                <span className="label">Thời gian:</span>
                                <span className="value">2 Ngày 1 Đêm</span>
                            </div>
                            <div className="badge-item">
                                <span className="label">Khởi hành:</span>
                                <span className="value">{tour.departure_date || "Liên hệ"}</span>
                            </div>
                            <div className="badge-item">
                                <span className="label">Chỗ trống:</span>
                                <span className="value">{tour.slots} người</span>
                            </div>
                        </section>

                        <section className="description">
                            <h3>Giới thiệu tour</h3>
                            <p>{tour.description}</p>
                        </section>

                        <section className="schedule">
                            <h3>Lịch trình chuyến đi</h3>
                            <div className="schedule-text">
                                {tour.schedule || "Lịch trình đang được cập nhật..."}
                            </div>
                        </section>
                        {/* === THÊM BẢN ĐỒ VÀO ĐÂY === */}
                        <section className="tour-map-section">
                            <h3>Vị trí điểm đến</h3>
                            {(tour.latitude && tour.longitude) ? (
                                <MapContainer
                                    center={[tour.latitude, tour.longitude]}
                                    zoom={13}
                                    scrollWheelZoom={false}
                                    style={{ height: '400px', width: '100%', borderRadius: '12px', zIndex: 1 }}
                                >
                                    <TileLayer
                                        attribution='&copy; <a href="<https://www.openstreetmap.org/copyright>">OpenStreetMap</a>'
                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                    />
                                    <Marker position={[tour.latitude, tour.longitude]}>
                                        <Popup>{tour.address}</Popup>
                                    </Marker>
                                </MapContainer>
                            ) : (
                                <p style={{ color: 'gray' }}>Chưa có thông tin tọa độ cho tour này.</p>
                            )}
                        </section>
                        {/* ======================= */}
                    </main>

                    {/* Phần 3: Sidebar bên phải */}
                    <aside className="tour-sidebar">
                        <div className="booking-card">
                            <p className="price-tag">Giá hiển thị:</p>
                            <h2 className="price-amount">{Number(tour.price).toLocaleString()} VNĐ</h2>

                            <button className="btn-book-now">ĐẶT TOUR NGAY</button>

                            {isOwner && (
                                <button
                                    className="btn-add-photos"
                                    onClick={() => setIsUploadModalOpen(true)}
                                    style={{
                                        marginTop: '10px',
                                        width: '100%',
                                        background: '#3498db',
                                        color: 'white',
                                        border: 'none',
                                        padding: '12px',
                                        borderRadius: '10px',
                                        fontWeight: 'bold',
                                        cursor: 'pointer'
                                    }}
                                >
                                    <i className="fas fa-images"></i> THÊM ẢNH TOUR
                                </button>
                            )}

                            <div className="creator-info">
                                <p><strong>Người tổ chức:</strong> {tour.creator_name}</p>
                                <p><strong>Số điện thoại:</strong> {tour.creator_phone}</p>
                            </div>

                            <div className="trust-badges">
                                <span><i className="fas fa-check-circle"></i> Xác nhận tức thì</span>
                                <span><i className="fas fa-headset"></i> Hỗ trợ khách hàng 24/7</span>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            {/* Modal Upload Ảnh */}
            <ImageUploadModal
                tourId={id}
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}