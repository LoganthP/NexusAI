import { create } from 'zustand'
import type { ChatMessage } from '@/services/api'

interface ChatState {
    messages: ChatMessage[]
    isLoading: boolean
    conversationId: string | null
    addMessage: (message: ChatMessage) => void
    setLoading: (loading: boolean) => void
    clearMessages: () => void
    setConversationId: (id: string | null) => void
    setMessages: (messages: ChatMessage[]) => void
}

export const useChatStore = create<ChatState>((set) => ({
    messages: [],
    isLoading: false,
    conversationId: null,
    addMessage: (message) =>
        set((state) => ({ messages: [...state.messages, message] })),
    setLoading: (loading) => set({ isLoading: loading }),
    clearMessages: () => set({ messages: [], conversationId: null }),
    setConversationId: (id) => set({ conversationId: id }),
    setMessages: (messages) => set({ messages }),
}))
