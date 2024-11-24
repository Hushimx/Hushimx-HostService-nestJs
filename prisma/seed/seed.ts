import { PrismaClient, Role } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function clearDatabase() {
  try {
    await prisma.room.deleteMany({});
    console.log('Cleared rooms.');

    await prisma.hotel.deleteMany({});
    console.log('Cleared hotels.');

    await prisma.city.deleteMany({});
    console.log('Cleared cities.');

    await prisma.country.deleteMany({});
    console.log('Cleared countries.');

    await prisma.user.deleteMany({});
    console.log('Cleared users.');

    await prisma.store.deleteMany({});
    console.log('Cleared stores.');

    await prisma.vendor.deleteMany({});
    console.log('Cleared vendors.');

    await prisma.product.deleteMany({});
    console.log('Cleared products.');

    await prisma.client.deleteMany({});
    console.log('Cleared clients.');

    console.log('Database cleared successfully.');
  } catch (error) {
    console.error('Error clearing database:', error);
  }
}

async function main() {
  try {
    // Step 1: Clear the database
    await clearDatabase();

    // Step 2: Hash the password for admin user
    const hashedPassword = await argon.hash('securepassword'); // Replace 'securepassword' with your actual password

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

    for (const countryData of countries) {
      try {
        const country = await prisma.country.create({
          data: {
            name: countryData.name,
            code: countryData.code,
          },
        });

        for (const cityName of cities[countryData.name]) {
          try {
            const city = await prisma.city.create({
              data: {
                name: cityName,
                countryId: country.id,
              },
            });

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

            for (let i = 1; i <= hotelsPerCity; i++) {
              try {
                const hotel = await prisma.hotel.create({
                  data: {
                    name: `${cityName} Hotel ${i}`,
                    cityId: city.id,
                  },
                });

                for (let j = 1; j <= roomsPerHotel; j++) {
                  try {
                    await prisma.room.create({
                      data: {
                        uuid: `${hotel.id}-${j}`, // Generate a unique UUID
                        roomNumber: `${j}`,
                        type: j % 2 === 0 ? 'Deluxe' : 'Standard', // Alternate between Deluxe and Standard
                        hotelId: hotel.id,
                      },
                    });
                  } catch (error) {
                    console.error(`Failed to create room: Hotel ID ${hotel.id}, Room ${j}`, error);
                  }
                }
              } catch (error) {
                console.error(`Failed to create hotel: City ${cityName}, Hotel ${i}`, error);
              }
            }
          } catch (error) {
            console.error(`Failed to create city: ${cityName}`, error);
          }
        }
      } catch (error) {
        console.error(`Failed to create country: ${countryData.name}`, error);
      }
    }

    // Create store, vendor, products, and client
    try {
      const store = await prisma.store.create({
        data: {
          name: 'المطعم',
          slug: 'restaurant',
        },
      });

      const firstCity = await prisma.city.findFirst({});
      if (!firstCity) throw new Error('No city found for vendor creation.');

      const vendor = await prisma.vendor.create({
        data: {
          name: 'البيك',
          cityId: firstCity.id,
        },
      });

      const products = [
        { name: 'مسحب', price: 15.0 },
        { name: 'برست', price: 20.0 },
        { name: 'كنافة', price: 10.0 },
      ];

      for (const productData of products) {
        try {
          await prisma.product.create({
            data: {
              uuid: `${productData.name}-${Math.random()}`,
              name: productData.name,
              price: productData.price,
              vendorId: vendor.id,
              cityId: firstCity.id,
              storeId: store.id,
            },
          });
        } catch (error) {
          console.error(`Failed to create product: ${productData.name}`, error);
        }
      }

      await prisma.client.create({
        data: {
          name: 'Seed Client',
          phoneNo: '96655123456',
        },
      });

      console.log('Seeding completed successfully!');
    } catch (error) {
      console.error('Failed to create store, vendor, products, or client.', error);
    }
  } catch (e) {
    console.error('Seeding process failed.', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
