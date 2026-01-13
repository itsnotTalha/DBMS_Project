import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    base_price: '',
    image_url: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      // Ensure this endpoint matches your manufacturerRoutes.js configuration
      const response = await fetch('http://localhost:5000/api/manufacturer/create-product', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Failed to create product');

      alert('Product created successfully');
      navigate('/manufacturer/products');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Product</h2>
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit} className="max-w-lg bg-white p-6 rounded-lg shadow-md">
        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Product Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Description</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Category</label>
          <input 
            type="text" 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Base Price</label>
          <input 
            type="number" 
            name="base_price" 
            value={formData.base_price} 
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
            step="0.01" 
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block text-gray-700 font-bold mb-2">Image URL</label>
          <input 
            type="text" 
            name="image_url" 
            value={formData.image_url} 
            onChange={handleChange} 
            className="w-full border p-2 rounded" 
          />
        </div>

        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full">
          Create Product
        </button>
      </form>
    </div>
  );
}