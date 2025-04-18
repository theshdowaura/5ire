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
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { useMemo, useState } from 'react';
import useProviderStore, { ModelOption } from 'stores/useProviderStore';

export default function ModelCtrl({
  ctx,
  chat,
}: {
  ctx: IChatContext;
  chat: IChat;
}) {
  const { getProvidersWithModels, getGroupedModelOptions } = useProviderStore();
  const [curProvider, setCurProvider] = useState<IChatProviderConfig>(
    ctx.getProvider(),
  );
  const [curModel, setCurModel] = useState<IChatModelConfig>(ctx.getModel());
  const providers = useMemo(() => {
    return getProvidersWithModels().filter((provider) => !provider.disabled);
  }, [getProvidersWithModels]);
  const groupedOptions = getGroupedModelOptions();

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
              <MenuItem key={provider.name} disabled={!provider.isReady}>
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
            {groupedOptions[curProvider.name].map((model: ModelOption) => (
              <MenuItem key={model.value} disabled={!model.isReady}>
                {model.label}
              </MenuItem>
            ))}
          </MenuList>
        </MenuPopover>
      </Menu>
    </div>
  );
}
