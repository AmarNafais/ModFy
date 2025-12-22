# 🛍️ ModFy - Premium Men's Innerwear E-Commerce

> A modern, full-stack e-commerce platform for premium men's innerwear with elegant design, seamless shopping experience, and robust backend infrastructure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## ✨ Features

### 🛍️ Customer Features
- 🛒 **Shopping Cart** - Add, update, and remove items with real-time updates
- 💳 **Checkout System** - Streamlined checkout process with order management
- 👤 **User Authentication** - Secure session-based authentication with bcrypt password hashing
- 📱 **Responsive Design** - Mobile-first approach with beautiful UI
- 🔍 **Product Catalog** - Browse by categories, subcategories, and collections
- ❤️ **Wishlist** - Save favorite items for later shopping
- ⭐ **Product Reviews** - Rate and review products (verified purchase badges)
- 📦 **Order Tracking** - View order history and status
- 👤 **User Profiles** - Manage personal information and saved addresses
- 📐 **Size Charts** - Interactive size guides for accurate fitting
- 🎨 **Collections** - Curated product collections and featured items
- 📞 **Contact Form** - Easy customer support communication

### 👔 Admin Features
- 📊 **Modern Dashboard** - Comprehensive analytics and statistics
  - Total revenue, orders, and customer metrics
  - Recent orders overview with status tracking
  - Quick stats for pending orders and low stock alerts
- 📦 **Product Management** - Full CRUD operations for products
  - Bulk upload and editing capabilities
  - Image management with auto-sync from storage
  - Size and pricing variations per product
  - Stock quantity tracking
- 🗂️ **Category Management** - Organize products with categories and subcategories
- 📏 **Size Chart Management** - Create and manage size guides
- 🛒 **Order Management** - Process and track customer orders
  - Update order status (pending, processing, shipped, delivered)
  - View customer details and delivery information
  - Payment status tracking
- 👥 **Customer Management** - View and manage registered users
- 📧 **Contact Messages** - Handle customer inquiries
- 📈 **Analytics** - Sales and performance insights
- 🖼️ **Image Auto-Update** - Automatic product image synchronization from storage

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
- **Radix UI** - Accessible component primitives
- **shadcn/ui** - Beautifully designed components
- **TanStack Query** - Powerful data synchronization
- **Wouter** - Minimalist routing solution
- **React Hook Form** - Performant form validation
- **Zod** - TypeScript-first schema validation

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **TypeScript** - Full type safety on the backend
- **MySQL** - Relational database with full ACID compliance
- **Drizzle ORM** - Type-safe database toolkit with migrations
- **Express Session** - Secure session management with MemoryStore
- **bcryptjs** - Password hashing and encryption
- **Nodemailer** - Email notifications for orders and user actions
- **Multer** - File upload handling for product images
- **Zod** - Runtime schema validation

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
│   │   │   ├── ui/            # shadcn/ui components (30+ components)
│   │   │   ├── admin/         # Admin-specific components
│   │   │   │   ├── AdminLayout.tsx
│   │   │   │   ├── AdminStats.tsx
│   │   │   │   ├── tables/    # Data table components
│   │   │   │   └── dialogs/   # Modal dialogs for CRUD
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── ProductGrid.tsx
│   │   │   ├── CartDrawer.tsx
│   │   │   ├── ReviewSection.tsx
│   │   │   ├── SizeChartDisplay.tsx
│   │   │   └── LoginModal.tsx
│   │   ├── pages/             # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Checkout.tsx
│   │   │   ├── Collections.tsx
│   │   │   ├── Wishlist.tsx
│   │   │   ├── Profile.tsx
│   │   │   ├── About.tsx
│   │   │   ├── ContactUs.tsx
│   │   │   └── admin/         # Admin pages
│   │   │       ├── Dashboard.tsx
│   │   │       ├── Products.tsx
│   │   │       ├── Categories.tsx
│   │   │       ├── Orders.tsx
│   │   │       ├── Users.tsx
│   │   │       ├── SizeCharts.tsx
│   │   │       ├── Analytics.tsx
│   │   │       └── ContactUs.tsx
│   │   ├── hooks/             # Custom React hooks
│   │   │   ├── useAuth.ts
│   │   │   ├── useCart.ts
│   │   │   ├── useWishlist.ts
│   │   │   └── use-toast.ts
│   │   ├── lib/               # Utility functions
│   │   │   ├── adminHelpers.ts
│   │   │   ├── authUtils.ts
│   │   │   └── utils.ts
│   │   ├── App.tsx            # Main App component
│   │   └── main.tsx           # Entry point
│   └── index.html
├── server/                     # Backend Express application
│   ├── index.ts               # Server entry point
│   ├── routes.ts              # API routes and endpoints
│   ├── db.ts                  # Database connection (MySQL)
│   ├── dbStorage.ts           # Database storage layer
│   ├── storage.ts             # In-memory storage interface
│   ├── sessionAuth.ts         # Authentication logic
│   ├── emailService.ts        # Email service (Nodemailer)
│   ├── uploadService.ts       # File upload handling
│   ├── objectStorage.ts       # Object storage utilities
│   ├── vite.ts                # Vite dev server integration
│   └── scripts/               # Database and utility scripts
│       ├── seed.ts           # Database seeding
│       ├── update-images.ts   # Image sync script
│       ├── activate_products.py
│       ├── check_db.py
│       └── ...
├── shared/                    # Shared code between client/server
│   └── schema.ts             # Database schema & Zod types
├── storage/                   # File storage
│   ├── logo/                 # Brand assets
│   └── uploads/              # Uploaded files
│       └── products/         # Product images (226 images)
│           ├── boys/
│           ├── girls/
│           ├── men/
│           └── women/
├── migrations/                # Drizzle ORM migrations
│   ├── 0000_clumsy_reaper.sql
│   └── meta/
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

Product images are stored in a hierarchical structure (all lowercase for folders and files):

```
storage/uploads/products/
├── boys/
│   ├── cantex junior boxer/
│   ├── junior brief/
│   ├── pants/
│   └── vest - boys/
├── girls/
│   ├── panties - girls/
│   └── vest - girls/
├── mens/
│   ├── pants/
│   ├── underwear/
│   ├── ultimate/
│   └── vest/
└── women/
   ├── panties - women/
   └── vest - women/
```

### Current Image Status

- **Total Products:** 64
- **Products with Images:** 47 (73%)
- **Total Images:** 226
- **Storage Size:** 1.2 GB
- **Image Formats:** JPG, PNG

### Updating Product Images

To sync product images from storage to the database, run:

```bash
npm run update-images
```

This command will:
1. Copy images from `storage/products/` to `storage/uploads/products/`
2. Scan the uploads directory and match folders to product names
3. Update the database with the resolved image paths

#### Adding New Products with Images

1. **Create the folder structure:**
   ```
   storage/uploads/products/[category]/[subcategory]/[product_name]/
   ```

2. **Add image files:**
   Place JPG/PNG images in the product folder

3. **Create product in database:**
   ```sql
   INSERT INTO products (id, name, category_id, is_active, ...)
   VALUES (...)
   ```

4. **Run image sync:**
   ```bash
   npm run update-images
   ```

#### Image Path Format

All image paths follow this pattern (lowercase):
```
/storage/uploads/products/[category]/[subcategory]/[product]/[filename]

Examples:
/storage/uploads/products/boys/cantex junior boxer/img_3599.jpg
/storage/uploads/products/mens/underwear/classic/img_0431.png
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

- **users** - Customer and admin accounts
- **products** - Product catalog with variants and pricing
- **categories** - Product categories and subcategories
- **orders** - Customer orders and order history
- **order_items** - Individual items in orders
- **cart_items** - Shopping cart (session and user-based)
- **wishlist_items** - Customer wishlists
- **reviews** - Product reviews and ratings
- **size_charts** - Size guide tables
- **contact_messages** - Customer inquiries
- **user_profiles** - Extended user information

See [shared/schema.ts](shared/schema.ts) for complete schema definition.

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
Men's Wear
  ├── Underwear
  │   ├── Briefs
  │   ├── Boxers
  │   └── Trunks
  └── Vests
```

### Guest Checkout
Customers can checkout without creating an account:
- Session-based cart management
- Email order confirmations
- Optional account creation after purchase

### Admin Analytics
- Real-time sales metrics
- Order status distribution
- Low stock alerts
- Revenue tracking
- Customer growth charts

## 📚 Additional Documentation

For more detailed information, see:

- [QUICK_START.md](QUICK_START.md) - Quick start guide with product preview
- [DOCUMENTATION.md](DOCUMENTATION.md) - Complete documentation index
- [ADMIN_REDESIGN.md](ADMIN_REDESIGN.md) - Admin dashboard architecture
- [IMAGES.md](IMAGES.md) - Image management guide
- [DATABASE_SETUP.md](DATABASE_SETUP.md) - Database configuration details
- [CATEGORIES_README.md](CATEGORIES_README.md) - Category management
- [server/scripts/README.md](server/scripts/README.md) - Available scripts reference

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
