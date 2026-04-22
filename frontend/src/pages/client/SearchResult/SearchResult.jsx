import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import SidebarFilter from '../../../components/layout/SidebarFilter';
import './SearchResult.css';

export default function SearchResult() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('q');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);

    const [filters, setFilters] = useState({
        min_price: '',
        max_price: '',
        departure_date: ''
    });

    useEffect(() => {
        const fetchSearchResults = async () => {
            // Chỉ chạy khi có từ khóa tìm kiếm
            if (!query || query.trim() === "") {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const response = await axiosClient.get(`/tours/filter/`, {
                    params: {
                        search: query,
                        ...filters
                    }
                });

                // Kiểm tra nếu data là mảng thì set, không thì tìm trong results
                const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
                setResults(data);
                
                console.log("Data thực tế từ Backend:", data);
            } catch (error) {
                console.error("Lỗi API:", error);
                setResults([]);
            } finally {
                setLoading(false);
            }
        };

        fetchSearchResults();
    }, [query, filters]);

    const handleFilterUpdate = (newFields) => {
        setFilters(prev => ({ ...prev, ...newFields }));
    };

    const formatImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/300x200?text=No+Image';
        if (url.startsWith('http')) return url;
        return `http://127.0.0.1:8000${url}`;
    };

    return (
        <div className="search-result-page">
            <div className="search-container">
                <header className="search-header">
                    <h2>Kết quả cho: "<span>{query}</span>"</h2>
                    <p>Tìm thấy <strong>{results.length}</strong> tour</p>
                </header>

                <div className="search-main-layout" style={{ display: 'flex', gap: '20px' }}>
                    <aside style={{ width: '280px', flexShrink: 0 }}>
                        <SidebarFilter onFilterChange={handleFilterUpdate} />
                    </aside>

                    <div className="search-content" style={{ flexGrow: 1 }}>
                        {loading ? (
                            <p>Đang tải...</p>
                        ) : (
                            <div className="search-results-grid">
                                {results.length > 0 ? (
                                    results.map((tour) => {
                                        // Lấy ảnh: ưu tiên ảnh đầu tiên trong tour_images, sau đó là image_url
                                        const mainImg = (tour.tour_images && tour.tour_images.length > 0)
                                            ? tour.tour_images[0].image
                                            : tour.image_url;

                                        return (
                                            <div key={tour.id} className="search-tour-card">
                                                <div className="card-image">
                                                    <img src={formatImageUrl(mainImg)} alt={tour.title} />
                                                </div>
                                                <div className="card-content">
                                                    <h3>Tour: {tour.title}</h3>
                                                    <p><b>Địa điểm:</b> {tour.address}</p>
                                                    <p><b>Người tạo:</b> {tour.creator_name}</p>
                                                    
                                                    <div className="card-footer">
                                                        <span className="price">{Number(tour.price || 0).toLocaleString()} VNĐ</span>
                                                        <Link to={`/tours/${tour.id}`} className="btn-view">Chi tiết</Link>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p>Không tìm thấy tour nào</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}