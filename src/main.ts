import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'node:process';
import * as dotenv from 'dotenv';
import * as session from 'express-session';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  dotenv.config();

  app.use(
    session({
      secret: process.env.AUTH_SECRET || 'secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
      },
      name: 'connect.sid',
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3600);
}

bootstrap();
