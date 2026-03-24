# Taxi Booking Platform - Architectural Decisions

## 1. Project Structure: Modular Monolith

**Decision**: Monorepo with separate `client` and `server` directories

**Rationale**:
- **Not microservices**: Overkill for this scope, adds deployment complexity
- **Not single-folder monolith**: Hard to maintain, violates separation of concerns
- **Modular monolith**: Clean boundaries, easy to extract later if needed, simpler deployment

```
taxi-booking/
├── client/          # Next.js frontend
├── server/          # Express.js backend
└── shared/          # Shared TypeScript types (optional)
```

---

## 2. Fare Calculation Logic

**Decision**: Backend service layer with configurable pricing rules

**Location**: `server/src/services/fareCalculator.ts`

**Rationale**:
- **Never trust client**: Fare calculation must be server-authoritative
- **Configurable**: Pricing rules stored in database, not hardcoded
- **Testable**: Pure functions with clear inputs/outputs
- **Audit trail**: All fare calculations logged with parameters

**Formula Structure**:
```typescript
fare = base_fare + (distance_km * per_km_rate) + (time_minutes * per_minute_rate) + surge_multiplier
```

**Why not client-side estimates?**
- Clients show *estimates* fetched from backend
- Final fare is *always* calculated server-side on booking confirmation
- Prevents tampering, ensures consistency

---

## 3. Authentication & Authorization

**Decision**: JWT-based auth with role-based access control (RBAC)

**Implementation**:
- **Access tokens**: Short-lived (15 min), stored in memory
- **Refresh tokens**: HTTP-only cookies (7 days), rotation on use
- **Roles**: `customer`, `admin`
- **Middleware**: Route-level guards checking token + role

**Rationale**:
- **Stateless**: JWTs enable horizontal scaling
- **Secure**: HTTP-only cookies prevent XSS, refresh rotation limits replay attacks
- **Simple**: No Redis/session store needed for MVP

**Admin Security**:
1. Separate admin route (`/admin/*`)
2. Role verification middleware
3. Admin users manually seeded (not self-registration)
4. Rate limiting on login endpoints
5. CORS restricted to known origins

---

## 4. Database Design

**Schema**:

```sql
-- Users table (both customers and admins)
users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  password_hash VARCHAR NOT NULL,
  role VARCHAR CHECK (role IN ('customer', 'admin')),
  created_at TIMESTAMP
)

-- Vehicle types (sedan, suv, etc.)
vehicle_types (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  base_fare DECIMAL(10,2),
  per_km_rate DECIMAL(10,2),
  per_minute_rate DECIMAL(10,2),
  capacity INT,
  image_url VARCHAR,
  is_active BOOLEAN DEFAULT true
)

-- Bookings
bookings (
  id UUID PRIMARY KEY,
  reference_id VARCHAR UNIQUE, -- Human-readable (e.g., BK-20240322-A1B2)
  user_id UUID REFERENCES users(id),
  vehicle_type_id UUID REFERENCES vehicle_types(id),
  
  pickup_location JSONB NOT NULL, -- {address, lat, lng}
  dropoff_location JSONB NOT NULL,
  
  distance_km DECIMAL(10,2),
  duration_minutes INT,
  estimated_fare DECIMAL(10,2),
  final_fare DECIMAL(10,2),
  
  status VARCHAR CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Fare rules (for surge pricing, time-based multipliers, etc.)
fare_rules (
  id UUID PRIMARY KEY,
  rule_type VARCHAR, -- 'surge', 'time_of_day', 'holiday'
  conditions JSONB,  -- e.g., {"day": "sunday", "hour_range": [18, 22]}
  multiplier DECIMAL(5,2),
  is_active BOOLEAN
)
```

**Key Decisions**:
- **UUIDs over serial IDs**: Prevents enumeration attacks, easier distributed systems
- **JSONB for locations**: Flexible for future fields (landmark, instructions)
- **Soft deletes via is_active**: Never hard-delete pricing or vehicle data
- **Separate fare_rules**: Enables dynamic pricing without code changes
- **Reference IDs**: User-friendly booking identifiers

**Indexes**:
```sql
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
```

---

## 5. Error Handling Strategy

**Backend (Express)**:

```typescript
// Custom error classes
class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) { super(message); }
}

// Global error handler
app.use((err, req, res, next) => {
  if (err.isOperational) {
    // Known errors (validation, auth failures)
    return res.status(err.statusCode).json({ error: err.message });
  }
  
  // Unknown errors - log but don't expose details
  logger.error(err);
  res.status(500).json({ error: 'Internal server error' });
});
```

**Frontend (React/Next.js)**:
- Toast notifications for user-facing errors
- Error boundaries for component crashes
- Retry logic for network failures
- Graceful degradation (show cached data if API fails)

**Categories**:
1. **Validation errors** (400): "Invalid pickup location"
2. **Auth errors** (401/403): "Session expired"
3. **Not found** (404): "Booking not found"
4. **Business logic** (422): "No vehicles available in this area"
5. **Server errors** (500): Generic message, detailed logs

---

## 6. Input Validation & Sanitization

**Tools**:
- **zod**: Schema validation for API inputs
- **express-validator**: Additional middleware validation
- **helmet**: HTTP header security
- **express-rate-limit**: Prevent brute force

**Example**:
```typescript
const createBookingSchema = z.object({
  pickup: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1)
  }),
  dropoff: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
    address: z.string().min(1)
  }),
  vehicleTypeId: z.string().uuid()
});
```

---

## 7. Project Organization

```
server/
├── src/
│   ├── config/         # DB, env, constants
│   ├── middleware/     # Auth, validation, error handling
│   ├── routes/         # Route definitions
│   ├── controllers/    # Request handlers
│   ├── services/       # Business logic
│   ├── models/         # Database models/queries
│   ├── utils/          # Helpers
│   └── types/          # TypeScript types
├── prisma/
│   └── schema.prisma   # Database schema
└── tests/

client/
├── src/
│   ├── app/            # Next.js app router
│   ├── components/     # React components
│   ├── hooks/          # Custom hooks
│   ├── lib/            # API client, utils
│   ├── store/          # State management (Zustand)
│   └── types/          # TypeScript types
└── public/
```

---

## 8. Technology Choices

| Category | Choice | Why |
|----------|--------|-----|
| **Frontend Framework** | Next.js 14 (App Router) | SSR for SEO, API routes, TypeScript support, modern DX |
| **Backend Framework** | Express.js | Battle-tested, middleware ecosystem, flexibility |
| **ORM** | Prisma | Type-safe queries, migration management, excellent DX |
| **Validation** | Zod | Type inference, runtime validation, composable |
| **State Management** | Zustand | Lightweight, no boilerplate, TypeScript-first |
| **Styling** | Tailwind CSS | Utility-first, consistent design, small bundle |
| **Auth** | jose (JWT library) | Standards-compliant, well-maintained |
| **Testing** | Jest + Supertest | Industry standard, good TypeScript support |
| **Deployment** | Vercel (FE) + Render/Railway (BE) | Free tier, CI/CD, PostgreSQL included |

---
