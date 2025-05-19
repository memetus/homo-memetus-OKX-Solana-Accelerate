import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateSwapDto {
  @ApiProperty({ description: 'Amount to swap' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'From token address' })
  @IsString()
  fromTokenAddress: string;

  @ApiProperty({ description: 'To token address' })
  @IsString()
  toTokenAddress: string;

  @ApiProperty({ description: 'Slippage percentage', required: false })
  @IsNumber()
  @IsOptional()
  slippage?: number = 0.2;
}

export class ParseSignatureDto {
  @IsString()
  @IsNotEmpty()
  signature: string;
}
