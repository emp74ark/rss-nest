import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { SourceSubscription } from './subscription.schema';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  login: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'Subscription' })
  subscriptions: SourceSubscription[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  modifiedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
