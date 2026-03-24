import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@taxibooking.com' },
    update: {},
    create: {
      email: 'admin@taxibooking.com',
      passwordHash: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create test customer
  const customerPassword = await bcrypt.hash('customer123', 10);
  const customer = await prisma.user.upsert({
    where: { email: 'customer@test.com' },
    update: {},
    create: {
      email: 'customer@test.com',
      passwordHash: customerPassword,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+91-9876543210',
      role: 'CUSTOMER',
    },
  });
  console.log('✅ Test customer created:', customer.email);

  // Create vehicle types
  const vehicleTypes = [
    {
      name: 'Economy',
      description: 'Affordable rides for everyday commutes',
      baseFare: 50.0,
      perKmRate: 12.0,
      perMinuteRate: 2.0,
      capacity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
    },
    {
      name: 'Sedan',
      description: 'Comfortable sedans for a premium experience',
      baseFare: 80.0,
      perKmRate: 15.0,
      perMinuteRate: 3.0,
      capacity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1580414614892-f98c0ca326a7?w=400',
    },
    {
      name: 'SUV',
      description: 'Spacious SUVs for groups and luggage',
      baseFare: 120.0,
      perKmRate: 20.0,
      perMinuteRate: 4.0,
      capacity: 6,
      imageUrl: 'https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?w=400',
    },
    {
      name: 'Luxury',
      description: 'High-end vehicles for special occasions',
      baseFare: 200.0,
      perKmRate: 30.0,
      perMinuteRate: 5.0,
      capacity: 4,
      imageUrl: 'https://images.unsplash.com/photo-1563720360172-67b8f3dce741?w=400',
    },
  ];

  for (const vehicleData of vehicleTypes) {
    const vehicle = await prisma.vehicleType.upsert({
      where: { name: vehicleData.name },
      update: {},
      create: vehicleData,
    });
    console.log(`✅ Vehicle type created: ${vehicle.name}`);
  }

  // Create surge pricing rule
  const surgeRule = await prisma.fareRule.create({
    data: {
      name: 'Peak Hour Surge',
      ruleType: 'time_of_day',
      conditions: {
        days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
        hourRanges: [
          { start: 8, end: 10 },
          { start: 17, end: 20 },
        ],
      },
      multiplier: 1.5,
      isActive: true,
    },
  });
  console.log(`✅ Fare rule created: ${surgeRule.name}`);

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
