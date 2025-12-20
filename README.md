# 🛍️ ModFy - Premium Men's Innerwear E-Commerce

> A modern, full-stack e-commerce platform for premium men's innerwear with elegant design, seamless shopping experience, and robust backend infrastructure.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)

## ✨ Features

- 🛒 **Shopping Cart** - Add, update, and remove items with real-time updates
- 💳 **Checkout System** - Streamlined checkout process with order management
- 👤 **User Authentication** - Secure session-based authentication
- 📱 **Responsive Design** - Mobile-first approach with beautiful UI
- 🔍 **Product Catalog** - Browse by categories and collections with high-quality images
- ❤️ **Wishlist** - Save favorite items for later
- 👔 **Admin Dashboard** - Manage products, orders, and inventory
- 🎨 **Modern UI** - Built with Tailwind CSS and shadcn/ui components
- 📸 **Product Images** - Auto image sync and management system
- 🔄 **Image Auto-Update** - Automatic product image synchronization from storage

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
- **MySQL** - Relational database
- **Drizzle ORM** - Type-safe database toolkit
- **Express Session** - Session management
- **bcryptjs** - Password hashing
- **Nodemailer** - Email notifications

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
DB_PASSWORD=yourpassword
DB_PORT=3306
DB_USER=mysql

# Application Configuration
NODE_ENV=production
PORT=3000
```

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
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   │   ├── ui/       # shadcn/ui components
│   │   │   ├── Header.tsx
│   │   │   ├── Footer.tsx
│   │   │   └── ...
│   │   ├── pages/        # Page components
│   │   │   ├── Home.tsx
│   │   │   ├── Shop.tsx
│   │   │   ├── ProductDetail.tsx
│   │   │   ├── Checkout.tsx
│   │   │   └── ...
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── App.tsx       # Main App component
│   │   └── main.tsx      # Entry point
│   └── index.html
├── server/                # Backend Express application
│   ├── routes.ts         # API routes
│   ├── db.ts            # Database connection
│   ├── index.ts         # Server entry point
│   ├── sessionAuth.ts   # Authentication logic
│   ├── emailService.ts  # Email functionality
│   └── scripts/         # Migration scripts
├── shared/               # Shared code between client/server
│   └── schema.ts        # Database schema & types
├── migrations/           # Database migration files
├── ecosystem.config.js   # PM2 configuration
├── drizzle.config.ts    # Drizzle ORM configuration
├── vite.config.ts       # Vite configuration
├── tailwind.config.ts   # Tailwind CSS configuration
└── package.json         # Dependencies and scripts
```

## 🔧 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Run production server |
| `npm run check` | TypeScript type checking |
| `npm run db:push` | Push schema changes to database |
| `npm run db:migrate` | Run database migrations |
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
| `DB_HOST` | MySQL host address | `127.0.0.1` | Yes |
| `DB_NAME` | Database name | `modfy` | Yes |
| `DB_PASSWORD` | Database password | - | Yes |
| `DB_PORT` | Database port | `3306` | Yes |
| `DB_USER` | Database username | `mysql` | Yes |
| `NODE_ENV` | Environment mode | `development` | Yes |
| `PORT` | Application port | `3000` | Yes |

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

Product images are stored in a hierarchical structure:

```
storage/uploads/products/
├── Boys/
│   ├── Cantex Junior Boxer/
│   ├── Junior Brief/
│   ├── Pants/
│   └── Vest - Boys/
├── Girls/
│   ├── Panties - Girls/
│   └── Vest - Girls/
├── Mens/
│   ├── Pants/
│   ├── Underwear/
│   ├── Ultimate/
│   └── Vest/
└── Women/
    ├── Panties - Women/
    └── Vest - Women/
```

### Current Image Status

- **Total Products:** 64
- **Products with Images:** 47 (73%)
- **Total Images:** 226
- **Storage Size:** 1.2 GB
- **Image Formats:** JPG, PNG

### Updating Product Images

#### Automatic Image Sync

The project includes an automated image synchronization script. When you add new product images to the storage folder, run:

```bash
npm run update-images
# or
npx ts-node server/scripts/update-images.ts
```

This script will:
1. Scan the `storage/uploads/products/` directory
2. Match folder names with product names in the database
3. Update the database with correct image paths
4. Normalize all image paths to ensure consistency
5. Generate a detailed report of changes

#### Adding New Products with Images

1. **Create the folder structure:**
   ```
   storage/uploads/products/[CATEGORY]/[SUBCATEGORY]/[PRODUCT_NAME]/
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

All image paths follow this pattern:
```
/storage/uploads/products/[CATEGORY]/[SUBCATEGORY]/[PRODUCT]/[FILENAME]

Examples:
/storage/uploads/products/Boys/Cantex Junior Boxer/IMG_3599.jpg
/storage/uploads/products/Mens/Underwear/Classic/IMG_0431.png
```

### Documentation

For detailed image management instructions, see:
- [IMAGES.md](IMAGES.md) - Quick reference guide
- [server/scripts/IMAGE_UPDATE_README.md](server/scripts/IMAGE_UPDATE_README.md) - Complete technical documentation
- [DOCUMENTATION.md](DOCUMENTATION.md) - Master documentation index

## 🔄 Updating the Application

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

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [Vite](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [Express.js](https://expressjs.com/)

## 📧 Support

For support, email support@modfy.com or open an issue in this repository.

---

Made with ❤️ by Amar Nafais
