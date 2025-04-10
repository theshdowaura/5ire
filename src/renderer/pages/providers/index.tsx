import { List, ListItem } from '@fluentui/react-components';
import { ChevronRightRegular } from '@fluentui/react-icons';
import { IServiceProvider } from 'providers/types';
import { useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useProviderStore from 'stores/useProviderStore';
import ModelList from './ModelList';

export default function Providers() {
  const { t } = useTranslation();
  const selectedProvider = useProviderStore((state) => state.provider);
  const providers = useProviderStore((state) => state.providers);
  const { selectProvider } = useProviderStore();

  const providerNames = useMemo(
    () =>
      Object.keys(providers).sort((a: string, b: string) => a.localeCompare(b)),
    [providers],
  );

  useEffect(() => {
    if (!selectedProvider) {
      // If no provider is selected, select the first one
      selectProvider(providerNames[0]);
    }
  }, [selectedProvider, providerNames, selectProvider]);

  return (
    <div className="page h-full" id="page-settings">
      <div className="page-top-bar" />
      <div className="page-header">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl">{t('Common.Providers')}</h1>
        </div>
      </div>
      <div className="overflow-y-auto h-full -ml-5 -mr-5">
        <div className="grid grid-cols-4 border-t border-base h-full">
          <div className="h-full border-r border-base">
            <List navigationMode="items">
              {providerNames.map((providerName) => {
                return (
                  <ListItem
                    key={providerName}
                    aria-label={providerName}
                    onAction={() => {
                      selectProvider(providerName);
                    }}
                    className="block hover:bg-stone-100 dark:hover:bg-stone-700"
                  >
                    <div
                      className={`flex justify-between items-center px-4 py-2 border-b border-gray-100 dark:border-stone-800 w-full ${selectedProvider?.name === providerName ? 'bg-stone-100 dark:bg-stone-700' : ''}`}
                    >
                      {providerName}
                      {selectedProvider?.name === providerName && (
                        <ChevronRightRegular />
                      )}
                    </div>
                  </ListItem>
                );
              })}
            </List>
          </div>
          <div className="col-span-3">
            <ModelList provider={selectedProvider as IServiceProvider} />
          </div>
        </div>
      </div>
    </div>
  );
}
