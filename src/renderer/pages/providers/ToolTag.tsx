import { Tooltip } from '@fluentui/react-components';
import { isUndefined } from 'lodash';
import { getChatModel } from 'providers';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useSettingsStore from 'stores/useSettingsStore';

export default function ToolTag(
  props: {
    provider: string;
    model: string;
  } & any,
) {
  const { provider, model, ...rest } = props;
  const { getToolState } = useSettingsStore();

  const originalSupport = useMemo(
    () => getChatModel(provider, model).toolEnabled || false,
    [provider, model],
  );

  const actualSupport = useMemo(() => {
    let toolEnabled = getToolState(provider, model);
    if (isUndefined(toolEnabled)) {
      toolEnabled = originalSupport;
    }
    return toolEnabled;
  }, [provider, model, originalSupport]);

  const { t } = useTranslation();
  const tip = t(actualSupport ? 'Tool.Supported' : 'Tool.NotSupported');

  return (
    <Tooltip
      content={{
        children: tip,
      }}
      positioning="above-start"
      withArrow
      relationship="label"
      {...rest}
    >
      <div className="flex text-center justify-start gap-1 items-center rounded-lg text-xs text-gray-800 dark:text-gray-400 bg-gray-100 dark:bg-stone-800 pl-1.5 pr-1">
        {t('Tags.Tools')}
        <span
          className={
            actualSupport
              ? 'text-green-400 dark:text-green-700'
              : 'text-gray-400 dark:text-gray-600'
          }
        >
          ●
        </span>
      </div>
    </Tooltip>
  );
}
