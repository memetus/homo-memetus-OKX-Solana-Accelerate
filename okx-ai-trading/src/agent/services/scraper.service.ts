import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Scraper } from 'agent-twitter-client';

@Injectable()
export class ScraperService implements OnModuleInit {
  private scraper: Scraper;
  private isLoggedIn = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initialize();
  }

  async initialize() {
    try {
      this.scraper = new Scraper();
      await new Promise((resolve) => setTimeout(resolve, 2000));

      await this.scraper.login(
        this.configService.get<string>('ai-agent.xUsername'),
        this.configService.get<string>('ai-agent.xPassword'),
        this.configService.get<string>('ai-agent.xEmail'),
        this.configService.get<string>('ai-agent.xApiKey'),
        this.configService.get<string>('ai-agent.xApiSecret'),
        this.configService.get<string>('ai-agent.xAccessToken'),
        this.configService.get<string>('ai-agent.xAccessTokenSecret'),
      );
      this.isLoggedIn = true;
    } catch (error) {
      console.error('Error initializing Twitter scraper:', error);
      await this.retryLogin();
    }
  }

  private async retryLogin(retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        await this.scraper.login(
          this.configService.get<string>('ai-agent.xUsername'),
          this.configService.get<string>('ai-agent.xPassword'),
          this.configService.get<string>('ai-agent.xEmail'),
          this.configService.get<string>('ai-agent.xApiKey'),
          this.configService.get<string>('ai-agent.xApiSecret'),
          this.configService.get<string>('ai-agent.xAccessToken'),
          this.configService.get<string>('ai-agent.xAccessTokenSecret'),
        );
        this.isLoggedIn = true;
        return;
      } catch (error) {
        console.error(`Twitter login retry ${i + 1} failed:`, error);
      }
    }
  }

  getScraper(): Scraper {
    if (!this.isLoggedIn) {
      throw new Error('Scraper is not logged in');
    }
    return this.scraper;
  }

  isLoggedInStatus(): boolean {
    return this.isLoggedIn;
  }
}
