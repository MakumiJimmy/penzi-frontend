import { useState, useEffect } from 'react';
import { Users, MessageSquare, Activity, BarChart3, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const API_BASE = import.meta.env.VITE_API_BASE || '';

function Admin() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
    // Auto refresh data every 5 seconds
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
        const [statsRes, usersRes, msgRes] = await Promise.all([
            fetch(`${API_BASE}/api/admin/stats`),
            fetch(`${API_BASE}/api/admin/users`),
            fetch(`${API_BASE}/api/admin/messages?limit=20`)
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (usersRes.ok) setUsers(await usersRes.json());
        if (msgRes.ok) setMessages(await msgRes.json());
    } catch (error) {
        console.error("Admin fetch error:", error);
    } finally {
        setLoading(false);
    }
  };

  const genderData = stats ? [
    { name: 'Male', count: stats.male_users },
    { name: 'Female', count: stats.female_users }
  ] : [];

  if (loading && !stats) return <div className="admin-loading">Loading Admin Portal...</div>;

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <div className="admin-sidebar">
        <div className="admin-brand">
          <Activity size={28} className="brand-icon" />
          <h2>Penzi Admin</h2>
        </div>
        
        <nav className="admin-nav">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          ><BarChart3 size={18}/> Dashboard</button>
          
          <button 
            className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          ><Users size={18}/> Users</button>
          
          <button 
            className={`nav-btn ${activeTab === 'messages' ? 'active' : ''}`}
            onClick={() => setActiveTab('messages')}
          ><MessageSquare size={18}/> Messages</button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="admin-content">
        <header className="admin-header">
           <h1>{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
           <div className="live-status"><div className="status-dot ping"></div> Live Monitoring</div>
        </header>

        <main className="admin-main">
          {activeTab === 'dashboard' && stats && (
            <div className="dashboard-view fade-in">
              {/* Stat Cards */}
              <div className="stat-cards">
                <div className="stat-card">
                  <div className="stat-icon b-blue"><Users /></div>
                  <div className="stat-info">
                    <h3>Total Users</h3>
                    <p>{stats.total_users}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon b-purple"><MessageSquare /></div>
                  <div className="stat-info">
                    <h3>Total SMS</h3>
                    <p>{stats.total_messages}</p>
                  </div>
                </div>
              </div>

              {/* Charts area */}
              <div className="charts-container">
                <div className="chart-card">
                   <h3>Gender Demographics</h3>
                   <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer>
                      <BarChart data={genderData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
                        <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                   </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-view fade-in">
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Phone</th>
                      <th>Age</th>
                      <th>Gender</th>
                      <th>Location</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td className="font-medium text-white">{u.name}</td>
                        <td>{u.phone_number}</td>
                        <td>{u.age}</td>
                        <td><span className={`badge ${u.gender.toLowerCase()}`}>{u.gender}</span></td>
                        <td>{u.town}, {u.county}</td>
                        <td>{new Date(u.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                    {users.length === 0 && <tr><td colSpan="6" className="text-center">No users found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'messages' && (
            <div className="messages-view fade-in">
               <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Direction</th>
                      <th>From</th>
                      <th>To</th>
                      <th>Type</th>
                      <th>Content</th>
                    </tr>
                  </thead>
                  <tbody>
                    {messages.map(m => (
                      <tr key={m.id}>
                        <td className="t-time"><Clock size={14}/> {new Date(m.created_at).toLocaleTimeString()}</td>
                        <td>
                          <span className={`direction-badge ${m.direction.toLowerCase()}`}>
                            {m.direction}
                          </span>
                        </td>
                        <td>{m.sender_phone}</td>
                        <td>{m.receiver_phone}</td>
                        <td><span className="type-badge">{m.message_type}</span></td>
                        <td className="msg-content">{m.message_content}</td>
                      </tr>
                    ))}
                    {messages.length === 0 && <tr><td colSpan="6" className="text-center">No messages found.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default Admin;
