import { StatusBar } from "@/components/layout/StatusBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useCart } from "@/context/CartContext";
import { QuantityControl } from "@/components/ui/quantity-control";
import { Separator } from "@/components/ui/separator";

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, subtotal, total } = useCart();

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  return (
    <div className="app-container">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-background p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/">
            <Button variant="ghost" size="icon" className="mr-3">
              <span className="material-icons">arrow_back</span>
            </Button>
          </Link>
          <h1 className="text-xl font-medium">Shopping cart</h1>
        </div>
        <div className="relative">
          <span className="material-icons text-2xl">shopping_cart</span>
          {cartItems.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
              {cartItems.length}
            </span>
          )}
        </div>
      </div>
      
      {/* Cart Items */}
      <div className="p-4">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span className="material-icons text-6xl text-muted-foreground mb-4">shopping_cart</span>
            <h2 className="text-xl font-medium mb-2">Your cart is empty</h2>
            <p className="text-muted-foreground mb-6">Add items to your cart to continue shopping</p>
            <Link href="/">
              <Button className="bg-primary text-white">
                Continue Shopping
              </Button>
            </Link>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            {cartItems.map((item) => (
              <div key={item.id} className="flex mb-6 py-3 border-b border-border">
                <div className="w-24 h-24 bg-card flex-shrink-0 rounded-md overflow-hidden">
                  <img 
                    src={item.product.imageUrl} 
                    alt={item.product.name} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-3 flex-grow">
                  <div className="flex justify-between mb-1">
                    <div>
                      <p className="font-medium">{item.product.brand}</p>
                      <p className="text-sm text-muted-foreground">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {/* This would display size and color if they were in the model */}
                      </p>
                    </div>
                    <p className="font-medium">
                      {formatCurrency(item.product.salePrice || item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between mt-3">
                    <QuantityControl
                      quantity={item.quantity}
                      onIncrease={() => updateQuantity(item.id, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.id, item.quantity - 1)}
                    />
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => removeFromCart(item.id)}
                      className="text-muted-foreground"
                    >
                      <span className="material-icons">delete</span>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
            
            {/* Promotion */}
            <div className="mb-6">
              <Button 
                variant="outline" 
                className="w-full py-3 bg-primary bg-opacity-10 text-primary rounded-md font-medium"
              >
                1 year free shipping for only $14.00
              </Button>
            </div>
            
            {/* Order Summary */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between">
                <p className="text-muted-foreground">Subtotal</p>
                <p>{formatCurrency(subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-muted-foreground">Shipping</p>
                <p>$0</p>
              </div>
              <Separator className="my-2" />
              <div className="flex justify-between font-bold">
                <p>Total</p>
                <p>{formatCurrency(total)}</p>
              </div>
            </div>
            
            {/* Checkout Button */}
            <Link href="/checkout">
              <Button className="w-full py-3 bg-primary text-white rounded-md font-medium">
                Checkout
              </Button>
            </Link>
          </>
        )}
      </div>
      
      <BottomNavigation />
    </div>
  );
}
