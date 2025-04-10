import { getProviders } from 'providers';
import { IServiceProvider } from 'providers/types';
import { create } from 'zustand';

export interface IProviderStore {
  provider: IServiceProvider | null;
  selectProvider: (providerName: string | null) => IServiceProvider | null;
  providers: { [key: string]: IServiceProvider };
}

const builtInProviders = getProviders();

const useProviderStore = create<IProviderStore>((set, get) => ({
  providers: {
    ...builtInProviders,
  },
  provider: null,
  selectProvider: (providerName: string | null) => {
    if (!providerName) {
      set({ provider: null });
      return null;
    }
    const provider = get().providers[providerName];
    set({ provider });
    return provider;
  },
}));

export default useProviderStore;
