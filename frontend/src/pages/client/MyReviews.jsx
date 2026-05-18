import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MyReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingReview, setEditingReview] = useState(null);
    const [editContent, setEditContent] = useState("");
    const [editRating, setEditRating] = useState(5);

    // Lấy token từ local storage để xác thực API
    const token = localStorage.getItem('access_token');
    const config = {
        headers: { Authorization: `Bearer ${token}` }
    };

    const fetchReviews = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/tours/reviews/me/', config);
            setReviews(res.data);
            setLoading(false);
        } catch (error) {
            console.error("Lỗi khi tải đánh giá", error);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    const handleDelete = async (id) => {
        if (!window.confirm("Bạn có chắc muốn xóa đánh giá này không?")) return;
        try {
            await axios.delete(`http://localhost:8000/api/tours/reviews/me/${id}/`, config);
            setReviews(reviews.filter(r => r.id !== id));
            alert("Đã xóa đánh giá!");
        } catch (error) {
            alert("Xóa thất bại!");
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`http://localhost:8000/api/tours/reviews/me/${editingReview.id}/`, {
                content: editContent,
                rating: editRating
            }, config);
            alert("Cập nhật thành công!");
            setEditingReview(null);
            fetchReviews();
        } catch (error) {
            alert("Cập nhật thất bại!");
        }
    };

    if (loading) return <div>Đang tải dữ liệu...</div>;

    return (
        <div style={{ padding: '20px', maxWidth: '800px', margin: 'auto' }}>
            <h2>Đánh Giá Của Tôi</h2>
            {reviews.length === 0 ? <p>Bạn chưa có đánh giá nào.</p> : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {reviews.map(review => (
                        <li key={review.id} style={{ border: '1px solid #ccc', margin: '10px 0', padding: '15px', borderRadius: '8px' }}>
                            <p><strong>Tour:</strong> {review.tour_title}</p>
                            <p><strong>Đánh giá:</strong> {review.rating} ⭐</p>
                            <p><strong>Nội dung:</strong> {review.content}</p>
                            <p><small>{new Date(review.created_at).toLocaleString()}</small></p>
                            
                            <button onClick={() => {
                                setEditingReview(review);
                                setEditContent(review.content);
                                setEditRating(review.rating);
                            }} style={{ marginRight: '10px' }}>Sửa</button>
                            
                            <button onClick={() => handleDelete(review.id)} style={{ color: 'red' }}>Xóa</button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Modal Sửa Đánh Giá đơn giản */}
            {editingReview && (
                <div style={{ marginTop: '20px', padding: '15px', border: '1px dashed #007bff', borderRadius: '8px' }}>
                    <h3>Sửa Đánh Giá: {editingReview.tour_title}</h3>
                    <form onSubmit={handleUpdate}>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Số sao (1-5): </label>
                            <input type="number" min="1" max="5" value={editRating} onChange={(e) => setEditRating(e.target.value)} required />
                        </div>
                        <div style={{ marginBottom: '10px' }}>
                            <label>Nội dung: </label><br />
                            <textarea rows="4" style={{ width: '100%' }} value={editContent} onChange={(e) => setEditContent(e.target.value)} required></textarea>
                        </div>
                        <button type="submit">Lưu Thay Đổi</button>
                        <button type="button" onClick={() => setEditingReview(null)} style={{ marginLeft: '10px' }}>Hủy</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default MyReviews;
