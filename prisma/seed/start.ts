import { PrismaClient, Role } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Hash the password using Argon2
  const hashedPassword = await argon.hash('securepassword'); // Replace 'securepassword' with your actual password

  // 1. Create a User
  const user = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      hash: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: Role.HOTEL_ADMIN,
    },
  });

  // 2. Create a Country (Saudi Arabia)
  const country = await prisma.country.create({
    data: {
      name: 'Saudi Arabia',
      code: 'SA',
    },
  });

  // 3. Create a City (Jeddah) in Saudi Arabia
  const city = await prisma.city.create({
    data: {
      name: 'Jeddah',
      countryId: country.id, // Associate Jeddah with Saudi Arabia
    },
  });

  // 4. Create a Hotel in Jeddah, owned by the user
  const hotel = await prisma.hotel.create({
    data: {
      name: 'Jeddah Grand Hotel',
      cityId: city.id, // Associate the hotel with Jeddah
      ownerId: user.id, // Associate the hotel with the user (Admin)
    },
  });
  // 5. Create a Room Linked to the Hotel

  const room = await prisma.room.create({
    data: {
      uuid: '680ee6f7-6603-4572-a77e-875f4a509a4b', // Fixed UUID
      roomNumber: '101',
      type: 'Deluxe',
      hotelId: hotel.id,
    },
  });
  
  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
