import { registerAs } from '@nestjs/config';

export default registerAs('ai-agent', async () => {
  return {
    openai: process.env.OPENAI_API_KEY,
  };
});
