import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ui/product-card";
import { CategoryItem } from "@/components/ui/category-item";
import { StatusBar } from "@/components/layout/StatusBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Product, Category } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function HomePage() {
  const [activeCarouselIndex, setActiveCarouselIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  
  const { data: categories, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Since we can't use useLocation for navigation, we'll use window.location
      window.location.href = `/search?q=${encodeURIComponent(searchQuery)}`;
    } else {
      toast({
        title: "Search query empty",
        description: "Please enter a search term",
      });
    }
  };
  
  // Carousel mock data - in a real app, this would come from the backend
  const carouselItems = [
    {
      id: 1,
      imageUrl: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
      title: "Women's Active Wear",
      subtitle: "New Collection"
    }
  ];
  
  // Filter products by category for the soccer section
  const soccerProducts = products?.filter(product => product.categoryId === 1) || [];
  
  // Get new arrivals (most recent products)
  const newArrivals = products?.slice(0, 4) || [];
  
  return (
    <div className="app-container">
      <StatusBar />
      
      {/* App Header */}
      <div className="bg-background p-4 flex items-center justify-between">
        <form onSubmit={handleSearch} className="w-full">
          <div className="search-bar bg-card rounded-full flex items-center px-4 py-2 flex-1">
            <span className="material-icons text-muted-foreground mr-2">search</span>
            <Input 
              type="text" 
              placeholder="Search products" 
              className="bg-transparent border-none focus:outline-none text-foreground w-full h-auto p-0"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                type="button" 
                className="material-icons text-muted-foreground ml-1 text-sm"
                onClick={() => setSearchQuery('')}
              >
                clear
              </button>
            )}
          </div>
        </form>
      </div>
      
      {/* Quick Navigation */}
      <div className="px-2 py-3 overflow-x-auto flex space-x-3 no-scrollbar">
        <Link href="/wishlist">
          <Button variant="outline" className="flex items-center gap-1 rounded-full">
            <span className="material-icons text-primary text-sm">favorite</span>
            <span className="text-xs whitespace-nowrap">Favorites</span>
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="flex items-center gap-1 rounded-full"
          onClick={() => {
            const historyProducts = products?.slice(0, 3) || [];
            toast({
              title: "Viewing History",
              description: `You've recently viewed ${historyProducts.length} products`,
            });
          }}
        >
          <span className="material-icons text-primary text-sm">history</span>
          <span className="text-xs whitespace-nowrap">History</span>
        </Button>
        <Link href="/category/1">
          <Button variant="outline" className="flex items-center gap-1 rounded-full">
            <span className="material-icons text-primary text-sm">star</span>
            <span className="text-xs whitespace-nowrap">Popular</span>
          </Button>
        </Link>
        <Button 
          variant="outline" 
          className="flex items-center gap-1 rounded-full"
          onClick={() => {
            toast({
              title: "Special Offers",
              description: "Special season's opening! Discount 10% for all products!",
            });
          }}
        >
          <span className="material-icons text-primary text-sm">local_offer</span>
          <span className="text-xs whitespace-nowrap">Offers</span>
        </Button>
      </div>
      
      {/* Carousel */}
      <div className="relative mb-6">
        <div className="carousel-container flex overflow-x-auto no-scrollbar">
          {carouselItems.map((item, index) => (
            <div key={item.id} className="carousel-item relative w-full flex-shrink-0">
              <img 
                src={item.imageUrl} 
                alt={item.title} 
                className="w-full h-48 object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h3 className="text-white font-bold">{item.title}</h3>
                <p className="text-sm text-gray-300">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 left-0 right-0">
          <div className="flex justify-center space-x-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <div 
                key={index} 
                className={`indicator w-2 h-2 rounded-full ${index === activeCarouselIndex ? 'bg-primary' : 'bg-white bg-opacity-40'}`}
                onClick={() => setActiveCarouselIndex(index)}
              />
            ))}
          </div>
        </div>
      </div>
      
      {/* Categories */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Categories</h2>
          <Link href="/categories">
            <Button variant="link" className="text-primary p-0 h-auto">
              <span className="text-sm">View all</span>
              <span className="material-icons text-sm">chevron_right</span>
            </Button>
          </Link>
        </div>
        
        {categoriesLoading ? (
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="rounded-full w-24 h-24 bg-card animate-pulse mb-2" />
                <div className="h-4 w-16 bg-card animate-pulse rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {categories?.map(category => (
              <CategoryItem key={category.id} category={category} />
            ))}
          </div>
        )}
      </div>
      
      {/* Soccer Products */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">Soccer</h2>
          <Link href="/category/1">
            <Button variant="link" className="text-primary p-0 h-auto">
              <span className="text-sm">View all</span>
              <span className="material-icons text-sm">chevron_right</span>
            </Button>
          </Link>
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-card">
                <div className="h-40 bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {soccerProducts.slice(0, 2).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      {/* New Arrivals */}
      <div className="px-4 mb-6">
        <div className="flex justify-between items-center mb-3">
          <h2 className="font-bold text-lg">New Arrivals</h2>
          <Button variant="link" className="text-primary p-0 h-auto">
            <span className="text-sm">View all</span>
            <span className="material-icons text-sm">chevron_right</span>
          </Button>
        </div>
        
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="rounded-lg overflow-hidden bg-card">
                <div className="h-40 bg-muted animate-pulse" />
                <div className="p-3 space-y-2">
                  <div className="h-3 w-16 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                  <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {newArrivals.slice(0, 2).map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
