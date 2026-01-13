import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { Truck, ArrowDownLeft, ArrowUpRight, Package, Clock, MapPin, CheckCircle } from 'lucide-react';
import { retailerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api/retailer';

const Shipments = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [shipments, setShipments] = useState({ incoming: [], outgoing: [], all: [] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  const fetchShipments = async () => {
    try {
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      const response = await axios.get(`${API_BASE}/shipments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setShipments(response.data);
    } catch (err) {
      console.error('Error fetching shipments:', err);
    }
  };

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
    fetchShipments().finally(() => setLoading(false));
  }, [navigate]);

  const handleConfirmDelivery = async (shipmentId) => {
    console.log('[Shipments] handleConfirmDelivery called with shipmentId:', shipmentId);
    
    if (!window.confirm('Confirm that you have received this shipment? This will add items to your inventory.')) {
      return;
    }
    
    try {
      setProcessingId(shipmentId);
      const token = localStorage.getItem('token') || sessionStorage.getItem('token');
      console.log('[Shipments] Calling API:', `${API_BASE}/shipments/${shipmentId}/confirm`);
      
      const response = await axios.post(
        `${API_BASE}/shipments/${shipmentId}/confirm`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('[Shipments] API response:', response.data);
      
      alert('Delivery confirmed! Items have been added to your inventory.');
      fetchShipments();
    } catch (err) {
      console.error('[Shipments] Error:', err.response?.data || err.message);
      alert('Error confirming delivery: ' + (err.response?.data?.error || err.message));
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': case 'completed': return 'bg-green-100 text-green-600';
      case 'shipped': case 'in_transit': case 'dispatched': return 'bg-blue-100 text-blue-600';
      case 'pending': case 'processing': return 'bg-yellow-100 text-yellow-600';
      case 'approved': return 'bg-purple-100 text-purple-600';
      case 'cancelled': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  const getDisplayList = () => {
    if (activeTab === 'incoming') return shipments.incoming || [];
    if (activeTab === 'outgoing') return shipments.outgoing || [];
    return shipments.all || [];
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
              <Truck className="text-blue-500" /> Shipments
            </h2>
            <p className="text-sm text-slate-400">Track all incoming and outgoing deliveries</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Total Shipments</p>
            <p className="text-2xl font-black">{shipments.all?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Incoming (B2B)</p>
            <p className="text-2xl font-black text-blue-600">{shipments.incoming?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">Outgoing (Customer)</p>
            <p className="text-2xl font-black text-purple-600">{shipments.outgoing?.length || 0}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <p className="text-xs text-slate-400 uppercase font-bold">In Transit</p>
            <p className="text-2xl font-black text-yellow-600">
              {shipments.all?.filter(s => ['Shipped', 'In_Transit', 'Dispatched'].includes(s.status)).length || 0}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['all', 'incoming', 'outgoing'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${
                activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-white border hover:bg-slate-50'
              }`}
            >
              {tab === 'all' ? 'All Shipments' : tab === 'incoming' ? 'From Manufacturers' : 'To Customers'}
            </button>
          ))}
        </div>

        {/* Shipments List */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {getDisplayList().length > 0 ? (
            <div className="divide-y">
              {getDisplayList().map((shipment, i) => (
                <div key={i} className="p-6 hover:bg-slate-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`p-3 rounded-xl ${
                        shipment.direction === 'incoming' 
                          ? 'bg-blue-100' 
                          : 'bg-purple-100'
                      }`}>
                        {shipment.direction === 'incoming' ? (
                          <ArrowDownLeft size={24} className="text-blue-600" />
                        ) : (
                          <ArrowUpRight size={24} className="text-purple-600" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold">{shipment.entity_name}</h4>
                          <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                            shipment.direction === 'incoming' 
                              ? 'bg-blue-100 text-blue-600' 
                              : 'bg-purple-100 text-purple-600'
                          }`}>
                            {shipment.entity_type}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-slate-500">
                          <span className="flex items-center gap-1">
                            <Clock size={14} />
                            {new Date(shipment.order_date).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Package size={14} />
                            {shipment.item_count} items
                          </span>
                          {shipment.tracking_number && (
                            <span className="font-mono text-xs">
                              #{shipment.tracking_number}
                            </span>
                          )}
                        </div>
                        {shipment.current_location && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-2">
                            <MapPin size={12} />
                            {shipment.current_location}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 text-xs font-bold rounded-full ${getStatusColor(shipment.status)}`}>
                        {shipment.status?.replace('_', ' ')}
                      </span>
                      <p className="text-lg font-black mt-2">
                        ${parseFloat(shipment.total_amount || 0).toFixed(2)}
                      </p>
                      {shipment.estimated_arrival && (
                        <p className="text-xs text-slate-400 mt-1">
                          ETA: {new Date(shipment.estimated_arrival).toLocaleDateString()}
                        </p>
                      )}
                      {/* Confirm Delivery button for shipped incoming orders */}
                      {shipment.direction === 'incoming' && shipment.status === 'Shipped' && (
                        <button
                          onClick={() => handleConfirmDelivery(shipment.shipment_id)}
                          disabled={processingId === shipment.shipment_id}
                          className="mt-3 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-lg flex items-center gap-2 disabled:opacity-50 ml-auto"
                        >
                          <CheckCircle size={14} />
                          {processingId === shipment.shipment_id ? 'Processing...' : 'Confirm Delivery'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center">
              <Truck size={48} className="mx-auto mb-4 text-slate-300" />
              <p className="text-slate-400">No shipments found</p>
              <p className="text-sm text-slate-300 mt-2">Shipments will appear here after you place orders</p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Shipments;
