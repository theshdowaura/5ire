import { Button, Input } from '@fluentui/react-components';
import { IChat } from 'intellichat/types';
import useChatStore from 'stores/useChatStore';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useCallback, useRef, useState } from 'react';
import Mousetrap from 'mousetrap';
import { useTranslation } from 'react-i18next';
import ChatIcon from './ChatIcon';

export default function ChatItem({
  chat,
  collapsed,
}: {
  chat: IChat;
  collapsed: boolean;
}) {
  const { t } = useTranslation();
  const curChat = useChatStore((state) => state.chat);
  const [name, setName] = useState(chat.name || '');
  const [editable, setEditable] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: chat.id,
    data: { folderId: chat.folderId || null },
  });
  const style = {
    transform: CSS.Translate.toString(transform),
  };

  const updateChat = useChatStore((state) => state.updateChat);

  const updateChatName = useCallback(
    async (newName: string) => {
      if (newName !== chat.name && newName.trim().length > 0) {
        await updateChat({ id: chat.id, name: newName.trim() });
      }
      setEditable(false);
      Mousetrap.unbind('esc');
    },
    [chat.id, chat.name, updateChat],
  );

  return (
    <div
      key={chat.id}
      onDoubleClick={() => {
        if (!collapsed) {
          setEditable(true);
          setTimeout(() => {
            inputRef.current?.focus();
          }, 0);
          Mousetrap.bind('esc', () => {
            setName(chat.name);
            setEditable(false);
          });
        }
      }}
    >
      {editable ? (
        <div className="px-2 py-1">
          <Input
            ref={inputRef}
            size="small"
            value={name}
            placeholder={t('Input.Hint.EnterSubmitEscCancel')}
            className="w-full"
            appearance="underline"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                updateChatName(name);
                setEditable(false);
              }
            }}
            onChange={(e) => {
              setName(e.target.value);
            }}
            onBlur={() => updateChatName(name)}
          />
        </div>
      ) : (
        <Button
          style={style}
          ref={setNodeRef}
          {...listeners}
          {...attributes}
          icon={
            <ChatIcon
              chat={chat}
              isActive={curChat && curChat.id === chat.id}
            />
          }
          appearance="subtle"
          className="w-full justify-start latin"
        >
          {collapsed ? null : (
            <div className="text-sm truncate ...">
              {chat.name?.trim() ||
                chat.summary
                  ?.substring(0, 40)
                  .replace(/&lt;/g, '<')
                  .replace(/&gt;/g, '>')
                  .replace(/&amp;/g, '&')}
            </div>
          )}
        </Button>
      )}
    </div>
  );
}
