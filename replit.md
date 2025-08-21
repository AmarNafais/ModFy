# Overview

This is a full-stack e-commerce application for men's premium innerwear called "MODFY". The application features a modern, minimalist design focused on luxury branding and user experience. It includes product catalog management, shopping cart functionality, and a clean, responsive interface built with React and TypeScript.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **React SPA**: Built with React 18 using functional components and hooks
- **TypeScript**: Fully typed codebase for type safety
- **Vite**: Modern build tool and dev server for fast development
- **Wouter**: Lightweight client-side routing library
- **TanStack Query**: Server state management and caching
- **Tailwind CSS**: Utility-first CSS framework for styling
- **Radix UI**: Headless component library for accessibility
- **shadcn/ui**: Pre-built component system using Radix primitives

## Backend Architecture
- **Express.js**: Node.js web framework for API routes
- **TypeScript**: Server-side type safety
- **RESTful API**: Standard HTTP methods for CRUD operations
- **In-Memory Storage**: Development storage layer with seeded data
- **Session Management**: Simple session-based cart storage
- **Error Handling**: Centralized error middleware

## Database Design
- **Drizzle ORM**: Type-safe database queries and schema management
- **PostgreSQL**: Production database (configured but using in-memory for development)
- **Schema**: Products, categories, collections, users, and cart items
- **Relationships**: Products belong to categories, cart items reference products

## Key Features
- **Product Catalog**: Browse products by category with filtering
- **Shopping Cart**: Session-based cart with add/remove/update functionality
- **Responsive Design**: Mobile-first approach with luxury aesthetic
- **SEO-Friendly**: Clean URLs and proper meta information
- **Type Safety**: End-to-end TypeScript implementation

## Development Setup
- **Monorepo Structure**: Client and server code in single repository
- **Shared Types**: Common schemas and types between frontend and backend
- **Hot Reload**: Vite HMR for fast development iteration
- **Path Aliases**: Clean import paths using TypeScript path mapping

# External Dependencies

## Database
- **Neon Database**: Serverless PostgreSQL provider
- **Drizzle Kit**: Database migrations and schema management

## UI Components
- **Radix UI**: Comprehensive set of accessible components
- **Lucide React**: Icon library for consistent iconography
- **React Hook Form**: Form state management and validation
- **Zod**: Runtime type validation for forms and API

## Development Tools
- **ESBuild**: Fast TypeScript compilation for production
- **PostCSS**: CSS processing with Tailwind
- **TSX**: TypeScript execution for development server

## Hosting & Deployment
- **Replit**: Development and hosting platform
- **Vite Plugin**: Replit-specific development enhancements