import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: true,
    credentials: true,
  });

  // Serve static uploads folder
  app.use('/uploads', express.static(join(process.cwd(), 'uploads')));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Plateforme de Crowdfunding API')
    .setDescription('API pour la gestion des campagnes de crowdfunding')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Auth', 'Authentification et gestion des utilisateurs')
    .addTag('Users', 'Gestion des profils utilisateurs')
    .addTag('Categories', 'Gestion des catégories')
    .addTag('Campaigns', 'Gestion des campagnes')
    .addTag('Donations', 'Gestion des dons')
    .addTag('Bank Info', 'Gestion des informations bancaires')
    .addTag('Withdrawal Requests', 'Gestion des demandes de retrait')
    .addTag('Statistics', 'Statistiques et analytics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 4750;
  await app.listen(port);
  console.log(`🚀 Application running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/api/docs`);
}
bootstrap();