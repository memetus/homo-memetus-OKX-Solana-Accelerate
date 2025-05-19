/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.API_BASE_URL,
    NEXT_PUBLIC_WEBSOCKET_URL: process.env.WEBSOCKET_BASE_URL,
    NEXT_PUBLIC_GOOGLE_ANALYTICS_ID: process.env.GOOGLE_ANALYTICS_ID,
    NEXT_PUBLIC_MARKET_ANALYSIS_MODEL_ID: process.env.MARKET_ANALYSIS_MODEL_ID,
    NEXT_PUBLIC_SENTIMENT_ANALYSIS_MODEL_ID:
      process.env.SENTIMENT_ANALYSIS_MODEL_ID,
    NEXT_PUBLIC_OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    NEXT_PUBLIC_INSTANTNODE_API_KEY: process.env.INSTANTNODE_API_KEY,
    NEXT_PUBLIC_HELIUS_API_KEY: process.env.HELIUS_API_KEY,
    NEXT_PUBLIC_QUICKNODE_API_KEY: process.env.QUICKNODE_API_KEY,
    NEXT_PUBLIC_REAL_AGENT_ID: process.env.REAL_AGENT_ID,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.svg$/i,
      use: ['@svgr/webpack'],
    });
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    return config;
  },
  images: {
    domains: ['dev-memetus-s3.s3.ap-northeast-2.amazonaws.com'],
  },
  async headers() {
    return [
      {
        source: '/usports/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          {
            key: 'Access-Control-Allow-Methods',
            value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
          },
          {
            key: 'Access-Control-Expose-Headers',
            value: '*',
          },
          {
            key: 'Access-Control-Allow-Headers',
            value:
              'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
          },
        ],
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: '/api/users/login',
        destination: `${process.env.API_BASE_URL}/api/users/login`,
      },
      {
        source: '/api/users/detail',
        destination: `${process.env.API_BASE_URL}/api/users/detail`,
      },
      {
        source: '/api/strategy',
        destination: `${process.env.API_BASE_URL}/api/strategy`,
      },
      {
        source: '/api/strategy/all',
        has: [
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/api/strategy/all?page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/strategy/detail/:id',
        destination: `${process.env.API_BASE_URL}/api/strategy/detail/:id`,
      },
      {
        source: '/api/chat',
        destination: `${process.env.API_BASE_URL}/api/chat`,
      },
      {
        source: '/prompt-gpt/post',
        destination: `${process.env.API_BASE_URL}/prompt-gpt/post`,
      },
      {
        source: '/prompt-gpt/prompt-number',
        destination: `${process.env.API_BASE_URL}/prompt-gpt/prompt-number`,
      },
      {
        source: '/prompt-gpt/count',
        destination: `${process.env.API_BASE_URL}/prompt-gpt/count`,
      },
      {
        source: '/api/cookie',
        destination: `${process.env.API_BASE_URL}/api/cookie`,
      },
      {
        source: '/api/agent-data/agent-dashboard',
        has: [
          {
            type: 'query',
            key: 'sortOrder',
            value: '(?<sortOrder>.*)',
          },
          {
            type: 'query',
            key: 'sort',
            value: '(?<sort>.*)',
          },
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard?sortOrder=:sortOrder&sort=:sort&page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/agent-data/agent-metadata/:id',
        destination: `${process.env.API_BASE_URL}/agent-data/agent-metadata/:id`,
      },
      {
        source: '/api/agent-data/agent-stat/:id',
        destination: `${process.env.API_BASE_URL}/agent-data/agent-stat/:id`,
      },
      {
        source: '/api/agent-data/portfolio/activity/:id',
        has: [
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/portfolio/activity/:id?page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/agent-data/portfolio/holdings/:id',
        has: [
          {
            type: 'query',
            key: 'sortOrder',
            value: '(?<sortOrder>.*)',
          },
          {
            type: 'query',
            key: 'sort',
            value: '(?<sort>.*)',
          },
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/portfolio/holdings/:id?sort=:sort&sortOrder=:sortOrder&page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/agent-data/agent-dashboard',
        has: [
          {
            type: 'query',
            key: 'sortOrder',
            value: '(?<sortOrder>.*)',
          },
          {
            type: 'query',
            key: 'sort',
            value: '(?<sort>.*)',
          },
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard?sort=:sort&sortOrder=:sortOrder&page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/agent-data/agent-dashboard',
        has: [
          {
            type: 'query',
            key: 'sortOrder',
            value: '(?<sortOrder>.*)',
          },
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard?sortOrder=:sortOrder&page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/agent-data/agent-dashboard/bubble-chart',
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard/bubble-chart`,
      },
      {
        source: '/api/agent-data/agent-dashboard/top-pics',
        has: [
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard/top-pics?page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/agent-data/agent-dashboard/:id',
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard/:id`,
      },
      {
        source: '/api/agent-data/agent-dashboard/search',
        has: [
          {
            type: 'query',
            key: 'search',
            value: '(?<search>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard/search?search=:search`,
      },
      {
        source: '/api/agent-data/agent-dashboard/real-trading/top-pics',
        has: [
          {
            type: 'query',
            key: 'page',
            value: '(?<page>.*)',
          },
          {
            type: 'query',
            key: 'pageSize',
            value: '(?<pageSize>.*)',
          },
        ],
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard/real-trading/top-pics?page=:page&pageSize=:pageSize`,
      },
      {
        source: '/api/agent-data/agent-dashboard/real-trading/graph/:id',
        destination: `${process.env.API_BASE_URL}/agent-data/agent-dashboard/real-trading/graph/:id`,
      },
    ];
  },
};

export default nextConfig;
