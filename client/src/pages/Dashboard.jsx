import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // 1. Check BOTH storages
    // If user is in localStorage, use that. If not, check sessionStorage.
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!storedUser) {
      navigate('/login');
    } else {
      setUser(JSON.parse(storedUser));
    }
  }, [navigate]);

  const handleLogout = () => {
    // 2. Clear BOTH storages to ensure full logout
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('token');
    
    navigate('/login');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 font-['Poppins']">
      {/* ... Your Navbar ... */}
      <nav className="bg-[#3A5B22] text-white px-6 py-4 flex justify-between items-center shadow-md">
        <div className="text-xl font-bold tracking-wide">AMANAH SUPPLY CHAIN</div>
        <div className="flex items-center space-x-4">
          <span className="text-xs md:text-sm bg-white/20 px-3 py-1 rounded-full uppercase tracking-wider">
            {user.role} Portal
          </span>
          <button onClick={handleLogout} className="text-sm hover:text-gray-200 hover:underline">
            Logout
          </button>
        </div>
      </nav>

      {/* ... Rest of your Dashboard UI ... */}
      <div className="max-w-5xl mx-auto mt-12 px-6">
        <div className="bg-white rounded-2xl shadow-xl p-10 text-center border-t-4 border-[#3A5B22]">
           {/* ... Welcome content ... */}
           <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-3">
            Welcome back, <span className="text-[#3A5B22]">{user.name}</span>!
          </h1>
          {/* ... */}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;