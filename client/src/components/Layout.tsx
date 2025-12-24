import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CartDrawer from "./CartDrawer";
import { useScrollToTop } from "@/hooks/useScrollToTop";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Scroll to top on route changes
  useScrollToTop();

  return (
    <div className="min-h-screen bg-luxury-bg">
      <Header
        onCartOpen={() => setIsCartOpen(true)}
      />
      <main>{children}</main>
      <Footer />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
