import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type GptStrategyDocument = GptStrategy & mongoose.Document;

@Schema({ timestamps: true, versionKey: '_v' })
export class GptStrategy {
  @Prop()
  userWallet: string;

  @Prop()
  prompt: string;

  @Prop()
  gptResponse: string;

  @Prop()
  createdAt: Date;
}

export const GptStrategySchema = SchemaFactory.createForClass(GptStrategy);
