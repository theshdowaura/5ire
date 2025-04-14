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
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Spinner from 'renderer/components/Spinner';
import TooltipIcon from 'renderer/components/TooltipIcon';
import ModelFormDrawer from './ModelFormDrawer';
import ToolTag from './ToolTag';

const AddIcon = bundleIcon(AddCircleFilled, AddCircleRegular);

export default function ModelList({
  provider,
  height = 400,
}: {
  provider: IChatProviderConfig;
  height?: number;
}) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [selectedModel, setSelectedModel] = useState<IChatModelConfig | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [models, setModels] = useState<IChatModelConfig[]>([]);

  const onOptionSelect: ComboboxProps['onOptionSelect'] = (e, data) => {
    setQuery(data.optionText ?? '');
  };

  const loadModels = useCallback(async () => {
    if (provider.modelsEndpoint) {
      setLoading(true);
      try {
        const resp = await fetch(
          `${provider.apiBase}${provider.modelsEndpoint}`,
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
      setModels(Object.values(provider.models));
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

  return (
    <div>
      <div className="flex justify-start items-center gap-2 pl-4 border-b border-base">
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
          {filteredModels.map((model: IChatModelConfig) => (
            <Option key={model.name as string} className="focus-visible:ring-0">
              {model.label || (model.name as string)}
            </Option>
          ))}
        </Combobox>
        <div className="border-l border-base py-1 px-2 flex justify-center items-center min-w-[80px]">
          <Button
            size="small"
            appearance="subtle"
            icon={<AddIcon />}
            onClick={() => {
              setSelectedModel(null);
              setFormOpen(true);
            }}
          >
            Model
          </Button>
        </div>
      </div>
      <div className="overflow-y-auto" style={{ height: height - 35 }}>
        {filteredModels.length === 0 ? (
          <div className="flex flex-col justify-center items-center h-96">
            <p className="tips">{t('Common.NoModels')}</p>
          </div>
        ) : (
          <List>
            {filteredModels.map((model) => {
              return (
                <ListItem
                  key={model.name}
                  aria-label={model.name}
                  onAction={() => {
                    setSelectedModel(model as IChatModelConfig);
                    setFormOpen(true);
                  }}
                  className="block hover:bg-stone-100 dark:hover:bg-stone-700"
                >
                  <div className="px-4 pt-3 pb-2 border-b border-gray-100 dark:border-stone-800 w-full">
                    <div className="font-medium flex justify-between gap-1 items-center mb-1">
                      <div>
                        <span className="-mt-0.5 text-sm" title={model.name}>
                          {model.label || model.name}
                        </span>
                        {model.description && (
                          <TooltipIcon
                            positioning="after"
                            tip={
                              <div>
                                <p className="font-bold mb-1 text-base">
                                  {model.name}
                                </p>
                                <p>{model.description}</p>
                              </div>
                            }
                          />
                        )}
                      </div>
                      <div className="flex justify-end gap-1">
                        {model.capabilities?.vision && (
                          <div className="text-xs text-amber-900 dark:text-amber-500 px-1.5 ground bg-amber-100 dark:bg-amber-900 rounded-lg dark:opacity-80">
                            {t('Tags.Vision')}
                          </div>
                        )}
                        {model.capabilities?.tools && (
                          <ToolTag
                            provider={provider.name}
                            model={model.name}
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </ListItem>
              );
            })}
          </List>
        )}
      </div>
      <ModelFormDrawer
        open={formOpen}
        setOpen={setFormOpen}
        model={selectedModel}
      />
    </div>
  );
}
