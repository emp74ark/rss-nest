import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { AppModule } from './app.module';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import MongoStore from 'connect-mongo';
import { Logger, ValidationPipe } from '@nestjs/common';
import { MongooseExceptionFilter } from './filters/mongoose-exception.filter';
import { appConfig } from './config/dotenv';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  logger.log(
    `Starting application with Fastify in ${appConfig.production ? 'production' : 'development'} mode`,
  );

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
    { logger },
  );

  const sessionTtl = 1000 * 60 * 60 * 24 * 7; // 7 days in ms

  await app.register(fastifyCookie);
  await app.register(fastifySession, {
    secret: appConfig.secret,
    store: MongoStore.create({
      mongoUrl: appConfig.db,
      ttl: sessionTtl / 1000, // connect-mongo expects seconds
      autoRemove: 'interval',
      autoRemoveInterval: 10,
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: sessionTtl,
      secure: appConfig.production,
    },
    saveUninitialized: false,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  app.useGlobalFilters(new MongooseExceptionFilter());

  const origins = [appConfig.webClient, appConfig.corsEnabled].filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  logger.log(`Whitelist origins: ${origins.join(', ')}`);

  await app.listen(appConfig.port, '0.0.0.0');
}

void bootstrap();
