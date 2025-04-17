import { capitalize, isNil } from 'lodash';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import useProviderStore from 'stores/useProviderStore';

export default function CapabilityTag(
  props: {
    provider: string;
    model: string;
    capability: 'json' | 'tools' | 'vision';
  } & any,
) {
  const {
    provider: providerName,
    model: modelName,
    capability: capabilityName,
  } = props;
  const { providers } = useProviderStore();

  const capability = useMemo(() => {
    const provider = providers.find((p) => p.name === providerName);
    if (!provider) return null;
    const model = provider.models.find((m) => m.name === modelName);
    if (!model) return null;
    return (
      model.capabilities[capabilityName as keyof typeof model.capabilities] ||
      null
    );
  }, [providerName, providers, modelName]);

  const originalSupport = useMemo(() => {
    if (isNil(capability)) return false;
    return true;
  }, [capability]);

  const actualSupport = useMemo(() => {
    return capability?.enabled || false;
  }, [capability]);

  const { t } = useTranslation();

  const colorCls = useMemo<string>(() => {
    return (
      {
        json: 'bg-teal-50 dark:bg-teal-900 text-teal-600 dark:text-teal-300',
        tools:
          'bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300',
        vision:
          'bg-purple-50 dark:bg-purple-900 text-purple-600 dark:text-purple-300',
      } as { [key: string]: string }
    )[capabilityName];
  }, [capabilityName]);

  return originalSupport ? (
    <div
      className={`flex text-center justify-start gap-1 items-center rounded-lg text-xs pl-1.5 pr-1 ${colorCls}`}
    >
      {t(`Tags.${capitalize(capabilityName)}`)}
      <span
        style={{ fontSize: '10px' }}
        className={
          actualSupport
            ? 'text-green-400 dark:text-green-700'
            : 'text-gray-400 dark:text-gray-600'
        }
      >
        ●
      </span>
    </div>
  ) : null;
}
