import { PrismaClient, Role } from '@prisma/client';
import * as argon from 'argon2';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting production seed...');

    // Step 1: Clear database (optional, remove if you want to preserve existing data)
    await prisma.deliveryOrderItem.deleteMany({});
    await prisma.deliveryOrder.deleteMany({});
    await prisma.cityServiceVendor.deleteMany({});
    await prisma.service.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.vendor.deleteMany({});
    await prisma.store.deleteMany({});
    await prisma.room.deleteMany({});
    await prisma.hotel.deleteMany({});
    await prisma.client.deleteMany({});
    await prisma.admin.deleteMany({});
    await prisma.city.deleteMany({});
    await prisma.country.deleteMany({});
    await prisma.paymentMethod.deleteMany({});
    await prisma.storeSection.deleteMany({});
    console.log('Database cleared.');

    // Step 2: Hash passwords for admins
    const hashedPassword = await argon.hash('password123'); // Change password as needed

    // Step 3: Seed countries
    const countries = [
      { name: 'Saudi Arabia', name_ar: 'المملكة العربية السعودية', code: 'SA', currency: 'SAR' },
      { name: 'Egypt', name_ar: 'مصر', code: 'EG', currency: 'EGP' },
    ];

    const cities = {
      'Saudi Arabia': [
        { name: 'Riyadh', name_ar: 'الرياض' },
        { name: 'Jeddah', name_ar: 'جدة' },
      ],
      Egypt: [
        { name: 'Cairo', name_ar: 'القاهرة' },
        { name: 'Alexandria', name_ar: 'الإسكندرية' },
      ],
    };

    // Create countries and cities
    for (const countryData of countries) {
      const country = await prisma.country.create({
        data: {
          name: countryData.name,
          name_ar: countryData.name_ar,
          code: countryData.code,
          currency: countryData.currency,
        },
      });

      for (const cityData of cities[countryData.name]) {
        await prisma.city.create({
          data: {
            name: cityData.name,
            name_ar: cityData.name_ar,
            countryId: country.id,
          },
        });
      }
    }
    console.log('Countries and cities seeded.');

    // Step 4: Seed admins
    const saudiAdmin = await prisma.admin.create({
      data: {
        email: 'super-admin@example.com',
        password: hashedPassword,
        name: 'Super Admin',
        role: Role.SUPER_ADMIN,
        countryId: 1, // Saudi Arabia's ID
      },
    });

    const egyptAdmin = await prisma.admin.create({
      data: {
        email: 'regional-admin@example.com',
        password: hashedPassword,
        name: 'Regional Admin',
        role: Role.REGIONAL_ADMIN,
        countryId: 2, // Egypt's ID
      },
    });

    console.log('Admins seeded:', { saudiAdmin, egyptAdmin });

    // Step 5: Seed store sections
    const storeSections = [
      { name: 'Restaurants', name_ar: 'المطاعم',slug:"resturants" },
      { name: 'Pharmacies', name_ar: 'الصيدليات',slug:"pharmacies" },
      { name: 'Groceries', name_ar: 'البقالات',slug:"groceries" },
    ];

    for (const section of storeSections) {
      await prisma.storeSection.create({
        data: {
          name: section.name,
          name_ar: section.name_ar,
          slug: section.slug
        },
      });
    }
    console.log('Store sections seeded.');

    // Step 6: Seed payment methods
    const paymentMethods : any = [
      { name: 'Cash', displayName: 'Cash', type: 'offline', isActive: true },
    ];

    for (const paymentMethod of paymentMethods) {
      await prisma.paymentMethod.create({
        data: {
          name: paymentMethod.name,
          displayName: paymentMethod.displayName,
          type: paymentMethod.type,
          isActive: paymentMethod.isActive,
        },
      });
    }
    console.log('Payment methods seeded.');

    // Step 7: Seed services
    const services = ['Cleaning', 'Laundry', 'Home Cleaning'];
    for (const serviceName of services) {
      await prisma.service.create({
        data: {
          slug: serviceName.toLowerCase().replace(' ', '-'),
          name: serviceName,
          description: `${serviceName} service.`,
        },
      });
    }
    console.log('Services seeded.');

    console.log('Production seed completed successfully!');
  } catch (error) {
    console.error('Production seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();


// import { PrismaClient, Role } from '@prisma/client';
// import * as argon from 'argon2';
// import { PaymentMethod } from '../../src/client/payment-methods/entities/payment-method.entity';

// const prisma = new PrismaClient();

// async function clearDatabase() {
//   try {
//     // Delete Order Items first because they depend on Orders, Products, and Vendors
//     await prisma.deliveryOrderItem.deleteMany({});
//     console.log('Cleared order items.');

//     // Delete Service Orders because they depend on Services, Rooms, Vendors, and Clients
//     await prisma.serviceOrder.deleteMany({});
//     console.log('Cleared service orders.');

//     // Delete Orders because they depend on Rooms, Cities, and Clients
//     await prisma.deliveryOrder.deleteMany({});
//     console.log('Cleared orders.');

//     // Delete dependent tables that rely on Vendors, Products, and Stores
//     await prisma.cityServiceVendor.deleteMany({});
//     console.log('Cleared city service vendors.');

//     await prisma.service.deleteMany({});
//     console.log('Cleared  services.');

//     await prisma.product.deleteMany({});
//     console.log('Cleared products.');

//     await prisma.vendor.deleteMany({});
//     console.log('Cleared vendors.');

//     await prisma.store.deleteMany({});
//     console.log('Cleared stores.');

//     // Delete Rooms because they depend on Hotels
//     await prisma.room.deleteMany({});
//     console.log('Cleared rooms.');

//     // Delete Hotels because they depend on Cities
//     await prisma.hotel.deleteMany({});
//     console.log('Cleared hotels.');

//     // Delete Clients and Users (no foreign key dependencies here)
//     await prisma.client.deleteMany({});
//     console.log('Cleared clients.');

//     await prisma.admin.deleteMany({});
//     console.log('Cleared users.');
//     await prisma.driver.deleteMany({});
//     console.log('Cleared drivers.');

//     // Delete Cities and Countries last because they have dependencies from other tables
//     await prisma.city.deleteMany({});
//     console.log('Cleared cities.');

//     await prisma.country.deleteMany({});
//     await prisma.deliveryOrder.deleteMany({});
//     console.log('Cleared countries.');
//   } catch (error) {
//     console.error('Error clearing database:', error);
//   }
// }

// async function main() {
//   try {
//     // Step 1: Clear the database
//     await clearDatabase();

//     // Step 2: Hash the password for admin user
//     //await argon.hash('12341234')
//     const hashedPassword = await argon.hash("password"); 

//     const countries = [
//       { name: 'Saudi Arabia', code: 'SA',currency: 'SAR' },
//       { name: 'United Arab Emirates', code: 'AE',currency: 'AED' },
//       { name: 'Qatar', code: 'QA' ,currency: 'QAR' },
//     ];

//     const cities = {
//       'Saudi Arabia': ['Riyadh', 'Jeddah', 'Dammam'],
//       'United Arab Emirates': ['Dubai', 'Abu Dhabi', 'Sharjah'],
//       Qatar: ['Doha', 'Al Wakrah', 'Al Khor'],
//     };
//     const services = ['Cleaning', 'Laundry','Home Cleaning'];
//     const PaymentMethods = [
//       { name: 'Cash',displayName: 'Cash',type: "offline",isActive: true },
//       { name: 'Debit Card',displayName: 'Cash',type: "offline",isActive: true },
//       { name: 'Credit Card',displayName: 'Cash',type: "offline",isActive: true },
//     ];
//     const hotelsPerCity = 3;
//     const roomsPerHotel = 5;

//     for (const countryData of countries) {
//       try {
//         const country = await prisma.country.create({
//           data: {
//             name: countryData.name,
//             code: countryData.code,
//             currency: countryData.currency,
//           },
//         });

//         for (const cityName of cities[countryData.name]) {
//           try {
//             const city = await prisma.city.create({
//             data: {
//                 name: cityName,
//                 countryId: country.id,
//               },
//             });

//             const adminUser = await prisma.admin.create({
//               data: {
//                 email: `${cityName.toLowerCase()}-admin@example.com`,
//                 password: hashedPassword,
//                 name: `${cityName} Admin`,
//                 role: Role.SUPER_ADMIN,
//                 countryId: country.id,
//               },
//             });

//             for (let i = 1; i <= hotelsPerCity; i++) {
//               try {
//                 const hotel = await prisma.hotel.create({
//                   data: {
//                     name: `${cityName} Hotel ${i}`,
//                     address: i % 2 === 0 ? 'حي اليرموك' : 'حي المنصورة',
//                     locationUrl: "https://maps.app.goo.gl/iUtG5umypgaqxdVK6",
//                     cityId: city.id,
//                   },
//                 });

//                 for (let j = 1; j <= roomsPerHotel; j++) {
//                   try {
//                     await prisma.room.create({
//                       data: {
//                         uuid: `${hotel.id}-${j}`, // Generate a unique UUID
//                         roomNumber: `${j}`,
//                         type: j % 2 === 0 ? 'Deluxe' : 'Standard', // Alternate between Deluxe and Standard
//                         hotelId: hotel.id,
//                       },
//                     });
//                   } catch (error) {
//                     console.error(`Failed to create room: Hotel ID ${hotel.id}, Room ${j}`, error);
//                   }
//                 }
//               } catch (error) {
//                 console.error(`Failed to create hotel: City ${cityName}, Hotel ${i}`, error);
//               }
//             }
//           } catch (error) {
//             console.error(`Failed to create city: ${cityName}`, error);
//           }
//         }
//       } catch (error) {
//         console.error(`Failed to create country: ${countryData.name}`, error);
//       }
//     }
//     try {
//       for(let i = 0; i < PaymentMethods.length; i++) {
//         await prisma.paymentMethod.create({
//           data: {
//             name: PaymentMethods[i].name,
//             displayName: PaymentMethods[i].displayName,
//             type: "offline",
//             isActive: PaymentMethods[i].isActive
//           }
//         } )
//       }
      
//     }catch (error) {
//       console.error(`Failed to create payment methods`, error);
//         }
//         // Create store, vendor, products, and client
//         try {
//           const firstCity = await prisma.city.findFirst({});
//           if (!firstCity) throw new Error('No city found for vendor creation.');
      
//           const vendor = await prisma.vendor.create({
//             data: {
//               name: 'البيك',
//               email:"hguhfdsa@gmail.com",
//               password:hashedPassword,
//               phoneNo: '966596000912',
//               address: 'حي اليرموك',
//               cityId: firstCity.id,
//             },
//           });
//           const StoreSection = await prisma.storeSection.createMany({ data: [{ name: 'resturants',name_ar:"المطاعم" }, { name: 'pharmacies',name_ar:"الصيدليات" }, { name: 'groceries',name_ar:"البقالات" }] });
//           const store = await prisma.store.create({
//             data: {
//             name: 'المطعم',
//           image:"https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_jKH2r-IgzYjNhQO0afH9khpSkpNIV2LnmA&s",
//           banner:"https://www.albaik.com/assets/hero/home_hero_new_1400-d5bb20bf4a5a8eaa19d22379497bd57b11272c75d0efab0f86dd34248072a596.jpg",
//           sectionId: 1,
//           vendorId: vendor.id,
//           cityId: vendor.cityId,
          
//         },
//       });

//       const vendorTwo = await prisma.vendor.create({
//         data: {
//           name: 'البيك',
//           email:"hguhfds2a@gmail.com",
//           password:hashedPassword,
//           phoneNo: '9665960009123',
//           address: 'حي اليرموك',
//           cityId: firstCity.id,
//         },
//       });

//       const products = [
//         { name: 'Pizza', price: 12.99 },
//         { name: 'Burger', price: 8.99 },
//         { name: 'Salad', price: 7.99 },
//         { name: 'Pasta', price: 10.99 },
//         { name: 'Soup', price: 6.99 },
//         { name: 'Steak', price: 15.99 },
//         { name: 'Chicken Curry', price: 9.99 },
//         { name: 'Fish and Chips', price: 11.99 },
//         { name: 'Lasagna', price: 14.99 },
//         { name: 'Tacos', price: 8.99 },
//         { name: 'Sushi', price: 13.99 },
//         { name: 'Pizza with Extra Cheese', price: 14.99 },
//         { name: 'Burger with Bacon', price: 10.99 },
//         { name: 'Salad with Grilled Chicken', price: 12.99 },
//         { name: 'Pasta with Meatballs', price: 11.99 },
//         { name: 'Soup with Croutons', price: 7.99 },
//         { name: 'Steak with Garlic Sauce', price: 16.99 },
//         { name: 'Chicken Curry with Naan Bread', price: 10.99 },
//         { name: 'Fish and Chips with Tartar Sauce', price: 12.99 },
//         { name: 'Lasagna with Garlic Bread', price: 15.99 },
//         { name: 'Tacos with Guacamole', price: 9.99 },
//         { name: 'Sushi with Salmon', price: 14.99 },
//         { name: 'Chicken Fajitas', price: 10.99 },
//         { name: 'Beef and Broccoli', price: 12.99 },
//         { name: 'Veggie Burger', price: 9.99 },
//         { name: 'Chicken Quesadilla', price: 10.99 },
//         { name: 'Meatball Sub', price: 11.99 },
//         { name: 'Egg Salad', price: 8.99 },
//         { name: 'Grilled Cheese', price: 7.99 },
//         { name: 'Chicken Caesar Wrap', price: 10.99 },
//         { name: 'Turkey Club', price: 12.99 },
//         { name: 'Veggie Wrap', price: 9.99 },
//         { name: 'Chicken Tenders', price: 10.99 },
//         { name: 'Onion Rings', price: 6.99 },
//         { name: 'Chicken Sandwich', price: 9.99 },
//         { name: 'BLT Salad', price: 11.99 },
//         { name: 'Chicken Fajitas', price: 12.99 },
//         { name: 'Beef Tacos', price: 10.99 },
//         { name: 'Chicken Pot Pie', price: 13.99 },
//         { name: 'Veggie Pizza', price: 12.99 },
//         { name: 'Meatloaf', price: 14.99 },
//         { name: 'Chicken Cordon Bleu', price: 15.99 },
//         { name: 'Fish Sandwich', price: 11.99 },
//         { name: 'Egg and Sausage Biscuit', price: 8.99 },
//         { name: 'Chicken and Waffles', price: 10.99 },
//         { name: 'Steak Frites', price: 16.99 },
//         { name: 'Chicken Tikka Masala', price: 12.99 },
//         { name: 'Veggie Burger with Cheese', price: 11.99 },
//         { name: 'Chicken Quesadilla', price: 11.99 },
//         { name: 'Chicken Nuggets', price: 11.99 },
//         { name: 'Beef and Mushroom Gravy', price: 14.99 },
//         { name: 'Chicken Fettuccine', price: 13.99 },
//         { name: 'Turkey Meatball Sub', price: 12.99 },
//         { name: 'Chicken Caesar Salad', price: 12.99 },
//         { name: 'Veggie Meatball Sub', price: 10.99 },
//         { name: 'Chicken and Dumplings', price: 11.99 },
//         { name: 'Beef Stroganoff', price: 15.99 },
//         { name: 'Chicken Cacciatore', price: 14.99 },
//         { name: 'Fish Tacos', price: 12.99 },
//         { name: 'Eggplant Parmesan', price: 13.99 },
//       ];
// const productTwo = [
//   { name: 'رز', price: 16.99 },
//   { name: 'مخلهيع', price: 10.99 },
//   { name: 'بطاطس', price: 12.99 },
//   { name: 'فول', price: 15.99 },
//   { name: 'زعتر', price: 9.99 },

// ]
//       for (let i = 0; i < products.length;i++) {
//         const productData = products[i];
//         try {
//           await prisma.product.create({
//             data: {
//               name: productData.name,
//               price: productData.price,
//               image: i % 2 == 0 ? "https://placehold.co/300" : "",
//               storeId: store.id,
//             },
//           });
//         } catch (error) {
//           console.error(`Failed to create product: ${productData.name}`, error);
//         }
//       }
//       for (let i = 0; i < productTwo.length;i++) {
//         const productData = productTwo[i];
//         try {
//           await prisma.product.create({
//             data: {
//               name: productData.name,
//               price: productData.price,
//               image: i % 2 == 0 ? "https://placehold.co/300" : "",
//               storeId: store.id,
//             },
//           });
//         } catch (error) {
//           console.error(`Failed to create product: ${productData.name}`, error);
//         }
//       }

//       await prisma.client.create({
//         data: {
//           name: 'Seed Client',
//           phoneNo: '96655123456',
//           countryCode:"SA"
//         },
//       });
      

//     const service = await prisma.service.create({
//       data: {
//         slug: 'laundry',
//         name: 'Laundry Service',
//         description: 'Professional laundry services for your convenience.',
//       },
//     });
//     for(let i  in services){  
//       const service = await prisma.service.create({
//         data: {
//           slug: services[i],
//           name: services[i],
//           description: `${services[i]} servce`,
//         },
//       });
//       await prisma.cityServiceVendor.create({
//         data: {
//           serviceId: service.id,
//           vendorId: 1,
//           cityId: 1,
//         },
//       });
//       }
    

//     await prisma.cityServiceVendor.create({
//       data: {

//         serviceId: service.id,
//         vendorId: 1,
//         cityId: 1,
//       },
//     });

//       console.log('Seeding completed successfully!');
//     } catch (error) {
//       console.error('Failed to create store, vendor, products, or client.', error);
//     }
//     try {
//       // Fetch all clients
//       const clients = await prisma.client.findMany();
//       if (clients.length === 0) throw new Error('No clients found for creating orders.');
    
//       // Fetch all cities, hotels, rooms, and products
//       const cities = await prisma.city.findMany();
//       const hotels = await prisma.hotel.findMany();
//       const rooms = await prisma.room.findMany();
//       const products = await prisma.product.findMany();
    
//       if (cities.length === 0 || hotels.length === 0 || rooms.length === 0 || products.length === 0) {
//         throw new Error('Required entities (cities, hotels, rooms, products) are missing.');
//       }
    
//       for (const client of clients) {
//         // Create a few orders for each client
//         for (let orderIndex = 1; orderIndex <= 3; orderIndex++) {
//           try {
//             // Randomly pick city, hotel, and room
//             const city = cities[Math.floor(Math.random() * cities.length)];
//             const hotel = hotels.find((h) => h.cityId === city.id);
//             const room = rooms.find((r) => r.hotelId === hotel?.id);
    
//             if (!city || !hotel || !room) {
//               console.warn(`Skipping order creation for client ${client.name} due to missing relationships.`);
//               continue;
//             }
    
//             // Create random order items
//             const orderItemsData = Array.from({ length: Math.floor(Math.random() * 4) + 1 }, () => {
//               const product = products[Math.floor(Math.random() * products.length)];
//               return {
//                 productId: product.id,
//                 quantity: Math.floor(Math.random() * 5) + 1, // Random quantity between 1 and 5
//                 price: product.price,
//               };
//             });
    
//             const initialTotal = orderItemsData.reduce((sum, item) => sum + item.quantity * item.price, 0);
//             const driver = await prisma.driver.create({
//               data: {
//                 name: "هاشم قيمر",
//                 phoneNo: "966596000912",
//                 cityId: city.id,
//               },
//             });
//             // Create the order
//             const Store = await prisma.store.findFirst()
//             const order = await prisma.deliveryOrder.create({
//               data: {
//                 clientId: client.id,
//                 cityId: city.id,
//                 roomId: room.id,
//                 hotelId: hotel.id,
//                 vendorId: 1,
//                 storeId: Store.id,
//                 storeName: Store.name,
//                 currencySign: "SAR",
//                 clientName: client.name,
//                 clientNumber: client.phoneNo,
//                 roomNumber: room.roomNumber,
//                 hotelName: hotel.name,
//                 status: 'PENDING', // Example status
//                 total: initialTotal,
//                 paymentMethod: orderIndex % 2 === 0 ? 'CREDIT_CARD' : 'CASH', // Alternate payment methods

//               },
//               include: {
//                 orderItems: true,
//               },
//             });
    
//             console.log(`Order created for client ${client.name}:`, order);
//           } catch (error) {
//             console.error(`Failed to create order for client ${client.name}:`, error);
//           }
//         }
//       }
//     } catch (error) {
//       console.error('Failed to create multiple orders:', error);
//     }
    
    
//   } catch (e) {
//     console.error('Seeding process failed.', e);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
