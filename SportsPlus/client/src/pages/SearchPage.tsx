import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "@/components/layout/StatusBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { ProductCard } from "@/components/ui/product-card";
import { Product } from "@shared/schema";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  // Fetch search results when searchTerm changes
  const { data: searchResults, isLoading } = useQuery<Product[]>({
    queryKey: [`/api/products${searchTerm ? `?search=${searchTerm}` : ''}`],
    enabled: searchTerm.length > 0,
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Filter by category if needed
  const filteredResults = searchTerm && searchResults 
    ? (selectedCategory === "all" 
        ? searchResults 
        : searchResults.filter(product => product.categoryId === parseInt(selectedCategory)))
    : [];

  // Recent searches - in a real app, these would be stored in localStorage or user preferences
  const recentSearches = ["soccer balls", "running shoes", "nike"];

  // Popular searches
  const popularSearches = ["training shoes", "sports bra", "running shorts", "yoga mat", "dumbbells", "adidas"];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Trigger search by refetching with new search term
  };

  const handleClearSearch = () => {
    setSearchTerm("");
  };

  const handleSelectCategory = (categoryId: string) => {
    setSelectedCategory(categoryId);
  };

  return (
    <div className="app-container">
      <StatusBar />
      
      {/* Search Header */}
      <div className="bg-background p-4 flex items-center">
        <Link href="/">
          <Button variant="ghost" size="icon" className="mr-3">
            <span className="material-icons">arrow_back</span>
          </Button>
        </Link>
        <form onSubmit={handleSearch} className="flex-1">
          <div className="search-bar bg-card rounded-full flex items-center px-4 py-2 flex-1">
            <span className="material-icons text-muted-foreground mr-2">search</span>
            <Input 
              type="text" 
              placeholder="Search products" 
              className="bg-transparent border-none focus:outline-none text-foreground w-full h-auto p-0"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              autoFocus
            />
            {searchTerm && (
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                onClick={handleClearSearch} 
                className="p-0 h-auto"
              >
                <span className="material-icons text-muted-foreground">close</span>
              </Button>
            )}
          </div>
        </form>
      </div>
      
      {/* Search Filters */}
      {searchTerm && (
        <div className="p-4 border-b border-border">
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
            <Button 
              variant={selectedCategory === "all" ? "default" : "secondary"}
              className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
              onClick={() => handleSelectCategory("all")}
            >
              All
            </Button>
            {categories?.map((category: any) => (
              <Button 
                key={category.id}
                variant={selectedCategory === category.id.toString() ? "default" : "secondary"}
                className="whitespace-nowrap px-4 py-1 rounded-full text-sm"
                onClick={() => handleSelectCategory(category.id.toString())}
              >
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      )}
      
      {/* Search Results */}
      {searchTerm ? (
        <div className="p-4">
          {isLoading ? (
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
          ) : filteredResults.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
              {filteredResults.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <span className="material-icons text-6xl text-muted-foreground mb-4">search_off</span>
              <h2 className="text-xl font-medium mb-2">No results found</h2>
              <p className="text-muted-foreground text-center mb-6">
                We couldn't find any products matching your search. Try different keywords or filters.
              </p>
              <Button className="bg-primary text-white" onClick={handleClearSearch}>
                Clear Search
              </Button>
            </div>
          )}
        </div>
      ) : (
        <>
          {/* Recent Searches */}
          <div className="p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold">Recent Searches</h2>
              <Button 
                variant="link" 
                className="text-primary text-sm p-0 h-auto"
              >
                Clear All
              </Button>
            </div>
            <div className="space-y-4">
              {recentSearches.map((term, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between"
                  onClick={() => setSearchTerm(term)}
                >
                  <div className="flex items-center cursor-pointer">
                    <span className="material-icons text-muted-foreground mr-3">history</span>
                    <span>{term}</span>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-auto p-0"
                    onClick={(e) => {
                      e.stopPropagation();
                      // In a real app, would remove this search from history
                    }}
                  >
                    <span className="material-icons text-muted-foreground">close</span>
                  </Button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Popular Searches */}
          <div className="px-4 pb-6">
            <h2 className="font-bold mb-3">Popular Searches</h2>
            <div className="flex flex-wrap gap-2">
              {popularSearches.map((term, index) => (
                <Button 
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 rounded-full text-sm"
                  onClick={() => setSearchTerm(term)}
                >
                  {term}
                </Button>
              ))}
            </div>
          </div>
        </>
      )}
      
      <BottomNavigation />
    </div>
  );
}
