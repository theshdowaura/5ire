import {
  List,
  ListItem,
  MenuTrigger,
  MenuButton,
  MenuPopover,
  MenuList,
  MenuItem,
  Menu,
  MenuItemSwitch,
} from '@fluentui/react-components';
import {
  bundleIcon,
  ChevronRightRegular,
  MoreVerticalFilled,
  MoreVerticalRegular,
} from '@fluentui/react-icons';
import { t } from 'i18next';
import { useEffect, useMemo } from 'react';
import useProviderStore from 'stores/useProviderStore';

const MoreVerticalIcon = bundleIcon(MoreVerticalFilled, MoreVerticalRegular);

export default function ProviderList({ height = 400 }: { height: number }) {
  const selectedProvider = useProviderStore((state) => state.provider);
  const providers = useProviderStore((state) => state.providers);
  const { setProvider } = useProviderStore();

  const providerNames = useMemo(
    () =>
      Object.keys(providers).sort((a: string, b: string) => a.localeCompare(b)),
    [providers],
  );

  useEffect(() => {
    if (!selectedProvider) {
      // If no provider is selected, select the first one
      setProvider(providerNames[0]);
    }
  }, [selectedProvider, providerNames, setProvider]);

  return (
    <List
      className="overflow-y-auto"
      style={{
        height,
      }}
    >
      {providerNames.map((providerName) => {
        return (
          <ListItem
            key={providerName}
            aria-label={providerName}
            className="block hover:bg-stone-100 dark:hover:bg-stone-700 group"
          >
            <div
              className={`flex justify-between items-center border-b border-gray-100 dark:border-stone-800 w-full ${selectedProvider?.name === providerName ? 'bg-stone-100 dark:bg-stone-700' : ''}`}
            >
              <button
                type="button"
                onClick={() => setProvider(providerName)}
                className="flex-grow pl-4 py-2 text-left"
              >
                {providerName}
              </button>
              <div className="flex justify-center items-center">
                {selectedProvider?.name === providerName && (
                  <ChevronRightRegular />
                )}
                <div className="invisible group-hover:visible">
                  <Menu>
                    <MenuTrigger disableButtonEnhancement>
                      <MenuButton
                        icon={<MoreVerticalIcon />}
                        appearance="transparent"
                        size="small"
                      />
                    </MenuTrigger>
                    <MenuPopover>
                      <MenuList>
                        <MenuItem disabled>
                          {selectedProvider?.name}
                          {selectedProvider?.isBuiltIn && (
                            <span className="text-xs ml-2">(build-in)</span>
                          )}
                        </MenuItem>
                        {selectedProvider?.isBuiltIn || (
                          <MenuItem onClick={() => {}}>
                            {t('Common.Delete')}
                          </MenuItem>
                        )}
                        <MenuItemSwitch name="enabled" value="enabled">
                          {t('Common.Enabled')}
                        </MenuItemSwitch>
                      </MenuList>
                    </MenuPopover>
                  </Menu>
                </div>
              </div>
            </div>
          </ListItem>
        );
      })}
    </List>
  );
}
