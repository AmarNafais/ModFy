import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import type { WishlistItemWithProduct, InsertWishlistItem } from "@shared/schema";

export function useWishlist() {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get wishlist items - only fetch when authenticated
  const { data: wishlistItems = [], isLoading } = useQuery<WishlistItemWithProduct[]>({
    queryKey: ["/api/wishlist", user?.id],
    enabled: isAuthenticated && !!user,
    retry: false,
  });

  // Add to wishlist mutation
  const addToWishlistMutation = useMutation({
    mutationFn: async (data: { productId: string }) => {
      if (!isAuthenticated) {
        toast({
          title: "Login Required",
          description: "Please log in to add items to your wishlist",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1000);
        throw new Error("Authentication required");
      }
      return apiRequest("POST", "/api/wishlist", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
      toast({
        title: "Added to wishlist",
        description: "Product has been added to your wishlist.",
      });
    },
    onError: (error: any) => {
      if (error.message !== "Authentication required") {
        toast({
          title: "Error",
          description: "Failed to add to wishlist. Please try again.",
          variant: "destructive",
        });
      }
    },
  });

  // Remove from wishlist mutation
  const removeFromWishlistMutation = useMutation({
    mutationFn: async (productId: string) => {
      if (!isAuthenticated) {
        toast({
          title: "Login Required",
          description: "Please log in to manage your wishlist",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/auth";
        }, 1000);
        throw new Error("Authentication required");
      }
      return apiRequest("DELETE", `/api/wishlist/${productId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist", user?.id] });
      toast({
        title: "Removed from wishlist",
        description: "Product has been removed from your wishlist.",
      });
    },
    onError: (error: any) => {
      if (error.message !== "Authentication required") {
        toast({
          title: "Error",
          description: "Failed to remove from wishlist. Please try again.",
          variant: "destructive",
        });
      }
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