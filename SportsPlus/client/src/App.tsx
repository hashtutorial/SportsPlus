import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import HomePage from "@/pages/HomePage";
import ProductPage from "@/pages/ProductPage";
import CategoryPage from "@/pages/CategoryPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import ProfilePage from "@/pages/ProfilePage";
import WishlistPage from "@/pages/WishlistPage";
import SearchPage from "@/pages/SearchPage";
import { useAuth, AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import { WishlistProvider } from "./context/WishlistContext";
import { useEffect } from "react";
import { useLocation } from "wouter";

function Router() {
  const { isAuthenticated } = useAuth() || { isAuthenticated: false };
  const [location, setLocation] = useLocation();
  
  // Removed authentication redirects to allow direct access to pages

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/" component={HomePage} />
      <Route path="/product/:id" component={ProductPage} />
      <Route path="/category/:id" component={CategoryPage} />
      <Route path="/cart" component={CartPage} />
      <Route path="/checkout" component={CheckoutPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/wishlist" component={WishlistPage} />
      <Route path="/search" component={SearchPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <AuthProvider>
          <CartProvider>
            <WishlistProvider>
              <Router />
            </WishlistProvider>
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
