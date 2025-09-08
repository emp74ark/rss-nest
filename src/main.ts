import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MongooseExceptionFilter } from './filters/mongoose-exception.filter';
import { appConfig } from './config/dotenv';
import { CookieOptions } from 'express';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log(
    `Starting application in ${appConfig.production ? 'production' : 'development'} mode`,
  );
  const app = await NestFactory.create(AppModule, { logger });

  const sessionTtl = 1000 * 60 * 60 * 24 * 7;

  const cookieOptions: CookieOptions = {
    httpOnly: appConfig.production,
    sameSite: 'lax',
    maxAge: sessionTtl,
  };

  logger.log(`Cookie options: ${JSON.stringify(cookieOptions)}`);

  app.use(
    session({
      secret: appConfig.secret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: appConfig.db,
        ttl: sessionTtl,
        autoRemove: 'interval',
        autoRemoveInterval: 10,
      }),
      cookie: cookieOptions,
      name: appConfig.cookieName,
    }),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new MongooseExceptionFilter());

  const origins = [appConfig.webClient, appConfig.corsEnabled];

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  logger.log(`Whitelist origins: ${origins.join(', ')}`);

  await app.listen(appConfig.port);
}

bootstrap();
