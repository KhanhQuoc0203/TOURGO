import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Thêm để điều hướng

const ToursPage = () => {
    const [tours, setTours] = useState([]);
    const [minPrice, setMinPrice] = useState('');
    const [maxPrice, setMaxPrice] = useState('');
    const [search, setSearch] = useState('');
    const [startDate, setStartDate] = useState('');

    const navigate = useNavigate(); // Khởi tạo điều hướng

    // Hàm gọi API lấy dữ liệu
    const fetchTours = async () => {
        try {
            // Khi search, minPrice... trống, API sẽ trả về toàn bộ tour
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

    // QUAN TRỌNG: useEffect này đảm bảo vừa mở trang là hiện toàn bộ tour ngay
    useEffect(() => {
        fetchTours();
    }, []);

    const styles = {
        wrapper: { backgroundColor: '#f0f2f5', minHeight: '100vh', padding: '30px 0' },
        container: {
            maxWidth: '1200px',
            margin: '0 auto',
            display: 'flex',
            gap: '25px',
            padding: '0 15px',
            alignItems: 'flex-start'
        },
        sidebar: {
            width: '300px',
            backgroundColor: 'white',
            padding: '20px',
            borderRadius: '15px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
            position: 'sticky',
            top: '20px'
        },
        main: {
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px'
        },
        label: { display: 'block', fontWeight: '600', marginBottom: '5px', fontSize: '13px', color: '#444' },
        input: {
            width: '100%',
            padding: '10px',
            marginBottom: '15px',
            borderRadius: '8px',
            border: '1px solid #ddd',
            boxSizing: 'border-box'
        },
        button: {
            width: '100%',
            padding: '12px',
            backgroundColor: '#1a73e8',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer'
        },
        card: { backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
        cardImg: { width: '100%', height: '180px', objectFit: 'cover' },
        cardBody: { padding: '15px' },
        price: { color: '#d93025', fontSize: '1.25rem', fontWeight: 'bold' }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                {/* THANH LỌC NẰM TRONG KHUNG CÂN ĐỐI */}
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

                {/* DANH SÁCH TOUR TỰ ĐỘNG HIỆN TOÀN BỘ */}
                <div style={styles.main}>
                    {tours.length > 0 ? (
                        tours.map((tour) => (
                            <div key={tour.id} style={styles.card}>
                                <img src={tour.image || "https://via.placeholder.com/300x180"} alt={tour.title} style={styles.cardImg} />
                                <div style={styles.cardBody}>
                                    <h4 style={{ margin: '0 0 8px 0', color: '#1a1f36' }}>{tour.title}</h4>
                                    <p style={{ fontSize: '13px', color: '#666' }}>📍 {tour.address}</p>
                                    <p style={{ fontSize: '13px', color: '#666' }}>👤 {tour.creator_name || "khánh"}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                                        <span style={styles.price}>{Number(tour.price).toLocaleString()}đ</span>
                                        {/* Nút Chi tiết gọi hàm điều hướng sang trang TourDetail */}
                                        <button
                                            onClick={() => navigate(`/tours/${tour.id}`)}
                                            style={{ padding: '6px 12px', cursor: 'pointer', borderRadius: '5px', border: '1px solid #1a73e8', color: '#1a73e8', backgroundColor: 'transparent' }}
                                        >
                                            Chi tiết
                                        </button>
                                    </div>
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