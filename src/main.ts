import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { ResponseInterceptor } from './auth/interceptors/response.interceptor';
import { HttpExceptionFilter } from './auth/filters/http-exception.filter';
import { NotFoundExceptionFilter } from './auth/filters/not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useStaticAssets(join(process.cwd(), 'public'));
  app.setBaseViewsDir(join(process.cwd(), 'views'));
  app.setViewEngine('ejs');

  app.enableCors({
    origin: [
      'http://localhost:3000',
      configService.get<string>('FE_ADMIN_URL'),
      configService.get<string>('BASE_URL'),
    ],
    credentials: true,
  });
  // Apply response interceptor globally
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));

  // Apply exception filter globally
  app.useGlobalFilters(new HttpExceptionFilter());

  // Apply not found filter globally
  app.useGlobalFilters(new NotFoundExceptionFilter());

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Grocademy API')
    .setDescription('The API documentation for the Grocademy application')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
bootstrap().catch((err) => console.error(err));
