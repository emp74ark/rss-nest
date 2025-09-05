import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import session from 'express-session';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MongooseExceptionFilter } from './filters/mongoose-exception.filter';
import { appConfig } from './config/dotenv';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, { logger });

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
