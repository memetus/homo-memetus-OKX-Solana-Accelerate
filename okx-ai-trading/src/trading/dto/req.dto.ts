import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  Min,
  Max,
} from 'class-validator';

export class CoinAnalysisDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Solaris AI',
    required: true,
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'SOLARIS',
    required: true,
  })
  symbol: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '3RfQPYVJgJbwyB3BzqqypCEWWryxjTfFDAcXQsckpump',
    required: true,
  })
  address: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'Mid-cap, AI agent with potential for growth.',
    required: true,
  })
  analysis: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: 'buy',
    required: true,
  })
  recommendation: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  @ApiProperty({
    example: 30,
    required: true,
  })
  allocation: number;
}

export class TradingAnalysisReqDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CoinAnalysisDto)
  @ApiProperty({
    type: [CoinAnalysisDto],
    example: [
      {
        name: 'Solaris AI',
        symbol: 'SOLARIS',
        address: '3RfQPYVJgJbwyB3BzqqypCEWWryxjTfFDAcXQsckpump',
        analysis: 'Mid-cap, AI agent with potential for growth.',
        recommendation: 'buy',
        allocation: 30,
      },
      {
        name: 'MAX',
        symbol: 'MAX',
        address: 'oraim8c9d1nkfuQk9EzGYEUGxqL3MHQYndRw1huVo5h',
        analysis: 'Large-cap, strong market momentum in AI agents.',
        recommendation: 'buy',
        allocation: 20,
      },
      {
        name: 'Homo Memetus',
        symbol: 'HOMO',
        address: '7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o',
        analysis: 'Small-cap, highly volatile within AI agents.',
        recommendation: 'buy',
        allocation: 10,
      },
    ],
  })
  coins: CoinAnalysisDto[];
}
