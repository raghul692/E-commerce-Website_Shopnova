import React, { useEffect, useState } from 'react';
import { Package, Truck, Clock, CheckCircle2, XCircle, RotateCcw, User, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../services/api.ts';

interface CustomerDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const CustomerDashboard: React.FC<CustomerDashboardProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [returnModalOrderId, setReturnModalOrderId] = useState<string | null>(null);
  const [returnReason, setReturnReason] = useState('');

  useEffect(() => {
    async function loadOrders() {
      try {
        const res = await apiRequest('/orders');
        if (res.success) {
          setOrders(res.orders || []);
        }
      } catch (e) {
        console.warn('Orders fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    try {
      const res = await apiRequest(`/orders/${orderId}/cancel`, { method: 'POST' });
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      }
    } catch (e: any) {
      alert(e.message || 'Could not cancel order.');
    }
  };

  const handleReturnRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!returnModalOrderId) return;
    try {
      const res = await apiRequest(`/orders/${returnModalOrderId}/return`, {
        method: 'POST',
        body: JSON.stringify({ reason: returnReason })
      });
      if (res.success) {
        setOrders(prev => prev.map(o => o.id === returnModalOrderId ? { ...o, status: 'RETURN_REQUESTED' } : o));
        setReturnModalOrderId(null);
        setReturnReason('');
      }
    } catch (e: any) {
      alert(e.message || 'Could not submit return request.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Customer Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-slate-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
            alt="" 
            className="w-16 h-16 rounded-2xl object-cover ring-4 ring-blue-500" 
          />
          <div>
            <h1 className="text-2xl font-black text-white">{user?.name || 'Customer Account'}</h1>
            <p className="text-xs text-slate-400">{user?.email} • Member since 2026</p>
            <span className="inline-block mt-1 px-2.5 py-0.5 bg-blue-500/20 text-blue-400 rounded text-[10px] font-bold uppercase tracking-wider">
              {user?.role} ACCOUNT
            </span>
          </div>
        </div>

        <button 
          onClick={() => onNavigate('products')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg"
        >
          Browse Catalog
        </button>
      </div>

      {/* Orders List & Status Tracking Timeline */}
      <div className="space-y-6">
        <h2 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="w-5 h-5 text-blue-500" />
          <span>My Orders & Live Shipment Tracking</span>
        </h2>

        {loading ? (
          <div className="h-48 rounded-2xl skeleton-shimmer" />
        ) : orders.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6">
            <p className="text-xs text-slate-500">No orders placed yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const statusSteps = ['CONFIRMED', 'PACKED', 'SHIPPED', 'OUT_FOR_DELIVERY', 'DELIVERED'];
              const currentIdx = statusSteps.indexOf(order.status);

              return (
                <div key={order.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm">
                  {/* Order Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
                    <div>
                      <span className="text-slate-400 block">Order Number</span>
                      <strong className="font-mono text-slate-900 dark:text-white font-bold">{order.orderNumber}</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Date</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Amount</span>
                      <strong className="text-blue-500 font-extrabold text-sm">₹{order.totalAmount?.toLocaleString('en-IN')}</strong>
                    </div>
                    <div>
                      <span className={`px-2.5 py-1 rounded text-[10px] font-extrabold uppercase ${order.status === 'DELIVERED' ? 'bg-emerald-500/20 text-emerald-500' : order.status === 'CANCELLED' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-400'}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Status Timeline Bar */}
                  {order.status !== 'CANCELLED' && (
                    <div className="py-2">
                      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 mb-2">
                        <span>Confirmed</span>
                        <span>Packed</span>
                        <span>Shipped</span>
                        <span>Out for Delivery</span>
                        <span>Delivered</span>
                      </div>
                      <div className="h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden flex">
                        <div 
                          className="h-full bg-gradient-to-r from-blue-600 to-indigo-500 transition-all duration-500"
                          style={{ width: `${Math.max(20, ((currentIdx + 1) / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Order Items List */}
                  <div className="space-y-2 text-xs">
                    {order.items?.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-200">{item.quantity}x {item.title}</span>
                        <span className="font-bold">₹{item.totalAmount?.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>

                  {/* Action Controls */}
                  <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                    {['PENDING', 'CONFIRMED', 'PROCESSING'].includes(order.status) && (
                      <button 
                        onClick={() => handleCancelOrder(order.id)}
                        className="px-3 py-1.5 bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 rounded-xl text-xs font-bold"
                      >
                        Cancel Order
                      </button>
                    )}

                    {order.status === 'DELIVERED' && (
                      <button 
                        onClick={() => setReturnModalOrderId(order.id)}
                        className="px-3 py-1.5 bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 rounded-xl text-xs font-bold flex items-center gap-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Request Return</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Return Request Modal */}
      {returnModalOrderId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Submit Return Request</h3>
            <form onSubmit={handleReturnRequest} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Reason for Return</label>
                <select 
                  value={returnReason}
                  onChange={(e) => setReturnReason(e.target.value)}
                  className="w-full bg-slate-100 dark:bg-slate-800 border p-2 rounded-xl"
                  required
                >
                  <option value="">Select reason...</option>
                  <option value="Defective or Damaged Product">Defective or Damaged Product</option>
                  <option value="Item not as described">Item not as described</option>
                  <option value="Changed mind">Changed mind</option>
                </select>
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setReturnModalOrderId(null)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-amber-500 text-slate-950 font-bold rounded-xl">Submit Request</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
