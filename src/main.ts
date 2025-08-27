import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { ValidationPipe } from '@nestjs/common';
import { MongooseExceptionFilter } from './filters/mongoose-exception.filter';
import { appConfig } from './config/dotenv';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(
    session({
      secret: appConfig.secret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
      },
      name: appConfig.cookieName,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new MongooseExceptionFilter());

  app.enableCors({
    origin: [appConfig.webClient],
    credentials: true,
  });

  await app.listen(appConfig.port);
}

bootstrap();
