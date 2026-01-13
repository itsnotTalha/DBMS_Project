import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard, Users, Activity, Bell, AlertTriangle, MessageSquare,
  ShieldCheck, Search, Eye, X, Network, Database, Link as LinkIcon, CheckCircle
} from 'lucide-react';
import Layout from '../Layout';

const API_BASE = 'http://localhost:5000/api/admin';

const Dashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  
  // View State derived from URL query param
  const queryParams = new URLSearchParams(location.search);
  const currentTab = queryParams.get('tab') || 'dashboard';

  // --- Data States ---
  const [stats, setStats] = useState({
    total_users: 0,
    active_manufacturers: 0,
    system_alerts: 0,
    total_transactions: 0
  });
  
  const [recentActivity, setRecentActivity] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [connections, setConnections] = useState([]);
  const [alertsList, setAlertsList] = useState([]); // New State
  const [complaintsList, setComplaintsList] = useState([]); // New State

  // UI States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // --- MENU CONFIGURATION ---
  const adminMenuItems = [
    { 
      icon: <LayoutDashboard size={18} />, 
      label: 'Dashboard', 
      path: '/admin/dashboard' 
    },
    { 
      icon: <Users size={18} />, 
      label: 'User Monitor', 
      path: '/admin/dashboard?tab=users' 
    },
    { 
      icon: <Network size={18} />, 
      label: 'Network Map', 
      path: '/admin/dashboard?tab=network' 
    },
    { 
      icon: <AlertTriangle size={18} />, 
      label: 'System Alerts', 
      path: '/admin/dashboard?tab=alerts' 
    },
    { 
      icon: <MessageSquare size={18} />, 
      label: 'Complaints', 
      path: '/admin/dashboard?tab=complaints' 
    },
    { 
      icon: <Database size={18} />, 
      label: 'System Logs', 
      path: '/admin/dashboard?tab=logs' 
    },
  ];

  // --- Initialization ---
  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Admin') {
      alert('Access Denied');
      navigate('/login');
      return;
    }
    setUser(parsedUser);
    fetchAllData();
  }, [navigate]);

  const fetchAllData = async () => {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    const authConfig = { headers: { Authorization: `Bearer ${token}` } };
    setLoading(true);

    try {
      // Fetch all data in parallel
      const results = await Promise.allSettled([
        axios.get(`${API_BASE}/dashboard-stats`, authConfig),
        axios.get(`${API_BASE}/recent-activity`, authConfig),
        axios.get(`${API_BASE}/users`, authConfig),       
        axios.get(`${API_BASE}/connections`, authConfig),
        axios.get(`${API_BASE}/alerts`, authConfig),      
        axios.get(`${API_BASE}/complaints`, authConfig) // Assuming this endpoint exists, or it fails gracefully
      ]);

      // 0:Stats, 1:Activity, 2:Users, 3:Connections, 4:Alerts, 5:Complaints
      if (results[0].status === 'fulfilled') setStats(results[0].value.data);
      if (results[1].status === 'fulfilled') setRecentActivity(results[1].value.data.activities || []);
      if (results[2].status === 'fulfilled') {
        const userData = results[2].value.data;
        setUsersList(Array.isArray(userData) ? userData : userData.users || []);
      }
      if (results[3].status === 'fulfilled') setConnections(results[3].value.data || []);
      if (results[4].status === 'fulfilled') setAlertsList(results[4].value.data.alerts || []);
      if (results[5].status === 'fulfilled') setComplaintsList(results[5].value.data || []);

    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper: Filter Users
  const filteredUsers = usersList.filter(u => 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
    u.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Helper: View User Details
  const handleViewUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data);
      setShowModal(true);
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-semibold text-slate-500">Loading Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={adminMenuItems}>
      <div className="p-8 space-y-8">
        
        {/* =======================================================
            VIEW 1: DASHBOARD OVERVIEW
           ======================================================= */}
        {currentTab === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">System Overview</h2>
            
            <div className="grid grid-cols-4 gap-3 md:gap-6 mb-8">
              <StatCard title="Total Users" value={stats.total_users} icon={<Users />} />
              <StatCard title="Manufacturers" value={stats.active_manufacturers} icon={<ShieldCheck />} />
              <StatCard title="System Alerts" value={stats.system_alerts} icon={<Bell />} alert={stats.system_alerts > 0} />
              <StatCard title="Active Chains" value={connections.length} icon={<LinkIcon />} />
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border">
                <div className="p-6 border-b">
                  <h3 className="font-black">Recent System Activity</h3>
                </div>
                <table className="w-full text-sm">
                  <thead className="text-xs text-slate-400 uppercase bg-slate-50">
                    <tr>
                      <th className="px-6 py-4 text-left">User</th>
                      <th className="px-6 py-4 text-left">Role</th>
                      <th className="px-6 py-4 text-left">Action</th>
                      <th className="px-6 py-4 text-left">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentActivity.length ? recentActivity.map((log, i) => (
                      <tr key={i} className="border-t hover:bg-slate-50">
                        <td className="px-6 py-4 font-bold">{log.user_name}</td>
                        <td className="px-6 py-4 text-slate-500 text-xs">{log.user_role}</td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 text-xs font-bold rounded ${
                            log.type === 'Error' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-400">
                          {new Date(log.created_at).toLocaleString()}
                        </td>
                      </tr>
                    )) : (
                      <tr><td colSpan="4" className="text-center py-10 text-slate-400">No activity</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border p-6">
                 <h4 className="font-black mb-4 flex items-center gap-2">
                    <Activity className="text-emerald-500" size={18} />
                    Live Feed
                  </h4>
                  <div className="space-y-4">
                    {recentActivity.slice(0, 3).map((act, i) => (
                      <ActivityItem key={i} act={act} />
                    ))}
                  </div>
              </div>
            </div>
          </div>
        )}

        {/* =======================================================
            VIEW 2: USER MONITOR
           ======================================================= */}
        {currentTab === 'users' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">User Monitor</h2>
                <p className="text-slate-500 text-sm">Manage registered users and permissions.</p>
              </div>
              
              <div className="bg-white p-2 rounded-full shadow-sm border border-slate-200 flex items-center px-4 w-72">
                <Search className="w-4 h-4 text-slate-400 mr-2" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  className="outline-none text-sm w-full bg-transparent"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                {searchTerm && (
                   <button onClick={() => setSearchTerm('')}><X size={14} className="text-slate-400 hover:text-red-500"/></button>
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">User Details</th>
                    <th className="p-4">Role</th>
                    <th className="p-4">Extra Info</th>
                    <th className="p-4">Status</th>
                    <th className="p-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredUsers.map(u => (
                    <tr key={u.user_id} className="hover:bg-slate-50 transition">
                      <td className="p-4">
                        <div className="font-bold text-slate-900">{u.username || u.name || 'N/A'}</div>
                        <div className="text-xs text-slate-500">{u.email}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider
                          ${u.role === 'Manufacturer' ? 'bg-purple-100 text-purple-700' : 
                            u.role === 'Retailer' ? 'bg-blue-100 text-blue-700' : 
                            u.role === 'Admin' ? 'bg-red-100 text-red-700' : 
                            'bg-emerald-100 text-emerald-700'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-500 font-mono text-xs">{u.extra_info || '-'}</td>
                      <td className="p-4">
                        <span className="flex items-center gap-1 text-emerald-600 font-semibold text-xs">
                          <ShieldCheck className="w-3 h-3" /> {u.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4">
                        <button 
                          onClick={() => handleViewUser(u.user_id)}
                          className="p-2 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded-lg transition-colors"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredUsers.length === 0 && (
                    <tr><td colSpan="5" className="p-8 text-center text-slate-400">No users found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* =======================================================
            VIEW 3: NETWORK MAP
           ======================================================= */}
        {currentTab === 'network' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
             <div>
                <h2 className="text-2xl font-bold text-slate-900">Network Map</h2>
                <p className="text-slate-500 text-sm">Visualizing manufacturer to retailer connections.</p>
              </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {connections.map((conn, idx) => (
                <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col items-center text-center">
                  <div className="flex items-center gap-4 mb-6 w-full justify-between">
                    <div className="text-sm font-bold text-slate-900 bg-purple-50 px-3 py-1 rounded-lg border border-purple-100">
                      {conn.manufacturer}
                    </div>
                    <div className="flex-1 h-px bg-slate-200 mx-2 relative">
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                        <LinkIcon size={12} className="text-slate-300"/>
                      </div>
                    </div>
                    <div className="text-sm font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-lg border border-blue-100">
                      {conn.retailer}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 w-full gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Products</div>
                      <div className="font-black text-xl text-slate-700">{conn.products_stocked}</div>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <div className="text-[10px] uppercase font-bold text-slate-400">Total Units</div>
                      <div className="font-black text-xl text-emerald-600">{conn.total_stock}</div>
                    </div>
                  </div>
                </div>
              ))}
              {connections.length === 0 && (
                <div className="col-span-full py-12 text-center text-slate-400 italic">
                  No active supply chain connections detected.
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================================
            VIEW 4: SYSTEM ALERTS (New Requirement)
           ======================================================= */}
        {currentTab === 'alerts' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">System Alerts & Bugs</h2>
              <p className="text-slate-500 text-sm">Critical system notifications and error reports.</p>
            </div>

            <div className="space-y-4">
              {alertsList.length > 0 ? alertsList.map((alert, idx) => (
                <div key={idx} className="bg-white p-5 rounded-xl border border-l-4 border-l-red-500 shadow-sm flex items-start gap-4">
                  <div className="p-2 bg-red-50 rounded-full text-red-500 shrink-0">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900">{alert.alert_type}</h4>
                      <span className="text-xs text-slate-400 font-mono">{new Date(alert.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-sm text-slate-600 mt-1">{alert.description}</p>
                    <div className="flex gap-3 mt-3">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200">
                        {alert.device_type}
                      </span>
                      {alert.manufacturer && (
                        <span className="text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded border border-purple-100">
                          {alert.manufacturer}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )) : (
                <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                  <CheckCircle className="mx-auto text-emerald-400 mb-3" size={48} />
                  <h3 className="text-lg font-bold text-slate-700">All Systems Operational</h3>
                  <p className="text-slate-500 text-sm">No active bugs or alerts reported.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =======================================================
            VIEW 5: COMPLAINTS (New Requirement)
           ======================================================= */}
        {currentTab === 'complaints' && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">User Complaints</h2>
              <p className="text-slate-500 text-sm">Feedback and issues reported by users.</p>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase font-semibold">
                  <tr>
                    <th className="p-4">User / Contact</th>
                    <th className="p-4">Subject</th>
                    <th className="p-4">Message</th>
                    <th className="p-4">Date</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {complaintsList.length > 0 ? complaintsList.map((comp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="p-4 font-medium text-slate-900">{comp.user_name || 'Anonymous'}</td>
                      <td className="p-4 font-bold">{comp.subject}</td>
                      <td className="p-4 text-slate-600 max-w-md truncate">{comp.message}</td>
                      <td className="p-4 text-slate-400 text-xs">{new Date(comp.created_at).toLocaleDateString()}</td>
                      <td className="p-4">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded">
                          {comp.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="5" className="p-12 text-center text-slate-400 italic">
                        No complaints found in the database.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {/* =======================================================
            VIEW 6: SYSTEM LOGS (Placeholder)
           ======================================================= */}
        {currentTab === 'logs' && (
           <div className="flex flex-col items-center justify-center h-96 bg-white rounded-2xl border border-dashed border-slate-300">
              <Database className="text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-slate-700">System Logs Archive</h3>
              <p className="text-slate-500 text-sm">Select a date range to download server logs.</p>
              <button className="mt-4 px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-semibold hover:bg-slate-900">
                Download Recent Logs
              </button>
           </div>
        )}

      </div>

      {/* --- MODAL (Global) --- */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-black text-slate-800 flex items-center gap-2">
                <Users size={20} className="text-emerald-500"/>
                User Profile
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-red-500 transition-colors">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-5">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest border-b pb-2">Account Info</h4>
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Username</label>
                  <p className="font-medium text-slate-900">{selectedUser.username || selectedUser.name}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Email</label>
                  <p className="font-medium text-slate-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-xs text-slate-500 font-semibold">Current Role</label>
                  <div className="mt-1">
                    <span className="px-3 py-1 inline-flex text-xs font-bold rounded bg-slate-100 text-slate-700 uppercase">
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <h4 className="font-bold text-xs text-slate-400 uppercase tracking-widest border-b pb-2">System Metadata</h4>
                <div className="space-y-4">
                  {Object.entries(selectedUser).map(([key, value]) => {
                     if (['user_id', 'username', 'name', 'email', 'role', 'status', 'password', 'is_verified', 'extra_info'].includes(key)) return null;
                     return (
                       <div key={key} className="flex flex-col">
                         <label className="text-xs text-slate-500 font-semibold capitalize">{key.replace(/_/g, ' ')}</label>
                         <p className="font-mono text-sm text-slate-700 break-words bg-slate-50 p-2 rounded border border-slate-100 mt-1">
                           {String(value) || 'N/A'}
                         </p>
                       </div>
                     );
                  })}
                  {selectedUser.created_at && (
                    <div>
                      <label className="text-xs text-slate-500 font-semibold">Joined Date</label>
                      <p className="font-mono text-sm text-slate-700 mt-1">
                        {new Date(selectedUser.created_at).toLocaleString()}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t bg-slate-50 flex justify-end rounded-b-2xl">
              <button 
                onClick={() => setShowModal(false)}
                className="px-6 py-2 bg-white border border-slate-300 text-slate-700 font-semibold rounded-lg hover:bg-slate-100 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

// --- Sub-components ---
const StatCard = ({ title, value, icon, alert }) => (
  <div className="bg-white border rounded-2xl p-4 md:p-6 flex flex-col justify-between items-start shadow-sm hover:shadow-md transition-shadow">
    <div className="w-full">
      <p className="text-[10px] md:text-[11px] uppercase font-bold text-slate-400 mb-1">{title}</p>
      <p className="text-xl md:text-3xl font-black text-slate-800">{value}</p>
    </div>
    <div className={`p-2 md:p-3 rounded-xl mt-3 ${alert ? 'bg-red-100 text-red-500' : 'bg-emerald-100 text-emerald-600'}`}>
      {icon}
    </div>
  </div>
);

const ActivityItem = ({ act }) => (
  <div className="text-xs border-l-2 border-emerald-500 pl-4 py-1">
    <p className="font-bold text-slate-800">{act.action} <span className="text-slate-400 font-normal">by</span> {act.user_name}</p>
    <p className="text-slate-400 mt-1">{new Date(act.created_at).toLocaleTimeString()}</p>
  </div>
);

export default Dashboard;