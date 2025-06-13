import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const [_, setLocation] = useLocation();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    try {
      await login(values.email, values.password);
      setLocation("/");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col justify-center px-6 bg-background">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-primary heading">SPORT<span className="text-white">+</span></h1>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-medium mb-2">Create an account</h2>
        <p className="text-sm text-muted-foreground mb-4">Enter your email to sign up for this app</p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      placeholder="email@domain.com"
                      className="h-12 px-4 rounded-md bg-card text-white border border-border focus:outline-none focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Password"
                      className="h-12 px-4 rounded-md bg-card text-white border border-border focus:outline-none focus:border-primary"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button
              type="submit"
              className="w-full h-12 bg-primary text-white rounded-md font-medium"
              disabled={isLoading}
            >
              {isLoading ? "Logging in..." : "Continue"}
            </Button>
          </form>
        </Form>
        
        <div className="flex items-center my-4">
          <Separator className="flex-grow" />
          <span className="px-4 text-muted-foreground">or</span>
          <Separator className="flex-grow" />
        </div>
        
        <Button
          variant="outline"
          className="w-full h-12 bg-white text-black rounded-md font-medium flex items-center justify-center mb-3"
          onClick={() => alert("Google login would be implemented here!")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/2991/2991148.png" alt="Google logo" className="h-5 w-5 mr-2" />
          Continue with Google
        </Button>
        
        <Button
          variant="outline"
          className="w-full h-12 bg-white text-black rounded-md font-medium flex items-center justify-center"
          onClick={() => alert("Apple login would be implemented here!")}
        >
          <img src="https://cdn-icons-png.flaticon.com/512/0/747.png" alt="Apple logo" className="h-5 w-5 mr-2" />
          Continue with Apple
        </Button>
        
        <div className="text-center mt-6">
          <p className="text-sm text-muted-foreground">
            Don't have an account? <Link href="/register"><span className="text-primary">Register Now</span></Link>
          </p>
        </div>
        
        <p className="text-xs text-muted-foreground text-center mt-6">
          By clicking continue, you agree to our <a href="#" className="text-primary">Terms of Service</a> and <a href="#" className="text-primary">Privacy Policy</a>
        </p>
      </div>
    </div>
  );
}
