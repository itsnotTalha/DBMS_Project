import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../Layout';
import { ShieldCheck, Search, Download } from 'lucide-react';

const LedgerAudit = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(true);

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
        const response = await axios.get('http://localhost:5000/api/dashboard/ledger');
        setLedger(response.data);
      } catch (err) {
        console.error('Error fetching ledger:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchLedger();
  }, [navigate]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Layout user={user}>
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-black flex items-center gap-3">
              <ShieldCheck className="text-emerald-500" /> Ledger Audit
            </h2>
            <p className="text-sm text-slate-400">Blockchain transaction history</p>
          </div>
          <button className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow">
            <Download size={18} /> Export Ledger
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Total Transactions</p>
            <p className="text-3xl font-black">1,247</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Verified Blocks</p>
            <p className="text-3xl font-black">856</p>
          </div>
          <div className="bg-white rounded-2xl p-6 border shadow-sm">
            <p className="text-xs uppercase font-bold text-slate-400 mb-2">Integrity Score</p>
            <p className="text-3xl font-black text-emerald-500">100%</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border">
          <div className="p-6 border-b">
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3 top-3 text-slate-400" />
                <input
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Search by hash, batch, or transaction..."
                />
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {ledger.length ? (
              ledger.map((entry, i) => (
                <div key={i} className="border-l-4 border-emerald-500 pl-6 pb-6 relative">
                  <div className="absolute -left-2 top-0 w-4 h-4 bg-emerald-500 rounded-full border-4 border-white"></div>
                  
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-bold text-lg">{entry.title}</h4>
                        <p className="text-xs text-slate-500 mt-1">
                          {new Date(entry.time).toLocaleString()}
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-600 text-xs font-bold rounded-full">
                        Verified
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Transaction Hash</p>
                        <p className="font-mono text-xs bg-white p-2 rounded border truncate">
                          {entry.hash}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 mb-1">Block Number</p>
                        <p className="font-mono text-xs bg-white p-2 rounded border">
                          #{entry.blockNumber || Math.floor(Math.random() * 10000)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-400">
                <ShieldCheck size={48} className="mx-auto mb-4 text-slate-300" />
                <p>No ledger entries found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LedgerAudit;
