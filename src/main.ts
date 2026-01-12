import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { useMetrex } from 'metrex';
import type { Express } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Metrex (HTTP metrics + dashboard)
  // Mounts outside the /api prefix so it is available at /metrex
  // Optional basic auth:
  //   METREX_USERNAME=admin
  //   METREX_PASSWORD=supersecret
  const metrexUsername = process.env.METREX_USERNAME;
  const metrexPassword = process.env.METREX_PASSWORD;
  const routePath = process.env.METREX_ROUTE_PATH ?? '/metrex';

  const escapedRoutePath = routePath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const metrexRouteRegex = new RegExp(`^${escapedRoutePath}(\\/|$)`);

  useMetrex(app.getHttpAdapter().getInstance() as Express, {
    routePath,
    excludePaths: [metrexRouteRegex],
    ...(metrexUsername && metrexPassword
      ? {
          auth: {
            username: metrexUsername,
            password: metrexPassword,
          },
        }
      : {}),
  });

  app.enableCors();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Rest API')
    .setDescription('Teslo Shop Endpoints')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
