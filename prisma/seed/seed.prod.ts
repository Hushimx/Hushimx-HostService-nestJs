// import { PrismaClient, Role } from '@prisma/client';
// import * as argon from 'argon2';

// const prisma = new PrismaClient();

// async function main() {
//   try {
//     console.log('Starting production seed...');

//     // Step 1: Clear database (optional, remove if you want to preserve existing data)
//     await prisma.deliveryOrderItem.deleteMany({});
//     await prisma.deliveryOrder.deleteMany({});
//     await prisma.cityServiceVendor.deleteMany({});
//     await prisma.service.deleteMany({});
//     await prisma.product.deleteMany({});
//     await prisma.vendor.deleteMany({});
//     await prisma.store.deleteMany({});
//     await prisma.room.deleteMany({});
//     await prisma.hotel.deleteMany({});
//     await prisma.client.deleteMany({});
//     await prisma.admin.deleteMany({});
//     await prisma.city.deleteMany({});
//     await prisma.country.deleteMany({});
//     await prisma.paymentMethod.deleteMany({});
//     await prisma.storeSection.deleteMany({});
//     console.log('Database cleared.');

//     // Step 2: Hash passwords for admins
//     const hashedPassword = await argon.hash('password123'); // Change password as needed

//     // Step 3: Seed countries
//     const countries = [
//       { name: 'Saudi Arabia', name_ar: 'المملكة العربية السعودية', code: 'SA', currency: 'SAR' },
//       { name: 'Egypt', name_ar: 'مصر', code: 'EG', currency: 'EGP' },
//     ];

//     const cities = {
//       'Saudi Arabia': [
//         { name: 'Riyadh', name_ar: 'الرياض' },
//         { name: 'Jeddah', name_ar: 'جدة' },
//       ],
//       Egypt: [
//         { name: 'Cairo', name_ar: 'القاهرة' },
//         { name: 'Alexandria', name_ar: 'الإسكندرية' },
//       ],
//     };

//     // Create countries and cities
//     for (const countryData of countries) {
//       const country = await prisma.country.create({
//         data: {
//           name: countryData.name,
//           name_ar: countryData.name_ar,
//           code: countryData.code,
//           currency: countryData.currency,
//         },
//       });

//       for (const cityData of cities[countryData.name]) {
//         await prisma.city.create({
//           data: {
//             name: cityData.name,
//             name_ar: cityData.name_ar,
//             countryId: country.id,
//           },
//         });
//       }
//     }
//     console.log('Countries and cities seeded.');

//     // Step 4: Seed admins
//     const saudiAdmin = await prisma.admin.create({
//       data: {
//         email: 'super-admin@example.com',
//         password: hashedPassword,
//         name: 'Super Admin',
//         role: Role.SUPER_ADMIN,
//         countryId: 1, // Saudi Arabia's ID
//       },
//     });

//     const egyptAdmin = await prisma.admin.create({
//       data: {
//         email: 'regional-admin@example.com',
//         password: hashedPassword,
//         name: 'Regional Admin',
//         role: Role.REGIONAL_ADMIN,
//         countryId: 2, // Egypt's ID
//       },
//     });

//     console.log('Admins seeded:', { saudiAdmin, egyptAdmin });

//     // Step 5: Seed store sections
//     const storeSections = [
//       { name: 'Restaurants', name_ar: 'المطاعم' },
//       { name: 'Pharmacies', name_ar: 'الصيدليات' },
//       { name: 'Groceries', name_ar: 'البقالات' },
//     ];

//     for (const section of storeSections) {
//       await prisma.storeSection.create({
//         data: {
//           name: section.name,
//           name_ar: section.name_ar,
//           slug: section.name.toLowerCase().replace(' ', '-'),
//         },
//       });
//     }
//     console.log('Store sections seeded.');

//     // Step 6: Seed payment methods
//     const paymentMethods  = [
//       { name: 'Cash', displayName: 'Cash', type: 'offline', isActive: true },
//     ];
    
//     for (const paymentMethod of paymentMethods) {
//       await prisma.paymentMethod.create({
//         data: {
//           name: paymentMethod.name,
//           displayName: paymentMethod.displayName,
//           type: "offline",
//           isActive: paymentMethod.isActive,
//         },
//       });
//     }
//     console.log('Payment methods seeded.');

//     // Step 7: Seed services
//     const services = ['Cleaning', 'Laundry', 'Home Cleaning'];
//     for (const serviceName of services) {
//       await prisma.service.create({
//         data: {
//           slug: serviceName.toLowerCase().replace(' ', '-'),
//           name: serviceName,
//           description: `${serviceName} service.`,
//         },
//       });
//     }
//     console.log('Services seeded.');

//     console.log('Production seed completed successfully!');
//   } catch (error) {
//     console.error('Production seed failed:', error);
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// main();
