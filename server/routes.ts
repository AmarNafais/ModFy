import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, signupSchema, loginSchema, insertUserProfileSchema, insertOrderSchema, users } from "@shared/schema";
import { sessionConfig, requireAuth, addUserToRequest } from "./sessionAuth";
import { sendWelcomeEmail, testEmailConnection, sendOrderConfirmationEmail } from "./emailService";
import { db } from "./db";
import { ObjectStorageService } from "./objectStorage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session middleware
  app.use(sessionConfig);
  app.use(addUserToRequest);
  
  // Test email connection on startup
  await testEmailConnection();

  // Auth routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const validatedData = signupSchema.parse(req.body);
      
      // Register the user
      const user = await storage.registerUser(validatedData);
      
      // Send welcome email
      const emailSent = await sendWelcomeEmail({
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
      });

      if (!emailSent) {
        console.error('Failed to send welcome email to:', user.email);
      }

      // Log the user in immediately
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role || "customer",
      } as any;

      // Return user without password
      const { password, ...userResponse } = user;
      res.status(201).json(userResponse);
    } catch (error: any) {
      console.error("Error during signup:", error);
      if (error.message === 'User with this email already exists') {
        return res.status(409).json({ message: "An account with this email already exists" });
      }
      if (error.issues) {
        // Zod validation errors
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.authenticateUser(email, password);
      if (!user) {
        return res.status(401).json({ message: "Invalid email or password" });
      }

      // Log the user in
      req.session.userId = user.id;
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName || undefined,
        lastName: user.lastName || undefined,
        role: user.role || "customer",
      } as any;

      // Return user without password
      const { password: _, ...userResponse } = user;
      res.json(userResponse);
    } catch (error: any) {
      console.error("Error during login:", error);
      if (error.issues) {
        // Zod validation errors
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/logout", (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/user", (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json(req.session.user);
  });

  // Categories routes
  app.get("/api/categories", async (_req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  app.get("/api/categories/:slug", async (req, res) => {
    try {
      const category = await storage.getCategoryBySlug(req.params.slug);
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json(category);
    } catch (error) {
      console.error("Error fetching category:", error);
      res.status(500).json({ message: "Failed to fetch category" });
    }
  });

  // Products routes
  app.get("/api/products", async (req, res) => {
    try {
      const { categoryId, isFeatured, isActive } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = categoryId as string;
      if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
      if (isActive !== undefined) filters.isActive = isActive === 'true';

      const products = await storage.getProducts(filters);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get("/api/products/:slug", async (req, res) => {
    try {
      const product = await storage.getProductBySlug(req.params.slug);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  // Collections routes
  app.get("/api/collections", async (_req, res) => {
    try {
      const collections = await storage.getCollections();
      res.json(collections);
    } catch (error) {
      console.error("Error fetching collections:", error);
      res.status(500).json({ message: "Failed to fetch collections" });
    }
  });

  app.get("/api/collections/:slug", async (req, res) => {
    try {
      const collection = await storage.getCollectionBySlug(req.params.slug);
      if (!collection) {
        return res.status(404).json({ message: "Collection not found" });
      }
      res.json(collection);
    } catch (error) {
      console.error("Error fetching collection:", error);
      res.status(500).json({ message: "Failed to fetch collection" });
    }
  });

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;
      
      console.log('Cart GET - userId:', userId, 'sessionId:', sessionId);
      
      const cartItems = await storage.getCartItems(sessionId, userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart" });
    }
  });

  app.post("/api/cart", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;
      
      const cartData = {
        ...req.body,
        userId: userId || null,
        sessionId: userId ? null : sessionId, // Use sessionId only for guests
      };
      
      const validatedData = insertCartItemSchema.parse(cartData);
      const cartItem = await storage.addToCart(validatedData);
      res.status(201).json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(400).json({ message: "Failed to add to cart" });
    }
  });

  app.put("/api/cart/:id", async (req, res) => {
    try {
      const { quantity } = req.body;
      const cartItem = await storage.updateCartItem(req.params.id, { quantity });
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      res.json(cartItem);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(400).json({ message: "Failed to update cart item" });
    }
  });

  app.delete("/api/cart/:id", async (req, res) => {
    try {
      await storage.removeFromCart(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(400).json({ message: "Failed to remove from cart" });
    }
  });

  app.delete("/api/cart/clear", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;
      
      await storage.clearCart(sessionId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(400).json({ message: "Failed to clear cart" });
    }
  });

  // Wishlist routes
  app.get("/api/wishlist", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      console.log('Wishlist GET - userId:', userId);
      
      if (!userId) {
        console.log('No userId found, returning empty array');
        return res.json([]); // Only return items if user is authenticated
      }

      const wishlistItems = await storage.getWishlistItems(userId);
      console.log('Found wishlist items:', wishlistItems.length);
      res.json(wishlistItems);
    } catch (error) {
      console.error("Error fetching wishlist:", error);
      res.status(500).json({ message: "Failed to fetch wishlist" });
    }
  });

  app.post("/api/wishlist", async (req, res) => {
    try {
      const userId = req.session.userId;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const { productId } = req.body;
      if (!productId) {
        return res.status(400).json({ message: "Product ID is required" });
      }

      const wishlistItem = await storage.addToWishlist({
        productId,
        userId: userId,
      });
      
      res.status(201).json(wishlistItem);
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      res.status(400).json({ message: "Failed to add to wishlist" });
    }
  });

  app.delete("/api/wishlist/:productId", async (req, res) => {
    try {
      const userId = req.session.userId;
      const { productId } = req.params;
      
      if (!userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      await storage.removeFromWishlist(productId, userId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      res.status(400).json({ message: "Failed to remove from wishlist" });
    }
  });

  // Admin routes
  const requireAdmin = (req: any, res: any, next: any) => {
    if (!req.session?.user || req.session.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  };

  app.get("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const allUsers = await db.select().from(users);
      res.json(allUsers.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/orders", requireAdmin, async (req, res) => {
    try {
      const orders = await storage.getOrders();
      res.json(orders);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Failed to fetch orders" });
    }
  });

  app.patch("/api/admin/orders/:id/status", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      res.json(order);
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.get("/api/admin/product-types", requireAdmin, async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching product types:", error);
      res.status(500).json({ message: "Failed to fetch product types" });
    }
  });

  app.post("/api/admin/products", requireAdmin, async (req, res) => {
    try {
      const { name, description, price, categoryId, material, sizes, colors, images, stockQuantity, isFeatured } = req.body;
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const product = await storage.createProduct({
        name,
        slug,
        description,
        price,
        categoryId,
        material,
        sizes: Array.isArray(sizes) ? sizes : [],
        colors: Array.isArray(colors) ? colors : [],
        images: Array.isArray(images) ? images : [],
        stockQuantity: parseInt(stockQuantity) || 0,
        isFeatured: Boolean(isFeatured),
        isActive: true,
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Update product route
  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, categoryId, material, sizes, colors, images, stockQuantity, isFeatured, isActive } = req.body;
      
      const updates: any = {};
      
      if (name !== undefined) {
        updates.name = name;
        updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (categoryId !== undefined) updates.categoryId = categoryId;
      if (material !== undefined) updates.material = material;
      if (sizes !== undefined) updates.sizes = Array.isArray(sizes) ? sizes : [];
      if (colors !== undefined) updates.colors = Array.isArray(colors) ? colors : [];
      if (images !== undefined) updates.images = Array.isArray(images) ? images : [];
      if (stockQuantity !== undefined) updates.stockQuantity = parseInt(stockQuantity) || 0;
      if (isFeatured !== undefined) updates.isFeatured = Boolean(isFeatured);
      if (isActive !== undefined) updates.isActive = Boolean(isActive);
      
      const product = await storage.updateProduct(id, updates);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Failed to update product" });
    }
  });

  app.post("/api/admin/categories", requireAdmin, async (req, res) => {
    try {
      const { name, description, imageUrl } = req.body;
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const category = await storage.createCategory({
        name,
        slug,
        description,
        imageUrl,
        isActive: true,
      });
      
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Object Storage routes for image uploads
  app.post("/api/objects/upload", requireAdmin, async (req, res) => {
    try {
      const objectStorageService = new ObjectStorageService();
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      console.log("Generated upload URL:", uploadURL);
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ message: "Failed to get upload URL" });
    }
  });

  // Serve public objects endpoint
  app.get("/public-objects/:filePath(*)", async (req, res) => {
    const filePath = req.params.filePath;
    const objectStorageService = new ObjectStorageService();
    try {
      const file = await objectStorageService.searchPublicObject(filePath);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      objectStorageService.downloadObject(file, res);
    } catch (error) {
      console.error("Error searching for public object:", error);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Serve uploaded objects endpoint
  app.get("/objects/:objectPath(*)", async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error serving object:", error);
      if (error instanceof Error && error.message === "Object not found") {
        return res.status(404).json({ error: "Image not found" });
      }
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  // Process uploaded image and convert to public URL
  app.post("/api/admin/process-image", requireAdmin, async (req, res) => {
    try {
      const { uploadURL } = req.body;
      
      if (!uploadURL) {
        return res.status(400).json({ error: "Upload URL is required" });
      }

      const objectStorageService = new ObjectStorageService();
      const objectPath = objectStorageService.normalizeObjectEntityPath(uploadURL);
      
      // Return the public URL for the image
      const publicURL = `/objects${objectPath}`;
      
      res.json({ imageUrl: publicURL });
    } catch (error) {
      console.error("Error processing image:", error);
      res.status(500).json({ error: "Failed to process image" });
    }
  });

  // Delete product endpoint
  app.delete("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      if (!id) {
        return res.status(400).json({ error: "Product ID is required" });
      }

      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }

      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ error: "Failed to delete product" });
    }
  });

  // Profile routes
  app.get("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const profile = await storage.getUserProfile(userId);
      res.json(profile || null);
    } catch (error) {
      console.error("Error fetching profile:", error);
      res.status(500).json({ error: "Failed to fetch profile" });
    }
  });

  app.post("/api/profile", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      const profileData = insertUserProfileSchema.parse({
        ...req.body,
        userId
      });
      
      const profile = await storage.createOrUpdateUserProfile(profileData);
      res.json(profile);
    } catch (error: any) {
      console.error("Error saving profile:", error);
      if (error.issues) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ error: "Failed to save profile" });
    }
  });

  // Orders routes
  app.post("/api/orders", requireAuth, async (req, res) => {
    try {
      const userId = req.session.userId!;
      
      // Get cart items to create order items
      const cartItems = await storage.getCartItems(undefined, userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId
      });
      
      // Create the order
      const order = await storage.createOrder(orderData);
      
      // Create order items from cart items
      for (const cartItem of cartItems) {
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          size: cartItem.size,
          color: cartItem.color,
          quantity: cartItem.quantity,
          unitPrice: cartItem.product.price,
          totalPrice: (parseFloat(cartItem.product.price) * cartItem.quantity).toFixed(2),
        });
      }
      
      // Clear the cart after successful order creation
      await storage.clearCart(undefined, userId);
      
      // Send order confirmation email
      try {
        await sendOrderConfirmationEmail({
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          customerName: orderData.deliveryAddress.fullName,
          deliveryAddress: {
            fullName: orderData.deliveryAddress.fullName,
            phoneNumber: orderData.deliveryAddress.phoneNumber,
            addressLine1: orderData.deliveryAddress.addressLine1,
            addressLine2: orderData.deliveryAddress.addressLine2 as string | undefined,
            city: orderData.deliveryAddress.city,
            postalCode: orderData.deliveryAddress.postalCode,
          },
          items: cartItems.map(item => ({
            productName: item.product.name,
            quantity: item.quantity,
            price: item.product.price,
            imageUrl: (item.product.images?.[0]?.startsWith('http') ? item.product.images[0] : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400'),
          })),
        });
      } catch (emailError) {
        console.error("Failed to send order confirmation email:", emailError);
        // Don't fail the order creation if email fails
      }
      
      res.status(201).json(order);
    } catch (error: any) {
      console.error("Error creating order:", error);
      if (error.issues) {
        return res.status(400).json({ 
          message: "Invalid input", 
          errors: error.issues.map((issue: any) => ({
            field: issue.path.join('.'),
            message: issue.message,
          }))
        });
      }
      res.status(500).json({ error: "Failed to create order" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
