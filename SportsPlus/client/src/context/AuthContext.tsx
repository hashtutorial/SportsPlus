import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string;
}

// Create initial context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  // Set default user for demonstration purposes
  const [user, setUser] = useState<User | null>({
    id: 1,
    username: 'demouser',
    email: 'demo@example.com',
    fullName: 'Demo User'
  });
  const [loading, setLoading] = useState(false); // Set loading to false by default
  const { toast } = useToast();

  useEffect(() => {
    // Skip auth check for demonstration purposes
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const response = await apiRequest("POST", "/api/auth/login", { email, password });
      const userData = await response.json();
      setUser(userData);
    } catch (error) {
      toast({
        title: "Login failed",
        description: error.message || "Please check your credentials and try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await apiRequest("POST", "/api/auth/register", userData);
      const newUser = await response.json();
      setUser(newUser);
    } catch (error) {
      toast({
        title: "Registration failed",
        description: error.message || "Please check your information and try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await apiRequest("POST", "/api/auth/logout", {});
      setUser(null);
    } catch (error) {
      toast({
        title: "Logout failed",
        description: "Please try again.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
