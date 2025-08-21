import { db } from "./db";
import { eq, and, desc } from "drizzle-orm";
import bcrypt from 'bcryptjs';
import { randomUUID } from "crypto";
import {
  users,
  categories,
  products,
  collections,
  collectionProducts,
  cartItems,
  wishlistItems,
  orders,
  orderItems,
  type User,
  type InsertUser,
  type Category,
  type InsertCategory,
  type Product,
  type InsertProduct,
  type Collection,
  type InsertCollection,
  type CartItem,
  type InsertCartItem,
  type WishlistItem,
  type InsertWishlistItem,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type ProductWithCategory,
  type CartItemWithProduct,
  type WishlistItemWithProduct,
  type OrderWithItems
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  constructor() {
    this.seedData();
  }

  private async seedData() {
    try {
      // Check if data already exists
      const existingUsers = await db.select().from(users).limit(1);
      if (existingUsers.length > 0) return;

      console.log('Seeding database...');
      
      // Create admin user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("Password123", saltRounds);
      
      await db.insert(users).values({
        id: "admin-user-id",
        email: "admin@modfy.lk",
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: "admin",
        isEmailVerified: true,
      });

      // Seed categories
      const categoryData = [
        { id: "cat-1", name: "Boxer Briefs", slug: "boxer-briefs", description: "Comfortable and supportive boxer briefs", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
        { id: "cat-2", name: "Briefs", slug: "briefs", description: "Classic briefs for everyday comfort", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" },
        { id: "cat-3", name: "Trunks", slug: "trunks", description: "Modern trunks with sleek design", imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400" },
        { id: "cat-4", name: "Performance", slug: "performance", description: "Athletic performance underwear", imageUrl: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400" },
        { id: "cat-5", name: "Luxury", slug: "luxury", description: "Premium luxury innerwear collection", imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400" },
        { id: "cat-6", name: "Thermal", slug: "thermal", description: "Temperature-regulating thermal collection", imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400" },
      ];
      
      await db.insert(categories).values(categoryData);

      // Seed collections
      const collectionData = [
        {
          id: "col-1",
          name: "Essentials 2024",
          slug: "essentials-2024",
          description: "Premium basics for everyday comfort",
          imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
          season: "All Season",
          year: 2024,
        },
        {
          id: "col-2",
          name: "Luxury Series",
          slug: "luxury-series",
          description: "Premium comfort with luxury materials",
          imageUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600",
          season: "All Season",
          year: 2024,
        },
      ];

      await db.insert(collections).values(collectionData);

      // Seed products
      const productData = [
        {
          id: "prod-1",
          name: "Signature Boxer Brief",
          slug: "signature-boxer-brief",
          description: "Our signature boxer brief with premium comfort and support. Made with the finest materials for all-day comfort.",
          price: "48.00",
          categoryId: "cat-1",
          material: "Premium Cotton",
          sizes: ["S", "M", "L", "XL", "XXL"],
          colors: ["Black", "White", "Navy", "Gray"],
          images: ["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"],
          stockQuantity: 120,
          isFeatured: true,
        },
        {
          id: "prod-2",
          name: "Essential Brief",
          slug: "essential-brief",
          description: "Classic brief design with modern comfort technology. Perfect for everyday wear.",
          price: "42.00",
          categoryId: "cat-2",
          material: "Organic Cotton",
          sizes: ["S", "M", "L", "XL"],
          colors: ["Black", "White", "Navy"],
          images: ["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"],
          stockQuantity: 85,
          isFeatured: true,
        },
        {
          id: "prod-3",
          name: "Performance Trunk",
          slug: "performance-trunk",
          description: "Athletic performance trunk with moisture-wicking technology and enhanced support.",
          price: "55.00",
          categoryId: "cat-3",
          material: "Technical Blend",
          sizes: ["S", "M", "L", "XL", "XXL"],
          colors: ["Black", "Navy", "Gray", "White"],
          images: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"],
          stockQuantity: 95,
          isFeatured: true,
        },
      ];

      await db.insert(products).values(productData);

      // Seed sample orders
      const sampleOrders = [
        {
          id: "order-1",
          orderNumber: "ORD-001",
          status: "delivered",
          totalAmount: "96.00",
          shippingAddress: {
            firstName: "John",
            lastName: "Doe",
            address: "123 Main St",
            city: "Colombo",
            country: "Sri Lanka",
            zipCode: "10001"
          },
          paymentStatus: "paid",
          notes: "Fast delivery requested",
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
        },
        {
          id: "order-2",
          orderNumber: "ORD-002",
          status: "shipped",
          totalAmount: "155.00",
          shippingAddress: {
            firstName: "Jane",
            lastName: "Smith",
            address: "456 Park Ave",
            city: "Kandy",
            country: "Sri Lanka",
            zipCode: "20000"
          },
          paymentStatus: "paid",
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        },
      ];

      await db.insert(orders).values(sampleOrders);

      // Seed order items
      const sampleOrderItems = [
        {
          id: "item-1",
          orderId: "order-1",
          productId: "prod-1",
          size: "L",
          color: "Black",
          quantity: 2,
          unitPrice: "48.00",
          totalPrice: "96.00",
        },
        {
          id: "item-2",
          orderId: "order-2",
          productId: "prod-2",
          size: "M",
          color: "Navy",
          quantity: 1,
          unitPrice: "42.00",
          totalPrice: "42.00",
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
        },
      ];

      await db.insert(orderItems).values(sampleOrderItems);

      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const userData = {
      ...insertUser,
      id,
      role: insertUser.role || "customer",
      isEmailVerified: insertUser.isEmailVerified ?? false,
    };

    const [user] = await db.insert(users).values(userData).returning();
    return user;
  }

  // Auth operations
  async registerUser(userData: { email: string; password: string; firstName: string; lastName: string }): Promise<User> {
    const existingUser = await this.getUserByEmail(userData.email);
    if (existingUser) {
      throw new Error("User already exists");
    }

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    return this.createUser({
      email: userData.email,
      password: hashedPassword,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: "customer",
      isEmailVerified: false,
    });
  }

  async authenticateUser(email: string, password: string): Promise<User | null> {
    const user = await this.getUserByEmail(email);
    if (!user) return null;

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) return null;

    return user;
  }

  // Category operations
  async getCategories(): Promise<Category[]> {
    return await db.select().from(categories).orderBy(categories.name);
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.id, id));
    return category;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [category] = await db.select().from(categories).where(eq(categories.slug, slug));
    return category;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    const categoryData = {
      ...category,
      id,
    };

    const [newCategory] = await db.insert(categories).values(categoryData).returning();
    return newCategory;
  }

  // Product operations
  async getProducts(filters?: { categoryId?: string; isFeatured?: boolean; isActive?: boolean }): Promise<ProductWithCategory[]> {
    const query = db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        material: products.material,
        sizes: products.sizes,
        colors: products.colors,
        images: products.images,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        stockQuantity: products.stockQuantity,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id));

    let conditions = [];
    if (filters?.categoryId) {
      conditions.push(eq(products.categoryId, filters.categoryId));
    }
    if (filters?.isFeatured !== undefined) {
      conditions.push(eq(products.isFeatured, filters.isFeatured));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(eq(products.isActive, filters.isActive));
    }

    if (conditions.length > 0) {
      query.where(and(...conditions));
    }

    const result = await query;
    
    return result.map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      categoryId: row.categoryId,
      material: row.material,
      sizes: row.sizes,
      colors: row.colors,
      images: row.images,
      isActive: row.isActive,
      isFeatured: row.isFeatured,
      stockQuantity: row.stockQuantity,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      category: row.category,
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const [result] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        material: products.material,
        sizes: products.sizes,
        colors: products.colors,
        images: products.images,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        stockQuantity: products.stockQuantity,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.id, id));

    if (!result) return undefined;

    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description,
      price: result.price,
      categoryId: result.categoryId,
      material: result.material,
      sizes: result.sizes,
      colors: result.colors,
      images: result.images,
      isActive: result.isActive,
      isFeatured: result.isFeatured,
      stockQuantity: result.stockQuantity,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      category: result.category,
    };
  }

  async getProductBySlug(slug: string): Promise<ProductWithCategory | undefined> {
    const [result] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        categoryId: products.categoryId,
        material: products.material,
        sizes: products.sizes,
        colors: products.colors,
        images: products.images,
        isActive: products.isActive,
        isFeatured: products.isFeatured,
        stockQuantity: products.stockQuantity,
        createdAt: products.createdAt,
        updatedAt: products.updatedAt,
        category: categories,
      })
      .from(products)
      .leftJoin(categories, eq(products.categoryId, categories.id))
      .where(eq(products.slug, slug));

    if (!result) return undefined;

    return {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description,
      price: result.price,
      categoryId: result.categoryId,
      material: result.material,
      sizes: result.sizes,
      colors: result.colors,
      images: result.images,
      isActive: result.isActive,
      isFeatured: result.isFeatured,
      stockQuantity: result.stockQuantity,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      category: result.category,
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const productData = {
      ...product,
      id,
      sizes: Array.isArray(product.sizes) ? product.sizes : (typeof product.sizes === 'string' ? JSON.parse(product.sizes) : []),
      colors: Array.isArray(product.colors) ? product.colors : (typeof product.colors === 'string' ? JSON.parse(product.colors) : []),
      images: Array.isArray(product.images) ? product.images : (typeof product.images === 'string' ? JSON.parse(product.images) : []),
    };

    const [newProduct] = await db.insert(products).values(productData).returning();
    return newProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await db.delete(products).where(eq(products.id, id));
    return result.rowCount > 0;
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    return await db.select().from(collections).orderBy(desc(collections.year), collections.name);
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.id, id));
    return collection;
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    const [collection] = await db.select().from(collections).where(eq(collections.slug, slug));
    return collection;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    const collectionData = {
      ...collection,
      id,
    };

    const [newCollection] = await db.insert(collections).values(collectionData).returning();
    return newCollection;
  }

  // Cart operations
  async getCartItems(sessionId: string): Promise<CartItemWithProduct[]> {
    const result = await db
      .select({
        id: cartItems.id,
        sessionId: cartItems.sessionId,
        productId: cartItems.productId,
        size: cartItems.size,
        color: cartItems.color,
        quantity: cartItems.quantity,
        createdAt: cartItems.createdAt,
        updatedAt: cartItems.updatedAt,
        product: products,
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(eq(cartItems.sessionId, sessionId));

    return result.map(row => ({
      id: row.id,
      sessionId: row.sessionId,
      productId: row.productId,
      size: row.size,
      color: row.color,
      quantity: row.quantity,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
      product: row.product!,
    }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    const cartItemData = {
      ...cartItem,
      id,
    };

    const [newCartItem] = await db.insert(cartItems).values(cartItemData).returning();
    return newCartItem;
  }

  async updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem | undefined> {
    const [updatedItem] = await db
      .update(cartItems)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(cartItems.id, id))
      .returning();

    return updatedItem;
  }

  async removeFromCart(id: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.id, id));
  }

  async clearCart(sessionId: string): Promise<void> {
    await db.delete(cartItems).where(eq(cartItems.sessionId, sessionId));
  }

  // Order operations
  async getOrders(): Promise<OrderWithItems[]> {
    const ordersData = await db
      .select()
      .from(orders)
      .orderBy(desc(orders.createdAt));

    const result: OrderWithItems[] = [];
    
    for (const order of ordersData) {
      const orderItemsData = await db
        .select({
          id: orderItems.id,
          orderId: orderItems.orderId,
          productId: orderItems.productId,
          size: orderItems.size,
          color: orderItems.color,
          quantity: orderItems.quantity,
          unitPrice: orderItems.unitPrice,
          totalPrice: orderItems.totalPrice,
          createdAt: orderItems.createdAt,
          product: products,
        })
        .from(orderItems)
        .leftJoin(products, eq(orderItems.productId, products.id))
        .where(eq(orderItems.orderId, order.id));

      const user = order.userId ? (await this.getUser(order.userId)) ?? null : null;

      result.push({
        ...order,
        user,
        items: orderItemsData.map(item => ({
          id: item.id,
          orderId: item.orderId,
          productId: item.productId,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          totalPrice: item.totalPrice,
          createdAt: item.createdAt,
          product: item.product!,
        })),
      });
    }

    return result;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [order] = await db.select().from(orders).where(eq(orders.id, id));
    if (!order) return undefined;

    const orderItemsData = await db
      .select({
        id: orderItems.id,
        orderId: orderItems.orderId,
        productId: orderItems.productId,
        size: orderItems.size,
        color: orderItems.color,
        quantity: orderItems.quantity,
        unitPrice: orderItems.unitPrice,
        totalPrice: orderItems.totalPrice,
        createdAt: orderItems.createdAt,
        product: products,
      })
      .from(orderItems)
      .leftJoin(products, eq(orderItems.productId, products.id))
      .where(eq(orderItems.orderId, id));

    const user = order.userId ? (await this.getUser(order.userId)) ?? null : null;

    return {
      ...order,
      user,
      items: orderItemsData.map(item => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        createdAt: item.createdAt,
        product: item.product!,
      })),
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    const orderData = {
      ...insertOrder,
      id,
      shippingAddress: typeof insertOrder.shippingAddress === 'object' && insertOrder.shippingAddress !== null
        ? insertOrder.shippingAddress
        : (typeof insertOrder.shippingAddress === 'string' ? JSON.parse(insertOrder.shippingAddress) : null),
    };

    const [order] = await db.insert(orders).values(orderData).returning();
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    const [updatedOrder] = await db
      .update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();

    return updatedOrder;
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    if (!userId) {
      return [];
    }

    const wishlistData = await db
      .select({
        id: wishlistItems.id,
        userId: wishlistItems.userId,
        sessionId: wishlistItems.sessionId,
        productId: wishlistItems.productId,
        createdAt: wishlistItems.createdAt,
        product: products,
      })
      .from(wishlistItems)
      .leftJoin(products, eq(wishlistItems.productId, products.id))
      .where(eq(wishlistItems.userId, userId));

    return wishlistData
      .filter(item => item.product)
      .map(item => ({
        id: item.id,
        userId: item.userId,
        sessionId: item.sessionId,
        productId: item.productId,
        createdAt: item.createdAt,
        product: item.product!,
      }));
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    if (!insertWishlistItem.userId || !insertWishlistItem.productId) {
      throw new Error('User ID and Product ID are required');
    }

    // Check if item already exists for this user
    const [existing] = await db
      .select()
      .from(wishlistItems)
      .where(
        and(
          eq(wishlistItems.productId, insertWishlistItem.productId),
          eq(wishlistItems.userId, insertWishlistItem.userId)
        )
      )
      .limit(1);

    if (existing) {
      return existing;
    }

    const [wishlistItem] = await db
      .insert(wishlistItems)
      .values({
        id: randomUUID(),
        productId: insertWishlistItem.productId,
        userId: insertWishlistItem.userId,
        sessionId: null, // No longer use session ID
      })
      .returning();

    return wishlistItem;
  }

  async removeFromWishlist(productId: string, userId: string): Promise<void> {
    if (!userId || !productId) {
      throw new Error('User ID and Product ID are required');
    }

    await db
      .delete(wishlistItems)
      .where(
        and(
          eq(wishlistItems.productId, productId),
          eq(wishlistItems.userId, userId)
        )
      );
  }
}