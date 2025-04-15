import {
  Field,
  InfoLabel,
  Input,
  Label,
  Select,
  Switch,
} from '@fluentui/react-components';
import { getChatAPISchema } from 'providers';
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
        <Field className="flex-grow min-w-[185px]" size="small">
          <InfoLabel
            size="small"
            info={
              provider?.isBuiltIn
                ? t('Provider.Tooltip.NameOfBuiltinProviderIsReadyOnly')
                : t('Provider.Tooltip.NameOfProviderMustBeUnique')
            }
          >
            {t('Common.Name')}
          </InfoLabel>
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
        <Field size="small" className="-mb-2 ml-1">
          <Label className="w-[50px] -mb-0.5" size="small">
            {t('Common.Default')}
          </Label>
          <Switch checked={provider?.isDefault || false} className="-ml-1" />
        </Field>
        <Field size="small" className="-mb-2">
          <Label className="w-[50px] -mb-0.5" size="small">
            {t('Common.Enabled')}
          </Label>
          <Switch checked={!provider?.disabled} className="-ml-1" />
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
      {getChatAPISchema(provider?.name || '').includes('secret') && (
        <div className="mt-2">
          <Field size="small" className="field-small">
            <div className="flex justify-start items-center gap-1">
              <Label className="w-[50px]">{t('Common.SecretKey')}</Label>
              <MaskableInput
                className="flex-grow"
                value={provider?.apiSecret}
              />
            </div>
          </Field>
        </div>
      )}
    </div>
  );
}
