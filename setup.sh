#!/bin/bash

echo "🚕 Taxi Booking Platform - Quick Setup Script"
echo "=============================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js v18 or higher.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Node.js detected: $(node --version)${NC}"

# Check if PostgreSQL is installed
if ! command -v psql &> /dev/null; then
    echo -e "${YELLOW}⚠️  PostgreSQL not found. Please install PostgreSQL v14 or higher.${NC}"
    echo "   Visit: https://www.postgresql.org/download/"
else
    echo -e "${GREEN}✅ PostgreSQL detected${NC}"
fi

echo ""
echo "📦 Installing dependencies..."
echo ""

# Install backend dependencies
echo "Installing backend dependencies..."
cd server
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Backend dependency installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Backend dependencies installed${NC}"

# Install frontend dependencies
echo "Installing frontend dependencies..."
cd ../client
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Frontend dependency installation failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Frontend dependencies installed${NC}"

cd ..

echo ""
echo "🔧 Setting up environment files..."

# Setup backend .env
if [ ! -f "server/.env" ]; then
    cp server/.env.example server/.env
    echo -e "${YELLOW}⚠️  Created server/.env from template${NC}"
    echo -e "${YELLOW}   Please update DATABASE_URL and JWT secrets before running!${NC}"
else
    echo -e "${GREEN}✅ server/.env already exists${NC}"
fi

# Setup frontend .env.local
if [ ! -f "client/.env.local" ]; then
    echo "NEXT_PUBLIC_API_URL=http://localhost:5000" > client/.env.local
    echo -e "${GREEN}✅ Created client/.env.local${NC}"
else
    echo -e "${GREEN}✅ client/.env.local already exists${NC}"
fi

echo ""
echo "📝 Next Steps:"
echo "=============="
echo ""
echo "1. Update server/.env with your PostgreSQL credentials:"
echo "   DATABASE_URL=\"postgresql://username:password@localhost:5432/taxi_booking\""
echo ""
echo "2. Generate JWT secrets (run these commands):"
echo "   openssl rand -base64 32  # Use for JWT_ACCESS_SECRET"
echo "   openssl rand -base64 32  # Use for JWT_REFRESH_SECRET"
echo ""
echo "3. Create PostgreSQL database:"
echo "   psql -U postgres -c \"CREATE DATABASE taxi_booking;\""
echo ""
echo "4. Run database migrations:"
echo "   cd server && npx prisma migrate dev --name init"
echo ""
echo "5. Seed the database:"
echo "   cd server && npm run db:seed"
echo ""
echo "6. Start the backend:"
echo "   cd server && npm run dev"
echo ""
echo "7. Start the frontend (in a new terminal):"
echo "   cd client && npm run dev"
echo ""
echo -e "${GREEN}✨ Setup complete! Follow the steps above to run the application.${NC}"
