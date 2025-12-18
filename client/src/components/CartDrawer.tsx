import { X, Plus, Minus, Trash2 } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useEffect } from "react";
import { useLocation } from "wouter";

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { cartItems, totalAmount, updateQuantity, removeItem, isLoading } = useCart();
  const [_, setLocation] = useLocation();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${isOpen ? 'block' : 'hidden'}`}>
      {/* Background overlay */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleOverlayClick}
      />

      {/* Cart Panel */}
      <div className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">

          {/* Cart Header */}
          <div className="flex items-center justify-between p-6 border-b border-luxury-muted">
            <h2 className="text-lg font-medium tracking-wide">CART</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-luxury-black transition-colors"
              data-testid="button-close-cart"
            >
              <X size={20} />
            </button>
          </div>

          {/* Free Shipping Banner */}
          <div className="p-4 bg-luxury-gray text-center">
            <p className="text-sm font-light text-gray-600">
              Spend LKR {Math.max(0, 7500 - totalAmount).toFixed(2)} more and get free shipping!
            </p>
          </div>

          {/* Cart Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isLoading ? (
              <div className="text-center py-16">
                <p className="text-sm text-gray-600 font-light">Loading cart...</p>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16" data-testid="empty-cart">
                <h3 className="text-lg font-medium tracking-wide mb-2">YOUR CART IS EMPTY</h3>
                <p className="text-sm text-gray-600 font-light">Continue shopping to find the perfect pieces for you.</p>
              </div>
            ) : (
              <div className="space-y-6" data-testid="cart-items">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex space-x-4" data-testid={`cart-item-${item.id}`}>
                    <img
                      src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'}
                      alt={item.product.name}
                      className="w-16 h-20 object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-medium">{item.product.name}</h4>
                          <p className="text-xs text-gray-600">
                            Size: {item.size} • Color: {item.color}
                          </p>
                        </div>
                        <button
                          className="text-gray-400 hover:text-red-500 transition-colors p-1"
                          onClick={() => {
                            console.log('Delete button clicked for item:', item.id);
                            removeItem(item.id);
                          }}
                          data-testid={`button-delete-${item.id}`}
                          title="Remove item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-sm font-medium">LKR {item.size && item.product.sizePricing && item.product.sizePricing[item.size] ? parseFloat(item.product.sizePricing[item.size]).toFixed(2) : parseFloat(item.product.price).toFixed(2)}</span>
                        <div className="flex items-center space-x-2">
                          <button
                            className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                            onClick={() => item.quantity > 1 ? updateQuantity(item.id, item.quantity - 1) : removeItem(item.id)}
                            data-testid={`button-decrease-${item.id}`}
                          >
                            <Minus size={12} />
                          </button>
                          <span className="text-sm" data-testid={`quantity-${item.id}`}>{item.quantity}</span>
                          <button
                            className="w-6 h-6 border border-gray-300 flex items-center justify-center text-xs hover:bg-gray-100"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            data-testid={`button-increase-${item.id}`}
                          >
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-luxury-muted p-6" data-testid="cart-footer">
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-medium">TOTAL</span>
                <span className="text-lg font-medium" data-testid="cart-total">LKR {totalAmount.toFixed(2)}</span>
              </div>
              <button
                className="w-full bg-luxury-black text-white py-3 text-sm font-medium tracking-wide hover:bg-gray-800 transition-colors"
                data-testid="button-checkout"
                onClick={() => {
                  setLocation('/checkout');
                  onClose();
                }}
              >
                CHECKOUT
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
