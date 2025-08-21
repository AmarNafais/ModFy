import { Link, useLocation } from "wouter";
import { Search, User, ShoppingBag, Menu } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";

interface HeaderProps {
  onCartOpen: () => void;
  onLoginOpen: () => void;
}

export default function Header({ onCartOpen, onLoginOpen }: HeaderProps) {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-luxury-white/95 backdrop-blur-sm border-b border-luxury-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/collections" data-testid="link-collections">
              <a className={`text-sm font-light tracking-wide hover:text-gray-600 transition-colors ${isActive('/collections') ? 'text-gray-900' : ''}`}>
                COLLECTIONS
              </a>
            </Link>
            <Link href="/shop" data-testid="link-shop">
              <a className={`text-sm font-light tracking-wide hover:text-gray-600 transition-colors ${isActive('/shop') ? 'text-gray-900' : ''}`}>
                SHOP
              </a>
            </Link>
            <Link href="/about" data-testid="link-about">
              <a className={`text-sm font-light tracking-wide hover:text-gray-600 transition-colors ${isActive('/about') ? 'text-gray-900' : ''}`}>
                ABOUT
              </a>
            </Link>
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link href="/" data-testid="link-home">
              <a>
                <h1 className="text-xl font-light tracking-wider">MODFY</h1>
              </a>
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-6">
            <button 
              className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors"
              data-testid="button-search"
            >
              <Search size={18} />
            </button>
            <button 
              className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors"
              onClick={onLoginOpen}
              data-testid="button-login"
            >
              <User size={18} />
            </button>
            <button 
              className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors relative"
              onClick={onCartOpen}
              data-testid="button-cart"
            >
              <ShoppingBag size={18} />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-luxury-black text-luxury-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </button>
            <button 
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              <Menu size={18} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-luxury-muted">
            <div className="flex flex-col space-y-4">
              <Link href="/collections" data-testid="link-collections-mobile">
                <a className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors">
                  COLLECTIONS
                </a>
              </Link>
              <Link href="/shop" data-testid="link-shop-mobile">
                <a className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors">
                  SHOP
                </a>
              </Link>
              <Link href="/about" data-testid="link-about-mobile">
                <a className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors">
                  ABOUT
                </a>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
