import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ToursPage = () => {
    const [tours, setTours] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');
    
    const [currentUser, setCurrentUser] = useState(null);
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

    const fetchCurrentUser = async () => {
        try {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            const response = await axios.get('http://127.0.0.1:8000/api/me/', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setCurrentUser(response.data); 
        } catch (error) {
            console.error("Không lấy được dữ liệu profile người dùng:", error);
        }
    };

    useEffect(() => {
        fetchTours();
        fetchCurrentUser();
    }, []);

    const getStatusBadgeStyles = (status) => {
        switch (status) {
            case 'approved': return { text: 'Đã duyệt', color: '#2ecc71', bg: '#e8f8f5' };
            case 'pending': return { text: 'Chờ duyệt', color: '#f39c12', bg: '#fef5e7' };
            case 'rejected': return { text: 'Từ chối', color: '#e74c3c', bg: '#fdedec' };
            default: return { text: status, color: '#7f8c8d', bg: '#f2f4f4' };
        }
    };

    const styles = {
        wrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '90px 0 30px 0' },
        container: { maxWidth: '1200px', margin: '0 auto', display: 'flex', gap: '25px', padding: '0 15px', alignItems: 'flex-start' },
        sidebar: { width: '300px', backgroundColor: 'white', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)', position: 'sticky', top: '90px' },
        main: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' },
        label: { display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px', color: '#444' },
        input: { width: '100%', padding: '10px', marginBottom: '15px', borderRadius: '8px', border: '1px solid #ddd', boxSizing: 'border-box' },
        button: { width: '100%', padding: '12px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' },
        card: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
        cardImg: { width: '100%', height: '180px', objectFit: 'cover' },
        cardBody: { padding: '15px' },
        price: { color: '#d93025', fontSize: '1.25rem', fontWeight: 'bold' }
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
                    {tours
                        .filter(tour => {
                            const isStaffOrProvider = currentUser && (currentUser.is_staff || currentUser.role === 'PROVIDER' || currentUser.role === 'ADMIN');
                            return isStaffOrProvider ? true : tour.status === 'approved';
                        })
                        .map((tour) => {
                            const isOwner = currentUser && (String(currentUser.id) === String(tour.creator) || currentUser.is_staff || currentUser.role === 'ADMIN');
                            const badge = getStatusBadgeStyles(tour.status);
                            return (
                                <div key={tour.id} style={styles.card}>
                                    <img src={tour.image || "https://via.placeholder.com/300x180"} alt={tour.title} style={styles.cardImg} />
                                    <div style={styles.cardBody}>
                                        {isOwner && (
                                            <div style={{ display: 'inline-block', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold', color: badge.color, backgroundColor: badge.bg, marginBottom: '10px', border: `1px solid ${badge.color}` }}>
                                                Status: {badge.text}
                                            </div>
                                        )}
                                        <h4 style={{ margin: '0 0 8px 0', color: '#1a1f36' }}>{tour.title}</h4>
                                        <span style={styles.price}>{Number(tour.price).toLocaleString()}đ</span>
                                        <button onClick={() => navigate(`/tours/${tour.id}`)} style={{ ...styles.button, marginTop: '10px', backgroundColor: '#34a853' }}>Đặt Tour</button>
                                    </div>
                                </div>
                            );
                        })
                    }
                </div>
            </div>
        </div>
    );
};

export default ToursPage;