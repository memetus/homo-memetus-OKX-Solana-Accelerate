import { Controller, Get, Param } from '@nestjs/common';
import { TokenService } from './token.service';
import { ApiTags } from '@nestjs/swagger';
import { TokenAddressReqDto } from 'src/common/dto/req.dto';
import { Public } from 'src/common/decorator/public.decorator';

@ApiTags('Token')
@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

  @Public()
  @Get('meta-data/:tokenAddress')
  getTokenMetadata(@Param() { tokenAddress }: TokenAddressReqDto) {
    return this.tokenService.getTokenMetadata(tokenAddress);
  }
}
