import React, { useEffect, useState } from 'react';
import { 
  Star, ShoppingBag, Heart, ShieldCheck, Truck, RotateCcw, 
  MapPin, Check, ChevronRight, MessageSquare, ThumbsUp, Sparkles, 
  Eye, Zap, Shield, RefreshCw
} from 'lucide-react';
import { Product } from '../types.ts';
import { useCart } from '../context/CartContext.tsx';
import { useAuth } from '../context/AuthContext.tsx';
import { apiRequest } from '../services/api.ts';
import { Product360Viewer } from '../components/Product360Viewer.tsx';

interface PDPProps {
  onNavigate: (view: string, param?: any) => void;
  slug: string;
}

export const ProductDetailPage: React.FC<PDPProps> = ({ onNavigate, slug }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [pincode, setPincode] = useState('560102');
  const [deliveryAvailable, setDeliveryAvailable] = useState<boolean | null>(null);
  const [is360View, setIs360View] = useState(false);

  // New Review Modal State
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');

  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      try {
        const res = await apiRequest(`/products/${slug}`);
        if (res.success && res.product) {
          setProduct(res.product);
          const primaryImg = res.product.images?.find((i: any) => i.isPrimary)?.url || res.product.images?.[0]?.url;
          setSelectedImage(primaryImg || '');
          if (res.product.variants?.length > 0) {
            setSelectedVariant(res.product.variants[0]);
          }
        }
      } catch (e) {
        console.warn('Load product PDP error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadProduct();
  }, [slug]);

  const handlePincodeCheck = () => {
    if (pincode.length === 6) {
      setDeliveryAvailable(true);
    } else {
      setDeliveryAvailable(false);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity, selectedVariant?.id);
    }
  };

  const handleBuyNow = () => {
    if (product) {
      addToCart(product, quantity, selectedVariant?.id);
      onNavigate('cart');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) return;
    try {
      const res = await apiRequest('/reviews', {
        method: 'POST',
        body: JSON.stringify({
          productId: product.id,
          rating: reviewRating,
          title: reviewTitle,
          comment: reviewComment
        })
      });
      if (res.success) {
        setShowReviewModal(false);
        setReviewTitle('');
        setReviewComment('');
        // Reload product details
        const updatedRes = await apiRequest(`/products/${slug}`);
        if (updatedRes.success) setProduct(updatedRes.product);
      }
    } catch (e: any) {
      alert(e.message || 'Failed to submit review.');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="h-[600px] rounded-3xl bg-slate-900/60 border border-white/10 animate-pulse flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center animate-spin">
              <Sparkles className="w-6 h-6 text-cyan-400" />
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-widest">Rendering 3D Product Mesh...</span>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="p-8 max-w-md mx-auto rounded-3xl bg-slate-900/80 border border-white/10 backdrop-blur-2xl space-y-4">
          <h2 className="text-2xl font-black font-syne text-white">Product Not Found</h2>
          <p className="text-xs text-slate-400">The requested spatial flagship item could not be retrieved from the catalog inventory.</p>
          <button 
            onClick={() => onNavigate('products')} 
            className="px-6 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-syne font-black tracking-wide shadow-lg shadow-cyan-500/20"
          >
            RETURN TO CATALOG
          </button>
        </div>
      </div>
    );
  }

  const wishlisted = isWishlisted(product.id);
  const currentPrice = selectedVariant ? selectedVariant.price : product.price;
  const currentOriginalPrice = selectedVariant ? selectedVariant.originalPrice : product.originalPrice;

  // Demo image sequence for 360 viewer if toggled
  const imageSequence = product.images?.length > 1 
    ? product.images.map(img => img.url)
    : [
        selectedImage,
        selectedImage,
        selectedImage,
        selectedImage
      ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs font-mono text-slate-400">
        <button onClick={() => onNavigate('home')} className="hover:text-cyan-400 transition-colors">HOME</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <button onClick={() => onNavigate('products')} className="hover:text-cyan-400 transition-colors">CATALOG</button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-cyan-300 font-bold truncate max-w-xs">{product.title}</span>
      </nav>

      {/* Main PDP Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
        {/* Left Column: Image Gallery & 360 Inspection Toggle */}
        <div className="space-y-4">
          <div className="relative aspect-square w-full bg-slate-950/80 border border-white/15 rounded-3xl p-6 flex items-center justify-center overflow-hidden shadow-2xl backdrop-blur-2xl group">
            {/* Ambient Lighting Backdrop */}
            <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/10 via-transparent to-purple-500/10 pointer-events-none" />

            {/* 360 Mode Toggle Button */}
            <button
              onClick={() => setIs360View(!is360View)}
              className={`absolute top-4 right-4 z-20 px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-2 backdrop-blur-md transition-all shadow-lg ${
                is360View 
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-500/40' 
                  : 'bg-slate-900/80 text-cyan-400 border-cyan-500/30 hover:bg-cyan-500/20'
              }`}
            >
              <RotateCcw className={`w-3.5 h-3.5 ${is360View ? 'animate-spin' : ''}`} />
              <span>{is360View ? '2D GALLERY' : '360° LAB'}</span>
            </button>

            {product.discountPercentage > 0 && (
              <span className="absolute top-4 left-4 z-20 px-3 py-1 bg-gradient-to-r from-rose-500 to-pink-600 text-white font-mono font-black text-[10px] uppercase tracking-widest rounded-lg shadow-lg shadow-rose-500/30">
                SAVE {product.discountPercentage}%
              </span>
            )}

            {is360View ? (
              <div className="w-full h-full">
                <Product360Viewer 
                  images={imageSequence} 
                  productTitle={product.title} 
                />
              </div>
            ) : (
              <img 
                src={selectedImage} 
                alt={product.title} 
                className="w-full h-full object-contain object-center transition-all duration-500 group-hover:scale-105 filter drop-shadow-[0_20px_30px_rgba(0,242,254,0.15)]"
              />
            )}
          </div>

          {/* Thumbnails Carousel */}
          {!is360View && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2 no-scrollbar">
              {product.images?.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.url)}
                  className={`w-20 h-20 rounded-2xl border-2 overflow-hidden bg-slate-950/80 p-1.5 transition-all flex-shrink-0 ${
                    selectedImage === img.url 
                      ? 'border-cyan-400 scale-105 shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/30' 
                      : 'border-white/10 opacity-70 hover:opacity-100 hover:border-white/30'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}

          {/* Feature Highlights Badges */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-1 backdrop-blur-md">
              <Shield className="w-4 h-4 text-cyan-400 mx-auto" />
              <p className="text-[10px] font-mono font-bold text-slate-200">2 YEAR WARRANTY</p>
              <p className="text-[9px] text-slate-400">ShopNova Care+</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-1 backdrop-blur-md">
              <Truck className="w-4 h-4 text-indigo-400 mx-auto" />
              <p className="text-[10px] font-mono font-bold text-slate-200">EXPRESS SHIPPING</p>
              <p className="text-[9px] text-slate-400">Dispatched in 4 Hrs</p>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/60 border border-white/10 text-center space-y-1 backdrop-blur-md">
              <Zap className="w-4 h-4 text-amber-400 mx-auto" />
              <p className="text-[10px] font-mono font-bold text-slate-200">AUTHENTIC GEAR</p>
              <p className="text-[9px] text-slate-400">100% Verified</p>
            </div>
          </div>
        </div>

        {/* Right Column: Product Info & Purchase Options */}
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between gap-4 mb-3">
              <span className="text-xs font-mono font-bold text-cyan-300 uppercase tracking-widest bg-cyan-500/10 border border-cyan-500/20 px-3 py-1 rounded-xl">
                {product.brand?.name || product.category?.name}
              </span>
              <button 
                onClick={() => toggleWishlist(product.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                  wishlisted 
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-500/20' 
                    : 'bg-slate-900/60 text-slate-300 border-white/10 hover:border-rose-500/40 hover:text-rose-400'
                }`}
              >
                <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{wishlisted ? 'Wishlisted' : 'Add to Wishlist'}</span>
              </button>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-syne text-white leading-tight tracking-tight">
              {product.title}
            </h1>

            {/* Rating Stars & SKU */}
            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 px-3 py-1 rounded-xl font-bold font-mono">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-slate-400 font-normal">({product.reviewCount} reviews)</span>
              </div>
              <span className="text-slate-400 font-mono">
                ID: <code className="text-cyan-300 font-bold">{product.sku}</code>
              </span>
            </div>
          </div>

          {/* Cyber Pricing Box */}
          <div className="p-5 bg-gradient-to-r from-slate-950/90 via-slate-900/90 to-cyan-950/40 border border-cyan-500/30 rounded-3xl space-y-1.5 shadow-xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black font-syne text-white tracking-tight">
                ₹{currentPrice.toLocaleString('en-IN')}
              </span>
              {currentOriginalPrice > currentPrice && (
                <span className="text-sm text-slate-500 line-through font-mono">
                  ₹{currentOriginalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>
            <p className="text-[11px] text-cyan-400 font-mono font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Inclusive of all taxes & free spatial delivery nationwide</span>
            </p>
          </div>

          {/* Variants Selector if available */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-2.5">
              <label className="block text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Select Configuration / Color:
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((varItem) => (
                  <button
                    key={varItem.id}
                    onClick={() => setSelectedVariant(varItem)}
                    className={`px-4 py-2.5 rounded-2xl text-xs font-syne font-bold border transition-all ${
                      selectedVariant?.id === varItem.id 
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 border-cyan-300 shadow-lg shadow-cyan-500/30 scale-105' 
                        : 'bg-slate-900/80 text-slate-300 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {varItem.title} — ₹{varItem.price.toLocaleString('en-IN')}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Pincode Serviceability Estimator */}
          <div className="p-4 border border-white/10 rounded-2xl space-y-2.5 bg-slate-950/60 backdrop-blur-md">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-200 uppercase">
              <MapPin className="w-4 h-4 text-cyan-400" />
              <span>Pincode Delivery Estimator</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="Enter 6-digit pincode"
                className="bg-slate-900/90 text-white placeholder-slate-500 border border-white/10 rounded-xl px-3.5 py-2 text-xs w-44 font-mono focus:outline-none focus:border-cyan-400"
              />
              <button 
                onClick={handlePincodeCheck}
                className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-mono font-bold transition-all shadow-md shadow-cyan-500/20"
              >
                CHECK
              </button>
            </div>
            {deliveryAvailable !== null && (
              <p className={`text-xs font-semibold font-mono ${deliveryAvailable ? 'text-cyan-400' : 'text-rose-400'}`}>
                {deliveryAvailable ? '⚡ Priority Express Delivery available by Tomorrow, 5 PM' : 'Invalid or Unserviceable Pincode'}
              </p>
            )}
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">Quantity:</span>
              <div className="flex items-center border border-white/15 rounded-xl overflow-hidden bg-slate-900/80">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-2 text-slate-300 hover:bg-white/10 font-bold transition-colors"
                >
                  -
                </button>
                <span className="px-4 py-2 text-xs font-mono font-bold text-white">{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3.5 py-2 text-slate-300 hover:bg-white/10 font-bold transition-colors"
                >
                  +
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={handleAddToCart}
                className="py-4 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 text-xs font-syne font-black tracking-wider flex items-center justify-center gap-2 border border-white/20 hover:border-cyan-400/50 shadow-xl transition-all group"
              >
                <ShoppingBag className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                <span>ADD TO CART</span>
              </button>
              <button 
                onClick={handleBuyNow}
                className="py-4 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-slate-950 text-xs font-syne font-black tracking-wider shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 transition-all"
              >
                <span>BUY NOW</span>
                <ChevronRight className="w-4 h-4 stroke-[3]" />
              </button>
            </div>
          </div>

          {/* Description */}
          <div className="border-t border-white/10 pt-4 space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">Product Overview</h4>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              {product.description}
            </p>
          </div>
        </div>
      </div>

      {/* Specifications Table Section */}
      {product.specifications && product.specifications.length > 0 && (
        <section className="bg-slate-950/80 border border-white/15 rounded-3xl p-6 sm:p-8 space-y-4 backdrop-blur-2xl shadow-2xl">
          <h3 className="text-lg font-black font-syne text-white uppercase tracking-wider flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Technical Specifications</span>
          </h3>
          <div className="divide-y divide-white/10 text-xs font-mono">
            {product.specifications.map((spec) => (
              <div key={spec.id} className="py-3 grid grid-cols-3 gap-4 hover:bg-white/[0.02] px-2 rounded-lg transition-colors">
                <span className="font-bold text-cyan-400 uppercase tracking-wide">{spec.specKey}</span>
                <span className="col-span-2 text-slate-200">{spec.specValue}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Customer Reviews Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl sm:text-2xl font-black font-syne text-white tracking-tight">Verified Buyer Reviews</h3>
            <p className="text-xs font-mono text-slate-400 mt-0.5">Real feedback from authenticated ShopNova cyber users</p>
          </div>
          {user && (
            <button 
              onClick={() => setShowReviewModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 rounded-xl text-xs font-syne font-bold flex items-center gap-2 shadow-lg shadow-cyan-500/20"
            >
              <MessageSquare className="w-4 h-4" />
              <span>WRITE REVIEW</span>
            </button>
          )}
        </div>

        {/* Review Submission Modal */}
        {showReviewModal && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-950 border border-cyan-500/30 rounded-3xl p-6 w-full max-w-lg space-y-4 shadow-2xl">
              <h4 className="text-lg font-black font-syne text-white">Review {product.title}</h4>
              <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1">Rating (1-5 Stars)</label>
                  <select
                    value={reviewRating}
                    onChange={(e) => setReviewRating(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-white/10 text-white p-2.5 rounded-xl font-mono"
                  >
                    <option value={5}>5 Stars — Exceptional Flagship</option>
                    <option value={4}>4 Stars — Very Good</option>
                    <option value={3}>3 Stars — Average</option>
                    <option value={2}>2 Stars — Needs Improvement</option>
                    <option value={1}>1 Star — Disappointing</option>
                  </select>
                </div>
                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g., Mindblowing spatial audio and premium finish!"
                    className="w-full bg-slate-900 border border-white/10 text-white p-2.5 rounded-xl placeholder-slate-500"
                  />
                </div>
                <div>
                  <label className="block font-mono font-bold text-slate-300 mb-1">Detailed Comment</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Describe build quality, real-world experience..."
                    className="w-full bg-slate-900 border border-white/10 text-white p-2.5 rounded-xl placeholder-slate-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                  <button type="button" onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-slate-400 font-mono">CANCEL</button>
                  <button type="submit" className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl font-mono font-bold">SUBMIT</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Reviews List */}
        <div className="space-y-4">
          {product.reviews && product.reviews.length > 0 ? (
            product.reviews.map((rev) => (
              <div key={rev.id} className="p-5 bg-slate-950/60 border border-white/10 rounded-2xl space-y-2 backdrop-blur-md">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">{rev.user?.name || 'Verified Customer'}</span>
                    {rev.isVerifiedPurchase && (
                      <span className="px-2.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-bold rounded-full text-[9px]">
                        VERIFIED PURCHASE
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500">{new Date(rev.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-700'}`} />
                  ))}
                </div>
                <h4 className="text-xs font-bold text-white font-syne">{rev.title}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          ) : (
            <div className="p-6 text-center bg-slate-950/40 border border-white/10 rounded-2xl">
              <p className="text-xs text-slate-400 font-mono">No customer reviews yet. Be the first to rate this spatial product!</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

