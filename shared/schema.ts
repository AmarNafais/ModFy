import { sql } from "drizzle-orm";
import { mysqlTable, varchar, text, int, decimal, boolean, datetime, json } from "drizzle-orm/mysql-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = mysqlTable("users", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  email: text("email").notNull(),
  password: text("password").notNull(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  role: text("role").default("customer"),
  isEmailVerified: boolean("is_email_verified").default(false),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const categories = mysqlTable("categories", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  parentId: varchar("parent_id", { length: 255 }),
  sortOrder: int("sort_order").default(0),
  is_active: boolean("is_active").default(true),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});



export const products = mysqlTable("products", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(), // Base price (for display/sorting)
  categoryId: varchar("category_id", { length: 255 }),
  subcategoryId: varchar("subcategory_id", { length: 255 }),
  material: text("material"),
  sizes: json("sizes"), // Array of size names
  sizePricing: json("size_pricing"), // Object: { "S": "45.00", "M": "48.00", "L": "52.00" }
  hideSizes: boolean("hide_sizes").default(false), // Hide sizes and show "Free Size"
  sizeChartId: varchar("size_chart_id", { length: 255 }),
  images: json("images"),
  is_active: boolean("is_active").default(true),
  is_featured: boolean("is_featured").default(false),
  stock_quantity: int("stock_quantity").default(0),
  piecesPerPack: int("pieces_per_pack").default(1), // Number of pieces in the pack
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const cartItems = mysqlTable("cart_items", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  sessionId: text("session_id"),
  userId: varchar("user_id", { length: 255 }),
  productId: varchar("product_id", { length: 255 }),
  size: text("size"),
  color: text("color"),
  quantity: int("quantity").notNull().default(1),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const orders = mysqlTable("orders", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }),
  orderNumber: text("order_number").notNull(),
  status: text("status").notNull().default("pending"),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  customerEmail: text("customer_email"),
  deliveryAddress: json("delivery_address").notNull(),
  phoneNumber: text("phone_number").notNull(),
  paymentStatus: text("payment_status").default("pending"),
  notes: text("notes"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const orderItems = mysqlTable("order_items", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  orderId: varchar("order_id", { length: 255 }),
  productId: varchar("product_id", { length: 255 }),
  size: text("size"),
  color: text("color"),
  quantity: int("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const wishlistItems = mysqlTable("wishlist_items", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  productId: varchar("product_id", { length: 255 }).notNull(),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
});

export const userProfiles = mysqlTable("user_profiles", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  userId: varchar("user_id", { length: 255 }).notNull(),
  fullName: text("full_name"),
  phoneNumber: text("phone_number"),
  addressLine1: text("address_line_1"),
  addressLine2: text("address_line_2"),
  city: text("city"),
  postalCode: text("postal_code"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const sizeCharts = mysqlTable("size_charts", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  description: text("description"),
  chartData: json("chart_data").notNull(), // 2D array: [["Size", "Age"], ["S", "5 to 6"], ...]
  is_active: boolean("is_active").default(true),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const reviews = mysqlTable("reviews", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  productId: varchar("product_id", { length: 255 }).notNull(),
  userId: varchar("user_id", { length: 255 }),
  sessionId: text("session_id"),
  rating: int("rating").notNull(),
  title: text("title"),
  comment: text("comment"),
  isVerifiedPurchase: boolean("is_verified_purchase").default(false),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const contactMessages = mysqlTable("contact_messages", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  subject: text("subject").notNull(),
  message: text("message").notNull(),
  status: text("status").default("unread"), // unread, read, replied
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

export const contactSettings = mysqlTable("contact_settings", {
  id: varchar("id", { length: 255 }).primaryKey().default(sql`(UUID())`),
  name: text("name").notNull(),
  value: text("value"),
  createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`),
  updated_at: datetime("updated_at").default(sql`CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP`),
});

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

// Auth schemas
export const signupSchema = insertUserSchema.omit({ isEmailVerified: true }).extend({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});



export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

export const insertCartItemSchema = createInsertSchema(cartItems).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

export const insertWishlistItemSchema = createInsertSchema(wishlistItems).omit({
  id: true,
  createdAt: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
  createdAt: true,
});

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

export const insertSizeChartSchema = createInsertSchema(sizeCharts).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

export const insertContactMessageSchema = createInsertSchema(contactMessages).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

export const insertContactSettingsSchema = createInsertSchema(contactSettings).omit({
  id: true,
  createdAt: true,
  updated_at: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type SignupData = z.infer<typeof signupSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;



export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type CartItem = typeof cartItems.$inferSelect;
export type InsertCartItem = z.infer<typeof insertCartItemSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type WishlistItem = typeof wishlistItems.$inferSelect;
export type InsertWishlistItem = z.infer<typeof insertWishlistItemSchema>;

export type ProductWithCategory = Product & {
  category: Category | null;
  subcategory: Category | null;
};

export type CartItemWithProduct = CartItem & {
  product: Product;
};

export type WishlistItemWithProduct = WishlistItem & {
  product: Product;
};

export type OrderWithItems = Order & {
  user: User | null;
  items: (OrderItem & { product: Product })[];
};

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type SizeChart = typeof sizeCharts.$inferSelect;
export type InsertSizeChart = z.infer<typeof insertSizeChartSchema>;

export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;

export type ContactMessage = typeof contactMessages.$inferSelect;
export type InsertContactMessage = z.infer<typeof insertContactMessageSchema>;

export type ContactSettings = typeof contactSettings.$inferSelect;
export type InsertContactSettings = z.infer<typeof insertContactSettingsSchema>;

export type ReviewWithUser = Review & {
  user: Pick<User, 'id' | 'firstName' | 'lastName'>;
};
