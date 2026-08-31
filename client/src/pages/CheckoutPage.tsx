import React, { useState } from 'react';
import { 
  Check, MapPin, Truck, CreditCard, ShieldCheck, ArrowRight, Lock, Phone, User as UserIcon
} from 'lucide-react';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../services/api.ts';

interface CheckoutPageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { cartItems, subtotal, tax, shipping, total, appliedCoupon, couponDiscount, clearCart } = useCart();
  const { user } = useAuth();

  const [step, setStep] = useState(1);

  // Address Form State
  const [address, setAddress] = useState({
    fullName: user?.name || 'Rahul Sharma',
    phone: '9876543210',
    streetAddress: 'Flat 402, Prestige Park Heights, HSR Layout Sector 1',
    city: 'Bengaluru',
    state: 'Karnataka',
    postalCode: '560102',
    country: 'India'
  });

  // Shipping Method
  const [shippingMethod, setShippingMethod] = useState<'EXPRESS' | 'STANDARD'>('EXPRESS');

  // Payment Method
  const [paymentMethod, setPaymentMethod] = useState<'RAZORPAY' | 'STRIPE' | 'CARD' | 'UPI' | 'COD'>('RAZORPAY');

  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handlePlaceOrder = async () => {
    setProcessing(true);
    setErrorMessage('');

    try {
      const orderPayload = {
        shippingAddress: address,
        billingAddress: address,
        paymentMethod,
        couponCode: appliedCoupon?.code
      };

      const res = await apiRequest('/checkout/place-order', {
        method: 'POST',
        body: JSON.stringify(orderPayload)
      });

      if (res.success && res.order) {
        clearCart();
        onNavigate('order-success', { order: res.order });
      } else {
        setErrorMessage(res.message || 'Order creation failed.');
      }
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to place order.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Step Tracker Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-6 text-xs font-bold">
        {[
          { number: 1, title: 'Shipping Address' },
          { number: 2, title: 'Delivery Speed' },
          { number: 3, title: 'Review Order' },
          { number: 4, title: 'Secure Payment' }
        ].map((s) => (
          <div key={s.number} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${step === s.number ? 'bg-blue-600 text-white ring-4 ring-blue-500/20' : step > s.number ? 'bg-emerald-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}`}>
              {step > s.number ? <Check className="w-4 h-4" /> : s.number}
            </div>
            <span className={`hidden sm:inline ${step === s.number ? 'text-blue-600 dark:text-blue-400 font-extrabold' : 'text-slate-500'}`}>{s.title}</span>
          </div>
        ))}
      </div>

      {errorMessage && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-500 rounded-2xl text-xs font-bold">
          {errorMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-6">
          {/* Step 1: Address */}
          {step === 1 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-500" />
                <span>Enter Shipping Address</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-bold mb-1">Full Name</label>
                  <input
                    type="text"
                    value={address.fullName}
                    onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Mobile Phone</label>
                  <input
                    type="text"
                    value={address.phone}
                    onChange={(e) => setAddress({ ...address, phone: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-bold mb-1">Flat, House No., Street Address</label>
                  <input
                    type="text"
                    value={address.streetAddress}
                    onChange={(e) => setAddress({ ...address, streetAddress: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">City</label>
                  <input
                    type="text"
                    value={address.city}
                    onChange={(e) => setAddress({ ...address, city: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Pincode</label>
                  <input
                    type="text"
                    value={address.postalCode}
                    onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl p-2.5 font-mono"
                  />
                </div>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-3 bg-blue-600 text-white font-bold text-xs rounded-xl shadow-lg"
              >
                Deliver to this Address →
              </button>
            </div>
          )}

          {/* Step 2: Shipping Method */}
          {step === 2 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                <span>Select Delivery Option</span>
              </h2>

              <div className="space-y-3 text-xs">
                <label 
                  onClick={() => setShippingMethod('EXPRESS')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'EXPRESS' ? 'border-blue-600 bg-blue-500/10' : 'border-slate-300 dark:border-slate-800'}`}
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">⚡ Express Delivery (Tomorrow, 5 PM)</span>
                    <p className="text-slate-500">Fastest courier dispatch with real-time GPS tracking</p>
                  </div>
                  <span className="font-bold text-blue-500">FREE</span>
                </label>

                <label 
                  onClick={() => setShippingMethod('STANDARD')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${shippingMethod === 'STANDARD' ? 'border-blue-600 bg-blue-500/10' : 'border-slate-300 dark:border-slate-800'}`}
                >
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900 dark:text-white">Standard Delivery (2-3 Days)</span>
                    <p className="text-slate-500">Standard surface courier logistics</p>
                  </div>
                  <span className="font-bold text-slate-500">FREE</span>
                </label>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="w-1/3 py-3 border rounded-xl text-xs font-bold">Back</button>
                <button onClick={() => setStep(3)} className="w-2/3 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl">Continue to Order Review →</button>
              </div>
            </div>
          )}

          {/* Step 3: Review Order */}
          {step === 3 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">Review Items & Address</h2>
              
              <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl text-xs">
                <p className="font-bold text-slate-900 dark:text-white">{address.fullName} ({address.phone})</p>
                <p className="text-slate-500">{address.streetAddress}, {address.city}, {address.state} - {address.postalCode}</p>
              </div>

              <div className="divide-y divide-slate-200 dark:divide-slate-800">
                {cartItems.map((item) => (
                  <div key={item.id} className="py-2 text-xs flex justify-between">
                    <span>{item.quantity}x {item.product.title}</span>
                    <span className="font-bold">₹{((item.variant ? item.variant.price : item.product.price) * item.quantity).toLocaleString('en-IN')}</span>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="w-1/3 py-3 border rounded-xl text-xs font-bold">Back</button>
                <button onClick={() => setStep(4)} className="w-2/3 py-3 bg-blue-600 text-white font-bold text-xs rounded-xl">Proceed to Payment →</button>
              </div>
            </div>
          )}

          {/* Step 4: Payment Method */}
          {step === 4 && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4">
              <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span>Choose Payment Method</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {[
                  { id: 'RAZORPAY', label: 'Razorpay UPI / Cards / Netbanking', desc: 'Instant 1-click checkout' },
                  { id: 'STRIPE', label: 'Stripe Global Card Payment', desc: 'Visa, Mastercard, Amex' },
                  { id: 'UPI', label: 'Instant BHIM UPI / GPay / PhonePe', desc: 'Zero gateway charges' },
                  { id: 'COD', label: 'Cash on Delivery (COD)', desc: 'Pay cash upon arrival' }
                ].map((pm) => (
                  <button
                    key={pm.id}
                    onClick={() => setPaymentMethod(pm.id as any)}
                    className={`p-4 rounded-2xl border text-left space-y-1 transition-all ${paymentMethod === pm.id ? 'border-blue-600 bg-blue-500/10 font-bold' : 'border-slate-300 dark:border-slate-800'}`}
                  >
                    <span className="text-slate-900 dark:text-white block">{pm.label}</span>
                    <p className="text-[10px] text-slate-400 font-normal">{pm.desc}</p>
                  </button>
                ))}
              </div>

              <button 
                disabled={processing}
                onClick={handlePlaceOrder}
                className="w-full py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" />
                <span>{processing ? 'Processing Order...' : `Pay ₹${total.toLocaleString('en-IN')} & Place Order`}</span>
              </button>
            </div>
          )}
        </div>

        {/* Sidebar Summary */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-xl">
          <h3 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-3">
            Summary
          </h3>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span>GST Tax</span><span>₹{tax.toLocaleString('en-IN')}</span></div>
            <div className="flex justify-between"><span>Shipping</span><span className="text-emerald-500 font-bold">FREE</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-emerald-500"><span>Coupon</span><span>-₹{couponDiscount}</span></div>}
            <div className="border-t pt-2 flex justify-between text-base font-black text-slate-900 dark:text-white">
              <span>Total</span>
              <span className="text-blue-500">₹{total.toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
