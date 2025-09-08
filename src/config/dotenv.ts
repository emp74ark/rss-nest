import * as dotenv from 'dotenv';
import * as process from 'node:process';

dotenv.config();

export const appConfig = {
  production: process.env.NODE_ENV === 'production',
  secret: process.env.AUTH_SECRET || 'secret',
  cookieName: process.env.COOKIE_NAME || 'connect.sid',
  port: process.env.PORT || '3600',
  webClient: process.env.WEB_CLIENT || 'http://localhost:4200',
  db: process.env.DB_HOST || 'mongodb://rss-db/rss',
  corsEnabled: process.env.CORS_ENABLED,
  orphanedUser: Number(process.env.ORPHANED_USER) || 2,
};
