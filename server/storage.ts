import { type User, type InsertUser, type Category, type InsertCategory, type Product, type InsertProduct, type Collection, type InsertCollection, type CartItem, type InsertCartItem, type ProductWithCategory, type CartItemWithProduct } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category operations
  getCategories(): Promise<Category[]>;
  getCategory(id: string): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Product operations
  getProducts(filters?: { categoryId?: string; isFeatured?: boolean; isActive?: boolean }): Promise<ProductWithCategory[]>;
  getProduct(id: string): Promise<ProductWithCategory | undefined>;
  getProductBySlug(slug: string): Promise<ProductWithCategory | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;

  // Collection operations
  getCollections(): Promise<Collection[]>;
  getCollection(id: string): Promise<Collection | undefined>;
  getCollectionBySlug(slug: string): Promise<Collection | undefined>;
  createCollection(collection: InsertCollection): Promise<Collection>;

  // Cart operations
  getCartItems(sessionId: string): Promise<CartItemWithProduct[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem | undefined>;
  removeFromCart(id: string): Promise<void>;
  clearCart(sessionId: string): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private categories: Map<string, Category>;
  private products: Map<string, Product>;
  private collections: Map<string, Collection>;
  private cartItems: Map<string, CartItem>;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.products = new Map();
    this.collections = new Map();
    this.cartItems = new Map();
    this.seedData();
  }

  private seedData() {
    // Seed categories
    const categories = [
      { id: "cat-1", name: "Boxer Briefs", slug: "boxer-briefs", description: "Comfortable and supportive boxer briefs", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", isActive: true, createdAt: new Date() },
      { id: "cat-2", name: "Briefs", slug: "briefs", description: "Classic briefs for everyday comfort", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", isActive: true, createdAt: new Date() },
      { id: "cat-3", name: "Trunks", slug: "trunks", description: "Modern trunks with sleek design", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400", isActive: true, createdAt: new Date() },
      { id: "cat-4", name: "Performance", slug: "performance", description: "Athletic performance underwear", imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400", isActive: true, createdAt: new Date() },
      { id: "cat-5", name: "Luxury", slug: "luxury", description: "Premium luxury innerwear collection", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", isActive: true, createdAt: new Date() },
      { id: "cat-6", name: "Thermal", slug: "thermal", description: "Temperature-regulating thermal collection", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400", isActive: true, createdAt: new Date() },
    ];

    categories.forEach(cat => this.categories.set(cat.id, cat));

    // Seed collections
    const collections = [
      { id: "col-1", name: "Essentials 2024", slug: "essentials-2024", description: "Premium basics for everyday comfort", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", isActive: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-2", name: "Luxury Series", slug: "luxury-series", description: "Premium comfort with luxury materials", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600", isActive: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-3", name: "Performance Collection", slug: "performance-collection", description: "Active comfort for the modern man", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", isActive: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-4", name: "Summer 2024", slug: "summer-2024", description: "Breathable fabrics for warm weather", imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600", isActive: true, season: "Summer", year: 2024, createdAt: new Date() },
      { id: "col-5", name: "Executive Line", slug: "executive-line", description: "Professional-grade comfort for the workplace", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", isActive: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-6", name: "Travel Essentials", slug: "travel-essentials", description: "Comfort that travels with you", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600", isActive: true, season: "All Season", year: 2024, createdAt: new Date() },
      { id: "col-7", name: "Winter Warmth", slug: "winter-warmth", description: "Thermal comfort for cold seasons", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600", isActive: true, season: "Winter", year: 2024, createdAt: new Date() },
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 100,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 85,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 75,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 60,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 120,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 90,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 35,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 80,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 95,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 70,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 110,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 85,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 25,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 130,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 75,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 105,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: true,
        stockQuantity: 60,
        createdAt: new Date(),
        updatedAt: new Date()
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
        isActive: true,
        isFeatured: false,
        stockQuantity: 90,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    products.forEach(prod => this.products.set(prod.id, prod));
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(cat => cat.isActive);
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
      isActive: insertCategory.isActive ?? true,
      createdAt: new Date(),
    };
    this.categories.set(id, category);
    return category;
  }

  // Product operations
  async getProducts(filters?: { categoryId?: string; isFeatured?: boolean; isActive?: boolean }): Promise<ProductWithCategory[]> {
    let products = Array.from(this.products.values());

    if (filters) {
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.isFeatured !== undefined) {
        products = products.filter(p => p.isFeatured === filters.isFeatured);
      }
      if (filters.isActive !== undefined) {
        products = products.filter(p => p.isActive === filters.isActive);
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
      isActive: insertProduct.isActive ?? true,
      isFeatured: insertProduct.isFeatured ?? false,
      stockQuantity: insertProduct.stockQuantity ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.set(id, product);
    return product;
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    return Array.from(this.collections.values()).filter(col => col.isActive);
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
      isActive: insertCollection.isActive ?? true,
      season: insertCollection.season || null,
      year: insertCollection.year || null,
      createdAt: new Date(),
    };
    this.collections.set(id, collection);
    return collection;
  }

  // Cart operations
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const cartItems = Array.from(this.cartItems.values())
      .filter(item => item.sessionId === sessionId);

    return cartItems.map(item => ({
      ...item,
      product: this.products.get(item.productId!) as Product,
    })).filter(item => item.product);
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists
    const existingItem = Array.from(this.cartItems.values())
      .find(item => 
        item.sessionId === insertCartItem.sessionId &&
        item.productId === insertCartItem.productId &&
        item.size === insertCartItem.size &&
        item.color === insertCartItem.color
      );

    if (existingItem) {
      // Update quantity
      existingItem.quantity += insertCartItem.quantity || 1;
      existingItem.updatedAt = new Date();
      this.cartItems.set(existingItem.id, existingItem);
      return existingItem;
    }

    const id = randomUUID();
    const cartItem: CartItem = {
      ...insertCartItem,
      id,
      productId: insertCartItem.productId || null,
      size: insertCartItem.size || null,
      color: insertCartItem.color || null,
      quantity: insertCartItem.quantity || 1,
      createdAt: new Date(),
      updatedAt: new Date(),
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
      updatedAt: new Date(),
    };
    this.cartItems.set(id, updatedItem);
    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    this.cartItems.delete(id);
  }

  async clearCart(sessionId: string): Promise<void> {
    const itemsToDelete = Array.from(this.cartItems.entries())
      .filter(([_, item]) => item.sessionId === sessionId)
      .map(([id, _]) => id);

    itemsToDelete.forEach(id => this.cartItems.delete(id));
  }
}

export const storage = new MemStorage();
