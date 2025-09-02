import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type ProductWithCategory } from "@shared/schema";
import { useCart } from "@/hooks/useCart";
import { useWishlist } from "@/hooks/useWishlist";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, ChevronLeft, ChevronRight, Plus, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { slug } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addToCart, isAddingToCart } = useCart();
  const { toggleWishlist, isInWishlist, isAddingToWishlist } = useWishlist();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<ProductWithCategory>({
    queryKey: [`/api/products/${slug}`],
    enabled: !!slug,
  });

  const handleAddToCart = () => {
    if (!product || !selectedSize || !selectedColor) {
      toast({
        title: "Please select options",
        description: "Please select both size and color before adding to cart.",
        variant: "destructive",
      });
      return;
    }

    addToCart(product.id, {
      size: selectedSize,
      color: selectedColor,
      quantity,
    });
  };

  const handleWishlistToggle = () => {
    if (!product) return;
    toggleWishlist(product.id);
  };

  const handleQuantityChange = (increment: boolean) => {
    if (increment && quantity < 10) {
      setQuantity(quantity + 1);
    } else if (!increment && quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleImageNavigation = (direction: 'prev' | 'next') => {
    if (!product?.images?.length) return;

    if (direction === 'prev') {
      setSelectedImageIndex(selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1);
    } else {
      setSelectedImageIndex(selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1);
    }
  };

  if (isLoading) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <p className="text-gray-600 font-light">Loading product...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-16">
            <h1 className="text-2xl font-light tracking-wide mb-4">Product Not Found</h1>
            <p className="text-gray-600 font-light">The product you're looking for doesn't exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

          {/* Product Images */}
          <div className="relative">
            <div className="aspect-[3/4] mb-4 relative group">
              <img
                src={product.images?.[selectedImageIndex] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'}
                alt={product.name}
                className="w-full h-full object-cover rounded-sm"
                data-testid="product-main-image"
                key={selectedImageIndex}
              />

              {/* Navigation arrows */}
              {product.images && product.images.length > 1 && (
                <>
                  <button
                    onClick={() => handleImageNavigation('prev')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid="button-prev-image"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => handleImageNavigation('next')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                    data-testid="button-next-image"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={cn(
                      "aspect-square border-2 rounded-sm overflow-hidden transition-all",
                      selectedImageIndex === index
                        ? "border-luxury-black"
                        : "border-gray-200 hover:border-gray-400"
                    )}
                    data-testid={`product-image-${index}`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:pl-8">
            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-light tracking-wide mb-2" data-testid="product-title">
                    {product.name}
                  </h1>
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-2xl font-medium text-luxury-black" data-testid="product-price">
                      LKR {parseFloat(product.price).toFixed(2)}
                    </p>
                    <div className="text-sm text-green-600 font-medium">
                      {product.stock_quantity && product.stock_quantity > 0 ? 'In Stock' : 'Out of Stock'}
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleWishlistToggle}
                  disabled={isAddingToWishlist}
                  className={cn(
                    "p-2 rounded-full border transition-all",
                    isInWishlist(product.id)
                      ? "bg-red-50 border-red-200 text-red-600 hover:bg-red-100"
                      : "bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:text-red-500"
                  )}
                  data-testid="button-wishlist"
                >
                  <Heart
                    size={20}
                    className={isInWishlist(product.id) ? "fill-current" : ""}
                  />
                </button>
              </div>
              {product.category && (
                <p className="text-sm text-gray-600 font-light tracking-wide">
                  {product.category.name.toUpperCase()}
                </p>
              )}
            </div>

            {product.description && (
              <div className="mb-8">
                <p className="text-gray-600 font-light leading-relaxed" data-testid="product-description">
                  {product.description}
                </p>
              </div>
            )}

            {/* Material Info */}
            {product.material && (
              <div className="mb-6">
                <h3 className="text-sm font-medium tracking-wide mb-2">MATERIAL</h3>
                <p className="text-sm text-gray-600 font-light" data-testid="product-material">
                  {product.material}
                </p>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium tracking-wide mb-3">SIZE</h3>
                <Select value={selectedSize} onValueChange={setSelectedSize}>
                  <SelectTrigger className="w-full" data-testid="select-size">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.sizes.map((size) => (
                      <SelectItem key={size} value={size}>
                        {size}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-medium tracking-wide mb-3">COLOR</h3>
                <Select value={selectedColor} onValueChange={setSelectedColor}>
                  <SelectTrigger className="w-full" data-testid="select-color">
                    <SelectValue placeholder="Select color" />
                  </SelectTrigger>
                  <SelectContent>
                    {product.colors.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Quantity */}
            <div className="mb-8">
              <h3 className="text-sm font-medium tracking-wide mb-3">QUANTITY</h3>
              <div className="flex items-center gap-3 max-w-xs">
                <button
                  onClick={() => handleQuantityChange(false)}
                  disabled={quantity <= 1}
                  className={cn(
                    "w-10 h-10 border rounded-sm flex items-center justify-center transition-colors",
                    quantity <= 1
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  )}
                  data-testid="button-decrease-quantity"
                >
                  <Minus size={16} />
                </button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-medium px-4" data-testid="product-quantity">
                    {quantity}
                  </span>
                </div>
                <button
                  onClick={() => handleQuantityChange(true)}
                  disabled={quantity >= 10}
                  className={cn(
                    "w-10 h-10 border rounded-sm flex items-center justify-center transition-colors",
                    quantity >= 10
                      ? "border-gray-200 text-gray-300 cursor-not-allowed"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100"
                  )}
                  data-testid="button-increase-quantity"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="space-y-3">
              <Button
                onClick={handleAddToCart}
                disabled={isAddingToCart || !selectedSize || !selectedColor || (product.stock_quantity !== null && product.stock_quantity <= 0)}
                className="w-full bg-luxury-black text-white hover:bg-gray-800 py-3 text-sm font-medium tracking-wide transition-colors"
                data-testid="button-add-to-cart"
              >
                {isAddingToCart ? "ADDING TO CART..." : "ADD TO CART"}
              </Button>

              {/* Quick info */}
              <div className="text-xs text-gray-500 space-y-1">
                <p>• Free shipping on orders over LKR 7,500</p>
                <p>• 30-day returns & exchanges</p>
                <p>• Premium quality guaranteed</p>
              </div>
            </div>

            {/* Product Details */}
            <div className="mt-12 space-y-4">
              <details className="border-t border-luxury-muted pt-4">
                <summary className="text-sm font-medium tracking-wide cursor-pointer">DETAILS</summary>
                <div className="mt-4 text-sm text-gray-600 font-light">
                  <p>Premium quality materials and construction ensure lasting comfort and durability.</p>
                </div>
              </details>

              <details className="border-t border-luxury-muted pt-4">
                <summary className="text-sm font-medium tracking-wide cursor-pointer">SIZE GUIDE</summary>
                <div className="mt-4 text-sm text-gray-600 font-light">
                  <p>Refer to our size guide for the perfect fit. All measurements are in inches.</p>
                </div>
              </details>

              <details className="border-t border-luxury-muted pt-4">
                <summary className="text-sm font-medium tracking-wide cursor-pointer">CARE INSTRUCTIONS</summary>
                <div className="mt-4 text-sm text-gray-600 font-light">
                  <p>Machine wash cold with like colors. Tumble dry low. Do not bleach or iron.</p>
                </div>
              </details>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
