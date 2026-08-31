import React, { useEffect, useState } from 'react';
import { 
  Filter, Grid, List, SlidersHorizontal, Star, X, ChevronDown, RefreshCw
} from 'lucide-react';
import { Product, Category, Brand } from '../types.ts';
import { ProductCard } from '../components/ProductCard.tsx';
import { apiRequest } from '../services/api.ts';

interface PLPProps {
  onNavigate: (view: string, param?: any) => void;
  initialParams?: any;
}

export const ProductListingPage: React.FC<PLPProps> = ({ onNavigate, initialParams = {} }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [category, setCategory] = useState<string>(initialParams.category || '');
  const [brand, setBrand] = useState<string>(initialParams.brand || '');
  const [search, setSearch] = useState<string>(initialParams.search || '');
  const [sort, setSort] = useState<string>('relevance');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<string>('');

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Update parameters if navigation props change
  useEffect(() => {
    if (initialParams.category !== undefined) setCategory(initialParams.category);
    if (initialParams.brand !== undefined) setBrand(initialParams.brand);
    if (initialParams.search !== undefined) setSearch(initialParams.search);
  }, [initialParams]);

  // Load Metadata (Categories & Brands)
  useEffect(() => {
    Promise.all([
      apiRequest('/products/categories'),
      apiRequest('/products/brands')
    ]).then(([catRes, brandRes]) => {
      if (catRes.success) setCategories(catRes.categories || []);
      if (brandRes.success) setBrands(brandRes.brands || []);
    }).catch(() => {});
  }, []);

  // Fetch Products
  const fetchProducts = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', String(page));
      params.append('limit', '12');
      if (category) params.append('category', category);
      if (brand) params.append('brand', brand);
      if (search) params.append('search', search);
      if (sort) params.append('sort', sort);
      if (minPrice) params.append('minPrice', minPrice);
      if (maxPrice) params.append('maxPrice', maxPrice);
      if (minRating) params.append('minRating', minRating);

      const res = await apiRequest(`/products?${params.toString()}`);
      if (res.success) {
        setProducts(res.products || []);
        setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      }
    } catch (e) {
      console.warn('PLP Fetch Error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(1);
  }, [category, brand, search, sort, minPrice, maxPrice, minRating]);

  const clearFilters = () => {
    setCategory('');
    setBrand('');
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setMinRating('');
    setSort('relevance');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header & Search Active Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight font-display">
            {search ? `Search Results for "${search}"` : category ? `${category.toUpperCase()} Catalog` : 'Explore All Products'}
          </h1>
          <p className="text-xs font-mono font-semibold text-brand-500 dark:text-brand-cyan mt-1">
            Showing {products.length} of {pagination.total} items
          </p>
        </div>

        {/* View Switcher & Mobile Filter Trigger */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold border border-white/10"
          >
            <Filter className="w-4 h-4 text-brand-cyan" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-semibold hidden sm:inline">Sort By:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-white dark:bg-slate-900/80 text-slate-900 dark:text-slate-100 border border-slate-300 dark:border-white/15 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-brand-cyan backdrop-blur-md"
            >
              <option value="relevance">Relevance</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="rating">Highest Rating</option>
              <option value="newest">Newest Arrivals</option>
            </select>
          </div>

          {/* Grid/List View Toggle */}
          <div className="hidden sm:flex items-center gap-1 bg-slate-200 dark:bg-slate-900/80 p-1 rounded-xl border border-slate-300 dark:border-white/10">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-800 shadow text-brand-cyan font-bold' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-slate-800 shadow text-brand-cyan font-bold' : 'text-slate-500 dark:text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Desktop Faceted Filters Sidebar */}
        <aside className="hidden md:block space-y-6 glass-panel rounded-2xl p-5 border border-slate-200/80 dark:border-white/10">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
            <h3 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2 font-display">
              <SlidersHorizontal className="w-4 h-4 text-brand-cyan" />
              <span>Faceted Filters</span>
            </h3>
            {(category || brand || minPrice || maxPrice || minRating) && (
              <button onClick={clearFilters} className="text-xs text-rose-400 font-bold hover:underline flex items-center gap-1">
                <RefreshCw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          {/* Categories Filter */}
          <div className="space-y-2">
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Categories</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-2 text-xs font-semibold">
              <button
                onClick={() => setCategory('')}
                className={`w-full text-left py-1.5 px-2.5 rounded-xl transition-all ${!category ? 'bg-brand-500/10 dark:bg-brand-cyan/20 border border-brand-cyan/40 font-bold text-brand-600 dark:text-brand-cyan' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
              >
                All Departments
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setCategory(cat.slug)}
                  className={`w-full text-left py-1.5 px-2.5 rounded-xl transition-all ${category === cat.slug ? 'bg-brand-500/10 dark:bg-brand-cyan/20 border border-brand-cyan/40 font-bold text-brand-600 dark:text-brand-cyan' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Brands</h4>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-2 text-xs font-medium">
              {brands.map((b) => (
                <label key={b.id} className="flex items-center gap-2 cursor-pointer py-1 px-1.5 rounded-lg text-slate-700 dark:text-slate-300 hover:text-brand-cyan transition-colors">
                  <input
                    type="radio"
                    name="brand"
                    checked={brand === b.slug}
                    onChange={() => setBrand(brand === b.slug ? '' : b.slug)}
                    className="rounded text-brand-cyan focus:ring-brand-cyan"
                  />
                  <span>{b.name}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Price Range (₹)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min ₹"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 text-xs focus:border-brand-cyan focus:outline-none"
              />
              <input
                type="number"
                placeholder="Max ₹"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="bg-white dark:bg-slate-900/80 border border-slate-300 dark:border-white/15 rounded-xl px-2.5 py-1.5 text-xs focus:border-brand-cyan focus:outline-none"
              />
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-white/10">
            <h4 className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Minimum Rating</h4>
            <div className="space-y-1 text-xs">
              {[4, 3, 2].map((stars) => (
                <button
                  key={stars}
                  onClick={() => setMinRating(minRating === String(stars) ? '' : String(stars))}
                  className={`w-full flex items-center gap-1.5 py-1.5 px-2.5 rounded-xl transition-all ${minRating === String(stars) ? 'bg-amber-500/10 border border-amber-500/40 font-bold text-amber-500' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50'}`}
                >
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{stars} Stars & Above</span>
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Product Grid Area */}
        <main className="md:col-span-3 space-y-6">
          {loading ? (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 rounded-2xl skeleton-shimmer" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 bg-slate-100 dark:bg-slate-900/50 rounded-3xl p-8 border border-slate-200 dark:border-slate-800">
              <Filter className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">No Products Found</h3>
              <p className="text-xs text-slate-500 mt-1 mb-4">Try clearing your filters or searching for another tech term.</p>
              <button onClick={clearFilters} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold">
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-4"}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} onNavigate={onNavigate} />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                disabled={pagination.page <= 1}
                onClick={() => fetchProducts(pagination.page - 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs font-semibold px-3">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => fetchProducts(pagination.page + 1)}
                className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};
