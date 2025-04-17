import { find, isNil, keyBy, unionBy } from 'lodash';
import { getBuiltInProviders } from 'providers';
import {
  IChatModel,
  IChatModelConfig,
  IChatProviderConfig,
} from 'providers/types';
import { genDefaultName } from 'utils/util';
import { create } from 'zustand';
import OpenAI from 'providers/OpenAI';
import useAuthStore from './useAuthStore';

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
  a.name.localeCompare(b.name);

const isModelReady = (
  modelExtras: string[],
  model: IChatModelConfig,
): boolean => {
  return modelExtras.every((key: string) => {
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
  const customProviders = window.electron.store.get('providers');
  const legacyDefaultProvider = settings.api.activeProvider;
  const legacyProviders = settings.api.providers;
  if ((customProviders?.length || 0) === 0 && legacyProviders) {
    const newProviders = Object.values(legacyProviders).map(
      (provider: any) => ({
        name: provider.provider,
        description: provider.description,
        apiKey: provider.key,
        apiBase: provider.base,
        apiSecret: provider.secret,
        apiVersion: provider.version,
        models: [],
        isBuiltIn: true,
        isDefault: provider.provider === legacyDefaultProvider,
      }),
    );
    window.electron.store.set('providers', newProviders);
  }
  const newSettings = { ...settings };
  delete newSettings.api;
  window.electron.store.set('settings', newSettings);
};
migrateSettings();

const mergeProviders = (
  custom?: IChatProviderConfig[],
): IChatProviderConfig[] => {
  const customProviders = keyBy(
    custom || window.electron.store.get('providers'),
    'name',
  );
  const builtInProviders = keyBy(getBuiltInProviders(), 'name');
  return unionBy(
    [...Object.values(customProviders), ...Object.values(builtInProviders)],
    'name',
  )
    .map((provider) => {
      const customProvider = customProviders[provider.name];
      let isBuiltIn = true;
      const builtInProvider = builtInProviders[provider.name];
      const defaultProvider = { ...OpenAI };
      if (isNil(builtInProvider)) {
        isBuiltIn = false;
      }
      const userCreatedModels =
        customProvider?.models?.filter((model: IChatModelConfig) => {
          return (
            isBuiltIn ||
            builtInProvider?.chat?.models?.some(
              (builtInModel: IChatModel) => builtInModel.name === model.name,
            )
          );
        }) || [];
      const customModels = keyBy(customProvider?.models || [], 'name');
      const mergedProvider = {
        name: provider.name,
        description:
          customProvider?.description || builtInProvider?.description || '',
        apiBase: customProvider?.apiBase || builtInProvider?.apiBase,
        apiKey: customProvider?.apiKey || '',
        temperature: (builtInProvider || defaultProvider).chat.temperature,
        topP: (builtInProvider || defaultProvider).chat.topP,
        presencePenalty: (builtInProvider || defaultProvider).chat
          .presencePenalty,
        currency: (builtInProvider || defaultProvider).currency,
        isDefault: customProvider?.isDefault || false,
        isPremium: !!builtInProvider?.isPremium,
        disabled: customProvider?.disabled || false,
        isBuiltIn,
        modelExtras: customProvider?.modelExtras || {},
        modelsEndpoint: builtInProvider?.options?.modelsEndpoint,
        models: [
          ...(builtInProvider?.chat?.models?.map((model) => {
            const customModel = customModels[model.name];
            const mergedModel = {
              name: model.name,
              label: customModel?.label || model.label || model.name,
              contextWindow: customModel?.contextWindow || model.contextWindow,
              maxTokens: customModel?.maxTokens || model.maxTokens,
              defaultMaxTokens:
                customModel?.defaultMaxTokens || model.defaultMaxTokens,
              inputPrice: customModel?.inputPrice || model.inputPrice,
              outputPrice: customModel?.outputPrice || model.outputPrice,
              description:
                customModel?.description || model.description || null,
              isDefault: customModel?.isDefault || model.isDefault || false,
              isBuiltIn: true,
              isPremium: builtInProvider.isPremium,
              disabled: customModel?.disabled || false,
              capabilities:
                customModel?.capabilities || model.capabilities || {},
              extras: customModel?.extras || {},
            } as IChatModelConfig;
            mergedModel.isReady = isModelReady(
              builtInProvider.chat.modeExtras || [],
              mergedModel,
            );
            return mergedModel;
          }) || []),
          ...userCreatedModels,
        ].sort(sortByName),
      } as IChatProviderConfig;
      mergedProvider.isReady = isProviderReady(mergedProvider);
      return mergedProvider;
    })
    .sort(sortByName);
};

export interface IProviderStore {
  providers: IChatProviderConfig[];
  provider: IChatProviderConfig | null;
  hasValidModels: (provider: IChatProviderConfig) => boolean;
  getProvidersWithModels: () => IChatProviderConfig[];
  setProvider: (provider: IChatProviderConfig) => IChatProviderConfig;
  createProvider: (providerName?: string) => void;
  updateProvider: (
    provider: Partial<IChatProviderConfig> & { name: string },
  ) => void;
  deleteProvider: (providerName: string) => void;
  isProviderDuplicated: (providerName: string) => boolean;
  updateProviderName: (oldName: string, newName: string) => void;
  getDefaultProvider: () => IChatProviderConfig;
  getAvailableProviders: () => IChatProviderConfig[];
  getAvailableProvider: (providerName: string) => IChatProviderConfig;
  getAvailableModel: (
    providerName: string,
    modelName: string,
  ) => IChatModelConfig;
  getGroupedModelOptions: () => {
    [key: string]: ModelOption[];
  };
  createModel: (model: IChatModelConfig) => void;
}

const useProviderStore = create<IProviderStore>((set, get) => ({
  providers: mergeProviders(),
  provider: null,
  setProvider: (provider: IChatProviderConfig) => {
    set({ provider });
    return provider;
  },
  updateProvider: (
    provider: Partial<IChatProviderConfig> & { name: string },
  ) => {
    const customProviders = window.electron.store.get('providers');
    let found = false;
    const updatedProviders = customProviders.map(
      (providerItem: IChatProviderConfig) => {
        if (providerItem.name === provider.name) {
          found = true;
          return {
            ...providerItem,
            ...provider,
          };
        }
        if (provider.isDefault) {
          providerItem.isDefault = false;
        }
        return providerItem;
      },
    ) as IChatProviderConfig[];
    if (!found) {
      updatedProviders.push(provider as IChatProviderConfig);
    }
    window.electron.store.set('providers', updatedProviders);
    set({ providers: mergeProviders(updatedProviders) });
  },
  updateProviderName: (oldName: string, newName: string) => {
    const customProviders = window.electron.store.get('providers');
    const updatedProviders = customProviders.map(
      (providerItem: IChatProviderConfig) => {
        if (providerItem.name === oldName) {
          return {
            ...providerItem,
            name: newName,
          };
        }
        return providerItem;
      },
    );
    window.electron.store.set('providers', updatedProviders);
    if (get().provider?.name === oldName) {
      set(({ provider }) => ({
        provider: {
          ...provider,
          name: newName,
        } as IChatProviderConfig,
      }));
    }
    set({ providers: mergeProviders(updatedProviders) });
  },
  deleteProvider: (providerName: string) => {
    const customProviders = window.electron.store.get('providers');
    const updatedProviders = customProviders.filter(
      (providerItem: IChatProviderConfig) => {
        return providerItem.name !== providerName;
      },
    ) as IChatProviderConfig[];
    window.electron.store.set('providers', updatedProviders);
    const newProviders = mergeProviders(updatedProviders);
    const { provider } = get();
    if (provider?.name === providerName) {
      set({ provider: newProviders[0] });
    }
    set({ providers: newProviders });
  },
  isProviderDuplicated: (providerName: string) => {
    const { providers } = get();
    return providers.map((provider) => provider.name).includes(providerName);
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
    const { getAvailableProviders } = get();
    const providers = getAvailableProviders();
    return providers.filter((p) => {
      return p.models.length > 0;
    });
  },
  getAvailableProviders: () => {
    const { providers } = get();
    const { session } = useAuthStore.getState();
    if (session) return providers;
    return providers.filter((p) => !p.isPremium);
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
    const { providers } = get();
    const names = providers.map((provider) => provider.name);
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
    const customProviders = window.electron.store.get('providers');
    const newCustomProviders = (
      [...customProviders, newProvider] as IChatProviderConfig[]
    ).sort(sortByName);
    window.electron.store.set('providers', newCustomProviders);
    const newProviders = mergeProviders(newCustomProviders);
    set({
      provider: find(newProviders, { name: defaultName }),
      providers: newProviders,
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
    const providersWithModels = getProvidersWithModels();
    providersWithModels.forEach((provider) => {
      result[provider.name] = provider.models.map((model) => ({
        label: model.label || model.name,
        value: model.name,
        isReady: model.isReady,
        isDefault: model.isDefault || false,
      }));
    });
    return result;
  },
  createModel: (model: IChatModelConfig) => {
    const { provider, updateProvider } = get();
    if (!provider) return;
    const newModel = {
      ...model,
      isBuiltIn: false,
    } as IChatModelConfig;
    const updatedProvider = {
      ...provider,
      models: [...(provider.models || []), newModel],
    };
    updateProvider(updatedProvider);
  },
}));

export default useProviderStore;
