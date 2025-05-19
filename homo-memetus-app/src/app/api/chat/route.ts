import { promptAgentTemplate } from '@/shared/constants/agent';
import { createModel } from '@/shared/lib/model';
import { ConversationType } from '@/shared/types/data/conversation.type';
import {
  AIMessage,
  HumanMessage,
  SystemMessage,
} from '@langchain/core/messages';
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';

async function getResponse(req: NextRequest): Promise<NextResponse> {
  const { conversations, threadId } = await req.json();
  try {
    const { graph, memory } = createModel({
      modelId: `${process.env.NEXT_PUBLIC_MARKET_ANALYSIS_MODEL_ID}`,
    });

    const tid = threadId ?? uuidv4();

    const cs = conversations.map((c: ConversationType) => {
      if (c.type === 'user') return new HumanMessage(c.content);
      else if (c.type === 'assistant') return new AIMessage(c.content);
    });

    const res = await graph.invoke(
      { messages: [new SystemMessage(promptAgentTemplate), ...cs] },
      {
        configurable: {
          thread_id: tid,
        },
      },
    );

    const lastMessage = res.messages[res.messages.length - 1];
    return NextResponse.json({ message: lastMessage.content, threadId: tid });
  } catch (err) {
    console.log(err);
    return NextResponse.json({ error: err as string });
  }
}

export async function POST(req: NextRequest): Promise<Response> {
  return getResponse(req);
}

export const dynamic = 'force-dynamic';
