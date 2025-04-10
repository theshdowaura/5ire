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
      cur.isBuiltin = true;
      if (!arg?.withDisabled && cur.disabled) return acc;
      if (!!session || !cur.isPremium) {
        acc[cur.name] = cur;
      }
      return acc;
    },
    {} as { [key: string]: IServiceProvider },
  );
}

export function getChatModels(providerName: ProviderType): IChatModel[] {
  const provider = getProvider(providerName);
  return Object.keys(provider.chat.models).map((name) => {
    const model = provider.chat.models[name];
    model.name = name;
    return model;
  });
}

export function getDefaultChatModel(provider: ProviderType): IChatModel {
  const models = getChatModels(provider);
  if (models.length === 0) return {} as IChatModel;
  const defaultModel = models.filter((m: IChatModel) => m.isDefault)[0];
  return defaultModel || models[0];
}

export function getChatModel(
  providerName: ProviderType,
  modelName: string,
  defaultModel: IChatModel = getDefaultChatModel(providerName),
): IChatModel {
  const $providers = getProviders();
  let provider = $providers[providerName];
  if (!provider) {
    provider = Object.values($providers)[0];
  }
  let model = provider.chat.models[modelName];
  if (!model) {
    model = defaultModel;
  } else {
    model.name = modelName;
  }
  return model;
}

export function getGroupedChatModelNames(): { [key: string]: string[] } {
  const result: { [key: string]: string[] } = {};
  Object.keys(providers).forEach((providerName: string) => {
    result[providerName] = getChatModels(providerName as ProviderType).map(
      (model) => model.label || (model.name as string),
    );
  });
  return result;
}
