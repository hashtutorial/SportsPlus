import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { useAuth } from "./AuthContext";
import { Product } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

interface CartItem {
  id: number;
  productId: number;
  userId: number;
  quantity: number;
  product: Product;
}

interface CartContextType {
  cartItems: CartItem[];
  isLoading: boolean;
  addToCart: (product: Product, quantity?: number) => Promise<void>;
  updateQuantity: (id: number, quantity: number) => Promise<void>;
  removeFromCart: (id: number) => Promise<void>;
  clearCart: () => Promise<void>;
  subtotal: number;
  tax: number;
  total: number;
}

// Create initial context with empty cart and no-op functions
const CartContext = createContext<CartContextType>({
  cartItems: [],
  isLoading: false,
  addToCart: async () => {},
  updateQuantity: async () => {},
  removeFromCart: async () => {},
  clearCart: async () => {},
  subtotal: 0,
  tax: 0,
  total: 0,
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();

  // Fetch cart items when authenticated
  useEffect(() => {
    const fetchCartItems = async () => {
      if (!isAuthenticated) {
        setCartItems([]);
        return;
      }

      setIsLoading(true);
      try {
        const response = await fetch("/api/cart", {
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setCartItems(data);
        } else {
          console.error("Failed to fetch cart items");
          setCartItems([]);
        }
      } catch (error) {
        console.error("Error fetching cart items:", error);
        setCartItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCartItems();
  }, [isAuthenticated]);

  // Calculate cart totals
  const subtotal = cartItems.reduce(
    (total, item) => total + (item.product.salePrice || item.product.price) * item.quantity,
    0
  );
  
  const tax = subtotal * 0.08; // 8% tax rate
  const total = subtotal + tax;

  // Add product to cart
  const addToCart = async (product: Product, quantity = 1) => {
    if (!isAuthenticated) {
      toast({
        title: "Login required",
        description: "Please log in to add items to your cart.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity
      });

      const newCartItem = await response.json();
      
      // Update cart items
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
      // Update local state
      const existingItemIndex = cartItems.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedItems = [...cartItems];
        updatedItems[existingItemIndex] = newCartItem;
        setCartItems(updatedItems);
      } else {
        // Add new item
        setCartItems([...cartItems, newCartItem]);
      }
      
    } catch (error) {
      toast({
        title: "Failed to add item",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Update item quantity
  const updateQuantity = async (id: number, quantity: number) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      const response = await apiRequest("PUT", `/api/cart/${id}`, { quantity });
      const updatedItem = await response.json();
      
      // Update local state
      setCartItems(
        cartItems.map(item => (item.id === id ? updatedItem : item))
      );
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
    } catch (error) {
      toast({
        title: "Failed to update quantity",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove item from cart
  const removeFromCart = async (id: number) => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      await apiRequest("DELETE", `/api/cart/${id}`);
      
      // Update local state
      setCartItems(cartItems.filter(item => item.id !== id));
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
    } catch (error) {
      toast({
        title: "Failed to remove item",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    try {
      await apiRequest("DELETE", "/api/cart");
      
      // Update local state
      setCartItems([]);
      
      // Invalidate query cache
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      
    } catch (error) {
      toast({
        title: "Failed to clear cart",
        description: error.message || "Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        isLoading,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        subtotal,
        tax,
        total
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
