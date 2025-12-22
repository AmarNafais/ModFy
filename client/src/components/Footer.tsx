import { Link } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch("/api/contact-settings");
        const data = await response.json();
        setSettings(data);
      } catch (error) {
        console.error("Failed to fetch contact settings:", error);
      }
    };

    fetchSettings();
  }, []);

  return (
    <footer className="bg-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">

          {/* Company Info */}
          <div>
            <h3 className="text-sm font-medium tracking-wide mb-4">MODFY</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" data-testid="link-footer-about">
                  <a className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">About</a>
                </Link>
              </li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Careers</a></li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Press</a></li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Stores</a></li>
            </ul>
          </div>

          {/* Shop */}
          <div>
            <h3 className="text-sm font-medium tracking-wide mb-4">SHOP</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" data-testid="link-footer-shop">
                  <a className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">All Products</a>
                </Link>
              </li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Boxer Briefs</a></li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Briefs</a></li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Trunks</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h3 className="text-sm font-medium tracking-wide mb-4">HELP</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Size Guide</a></li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Shipping</a></li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Returns</a></li>
              <li><a href="#" className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-sm font-medium tracking-wide mb-4">NEWSLETTER</h3>
            <p className="text-sm text-gray-600 font-light mb-4">Subscribe to receive updates, access to exclusive deals, and more.</p>
            <button
              className="bg-luxury-black text-white px-6 py-2 text-xs font-medium tracking-wide hover:bg-gray-800 transition-colors"
              data-testid="button-newsletter-subscribe"
            >
              SUBSCRIBE
            </button>
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-luxury-muted pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-6">
              <div className="flex space-x-4">
                <a href={settings?.whatsappUrl || "https://wa.me/94777466766"} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-luxury-black cursor-pointer transition-colors" data-testid="link-whatsapp">
                  <FaWhatsapp className="w-4 h-4" />
                </a>
                <a href={settings?.instagramUrl || "https://www.instagram.com/modfyofficial"} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-luxury-black cursor-pointer transition-colors" data-testid="link-instagram">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href={settings?.facebookUrl || "https://www.facebook.com/share/1BPUVhhXYR/"} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-luxury-black cursor-pointer transition-colors" data-testid="link-facebook">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href={settings?.tiktokUrl || "https://www.tiktok.com/@modfy.official"} target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-luxury-black cursor-pointer transition-colors" data-testid="link-tiktok">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.9 2.9 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.44-.05z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
          <div className="mt-4 text-center">
            <p className="text-xs text-gray-600 font-light">© {new Date().getFullYear()} MODFY</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
