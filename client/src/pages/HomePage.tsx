import React, { useEffect, useState } from 'react';
import { 
  Sparkles, ArrowRight, Zap, ShieldCheck, Flame, ChevronRight, Clock, Star, Cpu, Eye, Layers, Compass
} from 'lucide-react';
import { Product, Category, Brand } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { ParticleMeshCanvas } from '../components/ParticleMeshCanvas.tsx';
import { TiltCard3D } from '../components/TiltCard3D.tsx';
import { Product360Viewer } from '../components/Product360Viewer.tsx';
import { apiRequest } from '../services/api.ts';

interface HomePageProps {
  onNavigate: (view: string, param?: any) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Flash Sale Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    async function loadHomeData() {
      try {
        const [featRes, trendRes, catRes, brandRes] = await Promise.all([
          apiRequest('/products?featured=true&limit=8'),
          apiRequest('/products?trending=true&limit=8'),
          apiRequest('/products/categories'),
          apiRequest('/products/brands')
        ]);

        if (featRes.success) setFeaturedProducts(featRes.products || []);
        if (trendRes.success) setTrendingProducts(trendRes.products || []);
        if (catRes.success) setCategories(catRes.categories || []);
        if (brandRes.success) setBrands(brandRes.brands || []);
      } catch (e) {
        console.warn('Home data load error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="relative space-y-16 pb-24 min-h-screen">
      {/* Dynamic Particle Canvas Backdrop */}
      <ParticleMeshCanvas />

      {/* 1. Spatial Cyber-Luxe Hero Showcase */}
      <section className="relative overflow-hidden glass-card rounded-3xl mx-4 sm:mx-6 lg:mx-8 mt-4 border border-white/20 dark:border-brand-cyan/20 shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-brand-violet/20 z-10" />
        <img 
          src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80" 
          alt="Hero Banner" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-25 filter blur-[2px]" 
        />

        <div className="relative z-20 max-w-7xl mx-auto px-6 sm:px-12 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-brand-cyan/10 border border-brand-cyan/40 text-brand-cyan text-xs font-extrabold uppercase tracking-widest backdrop-blur-md shadow-[0_0_15px_rgba(0,242,254,0.3)]">
              <Sparkles className="w-4 h-4 text-brand-cyan animate-pulse" />
              <span>SHOPNOVA NEXT-GEN TECH 2026</span>
            </div>

            <h1 className="text-3xl sm:text-6xl font-black tracking-tight leading-tight text-white font-display">
              Future of Tech. <br />
              <span className="text-gradient">
                Spatial Ecosystem.
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-lg leading-relaxed font-normal">
              Experience ultra-performance devices with glassmorphic spatial design, instant AI search, and 360° product exploration.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button 
                onClick={() => onNavigate('products')}
                className="px-7 py-4 rounded-2xl bg-gradient-to-r from-brand-cyan to-brand-500 hover:from-brand-500 hover:to-brand-violet text-slate-950 hover:text-white font-extrabold text-sm shadow-xl shadow-brand-cyan/25 flex items-center gap-2.5 transition-all hover:scale-105"
              >
                <span>Explore Tech Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button 
                onClick={() => onNavigate('products', { category: 'smartphones' })}
                className="px-7 py-4 rounded-2xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 font-bold text-sm border border-white/10 backdrop-blur-md transition-all hover:border-brand-cyan/40"
              >
                Smartphones Hub
              </button>
            </div>
          </div>

          {/* 3D Hero Specular Preview Card */}
          <div className="hidden lg:block">
            <TiltCard3D maxTilt={15} glareOpacity={0.35}>
              <div className="glass-card bg-slate-900/80 backdrop-blur-xl border border-brand-cyan/30 rounded-3xl p-6 shadow-2xl relative">
                <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-brand-cyan to-brand-500 text-slate-950 font-black text-xs rounded-full uppercase shadow-lg border border-white/20">
                  FLAGSHIP 3D
                </div>
                <img 
                  src="https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80" 
                  alt="iPhone 15 Pro Max" 
                  className="w-full h-64 object-contain rounded-2xl mb-4 filter drop-shadow-[0_20px_30px_rgba(0,242,254,0.25)]" 
                />
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">Apple iPhone 15 Pro Max</h3>
                    <p className="text-xs text-slate-400">Titanium Frame • A17 Pro Chip • Spatial Video</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-extrabold text-brand-cyan font-mono">₹134,900</span>
                    <span className="block text-xs text-slate-400 line-through font-mono">₹149,900</span>
                  </div>
                </div>
              </div>
            </TiltCard3D>
          </div>
        </div>
      </section>

      {/* 2. Flash Sale Countdown Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-brand-violet via-brand-500 to-brand-cyan rounded-2xl p-4 sm:p-6 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl border border-white/20 backdrop-blur-lg">
          <div className="flex items-center gap-3 text-left">
            <div className="p-3 bg-slate-950/40 rounded-2xl border border-white/10 backdrop-blur-md">
              <Flame className="w-7 h-7 text-amber-400 animate-bounce" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-display tracking-tight">CYBER DEALS OF THE DAY</h2>
              <p className="text-xs text-white/90">Limited quantities remaining at spatial flash discount prices</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-brand-cyan" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Ends In:</span>
            <div className="flex items-center gap-1.5 font-mono font-black text-sm">
              <span className="bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-xl text-brand-cyan shadow-inner">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-xl text-brand-cyan shadow-inner">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-slate-950/80 border border-white/10 px-3 py-1.5 rounded-xl text-brand-cyan shadow-inner">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Bento Grid Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-violet/20 border border-brand-violet/40 text-brand-violet dark:text-brand-cyan text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Curated Innovations</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight font-display">
            The Bento Grid Experience
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Bento Box 1: Large Featured Tech */}
          <TiltCard3D className="md:col-span-2">
            <div className="h-full glass-card bg-gradient-to-br from-slate-900/90 to-brand-500/20 p-8 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl group-hover:bg-brand-cyan/20 transition-all" />
              <div className="relative z-10 space-y-3">
                <span className="px-3 py-1 bg-brand-cyan/20 border border-brand-cyan/40 text-brand-cyan font-bold text-xs rounded-full">
                  FEATURED INNOVATION
                </span>
                <h3 className="text-2xl font-black text-white font-display">Quantum Processing Laptops</h3>
                <p className="text-slate-300 text-xs sm:text-sm max-w-md">
                  Equipped with M3 Max and RTX 4090 mobility chips for unreal rendering power and 24-hour continuous battery endurance.
                </p>
              </div>

              <div className="relative z-10 pt-6 flex items-center justify-between">
                <button 
                  onClick={() => onNavigate('products', { category: 'laptops' })}
                  className="px-5 py-2.5 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-brand-cyan transition-colors flex items-center gap-2"
                >
                  <span>Explore Laptops</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
                <Cpu className="w-12 h-12 text-brand-cyan/40" />
              </div>
            </div>
          </TiltCard3D>

          {/* Bento Box 2: Spatial Audio */}
          <TiltCard3D>
            <div className="h-full glass-card bg-gradient-to-br from-slate-900/90 to-brand-violet/30 p-6 rounded-3xl border border-white/10 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-2">
                <span className="px-2.5 py-0.5 bg-brand-violet/30 border border-brand-violet/50 text-brand-violet dark:text-brand-cyan font-bold text-[11px] rounded-full">
                  3D AUDIO
                </span>
                <h3 className="text-xl font-bold text-white">Spatial ANC Audio</h3>
                <p className="text-slate-400 text-xs">Acoustic precision with head-tracking lossless audio.</p>
              </div>
              <button 
                onClick={() => onNavigate('products', { category: 'audio' })}
                className="mt-6 py-2 px-4 rounded-xl bg-brand-violet/30 hover:bg-brand-violet/50 text-white text-xs font-bold border border-brand-violet/50 transition-colors w-fit flex items-center gap-1.5"
              >
                <span>Discover Headphones</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </TiltCard3D>
        </div>
      </section>

      {/* 4. Interactive 360° Product Lab Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card bg-slate-950/80 rounded-3xl p-8 border border-brand-cyan/20 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-4 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-brand-cyan text-xs font-extrabold uppercase">
                <Eye className="w-4 h-4" />
                <span>INTERACTIVE 360° LAB</span>
              </div>
              <h2 className="text-2xl sm:text-4xl font-black text-white font-display">
                Inspect Devices in <span className="text-gradient">Full Spatial 3D</span>
              </h2>
              <p className="text-slate-300 text-sm leading-relaxed">
                Rotate, pivot, and examine premium products from all angles before making your selection. Drag horizontally to experience real-time specular highlights.
              </p>
              <div className="pt-2 flex items-center gap-3">
                <button 
                  onClick={() => onNavigate('products')}
                  className="px-6 py-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold shadow-lg transition-all"
                >
                  Enter Product Lab
                </button>
              </div>
            </div>

            {/* 360 Component Container */}
            <div>
              <Product360Viewer 
                title="Flagship Spatial Headset"
                images={[
                  'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
                  'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
                  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
                ]}
              />
            </div>
          </div>
        </div>
      </section>

      {/* 5. Top Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight font-display">
              Browse Departments
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Curated categories for tech enthusiasts</p>
          </div>
          <button 
            onClick={() => onNavigate('products')}
            className="text-xs font-bold text-brand-600 dark:text-brand-cyan hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigate('products', { category: cat.slug })}
              className="group glass-card rounded-2xl p-4 text-center border border-slate-200/80 dark:border-white/10 hover:border-brand-cyan/40 transition-all hover:scale-105"
            >
              <div className="w-16 h-16 mx-auto mb-3 rounded-2xl overflow-hidden bg-slate-100/50 dark:bg-slate-800/50 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                <img src={cat.image} alt={cat.name} className="w-full h-full object-cover rounded-xl" />
              </div>
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-brand-cyan truncate">
                {cat.name}
              </h3>
            </button>
          ))}
        </div>
      </section>

      {/* 6. Featured Flagship Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-display">
              <span>Featured Flagships</span>
              <Sparkles className="w-5 h-5 text-amber-500" />
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Handpicked devices with highest customer ratings</p>
          </div>
          <button 
            onClick={() => onNavigate('products', { featured: true })}
            className="text-xs font-bold text-brand-600 dark:text-brand-cyan hover:underline flex items-center gap-1"
          >
            <span>See All Featured</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-72 rounded-2xl glass-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
            ))}
          </div>
        )}
      </section>

      {/* 7. Official Brand Partners */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-white/10">
          <div className="text-center mb-6">
            <h2 className="text-xl font-extrabold text-slate-900 dark:text-white font-display">Official Brand Partners</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Direct authorized manufacturer warranty</p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {brands.slice(0, 8).map((b) => (
              <button
                key={b.id}
                onClick={() => onNavigate('products', { brand: b.slug })}
                className="py-2.5 px-5 bg-white/60 dark:bg-slate-900/60 rounded-xl border border-slate-200/60 dark:border-white/10 shadow-sm hover:border-brand-cyan/40 hover:scale-105 transition-all"
              >
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{b.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Trending Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2 font-display">
              <Flame className="w-5 h-5 text-rose-500" />
              <span>Trending Gear</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Most bought tech products this week</p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trendingProducts.map((product) => (
            <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
          ))}
        </div>
      </section>
    </div>
  );
};

