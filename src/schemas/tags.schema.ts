import mongoose, { HydratedDocument } from 'mongoose';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TagDocument = HydratedDocument<Tag>;

@Schema()
export class Tag {
  @Prop({ type: mongoose.Types.ObjectId, ref: 'users' })
  userId: string;

  @Prop({ unique: true })
  name: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
