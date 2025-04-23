import { Toolbar } from '@fluentui/react-components';
import ChatContext from '../../../../ChatContext';
import useChatStore from 'stores/useChatStore';
import { IChat } from 'intellichat/types';
import ModelCtrl from './ModelCtrl';
import PromptCtrl from './PromptCtrl';
import TemperatureCtrl from './TemperatureCtrl';
import MaxTokensCtrl from './MaxTokensCtrl';
import ImgCtrl from './ImgCtrl';
import KnowledgeCtrl from './KnowledgeCtrl';
import CtxNumCtrl from './CtxNumCtrl';

export default function EditorToolbar({
  isReady,
  onConfirm,
}: {
  isReady: boolean;
  onConfirm: () => void;
}) {
  const chat = useChatStore((state) => state.chat) as IChat;
  return (
    <div className="py-1.5 bg-brand-surface-1 relative">
      <Toolbar
        aria-label="Default"
        size="small"
        className="flex items-center gap-3 ml-2 editor-toolbar"
      >
        <ModelCtrl ctx={ChatContext} chat={chat} />
        <PromptCtrl ctx={ChatContext} chat={chat} disabled={!isReady} />
        <KnowledgeCtrl ctx={ChatContext} chat={chat}  disabled={!isReady}/>
        <MaxTokensCtrl ctx={ChatContext} chat={chat} onConfirm={onConfirm} disabled={!isReady}/>
        <TemperatureCtrl ctx={ChatContext} chat={chat}  disabled={!isReady}/>
        <CtxNumCtrl ctx={ChatContext} chat={chat} disabled={!isReady}/>
        <ImgCtrl ctx={ChatContext} chat={chat} disabled={!isReady} />
      </Toolbar>
    </div>
  );
}
