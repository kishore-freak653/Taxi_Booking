# 🚕 Taxi Booking Platform - PERN Stack

A full-stack taxi booking platform built with PostgreSQL, Express.js, React (Next.js), and Node.js.

🌐 Live Demo
Frontend: https://taxi-booking-sable.vercel.app
Backend API: https://taxibooking-production-c75c.up.railway.app

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Testing](#testing)

## ✨ Features

### Customer Features
- User registration and authentication
- Search for trips and get fare estimates
- Select vehicle type and complete booking
- View booking history
- Cancel bookings
- Booking confirmation with reference ID

### Admin Features
- Secure admin panel (role-based access)
- Dashboard with statistics
- Manage vehicle catalogue (CRUD operations)
- View and track all bookings
- Update booking status
- User management

### Technical Features
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Server-side fare calculation with surge pricing
- Input validation and sanitization
- Comprehensive error handling
- Rate limiting for security
- Logging with Winston
- Type-safe with TypeScript

## 🛠 Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Zustand (State Management)
- React Hot Toast (Notifications)

**Backend:**
- Node.js
- Express.js
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (jose library)
- Zod (Validation)
- Winston (Logging)

## 🏗 Architecture

This project uses a **modular monolith** architecture:

```
taxi-booking/
├── client/               # Next.js frontend
│   ├── src/
│   │   ├── app/         # Next.js app router pages
│   │   ├── components/  # React components
│   │   ├── lib/         # API client, utilities
│   │   └── store/       # Zustand stores
│   └── public/
│
├── server/              # Express.js backend
│   ├── src/
│   │   ├── config/      # Configuration files
│   │   ├── controllers/ # Route handlers
│   │   ├── middleware/  # Express middleware
│   │   ├── routes/      # Route definitions
│   │   ├── services/    # Business logic
│   │   ├── utils/       # Helper functions
│   │   └── index.ts     # Server entry point
│   └── prisma/
│       ├── schema.prisma # Database schema
│       └── seed.ts       # Database seeding
│
└── ARCHITECTURE.md      # Detailed architectural decisions
```

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v14 or higher)
- **Git**

## 🚀 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/taxi-booking.git
cd taxi-booking
```

### 2. Install Backend Dependencies

```bash
cd server
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../client
npm install
```

### 4. Set up PostgreSQL Database

Create a new PostgreSQL database:

```bash
# Login to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE taxi_booking;

# Exit psql
\q
```

## 🔧 Environment Variables

### Backend (.env)

Create `server/.env` file (copy from `.env.example`):

```bash
cd server
cp .env.example .env
```

Update the values:

```env
NODE_ENV=development
PORT=5000

# Database URL
DATABASE_URL="postgresql://username:password@localhost:5432/taxi_booking?schema=public"

# JWT Secrets - CHANGE THESE!
# Generate using: openssl rand -base64 32
JWT_ACCESS_SECRET=your-super-secret-access-key-change-this-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-32-chars

JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

CORS_ORIGIN=http://localhost:3000
```

### Frontend (.env.local)

Create `client/.env.local`:

```bash
cd ../client
```

Create the file with:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 🗄️ Database Setup

### 1. Run Prisma Migrations

```bash
cd server
npx prisma migrate dev --name init
```

### 2. Generate Prisma Client

```bash
npx prisma generate
```

### 3. Seed the Database

This creates:
- Admin user (admin@taxibooking.com / admin123)
- Test customer (customer@test.com / customer123)
- 4 vehicle types (Economy, Sedan, SUV, Luxury)
- Sample fare rules

```bash
npm run db:seed
```

## 🏃 Running the Application

### Development Mode

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

Server will start on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

Client will start on `http://localhost:3000`

### Production Build

**Backend:**
```bash
cd server
npm run build
npm start
```

**Frontend:**
```bash
cd client
npm run build
npm start
```

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

#### Register
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+91-9876543210"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs..."
  }
}
```

### Booking Endpoints

#### Estimate Fare
```http
POST /bookings/estimate
Content-Type: application/json

{
  "pickup": {
    "lat": 12.9716,
    "lng": 77.5946,
    "address": "MG Road, Bangalore"
  },
  "dropoff": {
    "lat": 13.0827,
    "lng": 80.2707,
    "address": "Marina Beach, Chennai"
  },
  "vehicleTypeId": "uuid-here"
}
```

#### Create Booking
```http
POST /bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "pickup": { ... },
  "dropoff": { ... },
  "vehicleTypeId": "uuid-here",
  "notes": "Please call on arrival"
}
```

### Vehicle Endpoints

#### Get All Vehicles
```http
GET /vehicles
```

### Admin Endpoints

All admin endpoints require `Authorization: Bearer <admin-token>`

#### Dashboard Stats
```http
GET /admin/dashboard
```

#### All Bookings
```http
GET /admin/bookings?status=CONFIRMED&page=1&limit=20
```

#### Update Booking Status
```http
PATCH /admin/bookings/:id/status
Content-Type: application/json

{
  "status": "COMPLETED"
}
```

## 🌐 Deployment Backend (Railway)
1.Connected GitHub repo to Railway
2.Added PostgreSQL database
3.Configured environment variables
   Used:
4.npx prisma migrate deploy && npm start
  Important Notes
5.Prisma migrations run automatically in production
6.Railway provides DATABASE_URL
7.Backend runs on dynamic port

### Frontend (Vercel)

1. **Import project** to Vercel
2. **Set root directory** to `client`
3. **Set environment variable**:
   - `NEXT_PUBLIC_API_URL=https://your-backend-url.com`
4. **Deploy**

## 🧪 Testing

### Run Tests
```bash
cd server
npm test
```

### Test Credentials

**Admin:**
- Email: `admin@taxibooking.com`
- Password: `admin123`

**Customer:**
- Email: `customer@test.com`
- Password: `customer123`

## 📊 Database Schema

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed schema documentation.

Key tables:
- `users` - Customer and admin users
- `vehicle_types` - Available vehicle categories
- `bookings` - Trip bookings
- `fare_rules` - Dynamic pricing rules

## 🔒 Security Features

- ✅ JWT with refresh token rotation
- ✅ HTTP-only cookies for refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Input validation with Zod
- ✅ SQL injection prevention (Prisma)
- ✅ Rate limiting
- ✅ CORS configuration
- ✅ Helmet security headers
- ✅ Role-based access control

## 📝 Key Architectural Decisions

1. **Modular Monolith**: Easy to develop, deploy, and potentially split later
2. **Server-side Fare Calculation**: Prevents tampering, single source of truth
3. **JWT Auth**: Stateless, scalable authentication
4. **Prisma ORM**: Type-safety, migration management
5. **Zod Validation**: Runtime type checking with TypeScript inference

See [ARCHITECTURE.md](./ARCHITECTURE.md) for complete rationale.

## 🎯 Future Enhancements

- Real-time driver tracking (WebSockets)
- Payment integration (Stripe/Razorpay)
- Google Maps API integration
- Driver management module
- Push notifications
- Advanced analytics dashboard
- Multi-language support

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Kishore**
- Portfolio: [kishore-myportfolio.netlify.app](https://kishore-myportfolio.netlify.app)
- Location: Coimbatore/Chennai, India

## 🙏 Acknowledgments

- Design inspiration from Uber and Ola
- Built as a practical PERN stack assessment
- Documentation follows industry best practices

---

**Need Help?** Check the [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed implementation decisions or create an issue on GitHub.
