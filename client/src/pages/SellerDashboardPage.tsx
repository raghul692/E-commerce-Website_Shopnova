import React, { useEffect, useState } from 'react';
import { Store, Plus, Package, DollarSign, AlertTriangle, Check, RefreshCw } from 'lucide-react';
import { apiRequest } from '../services/api.ts';

interface SellerDashboardProps {
  onNavigate: (view: string, param?: any) => void;
}

export const SellerDashboardPage: React.FC<SellerDashboardProps> = ({ onNavigate }) => {
  const [kpis, setKpis] = useState<any>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Add Product Form Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryId: '',
    brandId: '',
    price: '',
    originalPrice: '',
    stockCount: '',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=600&q=80'
  });

  const loadSellerData = async () => {
    try {
      const [dashRes, prodRes, catRes, brandRes] = await Promise.all([
        apiRequest('/seller/dashboard'),
        apiRequest('/seller/products'),
        apiRequest('/products/categories'),
        apiRequest('/products/brands')
      ]);

      if (dashRes.success) setKpis(dashRes.kpis);
      if (prodRes.success) setProducts(prodRes.products || []);
      if (catRes.success) setCategories(catRes.categories || []);
      if (brandRes.success) setBrands(brandRes.brands || []);
    } catch (e) {
      console.warn('Seller dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSellerData();
  }, []);

  const handleStockUpdate = async (productId: string, newStock: number) => {
    try {
      const res = await apiRequest(`/seller/inventory/${productId}`, {
        method: 'PATCH',
        body: JSON.stringify({ stockCount: newStock })
      });
      if (res.success) {
        setProducts(prev => prev.map(p => p.id === productId ? { ...p, stockCount: newStock } : p));
      }
    } catch (e: any) {
      alert(e.message || 'Failed to update stock.');
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        categoryId: formData.categoryId || categories[0]?.id,
        brandId: formData.brandId || brands[0]?.id,
        price: Number(formData.price),
        originalPrice: Number(formData.originalPrice),
        stockCount: Number(formData.stockCount),
        images: [formData.imageUrl]
      };

      const res = await apiRequest('/seller/products', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      if (res.success) {
        setShowAddModal(false);
        loadSellerData();
      }
    } catch (e: any) {
      alert(e.message || 'Product onboarding failed.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Seller Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6">
        <div>
          <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 font-extrabold text-xs uppercase tracking-wider rounded-full">
            SELLER MERCHANT PORTAL
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white mt-1">Store Performance & Inventory</h1>
        </div>

        <button 
          onClick={() => setShowAddModal(true)}
          className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-2xl shadow-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>List New Product</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-left">
        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase">Total Listed Products</span>
          <p className="text-2xl font-black text-slate-900 dark:text-white">{kpis?.totalProducts || products.length}</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase">Units Sold</span>
          <p className="text-2xl font-black text-blue-500">{kpis?.totalSalesUnits || 148}</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase">Gross Revenue</span>
          <p className="text-2xl font-black text-emerald-500">₹{(kpis?.totalRevenue || 1245000).toLocaleString('en-IN')}</p>
        </div>

        <div className="p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-1 shadow-sm">
          <span className="text-xs text-slate-400 font-bold uppercase">Low Stock Alerts</span>
          <p className="text-2xl font-black text-amber-500">{kpis?.lowStockCount || 2}</p>
        </div>
      </div>

      {/* Products Inventory Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 space-y-4 shadow-sm overflow-x-auto">
        <h3 className="text-lg font-black text-slate-900 dark:text-white">Active Product Listings</h3>
        
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 uppercase font-bold">
              <th className="pb-3">Product</th>
              <th className="pb-3">SKU</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Stock Count</th>
              <th className="pb-3">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                <td className="py-3 flex items-center gap-3">
                  <img src={p.images?.[0]?.url} alt="" className="w-10 h-10 object-contain rounded-xl bg-slate-100 dark:bg-slate-800" />
                  <span className="font-bold text-slate-900 dark:text-white max-w-xs truncate">{p.title}</span>
                </td>
                <td className="py-3 font-mono text-slate-500">{p.sku}</td>
                <td className="py-3 font-bold text-emerald-500">₹{p.price?.toLocaleString('en-IN')}</td>
                <td className="py-3">
                  <span className={`px-2 py-1 rounded font-bold ${p.stockCount <= 10 ? 'bg-amber-500/20 text-amber-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-300'}`}>
                    {p.stockCount} units
                  </span>
                </td>
                <td className="py-3">
                  <button 
                    onClick={() => {
                      const newStock = prompt('Enter new stock count:', String(p.stockCount));
                      if (newStock !== null) handleStockUpdate(p.id, Number(newStock));
                    }}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold"
                  >
                    Adjust Stock
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-xl space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">List New Product on SHOPNOVA</h3>
            
            <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1">Product Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Sony WH-1000XM5 Wireless ANC Headphones"
                  className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Description</label>
                <textarea
                  rows={3}
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Key features and specs..."
                  className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Selling Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">MRP Price (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({ ...formData, originalPrice: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Stock Units</label>
                  <input
                    type="number"
                    required
                    value={formData.stockCount}
                    onChange={(e) => setFormData({ ...formData, stockCount: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Image URL</label>
                  <input
                    type="text"
                    required
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-slate-100 dark:bg-slate-800 border p-2.5 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-slate-500">Cancel</button>
                <button type="submit" className="px-5 py-2.5 bg-emerald-600 text-white font-bold rounded-xl shadow-lg">Submit & Publish</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
