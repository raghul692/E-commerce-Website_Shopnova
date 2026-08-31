import React, { useState } from 'react';
import { User, Lock, Mail, Phone, ShieldCheck, Store, UserCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';

interface AuthProps {
  onNavigate: (view: string, param?: any) => void;
}

export const AuthPages: React.FC<AuthProps> = ({ onNavigate }) => {
  const { login, register, loginAsCustomer, loginAsSeller, loginAsAdmin } = useAuth();

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<'CUSTOMER' | 'SELLER'>('CUSTOMER');
  const [companyName, setCompanyName] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register({ email, password, name, phone, role, companyName });
      }
      onNavigate('home');
    } catch (err: any) {
      setError(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12 space-y-6">
      {/* Brand Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-black text-2xl text-white mx-auto shadow-xl shadow-blue-500/30">
          S
        </div>
        <h1 className="text-2xl font-black text-slate-900 dark:text-white">
          {mode === 'login' ? 'Sign In to SHOPNOVA' : 'Create Your Account'}
        </h1>
        <p className="text-xs text-slate-500">
          {mode === 'login' ? 'Access your orders, wishlist, and recommendations' : 'Join India’s premier omnichannel tech marketplace'}
        </p>
      </div>

      {/* 1-Click Instant Demo Login Panel */}
      <div className="p-4 bg-slate-900 text-white rounded-3xl space-y-2 border border-slate-800 shadow-xl">
        <span className="block text-[10px] font-extrabold uppercase tracking-wider text-blue-400 text-center">
          🚀 Instant 1-Click Evaluation Login
        </span>
        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          <button 
            onClick={async () => { await loginAsCustomer(); onNavigate('home'); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-center flex flex-col items-center gap-1 border border-slate-700"
          >
            <UserCheck className="w-4 h-4 text-blue-400" />
            <span className="text-[10px]">Customer</span>
          </button>
          <button 
            onClick={async () => { await loginAsSeller(); onNavigate('seller-dashboard'); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 rounded-xl text-center flex flex-col items-center gap-1 border border-slate-700"
          >
            <Store className="w-4 h-4 text-emerald-400" />
            <span className="text-[10px]">Seller</span>
          </button>
          <button 
            onClick={async () => { await loginAsAdmin(); onNavigate('admin-dashboard'); }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-purple-400 rounded-xl text-center flex flex-col items-center gap-1 border border-slate-700"
          >
            <ShieldCheck className="w-4 h-4 text-purple-400" />
            <span className="text-[10px]">Admin</span>
          </button>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
        {error && (
          <div className="p-3 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-xl text-xs font-bold text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          {mode === 'register' && (
            <>
              <div>
                <label className="block font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Rahul Sharma"
                  className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Mobile Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl font-mono"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Register As</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('CUSTOMER')}
                    className={`py-2 rounded-xl font-bold border ${role === 'CUSTOMER' ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    Customer
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('SELLER')}
                    className={`py-2 rounded-xl font-bold border ${role === 'SELLER' ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}
                  >
                    Seller Merchant
                  </button>
                </div>
              </div>

              {role === 'SELLER' && (
                <div>
                  <label className="block font-bold mb-1">Company / Store Name</label>
                  <input
                    type="text"
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Nexus Electronics Pvt Ltd"
                    className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                  />
                </div>
              )}
            </>
          )}

          <div>
            <label className="block font-bold mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="customer@example.com"
              className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
            />
          </div>

          <div>
            <label className="block font-bold mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
            />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-2xl text-xs shadow-lg shadow-blue-500/30 transition-all uppercase tracking-wider"
          >
            {loading ? 'Authenticating...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-200 dark:border-slate-800 text-xs">
          {mode === 'login' ? (
            <p className="text-slate-500">
              Don't have an account?{' '}
              <button onClick={() => setMode('register')} className="text-blue-500 font-bold hover:underline">
                Create one now
              </button>
            </p>
          ) : (
            <p className="text-slate-500">
              Already registered?{' '}
              <button onClick={() => setMode('login')} className="text-blue-500 font-bold hover:underline">
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
