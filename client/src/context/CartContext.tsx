import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, Coupon } from '../types.js';
import { useAuth } from './AuthContext.tsx';
import { apiRequest } from '../services/api.ts';

interface CartContextType {
  cartItems: CartItem[];
  wishlistIds: string[];
  appliedCoupon: Coupon | null;
  couponDiscount: number;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  addToCart: (product: Product, quantity?: number, variantId?: string) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  toggleWishlist: (productId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<{ success: boolean; message: string }>;
  removeCoupon: () => void;
  clearCart: () => void;
  isWishlisted: (productId: string) => boolean;
}

const CartContext = createContext<CartContextType>({
  cartItems: [],
  wishlistIds: [],
  appliedCoupon: null,
  couponDiscount: 0,
  subtotal: 0,
  tax: 0,
  shipping: 0,
  total: 0,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  toggleWishlist: async () => {},
  applyCoupon: async () => ({ success: false, message: '' }),
  removeCoupon: () => {},
  clearCart: () => {},
  isWishlisted: () => false
});

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponDiscount, setCouponDiscount] = useState<number>(0);

  const fetchCartAndWishlist = async () => {
    if (!user) {
      setCartItems([]);
      setWishlistIds([]);
      return;
    }
    try {
      const [cartRes, wishRes] = await Promise.all([
        apiRequest('/cart'),
        apiRequest('/wishlist')
      ]);
      if (cartRes.success) setCartItems(cartRes.items || []);
      if (wishRes.success) setWishlistIds((wishRes.items || []).map((i: any) => i.productId));
    } catch (e) {
      console.warn('Cart/Wishlist fetch warning:', e);
    }
  };

  useEffect(() => {
    fetchCartAndWishlist();
  }, [user]);

  const addToCart = async (product: Product, quantity = 1, variantId?: string) => {
    if (user) {
      await apiRequest('/cart', {
        method: 'POST',
        body: JSON.stringify({ productId: product.id, quantity, variantId })
      });
      await fetchCartAndWishlist();
    } else {
      setCartItems(prev => {
        const existing = prev.find(i => i.productId === product.id && i.variantId === variantId);
        if (existing) {
          return prev.map(i => i.id === existing.id ? { ...i, quantity: i.quantity + quantity } : i);
        }
        return [...prev, { id: `local-${Date.now()}`, productId: product.id, variantId, quantity, product }];
      });
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (user) {
      await apiRequest(`/cart/${cartItemId}`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity })
      });
      await fetchCartAndWishlist();
    } else {
      if (quantity === 0) {
        setCartItems(prev => prev.filter(i => i.id !== cartItemId));
      } else {
        setCartItems(prev => prev.map(i => i.id === cartItemId ? { ...i, quantity } : i));
      }
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    updateQuantity(cartItemId, 0);
  };

  const toggleWishlist = async (productId: string) => {
    if (user) {
      const res = await apiRequest('/wishlist', {
        method: 'POST',
        body: JSON.stringify({ productId })
      });
      if (res.success) {
        if (res.isWishlisted) {
          setWishlistIds(prev => [...prev, productId]);
        } else {
          setWishlistIds(prev => prev.filter(id => id !== productId));
        }
      }
    } else {
      setWishlistIds(prev =>
        prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
      );
    }
  };

  const applyCoupon = async (code: string) => {
    try {
      const res = await apiRequest('/coupons/validate', {
        method: 'POST',
        body: JSON.stringify({ code, cartSubtotal: subtotal })
      });
      if (res.success && res.coupon) {
        setAppliedCoupon({
          code: res.coupon.code,
          description: `Applied ${res.coupon.code}`,
          discountType: res.coupon.discountType,
          discountValue: res.coupon.discountValue,
          minOrderValue: 0,
          validUntil: ''
        });
        setCouponDiscount(res.coupon.discountAmount);
        return { success: true, message: res.message || 'Coupon applied!' };
      }
      return { success: false, message: res.message || 'Invalid coupon code.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to apply coupon.' };
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponDiscount(0);
  };

  const clearCart = () => {
    setCartItems([]);
    removeCoupon();
  };

  const isWishlisted = (productId: string) => wishlistIds.includes(productId);

  const subtotal = cartItems.reduce((acc, i) => {
    const price = i.variant ? i.variant.price : i.product.price;
    return acc + price * i.quantity;
  }, 0);

  const tax = Math.round(subtotal * 0.18);
  const shipping = subtotal > 1000 || cartItems.length === 0 ? 0 : 99;
  const total = Math.max(0, subtotal + tax + shipping - couponDiscount);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        wishlistIds,
        appliedCoupon,
        couponDiscount,
        subtotal,
        tax,
        shipping,
        total,
        addToCart,
        updateQuantity,
        removeFromCart,
        toggleWishlist,
        applyCoupon,
        removeCoupon,
        clearCart,
        isWishlisted
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
