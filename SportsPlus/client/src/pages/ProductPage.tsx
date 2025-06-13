import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/ui/product-carousel";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useToast } from "@/hooks/use-toast";

interface ProductWithImages {
  id: number;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  brand?: string;
  stock: number;
  rating: number;
  numReviews: number;
  images: { id: number; imageUrl: string; isPrimary?: boolean }[];
}

export default function ProductPage() {
  const { id } = useParams();
  const productId = parseInt(id);
  const [selectedColor, setSelectedColor] = useState("beige");
  const [selectedSize, setSelectedSize] = useState("S");
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { toast } = useToast();
  
  const { data: product, isLoading } = useQuery<ProductWithImages>({
    queryKey: [`/api/products/${productId}`],
  });
  
  if (isLoading) {
    return (
      <div className="app-container p-4 flex justify-center items-center">
        <div className="text-center">
          <span className="material-icons animate-spin text-4xl mb-2">sync</span>
          <p>Loading product...</p>
        </div>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="app-container p-4 flex justify-center items-center">
        <div className="text-center">
          <span className="material-icons text-4xl mb-2">error_outline</span>
          <p>Product not found</p>
          <Link href="/">
            <Button className="mt-4">Return to Home</Button>
          </Link>
        </div>
      </div>
    );
  }
  
  // Create images array, if no images use the product image
  const productImages = product.images && product.images.length > 0
    ? product.images
    : [{ id: 0, imageUrl: product.imageUrl || '', isPrimary: true }];
  
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
  
  const discountPercentage = product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  
  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`
    });
  };
  
  const handleToggleWishlist = () => {
    if (isInWishlist(product.id)) {
      removeFromWishlist(product.id);
      toast({
        title: "Removed from wishlist",
        description: `${product.name} has been removed from your wishlist.`
      });
    } else {
      addToWishlist(product);
      toast({
        title: "Added to wishlist",
        description: `${product.name} has been added to your wishlist.`
      });
    }
  };
  
  return (
    <div className="app-container pb-20">
      {/* Promo Banner */}
      <div className="bg-primary px-4 py-2 text-center">
        <p className="text-xs">Special season's opening! Discount 10% for all products! Checkout Now!</p>
      </div>
      
      {/* Header */}
      <div className="bg-background p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-3">
              <span className="material-icons">arrow_back</span>
            </Button>
          </Link>
          <h1 className="text-xl font-bold text-primary heading">SPORT<span className="text-white">+</span></h1>
        </div>
        <div className="flex items-center space-x-4">
          <Link href="/search">
            <Button variant="ghost" size="icon">
              <span className="material-icons">search</span>
            </Button>
          </Link>
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <span className="material-icons">shopping_cart</span>
              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">3</span>
            </Button>
          </Link>
          <Button variant="ghost" size="icon">
            <span className="material-icons">menu</span>
          </Button>
        </div>
      </div>
      
      {/* Navigation Breadcrumbs */}
      <div className="px-4 py-2 bg-background text-xs text-muted-foreground flex items-center">
        <Link href="/">
          <a className="hover:text-primary">Homepage</a>
        </Link>
        <span className="material-icons text-xs mx-1">chevron_right</span>
        <Link href={`/category/${product.categoryId}`}>
          <a className="hover:text-primary">Category</a>
        </Link>
        <span className="material-icons text-xs mx-1">chevron_right</span>
        <span className="text-foreground">{product.name}</span>
      </div>
      
      {/* Product Images */}
      <ProductCarousel images={productImages} title={product.name} />
      
      {/* Product Information */}
      <div className="p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">{product.brand}</p>
          <h1 className="text-xl font-bold mb-1">{product.name}</h1>
          <div className="flex items-center mb-2">
            <div className="flex items-center text-yellow-500">
              {Array.from({ length: 5 }).map((_, index) => (
                <span key={index} className="material-icons text-sm">
                  {index < Math.floor(product.rating) ? 'star' : index < product.rating ? 'star_half' : 'star_border'}
                </span>
              ))}
            </div>
            <span className="text-sm ml-1">{product.rating.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground ml-2">({product.numReviews} sold)</span>
          </div>
          <div className="flex items-baseline space-x-2">
            {formattedSalePrice ? (
              <>
                <span className="text-2xl font-bold">{formattedSalePrice}</span>
                <span className="text-lg text-muted-foreground line-through">{formattedPrice}</span>
                <span className="text-sm text-green-500">{discountPercentage}% OFF</span>
              </>
            ) : (
              <span className="text-2xl font-bold">{formattedPrice}</span>
            )}
          </div>
        </div>
        
        {/* Color Selection */}
        <div className="mb-4">
          <h2 className="text-md font-bold mb-2">Color: <span className="font-normal capitalize">{selectedColor}</span></h2>
          <div className="flex space-x-3">
            <button 
              className={`w-8 h-8 rounded-md bg-yellow-100 ${selectedColor === 'beige' ? 'border-2 border-primary' : 'border border-border'}`}
              onClick={() => setSelectedColor('beige')}
            />
            <button 
              className={`w-8 h-8 rounded-md bg-gray-400 ${selectedColor === 'gray' ? 'border-2 border-primary' : 'border border-border'}`}
              onClick={() => setSelectedColor('gray')}
            />
            <button 
              className={`w-8 h-8 rounded-md bg-blue-300 ${selectedColor === 'blue' ? 'border-2 border-primary' : 'border border-border'}`}
              onClick={() => setSelectedColor('blue')}
            />
          </div>
        </div>
        
        {/* Size Selection */}
        <div className="mb-4">
          <h2 className="text-md font-bold mb-2">Size</h2>
          <div className="grid grid-cols-5 gap-2">
            {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
              <button 
                key={size}
                className={`py-2 ${selectedSize === size ? 'bg-primary border border-primary' : 'border border-border'} rounded-md text-sm`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Product Description */}
        <div className="mb-4">
          <h2 className="text-md font-bold mb-2">Description:</h2>
          <p className="text-sm text-muted-foreground">
            {product.description || 'No description available for this product.'}
          </p>
        </div>
        
        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-3">
          <Button 
            className="w-full py-3 bg-primary text-white rounded-md font-medium"
            onClick={handleAddToCart}
          >
            Add To Cart
          </Button>
          <Link href="/checkout">
            <Button 
              variant="outline"
              className="w-full py-3 border-primary text-primary rounded-md font-medium"
            >
              Checkout Now
            </Button>
          </Link>
        </div>
      </div>
      
      <BottomNavigation />
    </div>
  );
}
