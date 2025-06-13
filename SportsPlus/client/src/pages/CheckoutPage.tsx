import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { StatusBar } from "@/components/layout/StatusBar";
import { useCart } from "@/context/CartContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, { message: "Please enter your full name" }),
  address: z.string().min(5, { message: "Please enter your address" }),
  city: z.string().min(2, { message: "Please enter your city" }),
  zipCode: z.string().min(3, { message: "Please enter a valid ZIP code" }),
  phone: z.string().min(7, { message: "Please enter a valid phone number" }),
  paymentMethod: z.enum(["credit", "paypal", "cod"], { 
    required_error: "Please select a payment method" 
  }),
});

export default function CheckoutPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { cartItems, subtotal, tax, total, clearCart } = useCart();
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      address: "",
      city: "",
      zipCode: "",
      phone: "",
      paymentMethod: "credit",
    },
  });

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (cartItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before proceeding to checkout.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create the order with shipping information
      await apiRequest("POST", "/api/orders", {
        status: "pending",
        total,
        shippingAddress: values.address,
        city: values.city,
        zipCode: values.zipCode,
        phone: values.phone,
        paymentMethod: values.paymentMethod,
      });

      // Show success message
      toast({
        title: "Order placed successfully!",
        description: "Your order has been placed and is being processed.",
      });

      // Clear the cart
      await clearCart();

      // Redirect to home page
      setLocation("/");
    } catch (error) {
      toast({
        title: "Failed to place order",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="app-container">
      <StatusBar />
      
      {/* Header */}
      <div className="bg-background p-4 flex items-center">
        <Link href="/cart">
          <Button variant="ghost" size="icon" className="mr-3">
            <span className="material-icons">arrow_back</span>
          </Button>
        </Link>
        <h1 className="text-xl font-medium">Checkout</h1>
      </div>
      
      {/* Checkout Form */}
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Shipping Address */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Shipping Address</h2>
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Full Name</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="John Doe" 
                          className="w-full bg-card border-border rounded-md p-3 text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Address</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="123 Main St" 
                          className="w-full bg-card border-border rounded-md p-3 text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-muted-foreground">City</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="New York" 
                            className="w-full bg-card border-border rounded-md p-3 text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="zipCode"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-sm text-muted-foreground">ZIP Code</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="10001" 
                            className="w-full bg-card border-border rounded-md p-3 text-foreground"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-sm text-muted-foreground">Phone Number</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="+1 (555) 123-4567" 
                          className="w-full bg-card border-border rounded-md p-3 text-foreground"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            
            {/* Payment Method */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Payment Method</h2>
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="space-y-3"
                      >
                        <div className={`flex items-center p-3 bg-card rounded-md ${field.value === 'credit' ? 'border border-primary' : 'border border-border'}`}>
                          <RadioGroupItem value="credit" id="credit-card" className="mr-3" />
                          <Label htmlFor="credit-card" className="flex items-center cursor-pointer">
                            <span className="material-icons text-primary mr-2">credit_card</span>
                            <span>Credit/Debit Card</span>
                          </Label>
                        </div>
                        
                        <div className={`flex items-center p-3 bg-card rounded-md ${field.value === 'paypal' ? 'border border-primary' : 'border border-border'}`}>
                          <RadioGroupItem value="paypal" id="paypal" className="mr-3" />
                          <Label htmlFor="paypal" className="flex items-center cursor-pointer">
                            <span className="material-icons mr-2">account_balance_wallet</span>
                            <span>PayPal</span>
                          </Label>
                        </div>
                        
                        <div className={`flex items-center p-3 bg-card rounded-md ${field.value === 'cod' ? 'border border-primary' : 'border border-border'}`}>
                          <RadioGroupItem value="cod" id="cod" className="mr-3" />
                          <Label htmlFor="cod" className="flex items-center cursor-pointer">
                            <span className="material-icons mr-2">local_shipping</span>
                            <span>Cash On Delivery</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            {/* Order Summary */}
            <div className="mb-6">
              <h2 className="text-lg font-bold mb-3">Order Summary</h2>
              <div className="p-3 bg-card border border-border rounded-md">
                <div className="space-y-3 mb-3">
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Products ({cartItems.length})</p>
                    <p>{formatCurrency(subtotal)}</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Shipping</p>
                    <p>$0.00</p>
                  </div>
                  <div className="flex justify-between">
                    <p className="text-muted-foreground">Tax</p>
                    <p>{formatCurrency(tax)}</p>
                  </div>
                  <Separator className="my-2 bg-border" />
                  <div className="flex justify-between font-bold">
                    <p>Total</p>
                    <p>{formatCurrency(total)}</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Checkout Button */}
            <Button
              type="submit"
              className="w-full py-3 bg-primary text-white rounded-md font-medium"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Processing..." : "Place Order"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
