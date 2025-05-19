import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: '28M6FBrLrErhtRi1mCuSisbkH1C3mKgwcpvXmr4uLYey',
    required: true,
  })
  wallet: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Asia/Seoul',
    required: true,
  })
  timezone: string;
}
