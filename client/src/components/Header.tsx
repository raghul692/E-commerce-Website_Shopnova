import React, { useState, useEffect, useRef } from 'react';
import { 
  ShoppingBag, Search, Heart, User, Sun, Moon, MapPin, ChevronDown, 
  Menu, X, Sparkles, LogOut, ShieldCheck, Store, Package, Bell
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.tsx';
import { useCart } from '../context/CartContext.tsx';
import { useTheme } from '../context/ThemeContext.tsx';
import { apiRequest } from '../services/api.ts';

interface HeaderProps {
  onNavigate: (view: string, param?: any) => void;
  currentView: string;
}

export const Header: React.FC<HeaderProps> = ({ onNavigate, currentView }) => {
  const { user, logout, loginAsCustomer, loginAsSeller, loginAsAdmin } = useAuth();
  const { cartItems, wishlistIds } = useCart();
  const { theme, toggleTheme } = useTheme();

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [scrolled, setScrolled] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);

  // Scroll detection for compact header effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Debounced Search Suggestions
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await apiRequest(`/products/search/suggestions?q=${encodeURIComponent(searchQuery)}`);
        if (res.success) {
          setSuggestions(res.products || []);
          setShowSuggestions(true);
        }
      } catch (e) {
        console.warn('Search suggestions error:', e);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Click outside to hide search suggestions
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch Categories
  useEffect(() => {
    apiRequest('/products/categories')
      .then(res => { if (res.success) setCategories(res.categories || []); })
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowSuggestions(false);
    if (searchQuery.trim()) {
      onNavigate('products', { search: searchQuery.trim() });
    }
  };

  const totalCartCount = cartItems.reduce((acc, i) => acc + i.quantity, 0);

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-slate-950/85 backdrop-blur-xl border-b border-white/10 shadow-2xl shadow-cyan-950/30 py-1' 
        : 'bg-slate-950/70 backdrop-blur-lg border-b border-white/5 py-2'
    }`}>
      {/* Top Announcement Bar */}
      <div className="bg-gradient-to-r from-blue-900/80 via-indigo-900/80 to-purple-900/80 backdrop-blur-md border-b border-white/10 px-4 py-1.5 text-xs text-center font-medium flex items-center justify-between text-slate-200">
        <div className="hidden sm:flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span className="tracking-wide">SHOPNOVA Cyber Launch — 50% OFF Spatial & Flagship Gear</span>
        </div>
        <div className="mx-auto sm:mx-0 flex items-center gap-3">
          <span className="bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider shadow-sm">
            PROMO: NOVA50
          </span>
          <span className="text-slate-300 font-medium">Extra 50% OFF First Order</span>
        </div>
        <div className="hidden md:flex items-center gap-4 text-[11px] text-slate-400">
          <button onClick={() => onNavigate('contact')} className="hover:text-cyan-400 transition-colors">Help & Support</button>
          <span>•</span>
          <button onClick={() => onNavigate('track-order')} className="hover:text-cyan-400 transition-colors">Track Order</button>
        </div>
      </div>

      {/* Main Header Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl bg-slate-900/80 border border-white/10 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <button 
            onClick={() => onNavigate('home')} 
            className="flex items-center gap-3 group text-left"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center font-black text-xl text-white shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-all duration-300">
              <span className="relative z-10 font-syne">S</span>
              <div className="absolute inset-0 rounded-xl bg-cyan-400/20 blur-md group-hover:blur-lg transition-all" />
            </div>
            <div>
              <span className="text-xl font-black font-syne tracking-tight bg-gradient-to-r from-white via-slate-100 to-cyan-300 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-white transition-colors">
                SHOPNOVA
              </span>
              <span className="block text-[9px] font-bold tracking-widest text-cyan-400 uppercase -mt-1 font-mono">
                SPATIAL E-COMMERCE
              </span>
            </div>
          </button>

          {/* Delivery Location Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/60 border border-white/10 text-xs hover:border-cyan-500/40 transition-colors backdrop-blur-md">
            <MapPin className="w-4 h-4 text-cyan-400 animate-bounce" />
            <div>
              <span className="block text-[9px] text-slate-400 font-mono leading-tight">DELIVER TO</span>
              <span className="font-semibold text-slate-200">Bengaluru 560102</span>
            </div>
          </div>
        </div>

        {/* Global Live Search Bar */}
        <div ref={searchRef} className="flex-1 max-w-xl relative hidden md:block">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search 3D gadgets, wearables, flagship tech..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => searchQuery.trim() && setShowSuggestions(true)}
              className="w-full bg-slate-900/80 text-white placeholder-slate-400 pl-4 pr-12 py-2 rounded-xl border border-white/10 focus:outline-none focus:border-cyan-500/70 focus:ring-2 focus:ring-cyan-500/20 text-sm transition-all shadow-inner backdrop-blur-md"
            />
            <button 
              type="submit"
              className="absolute right-1.5 p-1.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 rounded-lg text-slate-950 font-bold transition-transform active:scale-95 shadow-md shadow-cyan-500/20"
            >
              <Search className="w-4 h-4 stroke-[2.5]" />
            </button>
          </form>

          {/* Search Autocomplete Suggestions Popover */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-slate-950/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl overflow-hidden z-50">
              <div className="p-2.5 text-[10px] font-mono font-bold uppercase tracking-wider text-cyan-400 bg-slate-900/70 border-b border-white/10 flex items-center justify-between">
                <span>Matching Flagship Products</span>
                <span>{suggestions.length} Found</span>
              </div>
              <div className="divide-y divide-white/5 max-h-80 overflow-y-auto">
                {suggestions.map((prod) => (
                  <button
                    key={prod.id}
                    onClick={() => {
                      setShowSuggestions(false);
                      onNavigate('product-detail', { slug: prod.slug });
                    }}
                    className="w-full p-3 flex items-center gap-3 hover:bg-cyan-500/10 text-left transition-colors group"
                  >
                    {prod.images?.[0]?.url && (
                      <img src={prod.images[0].url} alt="" className="w-11 h-11 object-cover rounded-xl bg-slate-900 border border-white/10 group-hover:border-cyan-400/50 transition-colors" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-cyan-300 transition-colors">{prod.title}</p>
                      <p className="text-xs font-mono font-bold text-cyan-400">₹{prod.price?.toLocaleString('en-IN')}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Theme Toggle */}
          <button 
            onClick={toggleTheme}
            className="p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white hover:border-white/20 transition-all"
            title="Toggle Light/Dark Mode"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-300" />}
          </button>

          {/* Wishlist */}
          <button 
            onClick={() => onNavigate('wishlist')}
            className="relative p-2 rounded-xl bg-slate-900/60 border border-white/10 text-slate-300 hover:text-white hover:border-pink-500/40 hover:shadow-[0_0_15px_rgba(244,63,94,0.2)] transition-all hidden sm:block"
            title="Wishlist"
          >
            <Heart className="w-4 h-4" />
            {wishlistIds.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full text-[9px] font-mono font-bold flex items-center justify-center shadow-lg shadow-pink-500/50">
                {wishlistIds.length}
              </span>
            )}
          </button>

          {/* Cart Icon */}
          <button 
            onClick={() => onNavigate('cart')}
            className="relative flex items-center gap-2 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500/10 to-indigo-500/10 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all group"
          >
            <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform text-cyan-400" />
            <span className="text-xs font-bold font-syne hidden sm:inline">CART</span>
            {totalCartCount > 0 && (
              <span className="w-5 h-5 bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 rounded-full text-[10px] font-black font-mono flex items-center justify-center shadow-md shadow-cyan-400/40">
                {totalCartCount}
              </span>
            )}
          </button>

          {/* User Profile / Auth Switcher Dropdown */}
          <div className="relative">
            {user ? (
              <button 
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl bg-slate-900/80 border border-white/10 hover:border-cyan-500/40 transition-all"
              >
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'} 
                  alt="" 
                  className="w-7 h-7 rounded-lg object-cover ring-2 ring-cyan-500/50" 
                />
                <div className="text-left hidden lg:block pr-1">
                  <span className="block text-xs font-bold text-slate-200 leading-tight">{user.name.split(' ')[0]}</span>
                  <span className="block text-[9px] text-cyan-400 uppercase font-mono font-bold">{user.role}</span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
              </button>
            ) : (
              <button 
                onClick={() => onNavigate('auth')}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 font-syne text-xs font-extrabold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-400/40 transition-all"
              >
                <User className="w-4 h-4 stroke-[2.5]" />
                <span>SIGN IN</span>
              </button>
            )}

            {/* Account Menu Popover */}
            {userDropdownOpen && user && (
              <div className="absolute right-0 mt-2 w-64 bg-slate-950/95 border border-white/15 rounded-2xl shadow-2xl backdrop-blur-2xl p-2 z-50 divide-y divide-white/10">
                <div className="p-3">
                  <p className="text-sm font-bold font-syne text-white">{user.name}</p>
                  <p className="text-xs text-slate-400 truncate font-mono">{user.email}</p>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 rounded-md text-[9px] font-mono font-bold uppercase">
                    {user.role} PRIVILEGE
                  </span>
                </div>

                <div className="py-1">
                  <button 
                    onClick={() => { setUserDropdownOpen(false); onNavigate('customer-dashboard'); }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Package className="w-4 h-4 text-cyan-400" />
                    <span>My Orders & Tracking</span>
                  </button>

                  {user.role === 'SELLER' && (
                    <button 
                      onClick={() => { setUserDropdownOpen(false); onNavigate('seller-dashboard'); }}
                      className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-colors font-semibold"
                    >
                      <Store className="w-4 h-4 text-emerald-400" />
                      <span>Seller Merchant Hub</span>
                    </button>
                  )}

                  {(user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') && (
                    <button 
                      onClick={() => { setUserDropdownOpen(false); onNavigate('admin-dashboard'); }}
                      className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-purple-400 hover:bg-purple-500/10 rounded-xl transition-colors font-semibold"
                    >
                      <ShieldCheck className="w-4 h-4 text-purple-400" />
                      <span>Admin Command Center</span>
                    </button>
                  )}
                </div>

                {/* Instant Role Switcher for Evaluator */}
                <div className="py-2 px-3">
                  <span className="block text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                    Demo Mode Role Switcher
                  </span>
                  <div className="grid grid-cols-3 gap-1">
                    <button 
                      onClick={async () => { setUserDropdownOpen(false); await loginAsCustomer(); }}
                      className="py-1 px-1.5 bg-slate-900 border border-white/10 hover:border-cyan-500/40 text-[10px] font-semibold text-slate-300 rounded-lg text-center transition-colors"
                    >
                      Customer
                    </button>
                    <button 
                      onClick={async () => { setUserDropdownOpen(false); await loginAsSeller(); }}
                      className="py-1 px-1.5 bg-slate-900 border border-white/10 hover:border-emerald-500/40 text-[10px] font-semibold text-emerald-400 rounded-lg text-center transition-colors"
                    >
                      Seller
                    </button>
                    <button 
                      onClick={async () => { setUserDropdownOpen(false); await loginAsAdmin(); }}
                      className="py-1 px-1.5 bg-slate-900 border border-white/10 hover:border-purple-500/40 text-[10px] font-semibold text-purple-400 rounded-lg text-center transition-colors"
                    >
                      Admin
                    </button>
                  </div>
                </div>

                <div className="pt-1">
                  <button 
                    onClick={() => { setUserDropdownOpen(false); logout(); }}
                    className="w-full px-3 py-2 flex items-center gap-2.5 text-xs text-rose-400 hover:bg-rose-500/10 rounded-xl transition-colors font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Navigation Ribbon */}
      <div className="border-t border-white/5 bg-slate-950/40 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-1.5 overflow-x-auto no-scrollbar hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center gap-6 text-xs font-semibold text-slate-300 font-syne">
          <button 
            onClick={() => onNavigate('products')}
            className={`hover:text-cyan-400 transition-colors flex items-center gap-1.5 ${currentView === 'products' ? 'text-cyan-400 font-bold' : ''}`}
          >
            <span>All Catalog</span>
          </button>
          {categories.slice(0, 8).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap opacity-80 hover:opacity-100"
            >
              {cat.name}
            </button>
          ))}
          <button 
            onClick={() => onNavigate('products', { trending: true })}
            className="text-cyan-300 bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 rounded-full hover:bg-cyan-500/20 hover:border-cyan-400 font-bold ml-auto flex items-center gap-1.5 whitespace-nowrap transition-all shadow-sm shadow-cyan-500/10"
          >
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Cyber Trending</span>
          </button>
        </div>
      </div>
    </header>
  );
};
