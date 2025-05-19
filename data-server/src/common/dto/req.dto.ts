import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UserIdReqDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    example: '676e674ccf22e1d3ed0155e2',
    description: 'userId',
    required: false,
  })
  userId?: string;
}

export class StrategyIdReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '676f268b3461e14ee8459d2d',
    description: 'commentId',
    required: true,
  })
  strategyId: string;
}

export class PageReqDto {
  @ApiPropertyOptional({
    example: 1,
  })
  @Transform((Param) => Number(Param.value))
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({
    example: 10,
  })
  @Transform((Param) => Number(Param.value))
  @IsInt()
  pageSize?: number = 10;
}

export class GptStrategyIdReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '677fc00b3fa441d367612545',
    description: 'gptStrategyId',
    required: true,
  })
  gptStrategyId: string;
}
