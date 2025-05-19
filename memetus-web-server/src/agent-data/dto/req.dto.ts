import { ApiProperty } from '@nestjs/swagger';

export class SortQueryReqDto {
  @ApiProperty({
    required: false,
    description: 'realized, unrealized, totalPnL, nav, age',
    type: String,
  })
  sort?: string;
}

export class SortOrderReqDto {
  @ApiProperty({
    required: false,
    description: 'asc, desc',
    example: 'desc',
    type: String,
  })
  sortOrder?: string;
}

export class SearchReqDto {
  @ApiProperty({
    required: true,
    description: 'search',
    type: String,
  })
  search: string;
}
