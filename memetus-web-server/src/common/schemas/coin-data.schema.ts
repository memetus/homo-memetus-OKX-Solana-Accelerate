import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';

export type CoinDataDocument = CoinData & mongoose.Document;

@Schema()
export class CoinData {
  @Prop()
  name: string;

  @Prop()
  symbol: string;

  @Prop()
  slug: string;

  @Prop()
  address: string;

  @Prop()
  category: string[];

  @Prop()
  description: string;

  @Prop()
  links: string[];

  @Prop({ type: Object })
  twitter: {
    official: string;
    operater: string;
  };

  @Prop({ type: [Number] })
  embedding?: number[];
}

export const CoinDataSchema = SchemaFactory.createForClass(CoinData);
