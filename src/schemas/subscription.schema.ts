import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { Article } from './article.schema';

@Schema({ _id: false })
class SubscriptionSettings {
  @Prop({ default: false })
  enabled: boolean;

  @Prop({ default: false })
  loadFullText: boolean;
}

const SettingsSchema = SchemaFactory.createForClass(SubscriptionSettings);

export type SubscriptionDocument = HydratedDocument<SourceSubscription>;

@Schema()
export class SourceSubscription {
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
  settings: SubscriptionSettings;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  modifiedAt: Date;
}

export const SubscriptionSchema =
  SchemaFactory.createForClass(SourceSubscription);

SubscriptionSchema.pre('findOneAndUpdate', function (next) {
  this.set({ modifiedAt: new Date() });
  next();
});
