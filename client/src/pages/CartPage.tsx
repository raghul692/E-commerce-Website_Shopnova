import React, { useState } from 'react';
import { 
  ShoppingBag, Trash2, ArrowRight, Tag, ShieldCheck, Truck, Sparkles, Check, X
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';

interface CartPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ onNavigate }) => {
  const { 
    cartItems, updateQuantity, removeFromCart, subtotal, tax, shipping, total, 
    applyCoupon, removeCoupon, appliedCoupon, couponDiscount 
  } = useCart();

  const [couponCodeInput, setCouponCodeInput] = useState('');
  const [couponMsg, setCouponMsg] = useState<{ success?: boolean; text?: string } | null>(null);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    const res = await applyCoupon(couponCodeInput.trim().toUpperCase());
    setCouponMsg({ success: res.success, text: res.message });
    if (res.success) setCouponCodeInput('');
  };

  if (cartItems.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-full flex items-center justify-center mx-auto">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">Your Shopping Cart is Empty</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">Explore our tech flagship catalog to discover phones, laptops, and wearables.</p>
        </div>
        <button 
          onClick={() => onNavigate('products')}
          className="px-6 py-3 bg-blue-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-blue-500/30"
        >
          Explore Products Now
        </button>
      </div>
    );
  }

  const amountForFreeShipping = Math.max(0, 1000 - subtotal);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
        Shopping Cart ({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})
      </h1>

      {/* Free Shipping Progress Ribbon */}
      {amountForFreeShipping > 0 ? (
        <div className="bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 p-3 rounded-2xl text-xs flex items-center justify-between font-medium">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            <span>Add <strong>₹{amountForFreeShipping.toLocaleString('en-IN')}</strong> more to qualify for FREE Express Delivery!</span>
          </div>
          <button onClick={() => onNavigate('products')} className="underline font-bold">Add Items</button>
        </div>
      ) : (
        <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 p-3 rounded-2xl text-xs flex items-center gap-2 font-bold">
          <Check className="w-4 h-4" />
          <span>Congratulations! You unlocked FREE Express Shipping!</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Cart Items Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 sm:p-6 divide-y divide-slate-200 dark:divide-slate-800 shadow-sm">
            {cartItems.map((item) => {
              const price = item.variant ? item.variant.price : item.product.price;
              const imgUrl = item.product.images?.[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=300&q=80';

              return (
                <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <img src={imgUrl} alt="" className="w-20 h-20 object-contain rounded-2xl bg-slate-100 dark:bg-slate-800 p-2" />
                    <div className="space-y-1">
                      <h3 
                        onClick={() => onNavigate('product-detail', { slug: item.product.slug })}
                        className="text-sm font-bold text-slate-800 dark:text-slate-100 hover:text-blue-600 cursor-pointer line-clamp-1"
                      >
                        {item.product.title}
                      </h3>
                      {item.variant && (
                        <p className="text-[11px] text-blue-500 font-semibold">Variant: {item.variant.title}</p>
                      )}
                      <p className="text-xs text-slate-400">Seller: SHOPNOVA Retail</p>
                      <span className="text-sm font-black text-slate-900 dark:text-white">
                        ₹{price.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-slate-300 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        -
                      </button>
                      <span className="px-3 text-xs font-bold text-slate-900 dark:text-white">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2.5 py-1 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 dark:hover:bg-slate-700"
                      >
                        +
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-slate-900 dark:text-white block">
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </span>
                      <button 
                        onClick={() => removeFromCart(item.id)}
                        className="text-xs text-rose-500 hover:underline flex items-center gap-1 mt-1 ml-auto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary & Coupon Card */}
        <div className="space-y-4">
          {/* Coupon Input Drawer */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-3">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-500" />
              <span>Apply Promo Coupon</span>
            </h3>

            {appliedCoupon ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="font-extrabold text-emerald-500">{appliedCoupon.code}</span>
                  <p className="text-[10px] text-slate-400">Saving ₹{couponDiscount.toLocaleString('en-IN')}</p>
                </div>
                <button onClick={removeCoupon} className="text-rose-500 p-1 hover:bg-rose-500/10 rounded">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. WELCOME50"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  className="flex-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                />
                <button type="submit" className="px-4 py-2 bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold rounded-xl">
                  Apply
                </button>
              </form>
            )}

            {couponMsg && (
              <p className={`text-[11px] font-bold ${couponMsg.success ? 'text-emerald-500' : 'text-rose-500'}`}>
                {couponMsg.text}
              </p>
            )}
          </div>

          {/* Pricing Breakdown */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
              Order Summary
            </h3>

            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>GST Tax (18%)</span>
                <span className="font-bold text-slate-900 dark:text-white">₹{tax.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between">
                <span>Express Delivery Fee</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {shipping === 0 ? <strong className="text-emerald-500">FREE</strong> : `₹${shipping}`}
                </span>
              </div>

              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-500 font-bold">
                  <span>Coupon Discount</span>
                  <span>-₹{couponDiscount.toLocaleString('en-IN')}</span>
                </div>
              )}

              <div className="border-t border-slate-200 dark:border-slate-800 pt-3 flex justify-between text-base font-black text-slate-900 dark:text-white">
                <span>Total Payable</span>
                <span className="text-xl text-blue-600 dark:text-blue-400">₹{total.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button 
              onClick={() => onNavigate('checkout')}
              className="w-full py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-xl shadow-blue-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
