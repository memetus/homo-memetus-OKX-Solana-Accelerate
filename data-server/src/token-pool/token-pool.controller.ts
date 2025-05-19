import { Controller, Get } from '@nestjs/common';
import { TokenPoolService } from './token-pool.service';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('token-pool')
@Controller('token-pool')
export class TokenPoolController {
  constructor(private readonly tokenPoolService: TokenPoolService) {}

  @Get('trending-tokens')
  getTrendingTokens() {
    return this.tokenPoolService.getTrendingTokens();
  }
}
