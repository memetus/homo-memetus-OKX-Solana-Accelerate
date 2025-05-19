import { Body, Controller, Post } from '@nestjs/common';
import { EvolutionService } from './evolution.service';
import { CreateAgentDto } from './dto/req.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('evolution')
@Controller('evolution')
export class EvolutionController {
  constructor(private readonly evolutionService: EvolutionService) {}

  @Post('create-agent')
  createAgent(@Body() createAgentDto: CreateAgentDto) {
    return this.evolutionService.createAgent(createAgentDto);
  }

  @Post('create-generation')
  createGeneration() {
    return this.evolutionService.createGeneration();
  }

  @Post('create-evolution')
  createEvolution() {
    return this.evolutionService.createEvolution();
  }
}
