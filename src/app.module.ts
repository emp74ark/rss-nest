import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UserModule } from './user/user.module';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { SharedModule } from './shared/shared.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { ArticleModule } from './article/article.module';
import { TagModule } from './tag/tag.module';
import packageJson from './config/packageJson';
import { appConfig } from './config/dotenv';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [packageJson] }),
    MongooseModule.forRoot(appConfig.db),
    UserModule,
    AuthModule,
    SharedModule,
    SubscriptionModule,
    ArticleModule,
    TagModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
