import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Article } from './article.schema';

@Schema({ _id: false })
class FeedSettings {
  @Prop({ default: false })
  enabled: boolean;
}

const SettingsSchema = SchemaFactory.createForClass(FeedSettings);

export type FeedDocument = HydratedDocument<SourceFeed>;

@Schema()
export class SourceFeed {
  @Prop({ type: mongoose.Schema.ObjectId, ref: 'users', required: true })
  userId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description: string;

  @Prop({ required: true })
  link: string;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'articles',
    default: [],
  })
  articles: Article[];

  @Prop()
  lastUpdate: Date;

  @Prop({ type: SettingsSchema })
  settings: FeedSettings;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  modifiedAt: Date;
}

export const FeedSchema = SchemaFactory.createForClass(SourceFeed);

FeedSchema.pre('findOneAndUpdate', function (next) {
  this.set({ modifiedAt: new Date() });
  next();
});
