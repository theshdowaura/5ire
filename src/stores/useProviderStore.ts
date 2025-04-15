import { find, isNil, keyBy, omit } from 'lodash';
import { getProviders } from 'providers';
import {
  IChatModel,
  IChatModelConfig,
  IChatProviderConfig,
} from 'providers/types';
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

const sortByName = (a: { name: string }, b: { name: string }) =>
  b.name.localeCompare(a.name);

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
          apiSecret: provider.secret,
          apiVersion: provider.version,
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

const mergeProvidersSettings = (userSettings?: {
  [key: string]: IChatProviderConfig;
}): { [key: string]: IChatProviderConfig } => {
  const userDefinedProviders =
    userSettings || window.electron.store.get('providers');
  const config: { [key: string]: IChatProviderConfig } = {};
  const builtInProviders = getProviders();
  Object.keys(builtInProviders).forEach((key) => {
    const builtInProvider = builtInProviders[key] || OpenAI; // fallback to OpenAI
    const userDefinedProvider = userDefinedProviders[key];
    const userDefinedModelsMap = keyBy(
      userDefinedProvider?.models || {},
      'name',
    );
    const userCreatedModels =
      userDefinedProvider?.models?.filter((model: IChatModelConfig) => {
        return builtInProvider.chat.models.some(
          (builtInModel: IChatModel) => builtInModel.name === model.name,
        );
      }) || [];
    config[key] = {
      name: key,
      apiBase: userDefinedProvider?.apiBase || builtInProvider.apiBase || '',
      apiKey: userDefinedProvider?.apiKey || builtInProvider.apiKey || '',
      temperature: builtInProvider.chat.temperature,
      topP: builtInProvider.chat.topP,
      presencePenalty: builtInProvider.chat.presencePenalty,
      currency: builtInProvider.currency,
      isDefault: userDefinedProvider?.isDefault || false,
      isPremium: builtInProvider.isPremium || false,
      disabled: userDefinedProvider?.disabled || false,
      isBuiltIn: true,
      modelsEndpoint: builtInProvider.options.modelsEndpoint,
      models: [
        ...builtInProvider.chat.models.map((model) => {
          const userDefinedModel = userDefinedModelsMap[model.name];
          return {
            name: model.name,
            label: userDefinedModel?.label || model.label || model.name,
            contextWindow:
              userDefinedModel?.contextWindow || model.contextWindow,
            maxTokens: userDefinedModel?.maxTokens || model.maxTokens,
            defaultMaxTokens:
              userDefinedModel?.defaultMaxTokens || model.defaultMaxTokens,
            inputPrice: userDefinedModel?.inputPrice || model.inputPrice,
            outputPrice: userDefinedModel?.outputPrice || model.outputPrice,
            description:
              userDefinedModel?.description || model.description || null,
            isDefault: userDefinedModel?.isDefault || model.isDefault || false,
            isBuiltIn: true,
            isPremium: builtInProvider.isPremium,
            disabled: userDefinedModel?.disabled || false,
            capabilities:
              userDefinedModel?.capabilities || model.capabilities || {},
            extras: userDefinedModel?.extras || {},
          };
        }),
        ...userCreatedModels,
      ].sort((a, b) => b.name.localeCompare(a.name)),
    };
  });
  const userCreatedProviders = omit(
    userDefinedProviders,
    Object.keys(builtInProviders),
  );
  return { ...config, ...userCreatedProviders };
};

export interface IProviderStore {
  provider: IChatProviderConfig | null;
  providers: { [key: string]: IChatProviderConfig };
  hasValidModels: (provider: IChatProviderConfig) => boolean;
  getProvidersWithModels: () => IChatProviderConfig[];
  setProvider: (providerName: string | null) => IChatProviderConfig | null;
  createProvider: (providerName?: string) => void;
  updateProvider: (
    provider: Partial<IChatProviderConfig> & { name: string },
  ) => void;
  deleteProvider: (providerName: string) => void;
  isProviderDuplicated: (providerName: string) => boolean;
  updateProviderName: (oldName: string, newName: string) => void;
  getDefaultProvider: () => IChatProviderConfig;
  getAvailableProvider: (providerName: string) => IChatProviderConfig;
  getAvailableModel: (
    providerName: string,
    modelName: string,
  ) => IChatModelConfig;
  getGroupedModelOptions: () => {
    [key: string]: ModelOption[];
  };
}

const useProviderStore = create<IProviderStore>((set, get) => ({
  providers: mergeProvidersSettings(),
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
  updateProvider: (
    provider: Partial<IChatProviderConfig> & { name: string },
  ) => {
    const providers = window.electron.store.get('providers');
    const updatedProviders = {
      ...providers,
      [provider.name]: {
        ...providers[provider.name],
        ...provider,
      },
    };
    // if the provider is set as default, unset all other providers
    if (provider.isDefault) {
      Object.keys(updatedProviders).forEach((key) => {
        if (key !== provider.name) {
          updatedProviders[key].isDefault = false;
        }
      });
    }
    window.electron.store.set('providers', updatedProviders);
    set({ providers: mergeProvidersSettings(updatedProviders) });
  },
  updateProviderName: (oldName: string, newName: string) => {
    const providers = window.electron.store.get('providers');
    const updatedProviders = {
      ...providers,
      [newName]: {
        ...providers[oldName],
        name: newName,
      },
    };
    delete updatedProviders[oldName];
    window.electron.store.set('providers', updatedProviders);
    set({ providers: mergeProvidersSettings(updatedProviders) });
    if (get().provider?.name === oldName) {
      set({ provider: updatedProviders[newName] });
    }
  },
  deleteProvider: (providerName: string) => {
    const providers = window.electron.store.get('providers');
    const updatedProviders = { ...providers };
    delete updatedProviders[providerName];
    window.electron.store.set('providers', updatedProviders);
    const newProviders = mergeProvidersSettings(updatedProviders);
    set({
      providers: newProviders,
    });
    if (get().provider?.name === providerName) {
      set({ provider: Object.values(newProviders).sort(sortByName)[0] });
    }
  },
  isProviderDuplicated: (providerName: string) => {
    const { providers } = get();
    return Object.keys(providers).includes(providerName);
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
    const newProvider = {
      name: defaultName,
      apiBase: '',
      currency: 'USD',
      apiKey: '',
      isDefault: false,
      isPremium: false,
      isBuiltIn: false,
      models: [],
      disabled: false,
    } as Partial<IChatProviderConfig>;
    window.electron.store.set('providers', {
      ...window.electron.store.get('providers'),
      [defaultName]: newProvider,
    });
    const newProviders = mergeProvidersSettings();
    set({ providers: newProviders, provider: newProviders[defaultName] });
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
