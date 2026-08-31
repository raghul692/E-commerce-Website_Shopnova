# 🛍️ SHOPNOVA - Modern Enterprise E-Commerce Platform

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)

**ShopNova** is a full-stack, enterprise-grade e-commerce platform built with a futuristic **Cyber-Luxe 3D spatial user interface** and a robust, secure Express & Prisma backend.

---

## ✨ Features & Highlights

### 🎨 Frontend (Cyber-Luxe & Spatial 3D Design)
- **Interactive 3D Elements**:
  - **Particle Mesh Canvas**: Dynamic background canvas with floating connected nodes.
  - **Custom Magnetic Cursor**: Smooth glowing cursor with hover interactions.
  - **3D Tilt Cards**: Perspective-based card tilting with dynamic specular highlights.
  - **360° Interactive Product Inspector**: Drag-to-rotate multi-angle product visualizer.
- **Modern Design System**:
  - Dark Mode & Glassmorphism design tokens.
  - Smooth Framer Motion transitions and kinetic micro-animations.
  - Fully responsive, mobile-optimized layouts.
- **E-Commerce Features**:
  - Faceted product search, filtering (by category, price range, stock, rating) and autocomplete.
  - Wishlist management, interactive cart drawer, and multi-step checkout.
  - Customer Dashboard with order history and profile management.
  - Product review system with ratings and verified purchase tags.

### 👥 Multi-Role User System
- **Customer Portal**: Seamless product browsing, purchasing, cart management, and order tracking.
- **Seller Dashboard**: Product inventory management, stock monitoring, sales stats, and order fulfillment status updates.
- **Admin Control Panel**: System-wide analytics, user management (customer/seller role promotion), product/review moderation, and financial summaries.

### ⚡ Backend Architecture
- **Node.js & Express with TypeScript**: Clean modular routing (`auth`, `product`, `cart`, `order`, `seller`, `admin`, `review`, `coupon`, `payment`).
- **Prisma ORM**: Type-safe relational database management with SQLite/PostgreSQL support.
- **Security & Performance**:
  - JWT Auth with HTTP-only tokens & Role-Based Access Control (RBAC).
  - Bcrypt password encryption.
  - `Helmet` security headers & `express-rate-limit` protection.
  - `Zod` schema validation for all API endpoints.
- **PDF Invoice Generation**: Automatic generation of downloadable PDF order receipts via `PDFKit`.
- **API Documentation**: Built-in interactive documentation available at `/api/docs`.

---

## 📁 Repository Structure

```
shopnova/
├── client/                 # Frontend React Application
│   ├── src/
│   │   ├── components/     # UI Components (TiltCard3D, Product360Viewer, CustomCursor, etc.)
│   │   ├── context/        # React Contexts (AuthContext, CartContext, ThemeContext)
│   │   ├── pages/          # View Pages (HomePage, ProductListingPage, AdminDashboard, etc.)
│   │   ├── services/       # Axios API client setup
│   │   ├── types.ts        # Frontend TypeScript interfaces
│   │   ├── App.tsx         # Main router and layout
│   │   └── main.tsx        # React entrypoint
│   ├── tailwind.config.js  # Custom theme, colors, and animations
│   └── vite.config.ts      # Vite configuration
│
├── server/                 # Backend Node.js Express Application
│   ├── prisma/             # Database schema & seed scripts
│   ├── src/
│   │   ├── middleware/     # Auth, error handling, rate limiting
│   │   ├── routes/         # API Controllers & routes
│   │   ├── prisma.ts       # Shared Prisma client instance
│   │   └── server.ts       # Express server initialization
│   └── tsconfig.json       # Backend TypeScript config
│
├── .env.example            # Sample environment variables
└── package.json            # Root monorepo workspace configuration
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x

### 1. Clone the Repository
```bash
git clone https://github.com/raghul692/E-commerce-Website_Shopnova.git
cd E-commerce-Website_Shopnova
```

### 2. Install Dependencies
Install dependencies for both `client` and `server` at once using npm workspaces:
```bash
npm install
```

### 3. Setup Environment Variables
Create a `.env` file in the `server` directory (refer to `.env.example`):
```env
PORT=5000
DATABASE_URL="file:./dev.db"
JWT_SECRET="your-super-secret-jwt-key"
NODE_ENV="development"
CLIENT_URL="http://localhost:5173"
```

### 4. Database Setup & Seeding
Run Prisma migrations and seed sample products, categories, and test users:
```bash
# Push database schema
npm run prisma:db:push

# Seed initial database records
npm run prisma:seed
```

### 5. Run the Application
Start both frontend and backend concurrently:
```bash
npm run dev
```

- **Frontend Client**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Documentation**: `http://localhost:5000/api/docs`

---

## 🛠️ Available Scripts

| Script | Command | Description |
| :--- | :--- | :--- |
| `npm run dev` | `concurrently ...` | Runs both client & server in development mode |
| `npm run build` | `tsc && vite build` | Builds production bundles for client and server |
| `npm run start` | `node dist/server.js` | Starts the production server |
| `npm run prisma:db:push` | `prisma db push` | Updates the database schema |
| `npm run prisma:seed` | `tsx prisma/seed.ts` | Populates database with seed data |
| `npm run typecheck` | `tsc --noEmit` | Validates TypeScript safety across full stack |

---

## 🔐 Demo Credentials

After seeding the database, you can log in with the following test credentials:

| Role | Email | Password |
| :--- | :--- | :--- |
| **Admin** | `admin@shopnova.com` | `admin123` |
| **Seller** | `seller@shopnova.com` | `seller123` |
| **Customer** | `user@shopnova.com` | `user123` |

---

## 📜 License

This project is licensed under the [MIT License](LICENSE).
