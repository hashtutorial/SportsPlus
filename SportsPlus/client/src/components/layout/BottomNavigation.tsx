import { Link, useLocation } from "wouter";
import { useCart } from "@/context/CartContext";

export function BottomNavigation() {
  const [location] = useLocation();
  const { cartItems = [] } = useCart() || {};
  
  const totalCartItems = cartItems && Array.isArray(cartItems) 
    ? cartItems.reduce((total, item) => total + item.quantity, 0)
    : 0;
  
  const isActive = (path: string) => location === path;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 max-w-md mx-auto">
      <div className="flex justify-around items-center h-16 bg-background border-t border-border">
        <Link href="/">
          <div className={`flex flex-col items-center justify-center w-1/5 ${isActive('/') ? 'text-primary' : ''}`}>
            <span className="material-icons text-2xl">home</span>
            <span className="text-xs mt-1">Home</span>
          </div>
        </Link>
        
        <Link href="/search">
          <div className={`flex flex-col items-center justify-center w-1/5 ${isActive('/search') ? 'text-primary' : ''}`}>
            <span className="material-icons text-2xl">search</span>
            <span className="text-xs mt-1">Search</span>
          </div>
        </Link>
        
        <Link href="/cart">
          <div className={`flex flex-col items-center justify-center w-1/5 ${isActive('/cart') ? 'text-primary' : ''}`}>
            <div className="relative">
              <span className="material-icons text-2xl">shopping_cart</span>
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </div>
            <span className="text-xs mt-1">Cart</span>
          </div>
        </Link>
        
        <Link href="/wishlist">
          <div className={`flex flex-col items-center justify-center w-1/5 ${isActive('/wishlist') ? 'text-primary' : ''}`}>
            <span className="material-icons text-2xl">favorite_border</span>
            <span className="text-xs mt-1">Favorites</span>
          </div>
        </Link>
        
        <Link href="/profile">
          <div className={`flex flex-col items-center justify-center w-1/5 ${isActive('/profile') ? 'text-primary' : ''}`}>
            <span className="material-icons text-2xl">person</span>
            <span className="text-xs mt-1">Profile</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
