import { Module } from '@nestjs/common';
import { EvolutionService } from './evolution.service';
import { EvolutionController } from './evolution.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FundDataSchema } from 'src/common/schemas/fund-data.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'FundData', schema: FundDataSchema }]),
  ],
  controllers: [EvolutionController],
  providers: [EvolutionService],
})
export class EvolutionModule {}
