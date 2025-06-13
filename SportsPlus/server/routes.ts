import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertUserSchema, 
  insertCartItemSchema,
  insertWishlistItemSchema,
  insertOrderSchema,
  insertOrderItemSchema
} from "@shared/schema";
import bcrypt from "bcryptjs";
import session from "express-session";
import MemoryStore from "memorystore";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup session middleware
  const SessionStore = MemoryStore(session);
  app.use(session({
    secret: process.env.SESSION_SECRET || "sport-plus-secret",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 86400000 }, // 24 hours
    store: new SessionStore({ checkPeriod: 86400000 }) // 24 hours
  }));

  // Auth middleware
  const requireAuth = (req: Request, res: Response, next: Function) => {
    // For demo purposes, allow access even without authentication
    if (!req.session.userId) {
      // Set a default demo user ID for testing
      req.session.userId = 1;
    }
    next();
  };

  // Authentication routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(validatedData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User with this email already exists" });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(validatedData.password, 10);
      
      // Create user
      const newUser = await storage.createUser({
        ...validatedData,
        password: hashedPassword
      });

      // Set user session
      req.session.userId = newUser.id;
      
      // Return user without password
      const { password, ...userWithoutPassword } = newUser;
      res.status(201).json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      // Find user
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ message: "Invalid email or password" });
      }
      
      // Set user session
      req.session.userId = user.id;
      
      // Return user without password
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ message: "Could not log out" });
      }
      res.clearCookie("connect.sid");
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const user = await storage.getUser(req.session.userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Return user without password
      const { password, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/categories/:id", async (req, res) => {
    try {
      const category = await storage.getCategory(parseInt(req.params.id));
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      let products;
      
      if (req.query.category) {
        const categoryId = parseInt(req.query.category as string);
        products = await storage.getProductsByCategory(categoryId);
      } else if (req.query.search) {
        const searchQuery = req.query.search as string;
        products = await storage.searchProducts(searchQuery);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const product = await storage.getProduct(parseInt(req.params.id));
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Get product images
      const images = await storage.getProductImages(product.id);
      
      res.json({ ...product, images });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Cart routes
  app.get("/api/cart", requireAuth, async (req, res) => {
    try {
      const cartItems = await storage.getCartItems(req.session.userId);
      
      // Get full product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/cart", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCartItemSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Check if product exists
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if item is already in cart
      const existingCartItem = await storage.getCartItemByUserAndProduct(
        validatedData.userId,
        validatedData.productId
      );
      
      if (existingCartItem) {
        // Update quantity instead of creating new item
        const updatedCartItem = await storage.updateCartItemQuantity(
          existingCartItem.id,
          existingCartItem.quantity + (validatedData.quantity || 1)
        );
        
        return res.json({ ...updatedCartItem, product });
      }
      
      // Create new cart item
      const newCartItem = await storage.createCartItem(validatedData);
      
      res.status(201).json({ ...newCartItem, product });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.put("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      const { quantity } = req.body;
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(cartItemId);
      if (!cartItem || cartItem.userId !== req.session.userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Update quantity
      const updatedCartItem = await storage.updateCartItemQuantity(cartItemId, quantity);
      
      // Get product details
      const product = await storage.getProduct(cartItem.productId);
      
      res.json({ ...updatedCartItem, product });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/cart/:id", requireAuth, async (req, res) => {
    try {
      const cartItemId = parseInt(req.params.id);
      
      // Verify cart item belongs to user
      const cartItem = await storage.getCartItem(cartItemId);
      if (!cartItem || cartItem.userId !== req.session.userId) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      // Delete cart item
      await storage.deleteCartItem(cartItemId);
      
      res.json({ message: "Cart item removed" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.delete("/api/cart", requireAuth, async (req, res) => {
    try {
      await storage.clearCart(req.session.userId);
      res.json({ message: "Cart cleared" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const wishlistItems = await storage.getWishlistItems(req.session.userId);
      
      // Get full product details for each wishlist item
      const wishlistWithProducts = await Promise.all(
        wishlistItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.json(wishlistWithProducts);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/wishlist", requireAuth, async (req, res) => {
    try {
      const validatedData = insertWishlistItemSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Check if product exists
      const product = await storage.getProduct(validatedData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      // Check if item is already in wishlist
      const existingWishlistItem = await storage.getWishlistItemByUserAndProduct(
        validatedData.userId,
        validatedData.productId
      );
      
      if (existingWishlistItem) {
        return res.status(409).json({ message: "Product already in wishlist" });
      }
      
      // Create new wishlist item
      const newWishlistItem = await storage.createWishlistItem(validatedData);
      
      res.status(201).json({ ...newWishlistItem, product });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  app.delete("/api/wishlist/:id", requireAuth, async (req, res) => {
    try {
      const wishlistItemId = parseInt(req.params.id);
      
      // Verify wishlist item belongs to user
      const wishlistItem = await storage.getWishlistItem(wishlistItemId);
      if (!wishlistItem || wishlistItem.userId !== req.session.userId) {
        return res.status(404).json({ message: "Wishlist item not found" });
      }
      
      // Delete wishlist item
      await storage.deleteWishlistItem(wishlistItemId);
      
      res.json({ message: "Removed from wishlist" });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  // Order routes
  app.get("/api/orders", requireAuth, async (req, res) => {
    try {
      const orders = await storage.getOrders(req.session.userId);
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const orderItems = await storage.getOrderItems(order.id);
          
          // Get product details for each order item
          const orderItemsWithProducts = await Promise.all(
            orderItems.map(async (item) => {
              const product = await storage.getProduct(item.productId);
              return { ...item, product };
            })
          );
          
          return { ...order, items: orderItemsWithProducts };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/orders/:id", requireAuth, async (req, res) => {
    try {
      const order = await storage.getOrder(parseInt(req.params.id));
      
      // Verify order belongs to user
      if (!order || order.userId !== req.session.userId) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      // Get order items
      const orderItems = await storage.getOrderItems(order.id);
      
      // Get product details for each order item
      const orderItemsWithProducts = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.json({ ...order, items: orderItemsWithProducts });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });

  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      // Validate order data
      const validatedOrderData = insertOrderSchema.parse({
        ...req.body,
        userId: req.session.userId
      });
      
      // Get cart items
      const cartItems = await storage.getCartItems(req.session.userId);
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total
      let total = 0;
      const orderItemsData = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          const price = product.salePrice || product.price;
          total += price * item.quantity;
          
          return {
            productId: item.productId,
            quantity: item.quantity,
            price
          };
        })
      );
      
      // Create order
      const newOrder = await storage.createOrder({
        ...validatedOrderData,
        total
      });
      
      // Create order items
      await Promise.all(
        orderItemsData.map(async (item) => {
          await storage.createOrderItem({
            ...item,
            orderId: newOrder.id
          });
        })
      );
      
      // Clear cart
      await storage.clearCart(req.session.userId);
      
      // Get order items with products
      const orderItems = await storage.getOrderItems(newOrder.id);
      const orderItemsWithProducts = await Promise.all(
        orderItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return { ...item, product };
        })
      );
      
      res.status(201).json({ ...newOrder, items: orderItemsWithProducts });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
