import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsBoolean } from 'class-validator';

export class CreateAgentDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'test01',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'tst01',
    required: true,
  })
  symbol: string;

  @IsNumber()
  @ApiProperty({
    example: 1,
    required: true,
  })
  generation: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '7Uuzh9JwqF8z3u6MWpQuQJbpD1u46xPDY6PGjwfwTh4o',
    required: true,
  })
  address: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      'https://dev-memetus-s3.s3.ap-northeast-2.amazonaws.com/kol-image/gen2_token_3.png',
    required: true,
  })
  imageUrl: string;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    example: false,
    required: true,
  })
  survived: boolean;

  @IsNotEmpty()
  @IsBoolean()
  @ApiProperty({
    example: false,
    required: true,
  })
  realTrading: boolean;

  @IsNumber()
  @ApiProperty({
    example: 10000,
    required: true,
  })
  initialBalance: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example:
      'Analyze COIN, a small cap in the AI AGENT category, and invest in it in a trend-following manner.',
    required: true,
  })
  strategyPrompt: string;
}
