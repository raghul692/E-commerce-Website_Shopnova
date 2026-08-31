import React from 'react';
import { ShieldCheck, Truck, RotateCcw, Headphones, CreditCard, Lock } from 'lucide-react';

interface FooterProps {
  onNavigate: (view: string, param?: any) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800 mt-auto">
      {/* Value Proposition Ribbon */}
      <div className="border-b border-slate-800 bg-slate-950/60 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-600/10 rounded-2xl text-blue-400 border border-blue-500/20">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Free Express Delivery</h4>
              <p className="text-xs text-slate-400">On orders above ₹1,000</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-600/10 rounded-2xl text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">100% Genuine Tech</h4>
              <p className="text-xs text-slate-400">Direct from authorized brands</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-600/10 rounded-2xl text-purple-400 border border-purple-500/20">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">Easy 7-Day Returns</h4>
              <p className="text-xs text-slate-400">No-questions-asked refund policy</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-600/10 rounded-2xl text-amber-400 border border-amber-500/20">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-100">24/7 Priority Support</h4>
              <p className="text-xs text-slate-400">Dedicated phone & chat assistance</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-1 md:grid-cols-5 gap-8 text-xs">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-black text-white text-base">
              S
            </div>
            <span className="text-lg font-black tracking-tight text-white">SHOPNOVA</span>
          </div>
          <p className="text-slate-400 leading-relaxed mb-4 max-w-sm">
            India’s premier omnichannel tech & lifestyle marketplace. Experience lightning-fast delivery, curated flagship products, and enterprise-grade buyer security.
          </p>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-slate-800 rounded border border-slate-700 text-slate-300 font-mono text-[10px]">
              🔒 256-Bit SSL Encrypted
            </span>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-100 mb-3 uppercase tracking-wider">Shop Categories</h4>
          <ul className="space-y-2">
            <li><button onClick={() => onNavigate('products', { category: 'smartphones' })} className="hover:text-blue-400">Smartphones & Mobile</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'laptops' })} className="hover:text-blue-400">Laptops & PCs</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'audio' })} className="hover:text-blue-400">Headphones & Audio</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'gaming' })} className="hover:text-blue-400">Gaming & Consoles</button></li>
            <li><button onClick={() => onNavigate('products', { category: 'wearables' })} className="hover:text-blue-400">Smartwatches</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-100 mb-3 uppercase tracking-wider">Customer Care</h4>
          <ul className="space-y-2">
            <li><button onClick={() => onNavigate('customer-dashboard')} className="hover:text-blue-400">Track Order Shipment</button></li>
            <li><button onClick={() => onNavigate('faq')} className="hover:text-blue-400">Returns & Refunds</button></li>
            <li><button onClick={() => onNavigate('faq')} className="hover:text-blue-400">Shipping Rates & Policies</button></li>
            <li><button onClick={() => onNavigate('contact')} className="hover:text-blue-400">Help Center & Support</button></li>
            <li><button onClick={() => onNavigate('privacy')} className="hover:text-blue-400">Privacy Policy</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold text-slate-100 mb-3 uppercase tracking-wider">Partner With Us</h4>
          <ul className="space-y-2">
            <li><button onClick={() => onNavigate('seller-dashboard')} className="hover:text-emerald-400 font-semibold text-emerald-400">Sell on SHOPNOVA</button></li>
            <li><button onClick={() => onNavigate('admin-dashboard')} className="hover:text-purple-400 font-semibold text-purple-400">Admin Control Center</button></li>
            <li><button onClick={() => onNavigate('about')} className="hover:text-blue-400">About Our Platform</button></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950 py-6 px-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© 2026 SHOPNOVA Omnichannel Technologies Pvt Ltd. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Accepted Payments: UPI, Visa, Mastercard, Razorpay, Stripe, COD</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
