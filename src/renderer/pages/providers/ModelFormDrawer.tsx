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
import {
  DEFAULT_CONTEXT_WINDOW,
  DEFAULT_MAX_TOKENS,
  MAX_CONTEXT_WINDOW,
  MAX_TOKENS,
} from 'consts';
import { t } from 'i18next';
import { isNil } from 'lodash';
import { IChatModelConfig } from 'providers/types';
import { useEffect, useState } from 'react';

export default function ModelFormDrawer({
  open,
  setOpen,
  model,
}: {
  open: boolean;
  setOpen: (state: boolean) => void;
  model: IChatModelConfig | null;
}) {
  const [name, setName] = useState<string>('');
  const [label, setLabel] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [contextWindow, setContextWindow] = useState<number>(
    DEFAULT_CONTEXT_WINDOW,
  );
  const [maxTokens, setMaxTokens] = useState<number>(DEFAULT_MAX_TOKENS);
  const [inputPrice, setInputPrice] = useState<number>(0);
  const [outputPrice, setOutputPrice] = useState<number>(0);
  const [vision, setVision] = useState<boolean>(false);
  const [tools, setTools] = useState<boolean>(false);
  const [disabled, setDisabled] = useState<boolean>(true);

  const onSave = () => {};
  const onDelete = () => {};

  useEffect(() => {
    if (!model) return;
    setName(model.name);
    setLabel(model.label || '');
    setDescription(model.description || '');
    setContextWindow(model.contextWindow || DEFAULT_CONTEXT_WINDOW);
    setMaxTokens(model.maxTokens || DEFAULT_MAX_TOKENS);
    setDisabled(!model.disabled);
    setInputPrice(model.inputPrice || 0);
    setOutputPrice(model.outputPrice || 0);
    setVision(model.capabilities?.vision?.enabled || false);
    setTools(model.capabilities?.tools?.enabled || false);
  }, [model]);

  const deleteButton = () => {
    if (!model) return null;
    return model.isBuiltIn ? (
      <div className="my-2 border border-zinc-300 dark:border-zinc-600 rounded p-1 text-center text-small text-zinc-400 dark:text-zinc-500">
        {t('Provider.Model.BuiltInModelCannotBeDeleted')}
      </div>
    ) : (
      <div className="my-2 border border-red-400 dark:border-red-800 rounded p-1">
        <Button
          size="small"
          appearance="subtle"
          className="w-full text-red-00 dark:text-red-400"
          onClick={onDelete}
        >
          {t('Common.Delete')}
        </Button>
      </div>
    );
  };

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
          <Input
            placeholder={t('Common.Required')}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Field>
        <Field label={t('Provider.Model.DisplayName')} size="small">
          <Input value={label} onChange={(e) => setLabel(e.target.value)} />
        </Field>
        <Field label={t('Common.Description')} size="small">
          <Input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>
        <div className="flex justify-evenly items-center gap-1">
          <Field label={t('Provider.Model.ContextWindow')} size="small">
            <SpinButton
              placeholder={t('Common.Required')}
              min={0}
              max={MAX_CONTEXT_WINDOW}
              value={contextWindow}
              onChange={(e, data) => setContextWindow(data.value as number)}
              size="small"
            />
          </Field>
          <Field label={t('Common.MaxTokens')} size="small">
            <SpinButton
              value={maxTokens}
              min={0}
              max={MAX_TOKENS}
              size="small"
            />
          </Field>
        </div>
        <div className="flex justify-evenly items-center gap-1">
          <Field label={t('Common.InputPrice')} size="small">
            <SpinButton
              value={inputPrice}
              min={0}
              max={999}
              size="small"
              onChange={(e, data) => setInputPrice(data.value as number)}
            />
          </Field>
          <Field label={t('Common.OutputPrice')} size="small">
            <SpinButton
              value={outputPrice}
              min={0}
              max={999}
              size="small"
              onChange={(e, data) => setOutputPrice(data.value as number)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-1 field-small">
          <Switch
            disabled={isNil(model?.capabilities?.vision)}
            label={t('Provider.Model.Vision')}
            className="-ml-1.5"
            checked={vision}
            onChange={(e, data) => setVision(data.checked)}
          />
          <Switch
            disabled={isNil(model?.capabilities?.tools)}
            label={t('Provider.Model.Tools')}
            className="-ml-1.5"
            checked={tools}
            onChange={(e, data) => setTools(data.checked)}
          />
        </div>
        <Switch
          label={t('Common.Enabled')}
          className="-ml-1.5 -mt-2 field-small"
          checked={!disabled}
          onChange={(e, data) => setDisabled(!data.checked)}
        />

        <div className="py-2">
          <Button appearance="primary" className="w-full" onClick={onSave}>
            {t('Common.Save')}
          </Button>
        </div>
        <div className="flex-grow" />
        {deleteButton()}
      </DrawerBody>
    </Drawer>
  );
}
