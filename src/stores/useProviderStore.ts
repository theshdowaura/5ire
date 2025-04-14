import { find } from 'lodash';
import { getProviders } from 'providers';
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { genDefaultName } from 'utils/util';
import { create } from 'zustand';
import OpenAI from 'providers/OpenAI';

const builtInToConfig = () => {
  const config: { [key: string]: IChatProviderConfig } = {};
  const builtInProviders = getProviders();
  Object.keys(builtInProviders).forEach((key) => {
    const provider = builtInProviders[key];
    config[key] = {
      name: key,
      apiBase: provider.apiBase,
      temperature: provider.chat.temperature,
      topP: provider.chat.topP,
      presencePenalty: provider.chat.presencePenalty,
      currency: provider.currency,
      apiKey: provider.apiKey || '',
      isDefault: false, // TODO
      isPremium: provider.isPremium || false,
      disabled: false, // TODO
      isBuiltIn: true,
      modelsEndpoint: provider.options.modelsEndpoint,
      models: provider.chat.models.map((model) => ({
        name: model.name,
        label: model.label || model.name,
        contextWindow: model.contextWindow,
        maxTokens: model.maxTokens,
        defaultMaxTokens: model.defaultMaxTokens,
        inputPrice: model.inputPrice,
        outputPrice: model.outputPrice,
        description: model.description || null,
        isDefault: model.isDefault || false,
        isBuiltIn: true,
        isPremium: provider.isPremium,
        disabled: false, // TODO
        capabilities: model.capabilities || {},
        // extras: model.extras || {},
      })),
    };
  });
  return config;
};

export interface IProviderStore {
  provider: IChatProviderConfig | null;
  providers: { [key: string]: IChatProviderConfig };
  isProviderReady: (provider: IChatProviderConfig) => boolean;
  hasValidModels: (provider: IChatProviderConfig) => boolean;
  getProvidersWithModels: () => IChatProviderConfig[];
  setProvider: (providerName: string | null) => IChatProviderConfig | null;
  getAvailableProvider: (providerName: string) => IChatProviderConfig;
  getAvailableModel: (
    providerName: string,
    modelName: string,
  ) => IChatModelConfig;
  getGroupedModelOptions: () => {
    [key: string]: { label: string; value: string }[];
  };
  createProvider: (providerName?: string) => void;
}

const useProviderStore = create<IProviderStore>((set, get) => ({
  providers: {
    ...builtInToConfig(),
  },
  provider: null,
  setProvider: (providerName: string | null) => {
    if (!providerName) {
      set({ provider: null });
      return null;
    }
    const provider = get().providers[providerName];
    set({ provider });
    return provider;
  },
  isProviderReady: (provider: IChatProviderConfig) => {
    if (!provider.apiBase) {
      return false;
    }
    if (!provider.apiKey) {
      return false;
    }
    try {
      const url = new URL(provider.apiBase);
      return ['http:', 'https:'].includes(url.protocol);
    } catch {
      return false;
    }
  },
  hasValidModels: (provider: IChatProviderConfig) => {
    let models = Object.values(provider.models || {});
    if (models.length === 0) return false;
    const extraKeys = Object.keys(provider.modelExtras || {});
    if (extraKeys.length > 0) {
      models = models.filter((model) => {
        return extraKeys.every((key: string) => {
          return model.extras?.[key] || '' !== '';
        });
      });
    }
    return models.length > 0;
  },
  getProvidersWithModels: () => {
    const { providers } = get();
    return Object.values(providers).filter((p) => {
      return p.models.length > 0;
    });
  },
  getAvailableProvider: (providerName: string) => {
    const { getProvidersWithModels } = get();
    const providers = getProvidersWithModels();
    return find(providers, { isDefault: true }) || providers[0];
  },
  createProvider: (providerName = 'Untitled') => {
    const names = Object.keys(get().providers);
    const defaultName = genDefaultName(names, providerName);
    set((state: IProviderStore) => {
      const newProvider = {
        name: defaultName,
        apiBase: '',
        temperature: OpenAI.chat.temperature,
        topP: OpenAI.chat.topP,
        presencePenalty: OpenAI.chat.presencePenalty,
        currency: 'USD',
        apiKey: '',
        isDefault: false,
        isPremium: false,
        isBuiltIn: false,
        models: [],
        disabled: false,
      } as IChatProviderConfig;
      return {
        providers: {
          ...state.providers,
          [defaultName]: newProvider,
        },
        provider: newProvider,
      };
    });
  },
  getAvailableModel: (providerName: string, modelName: string) => {
    const { getAvailableProvider } = get();
    const provider = getAvailableProvider(providerName);
    return find(provider.models, { name: modelName }) || provider.models[0];
  },
  getGroupedModelOptions: () => {
    const { getProvidersWithModels } = get();
    const result: { [key: string]: { label: string; value: string }[] } = {};
    const providers = getProvidersWithModels();
    providers.forEach((provider) => {
      result[provider.name] = provider.models.map(
        (model) =>
          ({
            label: model.label || model.name,
            value: model.name,
          }) as { label: string; value: string },
      );
    });
    return result;
  },
}));

export default useProviderStore;
