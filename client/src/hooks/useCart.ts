import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { CartItemWithProduct, InsertCartItem } from "@shared/schema";

export function useCart() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get cart items - fetch for both authenticated users and guest sessions
  // Use a stable key that doesn't depend on user auth status
  const { data: cartItems = [], isLoading } = useQuery<CartItemWithProduct[]>({
    queryKey: ["/api/cart"],
    retry: false,
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (data: { productId: string; size?: string; color?: string; quantity?: number }) => {
      return apiRequest("POST", "/api/cart", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Added to cart",
        description: "Product has been added to your cart.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to add to cart. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Update cart item quantity mutation
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      return apiRequest("PUT", `/api/cart/${id}`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      });
    },
  });

  // Remove from cart mutation
  const removeFromCartMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiRequest("DELETE", `/api/cart/${id}`);
      return id;
    },
    onSuccess: () => {
      // Force refetch from server instead of manually updating cache
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      queryClient.refetchQueries({ queryKey: ["/api/cart"] });
      
      toast({
        title: "Removed from cart",
        description: "Product has been removed from your cart.",
      });
    },
    onError: (error: any) => {
      console.error("Error removing from cart:", error);
      toast({
        title: "Error",
        description: "Failed to remove from cart.",
        variant: "destructive",
      });
    },
  });

  // Clear cart mutation
  const clearCartMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("DELETE", "/api/cart/clear");
      // Don't try to parse JSON from 204 No Content response
      if (response.status === 204) {
        return null;
      }
      return response;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    },
    onError: (error: any) => {
      console.error("Error clearing cart:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      });
    },
  });

  // Helper functions
  const addToCart = (productId: string, options?: { size?: string; color?: string; quantity?: number }) => {
    addToCartMutation.mutate({ 
      productId, 
      size: options?.size,
      color: options?.color,
      quantity: options?.quantity || 1 
    });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCartMutation.mutate(id);
    } else {
      updateCartItemMutation.mutate({ id, quantity });
    }
  };

  const removeFromCart = (id: string) => {
    removeFromCartMutation.mutate(id);
  };

  const clearCart = () => {
    clearCartMutation.mutate();
  };

  const isInCart = (productId: string, size?: string, color?: string) => {
    return cartItems.some(item => 
      item.productId === productId && 
      item.size === size && 
      item.color === color
    );
  };

  // Calculate totals
  const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = cartItems.reduce((sum, item) => {
    // Use size-specific price if available, otherwise use base price
    let price = parseFloat(item.product?.price || "0");
    if (item.size && item.product?.sizePricing && item.product.sizePricing[item.size]) {
      price = parseFloat(item.product.sizePricing[item.size]);
    }
    return sum + (price * item.quantity);
  }, 0);

  return {
    cartItems,
    isLoading,
    totalQuantity,
    totalAmount,
    // Keep old naming for compatibility
    itemCount: totalQuantity,
    total: totalAmount,
    addToCart,
    updateQuantity,
    removeFromCart,
    removeItem: removeFromCart, // Alias for compatibility
    clearCart,
    isInCart,
    isAddingToCart: addToCartMutation.isPending,
    isUpdatingCart: updateCartItemMutation.isPending,
    isRemovingFromCart: removeFromCartMutation.isPending,
    isClearingCart: clearCartMutation.isPending,
  };
}
