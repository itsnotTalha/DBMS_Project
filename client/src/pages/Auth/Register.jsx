import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const navigate = useNavigate();

  // 1. Role State (Default to Customer)
  const [role, setRole] = useState('Customer');

  // 2. Form Data State (Includes all possible fields from your schema)
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
    
    // Basic Validation
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      // Connects to your backend route defined in authRoutes.js
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, role }),
      });

      const data = await response.json();
      
      if (response.ok) {
        // Redirect to login page using React Router
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
    // Centered layout container
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
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                id="password" 
                required 
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-gray-50 focus:bg-white" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Confirm</label>
              <input 
                type="password" 
                id="confirmPassword" 
                required 
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition bg-gray-50 focus:bg-white" 
              />
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

        {/* Footer Linked to Login Page */}
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