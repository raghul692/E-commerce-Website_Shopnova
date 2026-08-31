import React, { useState, useRef } from 'react';
import { RotateCw, MoveHorizontal, Sparkles } from 'lucide-react';

interface Product360ViewerProps {
  images: string[];
  title?: string;
  productTitle?: string;
}

export const Product360Viewer: React.FC<Product360ViewerProps> = ({ images, title, productTitle }) => {
  const displayTitle = title || productTitle || 'Product';

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const startXRef = useRef(0);

  // Fallback images if fewer than 4 images are passed
  const displayImages =
    images.length >= 2
      ? images
      : [
          images[0] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
          'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=800&q=80',
          'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
        ];

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - startXRef.current;
    if (Math.abs(deltaX) > 20) {
      if (deltaX > 0) {
        setCurrentIndex((prev) => (prev + 1) % displayImages.length);
      } else {
        setCurrentIndex((prev) => (prev - 1 + displayImages.length) % displayImages.length);
      }
      startXRef.current = e.clientX;
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const rotateAuto = () => {
    setCurrentIndex((prev) => (prev + 1) % displayImages.length);
  };

  return (
    <div className="relative group w-full aspect-square max-w-lg mx-auto rounded-3xl overflow-hidden glass-card p-4 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing select-none">
      {/* 360 Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-brand-cyan text-xs font-semibold tracking-wide border border-brand-cyan/30 shadow-lg">
        <RotateCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '8s' }} />
        <span>360° Interactive View</span>
      </div>

      {/* Specular Ambient Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-brand-violet/20 via-transparent to-brand-cyan/20 pointer-events-none" />

      {/* Main Image */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        className="w-full h-full flex items-center justify-center p-6 transition-all duration-300 transform group-hover:scale-105"
      >
        <img
          src={displayImages[currentIndex]}
          alt={`${displayTitle} 360 degree frame ${currentIndex + 1}`}
          className="max-h-full max-w-full object-contain filter drop-shadow-[0_20px_30px_rgba(0,0,0,0.3)] transition-all duration-200"
        />
      </div>

      {/* Control overlay */}
      <div className="absolute bottom-4 inset-x-4 z-10 flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-950/70 backdrop-blur-md border border-white/10 text-slate-300 text-xs">
        <div className="flex items-center gap-1.5">
          <MoveHorizontal className="w-4 h-4 text-brand-cyan animate-pulse" />
          <span>Drag horizontally to rotate 3D view</span>
        </div>
        <button
          onClick={rotateAuto}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors"
        >
          <Sparkles className="w-3 h-3" />
          <span>Step ({currentIndex + 1}/{displayImages.length})</span>
        </button>
      </div>
    </div>
  );
};
