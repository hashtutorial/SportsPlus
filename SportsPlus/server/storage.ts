import { 
  users, type User, type InsertUser,
  categories, type Category, type InsertCategory,
  products, type Product, type InsertProduct,
  productImages, type ProductImage, type InsertProductImage,
  cartItems, type CartItem, type InsertCartItem,
  wishlistItems, type WishlistItem, type InsertWishlistItem,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem
} from "@shared/schema";
import { db } from "./db";
import { and, eq, ilike, or } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  searchProducts(query: string): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  
  // Product Image operations
  getProductImages(productId: number): Promise<ProductImage[]>;
  createProductImage(image: InsertProductImage): Promise<ProductImage>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  getCartItem(id: number): Promise<CartItem | undefined>;
  getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined>;
  createCartItem(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined>;
  deleteCartItem(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Wishlist operations
  getWishlistItems(userId: number): Promise<WishlistItem[]>;
  getWishlistItem(id: number): Promise<WishlistItem | undefined>;
  getWishlistItemByUserAndProduct(userId: number, productId: number): Promise<WishlistItem | undefined>;
  createWishlistItem(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  deleteWishlistItem(id: number): Promise<boolean>;
  
  // Order operations
  getOrders(userId: number): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  
  // Order Item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories);
  }

  async getCategory(id: number): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db.insert(categories).values(category).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.categoryId, categoryId));
  }

  async searchProducts(query: string): Promise<Product[]> {
    return await db.select().from(products).where(
      or(
        ilike(products.name, `%${query}%`),
        ilike(products.description, `%${query}%`),
        ilike(products.brand, `%${query}%`)
      )
    );
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  // Product Image operations
  async getProductImages(productId: number): Promise<ProductImage[]> {
    return await db.select().from(productImages).where(eq(productImages.productId, productId));
  }

  async createProductImage(image: InsertProductImage): Promise<ProductImage> {
    const [newImage] = await db.insert(productImages).values(image).returning();
    return newImage;
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async getCartItem(id: number): Promise<CartItem | undefined> {
    const [cartItem] = await db.select().from(cartItems).where(eq(cartItems.id, id));
    return cartItem;
  }

  async getCartItemByUserAndProduct(userId: number, productId: number): Promise<CartItem | undefined> {
    const [cartItem] = await db
      .select()
      .from(cartItems)
      .where(and(eq(cartItems.userId, userId), eq(cartItems.productId, productId)));
    return cartItem;
  }

  async createCartItem(cartItem: InsertCartItem): Promise<CartItem> {
    const [newCartItem] = await db.insert(cartItems).values(cartItem).returning();
    return newCartItem;
  }

  async updateCartItemQuantity(id: number, quantity: number): Promise<CartItem | undefined> {
    const [updatedCartItem] = await db
      .update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return updatedCartItem;
  }

  async deleteCartItem(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning();
    return result.length > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning();
    return result.length > 0;
  }

  // Wishlist operations
  async getWishlistItems(userId: number): Promise<WishlistItem[]> {
    return await db.select().from(wishlistItems).where(eq(wishlistItems.userId, userId));
  }

  async getWishlistItem(id: number): Promise<WishlistItem | undefined> {
    const [wishlistItem] = await db.select().from(wishlistItems).where(eq(wishlistItems.id, id));
    return wishlistItem;
  }

  async getWishlistItemByUserAndProduct(userId: number, productId: number): Promise<WishlistItem | undefined> {
    const [wishlistItem] = await db
      .select()
      .from(wishlistItems)
      .where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
    return wishlistItem;
  }

  async createWishlistItem(wishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    const [newWishlistItem] = await db.insert(wishlistItems).values(wishlistItem).returning();
    return newWishlistItem;
  }

  async deleteWishlistItem(id: number): Promise<boolean> {
    const result = await db.delete(wishlistItems).where(eq(wishlistItems.id, id)).returning();
    return result.length > 0;
  }

  // Order operations
  async getOrders(userId: number): Promise<Order[]> {
    return await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    return order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const [newOrder] = await db.insert(orders).values(order).returning();
    return newOrder;
  }

  // Order Item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem> {
    const [newOrderItem] = await db.insert(orderItems).values(orderItem).returning();
    return newOrderItem;
  }
}

export const storage = new DatabaseStorage();
