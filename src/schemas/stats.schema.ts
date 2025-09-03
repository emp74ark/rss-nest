import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type StatsDocument = HydratedDocument<Stats>;

@Schema()
export class Stats {
  @Prop({ required: true })
  source: string;

  @Prop()
  localTime: Date;

  @Prop()
  ip: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const StatsSchema = SchemaFactory.createForClass(Stats);
