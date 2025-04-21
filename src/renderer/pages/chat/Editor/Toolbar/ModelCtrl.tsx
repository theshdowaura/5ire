import {
  Button,
  Menu,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { ChevronDownRegular } from '@fluentui/react-icons';
import { IChat, IChatContext } from 'intellichat/types';
import { find } from 'lodash';
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { useEffect, useMemo, useRef, useState } from 'react';
import useChatStore from 'stores/useChatStore';
import useProviderStore from 'stores/useProviderStore';

export default function ModelCtrl({
  chat,
  ctx,
}: {
  chat: IChat;
  ctx: IChatContext;
}) {
  const editStage = useChatStore((state) => state.editStage);
  const { getAvailableProviders, getModels } = useProviderStore();
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
    const defaultModel = find($models, { isDefault: true }) || $models[0];
    if (curProvider?.name === provider?.name) {
      setCurModel(find($models, { name: ctxModel?.name }) || defaultModel);
    } else {
      setCurModel(defaultModel);
    }
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
    }
  }, [curProvider?.name]);

  useEffect(() => {
    if (isChanged.current) {
      editStage(chat.id, {
        provider: curProvider?.name || '',
        model: curModel?.name || '',
      });
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
