import React, { useEffect, useState } from 'react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ total_users: 0, total_tours: 0 });
  const [users, setUsers] = useState([]);
  const [pendingTours, setPendingTours] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('access_token');
      const headers = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

      try {
        const [statsRes, usersRes, toursRes] = await Promise.all([
          fetch('http://127.0.0.1:8000/api/users/admin/system-stats/', { headers }),
          fetch('http://127.0.0.1:8000/api/users/admin/users/', { headers }),
          fetch('http://127.0.0.1:8000/api/admin/tours/pending/', { headers })
        ]);

        const [statsData, usersData, toursData] = await Promise.all([
          statsRes.json(), usersRes.json(), toursRes.json()
        ]);

        setStats(statsData.data);
        setUsers(usersData);
        setPendingTours(toursData);
      } catch (err) { console.error("Lỗi:", err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleTourAction = async (tourId, action) => {
    const reason = action === 'reject' ? prompt("Nhập lý do từ chối:") : '';
    if (action === 'reject' && !reason) return;

    const res = await fetch(`http://127.0.0.1:8000/api/admin/tours/${tourId}/approve/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('access_token')}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, reason })
    });

    if (res.ok) {
      alert("Thao tác thành công!");
      setPendingTours(pendingTours.filter(t => t.id !== tourId));
    }
  };

  if (loading) return <div className="loading-screen">Đang tải...</div>;

  return (
    <div className="admin-shell">
      <main className="main-content">
        <h1 className="page-title">Dashboard Tổng quan</h1>
        
        {/* STATS */}
        <div className="stats-grid">
          <div className="stat-card accent-blue">
            <span className="stat-card-label">Tổng Users</span>
            <div className="stat-card-value">{stats.total_users}</div>
          </div>
        </div>

        {/* TOUR CHỜ DUYỆT */}
        <section className="chart-section">
          <div className="chart-card">
            <p className="chart-card-title">Tour Chờ Duyệt</p>
            <table className="user-table">
              <tbody>
                {pendingTours.map(tour => (
                  <tr key={tour.id}>
                    <td>{tour.title}</td>
                    <td>
                      <button onClick={() => handleTourAction(tour.id, 'approve')}>Duyệt</button>
                      <button onClick={() => handleTourAction(tour.id, 'reject')}>Từ chối</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}