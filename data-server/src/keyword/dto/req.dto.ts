import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class KolNameDto {
  @IsString()
  @ApiProperty({
    description: 'Name of the KOL',
    example: 'Defi0xJeff',
  })
  kolName: string;
}

export class CreateKolPoolDto {
  @IsArray()
  @IsString({ each: true })
  @ApiProperty({
    description: 'Category of the KOL',
    example: ['solana'],
  })
  categories: string[];
}
