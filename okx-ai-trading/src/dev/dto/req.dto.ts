import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class QueryReqDto {
  @ApiProperty({
    description: 'Query string to search',
    example: 'defi category, small cap',
  })
  @IsString()
  @IsNotEmpty()
  query: string;
}
