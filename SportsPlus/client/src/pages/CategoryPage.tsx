import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ProductCard } from "@/components/ui/product-card";
import { StatusBar } from "@/components/layout/StatusBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Product, Category } from "@shared/schema";

export default function CategoryPage() {
  const { id } = useParams();
  const categoryId = parseInt(id);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data: category, isLoading: categoryLoading } = useQuery<Category>({
    queryKey: [`/api/categories/${categoryId}`],
  });
  
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: [`/api/products?category=${categoryId}`],
  });
  
  const filteredProducts = products?.filter(product => 
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (product.description && product.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (product.brand && product.brand.toLowerCase().includes(searchQuery.toLowerCase()))
  );
  
  return (
    <div className="app-container">
      <StatusBar />
      
      {/* App Header */}
      <div className="bg-background p-4 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-3">
            <span className="material-icons">arrow_back</span>
          </Button>
        </Link>
        <h1 className="text-lg font-bold">{categoryLoading ? 'Loading...' : category?.name || 'Category'}</h1>
      </div>
      
      {/* Search and Filters */}
      <div className="bg-background p-4 border-b border-border">
        <div className="search-bar bg-card rounded-full flex items-center px-4 py-2 mb-3">
          <span className="material-icons text-muted-foreground mr-2">search</span>
          <Input 
            type="text" 
            placeholder={`Search in ${category?.name || 'Category'}`} 
            className="bg-transparent border-none focus:outline-none text-foreground w-full h-auto p-0"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex space-x-3 overflow-x-auto no-scrollbar py-2">
          <Button 
            variant={!searchQuery ? "default" : "secondary"} 
            className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
            onClick={() => setSearchQuery("")}
          >
            All
          </Button>
          <Button 
            variant="secondary" 
            className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
            onClick={() => setSearchQuery("ball")}
          >
            Balls
          </Button>
          <Button 
            variant="secondary" 
            className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
            onClick={() => setSearchQuery("cleats")}
          >
            Cleats
          </Button>
          <Button 
            variant="secondary" 
            className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
            onClick={() => setSearchQuery("jersey")}
          >
            Jerseys
          </Button>
          <Button 
            variant="secondary" 
            className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
            onClick={() => setSearchQuery("training")}
          >
            Training
          </Button>
          <Button 
            variant="secondary" 
            className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
            onClick={() => setSearchQuery("accessory")}
          >
            Accessories
          </Button>
        </div>
      </div>
      
      {/* Products Grid */}
      <div className="p-4">
        {productsLoading ? (
          <div className="grid grid-cols-2 gap-4">
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
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="material-icons text-4xl text-muted-foreground mb-2">search_off</span>
            <h3 className="text-lg font-medium mb-1">No products found</h3>
            <p className="text-sm text-muted-foreground">Try a different search term</p>
          </div>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
