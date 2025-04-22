import Debug from 'debug';
import { IChatContext } from '../types';
import AnthropicChatService from './AnthropicChatService';
import AzureChatService from './AzureChatService';
import OllamaChatService from './OllamaChatService';
import LMStudioChatService from './LMStudioChatService';
import OpenAIChatService from './OpenAIChatService';
import GoogleChatService from './GoogleChatService';
import BaiduChatService from './BaiduChatService';
import ChatBroChatService from './ChatBroChatService';
import MoonshotChatService from './MoonshotChatService';
import MistralChatService from './MistralChatService';
import FireChatService from './FireChatService';
import DoubaoChatService from './DoubaoChatService';
import GrokChatService from './GrokChatService';
import DeepSeekChatService from './DeepSeekChatService';
import INextChatService from './INextCharService';

const debug = Debug('5ire:intellichat:service');

export default function createService(chatCtx: IChatContext): INextChatService {
  const provider = chatCtx.getProvider();
  debug('Create a service for provider: ', provider.name);
  switch (provider.name) {
    case 'Anthropic':
      return new AnthropicChatService(chatCtx);
    case 'OpenAI':
      return new OpenAIChatService(chatCtx);
    case 'Azure':
      return new AzureChatService(chatCtx);
    case 'Google':
      return new GoogleChatService(chatCtx);
    case 'Baidu':
      return new BaiduChatService(chatCtx);
    case 'Mistral':
      return new MistralChatService(chatCtx);
    case 'Moonshot':
      return new MoonshotChatService(chatCtx);
    case 'Ollama':
      return new OllamaChatService(chatCtx);
    case 'ChatBro':
      return new ChatBroChatService(chatCtx);
    case '5ire':
      return new FireChatService(chatCtx);
    case 'Doubao':
      return new DoubaoChatService(chatCtx);
    case 'Grok':
      return new GrokChatService(chatCtx);
    case 'DeepSeek':
      return new DeepSeekChatService(chatCtx);
    case 'LMStudio':
      return new LMStudioChatService(chatCtx);
    default:
      return new OpenAIChatService(chatCtx);
  }
}
