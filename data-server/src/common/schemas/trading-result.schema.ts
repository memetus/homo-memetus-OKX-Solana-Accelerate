import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type TradingResultDocument = TradingResult & mongoose.Document;

@Schema({ timestamps: true })
export class TradingResult {
  @Prop()
  fundId: string;

  @Prop()
  name: string;

  @Prop()
  symbol: string;

  @Prop()
  address: string;

  @Prop()
  price: number;

  @Prop()
  amount: number;

  @Prop()
  analysis: string;

  @Prop()
  recommendation: string;

  @Prop()
  allocation: number;

  @Prop()
  tradingAmount: number;

  @Prop()
  createdAt: Date;
}

export const TradingResultSchema = SchemaFactory.createForClass(TradingResult);
