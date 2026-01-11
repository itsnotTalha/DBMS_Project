import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { ShieldCheck, Search, Download, Hash, Clock } from 'lucide-react';
import { manufacturerMenuItems } from './menu';

const API_BASE = 'http://localhost:5000/api/manufacturer';

const LedgerAudit = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ total_transactions: 0, verified_blocks: 0, integrity_score: 100 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const storedUser = localStorage.getItem('user') || sessionStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'Manufacturer') {
      alert('Access Denied');
      navigate('/login');
      return;
    }

    setUser(parsedUser);

    const fetchLedger = async () => {
      try {
        const token = localStorage.getItem('token') || sessionStorage.getItem('token');
        const response = await axios.get(`${API_BASE}/ledger`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setTransactions(response.data.transactions || []);
        setStats(response.data.stats || { total_transactions: 0, verified_blocks: 0, integrity_score: 100 });
      } catch (err) {
        console.error('Error fetching ledger:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [navigate]);

  const filteredTransactions = transactions.filter(tx =>
    tx.serial_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.batch_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.current_hash?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tx.product_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    switch (action?.toLowerCase()) {
      case 'manufactured': return 'bg-emerald-100 text-emerald-600';
      case 'shipped': return 'bg-blue-100 text-blue-600';
      case 'received': return 'bg-purple-100 text-purple-600';
      case 'sold': return 'bg-green-100 text-green-600';
      case 'recalled': return 'bg-red-100 text-red-600';
      default: return 'bg-slate-100 text-slate-600';
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user} menuItems={manufacturerMenuItems}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" /> Ledger Audit
            </h2>
            <p className="text-sm text-slate-400">Blockchain-style transaction history</p>
          </div>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow">
            <Download size={18} /> Export Ledger
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Total Transactions</p>
            <p className="text-3xl font-black">{stats.total_transactions}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Verified Blocks</p>
            <p className="text-3xl font-black">{stats.verified_blocks}</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Integrity Score</p>
            <p className="text-3xl font-black text-emerald-500">{stats.integrity_score}%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Search by hash, batch, serial code, or product..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {filteredTransactions.length ? (
              filteredTransactions.map((tx, i) => (
                <div key={i} className="border-l-4 border-emerald-500 pl-6 pb-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg flex items-center gap-2">
                          {tx.product_name}
                          <span className={`px-2 py-0.5 text-xs font-bold rounded ${getActionColor(tx.action)}`}>
                            {tx.action}
                          </span>
                        </h4>
                        <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                          <Clock size={12} />
                          {new Date(tx.created_at).toLocaleString()}
                          {tx.location && <span className="text-slate-400">• {tx.location}</span>}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">
                        Verified
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Serial Code</p>
                        <p className="font-mono text-xs bg-white p-2 rounded border truncate">
                          {tx.serial_code}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Batch Number</p>
                        <p className="font-mono text-xs bg-white p-2 rounded border">
                          {tx.batch_number}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Transaction ID</p>
                        <p className="font-mono text-xs bg-white p-2 rounded border">
                          #{tx.tx_id}
                        </p>
                      </div>
                    </div>

                    <div className="mt-4">
                      <p className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                        <Hash size={12} /> Current Hash
                      </p>
                      <p className="font-mono text-[10px] bg-white p-2 rounded border text-slate-600 break-all">
                        {tx.current_hash}
                      </p>
                    </div>

                    {tx.previous_hash && tx.previous_hash !== '0'.repeat(64) && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-400 mb-1">Previous Hash</p>
                        <p className="font-mono text-[10px] bg-white p-2 rounded border text-slate-400 break-all">
                          {tx.previous_hash}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <ShieldCheck size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No ledger entries found</p>
                <p className="text-xs mt-2">Create production batches to generate transaction records</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LedgerAudit;
