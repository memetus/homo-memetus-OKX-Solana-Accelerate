import { Controller, Post, Body, Get } from '@nestjs/common';
import { PromptGptService } from './prompt-gpt.service';
import { CreatePromptGptDto } from './dto/req.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserAfterAuth } from 'src/common/decorator/user.decorator';

@ApiTags('PromptGpt')
@Controller('prompt-gpt')
export class PromptGptController {
  constructor(private readonly promptGptService: PromptGptService) {}

  @ApiBearerAuth()
  @Post('post')
  @ApiOperation({ summary: 'post user prompts and GPT answers' })
  create(@Body() data: CreatePromptGptDto, @User() user: UserAfterAuth) {
    return this.promptGptService.create(data, user.id);
  }

  @ApiBearerAuth()
  @Get('prompt-number')
  getPromptNumber(@User() user: UserAfterAuth) {
    return this.promptGptService.getPromptNumber(user.id);
  }

  @ApiBearerAuth()
  @Get('count')
  setCount(@User() user: UserAfterAuth) {
    return this.promptGptService.setCount(user.id);
  }
}
