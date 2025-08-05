import { Module } from '@nestjs/common';
import { TagService } from './tag.service';
import { TagController } from './tag.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { TagSchema } from '../schemas/tags.schema';

@Module({
  controllers: [TagController],
  providers: [TagService],
  imports: [MongooseModule.forFeature([{ name: 'Tag', schema: TagSchema }])],
})
export class TagModule {}
