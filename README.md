# 🛍️ ModFy - Premium Innerwear E-Commerce Platform

> A modern, full-stack e-commerce platform for premium innerwear and apparel for men, women, boys, and girls. Built with elegant design, seamless shopping experience, and robust backend infrastructure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## ✨ Features

### 🛍️ Customer Features
- 🛒 **Shopping Cart** - Add, update, and remove items with real-time updates
- 💳 **Checkout System** - Streamlined checkout process with order management
- 👤 **User Authentication** - Secure session-based authentication with bcrypt password hashing
- 📱 **Responsive Design** - Mobile-first approach with beautiful UI
- 🔍 **Product Catalog** - Browse by categories and subcategories (Men, Women, Boys, Girls, Unisex)
- 🎨 **View Modes** - Toggle between grid and list view in shop page
- ❤️ **Wishlist** - Save favorite items for later shopping
- ⭐ **Product Reviews** - Rate and review products (verified purchase badges)
- 📦 **Order Tracking** - View order history and status
- 👤 **User Profiles** - Manage personal information and delivery addresses
- 📐 **Size Charts** - Interactive size guides for accurate fitting
- 📞 **Contact Form** - Easy customer support communication via contact page
- 🔎 **Smart Search & Filters** - Search products with category and sorting filters

### 👔 Admin Features
- 📊 **Modern Dashboard** - Comprehensive analytics and statistics
  - Total revenue, orders, and customer metrics
  - Recent orders overview with status tracking
  - Quick stats for pending orders and low stock alerts
  - Sales and performance insights with charts
- 📦 **Product Management** - Full CRUD operations for products
  - Bulk upload and editing capabilities
  - Image management with auto-sync from storage
  - Size and pricing variations per product (size-based pricing)
  - Stock quantity tracking
  - Free size option with hide sizes toggle
  - Multi-pack support (pieces per pack)
- 🗂️ **Category Management** - Organize products with categories and subcategories
  - Hierarchical category structure (parent-child relationships)
  - Category slugs for SEO-friendly URLs
  - Sort order customization
- 📏 **Size Chart Management** - Create and manage size guides
  - Dynamic table-based size charts with custom headers
  - Assign size charts to products
- 🛒 **Order Management** - Process and track customer orders
  - Update order status (pending, processing, shipped, delivered)
  - View customer details and delivery information
  - Payment status tracking
  - Order items with product details
- 👥 **Customer Management** - View and manage registered users
  - User roles (customer/admin)
  - Account verification status
- 📧 **Contact Messages** - Handle customer inquiries
  - View contact form submissions
  - Track message status (unread/read/replied)
- 📈 **Analytics** - Sales and performance insights
  - Revenue tracking and order statistics
  - Customer growth metrics
- 🖼️ **Image Auto-Update** - Automatic product image synchronization from storage folder

### 🔒 Security Features
- 🔐 **Secure Authentication** - Session-based auth with secure cookies
- 🔑 **Password Hashing** - bcryptjs for secure password storage
- 🛡️ **Role-Based Access** - Customer and admin role separation
- 📧 **Email Verification** - Optional email verification system
- 🚫 **CSRF Protection** - Secure session management

## 🚀 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and TypeScript
- **TypeScript** - Type-safe development
- **Vite** - Lightning-fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives (15+ primitive components)
- **shadcn/ui** - Beautifully designed components (47 components)
- **TanStack Query** - Powerful data synchronization and caching
- **Wouter** - Minimalist routing solution (~1.5kB)
- **React Hook Form** - Performant form validation
- **Zod** - TypeScript-first schema validation
- **Lucide React** - Beautiful icon library
- **React Icons** - Popular icons (FaWhatsapp for contact)
- **Framer Motion** - Animation library
- **Recharts** - Chart library for analytics

### Backend
- **Node.js** - JavaScript runtime (v18+)
- **Express.js** - Web application framework
- **TypeScript** - Full type safety on the backend
- **MySQL** - Relational database with full ACID compliance (mysql2 driver)
- **Drizzle ORM** - Type-safe database toolkit with migrations
- **Express Session** - Secure session management with MemoryStore
- **bcryptjs** - Password hashing and encryption
- **Nodemailer** - Email notifications for orders and user actions
- **Multer** - File upload handling for product images (v2.0+)
- **Zod** - Runtime schema validation
- **Google Cloud Storage** - Optional cloud storage support

### DevOps & Deployment
- **PM2** - Production process manager
- **Nginx** - Reverse proxy and web server
- **ESBuild** - Fast JavaScript bundler
- **Drizzle Kit** - Database migrations

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8 or higher) - [Download](https://dev.mysql.com/downloads/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## 🛠️ Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/AmarNafais/ModFy.git
cd ModFy
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the `.env` file with your configuration:

```env
# Database Configuration
DB_HOST=localhost
DB_NAME=modfy
DB_PASSWORD=your_secure_password
DB_PORT=3306
DB_USER=mysql

# Application Configuration
NODE_ENV=development
PORT=3000

# Email Configuration (SMTP)
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
ADMIN_EMAIL=admin@example.com

# Server Configuration
HOST=127.0.0.1
```

> ⚠️ **Security Note:** Replace `your_secure_password` with a strong, unique password in production. Never commit real credentials to version control.

### 4. Setup MySQL Database

Login to MySQL and create the database:

```sql
CREATE DATABASE modfy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER 'mysql'@'localhost' IDENTIFIED BY 'your_secure_password';

GRANT ALL PRIVILEGES ON modfy.* TO 'mysql'@'localhost';

FLUSH PRIVILEGES;
```

### 5. Run Database Migrations

```bash
npm run db:migrate
```

### 6. Start Development Server

```bash
npm run dev
```

The application will be available at **http://localhost:5000** by default (or `PORT` if you override it).

## 🏗️ Production Build

### Build the Application

```bash
npm run build
```

This will:
- Build the React frontend to `dist/public/`
- Bundle the Express backend to `dist/index.js`

### Start Production Server

```bash
npm start
```

## 📦 Deployment

### Deploy to Linux Server

For detailed deployment instructions, see our [Deployment Guide](#linux-deployment-guide) below.

Quick deployment with PM2:

```bash
# Build the application
npm run build

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup auto-start on reboot
pm2 startup
```

## 📁 Project Structure

```
ModFy/
├── client/                      # Frontend React application
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── ui/            # shadcn/ui components (47 components)
│   │   │   │   ├── button.tsx, input.tsx, card.tsx
│   │   │   │   ├── dialog.tsx, drawer.tsx, sheet.tsx
│   │   │   │   ├── form.tsx, table.tsx, select.tsx
│   │   │   │   ├── toast.tsx, badge.tsx, avatar.tsx
│   │   │   │   └── ... (40+ more components)
│   │   │   ├── admin/         # Admin-specific components
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── AdminStats.tsx
│   │   │   │   ├── tables/    # Data table components
│   │   │   │   └── dialogs/   # Modal dialogs for CRUD
│   │   │   ├── Header.tsx      # Top navigation with cart, wishlist, user menu
│   │   │   ├── Footer.tsx      # Footer with dynamic categories & contact info
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── ReviewSection.tsx
│   │   │   ├── SizeChartDisplay.tsx
│   │   │   ├── LoginModal.tsx
│   │   │   └── ObjectUploader.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx        # Homepage with featured products
│   │   │   ├── Shop.tsx        # Product listing with grid/list view & filters
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Categories.tsx  # Browse categories page
│   │   │   ├── Wishlist.tsx
│   │   │   ├── Profile.tsx     # User profile & delivery settings
│   │   │   ├── About.tsx       # About page
│   │   │   ├── ContactUs.tsx   # Contact form page
│   │   │   ├── Auth.tsx        # Login/signup page
│   │   │   ├── not-found.tsx   # 404 page
│   │   │   └── admin/         # Admin pages
│   │   │       ├── Dashboard.tsx    # Admin dashboard
│   │   │       ├── Products.tsx     # Product management
│   │   │       ├── Categories.tsx   # Category management
│   │   │       ├── Orders.tsx       # Order management
│   │   │       ├── Users.tsx        # User management
│   │   │       ├── SizeCharts.tsx   # Size chart management
│   │   │       ├── Analytics.tsx    # Analytics & reports
│   │   │       └── ContactUs.tsx    # Contact messages
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts      # Authentication hook
│   │   │   ├── useCart.ts      # Shopping cart hook
│   │   │   ├── useWishlist.ts  # Wishlist hook
│   │   │   ├── useScrollToTop.ts  # Scroll behavior
│   │   │   ├── use-toast.ts
│   │   │   └── use-mobile.tsx
│   │   ├── lib/               # Utility functions
│   │   │   ├── adminHelpers.ts
│   │   │   ├── authUtils.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Entry point
│   └── index.html
├── server/                     # Backend Express application
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes and endpoints (50+ routes)
│   ├── db.ts                  # Database connection (MySQL with mysql2)
│   ├── dbStorage.ts           # Database storage layer with queries
│   ├── storage.ts             # In-memory storage interface
│   ├── sessionAuth.ts         # Authentication logic & middleware
│   ├── emailService.ts        # Email service (Nodemailer)
│   ├── uploadService.ts       # File upload handling (Multer)
│   ├── objectStorage.ts       # Object storage utilities
│   ├── vite.ts                # Vite dev server integration
│   └── scripts/               # Database and utility scripts
│       ├── seed.ts            # Database seeding
│       ├── update-images.ts   # Image sync script
│       ├── activate_products.py
│       ├── check_db.py
│       ├── convert_and_import_products.js
│       ├── IMAGE_UPDATE_README.md
│       └── README.md          # Scripts documentation
├── shared/                    # Shared code between client/server
│   └── schema.ts             # Database schema & Zod validation types
├── storage/                   # File storage
│   ├── logo/                 # Brand assets
│   └── uploads/              # Uploaded files
│       └── products/         # Product images organized by category
│           ├── boys/         # Boys category products
│           ├── girls/        # Girls category products
│           ├── men/          # Men's category products
│           ├── unisex/       # Unisex category products
│           └── women/        # Women's category products
├── migrations/                # Drizzle ORM migrations
│   ├── 0000_clumsy_reaper.sql
│   └── meta/
│       ├── _journal.json
│       ├── 0000_snapshot.json
│       ├── 0001_snapshot.json
│       ├── 0002_snapshot.json
│       ├── 0003_snapshot.json
│       ├── 0004_snapshot.json
│       └── 0005_snapshot.json
├── ecosystem.config.js        # PM2 process manager config
├── drizzle.config.ts         # Drizzle ORM configuration
├── vite.config.ts            # Vite build configuration
├── tailwind.config.ts        # Tailwind CSS configuration
├── tsconfig.json             # TypeScript configuration
├── package.json              # Dependencies and scripts
└── .env                      # Environment variables
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload (Vite + Express) |
| `npm run build` | Build for production (frontend + backend bundle) |
| `npm start` | Run production server |
| `npm run check` | TypeScript type checking across entire codebase |
| `npm run db:push` | Push schema changes to database (without migrations) |
| `npm run db:generate` | Generate new migration files from schema changes |
| `npm run db:migrate` | Run pending database migrations |
| `npm run db:studio` | Open Drizzle Studio (database GUI) |
| `npm run db:seed` | Seed database with initial data |
| `npm run db:mark-applied` | Mark migrations as applied |
| `npm run update-images` | Sync product images from storage to database |

## 🌐 API Routes

The backend provides 50+ RESTful API endpoints organized by feature:

### Public Routes
- **Authentication:** `/api/auth/signup`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/user`
- **Products:** `/api/products`, `/api/products/:slug`, `/api/products/:productId/reviews`
- **Categories:** `/api/categories`, `/api/categories/:slug`
- **Cart:** `/api/cart` (GET, POST, PUT, DELETE)
- **Wishlist:** `/api/wishlist` (GET, POST, DELETE)
- **Orders:** `/api/orders` (POST - create order)
- **Profile:** `/api/profile` (GET, POST - requires auth)
- **Contact:** `/api/contact` (POST), `/api/contact-settings` (GET)
- **Reviews:** `/api/products/:productId/reviews` (GET, POST, DELETE)

### Admin Routes (require admin role)
- **Dashboard:** `/api/admin/stats`, `/api/admin/analytics`
- **Users:** `/api/admin/users` (GET, POST, PATCH, DELETE)
- **Products:** `/api/admin/products` (POST, PATCH, DELETE), `/api/admin/product-types`
- **Categories:** `/api/admin/categories` (POST, PATCH, DELETE), `/api/admin/categories/reorder`
- **Orders:** `/api/admin/orders` (GET, PATCH, DELETE)
- **Size Charts:** `/api/admin/size-charts` (GET, POST, PATCH, DELETE)
- **Contact Messages:** `/api/admin/contact-messages` (GET, DELETE)
- **Contact Settings:** `/api/admin/contact-settings` (GET, POST)
- **Image Upload:** `/api/admin/upload-product-image`, `/api/admin/upload-category-image`
- **Object Storage:** `/api/objects/upload`, `/objects/:objectPath`, `/public-objects/:filePath`

## 🌐 Linux Deployment Guide

### Complete Production Deployment on Ubuntu/Debian

#### 1. Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
```

#### 2. Setup MySQL Database

```bash
sudo mysql -u root -p
```

```sql
CREATE DATABASE modfy CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'mysql'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON modfy.* TO 'mysql'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

#### 3. Deploy Application

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/AmarNafais/ModFy.git
sudo chown -R $USER:$USER ModFy
cd ModFy

# Install dependencies
npm install

# Setup environment
cp .env.example .env
nano .env  # Edit with your configuration

# Run migrations
npm run db:migrate

# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

#### 4. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/modfy
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/modfy /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Get SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Auto-renewal is configured automatically
```

#### 6. Configure Firewall

```bash
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

## 🔐 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `DB_HOST` | MySQL host address | `localhost` | Yes |
| `DB_NAME` | Database name | `modfy` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_PORT` | Database port | `3306` | Yes |
| `DB_USER` | Database username | `mysql` | Yes |
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Application port | `3000` | Yes |
| `HOST` | Server host address | `127.0.0.1` | Yes |
| `SMTP_USER` | SMTP email for sending | - | Yes (for emails) |
| `SMTP_PASS` | SMTP app password | - | Yes (for emails) |
| `ADMIN_EMAIL` | Admin notification email | - | Yes (for emails) |

### Email Configuration

For order confirmations and notifications, configure SMTP settings:

1. **Gmail**: Use app-specific password ([Generate here](https://myaccount.google.com/apppasswords))
2. **Other providers**: Check SMTP settings with your provider

```env
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_16_char_app_password
ADMIN_EMAIL=admin@example.com
```

See [.env.example](.env.example) for a complete template.

## 🐛 Troubleshooting

### Application Won't Start

```bash
# Check PM2 logs
pm2 logs modfy-server

# Check if port is in use
sudo lsof -i :3000

# Restart application
pm2 restart modfy-server
```

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u mysql -p -h 127.0.0.1 modfy

# Check MySQL status
sudo systemctl status mysql

# Restart MySQL
sudo systemctl restart mysql
```

### 502 Bad Gateway

```bash
# Check application status
pm2 status

# Test Nginx configuration
sudo nginx -t

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

## 🔄 Updating the Application

```bash
# Navigate to project directory
cd /var/www/ModFy

# Pull latest changes
git pull origin main

# Install new dependencies
npm install

# Run migrations
npm run db:migrate

# Rebuild
npm run build

# Restart with PM2
pm2 restart modfy-server
```

## 📸 Product Image Management

### Image Organization

Product images are stored in a category-based structure:

```
storage/uploads/products/
├── boys/
│   ├── [subcategory]/
│   │   ├── [product-folder]/
│   │   │   ├── image1.jpg
│   │   │   └── image2.jpg
│   │   └── ...
│   └── ...
├── girls/
│   ├── [subcategory]/
│   │   └── [product-folder]/
│   └── ...
├── men/
│   ├── [subcategory]/
│   │   └── [product-folder]/
│   └── ...
├── unisex/
│   ├── [subcategory]/
│   │   └── [product-folder]/
│   └── ...
└── women/
    ├── [subcategory]/
    │   └── [product-folder]/
    └── ...
```

### Current Image Status

- **Total Products:** 29 (with images)
- **Total Images:** 118
- **Storage Organized:** 3-level structure (category/subcategory/product)
- **Image Formats:** JPG, PNG
- **Path Format:** `/storage/uploads/products/[category]/[subcategory]/[product-folder]/[image.jpg]`

### Updating Product Images

To sync product images from storage to the database, run:

```bash
npm run update-images
```

This command will:
1. Scan the storage/uploads directory for product folders
2. Match folder names to product names in database
3. Update product records with image paths
4. Handle multiple images per product

#### Adding New Products with Images

1. **Create the folder structure:**
   ```
   storage/uploads/products/[category]/[subcategory]/[product-folder]/
   ```

2. **Add image files:**
   Place JPG/PNG images in the product folder

3. **Create product in database:**
   Use the admin panel or run database scripts

4. **Run image sync:**
   ```bash
   npm run update-images
   ```

#### Image Path Format

All image paths follow this pattern:
```
/storage/uploads/products/[category]/[subcategory]/[product-folder]/[filename.jpg]

Examples:
/storage/uploads/products/men/underwear/classic-boxer/front.jpg
/storage/uploads/products/women/panties/cotton-briefs/image1.jpg
/storage/uploads/products/boys/underwear/junior-brief/photo.jpg
```

### Documentation

For detailed image management instructions, see:
- [IMAGES.md](IMAGES.md) - Quick reference guide
- [server/scripts/IMAGE_UPDATE_README.md](server/scripts/IMAGE_UPDATE_README.md) - Complete technical documentation
- [DOCUMENTATION.md](DOCUMENTATION.md) - Master documentation index

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Amar Nafais**

- GitHub: [@AmarNafais](https://github.com/AmarNafais)

## 👥 Contributors

- Amar Nafais — project lead & full-stack development

## � Database Schema

The application uses MySQL with the following main tables:

### Core Tables
- **users** - Customer and admin accounts with authentication
  - Email/password authentication with bcrypt hashing
  - Role-based access control (customer/admin)
  - Email verification status
  
- **products** - Product catalog with variants and pricing
  - Size-based pricing support (different prices per size)
  - Multi-image support (JSON array)
  - Stock quantity tracking
  - Free size option with hide sizes toggle
  - Pieces per pack support
  - Material, description, slug for SEO
  
- **categories** - Product categories and subcategories
  - Hierarchical structure with parent-child relationships
  - Slugs for SEO-friendly URLs
  - Sort order customization
  - Active/inactive status
  
- **cart_items** - Shopping cart (session and user-based)
  - Session ID for guest carts
  - User ID for authenticated users
  - Size and color selection
  - Quantity tracking
  
- **orders** - Customer orders and order history
  - Order number generation
  - Status tracking (pending, processing, shipped, delivered)
  - Payment status tracking
  - Delivery address (JSON)
  - Customer email and phone
  
- **order_items** - Individual items in orders
  - Product details snapshot
  - Size and color selection
  - Unit and total pricing

### Additional Tables
- **wishlist_items** - Customer wishlists
- **user_profiles** - Extended user information (delivery addresses, phone)
- **reviews** - Product reviews and ratings
  - Verified purchase badges
  - Rating (1-5 stars)
  - Title and comment
- **size_charts** - Size guide tables
  - Dynamic table data (JSON 2D array)
  - Active/inactive status
- **contact_messages** - Customer inquiries
  - Status tracking (unread/read/replied)
  - Name, email, phone, subject, message
- **contact_settings** - Contact page settings (key-value pairs)

See [shared/schema.ts](shared/schema.ts) for complete schema definition with TypeScript types.

## 🎯 Key Features in Detail

### Size-Based Pricing
Products can have different prices for different sizes:
```json
{
  "sizes": ["S", "M", "L", "XL"],
  "sizePricing": {
    "S": "45.00",
    "M": "48.00",
    "L": "52.00",
    "XL": "55.00"
  }
}
```

### Hierarchical Categories
Supports parent-child category relationships for better organization:
```
Men
  ├── Underwear
  │   ├── Briefs
  │   ├── Boxers
  │   └── Trunks
  ├── Vests
  └── Pants

Women
  ├── Panties
  └── Vests

Boys
  ├── Briefs
  ├── Vests
  └── Pants

Girls
  ├── Panties
  └── Vests
```

### Guest Checkout
Customers can checkout without creating an account:
- Session-based cart management (works for both guests and logged-in users)
- Email order confirmations
- Optional account creation after purchase
- Guest carts persist across sessions

### Admin Analytics
- Real-time sales metrics and dashboard
- Order status distribution charts
- Low stock alerts
- Revenue tracking by period
- Customer growth charts
- Recent orders overview

## 📚 Additional Documentation

For more detailed information, see:

- [QUICK_START.md](QUICK_START.md) - Quick start guide for development
- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete documentation index
- [ADMIN_REDESIGN.md](ADMIN_REDESIGN.md) - Admin dashboard architecture
- [IMAGES.md](IMAGES.md) - Image management guide
- [IMAGE_STORAGE_ORGANIZATION.md](IMAGE_STORAGE_ORGANIZATION.md) - Storage organization
- [IMAGE_UPLOAD.md](IMAGE_UPLOAD.md) - Image upload documentation
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database configuration details
- [CATEGORIES_README.md](CATEGORIES_README.md) - Category management guide
- [PRODUCT_IMPORT.md](PRODUCT_IMPORT.md) - Product import documentation
- [PRODUCTS_READY.md](PRODUCTS_READY.md) - Products status and readiness
- [server/scripts/README.md](server/scripts/README.md) - Available scripts reference
- [server/scripts/IMAGE_UPDATE_README.md](server/scripts/IMAGE_UPDATE_README.md) - Image update scripts

### Analysis & Reports
- [ANALYSIS_SUMMARY.md](ANALYSIS_SUMMARY.md) - Project analysis summary
- [CLEANUP_SUMMARY.md](CLEANUP_SUMMARY.md) - Codebase cleanup summary
- [IMPORT_COMPLETION_REPORT.md](IMPORT_COMPLETION_REPORT.md) - Import completion report
- [PRODUCTS_NOT_SHOWING_FIX.md](PRODUCTS_NOT_SHOWING_FIX.md) - Troubleshooting guide
- [ENV_FIX_INSTRUCTIONS.md](ENV_FIX_INSTRUCTIONS.md) - Environment setup fixes

## 🙏 Acknowledgments

- [React](https://reactjs.org/) - UI library
- [Vite](https://vitejs.dev/) - Build tool
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [shadcn/ui](https://ui.shadcn.com/) - Component library
- [Radix UI](https://www.radix-ui.com/) - Headless UI components
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Express.js](https://expressjs.com/) - Backend framework
- [TanStack Query](https://tanstack.com/query) - Data fetching
- [React Hook Form](https://react-hook-form.com/) - Form management
- [Zod](https://zod.dev/) - Schema validation

## 📧 Support

For support, email support@modfy.com or open an issue in this repository.

---

Made with ❤️ by Amar Nafais
