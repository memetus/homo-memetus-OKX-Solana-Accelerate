import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type FundDataDocument = FundData & mongoose.Document;

@Schema({ timestamps: true })
export class FundData {
  @Prop()
  name: string;

  @Prop()
  symbol: string;

  @Prop()
  address: string;

  @Prop()
  imageUrl: string;

  @Prop()
  initialBalance: number;

  @Prop()
  balance: number;

  @Prop()
  strategyPrompt: string;

  @Prop({
    type: [
      {
        symbol: { type: String, required: true },
        address: { type: String, required: true },
        amount: { type: Number, required: true },
        allocation: { type: Number, required: true },
        tradingAmount: { type: Number, required: true },
        totalPnL: { type: Number, required: true },
        realizedProfit: { type: Number, required: true },
        unrealizedProfit: { type: Number, required: true },
        nav: { type: Number, required: true },
      },
    ],
    default: [],
  })
  portfolio: Array<{
    symbol: string;
    address: string;
    amount: number;
    allocation: number;
    tradingAmount: number;
    totalPnL: number;
    realizedProfit: number;
    unrealizedProfit: number;
    nav: number;
  }>;

  @Prop()
  nav: number;

  @Prop()
  realizedProfit: number;

  @Prop()
  unrealizedProfit: number;

  @Prop()
  totalPnL: number;

  @Prop()
  realTrading: boolean;

  @Prop()
  generation: number;

  @Prop()
  offspring: string[];

  @Prop()
  survived: boolean;

  @Prop({
    type: [
      {
        value: { type: Number, required: true },
        timestamp: { type: Date, required: true },
      },
    ],
    default: [],
  })
  totalPnLHistory: Array<{
    value: number;
    timestamp: Date;
  }>;

  @Prop()
  createdAt: Date;
}

export const FundDataSchema = SchemaFactory.createForClass(FundData);
