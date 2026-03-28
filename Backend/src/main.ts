import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import morgan from 'morgan';
import express from 'express';
import expressListEndpoints from 'express-list-endpoints';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ limit: '10mb', extended: true }));
  app.use(morgan('dev'));
  app.enableCors();
  app.setGlobalPrefix('api');

  // Swagger docs at /docs
  const config = new DocumentBuilder()
    .setTitle('NutriLife API')
    .setDescription('Backend API for the NutriLife nutrition tracking app')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'clerk-jwt',
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`\nNutriLife backend running on port ${port}`);
  console.log(`Swagger docs available at http://localhost:${port}/docs\n`);
  expressListEndpoints(app);
}
bootstrap();
