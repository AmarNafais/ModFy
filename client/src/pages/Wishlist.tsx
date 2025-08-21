import { useWishlist } from "@/hooks/useWishlist";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, Trash2, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/useCart";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Wishlist() {
  const { wishlistItems, isLoading, removeFromWishlist, isRemovingFromWishlist } = useWishlist();
  const { addToCart, isAddingToCart } = useCart();
  const { toast } = useToast();
  const [addingToCartId, setAddingToCartId] = useState<string | null>(null);

  const handleAddToCart = async (productId: string, productName: string) => {
    setAddingToCartId(productId);
    
    try {
      await addToCart({
        productId,
        size: "M", // Default size - in a real app, this would be selectable
        color: "Black", // Default color - in a real app, this would be selectable
        quantity: 1,
      });

      toast({
        title: "Added to cart",
        description: `${productName} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Please select size and color on the product page.",
        variant: "destructive",
      });
    } finally {
      setAddingToCartId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-luxury-black mx-auto mb-4"></div>
              <p className="text-gray-600 font-light">Loading your wishlist...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-light tracking-wide mb-4">WISHLIST</h1>
            <p className="text-gray-600 font-light max-w-2xl mx-auto">
              Save your favorite items for later
            </p>
          </div>

          <div className="text-center min-h-96 flex items-center justify-center">
            <div>
              <Heart className="h-16 w-16 text-gray-300 mx-auto mb-6" />
              <h2 className="text-2xl font-light tracking-wide mb-4 text-gray-800">Your wishlist is empty</h2>
              <p className="text-gray-600 font-light mb-8 max-w-md mx-auto">
                Start browsing our collection and add items you love to your wishlist.
              </p>
              <Link href="/shop">
                <Button 
                  className="bg-luxury-black text-white hover:bg-gray-800 px-8 py-3 text-sm font-medium tracking-wide"
                  data-testid="button-shop-now"
                >
                  SHOP NOW
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Page Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-light tracking-wide mb-4">WISHLIST</h1>
          <p className="text-gray-600 font-light max-w-2xl mx-auto">
            {wishlistItems.length} {wishlistItems.length === 1 ? 'item' : 'items'} saved
          </p>
        </div>

        {/* Wishlist Items Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8" data-testid="wishlist-grid">
          {wishlistItems.map((item) => (
            <div key={item.id} className="group relative" data-testid={`wishlist-item-${item.productId}`}>
              
              {/* Remove Button */}
              <button
                onClick={() => removeFromWishlist(item.productId!)}
                disabled={isRemovingFromWishlist}
                className="absolute top-4 right-4 z-10 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-all duration-200"
                data-testid={`button-remove-${item.productId}`}
              >
                <Trash2 size={16} className="text-gray-600" />
              </button>

              {/* Product Image */}
              <Link href={`/products/${item.product.slug}`}>
                <div className="aspect-[3/4] overflow-hidden mb-4 cursor-pointer">
                  <img 
                    src={item.product.images?.[0] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'} 
                    alt={item.product.name}
                    className="w-full h-full object-cover group-hover:opacity-95 transition-opacity" 
                  />
                </div>
              </Link>

              {/* Product Details */}
              <div className="space-y-3">
                <div>
                  <Link href={`/products/${item.product.slug}`}>
                    <h3 className="text-lg font-light tracking-wide hover:text-gray-600 transition-colors" data-testid={`product-name-${item.productId}`}>
                      {item.product.name}
                    </h3>
                  </Link>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-lg font-medium" data-testid={`product-price-${item.productId}`}>
                      ${item.product.price}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2">
                  <Link href={`/products/${item.product.slug}`}>
                    <Button 
                      variant="outline" 
                      className="w-full text-sm font-medium tracking-wide"
                      data-testid={`button-view-product-${item.productId}`}
                    >
                      VIEW PRODUCT
                    </Button>
                  </Link>
                  
                  <Button
                    onClick={() => handleAddToCart(item.productId!, item.product.name)}
                    disabled={addingToCartId === item.productId || isAddingToCart}
                    className="w-full bg-luxury-black text-white hover:bg-gray-800 text-sm font-medium tracking-wide"
                    data-testid={`button-add-to-cart-${item.productId}`}
                  >
                    {addingToCartId === item.productId ? (
                      "ADDING..."
                    ) : (
                      <>
                        <ShoppingCart size={16} className="mr-2" />
                        QUICK ADD TO CART
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Continue Shopping */}
        <div className="text-center mt-16 pt-8 border-t border-luxury-muted">
          <Link href="/shop">
            <Button 
              variant="outline"
              className="px-8 py-3 text-sm font-medium tracking-wide"
              data-testid="button-continue-shopping"
            >
              CONTINUE SHOPPING
            </Button>
          </Link>
        </div>

      </div>
    </div>
  );
}