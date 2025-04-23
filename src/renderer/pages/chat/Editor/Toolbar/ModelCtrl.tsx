import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { ChevronDownRegular } from '@fluentui/react-icons';
import { ERROR_MODEL } from 'consts';
import { IChat, IChatContext } from 'intellichat/types';
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useChatStore from 'stores/useChatStore';
import useProviderStore from 'stores/useProviderStore';
import eventBus from 'utils/bus';

export default function ModelCtrl({
  chat,
  ctx,
}: {
  chat: IChat;
  ctx: IChatContext;
}) {
  const { t } = useTranslation();
  const bus = useRef(eventBus);
  const editStage = useChatStore((state) => state.editStage);
  const { getAvailableProviders, getModels, getAvailableModel } =
    useProviderStore();
  const providers = useMemo(() => {
    return getAvailableProviders().filter((provider) => !provider.disabled);
  }, [getAvailableProviders]);
  const [curProvider, setCurProvider] = useState<IChatProviderConfig>();
  const [curModel, setCurModel] = useState<IChatModelConfig>();
  const [models, setModels] = useState<IChatModelConfig[]>([]);
  const isChanged = useRef(false);

  const loadModels = async (provider: IChatProviderConfig) => {
    const $models = await getModels(provider);
    setModels($models);
    const ctxModel = ctx.getModel();
    if (ctxModel?.name === ERROR_MODEL) {
      setCurModel(ctxModel);
    } else {
      const model = getAvailableModel(provider.name, ctxModel?.name);
      setCurModel(model);
    }
    bus.current.emit('providerChanged', { provider: provider.name });
  };

  useEffect(() => {
    const ctxProvider = ctx.getProvider();
    setCurProvider(ctxProvider);
    setCurModel(ctx.getModel());
    loadModels(ctxProvider);
    return () => {
      setCurProvider(undefined);
      setCurModel(undefined);
      setModels([]);
      isChanged.current = false;
    };
  }, [chat.id, chat.provider, chat.model]);

  useEffect(() => {
    if (curProvider) {
      loadModels(curProvider);
      editStage(chat.id, {
        provider: curProvider?.name,
        model: curModel?.name,
      });
    }
  }, [curProvider?.name]);

  useEffect(() => {
    if (isChanged.current) {
      editStage(chat.id, {
        provider: curProvider?.name,
        model: curModel?.name,
      });
      bus.current.emit('providerChanged', { provider: curProvider?.name });
      isChanged.current = false;
    }
  }, [curModel?.name]);

  return (
    <div className="flex flex-start items-center -ml-1.5">
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            size="small"
            appearance="transparent"
            iconPosition="after"
            className="justify-start"
            style={{ padding: '0 4px' }}
            icon={<ChevronDownRegular className="ml-2" />}
          >
            {curProvider?.name}
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {providers.map((provider) => (
              <MenuItem
                key={provider.name}
                disabled={!provider.isReady}
                onClick={() => {
                  setCurProvider(provider);
                  isChanged.current = true;
                }}
              >
                {provider.name}
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
      <div className="text-gray-400">/</div>
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            style={{ padding: '0 4px', minWidth: '10px' }}
            size="small"
            appearance="transparent"
            iconPosition="after"
            icon={<ChevronDownRegular className="ml-2" />}
            className="flex justify-start items-center"
          >
            {curModel?.label}
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {models.length > 0 ? (
              models.map((model: IChatModelConfig) => (
                <MenuItem
                  key={model.name}
                  disabled={!model.isReady}
                  onClick={() => {
                    setCurModel(model);
                    isChanged.current = true;
                  }}
                >
                  {model.label}
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled>{t('Common.NoModels')}</MenuItem>
            )}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
}
