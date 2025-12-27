import { Link, useLocation } from "wouter";
import { FaWhatsapp } from "react-icons/fa";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

export default function Footer() {
  const [settings, setSettings] = useState<any>(null);
  const [, setLocation] = useLocation();

  const { data: categories = [] } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Get main categories (without parent_id)
  const categoryOrder = ['Men', 'Women', 'Boys', 'Girls', 'Unisex'];
  const mainCategories = Array.isArray(categories)
    ? categories.filter((cat: any) => !cat.parent_id).sort((a: any, b: any) => {
      const indexA = categoryOrder.indexOf(a.name);
      const indexB = categoryOrder.indexOf(b.name);
      // If both are in the order array, sort by their position
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      // If only A is in the array, it comes first
      if (indexA !== -1) return -1;
      // If only B is in the array, it comes first
      if (indexB !== -1) return 1;
      // Otherwise sort alphabetically
      return a.name.localeCompare(b.name);
    })
    : [];

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

          {/* ModFy Info */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-medium tracking-wide mb-4">MODFY</h3>
            <p className="text-sm text-gray-600 font-light leading-relaxed">
              ModFy is a local manufacturer and distributor of high-quality innerwear and apparel for men, women, and kids. We focus on delivering everyday essentials that combine comfort, durability, and modern design — all at prices that remain affordable for families.
            </p>
          </div>

          {/* Shop */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-medium tracking-wide mb-4">SHOP</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/shop" data-testid="link-footer-shop">
                  <a
                    className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors"
                    onClick={() => {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                      window.dispatchEvent(new Event('locationchange'));
                    }}
                  >
                    All Products
                  </a>
                </Link>
              </li>
              {mainCategories.map((category: any) => (
                <li key={category.id}>
                  <a
                    href={`/shop?categoryId=${category.id}`}
                    onClick={(e) => {
                      e.preventDefault();
                      setLocation(`/shop?categoryId=${category.id}`);
                      window.dispatchEvent(new Event('locationchange'));
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors cursor-pointer"
                    data-testid={`link-footer-${category.slug}`}
                  >
                    {category.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About and Help */}
          <div className="space-y-8 text-center md:text-left">
            {/* About */}
            <div>
              <h3 className="text-sm font-medium tracking-wide mb-4">ABOUT</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" data-testid="link-footer-about">
                    <a
                      className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors"
                      onClick={() => {
                        window.dispatchEvent(new Event('locationchange'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      About Us
                    </a>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Help */}
            <div>
              <h3 className="text-sm font-medium tracking-wide mb-4">HELP</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/contact" data-testid="link-footer-help-contact">
                    <a
                      className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors"
                      onClick={() => {
                        window.dispatchEvent(new Event('locationchange'));
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                    >
                      Contact Us
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Get In Touch */}
          <div className="text-center md:text-left">
            <h3 className="text-sm font-medium tracking-wide mb-4">GET IN TOUCH</h3>

            {/* Contact Info */}
            <div className="space-y-3 mb-4">
              {settings?.email && (
                <div>
                  <a
                    href={`mailto:${settings.email}`}
                    className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors block"
                  >
                    {settings.email}
                  </a>
                </div>
              )}

              {settings?.phone && (
                <div>
                  <a
                    href={`tel:${settings.phone.replace(/\s/g, '')}`}
                    className="text-sm text-gray-600 font-light hover:text-luxury-black transition-colors block"
                  >
                    {settings.phone}
                  </a>
                </div>
              )}

              {settings?.address && (
                <div>
                  <p className="text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line">
                    {settings.address}
                  </p>
                </div>
              )}
            </div>

            {/* Social Media */}
            {(settings?.instagramUrl || settings?.facebookUrl || settings?.tiktokUrl || settings?.whatsappUrl) && (
              <div>
                <p className="text-xs font-medium text-gray-800 mb-2 uppercase tracking-wide">Follow Us</p>
                <div className="flex gap-3 justify-center md:justify-start">
                  {settings?.instagramUrl && (
                    <a
                      href={settings.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-luxury-black transition-colors"
                      data-testid="link-footer-instagram"
                      aria-label="Instagram"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                      </svg>
                    </a>
                  )}
                  {settings?.facebookUrl && (
                    <a
                      href={settings.facebookUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-luxury-black transition-colors"
                      data-testid="link-footer-facebook"
                      aria-label="Facebook"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                      </svg>
                    </a>
                  )}
                  {settings?.tiktokUrl && (
                    <a
                      href={settings.tiktokUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-luxury-black transition-colors"
                      data-testid="link-footer-tiktok"
                      aria-label="TikTok"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.1 1.82 2.9 2.9 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-.44-.05z" />
                      </svg>
                    </a>
                  )}
                  {settings?.whatsappUrl && (
                    <a
                      href={settings.whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-luxury-black transition-colors"
                      data-testid="link-footer-whatsapp"
                      aria-label="WhatsApp"
                    >
                      <FaWhatsapp className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Bottom Footer */}
        <div className="border-t border-luxury-muted pt-8">
          <div className="text-center">
            <p className="text-xs text-gray-600 font-light">© {new Date().getFullYear()} MODFY</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
