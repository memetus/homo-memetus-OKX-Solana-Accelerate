import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { KeywordService } from './keyword.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateKolPoolDto, KolNameDto } from './dto/req.dto';

@ApiTags('keyword')
@Controller('keyword')
export class KeywordController {
  constructor(private readonly keywordService: KeywordService) {}

  @Get('list-tweets')
  @ApiOperation({ summary: 'get list tweets' })
  getListTweets() {
    return this.keywordService.getListTweets();
  }

  @Get('kol-symbol')
  @ApiOperation({ summary: 'get x post $symbol by KOL' })
  getKeywordByKol() {
    return this.keywordService.getKeywordByKol();
  }

  @Get('timeline-kol/:kolName')
  @ApiOperation({ summary: 'get timeline by kol' })
  getTimelineByKol(@Param() { kolName }: KolNameDto) {
    return this.keywordService.getTimelineByKol(kolName);
  }

  @Post('new-kol/:kolName')
  @ApiOperation({ summary: 'set new kol into kol pool' })
  setNewKolPool(
    @Param() { kolName }: KolNameDto,
    @Body() { categories }: CreateKolPoolDto,
  ) {
    return this.keywordService.setNewKolPool(kolName, categories);
  }

  @Get('profile-by-kol')
  @ApiOperation({ summary: 'get profile by kol' })
  getProfileByKol() {
    return this.keywordService.getProfileByKol();
  }

  @Get('profile/:kolName')
  @ApiOperation({ summary: 'Fetch individual KOL profile' })
  getProfile(@Param() { kolName }: KolNameDto) {
    return this.keywordService.getProfile(kolName);
  }

  @Get('category-by-twitter')
  @ApiOperation({ summary: 'get category by twitter' })
  getCategoryByTwitter() {
    return this.keywordService.getCategoryByTwitter();
  }
}
