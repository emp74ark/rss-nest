import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ArticleDocument = HydratedDocument<Article>;

@Schema()
export class Article {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'users' })
  userId: string;

  @Prop({ type: mongoose.Types.ObjectId, ref: 'subscriptions' })
  subscriptionId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  creator: string;

  @Prop({ required: true })
  link: string;

  @Prop({ required: true })
  pubDate: string;

  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  contentSnippet: string;

  @Prop({ required: true })
  guid: string;

  @Prop()
  categories: string[];

  @Prop({ required: true })
  isoDate: Date;

  @Prop({ type: [mongoose.Types.ObjectId], ref: 'tags', default: [] })
  tags: string[];

  @Prop({ default: false })
  read: boolean;

  @Prop()
  fullText: string;
}

export const ArticleSchema = SchemaFactory.createForClass(Article);

ArticleSchema.pre('findOneAndUpdate', function (next) {
  this.set({ modifiedAt: new Date() });
  next();
});
