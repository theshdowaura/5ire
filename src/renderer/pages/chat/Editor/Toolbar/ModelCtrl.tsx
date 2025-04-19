import {
  Button,
  Menu,
  MenuCheckedValueChangeData,
  MenuCheckedValueChangeEvent,
  MenuItem,
  MenuList,
  MenuPopover,
  MenuTrigger,
} from '@fluentui/react-components';
import { ChevronDownRegular } from '@fluentui/react-icons';
import { IChat, IChatContext } from 'intellichat/types';
import { find } from 'lodash';
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { useMemo, useState } from 'react';
import useChatStore from 'stores/useChatStore';
import useProviderStore, { ModelOption } from 'stores/useProviderStore';

export default function ModelCtrl({ ctx }: { ctx: IChatContext }) {
  const editStage = useChatStore((state) => state.editStage);
  const { getProvidersWithModels, getGroupedModelOptions } = useProviderStore();
  const [curProvider, setCurProvider] = useState<IChatProviderConfig>(
    ctx.getProvider(),
  );
  const [curModel, setCurModel] = useState<IChatModelConfig | ModelOption>(
    ctx.getModel(),
  );
  const providers = useMemo(() => {
    return getProvidersWithModels().filter((provider) => !provider.disabled);
  }, [getProvidersWithModels]);
  const groupedOptions = getGroupedModelOptions();
  const options = useMemo(
    () => groupedOptions[curProvider.name],
    [groupedOptions, curProvider.name],
  );

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
            {curProvider.name}
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
                  const model =
                    find(provider.models, { isDefault: true }) ||
                    provider.models[0];
                  setCurModel(model);
                  editStage(chat.id, {
                    provider: curProvider.name,
                    model: model.name,
                  });
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
            {curModel.label}
          </Button>
        </MenuTrigger>
        <MenuPopover>
          <MenuList>
            {options.map((model: ModelOption) => (
              <MenuItem
                key={model.value}
                disabled={!model.isReady}
                onClick={() => {
                  setCurModel(model);
                  editStage(chat.id, {
                    provider: curProvider.name,
                    model: model.value,
                  });
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
