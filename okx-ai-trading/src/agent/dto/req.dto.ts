import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryReqDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Find and analyze promising animal-themed coins.',
    description: 'Query',
    required: true,
  })
  query: string;
}
