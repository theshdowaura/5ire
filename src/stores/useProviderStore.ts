import { find, isNil, keyBy, omit } from 'lodash';
import { getProviders } from 'providers';
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { genDefaultName } from 'utils/util';
import { create } from 'zustand';
import OpenAI from 'providers/OpenAI';

const isProviderReady = (provider: IChatProviderConfig) => {
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
};

const isModelReady = (
  provider: IChatProviderConfig,
  model: IChatModelConfig,
) => {
  const extraKeys = Object.keys(provider.modelExtras || {});
  return extraKeys.every((key: string) => {
    return (
      !isNil(model.extras?.[key]) &&
      (model.extras?.[key] as string).trim() !== ''
    );
  });
};

export type ModelOption = {
  label: string;
  value: string;
  isReady: boolean;
  isDefault: boolean;
};

// for migrating settings from old version
const migrateSettings = () => {
  const settings = window.electron.store.get('settings');
  if (!settings.api) return;
  const providersSetting = window.electron.store.get('providers');
  const legacyDefaultProvider = settings.api.activeProvider;
  const legacyProviders = settings.api.providers;
  if (Object.keys(providersSetting).length === 0 && legacyProviders) {
    const newProviders = Object.keys(legacyProviders).reduce(
      (acc, key) => {
        const provider = legacyProviders[key];
        acc[key] = {
          name: key,
          description: provider.description,
          apiKey: provider.key,
          apiBase: provider.base,
          models: [],
          isBuiltIn: true,
          isDefault: key === legacyDefaultProvider,
        };
        return acc;
      },
      {} as { [key: string]: Partial<IChatProviderConfig> },
    );
    window.electron.store.set('providers', newProviders);
    const newSettings = { ...settings };
    delete newSettings.api;
    window.electron.store.set('settings', newSettings);
  }
};
migrateSettings();

const mergeSettings = () => {
  const userSettings = window.electron.store.get('providers');
  const config: { [key: string]: IChatProviderConfig } = {};
  const builtInProviders = getProviders();
  Object.keys(builtInProviders).forEach((key) => {
    const provider = builtInProviders[key];
    const userProviderSettings = userSettings[key];
    const userModelsSettings = keyBy(
      userProviderSettings?.models || {},
      'name',
    );
    config[key] = {
      name: key,
      apiBase: userProviderSettings?.apiBase || provider.apiBase || '',
      apiKey: userProviderSettings?.apiKey || provider.apiKey || '',
      temperature: provider.chat.temperature,
      topP: provider.chat.topP,
      presencePenalty: provider.chat.presencePenalty,
      currency: provider.currency,
      isDefault: userProviderSettings?.isDefault || false,
      isPremium: provider.isPremium || false,
      disabled: userProviderSettings?.disabled || false,
      isBuiltIn: true,
      modelsEndpoint: provider.options.modelsEndpoint,
      models: provider.chat.models.map((model) => {
        const userModelSetting = userModelsSettings[model.name];
        return {
          name: model.name,
          label: userModelSetting?.label || model.label || model.name,
          contextWindow: userModelSetting?.contextWindow || model.contextWindow,
          maxTokens: userModelSetting?.maxTokens || model.maxTokens,
          defaultMaxTokens:
            userModelSetting?.defaultMaxTokens || model.defaultMaxTokens,
          inputPrice: userModelSetting?.inputPrice || model.inputPrice,
          outputPrice: userModelSetting?.outputPrice || model.outputPrice,
          description:
            userModelSetting?.description || model.description || null,
          isDefault: userModelSetting?.isDefault || model.isDefault || false,
          isBuiltIn: true,
          isPremium: provider.isPremium,
          disabled: userModelSetting?.disabled || false,
          capabilities:
            userModelSetting?.capabilities || model.capabilities || {},
          extras: userModelSetting?.extras || {},
        };
      }),
    };
  });
  const userDefinedProviders = omit(
    userSettings,
    Object.keys(builtInProviders),
  );
  return { ...config, ...userDefinedProviders };
};

export interface IProviderStore {
  provider: IChatProviderConfig | null;
  providers: { [key: string]: IChatProviderConfig };
  hasValidModels: (provider: IChatProviderConfig) => boolean;
  getProvidersWithModels: () => IChatProviderConfig[];
  setProvider: (providerName: string | null) => IChatProviderConfig | null;
  getDefaultProvider: () => IChatProviderConfig;
  getAvailableProvider: (providerName: string) => IChatProviderConfig;
  getAvailableModel: (
    providerName: string,
    modelName: string,
  ) => IChatModelConfig;
  getGroupedModelOptions: () => {
    [key: string]: ModelOption[];
  };
  createProvider: (providerName?: string) => void;
}

const useProviderStore = create<IProviderStore>((set, get) => ({
  providers: mergeSettings(),
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
  hasValidModels: (provider: IChatProviderConfig) => {
    let models = Object.values(provider.models || {});
    if (models.length === 0) return false;
    const extraKeys = Object.keys(provider.modelExtras || {});
    if (extraKeys.length > 0) {
      models = models.filter((model) => {
        return extraKeys.every((key: string) => {
          return model.extras?.[key] !== '';
        });
      });
    }
    return models.length > 0;
  },
  getProvidersWithModels: () => {
    const { providers } = get();
    return Object.values(providers)
      .filter((p) => {
        return p.models.length > 0;
      })
      .map((provider) => {
        provider.isReady = isProviderReady(provider);
        return provider;
      });
  },
  getAvailableProvider: (providerName: string) => {
    const { getProvidersWithModels } = get();
    const providers = getProvidersWithModels();
    return (
      find(providers, { name: providerName }) ||
      find(providers, { isDefault: true }) ||
      providers[0]
    );
  },
  getDefaultProvider: () => {
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
    const result: { [key: string]: ModelOption[] } = {};
    const providers = getProvidersWithModels();
    providers.forEach((provider) => {
      result[provider.name] = provider.models.map((model) => ({
        label: model.label || model.name,
        value: model.name,
        isReady: isModelReady(provider, model),
        isDefault: model.isDefault || false,
      }));
    });
    return result;
  },
}));

export default useProviderStore;
