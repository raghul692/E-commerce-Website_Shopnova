import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { CartProvider } from './context/CartContext.tsx';
import { Header } from './components/Header.tsx';
import { Footer } from './components/Footer.tsx';

import { HomePage } from './pages/HomePage.tsx';
import { ProductListingPage } from './pages/ProductListingPage.tsx';
import { ProductDetailPage } from './pages/ProductDetailPage.tsx';
import { CartPage } from './pages/CartPage.tsx';
import { CheckoutPage } from './pages/CheckoutPage.tsx';
import { OrderSuccessPage } from './pages/OrderSuccessPage.tsx';
import { CustomerDashboard } from './pages/CustomerDashboard.tsx';
import { SellerDashboardPage } from './pages/SellerDashboardPage.tsx';
import { AdminDashboardPage } from './pages/AdminDashboardPage.tsx';
import { AuthPages } from './pages/AuthPages.tsx';

import { CustomCursor } from './components/CustomCursor.tsx';

export function App() {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParams, setViewParams] = useState<any>({});

  const handleNavigate = (view: string, params: any = {}) => {
    setCurrentView(view);
    setViewParams(params);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <ThemeProvider>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
            <CustomCursor />
            <Header onNavigate={handleNavigate} currentView={currentView} />

            <main className="flex-1">
              {currentView === 'home' && <HomePage onNavigate={handleNavigate} />}
              {currentView === 'products' && <ProductListingPage onNavigate={handleNavigate} initialParams={viewParams} />}
              {currentView === 'product-detail' && <ProductDetailPage onNavigate={handleNavigate} slug={viewParams.slug} />}
              {currentView === 'cart' && <CartPage onNavigate={handleNavigate} />}
              {currentView === 'checkout' && <CheckoutPage onNavigate={handleNavigate} />}
              {currentView === 'order-success' && <OrderSuccessPage onNavigate={handleNavigate} order={viewParams.order} />}
              {currentView === 'customer-dashboard' && <CustomerDashboard onNavigate={handleNavigate} />}
              {currentView === 'seller-dashboard' && <SellerDashboardPage onNavigate={handleNavigate} />}
              {currentView === 'admin-dashboard' && <AdminDashboardPage onNavigate={handleNavigate} />}
              {currentView === 'auth' && <AuthPages onNavigate={handleNavigate} />}
              {currentView === 'wishlist' && <ProductListingPage onNavigate={handleNavigate} initialParams={{ wishlist: true }} />}
            </main>

            <Footer onNavigate={handleNavigate} />
          </div>
        </CartProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
