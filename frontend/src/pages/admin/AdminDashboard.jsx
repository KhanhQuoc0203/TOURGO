import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, total_tours: 0 });
  const [users, setUsers] = useState([]);
  const [allTours, setAllTours] = useState([]); 
  const [filteredTours, setFilteredTours] = useState([]); 
  const [currentTab, setCurrentTab] = useState('all'); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (currentTab === 'all') {
      setFilteredTours(allTours);
    } else {
      setFilteredTours(allTours.filter(tour => tour.status === currentTab));
    }
  }, [currentTab, allTours]);

  // 1. HÀM NẠP DATA BAN ĐẦU - BẮT LỖI 401 VÀ AN TOÀN TUYỆT ĐỐI
  const fetchData = async () => {
    const token = localStorage.getItem('access_token');
    
    if (!token) {
      alert("Phiên đăng nhập đã hết hạn hoặc bạn không có quyền Admin. Vui lòng đăng nhập lại!");
      setLoading(false);
      return;
    }

    const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

    try {
      setLoading(true);
      
      const [statsRes, usersRes, toursRes] = await Promise.all([
        fetch('http://127.0.0.1:8000/api/users/admin/system-stats/', { headers }), 
        fetch('http://127.0.0.1:8000/api/users/admin/users/', { headers }),        
        fetch('http://127.0.0.1:8000/api/tours/', { headers }) 
      ]);

      if (statsRes.status === 401 || usersRes.status === 401 || toursRes.status === 401) {
        alert("Phiên làm việc Admin đã hết hạn (401). Vui lòng đăng nhập lại hệ thống!");
        return;
      }

      let statsData = { data: { total_users: 0, total_tours: 0 } };
      let usersData = [];
      let toursData = [];

      if (statsRes.ok) statsData = await statsRes.json();
      if (usersRes.ok) usersData = await usersRes.json();
      if (toursRes.ok) toursData = await toursRes.json();

      setStats(statsData.data || { total_users: 0, total_tours: 0 });
      setUsers(usersData || []);
      setAllTours(toursData || []);
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu hệ thống Admin:", err);
    } finally {
      setLoading(false);
    }
  };

  // 2. HÀM PHÊ DUYỆT TOUR CỦA PROVIDER
  const handleTourAction = async (tourId, action) => {
    const token = localStorage.getItem('access_token');
    if (!token) return alert("Vui lòng đăng nhập tài khoản Admin.");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/tours/admin/tours/${tourId}/approve/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: action }) 
      });

      if (res.status === 401) {
        alert("Thao tác bị từ chối: Phiên đăng nhập Admin đã hết hạn.");
        return;
      }

      if (res.ok) {
        alert("Thao tác phê duyệt trạng thái hành trình thành công!");
        fetchData(); 
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(`Thất bại: ${errData.error || 'Lỗi từ server: ' + res.status}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối API duyệt tour:", error);
    }
  };

  // 3. HÀM ĐỔI TRẠNG THÁI TÀI KHOẢN (KHÓA/MỞ)
  const handleToggleUserStatus = async (userId) => {
    const token = localStorage.getItem('access_token');
    if (!token) return alert("Vui lòng đăng nhập lại.");

    try {
      const res = await fetch(`http://127.0.0.1:8000/api/users/admin/users/${userId}/toggle-status/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 401) {
        alert("Phiên làm việc hết hạn. Không thể đổi trạng thái tài khoản lúc này.");
        return;
      }

      if (res.status === 405) {
        alert("Lỗi 405: Backend chưa cho phép phương thức POST tại URL toggle-status này.");
        return;
      }

      if (res.ok) {
        alert("Cập nhật trạng thái hoạt động tài khoản thành công!");
        fetchData(); 
      } else {
        alert(`Thay đổi trạng thái thất bại. Mã phản hồi: ${res.status}`);
      }
    } catch (error) {
      console.error("Lỗi kết nối API toggle user:", error);
    }
  };

  const getCountByStatus = (status) => {
    if (status === 'all') return allTours.length;
    return allTours.filter(t => t.status === status).length;
  };

  // HÀM KIỂM TRA QUYỀN LINH HOẠT - KHẮC PHỤC LỖI HIỂN THỊ SAI VAI TRÒ
  const renderRoleBadge = (user) => {
    // Ép chữ thường trường role phòng trường hợp backend trả về 'ADMIN' hoặc 'admin'
    const roleStr = user.role ? user.role.toLowerCase() : '';
    
    // Nếu username là 'admin', hoặc 'khanh', hoặc backend báo is_superuser/is_staff = true, hoặc role là admin
    if (
      user.username === 'admin' || 
      user.username === 'khanh' || 
      user.is_superuser === true || 
      user.is_staff === true || 
      roleStr === 'admin'
    ) {
      return <span className="role-badge role-admin">Quản trị</span>;
    }
    
    if (roleStr === 'provider') {
      return <span className="role-badge role-provider">Nhà cung cấp</span>;
    }
    
    return <span className="role-badge role-user">Khách hàng</span>;
  };

  if (loading) return <div className="loading-screen">Đang đồng bộ trung tâm quản trị Admin...</div>;

  return (
    <div className="admin-shell">
      <main className="main-content">
        <h1 className="page-title">Dashboard Tổng quan quản trị</h1>
        
        {/* THỐNG KÊ */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-card-label">Tổng Users Hệ Thống</span>
            <div className="stat-card-value">{stats.total_users}</div>
          </div>
          <div className="stat-card">
            <span className="stat-card-label">Tổng Số Tour Toàn Sàn</span>
            <div className="stat-card-value">{stats.total_tours}</div>
          </div>
        </div>

        {/* PHẦN 1: QUẢN LÝ PHÊ DUYỆT TOUR THEO TABS */}
        <section className="chart-section" style={{ marginTop: '30px' }}>
          <div className="chart-card" style={{ width: '100%' }}>
            <p className="chart-card-title" style={{ fontSize: '18px', fontWeight: '600', marginBottom: '15px' }}>
              Quản lý phê duyệt trạng thái hành trình từ nhà cung cấp
            </p>
            
            <div className="status-tabs-container" style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid #e0e0e0', paddingBottom: '10px' }}>
              <button onClick={() => setCurrentTab('all')} style={{ padding: '8px 16px', border: 'none', background: currentTab === 'all' ? '#3498db' : '#f1f2f6', color: currentTab === 'all' ? '#fff' : '#2c3e50', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                Tất cả ({getCountByStatus('all')})
              </button>
              <button onClick={() => setCurrentTab('pending')} style={{ padding: '8px 16px', border: 'none', background: currentTab === 'pending' ? '#f1c40f' : '#f1f2f6', color: currentTab === 'pending' ? '#fff' : '#2c3e50', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                Chờ duyệt ({getCountByStatus('pending')})
              </button>
              <button onClick={() => setCurrentTab('approved')} style={{ padding: '8px 16px', border: 'none', background: currentTab === 'approved' ? '#2ecc71' : '#f1f2f6', color: currentTab === 'approved' ? '#fff' : '#2c3e50', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                Đang hoạt động ({getCountByStatus('approved')})
              </button>
              <button onClick={() => setCurrentTab('rejected')} style={{ padding: '8px 16px', border: 'none', background: currentTab === 'rejected' ? '#e74c3c' : '#f1f2f6', color: currentTab === 'rejected' ? '#fff' : '#2c3e50', borderRadius: '4px', cursor: 'pointer', fontWeight: '500' }}>
                Từ chối ({getCountByStatus('rejected')})
              </button>
            </div>
            
            {filteredTours.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: '#7f8c8d', fontStyle: 'italic' }}>Không có chương trình tour nào ứng với trạng thái lọc này.</p>
            ) : (
              <table className="user-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #dee2e6', textAlign: 'left' }}>
                    <th style={{ padding: '12px' }}>Tên hành trình</th>
                    <th style={{ padding: '12px' }}>Giá niêm yết</th>
                    <th style={{ padding: '12px' }}>Trạng thái</th>
                    <th style={{ padding: '12px', textAlign: 'center' }}>Thao tác kiểm duyệt nhanh</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTours.map(tour => (
                    <tr key={tour.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                      <td style={{ padding: '12px', fontWeight: '500' }}>{tour.title}</td>
                      <td style={{ padding: '12px' }}>{tour.price ? tour.price.toLocaleString() : 0} đ</td>
                      <td style={{ padding: '12px' }}>
                        {tour.status === 'approved' && <span style={{ color: '#2ecc71', backgroundColor: '#e8f8f0', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>Đang hoạt động</span>}
                        {tour.status === 'pending' && <span style={{ color: '#f1c40f', backgroundColor: '#fef9e7', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>Chờ duyệt</span>}
                        {tour.status === 'rejected' && <span style={{ color: '#e74c3c', backgroundColor: '#fceae9', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '13px' }}>Từ chối</span>}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button onClick={() => handleTourAction(tour.id, 'approve')} style={{ backgroundColor: tour.status === 'approved' ? '#bdc3c7' : '#2ecc71', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: tour.status === 'approved' ? 'not-allowed' : 'pointer' }} disabled={tour.status === 'approved'}>Duyệt</button>
                          <button onClick={() => handleTourAction(tour.id, 'pending')} style={{ backgroundColor: tour.status === 'pending' ? '#bdc3c7' : '#f1c40f', color: '#333', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: tour.status === 'pending' ? 'not-allowed' : 'pointer' }} disabled={tour.status === 'pending'}>Chờ</button>
                          <button onClick={() => handleTourAction(tour.id, 'reject')} style={{ backgroundColor: tour.status === 'rejected' ? '#bdc3c7' : '#e74c3c', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: tour.status === 'rejected' ? 'not-allowed' : 'pointer' }} disabled={tour.status === 'rejected'}>Từ chối</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* PHẦN 2: QUẢN LÝ THÀNH VIÊN USER */}
        <section className="chart-section" style={{ marginTop: '30px' }}>
          <div className="chart-card">
            <p className="chart-card-title">Quản trị danh sách thành viên hệ thống</p>
            <table className="user-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phân quyền vai trò</th>
                  <th style={{ textAlign: 'center' }}>Thao tác trạng thái nhanh</th>
                </tr>
              </thead>
              <tbody>
  {users.map(u => {
    // Xác định xem user này có phải Admin tối cao không
    const isAdmin = u.username === 'admin' || u.username === 'khanh' || u.is_superuser === true || u.is_staff === true || (u.role && u.role.toLowerCase() === 'admin');

    return (
      <tr key={u.id}>
        <td>{u.username}</td>
        <td>{u.email || '---'}</td>
        <td>
          {isAdmin ? (
            <span className="role-badge role-admin">Quản trị</span>
          ) : u.role === 'provider' ? (
            <span className="role-badge role-provider">Nhà cung cấp</span>
          ) : (
            <span className="role-badge role-user">Khách hàng</span>
          )}
        </td>
        
        {/* XỬ LÝ 3 TRẠNG THÁI HIỂN THỊ VÀ ẨN THAO TÁC CỦA ADMIN */}
        <td style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px' }}>
            
            {/* 1. HIỂN THỊ 1 TRONG 3 TRẠNG THÁI: KÍCH HOẠT / KHÓA / CHỜ DUYỆT */}
            {u.status === 'Active' && (
              <span style={{ color: '#2ecc71', backgroundColor: 'rgba(46, 204, 113, 0.15)', padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block', minWidth: '100px' }}>
                Đã kích hoạt
              </span>
            )}

            {u.status === 'Banned' && (
              <span style={{ color: '#e74c3c', backgroundColor: 'rgba(231, 76, 60, 0.15)', padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block', minWidth: '100px' }}>
                Đang bị khóa
              </span>
            )}

            {(u.status === 'Pending' || (!u.status && !u.is_active && !isAdmin)) && (
              <span style={{ color: '#f1c40f', backgroundColor: 'rgba(241, 196, 15, 0.15)', padding: '5px 12px', borderRadius: '4px', fontWeight: 'bold', fontSize: '12px', display: 'inline-block', minWidth: '100px' }}>
                Chờ duyệt
              </span>
            )}

            {/* 2. ĐIỀU KIỆN ẨN NÚT THAO TÁC NẾU LÀ TÀI KHOẢN ADMIN */}
            {isAdmin ? (
              // Nếu là Admin thì hiện chữ ẩn hoặc một khoảng trống cố định thay vì nút bấm
              <span style={{ color: '#7f8c8d', fontSize: '12px', fontStyle: 'italic', minWidth: '110px', display: 'inline-block' }}>
                Không thể thao tác
              </span>
            ) : (
              // Nếu không phải Admin thì hiện nút bấm ngữ nghĩa linh hoạt theo trạng thái
              <button 
                onClick={() => handleToggleUserStatus(u.id)}
                style={{ 
                  backgroundColor: u.status === 'Active' ? '#e74c3c' : u.status === 'Banned' ? '#2ecc71' : '#3498db', 
                  color: 'white', 
                  border: 'none', 
                  padding: '6px 14px', 
                  borderRadius: '4px', 
                  cursor: 'pointer',
                  fontSize: '12px',
                  fontWeight: '600',
                  minWidth: '110px',
                  transition: 'all 0.2s ease-in-out'
                }}
              >
                {u.status === 'Active' ? 'Khóa lại' : u.status === 'Banned' ? 'Mở khóa ngay' : 'Phê duyệt'}
              </button>
            )}
            
          </div>
        </td>
      </tr>
    );
  })}
</tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}