import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import Navbar from '../../../components/layout/Navbar';
import SidebarFilter from '../../../components/layout/SidebarFilter'; // Thêm 1: Import component của Hà
import './SearchResult.css';

export default function SearchResult() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(true);

    // 1. State bộ lọc Khang đã thêm (Giữ nguyên)
    const [filters, setFilters] = useState({
        min_price: '',
        max_price: '',
        departure_date: ''
    });

    // 2. Cập nhật useEffect: Giữ nguyên logic nhưng thêm filters vào dependency
    useEffect(() => {
        const fetchSearchResults = async () => {
            setLoading(true);
            try {
                // Khang dùng endpoint /filter/ để Backend xử lý lọc nhé
                const response = await axiosClient.get(`/tours/filter/`, {
                    params: {
                        search: query,
                        ...filters // Thêm 2: Gửi kèm các giá trị lọc từ Hà
                    }
                });
                setResults(response.data);
            } catch (error) {
                console.error("Lỗi tìm kiếm:", error);
            } finally {
                setLoading(false);
            }
        };
        // Gọi hàm mỗi khi query hoặc filters thay đổi
        fetchSearchResults(); 
    }, [query, filters]); 

    // 3. Hàm xử lý khi Hà thay đổi bộ lọc (Dùng để "nối dây")
    const handleFilterUpdate = (newFields) => {
        setFilters(prev => ({ ...prev, ...newFields }));
    };

    return (
        <div className="search-result-page">
            <div className="search-container">
                <header className="search-header">
                    <h2>Kết quả tìm kiếm cho: "<span>{query}</span>"</h2>
                    <p className="result-count">Tìm thấy <strong>{results.length}</strong> tour phù hợp</p>
                </header>

                {/* 4. Chia Layout: Sidebar bên trái, Nội dung bên phải */}
                <div className="search-main-layout" style={{ display: 'flex', gap: '30px', marginTop: '20px' }}>
                    
                    {/* Thêm 3: Cắm Sidebar của Hà vào đây */}
                    <aside className="search-sidebar" style={{ width: '280px', flexShrink: 0 }}>
                        <SidebarFilter onFilterChange={handleFilterUpdate} />
                    </aside>

                    <div className="search-content" style={{ flexGrow: 1 }}>
                        {loading ? (
                            <div className="loading-state">
                                <div className="spinner"></div>
                                <p>Đang tìm kiếm tour tốt nhất cho bạn...</p>
                            </div>
                        ) : (
                            <div className="search-results-grid">
                                {results.length > 0 ? (
                                    results.map((tour) => (
                                        <div key={tour.id} className="search-tour-card">
                                            <div className="card-image">
                                                <img src={tour.image || 'default-image.jpg'} alt={tour.title} />
                                            </div>
                                            <div className="card-content">
                                                <h3>{tour.title}</h3>
                                                <p className="location">{tour.address}</p>
                                                <p className="description">{tour.description?.substring(0, 100)}...</p>
                                                <div className="card-footer">
                                                    <span className="price">{Number(tour.price).toLocaleString()} VNĐ</span>
                                                    <Link to={`/tours/${tour.id}`} className="btn-view">Xem chi tiết</Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="no-results">
                                        <div className="no-results-icon"></div>
                                        <h3>Rất tiếc, không tìm thấy tour nào!</h3>
                                        <p>Hãy thử thay đổi bộ lọc hoặc tìm kiếm với từ khóa khác.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}