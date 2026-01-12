import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, ShoppingCart, ShieldCheck, MapPin, Package, Loader2 } from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';

const ProductDetails = () => {
  const { id } = useParams(); // Gets the inventory_id from URL
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await axios.get(`${API_BASE}/public/products/${id}`);
        setProduct(response.data.product);
      } catch (error) {
        console.error("Error fetching product details", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  // Handle Add to Cart (using localStorage as per your LandingPage logic)
  const handleAddToCart = () => {
    const savedCart = localStorage.getItem('shopping_cart');
    let cart = savedCart ? JSON.parse(savedCart) : [];
    
    // Check if item exists in cart
    const existing = cart.find(item => item.inventory_id === product.inventory_id);
    
    if (existing) {
      cart = cart.map(item => 
        item.inventory_id === product.inventory_id 
        ? { ...item, quantity: item.quantity + 1 } 
        : item
      );
    } else {
      cart.push({
        inventory_id: product.inventory_id,
        product_def_id: product.product_def_id,
        name: product.name,
        price: product.base_price,
        quantity: 1,
        image_url: product.image_url,
        category: product.category,
        manufacturer: product.manufacturer_name,
        retailer: product.retailer_name,
        stock: product.stock,
        outlet_id: product.outlet_id // Ensure outlet_id is tracked
      });
    }
    
    localStorage.setItem('shopping_cart', JSON.stringify(cart));
    // Navigate back to landing page to show cart
    navigate('/'); 
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <h2 className="text-xl font-bold text-slate-700">Product not found</h2>
        <button onClick={() => navigate('/')} className="mt-4 text-emerald-600 hover:underline">
          Return Home
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-600 hover:text-emerald-600 mb-6 transition font-medium"
        >
          <ArrowLeft className="w-5 h-5" /> Back to Products
        </button>

        <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200 grid grid-cols-1 md:grid-cols-2">
          {/* Image Section */}
          <div className="bg-slate-100 flex items-center justify-center p-8 border-r border-slate-100">
             {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="max-w-full max-h-[500px] object-contain shadow-lg rounded-lg" 
                />
             ) : (
                <div className="flex flex-col items-center text-slate-400">
                  <Package className="w-32 h-32 mb-4" />
                  <span>No Image Available</span>
                </div>
             )}
          </div>

          {/* Details Section */}
          <div className="p-8 md:p-12">
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
              <ShieldCheck className="w-4 h-4" /> Supply Chain Verified
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-2">{product.name}</h1>
            
            <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500 mb-6">
               <span className="font-medium text-emerald-600">Mfr: {product.manufacturer_name}</span>
               <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full"></span>
               <span>Category: {product.category}</span>
               <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full"></span>
               <span>License: {product.license_number}</span>
            </div>

            <p className="text-slate-600 leading-relaxed mb-8 text-lg">
              {product.description || "No description provided."}
            </p>

            {/* Purchasing Card */}
            <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
               <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-slate-500 mb-1">Retail Price</p>
                    <p className="text-4xl font-bold text-slate-900">${parseFloat(product.base_price).toFixed(2)}</p>
                  </div>
                  <div className={`text-right ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <p className="font-bold text-lg">{product.stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                    <p className="text-sm">{product.stock} units available</p>
                  </div>
               </div>
               
               <div className="border-t border-slate-200 pt-4 mt-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-slate-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-slate-700">Sold by {product.retailer_name}</p>
                      <p className="text-xs text-slate-500 mt-1">{product.store_location} ({product.location_name})</p>
                    </div>
                  </div>
               </div>
            </div>

            <button 
              onClick={handleAddToCart}
              disabled={!product.stock || product.stock <= 0}
              className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-200"
            >
              <ShoppingCart className="w-6 h-6" />
              {product.stock > 0 ? 'Add to Cart' : 'Currently Unavailable'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;