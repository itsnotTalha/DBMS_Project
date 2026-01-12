import React, { useState, useEffect } from 'react';
import { 
  Users, Activity, AlertTriangle, Link as LinkIcon, 
  Search, CheckCircle, XCircle, Shield, Database 
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [connections, setConnections] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [usersRes, connRes, alertsRes] = await Promise.all([
        fetch('http://localhost:5000/api/admin/users'),
        fetch('http://localhost:5000/api/admin/connections'),
        fetch('http://localhost:5000/api/admin/alerts')
      ]);

      if (usersRes.ok) setUsers(await usersRes.json());
      if (connRes.ok) setConnections(await connRes.json());
      if (alertsRes.ok) {
        const data = await alertsRes.json();
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error("Failed to fetch admin data", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 font-['Poppins']">
      
      {/* Sidebar */}
      <div className="w-64 bg-slate-900 text-white p-6 fixed h-full">
        <div className="flex items-center gap-3 mb-10">
          <Shield className="w-8 h-8 text-emerald-500" />
          <h1 className="text-xl font-bold">Admin Panel</h1>
        </div>
        
        <nav className="space-y-4">
          <button 
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeTab === 'users' ? 'bg-emerald-600' : 'hover:bg-slate-800'}`}
          >
            <Users className="w-5 h-5" /> Users Monitor
          </button>
          <button 
            onClick={() => setActiveTab('connections')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeTab === 'connections' ? 'bg-emerald-600' : 'hover:bg-slate-800'}`}
          >
            <LinkIcon className="w-5 h-5" /> Network Map
          </button>
          <button 
            onClick={() => setActiveTab('alerts')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeTab === 'alerts' ? 'bg-emerald-600' : 'hover:bg-slate-800'}`}
          >
            <AlertTriangle className="w-5 h-5" /> System Alerts
          </button>
          <button 
            onClick={() => setActiveTab('database')}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${activeTab === 'database' ? 'bg-emerald-600' : 'hover:bg-slate-800'}`}
          >
            <Database className="w-5 h-5" /> Database
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="ml-64 flex-1 p-8 overflow-y-auto">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">System Overview</h2>
            <p className="text-gray-500">Monitoring {users.length} users and {connections.length} active supply chains.</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white p-2 rounded-full shadow-sm border border-gray-100 flex items-center px-4">
              <Search className="w-4 h-4 text-gray-400 mr-2" />
              <input 
                type="text" 
                placeholder="Search system..." 
                className="outline-none text-sm w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">Loading System Data...</div>
        ) : (
          <>
            {/* USERS TAB */}
            {activeTab === 'users' && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-bold text-lg">All Registered Users</h3>
                </div>
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-500 text-sm">
                    <tr>
                      <th className="p-4">User Details</th>
                      <th className="p-4">Role</th>
                      <th className="p-4">Additional Info</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Joined</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredUsers.map(user => (
                      <tr key={user.user_id} className="hover:bg-gray-50 transition">
                        <td className="p-4">
                          <div className="font-semibold text-gray-900">{user.name || 'N/A'}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium 
                            ${user.role === 'Manufacturer' ? 'bg-purple-100 text-purple-700' : 
                              user.role === 'Retailer' ? 'bg-blue-100 text-blue-700' : 
                              user.role === 'Admin' ? 'bg-red-100 text-red-700' : 
                              'bg-green-100 text-green-700'}`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-600 font-mono">
                          {user.extra_info || '-'}
                        </td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-emerald-600 text-sm">
                            <CheckCircle className="w-4 h-4" /> Active
                          </span>
                        </td>
                        <td className="p-4 text-sm text-gray-500">
                          {new Date(user.created_at).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* CONNECTIONS TAB */}
            {activeTab === 'connections' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connections.map((conn, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
                    <div className="flex items-center gap-4 mb-4 w-full justify-between">
                      <div className="text-sm font-bold text-gray-900">{conn.manufacturer}</div>
                      <div className="flex-1 h-px bg-gray-200 mx-2 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-100 px-2 text-[10px] text-gray-400">
                          SUPPLIES
                        </div>
                      </div>
                      <div className="text-sm font-bold text-blue-600">{conn.retailer}</div>
                    </div>
                    
                    <div className="grid grid-cols-2 w-full gap-4 mt-2">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Unique Products</div>
                        <div className="font-bold text-lg">{conn.products_stocked}</div>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-500">Total Units</div>
                        <div className="font-bold text-lg">{conn.total_stock}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ALERTS TAB */}
            {activeTab === 'alerts' && (
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl">
                    <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900">System Healthy</h3>
                    <p className="text-gray-500">No active alerts or reports found.</p>
                  </div>
                ) : (
                  alerts.map(alert => (
                    <div key={alert.alert_id} className="bg-white p-4 rounded-xl border-l-4 border-red-500 shadow-sm flex items-start gap-4">
                      <div className="p-2 bg-red-50 rounded-full text-red-500">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{alert.alert_type}</h4>
                        <p className="text-sm text-gray-600 mt-1">{alert.description}</p>
                        <div className="flex gap-4 mt-2 text-xs text-gray-400">
                          <span>Device: {alert.device_type}</span>
                          <span>Manufacturer: {alert.manufacturer}</span>
                          <span>{new Date(alert.timestamp).toLocaleString()}</span>
                        </div>
                      </div>
                      <button className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded text-gray-600">
                        Mark Resolved
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;