import {
  Checkbox,
  Field,
  Input,
  Label,
  Select,
} from '@fluentui/react-components';
import { IChatProviderConfig } from 'providers/types';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MaskableInput from 'renderer/components/MaskableInput';

export default function ProviderForm({
  provider,
}: {
  provider: IChatProviderConfig | null;
}) {
  const { t } = useTranslation();
  const [name, setName] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [endpoint, setEndpoint] = useState<string>('');

  useEffect(() => {
    setName(provider?.name || '');
    setEndpoint(provider?.apiBase || '');
    setCurrency(provider?.currency || 'USD');
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
          <Input value={name} disabled={provider?.isBuiltIn} />
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
          <Checkbox className="" />
        </Field>
      </div>
      <div className="mt-2">
        <Field size="small" className="field-small">
          <div className="flex justify-start items-center gap-1">
            <Label className="w-[50px]">{t('Common.APIEndpoint')}</Label>
            <Input
              size="small"
              value={endpoint}
              className="flex-grow"
              placeholder={provider?.apiBase || ''}
            />
          </div>
        </Field>
      </div>
      <div className="mt-2">
        <Field size="small" className="field-small">
          <div className="flex justify-start items-center gap-1">
            <Label className="w-[50px]">{t('Common.APIKey')}</Label>
            <MaskableInput className="flex-grow" value={provider?.apiBase} />
          </div>
        </Field>
      </div>
    </div>
  );
}
