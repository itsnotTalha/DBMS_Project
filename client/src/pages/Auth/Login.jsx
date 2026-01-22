import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get returnTo from location state (for checkout redirect)
  const returnTo = location.state?.returnTo;

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
        
        // 2. Check if there's a returnTo path (e.g., from checkout)
        if (returnTo && data.user.role === 'Customer') {
          navigate(returnTo);
          return;
        }
        
        // 3. ROLE-BASED REDIRECTION
        const userRole = data.user.role?.toLowerCase();

        switch (userRole) {
          case 'manufacturer':
            navigate('/manufacturer/Dashboard');
            break;
          case 'customer':
            navigate('/');
            break;
          case 'retailer':
            navigate('/retailer/dashboard');
            break;
          case 'admin':
            navigate('/admin/dashboard');
            break;
          default:
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
    // Centered layout container
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Poppins'] p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back!</h1>
          <p className="text-sm text-gray-500">Enter your credentials to access your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">Email address</label>
            <input 
              type="email" 
              id="email" 
              placeholder="Enter your email" 
              required
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 bg-gray-50 focus:bg-white" 
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Password</label>
              <a href="#" className="text-xs text-blue-600 hover:text-blue-800 hover:underline">Forgot password?</a>
            </div>
            <input 
              type="password" 
              id="password" 
              placeholder="Enter your password" 
              required
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 bg-gray-50 focus:bg-white" 
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="remember"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-4 h-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 accent-emerald-500 cursor-pointer"
            />
            <label htmlFor="remember" className="ml-2 text-sm text-gray-600 cursor-pointer select-none">
              Remember me for 30 days
            </label>
          </div>

          <button 
            type="submit" 
            className="w-full bg-emerald-500 text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Login
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link to="/register" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;