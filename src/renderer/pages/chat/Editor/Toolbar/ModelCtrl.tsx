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
      return;
    }
    const model = getAvailableModel(provider.name, ctxModel?.name);
    setCurModel(model);
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
  }, [chat.id]);

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
    <div className="flex flex-start items-center">
      <Menu>
        <MenuTrigger disableButtonEnhancement>
          <Button
            size="small"
            appearance="subtle"
            iconPosition="after"
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
            size="small"
            appearance="subtle"
            iconPosition="after"
            icon={<ChevronDownRegular className="ml-2" />}
            className="flex justify-start items-center"
            style={{ minWidth: '10px' }}
          >
            {curModel?.label}
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {models.map((model: IChatModelConfig) => (
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
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
}
