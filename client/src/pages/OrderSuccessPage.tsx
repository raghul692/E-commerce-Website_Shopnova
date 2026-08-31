import React from 'react';
import { CheckCircle2, Package, Truck, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import { Order } from '../types.ts';
import { apiRequest } from '../services/api.ts';

interface SuccessProps {
  onNavigate: (view: string, param?: any) => void;
  order: Order;
}

export const OrderSuccessPage: React.FC<SuccessProps> = ({ onNavigate, order }) => {
  const handleDownloadInvoice = async () => {
    try {
      const res = await apiRequest(`/orders/${order.id}/invoice`);
      if (res.success && res.invoice) {
        const jsonStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(res.invoice, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", jsonStr);
        downloadAnchor.setAttribute("download", `SHOPNOVA_Invoice_${order.orderNumber}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
      }
    } catch (e) {
      alert('Failed to generate invoice download.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-8">
      <div className="w-20 h-20 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-500/20">
        <CheckCircle2 className="w-12 h-12" />
      </div>

      <div>
        <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider rounded-full">
          ORDER CONFIRMED & PACKED
        </span>
        <h1 className="text-3xl font-black text-slate-900 dark:text-white mt-2">Thank You for Your Order!</h1>
        <p className="text-xs text-slate-500 mt-1">
          Order Number: <strong className="font-mono text-slate-900 dark:text-white">{order.orderNumber}</strong>
        </p>
      </div>

      {/* Shipment Details Box */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 text-left space-y-4 shadow-xl">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3 text-xs">
          <div>
            <span className="text-slate-400 block">Estimated Express Delivery</span>
            <strong className="text-slate-900 dark:text-white font-bold text-sm">Tomorrow by 5:00 PM</strong>
          </div>
          <div>
            <span className="text-slate-400 block">Tracking AWB</span>
            <strong className="font-mono text-blue-500 font-bold">{order.deliveryTrackingNumber || 'EXP-98472910'}</strong>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <h4 className="font-bold text-slate-900 dark:text-white uppercase">Order Breakdown</h4>
          {order.items?.map((item) => (
            <div key={item.id} className="flex justify-between py-1 border-b border-slate-100 dark:border-slate-800">
              <span>{item.quantity}x {item.title}</span>
              <span className="font-bold">₹{item.totalAmount?.toLocaleString('en-IN')}</span>
            </div>
          ))}
          <div className="flex justify-between pt-2 text-sm font-black text-slate-900 dark:text-white">
            <span>Total Paid ({order.paymentMethod})</span>
            <span className="text-blue-500">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <button 
          onClick={handleDownloadInvoice}
          className="px-6 py-3.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg"
        >
          <Download className="w-4 h-4" />
          <span>Download Tax Invoice (JSON/PDF)</span>
        </button>

        <button 
          onClick={() => onNavigate('customer-dashboard')}
          className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30"
        >
          <Truck className="w-4 h-4" />
          <span>Track Order Status</span>
        </button>
      </div>
    </div>
  );
};
