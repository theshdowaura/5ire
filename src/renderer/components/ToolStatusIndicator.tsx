import { Tooltip } from '@fluentui/react-components';
import { isNil } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useProviderStore from 'stores/useProviderStore';

export default function ToolStatusIndicator(
  props: {
    provider: string;
    model: string;
    withTooltip?: boolean;
  } & any,
) {
  const {
    provider: providerName,
    model: modelName,
    withTooltip,
    ...rest
  } = props;
  const { getAvailableModel } = useProviderStore();

  const model = useMemo(
    () => getAvailableModel(providerName, modelName),
    [providerName, modelName],
  );

  // if the tools capability is not null or undefined, it means the model supports tools
  const originalSupport = useMemo(
    () => !isNil(model.capabilities?.tools),
    [providerName, modelName],
  );

  const actualSupport = useMemo(() => {
    return !!model.capabilities?.tools?.enabled;
  }, [providerName, modelName]);

  const { t } = useTranslation();
  const tip = t(actualSupport ? 'Tool.Supported' : 'Tool.NotSupported');

  const indicator = () => {
    return (
      <div
        className={`flex text-center justify-center items-center rounded-full border ${originalSupport ? ' border-green-400 dark:border-green-800' : 'border-gray-300 dark:border-neutral-600'}`}
        style={{ width: 14, height: 14, borderStyle: 'solid' }}
      >
        {actualSupport ? (
          <div
            className="rounded-full bg-green-400 dark:bg-green-600"
            style={{ width: 10, height: 10 }}
            {...rest}
          />
        ) : (
          <div
            className="rounded-full bg-neutral-300  dark:bg-neutral-600"
            style={{ width: 10, height: 10 }}
            {...rest}
          />
        )}
      </div>
    );
  };

  return withTooltip ? (
    <Tooltip
      content={{
        children: tip,
      }}
      positioning="above-start"
      withArrow
      relationship="label"
    >
      {indicator()}
    </Tooltip>
  ) : (
    indicator()
  );
}
