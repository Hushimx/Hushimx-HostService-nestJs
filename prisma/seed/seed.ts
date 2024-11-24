import { PrismaClient, Role } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  // Hash the password for admin user
  const hashedPassword = await argon.hash('securepassword'); // Replace 'securepassword' with your actual password

  await prisma.$transaction(async (prisma) => {
    // List of countries, cities, hotels, and rooms to create
    const countries = [
      { name: 'Saudi Arabia', code: 'SA' },
      { name: 'United Arab Emirates', code: 'AE' },
      { name: 'Qatar', code: 'QA' },
    ];

    const cities = {
      'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam'],
      'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
      Qatar: ['Doha', 'Al Wakrah', 'Al Khor'],
    };

    const hotelsPerCity = 3;
    const roomsPerHotel = 5;

    // Step 1: Create countries
    for (const countryData of countries) {
      const country = await prisma.country.create({
        data: {
          name: countryData.name,
          code: countryData.code,
        },
      });

      // Step 2: Create cities for each country
      for (const cityName of cities[countryData.name]) {
        const city = await prisma.city.create({
          data: {
            name: cityName,
            countryId: country.id,
          },
        });

        // Step 3: Create admin user for the country
        const adminUser = await prisma.user.create({
          data: {
            email: `${cityName.toLowerCase()}-admin@example.com`,
            hash: hashedPassword,
            firstName: `${cityName} Admin`,
            lastName: 'User',
            role: Role.SUPER_ADMIN,
            countryId: country.id,
          },
        });

        // Step 4: Create hotels in each city, owned by the admin user
        for (let i = 1; i <= hotelsPerCity; i++) {
          const hotel = await prisma.hotel.create({
            data: {
              name: `${cityName} Hotel ${i}`,
              cityId: city.id,
            },
          });

          // Step 5: Create rooms for each hotel
          for (let j = 1; j <= roomsPerHotel; j++) {
            await prisma.room.create({
              data: {
                uuid: `${hotel.id}-${j}`, // Generate a unique UUID
                roomNumber: `${j}`,
                type: j % 2 === 0 ? 'Deluxe' : 'Standard', // Alternate between Deluxe and Standard
                hotelId: hotel.id,
              },
            });
          }
        }
      }
    }

    // Step 6: Create a sample store
    const store = await prisma.store.create({
      data: {
        name: 'المطعم',
        slug: 'restaurant',
      },
    });

    // Step 7: Create a sample vendor in the first city
    const firstCity = await prisma.city.findFirst({});
    if (!firstCity) {
      throw new Error('No city found for vendor creation.');
    }

    const vendor = await prisma.vendor.create({
      data: {
        name: 'البيك',
        cityId: firstCity.id, // Link vendor to the first city
      },
    });

    // Step 8: Create products for the store and vendor
    const products = [
      { name: 'مسحب', price: 15.0 },
      { name: 'برست', price: 20.0 },
      { name: 'كنافة', price: 10.0 },
    ];

    for (const productData of products) {
      await prisma.product.create({
        data: {
          uuid: `${productData.name}-${Math.random()}`,
          name: productData.name,
          price: productData.price,
          vendorId: vendor.id,
          cityId: firstCity.id, // Link to the first city
          storeId: store.id,
        },
      });
    }

    // Step 9: Create a client
    await prisma.client.create({
      data: {
        name: 'Seed Client',
        phoneNo: '96655123456',
      },
    });

    console.log('Seeding completed successfully!');
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
