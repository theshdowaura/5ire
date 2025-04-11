import { Checkbox, Field, Input, Select } from '@fluentui/react-components';
import { IServiceProvider } from 'providers/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MaskableInput from 'renderer/components/MaskableInput';

export default function ProviderForm({
  provider,
}: {
  provider: IServiceProvider;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [endpoint, setEndpoint] = useState<string>('');

  useEffect(() => {
    setName(provider.name);
    setEndpoint(provider.apiBase);
    setCurrency(provider.currency || 'USD');
    return () => {
      setName('');
      setEndpoint('');
      setCurrency('USD');
    };
  }, [provider]);

  return (
    <div className="provider-form w-full bg-stone-50 dark:bg-stone-800 p-4 border-b border-base">
      <div className="flex justify-around items-center gap-1">
        <Field
          label={t('Common.Name')}
          className="flex-grow min-w-[185px]"
          size="small"
        >
          <Input value={name} disabled={provider.isBuiltin} />
        </Field>
        <Field
          label={t('Common.Currency')}
          className="flex-shrink-0 min-w-[90px]"
          size="small"
        >
          <Select value={currency}>
            <option>USD</option>
            <option>CNY</option>
          </Select>
        </Field>
        <Field label={t('Common.Default')} size="small">
          <Checkbox className=''/>
        </Field>
      </div>
      <div className="mt-2">
        <Field
          label={t('Common.APIEndpoint')}
          className="flex-grow min-w-[185px]"
          size="small"
        >
          <Input
            size="small"
            value={endpoint}
            placeholder={provider.apiBase || ''}
          />
        </Field>
      </div>
      <div className="mt-2">
        <Field
          label={t('Common.APIKey')}
          className="flex-grow min-w-[185px]"
          size="small"
        >
          <MaskableInput />
        </Field>
      </div>
    </div>
  );
}
