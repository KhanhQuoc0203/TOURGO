import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ToursPage = () => {
    const [tours, setTours] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    
    const [errors, setErrors] = useState({}); 
    const [numPeople, setNumPeople] = useState(1);
    const [bookingTourId, setBookingTourId] = useState(null); 

    const navigate = useNavigate();

    const fetchTours = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:8000/api/tours/', {
                params: {
                    search: search,
                    min_price: minPrice,
                    max_price: maxPrice,
                    start_date: startDate
                }
            });
            setTours(response.data);
        } catch (error) {
            console.error("Lỗi kết nối API:", error);
        }
    };

    useEffect(() => {
        fetchTours();
    }, []);

    const handleBookingSubmit = async (tourId) => {
        setErrors({}); 
        try {
            const token = localStorage.getItem('access_token'); 
            if (!token) {
                alert("Vui lòng đăng nhập để đặt tour!");
                return;
            }

            // FIX 1: Ép kiểu numPeople sang số nguyên để Backend so sánh chính xác với slots
            const bookingData = {
                tour: tourId,
                number_of_people: parseInt(numPeople), 
                booking_date: new Date().toISOString().split('T')[0]
            };

            const response = await axios.post('http://127.0.0.1:8000/api/tours/book/', bookingData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Đặt tour thành công!");
            setBookingTourId(null);
            setNumPeople(1); // Reset lại số người về 1
            fetchTours(); 
        } catch (err) {
            if (err.response && err.response.data) {
                // FIX 2: Log lỗi ra console để Khánh kiểm tra cấu trúc JSON trả về
                console.log("Lỗi từ Backend:", err.response.data);
                setErrors(err.response.data);
            } else {
                alert("Đã xảy ra lỗi không xác định!");
            }
        }
    };

    const styles = {
        wrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '30px 0' },
        container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '25px', padding: '0 15px', alignItems: 'flex-start' },
        sidebar: { width: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'sticky', top: '20px' },
        main: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
        label: { display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px', color: '#444' },
        input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
        button: { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
        card: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
        cardImg: { width: '100%', height: '180px', objectFit: 'cover' },
        cardBody: { padding: '15px' },
        price: { color: '#d93025', fontSize: '1.25rem', fontWeight: 'bold' },
        errorText: { color: '#d93025', fontSize: '12px', marginTop: '5px', fontWeight: '500' },
        bookingBox: { marginTop: '15px', padding: '10px', borderTop: '1px solid #eee', backgroundColor: '#f8f9fa' }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.sidebar}>
                    <h3 style={{ marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px' }}>Bộ lọc</h3>
                    <label style={styles.label}>Tìm tên tour:</label>
                    <input style={styles.input} type="text" placeholder="Ví dụ: Tour Đà Lạt..." value={search} onChange={(e) => setSearch(e.target.value)} />
                    <label style={styles.label}>Ngày khởi hành:</label>
                    <input style={styles.input} type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                    <label style={styles.label}>Giá từ:</label>
                    <input style={styles.input} type="number" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                    <label style={styles.label}>Đến giá:</label>
                    <input style={styles.input} type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
                    <button style={styles.button} onClick={fetchTours}>Tìm kiếm ngay</button>
                </div>

                <div style={styles.main}>
                    {tours.length > 0 ? (
                        tours.map((tour) => (
                            <div key={tour.id} style={styles.card}>
                                <img src={tour.image || "https://via.placeholder.com/300x180"} alt={tour.title} style={styles.cardImg} />
                                <div style={styles.cardBody}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#1a1f36' }}>{tour.title}</h4>
                                    <p style={{ fontSize: '13px', color: '#666' }}>📍 {tour.address}</p>
                                    <p style={{ fontSize: '13px', color: '#666', fontWeight: 'bold' }}>🎟️ Còn trống: {tour.slots} chỗ</p>
                                    
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <span style={styles.price}>{Number(tour.price).toLocaleString()}đ</span>
                                        <button
                                            onClick={() => navigate(`/tours/${tour.id}`)}
                                            style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #1a73e8', color: '#1a73e8', backgroundColor: 'transparent' }}
                                        >
                                            Chi tiết
                                        </button>
                                    </div>

                                    <button 
                                        onClick={() => {
                                            setBookingTourId(bookingTourId === tour.id ? null : tour.id);
                                            setErrors({}); // Reset lỗi khi đóng/mở form
                                        }}
                                        style={{ ...styles.button, marginTop: '10px', backgroundColor: '#34a853' }}
                                    >
                                        {bookingTourId === tour.id ? "Đóng" : "Đặt Tour"}
                                    </button>

                                    {bookingTourId === tour.id && (
                                        <div style={styles.bookingBox}>
                                            <label style={styles.label}>Số người:</label>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={numPeople} 
                                                onChange={(e) => setNumPeople(e.target.value)} 
                                                style={{...styles.input, marginBottom: '5px'}}
                                            />
                                            {/* HIỂN THỊ LỖI THEO TỪNG TRƯỜNG HOẶC LỖI CHUNG (detail) */}
                                            {errors.number_of_people && (
                                                <div style={styles.errorText}>⚠️ {errors.number_of_people[0] || errors.number_of_people}</div>
                                            )}
                                            {errors.non_field_errors && (
                                                <div style={styles.errorText}>⚠️ {errors.non_field_errors[0]}</div>
                                            )}
                                            {errors.detail && (
                                                <div style={styles.errorText}>⚠️ {errors.detail}</div>
                                            )}
                                            
                                            <button 
                                                onClick={() => handleBookingSubmit(tour.id)}
                                                style={{ ...styles.button, marginTop: '10px', padding: '8px' }}
                                            >
                                                Xác nhận đặt
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', marginTop: '50px' }}>
                            <p style={{ color: '#999' }}>Không có tour nào phù hợp!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ToursPage;