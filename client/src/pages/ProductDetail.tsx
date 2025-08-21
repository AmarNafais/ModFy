import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { type ProductWithCategory } from "@shared/schema";
import { useCart } from "@/hooks/useCart";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ProductDetail() {
  const { slug } = useParams();
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const { addToCart, isAddingToCart } = useCart();
  const { toast } = useToast();

  const { data: product, isLoading } = useQuery<ProductWithCategory>({
    queryKey: ['/api/products', slug],
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

    addToCart({
      productId: product.id,
      size: selectedSize,
      color: selectedColor,
      quantity,
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
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
          <div>
            <div className="aspect-[3/4] mb-4">
              <img 
                src={product.images?.[selectedImageIndex] || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600'} 
                alt={product.name}
                className="w-full h-full object-cover"
                data-testid="product-main-image"
              />
            </div>
            
            {(product.images?.length || 0) > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images?.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square border-2 ${
                      selectedImageIndex === index ? 'border-luxury-black' : 'border-transparent'
                    }`}
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
              <h1 className="text-3xl font-light tracking-wide mb-2" data-testid="product-title">
                {product.name}
              </h1>
              <p className="text-xl font-medium mb-4" data-testid="product-price">
                ${product.price}
              </p>
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
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  data-testid="button-decrease-quantity"
                >
                  -
                </button>
                <span className="text-lg font-medium" data-testid="product-quantity">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 border border-gray-300 flex items-center justify-center hover:bg-gray-100"
                  data-testid="button-increase-quantity"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <Button
              onClick={handleAddToCart}
              disabled={isAddingToCart || !selectedSize || !selectedColor}
              className="w-full bg-luxury-black text-white hover:bg-gray-800 py-3 text-sm font-medium tracking-wide"
              data-testid="button-add-to-cart"
            >
              {isAddingToCart ? "ADDING TO CART..." : "ADD TO CART"}
            </Button>

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
