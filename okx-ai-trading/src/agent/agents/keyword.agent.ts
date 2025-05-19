import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Scraper } from 'agent-twitter-client';
import { SearchMode } from 'agent-twitter-client';

@Injectable()
export class KeywordAgent {
  private scraper: Scraper;

  constructor(private readonly configService: ConfigService) {
    this.initialize();
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
        return;
      } catch (error) {
        console.error(`Twitter login retry ${i + 1} failed:`, error);
      }
    }
  }

  async getTweets(username: string, limit = 30) {
    try {
      const tweets = [];
      for await (const tweet of this.scraper.getTweets(username, limit)) {
        tweets.push({
          text: tweet.text,
          username: tweet.username,
          createdAt: tweet.timeParsed,
        });
      }
      return tweets;
    } catch (error) {
      console.error('Error fetching tweets:', error);
      throw error;
    }
  }

  async searchTweets(query: string, limit = 10, mode = SearchMode.Latest) {
    try {
      const tweets = [];
      for await (const tweet of this.scraper.searchTweets(query, limit, mode)) {
        tweets.push({
          text: tweet.text,
          username: tweet.username,
          createdAt: tweet.timeParsed,
        });
      }
      return tweets;
    } catch (error) {
      console.error('Error searching tweets:', error);
      throw error;
    }
  }

  async getUserProfile(username: string) {
    try {
      return await this.scraper.getProfile(username);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  }
}
