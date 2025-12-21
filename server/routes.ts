import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertCartItemSchema, signupSchema, loginSchema, insertUserProfileSchema, insertOrderSchema, users } from "@shared/schema";
import { sessionConfig, requireAuth, addUserToRequest } from "./sessionAuth";
import { sendWelcomeEmail, sendOrderConfirmationEmail, sendOrderStatusUpdateEmail } from "./emailService";
import pool from "./db";
import { ObjectStorageService } from "./objectStorage";
import { upload, categoryUpload, getImageUrl } from "./uploadService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Initialize session middleware
  app.use(sessionConfig);
  app.use(addUserToRequest);

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
      const { categoryId, subcategoryId, is_featured, is_active, search } = req.query;
      const filters: any = {};
      
      if (categoryId) filters.categoryId = categoryId as string;
      if (subcategoryId) filters.subcategoryId = subcategoryId as string;
      if (is_featured !== undefined) filters.is_featured = is_featured === 'true';
      if (is_active !== undefined) filters.is_active = is_active === 'true';
      if (search) filters.search = search as string;

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

  // Cart routes
  app.get("/api/cart", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;
      
      console.log('Cart GET - userId:', userId, 'sessionId:', sessionId);
      console.log('Cart GET - will query with:', userId ? `userId=${userId}` : `sessionId=${sessionId}`);
      
      // For authenticated users, pass only userId; for guests, pass only sessionId
      const cartItems = await storage.getCartItems(
        userId ? undefined : sessionId,
        userId ? userId : undefined
      );
      
      console.log('Cart GET - found items:', cartItems.length);
      cartItems.forEach((item: any) => {
        console.log('Cart item:', { id: item.id, productId: item.productId, userId: item.userId, sessionId: item.sessionId });
      });
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
      
      console.log('Cart POST - userId:', userId, 'sessionId:', sessionId);
      console.log('Cart POST - body:', req.body);
      
      const cartData = {
        ...req.body,
        userId: userId || null,
        sessionId: userId ? null : sessionId, // Use sessionId only for guests
      };
      
      console.log('Cart POST - cartData:', cartData);
      
      const validatedData = insertCartItemSchema.parse(cartData);
      console.log('Cart POST - validatedData:', validatedData);
      
      const cartItem = await storage.addToCart(validatedData);
      console.log('Cart POST - cartItem added:', cartItem);
      
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
      const userId = req.session.userId;
      const sessionId = req.sessionID;
      
      console.log('DELETE /api/cart/:id called with id:', req.params.id);
      console.log('User context - userId:', userId, 'sessionId:', sessionId);
      
      await storage.removeFromCart(req.params.id, sessionId, userId);
      console.log('Item deleted successfully, sending 204');
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
      const allUsers = await storage.getAllUsers();
      res.json(allUsers.map(user => ({ ...user, password: undefined })));
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Failed to fetch users" });
    }
  });

  app.post("/api/admin/users", requireAdmin, async (req, res) => {
    try {
      const { email, password, firstName, lastName, role, isEmailVerified } = req.body;

      // Validate required fields
      if (!email || !password || !firstName || !lastName) {
        return res.status(400).json({ message: "Email, password, first name, and last name are required" });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      // Validate password length
      if (password.length < 6) {
        return res.status(400).json({ message: "Password must be at least 6 characters" });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(409).json({ message: "User with this email already exists" });
      }

      // Hash the password
      const bcrypt = await import('bcryptjs');
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create the user
      const newUser = await storage.createUser({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        role: role || "customer",
        isEmailVerified: isEmailVerified ?? false,
      });

      // Return user without password
      res.status(201).json({ ...newUser, password: undefined });
    } catch (error) {
      console.error("Error creating user:", error);
      res.status(500).json({ message: "Failed to create user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      // Prevent deleting yourself
      if (req.session?.userId === id) {
        return res.status(400).json({ message: "You cannot delete your own account" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      await storage.deleteUser(id);
      res.json({ message: "User deleted successfully" });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ message: "Failed to delete user" });
    }
  });

  app.patch("/api/admin/users/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { firstName, lastName, role, isEmailVerified } = req.body;

      console.log('PATCH /api/admin/users/:id - Request data:', { id, firstName, lastName, role, isEmailVerified });

      // Validate required fields
      if (!firstName || !lastName) {
        return res.status(400).json({ message: "First name and last name are required" });
      }

      const user = await storage.getUser(id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      console.log('PATCH /api/admin/users/:id - User before update:', { id: user.id, firstName: user.firstName, lastName: user.lastName, role: user.role });

      const updatedUser = await storage.updateUser(id, {
        firstName,
        lastName,
        role,
        isEmailVerified,
      });

      console.log('PATCH /api/admin/users/:id - User after update:', updatedUser);

      if (!updatedUser) {
        return res.status(500).json({ message: "Failed to update user" });
      }

      res.json({ ...updatedUser, password: undefined });
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Failed to update user" });
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

      // Try sending an email to the customer notifying about the status update.
      (async () => {
        try {
          // Support both snake_case and camelCase shapes returned from storage
          const userId = (order as any).userId ?? (order as any).user_id;
          const orderNumber = (order as any).orderNumber ?? (order as any).order_number ?? id;

          // Attempt to get customer email from user record when available
          let customerEmail: string | undefined;
          let customerName: string | undefined;

          // Prefer a stored customer email on the order (guest checkout)
          customerEmail = (order as any).customerEmail ?? (order as any).customer_email;

          if (userId) {
            try {
              const user = await storage.getUser(userId);
              if (user?.email) customerEmail = user.email;
              customerName = user ? `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() : undefined;
            } catch (err) {
              console.error('Failed to fetch user for order status email:', err);
            }
          }

          // If no registered user email, try to read delivery address for possible contact info
          if (!customerEmail) {
            const rawDelivery = (order as any).deliveryAddress ?? (order as any).delivery_address;
            let delivery: any = rawDelivery;
            if (typeof rawDelivery === 'string') {
              try { delivery = JSON.parse(rawDelivery); } catch (e) { delivery = rawDelivery; }
            }
            if (delivery && typeof delivery === 'object') {
              if (delivery.email) customerEmail = delivery.email;
              if (!customerName) customerName = delivery.fullName ?? delivery.full_name;
            }
          }

          if (!customerEmail) {
            console.log(`No customer email available for order ${orderNumber}; skipping status email.`);
            return;
          }

          // Fetch full order details (including items) to include product images and details
          let orderFull: any = null;
          try {
            orderFull = await storage.getOrder(id);
          } catch (err) {
            console.error('Failed to fetch full order details for email:', err);
          }

          const items = (orderFull?.items ?? []).map((item: any) => ({
            productName: item.product?.name ?? item.productName ?? item.product_name ?? 'Product',
            quantity: item.quantity,
            price: String(item.unitPrice ?? item.unit_price ?? item.price ?? '0'),
            imageUrl: (() => {
              const firstImage = item.product?.images?.[0] ?? (item.product as any)?.imageUrl ?? null;
              return typeof firstImage === 'string' && firstImage.startsWith('http')
                ? firstImage
                : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
            })(),
          }));

          await sendOrderStatusUpdateEmail({
            to: customerEmail,
            orderNumber,
            newStatus: status,
            customerName: customerName,
            message: `Your order has been ${status}.`,
            items,
          });
        } catch (err) {
          console.error('Error sending order status update email:', err);
        }
      })();
    } catch (error) {
      console.error("Error updating order status:", error);
      res.status(500).json({ message: "Failed to update order status" });
    }
  });

  app.delete("/api/admin/orders/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      
      const order = await storage.getOrder(id);
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }

      await storage.deleteOrder(id);
      res.json({ message: "Order deleted successfully" });
    } catch (error) {
      console.error("Error deleting order:", error);
      res.status(500).json({ message: "Failed to delete order" });
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
      const { name, description, price, categoryId, subcategoryId, material, sizes, sizePricing, hideSizes, sizeChartId, images, stock_quantity, is_featured } = req.body;
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const product = await storage.createProduct({
        name,
        slug,
        description,
        price,
        categoryId,
        subcategoryId,
        material,
        sizes: Array.isArray(sizes) ? sizes : [],
        sizePricing: sizePricing || {},
        hideSizes: Boolean(hideSizes),
        sizeChartId: sizeChartId || null,
        images: Array.isArray(images) ? images : [],
        stock_quantity: parseInt(stock_quantity) || 0,
        is_featured: Boolean(is_featured),
        is_active: true,
      });
      
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Failed to create product" });
    }
  });

  // Upload product image
  app.post("/api/admin/upload-product-image", requireAdmin, upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the image URL
      const imageUrl = getImageUrl(req.file.path);
      
      res.status(200).json({ 
        success: true,
        imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Error uploading image:", error);
      res.status(500).json({ message: "Failed to upload image" });
    }
  });

  // Upload category image
  app.post("/api/admin/upload-category-image", requireAdmin, categoryUpload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the image URL
      const imageUrl = getImageUrl(req.file.path);
      
      res.status(200).json({ 
        success: true,
        imageUrl,
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Error uploading category image:", error);
      res.status(500).json({ message: "Failed to upload category image" });
    }
  });

  // Update product route
  app.patch("/api/admin/products/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, price, categoryId, subcategoryId, material, sizes, sizePricing, hideSizes, sizeChartId, images, stock_quantity, is_featured, is_active } = req.body;
      
      const updates: any = {};
      
      if (name !== undefined) {
        updates.name = name;
        updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      if (description !== undefined) updates.description = description;
      if (price !== undefined) updates.price = price;
      if (categoryId !== undefined) updates.categoryId = categoryId;
      if (subcategoryId !== undefined) updates.subcategoryId = subcategoryId;
      if (material !== undefined) updates.material = material;
      if (sizes !== undefined) updates.sizes = Array.isArray(sizes) ? sizes : [];
      if (sizePricing !== undefined) updates.sizePricing = sizePricing;
      if (hideSizes !== undefined) updates.hideSizes = Boolean(hideSizes);
      if (sizeChartId !== undefined) updates.sizeChartId = sizeChartId || null;
      if (images !== undefined) updates.images = Array.isArray(images) ? images : [];
      if (stock_quantity !== undefined) updates.stock_quantity = parseInt(stock_quantity) || 0;
      if (is_featured !== undefined) updates.is_featured = Boolean(is_featured);
      if (is_active !== undefined) updates.is_active = Boolean(is_active);
      
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
      const { name, description, imageUrl, parentId } = req.body;
      
      const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      const category = await storage.createCategory({
        name,
        slug,
        description,
        imageUrl,
        parentId: parentId || null,
        is_active: true,
      });
      
      res.status(201).json(category);
    } catch (error) {
      console.error("Error creating category:", error);
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  app.patch("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, imageUrl, parent_id, image_url } = req.body;
      
      const updates: any = {};
      
      if (name !== undefined) {
        updates.name = name;
        updates.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      }
      if (description !== undefined) updates.description = description;
      if (imageUrl !== undefined || image_url !== undefined) {
        updates.imageUrl = imageUrl || image_url;
      }
      if (parent_id !== undefined) {
        updates.parentId = parent_id === '' ? null : parent_id;
      }
      
      const category = await storage.updateCategory(id, updates);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }
      
      res.json(category);
    } catch (error) {
      console.error("Error updating category:", error);
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  app.delete("/api/admin/categories/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      console.log("Deleting category:", id);
      
      // Get all subcategories
      const allCategories = await storage.getCategories();
      const subcategories = allCategories.filter((cat: any) => cat.parent_id === id);
      console.log("Found subcategories:", subcategories.length);
      
      // Delete all products in this category and subcategories
      const categoriesToDelete = [id, ...subcategories.map((cat: any) => cat.id)];
      const allProducts = await storage.getProducts();
      const productsToDelete = allProducts.filter((product: any) => 
        categoriesToDelete.includes(product.categoryId)
      );
      console.log("Found products to delete:", productsToDelete.length);
      
      for (const product of productsToDelete) {
        console.log("Deleting product:", product.id);
        await storage.deleteProduct(product.id);
      }
      
      // Delete all subcategories
      for (const subcat of subcategories) {
        console.log("Deleting subcategory:", subcat.id);
        await storage.deleteCategory(subcat.id);
      }
      
      // Delete the category itself
      console.log("Deleting main category:", id);
      await storage.deleteCategory(id);
      console.log("Category deleted successfully");
      
      res.json({ message: "Category and related items deleted successfully" });
    } catch (error) {
      console.error("Error deleting category:", error);
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Size Charts routes
  app.get("/api/admin/size-charts", requireAdmin, async (req, res) => {
    try {
      const sizeCharts = await storage.getSizeCharts();
      res.json(sizeCharts);
    } catch (error) {
      console.error("Error fetching size charts:", error);
      res.status(500).json({ message: "Failed to fetch size charts" });
    }
  });

  app.post("/api/admin/size-charts", requireAdmin, async (req, res) => {
    try {
      const { name, description, chartData, is_active } = req.body;
      
      const sizeChart = await storage.createSizeChart({
        name,
        description,
        chartData,
        is_active: is_active ?? true,
      });
      
      res.status(201).json(sizeChart);
    } catch (error) {
      console.error("Error creating size chart:", error);
      res.status(500).json({ message: "Failed to create size chart" });
    }
  });

  app.patch("/api/admin/size-charts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, chartData, is_active } = req.body;
      
      const updates: any = {};
      if (name !== undefined) updates.name = name;
      if (description !== undefined) updates.description = description;
      if (chartData !== undefined) updates.chartData = chartData;
      if (is_active !== undefined) updates.is_active = Boolean(is_active);
      
      const sizeChart = await storage.updateSizeChart(id, updates);
      
      if (!sizeChart) {
        return res.status(404).json({ message: "Size chart not found" });
      }
      
      res.json(sizeChart);
    } catch (error) {
      console.error("Error updating size chart:", error);
      res.status(500).json({ message: "Failed to update size chart" });
    }
  });

  app.delete("/api/admin/size-charts/:id", requireAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const success = await storage.deleteSizeChart(id);
      
      if (!success) {
        return res.status(404).json({ message: "Size chart not found" });
      }
      
      res.json({ message: "Size chart deleted successfully" });
    } catch (error) {
      console.error("Error deleting size chart:", error);
      res.status(500).json({ message: "Failed to delete size chart" });
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
  app.post("/api/orders", async (req, res) => {
    try {
      // Ensure userId is typed as string | undefined (avoid null)
      const userId: string | undefined = req.session.userId ?? undefined; // Allow undefined for guest orders
      const sessionId = req.sessionID;
      
      // Get cart items to create order items (support both authenticated and guest carts)
      const cartItems = await storage.getCartItems(userId ? undefined : sessionId, userId);
      
      if (cartItems.length === 0) {
        return res.status(400).json({ error: "Cart is empty" });
      }
      
      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
      
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        orderNumber
      });
      
      // Create the order
  const order = await storage.createOrder(orderData);
  console.log('Created order:', order);
  console.log('Order properties - orderNumber:', (order as any).orderNumber ?? (order as any).order_number, 'totalAmount:', (order as any).totalAmount ?? (order as any).total_amount);
      
      // Create order items from cart items
      for (const cartItem of cartItems) {
        // Get the correct price based on size if sizePricing exists
        const product = cartItem.product as any;
        let unitPrice = product.price;
        if (cartItem.size && product.sizePricing && product.sizePricing[cartItem.size]) {
          unitPrice = product.sizePricing[cartItem.size];
        }
        
        await storage.createOrderItem({
          orderId: order.id,
          productId: cartItem.productId,
          size: cartItem.size || null,
          color: cartItem.color || null,
          quantity: cartItem.quantity,
          unitPrice: String(unitPrice),
          totalPrice: (parseFloat(String(unitPrice)) * cartItem.quantity).toFixed(2),
        });
      }
      
      // Clear the cart after successful order creation (support both authenticated and guest carts)
  await storage.clearCart(userId ? undefined : sessionId, userId);
      
      // Send order confirmation email
      try {
        // Prefer values from the validated orderData (what we intended to store)
        const delivery = orderData.deliveryAddress as any;
        const orderNumberStr = (orderData as any).orderNumber ?? (order as any).orderNumber ?? (order as any).order_number ?? '';
        const totalStr = String((orderData as any).totalAmount ?? (order as any).totalAmount ?? (order as any).total_amount ?? '0');

        await sendOrderConfirmationEmail({
          orderNumber: orderNumberStr,
          totalAmount: totalStr,
          customerName: delivery?.fullName ?? '',
          customerEmail: orderData.customerEmail ?? delivery?.email ?? undefined,
          deliveryAddress: {
            fullName: delivery?.fullName ?? '',
            phoneNumber: delivery?.phoneNumber ?? '',
            addressLine1: delivery?.addressLine1 ?? '',
            addressLine2: delivery?.addressLine2 ?? undefined,
            city: delivery?.city ?? '',
            postalCode: delivery?.postalCode ?? '',
          },
          items: cartItems.map(item => {
            const product = item.product as any;
            let unitPrice = product.price;
            if (item.size && product.sizePricing && product.sizePricing[item.size]) {
              unitPrice = product.sizePricing[item.size];
            }
            return {
              productName: item.product.name,
              quantity: item.quantity,
              size: item.size,
              price: String(unitPrice),
              imageUrl: (() => {
                const firstImage = product?.images?.[0];
                return typeof firstImage === 'string' && firstImage.startsWith('http')
                  ? firstImage
                  : 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400';
              })(),
            };
          }),
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

  // Review routes
  app.get("/api/products/:productId/reviews", async (req, res) => {
    try {
      const reviews = await storage.getProductReviews(req.params.productId);
      const rating = await storage.getProductRating(req.params.productId);
      res.json({ reviews, rating });
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post("/api/products/:productId/reviews", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;

      const reviewData = {
        productId: req.params.productId,
        userId: userId || null,
        sessionId: userId ? null : sessionId,
        rating: req.body.rating,
        title: req.body.title,
        comment: req.body.comment,
      };

      const review = await storage.createReview(reviewData);
      res.status(201).json(review);
    } catch (error: any) {
      console.error("Error creating review:", error);
      if (error.message === 'You have already reviewed this product') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  app.delete("/api/products/:productId/reviews/:reviewId", async (req, res) => {
    try {
      const userId = req.session.userId;
      const sessionId = req.sessionID;
      
      const deleted = await storage.deleteReview(req.params.reviewId, sessionId, userId);
      
      if (!deleted) {
        return res.status(403).json({ message: "You can only delete your own reviews" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting review:", error);
      res.status(500).json({ message: "Failed to delete review" });
    }
  });

  // Contact Us routes
  // Public: Submit contact form
  app.post("/api/contact", async (req, res) => {
    try {
      const { name, email, phone, subject, message } = req.body;

      if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: "Missing required fields" });
      }

      // Store contact message in memory (you can integrate with actual database)
      const contactMessage = {
        id: Math.random().toString(36).substr(2, 9),
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: "unread",
        createdAt: new Date(),
        updated_at: new Date(),
      };

      // For now, just return success - in production, save to database
      console.log("Contact message received:", contactMessage);

      res.status(201).json({ message: "Contact message submitted successfully" });
    } catch (error) {
      console.error("Error submitting contact form:", error);
      res.status(500).json({ message: "Failed to submit contact form" });
    }
  });

  // Admin: Get all contact messages (mock implementation)
  app.get("/api/admin/contact-messages", requireAdmin, async (req, res) => {
    try {
      // Mock data for now
      res.json([
        {
          id: "1",
          name: "John Doe",
          email: "john@example.com",
          phone: "555-1234",
          subject: "Product Inquiry",
          message: "I have a question about your products",
          status: "unread",
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Error fetching contact messages:", error);
      res.status(500).json({ message: "Failed to fetch contact messages" });
    }
  });

  // Admin: Delete contact message
  app.delete("/api/admin/contact-messages/:id", requireAdmin, async (req, res) => {
    try {
      // Mock implementation
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting contact message:", error);
      res.status(500).json({ message: "Failed to delete contact message" });
    }
  });

  // Admin: Get contact settings
  app.get("/api/admin/contact-settings", requireAdmin, async (req, res) => {
    try {
      // Return default settings
      res.json({
        id: "default",
        email: "support@modfy.com",
        phone: "+1 (555) 123-4567",
        address: "123 Fashion Street, New York, NY 10001",
        businessHours: "Monday - Friday, 9am - 6pm EST",
        instagramUrl: "https://www.instagram.com/modfyofficial",
        facebookUrl: "https://www.facebook.com/share/1BPUVhhXYR/",
        tiktokUrl: "https://www.tiktok.com/@modfy.official",
        whatsappUrl: "https://wa.me/94777466766",
      });
    } catch (error) {
      console.error("Error fetching contact settings:", error);
      res.status(500).json({ message: "Failed to fetch contact settings" });
    }
  });

  // Admin: Update contact settings
  app.post("/api/admin/contact-settings", requireAdmin, async (req, res) => {
    try {
      const { email, phone, address, businessHours } = req.body;

      // Mock implementation - in production, save to database
      console.log("Contact settings updated:", { email, phone, address, businessHours });

      res.json({ message: "Contact settings updated successfully" });
    } catch (error) {
      console.error("Error updating contact settings:", error);
      res.status(500).json({ message: "Failed to update contact settings" });
    }
  });

  // Public: Get contact settings (no auth required)
  app.get("/api/contact-settings", async (req, res) => {
    try {
      // Return public contact settings
      res.json({
        id: "default",
        email: "support@modfy.com",
        phone: "+1 (555) 123-4567",
        address: "123 Fashion Street, New York, NY 10001",
        businessHours: "Monday - Friday, 9am - 6pm EST",
        instagramUrl: "https://www.instagram.com/modfyofficial",
        facebookUrl: "https://www.facebook.com/share/1BPUVhhXYR/",
        tiktokUrl: "https://www.tiktok.com/@modfy.official",
        whatsappUrl: "https://wa.me/94777466766",
      });
    } catch (error) {
      console.error("Error fetching contact settings:", error);
      res.status(500).json({ message: "Failed to fetch contact settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
