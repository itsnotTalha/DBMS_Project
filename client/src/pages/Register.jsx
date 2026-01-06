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
        alert('Registration Successful!');
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
    <div className="flex w-full min-h-screen bg-white font-['Poppins']">
      
      {/* --- LEFT SIDE: FORM --- */}
      <div className="w-full flex items-center justify-center lg:w-1/2 overflow-y-auto">
        <div className="w-full max-w-md px-8 py-10">
          
          <div className="mb-8">
            <h1 className="text-3xl font-semibold text-gray-900 mb-2">Create Account</h1>
            <p className="text-sm text-gray-500">Join the Amanah Supply Chain System</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- COMMON CREDENTIALS --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">Email Address</label>
              <input 
                type="email" 
                id="email" 
                required 
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-[#3A5B22] focus:ring-1 focus:ring-[#3A5B22] outline-none transition" 
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Password</label>
                <input 
                  type="password" 
                  id="password" 
                  required 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-[#3A5B22] focus:ring-1 focus:ring-[#3A5B22] outline-none transition" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-1">Confirm</label>
                <input 
                  type="password" 
                  id="confirmPassword" 
                  required 
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-[#3A5B22] focus:ring-1 focus:ring-[#3A5B22] outline-none transition" 
                />
              </div>
            </div>

            {/* --- ROLE SELECTOR --- */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1">I am a...</label>
              <select 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 text-sm focus:border-[#3A5B22] focus:ring-1 focus:ring-[#3A5B22] bg-white outline-none cursor-pointer"
              >
                <option value="Customer">Customer</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Retailer">Retailer</option>
              </select>
            </div>

            {/* --- ROLE SPECIFIC FIELDS --- */}
            
            {/* 1. CUSTOMER FIELDS */}
            {role === 'Customer' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 animate-fade-in">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Customer Profile</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <input type="text" id="first_name" required onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <input type="text" id="last_name" required onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <input type="text" id="phone_number" onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none" />
                </div>
              </div>
            )}

            {/* 2. MANUFACTURER FIELDS */}
            {role === 'Manufacturer' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 animate-fade-in">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Manufacturer Profile</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Company Name</label>
                  <input type="text" id="company_name" required onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">License Number</label>
                  <input type="text" id="license_number" required onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contract Details</label>
                  <textarea id="contract_details" rows="2" onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none"></textarea>
                </div>
              </div>
            )}

            {/* 3. RETAILER FIELDS */}
            {role === 'Retailer' && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-3 animate-fade-in">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Retailer Profile</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Business Name</label>
                  <input type="text" id="business_name" required onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Tax ID</label>
                  <input type="text" id="tax_id" required onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Headquarters Address</label>
                  <textarea id="headquarters_address" required rows="2" onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:border-[#3A5B22] outline-none"></textarea>
                </div>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full bg-[#3A5B22] text-white py-3.5 rounded-lg text-sm font-medium hover:opacity-90 transition duration-200 mt-4 shadow-sm"
            >
              Complete Registration
            </button>
          </form>

          {/* Footer Linked to Login Page */}
          <div className="mt-6 text-center text-sm text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-700 font-semibold hover:underline">
              Log in
            </Link>
          </div>
        </div>
      </div>

      {/* --- RIGHT SIDE: IMAGE --- */}
      <div className="hidden lg:flex w-1/2 p-6 bg-gray-50 items-center justify-center">
        <div className="w-full h-full rounded-[40px] overflow-hidden relative shadow-lg">
          <img 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
            alt="Supply Chain Warehouse" 
            className="absolute inset-0 w-full h-full object-cover" 
          />
        </div>
      </div>
    </div>
  );
};

export default Register;