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
import { IChatProviderConfig } from 'providers/types';
import { useEffect, useState } from 'react';
import ConfirmDialog from 'renderer/components/ConfirmDialog';
import useProviderStore from 'stores/useProviderStore';

const MoreVerticalIcon = bundleIcon(MoreVerticalFilled, MoreVerticalRegular);

export default function ProviderList({ height = 400 }: { height: number }) {
  const selectedProvider = useProviderStore((state) => state.provider);
  const [targetProvider, setTargetProvider] =
    useState<IChatProviderConfig | null>(null);
  const providers = useProviderStore((state) => state.providers);
  const { setProvider, deleteProvider } = useProviderStore();
  const [delConfirmDialogOpen, setDelConfirmDialogOpen] = useState(false);

  useEffect(() => {
    if (!selectedProvider) {
      // If no provider is selected, select the first one
      setProvider(Object.keys(providers)[0]);
    }
  }, [selectedProvider, setProvider, providers]);

  return (
    <div>
      <List
        className="overflow-y-auto"
        style={{
          height,
        }}
      >
        {Object.values(providers)
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((provider: IChatProviderConfig) => {
            return (
              <ListItem
                key={provider.name}
                aria-label={provider.name}
                className="block hover:bg-stone-100 dark:hover:bg-stone-700 group"
              >
                <div
                  className={`flex justify-between items-center border-b border-gray-100 dark:border-stone-800 w-full ${selectedProvider?.name === provider.name ? 'bg-stone-100 dark:bg-stone-700' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => setProvider(provider.name)}
                    className="flex-grow pl-4 py-2 text-left"
                  >
                    {provider.name}
                  </button>
                  <div className="flex justify-center items-center">
                    {selectedProvider?.name === provider.name && (
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
                              {provider?.name}
                              {provider?.isBuiltIn && (
                                <span className="text-xs ml-2">(build-in)</span>
                              )}
                            </MenuItem>
                            {provider?.isBuiltIn || (
                              <MenuItem
                                onClick={() => {
                                  setTargetProvider(provider);
                                  setDelConfirmDialogOpen(true);
                                }}
                              >
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
      <ConfirmDialog
        open={delConfirmDialogOpen}
        setOpen={setDelConfirmDialogOpen}
        title={`${t('Common.Delete')} ${targetProvider?.name}`}
        message={t('Providers.DeleteProviderConfirmMessage')}
        onConfirm={() => {
          if (targetProvider) {
            deleteProvider(targetProvider.name);
            setTargetProvider(null);
          }
        }}
      />
    </div>
  );
}
