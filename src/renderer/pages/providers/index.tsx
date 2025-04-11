import { Button, List, ListItem } from '@fluentui/react-components';
import { AddCircleFilled, AddCircleRegular, bundleIcon, ChevronRightRegular } from '@fluentui/react-icons';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useProviderStore from 'stores/useProviderStore';
import ModelList from './ModelList';
import ProviderForm from './ProviderForm';

const DEFAULT_HEIGHT = 400;
const HEADER_HEIGHT = 100;
const LIST_ITEM_HEIGHT = 50;
const PROVIDER_FORM_HEIGHT = 189;

const AddIcon = bundleIcon(AddCircleFilled, AddCircleRegular);

export default function Providers() {
  const { t } = useTranslation();
  const selectedProvider = useProviderStore((state) => state.provider);
  const providers = useProviderStore((state) => state.providers);
  const { selectProvider } = useProviderStore();
  const [contentHeight, setContentHeight] = useState(DEFAULT_HEIGHT);

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

  useEffect(() => {
    const handleResize = () => {
      setContentHeight(window.innerHeight);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div
      className="page h-full"
      id="page-settings"
      style={{ paddingBottom: 0 }}
    >
      <div className="page-top-bar" />
      <div className="page-header border-b border-base -mx-5 px-5">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl">{t('Common.Providers')}</h1>
        </div>
      </div>
      <div
        className="-ml-5 -mr-5 grid grid-cols-4"
        style={{ height: contentHeight - HEADER_HEIGHT }}
      >
        <div
          className="border-r border-base relative "
          style={{ height: contentHeight - HEADER_HEIGHT }}
        >
          <List
            className="overflow-y-auto"
            style={{
              height: contentHeight - (HEADER_HEIGHT + LIST_ITEM_HEIGHT),
            }}
          >
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
          <div className="absolute p-2 bottom-0 left-0 right-0 z-10 border-t border-base">
            <Button size="small" appearance='subtle' className="w-full" icon={<AddIcon />}>
              {t('Provider.OpenAICompatible')}
            </Button>
          </div>
        </div>
        <div className="col-span-3 h-full">
          {selectedProvider && (
            <div>
              <ProviderForm provider={selectedProvider} />
              <ModelList provider={selectedProvider} height={contentHeight - (HEADER_HEIGHT + PROVIDER_FORM_HEIGHT)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
