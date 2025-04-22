import { useTranslation } from 'react-i18next';

import './Settings.scss';

import Version from './Version';
import AppearanceSettings from './AppearanceSettings';
import EmbedSettings from './EmbedSettings';
import LanguageSettings from './LanguageSettings';

export default function Settings() {
  const { t } = useTranslation();

  return (
    <div className="page h-full" id="page-settings">
      <div className="page-top-bar" />
      <div className="page-header">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl">{t('Common.Settings')}</h1>
        </div>
      </div>
      <div className="overflow-y-auto h-full pb-28 -mr-5 pr-5">
        <div>迁移至 Provider</div>
        <EmbedSettings />
        <AppearanceSettings />
        <LanguageSettings />
        <Version />
      </div>
    </div>
  );
}
