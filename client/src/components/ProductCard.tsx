import React from 'react';
import { Star, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '../types.js';
import { useCart } from '../context/CartContext.tsx';
import { TiltCard3D } from './TiltCard3D.tsx';

interface ProductCardProps {
  product: Product;
  onNavigate: (view: string, param?: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onNavigate }) => {
  const { addToCart, toggleWishlist, isWishlisted } = useCart();
  const wishlisted = isWishlisted(product.id);
  const primaryImage = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80';

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  return (
    <TiltCard3D maxTilt={10} glareOpacity={0.2} className="h-full">
      <div 
        onClick={() => onNavigate('product-detail', { slug: product.slug })}
        className="group glass-card rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full cursor-pointer relative border border-slate-200/80 dark:border-white/10 hover:border-brand-cyan/40"
      >
        {/* Discount Badge */}
        {product.discountPercentage > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-gradient-to-r from-rose-600 to-brand-violet text-white font-extrabold text-[10px] uppercase tracking-wider rounded-lg shadow-lg border border-white/20 backdrop-blur-md">
            {product.discountPercentage}% OFF
          </span>
        )}

        {/* Wishlist Button */}
        <button 
          onClick={handleToggleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className="absolute top-3 right-3 z-10 p-2 rounded-full bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-md text-slate-200 hover:text-rose-400 hover:scale-110 transition-all border border-white/10 shadow-md"
        >
          <Heart className={`w-4 h-4 ${wishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Product Image */}
        <div className="relative aspect-square w-full bg-slate-100/50 dark:bg-slate-900/40 overflow-hidden flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <img 
            src={primaryImage} 
            alt={product.title} 
            className="max-h-full max-w-full object-contain filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.2)] group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        </div>

        {/* Product Info */}
        <div className="p-4 flex-1 flex flex-col justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div>
            {/* Brand & Rating */}
            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
              <span className="font-bold text-brand-600 dark:text-brand-cyan tracking-wider uppercase text-[10px]">
                {product.brand?.name || product.category?.name || 'Flagship'}
              </span>
              <div className="flex items-center gap-1 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full text-[11px] font-bold border border-amber-500/20">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating}</span>
                <span className="text-[10px] text-slate-400 font-normal">({product.reviewCount})</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 group-hover:text-brand-cyan transition-colors">
              {product.title}
            </h3>
          </div>

          <div>
            {/* Price Section */}
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-lg font-black text-slate-900 dark:text-white font-mono">
                ₹{product.price.toLocaleString('en-IN')}
              </span>
              {product.originalPrice > product.price && (
                <span className="text-xs text-slate-400 line-through font-mono">
                  ₹{product.originalPrice.toLocaleString('en-IN')}
                </span>
              )}
            </div>

            {/* Add to Cart CTA */}
            <button 
              onClick={handleAddToCart}
              className="w-full py-2.5 px-3 rounded-xl bg-slate-900 dark:bg-gradient-to-r dark:from-brand-500 dark:to-brand-violet hover:from-brand-cyan hover:to-brand-500 text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md group/btn border border-white/10"
            >
              <ShoppingBag className="w-4 h-4 group-hover/btn:scale-110 transition-transform text-brand-cyan" />
              <span>Add to Cart</span>
            </button>
          </div>
        </div>
      </div>
    </TiltCard3D>
  );
};

