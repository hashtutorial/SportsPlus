import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Product } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { toast } = useToast();
  
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`,
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`,
      });
    }
  };
  
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(product.price);
  
  const formattedSalePrice = product.salePrice 
    ? new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(product.salePrice)
    : null;
  
  return (
    <div 
      className="product-card bg-card rounded-lg overflow-hidden block h-full cursor-pointer"
      onClick={() => window.location.href = `/product/${product.id}`}
    >
      <div className="relative">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="w-full h-40 object-contain p-2"
        />
        <Button
          variant="outline"
          size="icon"
          className="absolute top-2 right-2 bg-background bg-opacity-50 rounded-full p-1"
          onClick={handleToggleWishlist}
        >
          <span className={`material-icons text-sm ${isInWishlist(product.id) ? 'text-primary' : 'text-muted-foreground'}`}>
            {isInWishlist(product.id) ? 'favorite' : 'favorite_border'}
          </span>
        </Button>
      </div>
      <div className="p-3">
        <p className="text-xs text-muted-foreground">{product.brand}</p>
        <h3 className="font-medium text-sm line-clamp-2">{product.name}</h3>
        <div className="flex justify-between items-center mt-2">
          <div>
            {formattedSalePrice ? (
              <div className="flex items-baseline gap-1">
                <p className="font-bold">{formattedSalePrice}</p>
                <p className="text-sm text-muted-foreground line-through">{formattedPrice}</p>
              </div>
            ) : (
              <p className="font-bold">{formattedPrice}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAddToCart}
            className="text-primary"
          >
            <span className="material-icons text-xl">add_circle</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
