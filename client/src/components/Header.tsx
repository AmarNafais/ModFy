import { Link, useLocation } from "wouter";
import { Search, User, ShoppingBag, Menu, LogOut, Heart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useAuth } from "@/hooks/useAuth";
import { useWishlist } from "@/hooks/useWishlist";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeaderProps {
  onCartOpen: () => void;
}

export default function Header({ onCartOpen }: HeaderProps) {
  const [location] = useLocation();
  const { itemCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const { user, isAuthenticated, logout, isLoggingOut } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  // Fetch categories for the mega menu
  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  const is_active = (path: string) => location === path;

  // Group categories by parent
  const mainCategories = Array.isArray(categories)
    ? categories.filter((cat: any) => !cat.parent_id)
    : [];

  const getSubcategories = (parentId: string) => {
    return Array.isArray(categories)
      ? categories.filter((cat: any) => cat.parent_id === parentId)
      : [];
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-luxury-white/95 backdrop-blur-sm border-b border-luxury-muted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div
              className="relative"
              onMouseEnter={() => setShowCategoryMenu(true)}
              onMouseLeave={() => setShowCategoryMenu(false)}
            >
              <Link href="/shop" data-testid="link-shop" className={`text-sm font-light tracking-wide hover:text-gray-600 transition-colors ${is_active('/shop') ? 'text-gray-900' : ''}`}>
                SHOP
              </Link>

              {/* Mega Menu */}
              {showCategoryMenu && mainCategories.length > 0 && (
                <div className="absolute left-0 top-full pt-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="bg-white border border-gray-200 shadow-lg rounded-md p-6 min-w-[600px]">
                    <div className="grid grid-cols-2 gap-8">
                      {mainCategories.map((category: any) => {
                        const subcategories = getSubcategories(category.id);
                        return (
                          <div key={category.id} className="space-y-3">
                            <a
                              href={`/shop?categoryId=${category.id}`}
                              onClick={(e) => {
                                e.preventDefault();
                                window.history.pushState({}, '', `/shop?categoryId=${category.id}`);
                                window.dispatchEvent(new Event('locationchange'));
                                setShowCategoryMenu(false);
                              }}
                            >
                              <h3 className="font-medium text-sm tracking-wide uppercase hover:text-gray-600 transition-colors cursor-pointer">
                                {category.name}
                              </h3>
                            </a>
                            {subcategories.length > 0 && (
                              <ul className="space-y-2 pl-2">
                                {subcategories.map((sub: any) => (
                                  <li key={sub.id}>
                                    <a
                                      href={`/shop?categoryId=${category.id}&subcategoryId=${sub.id}`}
                                      onClick={(e) => {
                                        e.preventDefault();
                                        window.history.pushState({}, '', `/shop?categoryId=${category.id}&subcategoryId=${sub.id}`);
                                        window.dispatchEvent(new Event('locationchange'));
                                        setShowCategoryMenu(false);
                                      }}
                                    >
                                      <span className="text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                                        {sub.name}
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <Link href="/about" data-testid="link-about" className={`text-sm font-light tracking-wide hover:text-gray-600 transition-colors ${is_active('/about') ? 'text-gray-900' : ''}`}>
              ABOUT
            </Link>
            <Link href="/contact" data-testid="link-contact" className={`text-sm font-light tracking-wide hover:text-gray-600 transition-colors ${is_active('/contact') ? 'text-gray-900' : ''}`}>
              CONTACT
            </Link>
            {(user as any)?.role === 'admin' && (
              <Link href="/admin" data-testid="link-admin" className={`text-sm font-light tracking-wide hover:text-gray-600 transition-colors ${is_active('/admin') ? 'text-gray-900' : ''}`}>
                ADMIN
              </Link>
            )}
          </div>

          {/* Brand Logo */}
          <div className="flex-shrink-0">
            <Link href="/" data-testid="link-home" className="flex items-center">
              <img src="/storage/logo/logo.svg" alt="ModFy" className="h-12" />
            </Link>
          </div>

          {/* Right Navigation */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors p-0 h-auto flex items-center"
                    data-testid="button-user-menu"
                  >
                    <User size={18} className="flex-shrink-0" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm font-medium">
                    {user?.firstName} {user?.lastName}
                  </div>
                  <div className="px-2 py-1.5 text-sm text-gray-600">
                    {user?.email}
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/profile">
                    <DropdownMenuItem data-testid="button-profile">
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={logout}
                    disabled={isLoggingOut}
                    className="text-red-600 focus:text-red-600"
                    data-testid="button-logout"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    {isLoggingOut ? 'Signing out...' : 'Sign out'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link href="/auth">
                <button className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors flex items-center" data-testid="link-login">
                  <User size={18} className="flex-shrink-0" />
                </button>
              </Link>
            )}
            <Link href="/wishlist">
              <button
                className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors relative flex items-center"
                data-testid="button-wishlist"
              >
                <Heart size={18} className="flex-shrink-0" />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-luxury-black text-luxury-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
            </Link>
            <button
              className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors relative flex items-center"
              onClick={onCartOpen}
              data-testid="button-cart"
            >
              <ShoppingBag size={18} className="flex-shrink-0" />
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

              {/* Mobile Shop with Categories */}
              <div>
                <div className="flex items-center gap-2">
                  <Link href="/shop">
                    <a
                      className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors"
                      data-testid="link-shop-mobile"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowCategoryMenu(false);
                      }}
                    >
                      SHOP
                    </a>
                  </Link>
                  <button
                    onClick={() => setShowCategoryMenu(!showCategoryMenu)}
                    className="text-xs hover:text-gray-600 transition-colors"
                    data-testid="button-categories-toggle-mobile"
                  >
                    {showCategoryMenu ? '▼' : '▶'}
                  </button>
                </div>

                {showCategoryMenu && (
                  <div className="mt-2 pl-4 space-y-3">
                    {mainCategories.map((category: any) => {
                      const subcategories = getSubcategories(category.id);
                      return (
                        <div key={category.id} className="space-y-2">
                          <a
                            href={`/shop?categoryId=${category.id}`}
                            onClick={(e) => {
                              e.preventDefault();
                              window.history.pushState({}, '', `/shop?categoryId=${category.id}`);
                              window.dispatchEvent(new Event('locationchange'));
                              setIsMobileMenuOpen(false);
                              setShowCategoryMenu(false);
                            }}
                          >
                            <div className="font-medium text-xs tracking-wide uppercase hover:text-gray-600 transition-colors cursor-pointer">
                              {category.name}
                            </div>
                          </a>
                          {subcategories.length > 0 && (
                            <ul className="space-y-1.5 pl-3">
                              {subcategories.map((sub: any) => (
                                <li key={sub.id}>
                                  <a
                                    href={`/shop?categoryId=${category.id}&subcategoryId=${sub.id}`}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      window.history.pushState({}, '', `/shop?categoryId=${category.id}&subcategoryId=${sub.id}`);
                                      window.dispatchEvent(new Event('locationchange'));
                                      setIsMobileMenuOpen(false);
                                      setShowCategoryMenu(false);
                                    }}
                                  >
                                    <span className="text-xs text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                                      {sub.name}
                                    </span>
                                  </a>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <Link href="/about" data-testid="link-about-mobile">
                <a className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors">
                  ABOUT
                </a>
              </Link>
              <Link href="/contact" data-testid="link-contact-mobile">
                <a className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors">
                  CONTACT
                </a>
              </Link>
              {(user as any)?.role === 'admin' && (
                <Link href="/admin" data-testid="link-admin-mobile">
                  <a className="text-sm font-light tracking-wide hover:text-gray-600 transition-colors">
                    ADMIN
                  </a>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
