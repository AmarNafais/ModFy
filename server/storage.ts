import { type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct, type Collection, type InsertCollection, type CartItem, type InsertCartItem, type Order, type InsertOrder, type OrderItem, type InsertOrderItem, type WishlistItem, type InsertWishlistItem, type SizeChart, type InsertSizeChart, type ProductWithCategory, type CartItemWithProduct, type OrderWithItems, type WishlistItemWithProduct } from "@shared/schema";
import bcrypt from 'bcryptjs';
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getAllUsers(): Promise<User[]>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: string): Promise<void>;
  
  // Auth operations
  registerUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User>;
  authenticateUser(email: string, password: string): Promise<User | null>;
  
  // Order operations
  getOrders(): Promise<OrderWithItems[]>;
  getOrder(id: string): Promise<OrderWithItems | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: string, status: string): Promise<Order | undefined>;
  deleteOrder(id: string): Promise<void>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  deleteCategory(id: string): Promise<void>;

  // Product operations
  getProducts(filters?: { categoryId?: string; subcategoryId?: string; is_featured?: boolean; is_active?: boolean }): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  getProductBySlug(slug: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: string): Promise<boolean>;

  // Collection operations
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  getCollectionBySlug(slug: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;

  // Cart operations
  getCartItems(sessionId?: string, userId?: string): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(sessionId?: string, userId?: string): Promise<void>;

  // Wishlist operations
  getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]>;
  addToWishlist(wishlistItem: InsertWishlistItem): Promise<WishlistItem>;
  removeFromWishlist(productId: string, userId: string): Promise<void>;

  // User profile operations
  getUserProfile(userId: string): Promise<UserProfile | undefined>;
  createOrUpdateUserProfile(profile: InsertUserProfile): Promise<UserProfile>;

  // Size chart operations
  getSizeCharts(): Promise<SizeChart[]>;
  getSizeChart(id: string): Promise<SizeChart | undefined>;
  createSizeChart(sizeChart: InsertSizeChart): Promise<SizeChart>;
  updateSizeChart(id: string, updates: Partial<InsertSizeChart>): Promise<SizeChart | undefined>;
  deleteSizeChart(id: string): Promise<boolean>;

  // Order operations
  createOrder(order: InsertOrder): Promise<Order>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private collections: Map<string, Collection>;
  private cartItems: Map<string, CartItem>;
  private wishlistItems: Map<string, WishlistItem>;
  private orders: Map<string, Order>;
  private orderItems: Map<string, OrderItem>;
  private userProfiles: Map<string, UserProfile>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.collections = new Map();
    this.cartItems = new Map();
    this.wishlistItems = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.userProfiles = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categories = [
      { id: "cat-1", name: "Boxer Briefs", slug: "boxer-briefs", description: "Comfortable and supportive boxer briefs", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", is_active: true, createdAt: new Date() },
      { id: "cat-2", name: "Briefs", slug: "briefs", description: "Classic briefs for everyday comfort", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", is_active: true, createdAt: new Date() },
      { id: "cat-3", name: "Trunks", slug: "trunks", description: "Modern trunks with sleek design", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", is_active: true, createdAt: new Date() },
      { id: "cat-4", name: "Performance", slug: "performance", description: "Athletic performance underwear", imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400", is_active: true, createdAt: new Date() },
      { id: "cat-5", name: "Luxury", slug: "luxury", description: "Premium luxury innerwear collection", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", is_active: true, createdAt: new Date() },
      { id: "cat-6", name: "Thermal", slug: "thermal", description: "Temperature-regulating thermal collection", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", is_active: true, createdAt: new Date() },
    ];

    categories.forEach(cat => this.categories.set(cat.id, cat));

    // Seed collections
    const collections = [
      { id: "col-1", name: "Essentials 2024", slug: "essentials-2024", description: "Premium basics for everyday comfort", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", is_active: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-2", name: "Luxury Series", slug: "luxury-series", description: "Premium comfort with luxury materials", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600", is_active: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-3", name: "Performance Collection", slug: "performance-collection", description: "Active comfort for the modern man", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", is_active: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-4", name: "Summer 2024", slug: "summer-2024", description: "Breathable fabrics for warm weather", imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600", is_active: true, season: "Summer", year: 2024, createdAt: new Date() },
      { id: "col-5", name: "Executive Line", slug: "executive-line", description: "Professional-grade comfort for the workplace", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", is_active: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-6", name: "Travel Essentials", slug: "travel-essentials", description: "Comfort that travels with you", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600", is_active: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-7", name: "Winter Warmth", slug: "winter-warmth", description: "Thermal comfort for cold seasons", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", is_active: true, season: "Winter", year: 2024, createdAt: new Date() },
    ];

    collections.forEach(col => this.collections.set(col.id, col));

    // Seed products
    const products = [
      {
        id: "prod-1",
        name: "Signature Boxer Brief",
        slug: "signature-boxer-brief",
        description: "Our signature boxer brief crafted from premium cotton blend for all-day comfort and support.",
        price: "48.00",
        categoryId: "cat-1",
        material: "Premium Cotton",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Gray", "White"],
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 100,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-2",
        name: "Modal Brief",
        slug: "modal-brief",
        description: "Luxuriously soft modal blend briefs that provide superior comfort and breathability.",
        price: "42.00",
        categoryId: "cat-2",
        material: "Modal Blend",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Navy", "Black", "White"],
        images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 85,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-3",
        name: "Performance Boxer",
        slug: "performance-boxer",
        description: "Moisture-wicking performance boxer briefs designed for active lifestyles and intense workouts.",
        price: "55.00",
        categoryId: "cat-1",
        material: "Moisture-Wicking",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Gray", "Navy"],
        images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 75,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-4",
        name: "Designer Trunk",
        slug: "designer-trunk",
        description: "Modern trunk design crafted from sustainable bamboo fiber for eco-conscious comfort.",
        price: "52.00",
        categoryId: "cat-3",
        material: "Bamboo Fiber",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Charcoal", "Navy", "White"],
        images: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 60,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-5",
        name: "Classic Cotton Brief",
        slug: "classic-cotton-brief",
        description: "Timeless cotton briefs offering traditional comfort and reliable support for everyday wear.",
        price: "38.00",
        categoryId: "cat-2",
        material: "100% Cotton",
        sizes: ["S", "M", "L", "XL"],
        colors: ["White", "Black", "Gray"],
        images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 120,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-6",
        name: "Athletic Performance Brief",
        slug: "athletic-performance-brief",
        description: "High-performance briefs with advanced moisture management for serious athletes.",
        price: "45.00",
        categoryId: "cat-4",
        material: "Technical Fabric",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Navy", "Gray"],
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 90,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-7",
        name: "Luxury Silk Boxer",
        slug: "luxury-silk-boxer",
        description: "Premium silk boxer briefs for the ultimate in luxury and sophisticated comfort.",
        price: "78.00",
        categoryId: "cat-1",
        material: "Pure Silk",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Charcoal"],
        images: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 35,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-8",
        name: "Comfort Fit Trunk",
        slug: "comfort-fit-trunk",
        description: "Specially designed trunks with enhanced comfort fit and superior fabric technology.",
        price: "49.00",
        categoryId: "cat-3",
        material: "Comfort Blend",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White", "Gray", "Navy"],
        images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 80,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-9",
        name: "Micro Mesh Brief",
        slug: "micro-mesh-brief",
        description: "Ultra-lightweight micro mesh briefs providing exceptional breathability for active days.",
        price: "46.00",
        categoryId: "cat-2",
        material: "Micro Mesh",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Navy", "White", "Gray"],
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 95,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-10",
        name: "Executive Boxer Brief",
        slug: "executive-boxer-brief",
        description: "Premium executive-grade boxer briefs designed for the discerning professional.",
        price: "65.00",
        categoryId: "cat-1",
        material: "Egyptian Cotton",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Navy", "Charcoal", "White"],
        images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 70,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-11",
        name: "Sport Performance Trunk",
        slug: "sport-performance-trunk",
        description: "High-performance trunks engineered for athletes with moisture management technology.",
        price: "58.00",
        categoryId: "cat-3",
        material: "Performance Blend",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Navy", "Gray", "Red"],
        images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 110,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-12",
        name: "Thermal Insulation Brief",
        slug: "thermal-insulation-brief",
        description: "Thermal-regulating briefs designed to maintain optimal body temperature in all conditions.",
        price: "54.00",
        categoryId: "cat-2",
        material: "Thermal Tech",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Gray"],
        images: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 85,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-13",
        name: "Luxury Cashmere Boxer",
        slug: "luxury-cashmere-boxer",
        description: "Exquisite cashmere blend boxer briefs representing the pinnacle of luxury comfort.",
        price: "125.00",
        categoryId: "cat-1",
        material: "Cashmere Blend",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Charcoal"],
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 25,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-14",
        name: "Seamless Comfort Brief",
        slug: "seamless-comfort-brief",
        description: "Revolutionary seamless construction briefs providing invisible comfort under any garment.",
        price: "44.00",
        categoryId: "cat-2",
        material: "Seamless Tech",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White", "Navy", "Beige"],
        images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 130,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-15",
        name: "Travel Essential Trunk",
        slug: "travel-essential-trunk",
        description: "Versatile travel trunks with antimicrobial properties for extended wear during travel.",
        price: "52.00",
        categoryId: "cat-3",
        material: "Travel Tech",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "Navy", "Gray", "Olive"],
        images: ["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 75,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-16",
        name: "Heritage Cotton Brief",
        slug: "heritage-cotton-brief",
        description: "Classic heritage cotton briefs celebrating traditional craftsmanship with modern comfort.",
        price: "42.00",
        categoryId: "cat-2",
        material: "Heritage Cotton",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["White", "Black", "Gray", "Navy"],
        images: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 105,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-17",
        name: "Ultra Performance Boxer",
        slug: "ultra-performance-boxer",
        description: "Maximum performance boxer briefs with advanced compression and support technology.",
        price: "72.00",
        categoryId: "cat-4",
        material: "Ultra Tech",
        sizes: ["S", "M", "L", "XL", "XXL"],
        colors: ["Black", "Navy", "Red", "Gray"],
        images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
        is_active: true,
        is_featured: true,
        stock_quantity: 60,
        createdAt: new Date(),
        updated_at: new Date()
      },
      {
        id: "prod-18",
        name: "Comfort Zone Trunk",
        slug: "comfort-zone-trunk",
        description: "Ultimate comfort trunks designed for all-day wear with superior fit and feel.",
        price: "48.00",
        categoryId: "cat-3",
        material: "Comfort Cotton",
        sizes: ["S", "M", "L", "XL"],
        colors: ["Black", "White", "Navy", "Gray", "Burgundy"],
        images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"],
        is_active: true,
        is_featured: false,
        stock_quantity: 90,
        createdAt: new Date(),
        updated_at: new Date()
      }
    ];

    products.forEach(prod => this.products.set(prod.id, prod));

    // Seed admin user
    this.createAdminUser();

    // Seed sample orders
    this.seedOrders();
  }

  private async createAdminUser() {
    const adminExists = await this.getUserByEmail("admin@modfy.lk");
    if (!adminExists) {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("Password123", saltRounds);
      
      const adminUser: User = {
        id: "admin-user-id",
        email: "admin@modfy.lk",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isEmailVerified: true,
        createdAt: new Date(),
        updated_at: new Date(),
      };
      
      this.users.set(adminUser.id, adminUser);
    }
  }

  private seedOrders() {
    const sampleOrders: Order[] = [
      {
        id: "order-1",
        userId: null, // Guest order
        orderNumber: "ORD-001",
        status: "delivered",
        totalAmount: "96.00",
        deliveryAddress: {
          fullName: "John Doe",
          phoneNumber: "+94771234567",
          addressLine1: "123 Main St",
          addressLine2: "",
          city: "Colombo",
          postalCode: "10001"
        } as const,
        phoneNumber: "+94771234567",
        paymentStatus: "paid",
        notes: "Fast delivery requested",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
        updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        id: "order-2", 
        userId: null,
        orderNumber: "ORD-002",
        status: "shipped",
        totalAmount: "155.00",
        deliveryAddress: {
          fullName: "Jane Smith",
          phoneNumber: "+94771234568",
          addressLine1: "456 Park Ave",
          addressLine2: "",
          city: "Kandy",
          postalCode: "20000"
        },
        phoneNumber: "+94771234568",
        paymentStatus: "paid",
        notes: null,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        id: "order-3",
        userId: null,
        orderNumber: "ORD-003", 
        status: "pending",
        totalAmount: "72.00",
        deliveryAddress: {
          fullName: "Mike Johnson",
          phoneNumber: "+94771234569",
          addressLine1: "789 Oak St",
          addressLine2: "",
          city: "Galle",
          postalCode: "80000"
        },
        phoneNumber: "+94771234569",
        paymentStatus: "pending",
        notes: null,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        updated_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ];

    const sampleOrderItems: OrderItem[] = [
      // Order 1 items
      {
        id: "item-1",
        orderId: "order-1", 
        productId: "prod-1",
        size: "L",
        color: "Black",
        quantity: 2,
        unitPrice: "48.00",
        totalPrice: "96.00",
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      },
      // Order 2 items  
      {
        id: "item-2",
        orderId: "order-2",
        productId: "prod-2", 
        size: "M",
        color: "Navy",
        quantity: 1,
        unitPrice: "42.00",
        totalPrice: "42.00",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      {
        id: "item-3",
        orderId: "order-2",
        productId: "prod-3",
        size: "L", 
        color: "Black",
        quantity: 2,
        unitPrice: "55.00",
        totalPrice: "110.00",
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      },
      // Order 3 items
      {
        id: "item-4",
        orderId: "order-3",
        productId: "prod-4",
        size: "M",
        color: "Gray", 
        quantity: 1,
        unitPrice: "72.00",
        totalPrice: "72.00", 
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      }
    ];

    sampleOrders.forEach(order => this.orders.set(order.id, order));
    sampleOrderItems.forEach(item => this.orderItems.set(item.id, item));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      firstName: insertUser.firstName || null,
      lastName: insertUser.lastName || null,
      role: insertUser.role || "customer",
      isEmailVerified: insertUser.isEmailVerified ?? false,
      createdAt: new Date(),
      updated_at: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    this.users.delete(id);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;

    const updatedUser = {
      ...user,
      ...updates,
      updated_at: new Date(),
    };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Auth operations
  async registerUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User> {
    // Check if user already exists
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Hash the password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Create the user
    const user = await this.createUser({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      isEmailVerified: false,
    });

    return user;
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.is_active);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    return Array.from(this.categories.values()).find(cat => cat.slug === slug);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const category: Category = {
      ...insertCategory,
      id,
      description: insertCategory.description || null,
      imageUrl: insertCategory.imageUrl || null,
      is_active: insertCategory.is_active ?? true,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  async deleteCategory(id: string): Promise<void> {
    this.categories.delete(id);
  }

  // Product operations
  async getProducts(filters?: { categoryId?: string; is_featured?: boolean; is_active?: boolean }): Promise<ProductWithCategory[]> {
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.is_featured !== undefined) {
        products = products.filter(p => p.is_featured === filters.is_featured);
      }
      if (filters.is_active !== undefined) {
        products = products.filter(p => p.is_active === filters.is_active);
      }
    }

    return products.map(product => ({
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null,
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;

    return {
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null,
    };
  }

  async getProductBySlug(slug: string): Promise<ProductWithCategory | undefined> {
    const product = Array.from(this.products.values()).find(p => p.slug === slug);
    if (!product) return undefined;

    return {
      ...product,
      category: product.categoryId ? this.categories.get(product.categoryId) || null : null,
    };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const product: Product = {
      ...insertProduct,
      id,
      description: insertProduct.description || null,
      categoryId: insertProduct.categoryId || null,
      material: insertProduct.material || null,
      sizes: insertProduct.sizes as string[] || [],
      colors: insertProduct.colors as string[] || [],
      images: insertProduct.images as string[] || [],
      is_active: insertProduct.is_active ?? true,
      is_featured: insertProduct.is_featured ?? false,
      stock_quantity: insertProduct.stock_quantity ?? 0,
      createdAt: new Date(),
      updated_at: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) {
      return undefined;
    }

    const updatedProduct: Product = {
      ...existingProduct,
      ...updates,
      id, // Keep the same ID
      updated_at: new Date(),
      sizes: updates.sizes !== undefined ? updates.sizes as string[] : existingProduct.sizes,
      colors: updates.colors !== undefined ? updates.colors as string[] : existingProduct.colors,
      images: updates.images !== undefined ? updates.images as string[] : existingProduct.images,
    };

    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const product = this.products.get(id);
    if (!product) {
      return false;
    }
    
    this.products.delete(id);
    return true;
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values()).filter(col => col.is_active);
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    return this.collections.get(id);
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    return Array.from(this.collections.values()).find(col => col.slug === slug);
  }

  async createCollection(insertCollection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collection: Collection = {
      ...insertCollection,
      id,
      description: insertCollection.description || null,
      imageUrl: insertCollection.imageUrl || null,
      is_active: insertCollection.is_active ?? true,
      season: insertCollection.season || null,
      year: insertCollection.year || null,
      createdAt: new Date(),
    };
    this.collections.set(id, collection);
    return collection;
  }

  // Cart operations
  async getCartItems(sessionId?: string, userId?: string): Promise<CartItemWithProduct[]> {
    const cartItems = Array.from(this.cartItems.values())
      .filter(item => {
        if (userId) {
          return item.userId === userId;
        }
        return item.sessionId === sessionId;
      });

    return cartItems.map(item => ({
      ...item,
      product: this.products.get(item.productId!) as Product,
    })).filter(item => item.product);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values())
      .find(item => {
        const sameProduct = item.productId === insertCartItem.productId &&
                          item.size === insertCartItem.size &&
                          item.color === insertCartItem.color;
        
        if (insertCartItem.userId) {
          return sameProduct && item.userId === insertCartItem.userId;
        }
        return sameProduct && item.sessionId === insertCartItem.sessionId;
      });

    if (existingItem) {
      // Update quantity
      existingItem.quantity += insertCartItem.quantity || 1;
      existingItem.updated_at = new Date();
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = {
      id,
      sessionId: insertCartItem.sessionId || null,
      userId: insertCartItem.userId || null,
      productId: insertCartItem.productId || null,
      size: insertCartItem.size || null,
      color: insertCartItem.color || null,
      quantity: insertCartItem.quantity || 1,
      createdAt: new Date(),
      updated_at: new Date(),
    };
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem | undefined> {
    const item = this.cartItems.get(id);
    if (!item) return undefined;

    const updatedItem = {
      ...item,
      ...updates,
      updated_at: new Date(),
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(sessionId?: string, userId?: string): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => {
        if (userId) {
          return item.userId === userId;
        }
        return item.sessionId === sessionId;
      })
      .map(([id, _]) => id);

    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    if (!userId) return [];

    const wishlistItems = Array.from(this.wishlistItems.values())
      .filter(item => item.userId === userId);

    return wishlistItems.map(item => ({
      ...item,
      product: this.products.get(item.productId!) as Product,
    })).filter(item => item.product);
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    if (!insertWishlistItem.userId || !insertWishlistItem.productId) {
      throw new Error('User ID and Product ID are required');
    }

    // Check if item already exists for this user
    const existingItem = Array.from(this.wishlistItems.values())
      .find(item => 
        item.userId === insertWishlistItem.userId &&
        item.productId === insertWishlistItem.productId
      );

    if (existingItem) {
      return existingItem;
    }

    const id = randomUUID();
    const wishlistItem: WishlistItem = {
      id,
      productId: insertWishlistItem.productId,
      userId: insertWishlistItem.userId,
      createdAt: new Date(),
    };
    this.wishlistItems.set(id, wishlistItem);
    return wishlistItem;
  }

  async removeFromWishlist(productId: string, userId: string): Promise<void> {
    if (!userId || !productId) {
      throw new Error('User ID and Product ID are required');
    }

    const itemToDelete = Array.from(this.wishlistItems.entries())
      .find(([_, item]) => 
        item.productId === productId &&
        item.userId === userId
      );

    if (itemToDelete) {
      this.wishlistItems.delete(itemToDelete[0]);
    }
  }

  // Order operations
  async getOrders(): Promise<OrderWithItems[]> {
    const orders = Array.from(this.orders.values());
    return orders.map(order => ({
      ...order,
      user: order.userId ? this.users.get(order.userId) || null : null,
      items: Array.from(this.orderItems.values())
        .filter(item => item.orderId === order.id)
        .map(item => ({
          ...item,
          product: this.products.get(item.productId!)!
        }))
    }));
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    return {
      ...order,
      user: order.userId ? this.users.get(order.userId) || null : null,
      items: Array.from(this.orderItems.values())
        .filter(item => item.orderId === id)
        .map(item => ({
          ...item,
          product: this.products.get(item.productId!)!
        }))
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const order: Order = {
      id,
      userId: insertOrder.userId || null,
      orderNumber: insertOrder.orderNumber,
      status: insertOrder.status || "pending",
      totalAmount: insertOrder.totalAmount,
      deliveryAddress: insertOrder.deliveryAddress,
      phoneNumber: insertOrder.phoneNumber,
      paymentStatus: insertOrder.paymentStatus || null,
      notes: insertOrder.notes || null,
      createdAt: new Date(),
      updated_at: new Date(),
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const updatedOrder = { ...order, status, updated_at: new Date() };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  async deleteOrder(id: string): Promise<void> {
    // Delete order items first
    const orderItemsToDelete = Array.from(this.orderItems.values()).filter(
      item => item.orderId === id
    );
    orderItemsToDelete.forEach(item => this.orderItems.delete(item.id));
    
    // Delete the order
    this.orders.delete(id);
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    return Array.from(this.userProfiles.values()).find(profile => profile.userId === userId);
  }

  async createOrUpdateUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(profile.userId);
    
    if (existingProfile) {
      const updatedProfile: UserProfile = {
        ...existingProfile,
        ...profile,
        updated_at: new Date(),
      };
      this.userProfiles.set(existingProfile.id, updatedProfile);
      return updatedProfile;
    } else {
      const id = randomUUID();
      const newProfile: UserProfile = {
        id,
        ...profile,
        createdAt: new Date(),
        updated_at: new Date(),
      };
      this.userProfiles.set(id, newProfile);
      return newProfile;
    }
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    const orderItem: OrderItem = {
      id,
      ...insertOrderItem,
      createdAt: new Date(),
    };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

}

import { DatabaseStorage } from "./dbStorage";

let storageInstance: DatabaseStorage | null = null;

export const storage = new Proxy({} as DatabaseStorage, {
  get(target, prop) {
    if (!storageInstance) {
      storageInstance = new DatabaseStorage();
    }
    return (storageInstance as any)[prop];
  }
});
