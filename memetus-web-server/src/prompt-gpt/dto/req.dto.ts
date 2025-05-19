import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePromptGptDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    example: 'Invest in trending memecoins',
    required: true,
  })
  prompt: string;
}
