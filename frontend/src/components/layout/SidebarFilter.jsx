import React from 'react';
import './SidebarFilter.css';

const SidebarFilter = ({ onFilterChange }) => {
    
    // Khi Hà nhập vào ô input, hàm này sẽ báo cho Khang biết ngay lập tức
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        onFilterChange({ [name]: value });
    };

    return (
        <div className="sidebar-filter">
            <h3 className="filter-title">Bộ lọc tìm kiếm</h3>

            <div className="filter-group">
                <label>Giá từ (VNĐ):</label>
                <input 
                    type="number" 
                    name="min_price" 
                    placeholder="Tối thiểu..."
                    onChange={handleInputChange} 
                />
            </div>

            <div className="filter-group">
                <label>Đến giá (VNĐ):</label>
                <input 
                    type="number" 
                    name="max_price" 
                    placeholder="Tối đa..."
                    onChange={handleInputChange} 
                />
            </div>

            <div className="filter-group">
                <label>Ngày khởi hành:</label>
                <input 
                    type="date" 
                    name="departure_date" 
                    onChange={handleInputChange} 
                />
            </div>
        </div>
    );
};

export default SidebarFilter;