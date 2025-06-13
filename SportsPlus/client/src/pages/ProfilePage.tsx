import { useQuery } from "@tanstack/react-query";
import { StatusBar } from "@/components/layout/StatusBar";
import { BottomNavigation } from "@/components/layout/BottomNavigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";


export default function ProfilePage() {
  const { user, logout } = useAuth();
  const { toast } = useToast();

  // Fetch user orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["/api/orders"],
  });

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account.",
      });
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="app-container">
      <StatusBar />

      {/* Header */}
      <div className="bg-background p-4 flex items-center justify-between">
        <h1 className="text-xl font-medium">My Profile</h1>
        <Button variant="ghost" size="icon">
          <span className="material-icons">settings</span>
        </Button>
      </div>

      {/* Profile Information */}
      <div className="flex flex-col items-center p-6 border-b border-border">
        <div className="w-24 h-24 rounded-full bg-primary mb-4 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1530&q=80"
            alt="User profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-xl font-medium mb-1">{user?.fullName || "User"}</h2>
        <p className="text-muted-foreground mb-4">
          {user?.email || "user@example.com"}
        </p>
        <Button
          variant="outline"
          className="px-6 py-2 text-primary border-primary rounded-full text-sm"
        >
          Edit Profile
        </Button>
      </div>

      {/* Account Options */}
      <div className="p-4">
        <div className="space-y-4">
          <Button
            variant="secondary"
            className="w-full flex items-center justify-between p-3 bg-card rounded-md"
          >
            <div className="flex items-center">
              <span className="material-icons mr-3">shopping_bag</span>
              <span>Order History</span>
            </div>
            <span className="material-icons">chevron_right</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full flex items-center justify-between p-3 bg-card rounded-md"
            onClick={() => (window.location.href = "/wishlist")}
          >
            <div className="flex items-center">
              <span className="material-icons mr-3">favorite</span>
              <span>Favorites</span>
            </div>
            <span className="material-icons">chevron_right</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full flex items-center justify-between p-3 bg-card rounded-md"
          >
            <div className="flex items-center">
              <span className="material-icons mr-3">place</span>
              <span>Shipping Addresses</span>
            </div>
            <span className="material-icons">chevron_right</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full flex items-center justify-between p-3 bg-card rounded-md"
          >
            <div className="flex items-center">
              <span className="material-icons mr-3">payment</span>
              <span>Payment Methods</span>
            </div>
            <span className="material-icons">chevron_right</span>
          </Button>

          <Button
            variant="secondary"
            className="w-full flex items-center justify-between p-3 bg-card rounded-md"
          >
            <div className="flex items-center">
              <span className="material-icons mr-3">support_agent</span>
              <span>Help & Support</span>
            </div>
            <span className="material-icons">chevron_right</span>
          </Button>

          <Button
            variant="outline"
            className="w-full flex items-center p-3 bg-primary bg-opacity-10 text-primary rounded-md"
            onClick={handleLogout}
          >
            <span className="material-icons mr-3">logout</span>
            <span>Log Out</span>
          </Button>
        </div>
      </div>

      {/* Orders Section (Recent Orders) */}
      <div className="p-4 mt-4">
        <h2 className="text-lg font-bold mb-3">Recent Orders</h2>

        {ordersLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-card p-4 rounded-md animate-pulse">
                <div className="h-4 w-1/2 bg-muted rounded mb-2"></div>
                <div className="h-3 w-1/3 bg-muted rounded mb-4"></div>
                <div className="flex justify-between">
                  <div className="h-5 w-1/4 bg-muted rounded"></div>
                  <div className="h-5 w-1/4 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : orders && orders.length > 0 ? (
          <div className="space-y-3">
            {orders.slice(0, 3).map((order: any) => (
              <div key={order.id} className="bg-card p-4 rounded-md">
                <div className="flex justify-between mb-2">
                  <p className="font-medium">Order #{order.id}</p>
                  <p className="text-sm text-primary font-medium">
                    {order.status}
                  </p>
                </div>
                <p className="text-sm text-muted-foreground mb-2">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
                <div className="flex justify-between items-center mt-2">
                  <p className="font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(order.total)}
                  </p>
                  <Button variant="outline" size="sm" className="text-xs">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 bg-card rounded-md">
            <span className="material-icons text-4xl text-muted-foreground mb-2">
              shopping_bag
            </span>
            <h3 className="text-lg font-medium mb-1">No orders yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You haven't placed any orders yet
            </p>
            <Link href="/">
              <Button className="bg-primary text-white">Start Shopping</Button>
            </Link>
          </div>
        )}
      </div>

      <BottomNavigation />
    </div>
  );
}