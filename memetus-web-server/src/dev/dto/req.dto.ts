import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateActivityReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '66b1d4614a39afd5d4d194c2',
    required: true,
  })
  topicId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '0x123456',
    required: true,
  })
  userWallet: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 100,
    required: true,
  })
  poolIn: number;
}

export class BondingCurveTokenReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'BAKE01',
    required: true,
  })
  ticker: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'BAKE 01',
    required: true,
  })
  name: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description:
      'Honey: 0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03, NECT:0xf5AFCF50006944d17226978e594D4D25f4f92B40',
    example: '0x0E4aaF1351de4c0264C5c7056Ef3777b41BD8e03',
    required: true,
  })
  address: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 18,
    required: true,
  })
  decimals: number;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'EXPONENTIAL',
    required: true,
  })
  curveType: string;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 99,
    required: true,
  })
  stepCount: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 5_000,
    required: true,
  })
  maxSupply: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 1,
    required: true,
  })
  initialMintingPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @ApiProperty({
    example: 26,
    required: true,
  })
  finalMintingPrice: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 0,
    required: true,
  })
  creatorAllocation: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 3,
    required: true,
  })
  buyRoyalty: number;

  @IsNotEmpty()
  @IsInt()
  @ApiProperty({
    example: 3,
    required: true,
  })
  sellRoyalty: number;
}
