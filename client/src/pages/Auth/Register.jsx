import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  // 1. Role State
  const [role, setRole] = useState('Customer');

  // 2. Password Visibility States
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 3. Form Data State
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    // Customer Fields
    first_name: '',
    last_name: '',
    phone_number: '',
    // Manufacturer Fields
    company_name: '',
    license_number: '',
    contract_details: '',
    // Retailer Fields
    business_name: '',
    tax_id: '',
    headquarters_address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await response.json();
      
      if (response.ok) {
        navigate('/login');
      } else {
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Server error. Ensure the backend is running on port 5000.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center font-['Poppins'] p-4 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
          <p className="text-sm text-gray-500">Join the BESS-PAS Supply Chain System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* --- COMMON CREDENTIALS --- */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
            <input 
              type="email" 
              id="email" 
              required 
              onChange={handleChange}
              placeholder="name@example.com"
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-gray-50 focus:bg-white" 
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            
            {/* PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  id="password" 
                  required 
                  onChange={handleChange}
                  placeholder="Password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-gray-50 focus:bg-white pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* CONFIRM PASSWORD FIELD */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm</label>
              <div className="relative">
                <input 
                  type={showConfirmPassword ? "text" : "password"} 
                  id="confirmPassword" 
                  required 
                  onChange={handleChange}
                  placeholder="Repeat Password"
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-gray-50 focus:bg-white pr-10" 
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {showConfirmPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* --- ROLE SELECTOR --- */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">I am a...</label>
            <select 
              value={role} 
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 bg-gray-50 focus:bg-white outline-none cursor-pointer"
            >
              <option value="Customer">Customer</option>
              <option value="Manufacturer">Manufacturer</option>
              <option value="Retailer">Retailer</option>
            </select>
          </div>

          {/* --- ROLE SPECIFIC FIELDS --- */}
          
          {/* 1. CUSTOMER FIELDS */}
          {role === 'Customer' && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Customer Profile</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">First Name</label>
                  <input type="text" id="first_name" required onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Last Name</label>
                  <input type="text" id="last_name" required onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" id="phone_number" onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
              </div>
            </div>
          )}

          {/* 2. MANUFACTURER FIELDS */}
          {role === 'Manufacturer' && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Manufacturer Profile</h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Company Name</label>
                <input type="text" id="company_name" required onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">License Number</label>
                <input type="text" id="license_number" required onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Contract Details</label>
                <textarea id="contract_details" rows="2" onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"></textarea>
              </div>
            </div>
          )}

          {/* 3. RETAILER FIELDS */}
          {role === 'Retailer' && (
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3 animate-fade-in">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">Retailer Profile</h3>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label>
                <input type="text" id="business_name" required onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tax ID</label>
                <input type="text" id="tax_id" required onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Headquarters Address</label>
                <textarea id="headquarters_address" required rows="2" onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-lg focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-sm"></textarea>
              </div>
            </div>
          )}

          <button 
            type="submit" 
            className="w-full bg-emerald-500 text-white py-3.5 rounded-lg text-sm font-semibold hover:bg-emerald-600 active:bg-emerald-700 transition-all duration-200 mt-4 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            Complete Registration
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-gray-100 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="text-emerald-600 font-semibold hover:text-emerald-700 hover:underline transition-colors">
            Log in
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;