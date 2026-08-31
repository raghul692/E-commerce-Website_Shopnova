import React, { useEffect, useState } from 'react';
import { ShieldCheck, Users, Store, DollarSign, Activity, Lock, Check, Ban } from 'lucide-react';
import { apiRequest } from '../services/api.ts';

interface AdminProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AdminDashboardPage: React.FC<AdminProps> = ({ onNavigate }) => {
  const [kpis, setKpis] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [sellers, setSellers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'kpis' | 'users' | 'sellers' | 'audit'>('kpis');

  useEffect(() => {
    async function loadAdminData() {
      try {
        const [dashRes, userRes, sellerRes, auditRes] = await Promise.all([
          apiRequest('/admin/dashboard'),
          apiRequest('/admin/users'),
          apiRequest('/admin/sellers'),
          apiRequest('/admin/audit-logs')
        ]);

        if (dashRes.success) setKpis(dashRes.kpis);
        if (userRes.success) setUsers(userRes.users || []);
        if (sellerRes.success) setSellers(sellerRes.sellers || []);
        if (auditRes.success) setAuditLogs(auditRes.logs || []);
      } catch (e) {
        console.warn('Admin load error:', e);
      }
    }
    loadAdminData();
  }, []);

  const handleUserStatusToggle = async (userId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      const res = await apiRequest(`/admin/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: nextStatus })
      });
      if (res.success) {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: nextStatus } : u));
      }
    } catch (e: any) {
      alert(e.message || 'Status toggle failed.');
    }
  };

  const handleSellerApproval = async (sellerId: string, isApproved: boolean) => {
    try {
      const res = await apiRequest(`/admin/sellers/${sellerId}/approve`, {
        method: 'PATCH',
        body: JSON.stringify({ isApproved })
      });
      if (res.success) {
        setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, isApproved } : s));
      }
    } catch (e: any) {
      alert(e.message || 'Approval action failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="px-3 py-1 bg-purple-500/20 text-purple-400 font-extrabold text-xs uppercase tracking-wider rounded-full">
            ADMIN CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Ecosystem Governance & Analytics</h1>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl text-xs font-bold">
          <button 
            onClick={() => setActiveTab('kpis')}
            className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'kpis' ? 'bg-purple-600 text-white shadow' : 'text-slate-500'}`}
          >
            Analytics
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'users' ? 'bg-purple-600 text-white shadow' : 'text-slate-500'}`}
          >
            Users ({users.length})
          </button>
          <button 
            onClick={() => setActiveTab('sellers')}
            className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'sellers' ? 'bg-purple-600 text-white shadow' : 'text-slate-500'}`}
          >
            Sellers ({sellers.length})
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 rounded-xl transition-all ${activeTab === 'audit' ? 'bg-purple-600 text-white shadow' : 'text-slate-500'}`}
          >
            Audit Logs
          </button>
        </div>
      </div>

      {/* 1. KPIs Tab */}
      {activeTab === 'kpis' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase">Gross Platform GMV</span>
              <p className="text-2xl font-black text-emerald-500">₹{(kpis?.totalRevenue || 4895000).toLocaleString('en-IN')}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase">Total Orders</span>
              <p className="text-2xl font-black text-blue-500">{kpis?.totalOrders || 342}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase">Registered Customers</span>
              <p className="text-2xl font-black text-purple-400">{kpis?.totalUsers || users.length}</p>
            </div>

            <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
              <span className="text-xs text-slate-400 font-bold uppercase">Average Order Value</span>
              <p className="text-2xl font-black text-amber-500">₹{(kpis?.averageOrderValue || 14312).toLocaleString('en-IN')}</p>
            </div>
          </div>
        </div>
      )}

      {/* 2. User Management Tab */}
      {activeTab === 'users' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">User Accounts Registry</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                <th className="pb-3">Name</th>
                <th className="pb-3">Email</th>
                <th className="pb-3">Role</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="py-3 text-slate-500">{u.email}</td>
                  <td className="py-3 font-mono font-bold text-blue-500">{u.role}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${u.status === 'ACTIVE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="py-3">
                    <button 
                      onClick={() => handleUserStatusToggle(u.id, u.status)}
                      className={`px-3 py-1 rounded text-xs font-bold ${u.status === 'ACTIVE' ? 'bg-rose-500/10 text-rose-500 hover:bg-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20'}`}
                    >
                      {u.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 3. Seller Approval Tab */}
      {activeTab === 'sellers' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm overflow-x-auto">
          <h3 className="text-lg font-black text-slate-900 dark:text-white mb-4">Seller Approval Queue</h3>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
                <th className="pb-3">Company / Store</th>
                <th className="pb-3">Owner Email</th>
                <th className="pb-3">Approval State</th>
                <th className="pb-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {sellers.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                  <td className="py-3 font-bold text-slate-900 dark:text-white">{s.storeName} ({s.companyName})</td>
                  <td className="py-3 text-slate-500">{s.user?.email}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded font-bold text-[10px] ${s.isApproved ? 'bg-emerald-500/20 text-emerald-500' : 'bg-amber-500/20 text-amber-500'}`}>
                      {s.isApproved ? 'APPROVED' : 'PENDING'}
                    </span>
                  </td>
                  <td className="py-3">
                    <button 
                      onClick={() => handleSellerApproval(s.id, !s.isApproved)}
                      className={`px-3 py-1 rounded text-xs font-bold ${s.isApproved ? 'bg-rose-500/10 text-rose-500' : 'bg-emerald-500/10 text-emerald-500'}`}
                    >
                      {s.isApproved ? 'Revoke Approval' : 'Approve Seller'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 4. Audit Log Tab */}
      {activeTab === 'audit' && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-3">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">Security & System Audit Log</h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-2.5 flex justify-between">
                <span className="text-purple-400 font-bold">[{log.action}]</span>
                <span className="text-slate-400">{log.details}</span>
                <span className="text-slate-500">{new Date(log.createdAt).toLocaleTimeString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
