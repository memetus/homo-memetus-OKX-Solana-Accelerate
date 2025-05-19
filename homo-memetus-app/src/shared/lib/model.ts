import { ChatOpenAI } from '@langchain/openai';
import {
  AIMessage,
  BaseMessage,
  SystemMessage,
} from '@langchain/core/messages';
import {
  Annotation,
  END,
  MemorySaver,
  messagesStateReducer,
  START,
  StateGraph,
} from '@langchain/langgraph';
import { promptAgentTemplate } from '@/shared/constants/agent';

export const createModel = ({ modelId }: { modelId: string }) => {
  const apiKey = `${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`;
  const memory = new MemorySaver();
  const state = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: messagesStateReducer,
    }),
  });

  const workflow = new StateGraph(state);

  const model = new ChatOpenAI({
    apiKey,
    model: modelId,
    temperature: 0,
  });

  type State = typeof state.State;

  const getLLMResponse = async (state: State) => {
    try {
      const messages = [
        new SystemMessage(promptAgentTemplate),
        ...state.messages,
      ];
      const response = await model.invoke(messages);

      return {
        messages: [new AIMessage(response)],
      };
    } catch (err) {
      throw new Error(err as string);
    }
  };

  workflow.addNode('getLLMResponse', getLLMResponse);
  workflow.addEdge(START, 'getLLMResponse' as any);
  workflow.addEdge('getLLMResponse' as any, END);

  const graph = workflow.compile({ checkpointer: memory });

  return {
    model,
    workflow,
    graph,
    state,
    memory,
  };
};
