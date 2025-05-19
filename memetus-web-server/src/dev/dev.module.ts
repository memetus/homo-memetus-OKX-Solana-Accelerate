import { StrategySchema } from './../common/schemas/strategies.schema';
import { Module } from '@nestjs/common';
import { DevService } from './dev.service';
import { DevController } from './dev.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersSchema } from 'src/common/schemas/users.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Users', schema: UsersSchema },
      { name: 'Strategy', schema: StrategySchema },
    ]),
  ],
  controllers: [DevController],
  providers: [DevService],
})
export class DevModule {}
