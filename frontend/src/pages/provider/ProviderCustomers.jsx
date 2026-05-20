import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProviderCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Gọi API lấy danh sách khách hàng của Tân viết
    const fetchCustomers = async () => {
      try {
        const token = localStorage.getItem('token'); // Lấy vé thông hành đã đăng nhập
        const response = await axios.get('http://127.0.0.1:8000/api/tours/provider/customers/', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setCustomers(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi lấy danh sách khách hàng:", error);
        setLoading(false);
      }
    };

    fetchCustomers();
  }, []);

  if (loading) return <p>Đang tải danh sách khách hàng...</p>;

  return (
    <div style={{ padding: '20px' }}>
      <h3>👥 Quản lý danh sách khách hàng</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
        <thead>
          <tr style={{ background: '#eceff1', textAlign: 'left' }}>
            <th style={{ padding: '10px', border: '1px solid #cfd8dc' }}>Tên Khách</th>
            <th style={{ padding: '10px', border: '1px solid #cfd8dc' }}>Email</th>
            <th style={{ padding: '10px', border: '1px solid #cfd8dc' }}>Số điện thoại</th>
            <th style={{ padding: '10px', border: '1px solid #cfd8dc' }}>Các Tour đã đặt</th>
          </tr>
        </thead>
        <tbody>
          {customers.map(customer => (
            <tr key={customer.id}>
              <td style={{ padding: '10px', border: '1px solid #cfd8dc', fontWeight: 'bold' }}>{customer.customer_name}</td>
              <td style={{ padding: '10px', border: '1px solid #cfd8dc' }}>{customer.email}</td>
              <td style={{ padding: '10px', border: '1px solid #cfd8dc', color: '#0288d1' }}>
                📞 {customer.phone}
              </td>
              <td style={{ padding: '10px', border: '1px solid #cfd8dc' }}>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {customer.booked_tours.map((t, idx) => (
                    <li key={idx}>
                      {t.tour_title} (SL: {t.quantity} - Tổng: {t.total_price.toLocaleString()}đ)
                    </li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProviderCustomers;