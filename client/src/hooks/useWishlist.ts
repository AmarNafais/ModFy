import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { WishlistItemWithProduct, InsertWishlistItem } from "@shared/schema";

export function useWishlist() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get wishlist items
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItemWithProduct[]>({
    queryKey: ["/api/wishlist"],
    retry: false,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (data: { productId: string }) =>
      apiRequest("/api/wishlist", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) =>
      apiRequest(`/api/wishlist/${productId}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from wishlist. Please try again.",
        variant: "destructive",
      });
    },
  });

  const addToWishlist = (productId: string) => {
    addToWishlistMutation.mutate({ productId });
  };

  const removeFromWishlist = (productId: string) => {
    removeFromWishlistMutation.mutate(productId);
  };

  const isInWishlist = (productId: string) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  const toggleWishlist = (productId: string) => {
    if (isInWishlist(productId)) {
      removeFromWishlist(productId);
    } else {
      addToWishlist(productId);
    }
  };

  return {
    wishlistItems,
    isLoading,
    addToWishlist,
    removeFromWishlist,
    toggleWishlist,
    isInWishlist,
    itemCount: wishlistItems.length,
    isAddingToWishlist: addToWishlistMutation.isPending,
    isRemovingFromWishlist: removeFromWishlistMutation.isPending,
  };
}