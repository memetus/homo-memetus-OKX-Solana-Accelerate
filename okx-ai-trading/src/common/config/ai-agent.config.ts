import { registerAs } from '@nestjs/config';

export default registerAs('ai-agent', async () => {
  return {
    openai: process.env.OPENAI_API_KEY,
    dataService: process.env.DATA_SERVICE_KEY,
    coinGeckoService: process.env.COIN_GECKO_API_KEY,
    rpcUrl: process.env.RPC_URL,
    solanaKey: process.env.SOLANA_PRIVATE_KEY,

    xUsername: process.env.TWITTER_USERNAME,
    xPassword: process.env.TWITTER_PASSWORD,
    xEmail: process.env.TWITTER_EMAIL,
    xApiKey: process.env.TWITTER_API_KEY,
    xApiSecret: process.env.TWITTER_API_SECRET_KEY,
    xAccessToken: process.env.TWITTER_ACCESS_TOKEN,
    xAccessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
  };
});
