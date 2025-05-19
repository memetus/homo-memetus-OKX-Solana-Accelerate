import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateEmbeddingDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'coinPrice',
    description: 'coinPrice, coinData',
    required: true,
  })
  type: string;
}
