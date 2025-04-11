import {
  Drawer,
  DrawerHeader,
  DrawerHeaderTitle,
  Button,
  DrawerBody,
  Field,
  Input,
  SpinButton,
  Switch,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';
import { DEFAULT_MAX_TOKENS, MAX_CONTEXT_WINDOW, MAX_TOKENS } from 'consts';
import { t } from 'i18next';
import { IChatModel } from 'providers/types';

export default function ModelFormDrawer({
  open,
  setOpen,
  model,
}: {
  open: boolean;
  setOpen: (state: boolean) => void;
  model: IChatModel | null;
}) {
  return (
    <Drawer
      separator
      open={open}
      onOpenChange={(_, data) => setOpen(data.open)}
      position="end"
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label="Close"
              icon={<Dismiss24Regular />}
              onClick={() => setOpen(false)}
            />
          }
        >
          {model ? t('Provider.Model.Edit') : t('Provider.Model.New')}
        </DrawerHeaderTitle>
      </DrawerHeader>

      <DrawerBody className="flex flex-col gap-3">
        <Field label={t('Provider.Model.Name')} size="small">
          <Input placeholder={t('Common.Required')} />
        </Field>
        <Field label={t('Provider.Model.DisplayName')} size="small">
          <Input />
        </Field>
        <Field label={t('Common.Description')} size="small">
          <Input />
        </Field>
        <Field label={t('Provider.Model.ContextWindow')} size="small">
          <SpinButton
            placeholder={t('Common.Required')}
            min={0}
            max={MAX_CONTEXT_WINDOW}
            size="small"
          />
        </Field>
        <Field label={t('Common.MaxTokens')} size="small">
          <SpinButton
            defaultValue={DEFAULT_MAX_TOKENS}
            min={0}
            max={MAX_TOKENS}
            size="small"
          />
        </Field>
        <Field label={t('Common.InputPrice')} size="small">
          <SpinButton defaultValue={0} min={0} max={999} size="small" />
        </Field>
        <Field label={t('Common.OutputPrice')} size="small">
          <SpinButton defaultValue={0} min={0} max={999} size="small" />
        </Field>
        <Switch label={t('Provider.Model.Vision')} className="-ml-1.5" />
        <Switch label={t('Provider.Model.Tools')} className="-ml-1.5 -mt-2" />
      </DrawerBody>
    </Drawer>
  );
}
