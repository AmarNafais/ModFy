import mysql from 'mysql2/promise';
import { randomUUID } from "crypto";
import bcrypt from 'bcryptjs';
import {
  users,
  categories,
  products,
  collections,
  collectionProducts,
  cartItems,
  wishlistItems,
  userProfiles,
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
  type UserProfile,
  type InsertUserProfile,
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
  private pool: mysql.Pool;

  constructor() {
    this.pool = mysql.createPool({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'mysql',
      password: process.env.DB_PASSWORD || 'Complex123',
      database: process.env.DB_NAME || 'modfy',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    
    // Auto-seed on startup if AUTO_SEED=true (disabled by default)
    if (process.env.AUTO_SEED === 'true') {
      this.seedData();
    }
  }

  private async seedData() {
    let connection;
    try {
      connection = await this.pool.getConnection();
      
      // Check if data already exists
      const [existingUsers] = await connection.execute('SELECT id FROM users LIMIT 1');
      if (Array.isArray(existingUsers) && existingUsers.length > 0) return;

      console.log('Seeding database...');
      
      // Create admin user
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash("Password123", saltRounds);
      
      await connection.execute(
        `INSERT INTO users 
        (id, email, password, first_name, last_name, role, is_email_verified) 
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        ["admin-user-id", "admin@modfy.lk", hashedPassword, "Admin", "User", "admin", 1]
      );

      // Seed categories
      const categoryData = [
        ["cat-1", "Boxer Briefs", "boxer-briefs", "Comfortable and supportive boxer briefs", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
        ["cat-2", "Briefs", "briefs", "Classic briefs for everyday comfort", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"],
        ["cat-3", "Trunks", "trunks", "Modern trunks with sleek design", "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"],
        ["cat-4", "Performance", "performance", "Athletic performance underwear", "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400"],
        ["cat-5", "Luxury", "luxury", "Premium luxury innerwear collection", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"],
        ["cat-6", "Thermal", "thermal", "Temperature-regulating thermal collection", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"],
      ];
      
      for (const category of categoryData) {
        await connection.execute(
          'INSERT INTO categories (id, name, slug, description, image_url) VALUES (?, ?, ?, ?, ?)',
          category
        );
      }

      // Seed collections
      const collectionData = [
        ["col-1", "Essentials 2024", "essentials-2024", "Premium basics for everyday comfort", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600", "All Season", 2024],
        ["col-2", "Luxury Series", "luxury-series", "Premium comfort with luxury materials", "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600", "All Season", 2024],
      ];

      for (const collection of collectionData) {
        await connection.execute(
          'INSERT INTO collections (id, name, slug, description, image_url, season, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
          collection
        );
      }

      // Seed products
      const productData = [
        ["prod-1", "Signature Boxer Brief", "signature-boxer-brief", "Our signature boxer brief with premium comfort and support. Made with the finest materials for all-day comfort.", "48.00", "cat-1", "Premium Cotton", JSON.stringify(["S", "M", "L", "XL", "XXL"]), JSON.stringify({"S": "45.00", "M": "48.00", "L": "52.00", "XL": "56.00", "XXL": "60.00"}), JSON.stringify(["Black", "White", "Navy", "Gray"]), JSON.stringify(["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"]), 120, true, true],
        ["prod-2", "Essential Brief", "essential-brief", "Classic brief design with modern comfort technology. Perfect for everyday wear.", "42.00", "cat-2", "Organic Cotton", JSON.stringify(["S", "M", "L", "XL"]), JSON.stringify({"S": "40.00", "M": "42.00", "L": "45.00", "XL": "48.00"}), JSON.stringify(["Black", "White", "Navy"]), JSON.stringify(["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"]), 85, true, true],
        ["prod-3", "Performance Trunk", "performance-trunk", "Athletic performance trunk with moisture-wicking technology and enhanced support.", "55.00", "cat-3", "Technical Blend", JSON.stringify(["S", "M", "L", "XL", "XXL"]), JSON.stringify({"S": "52.00", "M": "55.00", "L": "58.00", "XL": "62.00", "XXL": "66.00"}), JSON.stringify(["Black", "Navy", "Gray", "White"]), JSON.stringify(["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"]), 95, true, true],
      ];

      for (const product of productData) {
        await connection.execute(
          'INSERT INTO products (id, name, slug, description, price, category_id, material, sizes, size_pricing, colors, images, stock_quantity, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          product
        );
      }

      // Seed sample orders
      const sampleOrders = [
        ["order-1", "ORD-001", "delivered", "96.00", JSON.stringify({
          fullName: "John Doe",
          phoneNumber: "+94771234567",
          addressLine1: "123 Main St",
          addressLine2: "",
          city: "Colombo",
          postalCode: "10001"
        }), "+94771234567", "paid", "Fast delivery requested", new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)],
        ["order-2", "ORD-002", "shipped", "155.00", JSON.stringify({
          fullName: "Jane Smith",
          phoneNumber: "+94771234568",
          addressLine1: "456 Park Ave",
          addressLine2: "",
          city: "Kandy",
          postalCode: "20000"
        }), "+94771234568", "paid", null, new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)],
      ];

      for (const order of sampleOrders) {
        await connection.execute(
          'INSERT INTO orders (id, order_number, status, total_amount, delivery_address, phone_number, payment_status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
          order
        );
      }

      // Seed order items
      const sampleOrderItems = [
        ["item-1", "order-1", "prod-1", "L", "Black", 2, "48.00", "96.00", new Date()],
        ["item-2", "order-2", "prod-2", "M", "Navy", 1, "42.00", "42.00", new Date()],
        ["item-3", "order-2", "prod-3", "L", "Black", 2, "55.00", "110.00", new Date()],
      ];

      for (const item of sampleOrderItems) {
        await connection.execute(
          'INSERT INTO order_items (id, order_id, product_id, size, color, quantity, unit_price, total_price, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
          item
        );
      }

      console.log('Database seeded successfully!');
    } catch (error) {
      console.error('Error seeding database:', error);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    
    const row: any = rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isEmailVerified: row.is_email_verified,
      createdAt: row.created_at,
      updated_at: row.updated_at,
    } as User;
  }

  async getAllUsers(): Promise<User[]> {
    const [rows] = await this.pool.execute('SELECT * FROM users');
    if (!Array.isArray(rows)) return [];
    
    return rows.map((row: any) => ({
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isEmailVerified: row.is_email_verified,
      createdAt: row.created_at,
      updated_at: row.updated_at,
    })) as User[];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [rows] = await this.pool.execute('SELECT * FROM users WHERE email = ?', [email]);
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    
    const row: any = rows[0];
    return {
      id: row.id,
      email: row.email,
      password: row.password,
      firstName: row.first_name,
      lastName: row.last_name,
      role: row.role,
      isEmailVerified: row.is_email_verified,
      createdAt: row.created_at,
      updated_at: row.updated_at,
    } as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const userData = {
      ...insertUser,
      id,
      role: insertUser.role || "customer",
      isEmailVerified: insertUser.isEmailVerified ?? false,
    };

    await this.pool.execute(
      'INSERT INTO users (id, email, password, first_name, last_name, role, is_email_verified) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, userData.email, userData.password, userData.firstName, userData.lastName, userData.role, userData.isEmailVerified]
    );

    const user = await this.getUser(id);
    if (!user) throw new Error("Failed to create user");
    return user;
  }

  async deleteUser(id: string): Promise<void> {
    await this.pool.execute('DELETE FROM users WHERE id = ?', [id]);
  }

  async updateUser(id: string, updates: Partial<InsertUser>): Promise<User | undefined> {
    const setFields: string[] = [];
    const values: any[] = [];

    if (updates.firstName !== undefined) {
      setFields.push('first_name = ?');
      values.push(updates.firstName);
    }
    if (updates.lastName !== undefined) {
      setFields.push('last_name = ?');
      values.push(updates.lastName);
    }
    if (updates.role !== undefined) {
      setFields.push('role = ?');
      values.push(updates.role);
    }
    if (updates.isEmailVerified !== undefined) {
      setFields.push('is_email_verified = ?');
      values.push(updates.isEmailVerified);
    }

    if (setFields.length === 0) {
      return this.getUser(id);
    }

    values.push(id);
    await this.pool.execute(
      `UPDATE users SET ${setFields.join(', ')} WHERE id = ?`,
      values
    );

    return this.getUser(id);
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
    const [rows] = await this.pool.execute('SELECT * FROM categories ORDER BY name');
    return Array.isArray(rows) ? rows as Category[] : [];
  }

  async getCategory(id: string): Promise<Category | undefined> {
    const [rows] = await this.pool.execute('SELECT * FROM categories WHERE id = ?', [id]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as Category : undefined;
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    const [rows] = await this.pool.execute('SELECT * FROM categories WHERE slug = ?', [slug]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as Category : undefined;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const id = randomUUID();
    await this.pool.execute(
      'INSERT INTO categories (id, name, slug, description, image_url, parent_id, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, category.name, category.slug, category.description, category.imageUrl, category.parentId || null, category.is_active ?? true]
    );

    const newCategory = await this.getCategory(id);
    if (!newCategory) throw new Error("Failed to create category");
    return newCategory;
  }

  async deleteCategory(id: string): Promise<void> {
    await this.pool.execute('DELETE FROM categories WHERE id = ?', [id]);
  }

  // Product operations
  async getProducts(filters?: { categoryId?: string; subcategoryId?: string; is_featured?: boolean; is_active?: boolean }): Promise<ProductWithCategory[]> {
    let query = `
      SELECT p.*, c.id as category_id, c.name as category_name, c.slug as category_slug, 
             c.description as category_description, c.image_url as category_imageUrl
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.categoryId) {
      query += ' AND p.category_id = ?';
      params.push(filters.categoryId);
    }
    if (filters?.subcategoryId) {
      query += ' AND p.subcategory_id = ?';
      params.push(filters.subcategoryId);
    }
    if (filters?.is_featured !== undefined) {
      query += ' AND p.is_featured = ?';
      params.push(filters.is_featured);
    }
    if (filters?.is_active !== undefined) {
      query += ' AND p.is_active = ?';
      params.push(filters.is_active);
    }

    query += ' ORDER BY p.name';

    const [rows] = await this.pool.execute(query, params);
    
    if (!Array.isArray(rows)) return [];
    
    return rows.map((row: any) => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      categoryId: row.category_id,
      subcategoryId: row.subcategory_id,
      material: row.material,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
      sizePricing: typeof row.size_pricing === 'string' ? JSON.parse(row.size_pricing) : row.size_pricing,
      hideSizes: Boolean(row.hide_sizes),
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      is_active: Boolean(row.is_active),
      is_featured: Boolean(row.is_featured),
      stock_quantity: row.stock_quantity,
      createdAt: row.createdAt,
      updated_at: row.updated_at,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        description: row.category_description,
        imageUrl: row.category_imageUrl
      } : null
    }));
  }

  async getProduct(id: string): Promise<ProductWithCategory | undefined> {
    const query = `
      SELECT p.*, c.id as category_id, c.name as category_name, c.slug as category_slug, 
             c.description as category_description, c.image_url as category_imageUrl
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?
    `;
    
    const [rows] = await this.pool.execute(query, [id]);
    
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    
    const row = rows[0] as any;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      categoryId: row.category_id,
      subcategoryId: row.subcategory_id,
      material: row.material,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
      sizePricing: typeof row.size_pricing === 'string' ? JSON.parse(row.size_pricing) : row.size_pricing,
      hideSizes: Boolean(row.hide_sizes),
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      is_active: Boolean(row.is_active),
      is_featured: Boolean(row.is_featured),
      stock_quantity: row.stock_quantity,
      createdAt: row.createdAt,
      updated_at: row.updated_at,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        description: row.category_description,
        imageUrl: row.category_imageUrl
      } : null
    };
  }

  async getProductBySlug(slug: string): Promise<ProductWithCategory | undefined> {
    const query = `
      SELECT p.*, c.id as category_id, c.name as category_name, c.slug as category_slug, 
             c.description as category_description, c.image_url as category_imageUrl
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.slug = ?
    `;
    
    const [rows] = await this.pool.execute(query, [slug]);
    
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    
    const row = rows[0] as any;
    return {
      id: row.id,
      name: row.name,
      slug: row.slug,
      description: row.description,
      price: row.price,
      categoryId: row.category_id,
      subcategoryId: row.subcategory_id,
      material: row.material,
      sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
      sizePricing: typeof row.size_pricing === 'string' ? JSON.parse(row.size_pricing) : row.size_pricing,
      hideSizes: Boolean(row.hide_sizes),
      images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
      is_active: Boolean(row.is_active),
      is_featured: Boolean(row.is_featured),
      stock_quantity: row.stock_quantity,
      createdAt: row.createdAt,
      updated_at: row.updated_at,
      category: row.category_id ? {
        id: row.category_id,
        name: row.category_name,
        slug: row.category_slug,
        description: row.category_description,
        imageUrl: row.category_imageUrl
      } : null
    };
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const id = randomUUID();
    const productData = {
      ...product,
      id,
      sizes: Array.isArray(product.sizes) ? JSON.stringify(product.sizes) : (product.sizes || null),
      sizePricing: product.sizePricing ? JSON.stringify(product.sizePricing) : null,
      images: Array.isArray(product.images) ? JSON.stringify(product.images) : (product.images || null),
    };

    await this.pool.execute(
      'INSERT INTO products (id, name, slug, description, price, category_id, subcategory_id, material, sizes, size_pricing, hide_sizes, images, stock_quantity, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id, 
        productData.name || null, 
        productData.slug || null, 
        productData.description || null, 
        productData.price || null, 
        productData.categoryId || null, 
        productData.subcategoryId || null, 
        productData.material || null, 
        productData.sizes || null, 
        productData.sizePricing || null, 
        productData.hideSizes ?? false, 
        productData.images || null, 
        productData.stock_quantity || 0, 
        productData.is_active ?? true, 
        productData.is_featured ?? false
      ]
    );

    const newProduct = await this.getProduct(id);
    if (!newProduct) throw new Error("Failed to create product");
    return newProduct;
  }

  async updateProduct(id: string, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const updated_data: any = {
      ...updates,
      updated_at: new Date(),
    };

    if (updates.sizes) {
      updated_data.sizes = Array.isArray(updates.sizes) ? JSON.stringify(updates.sizes) : updates.sizes;
    }
    if (updates.sizePricing) {
      updated_data.size_pricing = typeof updates.sizePricing === 'object' ? JSON.stringify(updates.sizePricing) : updates.sizePricing;
    }
    if (updates.hideSizes !== undefined) {
      updated_data.hide_sizes = Boolean(updates.hideSizes);
    }
    if (updates.images) {
      updated_data.images = Array.isArray(updates.images) ? JSON.stringify(updates.images) : updates.images;
    }

    // Map camelCase to snake_case for database columns
    const columnMapping: Record<string, string> = {
      categoryId: 'category_id',
      subcategoryId: 'subcategory_id',
      sizePricing: 'size_pricing',
      hideSizes: 'hide_sizes',
      stockQuantity: 'stock_quantity',
      stock_quantity: 'stock_quantity',
      isActive: 'is_active',
      is_active: 'is_active',
      isFeatured: 'is_featured',
      is_featured: 'is_featured',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      updated_at: 'updated_at'
    };

    // Build the SET clause
    const setClause = Object.keys(updated_data)
      .filter(key => updated_data[key] !== undefined)
      .map(key => `${columnMapping[key] || key} = ?`)
      .join(', ');

    const values = Object.keys(updated_data)
      .filter(key => updated_data[key] !== undefined)
      .map(key => updated_data[key]);

    if (values.length === 0) {
      return this.getProduct(id);
    }

    values.push(id);

    await this.pool.execute(
      `UPDATE products SET ${setClause} WHERE id = ?`,
      values
    );

    return this.getProduct(id);
  }

  async deleteProduct(id: string): Promise<boolean> {
    try {
      console.log(`Starting deletion of product: ${id}`);
      
      // Delete related records
      await this.pool.execute('DELETE FROM cart_items WHERE product_id = ?', [id]);
      await this.pool.execute('DELETE FROM wishlist_items WHERE product_id = ?', [id]);
      await this.pool.execute('DELETE FROM collection_products WHERE product_id = ?', [id]);
      await this.pool.execute('DELETE FROM order_items WHERE product_id = ?', [id]);
      
      // Delete the product
      const [result] = await this.pool.execute('DELETE FROM products WHERE id = ?', [id]);
      const resultObj = result as any;
      
      console.log(`Product deletion result: ${resultObj.affectedRows} rows affected`);
      return resultObj.affectedRows > 0;
    } catch (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
  }

  // Collection operations
  async getCollections(): Promise<Collection[]> {
    const [rows] = await this.pool.execute('SELECT * FROM collections ORDER BY year DESC, name');
    return Array.isArray(rows) ? rows as Collection[] : [];
  }

  async getCollection(id: string): Promise<Collection | undefined> {
    const [rows] = await this.pool.execute('SELECT * FROM collections WHERE id = ?', [id]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as Collection : undefined;
  }

  async getCollectionBySlug(slug: string): Promise<Collection | undefined> {
    const [rows] = await this.pool.execute('SELECT * FROM collections WHERE slug = ?', [slug]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as Collection : undefined;
  }

  async createCollection(collection: InsertCollection): Promise<Collection> {
    const id = randomUUID();
    await this.pool.execute(
      'INSERT INTO collections (id, name, slug, description, image_url, season, year) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, collection.name, collection.slug, collection.description, collection.imageUrl, collection.season, collection.year]
    );

    const newCollection = await this.getCollection(id);
    if (!newCollection) throw new Error("Failed to create collection");
    return newCollection;
  }

  // Cart operations
  async getCartItems(sessionId?: string, userId?: string): Promise<CartItemWithProduct[]> {
    let query = `
      SELECT ci.*, p.* 
      FROM cart_items ci
      LEFT JOIN products p ON ci.product_id = p.id
      WHERE `;
    
    const params: any[] = [];
    
    if (userId) {
      query += 'ci.user_id = ?';
      params.push(userId);
    } else if (sessionId) {
      query += 'ci.session_id = ?';
      params.push(sessionId);
    } else {
      return [];
    }

    const [rows] = await this.pool.execute(query, params);
    
    if (!Array.isArray(rows)) return [];
    
    return rows.map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      sessionId: row.session_id,
      productId: row.product_id,
      size: row.size,
      color: row.color,
      quantity: row.quantity,
      createdAt: row.created_at,
      updated_at: row.updated_at,
      product: {
        id: row.product_id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        price: row.price,
        categoryId: row.category_id,
        subcategoryId: row.subcategory_id,
        material: row.material,
        sizes: typeof row.sizes === 'string' ? JSON.parse(row.sizes) : row.sizes,
        sizePricing: typeof row.size_pricing === 'string' ? JSON.parse(row.size_pricing) : row.size_pricing,
        hideSizes: Boolean(row.hide_sizes),
        images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images,
        is_active: Boolean(row.is_active),
        is_featured: Boolean(row.is_featured),
        stock_quantity: row.stock_quantity,
        createdAt: row.created_at,
        updated_at: row.updated_at,
      }
    }));
  }

  async addToCart(cartItem: InsertCartItem): Promise<CartItem> {
    const id = randomUUID();
    await this.pool.execute(
      'INSERT INTO cart_items (id, user_id, session_id, product_id, size, color, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, cartItem.userId, cartItem.sessionId, cartItem.productId, cartItem.size, cartItem.color, cartItem.quantity]
    );

    const [rows] = await this.pool.execute('SELECT * FROM cart_items WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("Failed to add to cart");
    
    return rows[0] as CartItem;
  }

  async updateCartItem(id: string, updates: Partial<CartItem>): Promise<CartItem | undefined> {
    const updated_ata: any = {
      ...updates,
      updated_at: new Date(),
    };

    // Build the SET clause
    const setClause = Object.keys(updated_ata)
      .filter(key => updated_ata[key] !== undefined)
      .map(key => `${key} = ?`)
      .join(', ');

    const values = Object.keys(updated_ata)
      .filter(key => updated_ata[key] !== undefined)
      .map(key => updated_ata[key]);

    if (values.length === 0) {
      const [rows] = await this.pool.execute('SELECT * FROM cart_items WHERE id = ?', [id]);
      return Array.isArray(rows) && rows.length > 0 ? rows[0] as CartItem : undefined;
    }

    values.push(id);

    await this.pool.execute(
      `UPDATE cart_items SET ${setClause} WHERE id = ?`,
      values
    );

    const [rows] = await this.pool.execute('SELECT * FROM cart_items WHERE id = ?', [id]);
    return Array.isArray(rows) && rows.length > 0 ? rows[0] as CartItem : undefined;
  }

  async removeFromCart(id: string): Promise<void> {
    await this.pool.execute('DELETE FROM cart_items WHERE id = ?', [id]);
  }

  async clearCart(sessionId?: string, userId?: string): Promise<void> {
    if (userId) {
      await this.pool.execute('DELETE FROM cart_items WHERE user_id = ?', [userId]);
    } else if (sessionId) {
      await this.pool.execute('DELETE FROM cart_items WHERE session_id = ?', [sessionId]);
    }
  }

  // Order operations
  async getOrders(): Promise<OrderWithItems[]> {
    const [ordersData] = await this.pool.execute('SELECT * FROM orders ORDER BY created_at DESC');
    
    if (!Array.isArray(ordersData)) return [];
    
    const result: OrderWithItems[] = [];
    
    for (const order of ordersData as any[]) {
      const [orderItemsData] = await this.pool.execute(`
        SELECT oi.*, p.* 
        FROM order_items oi
        LEFT JOIN products p ON oi.product_id = p.id
        WHERE oi.order_id = ?
      `, [order.id]);
      
      const user = order.user_id ? (await this.getUser(order.user_id)) ?? null : null;

      result.push({
        id: order.id,
        userId: order.user_id,
        orderNumber: order.order_number,
        status: order.status,
        totalAmount: order.total_amount,
        customerEmail: order.customer_email,
        deliveryAddress: typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address,
        phoneNumber: order.phone_number,
        paymentStatus: order.payment_status,
        notes: order.notes,
        createdAt: order.created_at,
        updated_at: order.updated_at,
        user,
        items: Array.isArray(orderItemsData) ? orderItemsData.map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          size: item.size,
          color: item.color,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          totalPrice: item.total_price,
          createdAt: item.created_at,
          product: {
            id: item.product_id,
            name: item.name,
            slug: item.slug,
            description: item.description,
            price: item.price,
            categoryId: item.category_id,
            material: item.material,
            sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes,
            colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors,
            images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
            is_active: Boolean(item.is_active),
            is_featured: Boolean(item.is_featured),
            stock_quantity: item.stock_quantity,
            createdAt: item.created_at,
            updated_at: item.updated_at,
          }
        })) : [],
      });
    }

    return result;
  }

  async getOrder(id: string): Promise<OrderWithItems | undefined> {
    const [orders] = await this.pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (!Array.isArray(orders) || orders.length === 0) return undefined;
    
    const order = orders[0] as any;
    
    const [orderItemsData] = await this.pool.execute(`
      SELECT oi.*, p.* 
      FROM order_items oi
      LEFT JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ?
    `, [id]);
    
    const user = order.userId ? (await this.getUser(order.userId)) ?? null : null;

    return {
      ...order,
      customerEmail: order.customer_email,
      deliveryAddress: typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : order.deliveryAddress,
      user,
      items: Array.isArray(orderItemsData) ? orderItemsData.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_id,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        totalPrice: item.total_price,
        createdAt: item.created_at,
        product: {
          id: item.product_id,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          categoryId: item.category_id,
          material: item.material,
          sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes,
          colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors,
          images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
          is_active: Boolean(item.is_active),
          is_featured: Boolean(item.is_featured),
          stock_quantity: item.stock_quantity,
          createdAt: item.p_createdAt,
          updated_at: item.p_updated_at,
        }
      })) : [],
    };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = randomUUID();
    // Ensure we pass null (not undefined) for optional fields to satisfy mysql2 bind rules
    const orderNumberVal = insertOrder.orderNumber ?? null;
    const statusVal = insertOrder.status ?? 'pending';
  const totalAmountVal = insertOrder.totalAmount ?? null;
  const customerEmailVal = insertOrder.customerEmail ?? null;
    const deliveryAddressVal = insertOrder.deliveryAddress ? JSON.stringify(insertOrder.deliveryAddress) : null;
    const phoneNumberVal = insertOrder.phoneNumber ?? null;
    const paymentStatusVal = insertOrder.paymentStatus ?? null;
    const notesVal = insertOrder.notes ?? null;
    const userIdVal = insertOrder.userId ?? null;

    const insertValues = [
      id,
      orderNumberVal,
      statusVal,
      totalAmountVal,
      customerEmailVal,
      deliveryAddressVal,
      phoneNumberVal,
      paymentStatusVal,
      notesVal,
      userIdVal,
    ];

    console.log('DB createOrder - inserting values:', insertValues.map(v => (v === null ? 'NULL' : v)));

    await this.pool.execute(
      'INSERT INTO orders (id, order_number, status, total_amount, customer_email, delivery_address, phone_number, payment_status, notes, user_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      insertValues
    );

    const [rows] = await this.pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("Failed to create order");
    
    const row = rows[0] as any;
    const order: Order = {
      id: row.id,
      userId: row.user_id,
      orderNumber: row.order_number,
      status: row.status,
      totalAmount: row.total_amount,
      customerEmail: row.customer_email,
      deliveryAddress: typeof row.delivery_address === 'string' ? JSON.parse(row.delivery_address) : row.delivery_address,
      phoneNumber: row.phone_number,
      paymentStatus: row.payment_status,
      notes: row.notes,
      createdAt: row.created_at,
      updated_at: row.updated_at,
    };
    
    return order;
  }

  async updateOrderStatus(id: string, status: string): Promise<Order | undefined> {
    await this.pool.execute(
      'UPDATE orders SET status = ?, updated_at = ? WHERE id = ?',
      [status, new Date(), id]
    );

    const [rows] = await this.pool.execute('SELECT * FROM orders WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    
    const order = rows[0] as any;
    order.deliveryAddress = typeof order.deliveryAddress === 'string' ? JSON.parse(order.deliveryAddress) : order.deliveryAddress;
    
    return order;
  }

  async deleteOrder(id: string): Promise<void> {
    // Delete order items first (foreign key constraint)
    await this.pool.execute('DELETE FROM order_items WHERE order_id = ?', [id]);
    
    // Delete the order
    await this.pool.execute('DELETE FROM orders WHERE id = ?', [id]);
  }

  // Wishlist operations
  async getWishlistItems(userId: string): Promise<WishlistItemWithProduct[]> {
    if (!userId) {
      return [];
    }

    const [wishlistData] = await this.pool.execute(`
      SELECT wi.*, p.* 
      FROM wishlist_items wi
      LEFT JOIN products p ON wi.product_id = p.id
      WHERE wi.user_id = ?
    `, [userId]);
    
    if (!Array.isArray(wishlistData)) return [];
    
    return wishlistData
      .filter((item: any) => item.productId)
      .map((item: any) => ({
        id: item.id,
        userId: item.userId,
        productId: item.productId,
        createdAt: item.createdAt,
        product: {
          id: item.productId,
          name: item.name,
          slug: item.slug,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          material: item.material,
          sizes: typeof item.sizes === 'string' ? JSON.parse(item.sizes) : item.sizes,
          colors: typeof item.colors === 'string' ? JSON.parse(item.colors) : item.colors,
          images: typeof item.images === 'string' ? JSON.parse(item.images) : item.images,
          is_active: Boolean(item.is_active),
          is_featured: Boolean(item.is_featured),
          stock_quantity: item.stock_quantity,
          createdAt: item.p_createdAt,
          updated_at: item.p_updated_at,
        }
      }));
  }

  async addToWishlist(insertWishlistItem: InsertWishlistItem): Promise<WishlistItem> {
    if (!insertWishlistItem.userId || !insertWishlistItem.productId) {
      throw new Error('User ID and Product ID are required');
    }

    // Check if item already exists for this user
    const [existing] = await this.pool.execute(
      'SELECT * FROM wishlist_items WHERE product_id = ? AND user_id = ?',
      [insertWishlistItem.productId, insertWishlistItem.userId]
    );
    
    if (Array.isArray(existing) && existing.length > 0) {
      return existing[0] as WishlistItem;
    }

    const id = randomUUID();
    await this.pool.execute(
      'INSERT INTO wishlist_items (id, product_id, user_id) VALUES (?, ?, ?)',
      [id, insertWishlistItem.productId, insertWishlistItem.userId]
    );

    const [rows] = await this.pool.execute('SELECT * FROM wishlist_items WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("Failed to add to wishlist");
    
    return rows[0] as WishlistItem;
  }

  async removeFromWishlist(productId: string, userId: string): Promise<void> {
    if (!userId || !productId) {
      throw new Error('User ID and Product ID are required');
    }

    await this.pool.execute(
      'DELETE FROM wishlist_items WHERE product_id = ? AND userId = ?',
      [productId, userId]
    );
  }

  async getUserProfile(userId: string): Promise<UserProfile | undefined> {
    const [rows] = await this.pool.execute('SELECT * FROM user_profiles WHERE user_id = ?', [userId]);
    if (!Array.isArray(rows) || rows.length === 0) return undefined;
    
    const row = rows[0] as any;
    return {
      id: row.id,
      userId: row.user_id,
      fullName: row.full_name,
      phoneNumber: row.phone_number,
      addressLine1: row.address_line_1,
      addressLine2: row.address_line_2,
      city: row.city,
      postalCode: row.postal_code,
      createdAt: row.created_at,
      updated_at: row.updated_at
    } as UserProfile;
  }

  async createOrUpdateUserProfile(profile: InsertUserProfile): Promise<UserProfile> {
    const existingProfile = await this.getUserProfile(profile.userId);
    
    if (existingProfile) {
      await this.pool.execute(
        'UPDATE user_profiles SET full_name = ?, phone_number = ?, address_line_1 = ?, address_line_2 = ?, city = ?, postal_code = ?, updated_at = ? WHERE user_id = ?',
        [
          profile.fullName || null, 
          profile.phoneNumber || null, 
          profile.addressLine1 || null, 
          profile.addressLine2 || null, 
          profile.city || null, 
          profile.postalCode || null, 
          new Date(), 
          profile.userId
        ]
      );
    } else {
      await this.pool.execute(
        'INSERT INTO user_profiles (id, user_id, full_name, phone_number, address_line_1, address_line_2, city, postal_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [
          randomUUID(), 
          profile.userId, 
          profile.fullName || null, 
          profile.phoneNumber || null, 
          profile.addressLine1 || null, 
          profile.addressLine2 || null, 
          profile.city || null, 
          profile.postalCode || null
        ]
      );
    }

    const updatedProfile = await this.getUserProfile(profile.userId);
    if (!updatedProfile) throw new Error("Failed to create/update user profile");
    
    return updatedProfile;
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const id = randomUUID();
    await this.pool.execute(
      'INSERT INTO order_items (id, order_id, product_id, size, color, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [id, insertOrderItem.orderId, insertOrderItem.productId, insertOrderItem.size, insertOrderItem.color, insertOrderItem.quantity, insertOrderItem.unitPrice, insertOrderItem.totalPrice]
    );

    const [rows] = await this.pool.execute('SELECT * FROM order_items WHERE id = ?', [id]);
    if (!Array.isArray(rows) || rows.length === 0) throw new Error("Failed to create order item");
    
    return rows[0] as OrderItem;
  }
}