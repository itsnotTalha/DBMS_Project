import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Lock } from 'lucide-react';

const SimpleAuthLayout = () => {
  return (
    <div className="min-h-screen bg-slate-50 relative">
      <div className="relative top-0 left-0 right-0 p-4 flex justify-center z-10 bg-white shadow-md">
        <Link to="/" className="flex items-center gap-2 group">
          <div className="bg-emerald-500 p-1.5 rounded-lg group-hover:bg-emerald-600 transition-colors">
            <Lock className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-bold bg-clip-text text-emerald-500 bg-gradient-to-r from-emerald-600 to-blue-600">
            BESS-PAS
          </span>
        </Link>
      </div>
      <Outlet />
    </div>
  );
};

export default SimpleAuthLayout;