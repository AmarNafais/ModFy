import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

async function seed() {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'mysql',
    password: process.env.DB_PASSWORD || 'Complex123',
    database: process.env.DB_NAME || 'modfy',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

  let connection;
  try {
    connection = await pool.getConnection();
    
    // Check if data already exists
    const [existingUsers] = await connection.execute('SELECT id FROM users LIMIT 1');
    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      console.log('Database already has data. Skipping seed...');
      console.log('To re-seed, first clear the database tables.');
      return;
    }

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
    console.log('✓ Created admin user');

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
    console.log(`✓ Created ${categoryData.length} categories`);

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
    console.log(`✓ Created ${collectionData.length} collections`);

    // Seed products
    const productData = [
      ["prod-1", "Signature Boxer Brief", "signature-boxer-brief", "Our signature boxer brief with premium comfort and support. Made with the finest materials for all-day comfort.", "48.00", "cat-1", "Premium Cotton", JSON.stringify(["S", "M", "L", "XL", "XXL"]), JSON.stringify(["Black", "White", "Navy", "Gray"]), JSON.stringify(["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"]), 120, true, true],
      ["prod-2", "Essential Brief", "essential-brief", "Classic brief design with modern comfort technology. Perfect for everyday wear.", "42.00", "cat-2", "Organic Cotton", JSON.stringify(["S", "M", "L", "XL"]), JSON.stringify(["Black", "White", "Navy"]), JSON.stringify(["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=600"]), 85, true, true],
      ["prod-3", "Performance Trunk", "performance-trunk", "Athletic performance trunk with moisture-wicking technology and enhanced support.", "55.00", "cat-3", "Technical Blend", JSON.stringify(["S", "M", "L", "XL", "XXL"]), JSON.stringify(["Black", "Navy", "Gray", "White"]), JSON.stringify(["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"]), 95, true, true],
    ];

    for (const product of productData) {
      await connection.execute(
        'INSERT INTO products (id, name, slug, description, price, category_id, material, sizes, colors, images, stock_quantity, is_active, is_featured) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        product
      );
    }
    console.log(`✓ Created ${productData.length} products`);

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
    console.log(`✓ Created ${sampleOrders.length} sample orders`);

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
    console.log(`✓ Created ${sampleOrderItems.length} order items`);

    console.log('\n✓ Database seeded successfully!');
    console.log('\nSeeded data:');
    console.log('  - 1 admin user (admin@modfy.lk / Password123)');
    console.log('  - 6 categories');
    console.log('  - 2 collections');
    console.log('  - 3 products');
    console.log('  - 2 sample orders');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    await pool.end();
    process.exit(0);
  }
}

seed();
