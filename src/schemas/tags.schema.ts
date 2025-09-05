import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'users' })
  userId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  modifiedAt: Date;
}

export const TagSchema = SchemaFactory.createForClass(Tag);

TagSchema.pre('findOneAndUpdate', function (next) {
  this.set({ modifiedAt: new Date() });
  next();
});
