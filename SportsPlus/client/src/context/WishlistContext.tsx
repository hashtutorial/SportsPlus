import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface WishlistItem {
  id: number;
  productId: number;
  userId: number;
  product: Product;
}

interface WishlistContextType {
  wishlistItems: WishlistItem[];
  isLoading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: number) => Promise<void>;
  isInWishlist: (productId: number) => boolean;
}

// Create initial context with empty favorites list and no-op functions
const WishlistContext = createContext<WishlistContextType>({
  wishlistItems: [],
  isLoading: false,
  addToWishlist: async () => {},
  removeFromWishlist: async () => {},
  isInWishlist: () => false,
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch favorites items when authenticated
  useEffect(() => {
    const fetchWishlistItems = async () => {
      if (!isAuthenticated) {
        setWishlistItems([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/wishlist", {
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setWishlistItems(data);
        } else {
          console.error("Failed to fetch wishlist items");
          setWishlistItems([]);
        }
      } catch (error) {
        console.error("Error fetching wishlist items:", error);
        setWishlistItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWishlistItems();
  }, [isAuthenticated]);

  // Check if product is in favorites
  const isInWishlist = (productId: number) => {
    return wishlistItems.some(item => item.productId === productId);
  };

  // Add product to favorites
  const addToWishlist = async (product: Product) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your favorites.",
        variant: "destructive"
      });
      return;
    }

    if (isInWishlist(product.id)) {
      // Already in wishlist
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/wishlist", {
        productId: product.id
      });

      const newWishlistItem = await response.json();
      
      // Update wishlist items
      setWishlistItems([...wishlistItems, newWishlistItem]);
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      
    } catch (error) {
      toast({
        title: "Failed to add to favorites",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove from favorites
  const removeFromWishlist = async (productId: number) => {
    if (!isAuthenticated) return;

    const wishlistItem = wishlistItems.find(item => item.productId === productId);
    if (!wishlistItem) return;

    setIsLoading(true);
    try {
      await apiRequest("DELETE", `/api/wishlist/${wishlistItem.id}`);
      
      // Update local state
      setWishlistItems(wishlistItems.filter(item => item.id !== wishlistItem.id));
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
      
    } catch (error) {
      toast({
        title: "Failed to remove from favorites",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
