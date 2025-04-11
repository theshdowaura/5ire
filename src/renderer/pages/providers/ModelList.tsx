import {
  Combobox,
  Option,
  List,
  ListItem,
  ComboboxProps,
  Button,
} from '@fluentui/react-components';
import {
  AddCircleFilled,
  AddCircleRegular,
  bundleIcon,
} from '@fluentui/react-icons';
import { getChatModels } from 'providers';
import { IChatModel, IServiceProvider } from 'providers/types';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from 'renderer/components/Spinner';
import ToolStatusIndicator from 'renderer/components/ToolStatusIndicator';

const AddIcon = bundleIcon(AddCircleFilled, AddCircleRegular);

export default function ModelList({
  provider,
}: {
  provider: IServiceProvider;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<Partial<IChatModel>[]>([]);

  const onOptionSelect: ComboboxProps['onOptionSelect'] = (e, data) => {
    setQuery(data.optionText ?? '');
  };

  const loadModels = useCallback(async () => {
    if (provider.options?.modelsEndpoint) {
      setLoading(true);
      try {
        const resp = await fetch(
          `${provider.apiBase}${provider.options.modelsEndpoint}`,
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          },
        );
        const data = await resp.json();
        setModels(
          data.models.map((model: { name: string }) => ({
            name: model.name,
            label: model.name,
          })),
        );
      } catch (e) {
        setModels([]);
      } finally {
        setLoading(false);
      }
    } else {
      setModels(getChatModels(provider.name));
    }
  }, [provider]);

  const filteredModels = models.filter((model) => {
    const label = model.label || (model.name as string);
    return label.toLowerCase().includes(query.toLowerCase());
  });

  useEffect(() => {
    loadModels();
    return () => {
      setLoading(false);
      setModels([]);
    };
  }, [provider?.name, loadModels]);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-full gap-1">
        <Spinner size={28} />
        <p className="ml-2">{t('Common.Loading')}</p>
      </div>
    );
  }
  if (models.length === 0) {
    return (
      <div className="flex justify-center items-center h-full">
        <p>{t('Common.NoModels')}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-start items-center gap-2 pl-4 border-b  border-base ">
        <Combobox
          size="small"
          clearable
          className="flex-grow w-[100px]"
          appearance="underline"
          onOptionSelect={onOptionSelect}
          placeholder="Filter models"
          onChange={(ev) => setQuery(ev.target.value)}
          value={query}
        >
          {filteredModels.map((model: Partial<IChatModel>) => (
            <Option key={model.name as string} className="focus-visible:ring-0">
              {model.label || (model.name as string)}
            </Option>
          ))}
        </Combobox>
        <div className="border-l border-base py-1 px-2 flex justify-center items-center min-w-[80px]">
          <Button size="small" appearance="subtle" icon={<AddIcon />}>
            Model
          </Button>
        </div>
      </div>
      <List navigationMode="items">
        {filteredModels.map((model) => {
          return (
            <ListItem
              key={model.name}
              aria-label={model.name}
              onAction={() => {
                // Handle model selection here
              }}
              className="block hover:bg-stone-100 dark:hover:bg-stone-700"
            >
              <div className="px-4 py-2 border-b border-gray-100 dark:border-stone-800 w-full">
                <div className="font-medium flex justify-start gap-1 items-center">
                  <ToolStatusIndicator
                    model={model.name}
                    provider={provider.name}
                  />
                  <span className="-mt-0.5">{model.label || model.name}</span>
                  {model.vision && (
                    <div className="text-xs text-purple-800 px-2 ground bg-purple-100 rounded-lg">
                      {t('Provider.Model.Vision')}
                    </div>
                  )}
                  {model.toolEnabled && (
                    <div className="text-xs text-orange-800 px-2 ground bg-orange-100 rounded-lg">
                      {t('Provider.Model.Tools')}
                    </div>
                  )}
                </div>
                {model.label !== model.name && (
                  <p className="tips text-xs">{model.name}</p>
                )}
                <p className="tips text-xs  mt-1">{model.description}</p>
              </div>
            </ListItem>
          );
        })}
      </List>
    </div>
  );
}
