import { getProviders } from 'providers';
import { IChatProviderConfig, IServiceProvider } from 'providers/types';
import { genDefaultName } from 'utils/util';
import { create } from 'zustand';

const builtInToConfig = () => {
  const config: { [key: string]: IChatProviderConfig } = {};
  const builtInProviders = getProviders();
  Object.keys(builtInProviders).forEach((key) => {
    const provider = builtInProviders[key];
    config[key] = {
      name: key,
      apiBase: provider.apiBase,
      currency: provider.currency,
      apiKey: provider.apiKey || '',
      isDefault: false, // TODO
      isPremium: provider.isPremium || false,
      disabled: false, // TODO
      isBuiltIn: true,
      modelsEndpoint: provider.options.modelsEndpoint || null,
      models: {},
    };
    Object.keys(provider.chat.models).forEach((modelKey) => {
      const model = provider.chat.models[modelKey];
      config[key].models[modelKey] = {
        ...model,
        name: modelKey,
        label: model.label || modelKey,
        isDefault: false, // TODO
        isBuiltIn: true,
        isPremium: provider.isPremium,
        disabled: false, // TODO
        capabilities: model.capabilities || {},
      };
    });
  });
  return config;
};

export interface IProviderStore {
  provider: IChatProviderConfig | null;
  providers: { [key: string]: IChatProviderConfig };
  setProvider: (providerName: string | null) => IChatProviderConfig | null;
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
  createProvider: (providerName = 'Untitled') => {
    const names = Object.keys(get().providers);
    const newProviderName = genDefaultName(names, providerName);
    set((state: IProviderStore) => {
      const newProvider = {
        name: newProviderName,
        apiBase: '',
        currency: 'USD',
        apiKey: '',
        isDefault: false,
        isPremium: false,
        isBuiltIn: false,
        models: {},
        disabled: false,
      } as IChatProviderConfig;
      return {
        providers: {
          ...state.providers,
          [newProviderName]: newProvider,
        },
        provider: newProvider,
      };
    });
  },
}));

export default useProviderStore;
