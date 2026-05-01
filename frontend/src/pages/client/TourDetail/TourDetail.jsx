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

    // --- Bổ sung State cho Booking (Hà thực hiện) ---
    const [bookingData, setBookingData] = useState({
        numPeople: 1,
        date: ''
    });

    // --- Logic tính tổng tiền tạm tính ---
    const totalPrice = bookingData.numPeople * (tour?.price || 0);

    // --- Hàm xử lý gửi yêu cầu đặt tour (Đã fix URL chính xác) ---
    const handleBookingSubmit = async () => {
        if (!bookingData.date) {
            alert("Vui lòng chọn ngày khởi hành!");
            return;
        }
        try {
            const data = {
                tour: tour.id,
                number_of_people: bookingData.numPeople,
                booking_date: bookingData.date
            };
            
            // THAY ĐỔI TẠI ĐÂY: Dùng đường dẫn đầy đủ cho Endpoint đặt tour
            const res = await axiosClient.post('/tours/book/', data); 
            
            alert(`Đặt tour thành công! Mã đơn hàng: ${res.data.id}`);
        } catch (error) {
            console.error("Lỗi đặt tour:", error);
            alert(error.response?.data?.error || "Có lỗi xảy ra, vui lòng đăng nhập trước khi đặt tour!");
        }
    };

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
        return `http://127.0.0.1:8000${url}`;
    };

    const displayImages = (tour.tour_images && tour.tour_images.length > 0
        ? tour.tour_images.map(img => img.image)
        : [tour.image_url]).map(img => formatImageUrl(img));

    return (
        <div className="tour-detail-page">
            <Navbar />
            <div className="tour-detail-container">
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
                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
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
                    </main>

                    <aside className="tour-sidebar">
                        <div className="booking-card">
                            <p className="price-tag">Giá hiển thị:</p>
                            <h2 className="price-amount">{Number(tour.price).toLocaleString()} VNĐ</h2>

                            <div className="booking-form" style={{ marginTop: '20px', padding: '15px', border: '1px solid #eee', borderRadius: '10px' }}>
                                <h3 style={{ fontSize: '18px', marginBottom: '15px' }}>Đặt Tour Ngay</h3>
                                
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Ngày khởi hành:</label>
                                <input 
                                    type="date" 
                                    style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }}
                                    onChange={(e) => setBookingData({...bookingData, date: e.target.value})} 
                                />
                                
                                <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px' }}>Số lượng người:</label>
                                <input 
                                    type="number" 
                                    min="1" 
                                    style={{ width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ddd' }}
                                    value={bookingData.numPeople} 
                                    onChange={(e) => setBookingData({...bookingData, numPeople: parseInt(e.target.value) || 1})} 
                                />
                                
                                <div className="total-temp" style={{ marginBottom: '20px', padding: '10px', background: '#f9f9f9', borderRadius: '5px' }}>
                                    <span style={{ fontSize: '14px' }}>Tổng tiền tạm tính:</span><br/>
                                    <strong style={{ color: '#e67e22', fontSize: '18px' }}>{totalPrice.toLocaleString()} VNĐ</strong>
                                </div>
                                
                                <button 
                                    onClick={handleBookingSubmit} 
                                    className="btn-book-now" 
                                    style={{ width: '100%', background: '#e67e22', color: 'white', padding: '15px', border: 'none', borderRadius: '10px', fontWeight: 'bold', cursor: 'pointer' }}
                                >
                                    XÁC NHẬN ĐẶT TOUR
                                </button>
                            </div>

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

                            <div className="creator-info" style={{ marginTop: '20px' }}>
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

            <ImageUploadModal
                tourId={id}
                isOpen={isUploadModalOpen}
                onClose={() => setIsUploadModalOpen(false)}
                onSuccess={handleUploadSuccess}
            />
        </div>
    );
}