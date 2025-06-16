import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';
import { SourceSubscription } from './subscription.schema';
import { Role } from '../shared/enums';

export type UserDocument = HydratedDocument<User>;

@Schema()
export class User {
  @Prop({ required: true, unique: true })
  login: string;

  @Prop({ required: true, select: false })
  password: string;

  @Prop({ default: Role.User })
  role: Role;

  @Prop({
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Subscription',
    default: [],
  })
  subscriptions: SourceSubscription[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  modifiedAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.pre('findOneAndUpdate', function (next) {
  this.set({ modifiedAt: new Date() });
  next();
});
