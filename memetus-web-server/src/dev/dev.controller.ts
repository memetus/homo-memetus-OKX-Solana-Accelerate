import { Controller, Delete, Param } from '@nestjs/common';
import { DevService } from './dev.service';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { StrategyIdReqDto, UserIdReqDto } from 'src/common/dto/req.dto';

@ApiTags('Dev')
@Controller('api/dev')
export class DevController {
  constructor(private readonly devService: DevService) {}

  @ApiBearerAuth()
  @Delete('user/:userId')
  deleteUser(@Param() { userId }: UserIdReqDto) {
    return this.devService.deleteUser(userId);
  }

  @ApiBearerAuth()
  @Delete('strategy/:strategyId')
  deleteStrategy(@Param() { strategyId }: StrategyIdReqDto) {
    return this.devService.deleteStrategy(strategyId);
  }
}
