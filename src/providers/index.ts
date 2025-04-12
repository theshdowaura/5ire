import { IChatProviderConfig } from 'providers/types';
import useAuthStore from 'stores/useAuthStore';
import { ProviderType, IChatModel, IServiceProvider } from './types';
import Azure from './Azure';
import Baidu from './Baidu';
import OpenAI from './OpenAI';
import Google from './Google';
import Moonshot from './Moonshot';
import ChatBro from './ChatBro';
import Anthropic from './Anthropic';
import Fire from './Fire';
import Ollama from './Ollama';
import LMStudio from './LMStudio';
import Doubao from './Doubao';
import Grok from './Grok';
import DeepSeek from './DeepSeek';
import Mistral from './Mistral';

export const providers: { [key: string]: IServiceProvider } = {
  OpenAI,
  Anthropic,
  Azure,
  Google,
  Grok,
  Baidu,
  Mistral,
  Moonshot,
  ChatBro,
  Ollama,
  Doubao,
  DeepSeek,
  LMStudio,
  '5ire': Fire,
};

export function getProvider(providerName: ProviderType): IServiceProvider {
  return providers[providerName];
}

export function getProviders(arg?: { withDisabled: boolean }): {
  [key: string]: IServiceProvider;
} {
  const { session } = useAuthStore.getState();
  return Object.values(providers).reduce(
    (acc: { [key: string]: IServiceProvider }, cur: IServiceProvider) => {
      cur.isBuiltIn = true;
      if (!arg?.withDisabled && cur.disabled) return acc;
      if (!!session || !cur.isPremium) {
        acc[cur.name] = cur;
      }
      return acc;
    },
    {} as { [key: string]: IServiceProvider },
  );
}
