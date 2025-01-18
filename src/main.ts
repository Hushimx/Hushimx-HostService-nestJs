import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { ClientModule } from './client/client.module';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './admin/auth/auth.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Automatically strip properties that are not in the DTO
    }),
  );

  
  // Enable CORS
  app.enableCors({
    origin: 'http://127.0.0.1:3000', // Adjust the origin if necessary
    methods: 'GET,POST,PATCH,PUT,DELETE,OPTIONS',
    allowedHeaders: 'Content-Type, Authorization, X-XSRF-TOKEN',
    credentials: true,
  });

  // Swagger Configuration
  const config = new DocumentBuilder()
    .setTitle('HostService API Documentation')
    .setDescription('API Documentation for Admin and Client endpoints')
    .setVersion('1.0')
    .addBearerAuth() // if you are using JWT or other authentication strategies
    .build();

  // Create the Swagger document
  const document = SwaggerModule.createDocument(app, config, {
    include: [AdminModule,AuthModule], // Include Admin and Client modules in the Swagger UI
  });

  // Setup Swagger UI at the /api route
  SwaggerModule.setup('api', app, document);

  // Enable cookie parsing for authentication tokens (if needed)
  app.use(cookieParser());

  await app.listen(3333);
}
bootstrap();
