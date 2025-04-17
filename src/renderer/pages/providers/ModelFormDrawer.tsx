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
  InfoLabel,
  SpinButtonChangeEvent,
  SpinButtonOnChangeData,
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
import { IChatModelConfig, IChatProviderConfig } from 'providers/types';
import { useEffect, useMemo, useState } from 'react';
import useProviderStore from 'stores/useProviderStore';

export default function ModelFormDrawer({
  open,
  setOpen,
  model,
  onSaved,
}: {
  open: boolean;
  setOpen: (state: boolean) => void;
  model: IChatModelConfig | null;
  onSaved: () => void;
}) {
  const provider = useProviderStore(
    (state) => state.provider as IChatProviderConfig,
  );
  const { createModel, updateModel, deleteModel } = useProviderStore();
  const [name, setName] = useState<string>('');
  const [nameError, setNameError] = useState<string | null>(null);
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
  const [disabled, setDisabled] = useState<boolean>(false);

  const modelNames = useMemo(
    () => provider.models.map((m) => m.name),
    [provider.models],
  );

  const formatter = (value: number) => {
    return `${provider.currency === 'USD' ? '$' : '¥'}${value}`;
  };

  const parser = (formattedValue: string | null) => {
    if (formattedValue === null) {
      return NaN;
    }

    return parseFloat(formattedValue.replace(/[$¥]/g, ''));
  };

  const onSpinButtonChange = (setValue: (value: number) => void) => {
    return (_ev: SpinButtonChangeEvent, data: SpinButtonOnChangeData) => {
      if (data.value !== undefined) {
        setValue(data.value as number);
      } else if (data.displayValue !== undefined) {
        const newValue = parser(data.displayValue);
        if (!Number.isNaN(newValue)) {
          setValue(newValue);
        } else {
          console.error(`Cannot parse "${data.displayValue}" as a number.`);
        }
      }
    };
  };

  const reset = () => {
    setName('');
    setLabel('');
    setDescription('');
    setContextWindow(DEFAULT_CONTEXT_WINDOW);
    setMaxTokens(DEFAULT_MAX_TOKENS);
    setDisabled(false);
    setInputPrice(0);
    setOutputPrice(0);
    setVision(false);
    setTools(false);
  };

  const onSave = () => {
    if (nameError) {
      return;
    }
    if (name.trim() === '') {
      setNameError(t('Common.Required'));
    } else {
      setNameError('');
    }
    const payload = {
      name,
      label,
      description,
      contextWindow,
      maxTokens,
      inputPrice,
      outputPrice,
      disabled,
      isReady: true,
      capabilities: {
        tools: (!model?.isBuiltIn || model?.capabilities?.tools) && {
          enabled: tools,
        },
        vision: (!model?.isBuiltIn || model?.capabilities?.vision) && {
          enabled: vision,
        },
      },
    };
    if (model) {
      updateModel(model.name, payload);
    } else {
      createModel(payload);
    }
    onSaved();
    setOpen(false);
    setTimeout(() => reset(), 500);
  };

  const onDelete = () => {
    if (model) {
      deleteModel(model.name as string);
      setOpen(false);
      reset();
    }
  };

  useEffect(() => {
    if (model) {
      setName(model.name);
      setLabel(model.label || '');
      setDescription(model.description || '');
      setContextWindow(model.contextWindow || DEFAULT_CONTEXT_WINDOW);
      setMaxTokens(model.maxTokens || DEFAULT_MAX_TOKENS);
      setDisabled(model.disabled || false);
      setInputPrice(model.inputPrice || 0);
      setOutputPrice(model.outputPrice || 0);
      setVision(model.capabilities?.vision?.enabled || false);
      setTools(model.capabilities?.tools?.enabled || false);
    } else {
      reset();
    }
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

      <DrawerBody className="flex flex-col gap-4">
        <Field
          size="small"
          validationMessage={nameError}
          validationState={nameError ? 'error' : undefined}
        >
          <InfoLabel
            info={t('Provider.Model.BuiltInModelCannotBeRenamed')}
            size="small"
          >
            {t('Provider.Model.Name')}
          </InfoLabel>
          <Input
            disabled={!!model?.isBuiltIn}
            placeholder={t('Common.Required')}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (modelNames.includes(e.target.value)) {
                setNameError(t('Provider.Model.NameAlreadyExists'));
              } else {
                setNameError(null);
              }
            }}
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
              step={1}
              max={MAX_CONTEXT_WINDOW}
              value={contextWindow}
              onChange={onSpinButtonChange(setContextWindow)}
              size="small"
            />
          </Field>
          <Field label={t('Common.MaxTokens')} size="small">
            <SpinButton
              value={maxTokens}
              min={0}
              step={1}
              max={MAX_TOKENS}
              onChange={onSpinButtonChange(setMaxTokens)}
              size="small"
            />
          </Field>
        </div>
        <div className="flex justify-evenly items-center gap-1">
          <Field size="small">
            <InfoLabel size="small" info={t('Provider.Model.PriceUnit')}>
              {t('Common.InputPrice')}{' '}
            </InfoLabel>
            <SpinButton
              value={inputPrice}
              min={0}
              step={0.000001}
              max={999}
              size="small"
              displayValue={formatter(inputPrice)}
              onChange={onSpinButtonChange(setInputPrice)}
            />
          </Field>
          <Field size="small">
            <InfoLabel size="small" info={t('Provider.Model.PriceUnit')}>
              {t('Common.OutputPrice')}{' '}
            </InfoLabel>
            <SpinButton
              value={outputPrice}
              min={0}
              step={0.000001}
              max={999}
              size="small"
              displayValue={formatter(outputPrice)}
              onChange={onSpinButtonChange(setOutputPrice)}
            />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-1 field-small">
          <Switch
            disabled={model ? isNil(model?.capabilities?.vision) : false}
            label={t('Provider.Model.Vision')}
            className="-ml-1.5"
            checked={vision}
            onChange={(e, data) => setVision(data.checked)}
          />
          <Switch
            disabled={model ? isNil(model?.capabilities?.tools) : false}
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
