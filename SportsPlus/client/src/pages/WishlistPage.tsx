import { StatusBar } from "@/components/layout/StatusBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/context/WishlistContext";
import { useCart } from "@/context/CartContext";
import { ProductCard } from "@/components/ui/product-card";
import { useToast } from "@/hooks/use-toast";

export default function WishlistPage() {
  const { wishlistItems, removeFromWishlist, isLoading } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();

  const handleAddToCart = (productId: number) => {
    const wishlistItem = wishlistItems.find(item => item.productId === productId);
    if (wishlistItem) {
      addToCart(wishlistItem.product);
      toast({
        title: "Added to cart",
        description: `${wishlistItem.product.name} has been added to your cart.`,
      });
    }
  };

  const handleRemoveFromWishlist = (productId: number) => {
    const wishlistItem = wishlistItems.find(item => item.productId === productId);
    if (wishlistItem) {
      removeFromWishlist(productId);
      toast({
        title: "Removed from favorites",
        description: `${wishlistItem.product.name} has been removed from your favorites.`,
      });
    }
  };

  return (
    <div className="app-container">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-background p-4 flex items-center justify-between">
        <h1 className="text-xl font-medium">My Favorites</h1>
        <Button variant="ghost" size="icon">
          <span className="material-icons">more_vert</span>
        </Button>
      </div>
      
      {/* Wishlist Items */}
      {isLoading ? (
        <div className="p-4 grid grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-card rounded-lg overflow-hidden animate-pulse">
              <div className="w-full h-40 bg-muted" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-16 bg-muted rounded" />
                <div className="h-4 w-32 bg-muted rounded" />
                <div className="h-4 w-20 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : wishlistItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 py-12">
          <span className="material-icons text-6xl text-muted-foreground mb-4">favorite_border</span>
          <h2 className="text-xl font-medium mb-2">Your favorites list is empty</h2>
          <p className="text-muted-foreground text-center mb-6">
            Add items to your favorites to keep track of products you're interested in.
          </p>
          <Button className="bg-primary text-white">
            Start Shopping
          </Button>
        </div>
      ) : (
        <div className="p-4 grid grid-cols-2 gap-4">
          {wishlistItems.map((item) => (
            <div key={item.id} className="product-card bg-card rounded-lg overflow-hidden">
              <div className="relative">
                <img 
                  src={item.product.imageUrl} 
                  alt={item.product.name} 
                  className="w-full h-40 object-contain p-2"
                />
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 bg-background bg-opacity-50 rounded-full p-1"
                  onClick={() => handleRemoveFromWishlist(item.productId)}
                >
                  <span className="material-icons text-sm text-primary">
                    favorite
                  </span>
                </Button>
              </div>
              <div className="p-3">
                <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                <h3 className="font-medium text-sm line-clamp-2">{item.product.name}</h3>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-bold">
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(item.product.salePrice || item.product.price)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleAddToCart(item.productId)}
                    className="text-primary"
                  >
                    <span className="material-icons text-xl">add_circle</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <BottomNavigation />
    </div>
  );
}
