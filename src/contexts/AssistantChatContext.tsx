import { createContext, useContext, type ReactNode } from 'react';
import { useAssistantChat, type AssistantChat } from '@/hooks/useAssistantChat';

const AssistantChatContext = createContext<AssistantChat | null>(null);

/**
 * Satu percakapan Catat cepat untuk seluruh app (setara panel web yang di-mount sekali):
 * menutup lalu membuka lagi layar QuickAdd tetap melanjutkan chat yang sama.
 */
export function AssistantChatProvider({ children }: { children: ReactNode }) {
  const chat = useAssistantChat();
  return (
    <AssistantChatContext.Provider value={chat}>
      {children}
    </AssistantChatContext.Provider>
  );
}

export function useAssistantChatContext(): AssistantChat {
  const chat = useContext(AssistantChatContext);
  if (!chat) {
    throw new Error('useAssistantChatContext di luar AssistantChatProvider');
  }
  return chat;
}
