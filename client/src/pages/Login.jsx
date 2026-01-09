import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); 
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 1. Storage Logic
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(data.user));
        storage.setItem('token', data.token);
        
        // 2. ROLE-BASED REDIRECTION
        // We use a switch or if-else to send users to their specific routes
        const userRole = data.user.role?.toLowerCase();

        switch (userRole) {
          case 'manufacturer':
            navigate('/manufacturer/Dashboard');
            break;
          case 'customer':
            navigate('/customer/dashboard');
            break;
          case 'retailer':
            navigate('/retailer/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
            // Fallback for unexpected roles
            alert('Role not recognized. Contact Administrator.');
            navigate('/login');
        }

      } else {
        alert(`Login Failed: ${data.message || data.error}`);
      }
    } catch (error) {
      console.error('Login error:', error);
      alert('Server error. Is the backend running?');
    }
  };

  return (
    // ... (Your existing JSX code remains exactly the same)
    <div className="flex w-full h-screen bg-white font-['Poppins']">
      {/* (Form and image code you provided) */}
      <div className="w-full flex items-center justify-center lg:w-1/2">
        <div className="w-full max-w-md px-8 py-10">
          <div className="mb-10">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Welcome back!</h1>
            <p className="text-sm text-gray-500">Enter your Credentials to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">Email address</label>
              <input type="email" id="email" placeholder="Enter your email" required
                value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#3A5B22] focus:ring-1 focus:ring-[#3A5B22] transition duration-200" />
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900">Password</label>
                <a href="#" className="text-xs text-blue-700 hover:underline">forgot password</a>
              </div>
              <input type="password" id="password" placeholder="Enter your password" required
                value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-[#3A5B22] focus:ring-1 focus:ring-[#3A5B22] transition duration-200" />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-[#3A5B22] border-gray-300 rounded focus:ring-[#3A5B22] accent-[#3A5B22]"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700 cursor-pointer">
                Remember for 30 days
              </label>
            </div>

            <button type="submit" className="w-full bg-[#3A5B22] text-white py-3.5 rounded-lg text-sm font-medium hover:opacity-90 transition duration-200 shadow-sm">
              Login
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-blue-700 font-semibold hover:underline">Sign Up</Link>
          </div>
        </div>
      </div>
      
      <div className="hidden lg:flex w-1/2 p-6 bg-gray-50 items-center justify-center">
        <div className="w-full h-full rounded-[40px] overflow-hidden relative shadow-lg">
          <img
            src="https://images.unsplash.com/photo-1497250681960-ef048c0ab947?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
            alt="Leaf Background"
            className="absolute inset-0 w-full h-full object-cover"
          />
        </div>
      </div>
    </div>
  );
};

export default Login;