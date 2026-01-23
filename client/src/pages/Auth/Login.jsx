import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { API_AUTH } from '../../config/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // 1. New State for toggle
  const [rememberMe, setRememberMe] = useState(false); 
  const navigate = useNavigate();
  const location = useLocation();
  
  const returnTo = location.state?.returnTo;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(data.user));
        storage.setItem('token', data.token);
        
        if (returnTo && data.user.role === 'Customer') {
          navigate(returnTo);
          return;
        }
        
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
            
            {/* 2. Container set to relative to position the icon */}
            <div className="relative">
              <input 
                // 3. Dynamic type based on state
                type={showPassword ? "text" : "password"} 
                id="password" 
                placeholder="Enter your password" 
                required
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition duration-200 bg-gray-50 focus:bg-white pr-10" 
              />
              
              {/* 4. Toggle Button */}
              <button
                type="button" // Important: prevents form submission when clicked
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  // Eye Slash Icon (Hide)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  // Eye Icon (Show)
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
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