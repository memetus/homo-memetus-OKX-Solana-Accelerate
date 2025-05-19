import { DynamicStructuredTool } from '@langchain/core/tools';
import z, { ZodObject } from 'zod';

export type TavilyTool = DynamicStructuredTool<
  z.ZodObject<
    {
      query: z.ZodString;
    },
    'strip',
    z.ZodTypeAny,
    {
      query: string;
    },
    {
      query: string;
    }
  >
>;

export type SerpTool = DynamicStructuredTool<
  z.ZodObject<
    {
      query: z.ZodString;
    },
    'strip',
    z.ZodTypeAny,
    {
      query: string;
    },
    {
      query: string;
    }
  >
>;

export type PromptInstructionTool = DynamicStructuredTool<
  z.ZodObject<
    {
      strategy: z.ZodString;
      tokens: z.ZodArray<z.ZodString, 'many'>;
      conversations: z.ZodArray<z.ZodString, 'many'>;
    },
    'strip',
    z.ZodTypeAny,
    {
      strategy: string;
      tokens: string[];
      conversations: string[];
    }
  >
>;
