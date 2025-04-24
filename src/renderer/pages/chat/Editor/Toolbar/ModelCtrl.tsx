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
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ToolStatusIndicator from 'renderer/components/ToolStatusIndicator';
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
  const { getAvailableProviders, getModels } = useProviderStore();
  const providers = useMemo(() => {
    return getAvailableProviders().filter((provider) => !provider.disabled);
  }, [getAvailableProviders]);
  const [curProvider, setCurProvider] = useState<IChatProviderConfig>();
  const [curModel, setCurModel] = useState<IChatModelConfig>();
  const [models, setModels] = useState<IChatModelConfig[]>([]);
  const isChanged = useRef(false);

  const loadModels = useCallback(
    async (provider: IChatProviderConfig) => {
      const $models = await getModels(provider);
      setModels($models);
      const ctxModel = find($models, { isDefault: true }) || $models[0];
      setCurModel(ctxModel);
    },
    [getModels],
  );

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
  }, [chat.id, chat.provider]);

  useEffect(() => {
    if (curProvider) {
      loadModels(curProvider);
    } else {
      setModels([]);
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
                style={{
                  fontSize: 12,
                  paddingTop: 2,
                  paddingBottom: 2,
                  minHeight: 12,
                }}
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
                  style={{
                    fontSize: 12,
                    paddingTop: 2,
                    paddingBottom: 2,
                    minHeight: 12,
                  }}
                  onClick={() => {
                    console.log('>>>>', model.name);
                    setCurModel(model);
                    isChanged.current = true;
                  }}
                >
                  <div className="flex justify-start items-center gap-1 text-xs py-1">
                    <ToolStatusIndicator model={model} withTooltip />
                    <span> {model.label}</span>
                  </div>
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
