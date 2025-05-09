import Debug from 'debug';
import { IChatContext, IChatRequestMessage } from 'intellichat/types';
import OllamaReader from 'intellichat/readers/OllamaChatReader';
import { ITool } from 'intellichat/readers/IChatReader';
import { urlJoin } from 'utils/util';
import OpenAIChatService from './OpenAIChatService';
import INextChatService from './INextCharService';
import Ollama from '../../providers/Ollama';

const debug = Debug('5ire:intellichat:OllamaChatService');
export default class OllamaChatService
  extends OpenAIChatService
  implements INextChatService
{
  constructor(name:string, context: IChatContext) {
    super(name, context);
    this.provider = Ollama;
  }

  protected getSystemRoleName(): string {
    return 'system';
  }

  protected getReaderType() {
    return OllamaReader;
  }

  protected makeToolMessages(
    tool: ITool,
    toolResult: any,
  ): IChatRequestMessage[] {
    return [
      {
        role: 'assistant',
        tool_calls: [
          {
            id: tool.id,
            type: 'function',
            function: {
              arguments: tool.args, // unlike openai, ollama tool args is not a string
              name: tool.name,
            },
          },
        ],
      },
      {
        role: 'tool',
        name: tool.name,
        content:
          typeof toolResult === 'string' ? toolResult : toolResult.content,
        tool_call_id: tool.id,
      },
    ];
  }

  protected async makeRequest(
    messages: IChatRequestMessage[],
    msgId?: string,
  ): Promise<Response> {
    const payload = await this.makePayload(messages, msgId);
    debug('Send Request, payload:\r\n', payload);
    const provider = this.context.getProvider();
    const url = urlJoin('/api/chat', provider.apiBase.trim());
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: this.abortController.signal,
    });
    return response;
  }
}
