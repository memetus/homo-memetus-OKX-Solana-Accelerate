import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class FundIdReqDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    example: '6791cf58170fb2a83ce97f72',
    description: 'fundId',
    required: true,
  })
  fundId: string;
}

export class VectorSearchDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Invest in trending memecoins',
    required: true,
  })
  query: string;
}
