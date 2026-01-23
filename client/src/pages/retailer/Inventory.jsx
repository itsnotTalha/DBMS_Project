import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Archive, Search, Package, MapPin, AlertTriangle, X, Info, QrCode, Calendar, Hash, ChevronDown, ChevronUp } from 'lucide-react';
import { retailerMenuItems } from './menu';
import { API_RETAILER } from '../../config/api';

const API_BASE = API_RETAILER;

const Inventory = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Retailer') {
      alert('Access Denied');
      navigate('/login');
      return;
    }

    setUser(parsedUser);

    const fetchInventory = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/inventory`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setInventory(response.data.inventory || []);
      } catch (err) {
        console.error('Error fetching inventory:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, [navigate]);

  const filteredInventory = inventory.filter(item =>
    item.productName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStockStatus = (qty) => {
    if (qty === 0) return { label: 'Out of Stock', color: 'bg-red-100 text-red-600' };
    if (qty < 10) return { label: 'Low Stock', color: 'bg-yellow-100 text-yellow-600' };
    return { label: 'In Stock', color: 'bg-green-100 text-green-600' };
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={retailerMenuItems}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <Archive className="text-blue-500" /> Inventory
            </h2>
            <p className="text-sm text-slate-400">View and manage your product inventory</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-3 text-slate-400" />
              <input
                className="pl-9 pr-4 py-2 bg-white border rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 w-64"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Products</p>
            <p className="text-2xl font-black">{inventory.length}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Units</p>
            <p className="text-2xl font-black">
              {inventory.reduce((sum, item) => sum + (item.quantity_on_hand || 0), 0)}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Low Stock Items</p>
            <p className="text-2xl font-black text-yellow-600">
              {inventory.filter(item => item.quantity_on_hand > 0 && item.quantity_on_hand < 10).length}
            </p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Value</p>
            <p className="text-2xl font-black text-emerald-600">
              ${inventory.reduce((sum, item) => sum + ((item.quantity_on_hand || 0) * (item.base_price || 0)), 0).toFixed(2)}
            </p>
          </div>
        </div>

        {/* Inventory Grid */}
        {filteredInventory.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredInventory.map((item, i) => {
              const status = getStockStatus(item.quantity_on_hand);
              return (
                <div
                  key={i}
                  onClick={() => setSelectedItem(item)}
                  className="bg-white rounded-2xl border shadow-sm hover:shadow-lg transition-all cursor-pointer overflow-hidden group"
                >
                  {/* Product Image Placeholder */}
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center relative">
                    <Package size={48} className="text-blue-300" />
                    <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${status.color}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="p-4">
                    <h4 className="font-bold text-slate-900 truncate">{item.productName}</h4>
                    <p className="text-xs text-slate-400 mb-3">{item.category || 'Uncategorized'}</p>

                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400">Quantity</p>
                        <p className="text-lg font-black">{item.quantity_on_hand}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-400">Price</p>
                        <p className="text-lg font-bold text-emerald-600">${parseFloat(item.base_price).toFixed(2)}</p>
                      </div>
                    </div>

                    {item.aisle && (
                      <div className="mt-3 flex items-center gap-1 text-xs text-slate-500">
                        <MapPin size={12} />
                        {item.aisle} / {item.shelf} / {item.section}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border shadow-sm p-12 text-center">
            <Archive size={48} className="mx-auto mb-4 text-slate-300" />
            <p className="text-slate-400">No inventory items found</p>
            <p className="text-sm text-slate-300 mt-2">Products will appear here after manufacturer delivers orders</p>
          </div>
        )}

        {/* Detail Modal */}
        {selectedItem && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-xl font-black">{selectedItem.productName}</h3>
                    <p className="text-slate-400">{selectedItem.category || 'Uncategorized'}</p>
                  </div>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Stock Status */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Package size={16} className="text-blue-500" /> Stock Information
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Quantity on Hand</p>
                        <p className="text-2xl font-black">{selectedItem.quantity_on_hand}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Base Price</p>
                        <p className="text-2xl font-black text-emerald-600">
                          ${parseFloat(selectedItem.base_price).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Stock Value</p>
                        <p className="font-bold">
                          ${((selectedItem.quantity_on_hand || 0) * (selectedItem.base_price || 0)).toFixed(2)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Status</p>
                        <span className={`px-2 py-1 text-xs font-bold rounded-full ${getStockStatus(selectedItem.quantity_on_hand).color}`}>
                          {getStockStatus(selectedItem.quantity_on_hand).label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <MapPin size={16} className="text-purple-500" /> Location
                    </h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs text-slate-400">Aisle</p>
                        <p className="font-bold">{selectedItem.aisle || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Shelf</p>
                        <p className="font-bold">{selectedItem.shelf || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Section</p>
                        <p className="font-bold">{selectedItem.section || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-slate-50 rounded-xl p-4">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <Info size={16} className="text-blue-500" /> Additional Info
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Product ID</span>
                        <span className="font-mono text-sm">{selectedItem.product_def_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Inventory ID</span>
                        <span className="font-mono text-sm">{selectedItem.inventory_id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Manufacturer</span>
                        <span className="text-sm">{selectedItem.manufacturer_name || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400 text-sm">Last Updated</span>
                        <span className="text-sm">
                          {selectedItem.last_updated 
                            ? new Date(selectedItem.last_updated).toLocaleString() 
                            : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Batches Information */}
                  {selectedItem.batches && selectedItem.batches.length > 0 && (
                    <div className="bg-blue-50 rounded-xl p-4">
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <Hash size={16} className="text-blue-500" /> Batch Information
                      </h4>
                      <div className="space-y-3">
                        {selectedItem.batches.map((batch, idx) => (
                          <div key={batch.batch_id} className="bg-white rounded-lg p-3 border border-blue-100">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-mono font-bold text-blue-700">{batch.batch_number}</span>
                              <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${batch.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-600'}`}>
                                {batch.status}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-slate-400">Mfg Date: </span>
                                <span>{new Date(batch.manufacturing_date).toLocaleDateString()}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Expiry: </span>
                                <span className={new Date(batch.expiry_date) < new Date() ? 'text-red-600 font-bold' : ''}>
                                  {new Date(batch.expiry_date).toLocaleDateString()}
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-400">Total Items: </span>
                                <span>{batch.total_items}</span>
                              </div>
                              <div>
                                <span className="text-slate-400">Available: </span>
                                <span className="text-green-600 font-bold">{batch.available_items || 0}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Serial Codes for Verification */}
                  {selectedItem.serial_codes && selectedItem.serial_codes.length > 0 && (
                    <div className="bg-emerald-50 rounded-xl p-4">
                      <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                        <QrCode size={16} className="text-emerald-500" /> Serial Codes (for verification)
                      </h4>
                      <p className="text-xs text-slate-500 mb-3">These serial codes can be used by customers to verify product authenticity</p>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {selectedItem.serial_codes.map((item, idx) => (
                          <div key={item.item_id} className="bg-white rounded-lg p-2 border border-emerald-100 flex justify-between items-center">
                            <div>
                              <span className="font-mono text-sm font-bold text-emerald-700">{item.serial_code}</span>
                              <p className="text-xs text-slate-400">Batch: {item.batch_number}</p>
                            </div>
                            <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-green-100 text-green-700">
                              {item.status?.replace('_', ' ')}
                            </span>
                          </div>
                        ))}
                      </div>
                      {selectedItem.serial_codes.length >= 50 && (
                        <p className="text-xs text-slate-400 mt-2 text-center">Showing first 50 serial codes</p>
                      )}
                    </div>
                  )}

                  {/* Low Stock Warning */}
                  {selectedItem.quantity_on_hand < 10 && selectedItem.quantity_on_hand > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertTriangle size={20} className="text-yellow-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-yellow-800">Low Stock Warning</p>
                        <p className="text-sm text-yellow-600">
                          Consider reordering this product from the manufacturer.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    onClick={() => navigate('/retailer/orders')}
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-bold transition-colors"
                  >
                    Reorder Product
                  </button>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 py-3 rounded-xl font-bold transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Inventory;
