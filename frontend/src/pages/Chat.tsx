import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useChatStore } from '@/store/useChatStore'
import { sendChatMessage, uploadDocuments, type ChatMessage as ChatMessageType, type SourceNode } from '@/services/api'

import ReactMarkdown from 'react-markdown'
import { useLocation } from 'react-router-dom'

const suggestedQueries = [
    { icon: 'description', text: 'What is the company leave policy?' },
    { icon: 'bar_chart', text: 'Summarize the Q4 financial report' },
    { icon: 'gavel', text: 'Explain GDPR compliance rules' },
    { icon: 'contract', text: 'What are the contract termination terms?' },
    { icon: 'work', text: 'Describe the onboarding process' },
    { icon: 'payments', text: 'What is the reimbursement policy?' },
]

function TypingIndicator() {
    return (
        <div className="flex items-center gap-1.5 px-3 py-2">
            {[0, 1, 2].map((i) => (
                <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-primary/60"
                    animate={{ y: [0, -5, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
            ))}
        </div>
    )
}

function SourcesPanel({ sources }: { sources: SourceNode[] }) {
    const [expanded, setExpanded] = useState(false)
    return (
        <div className="mt-4">
            <button
                onClick={() => setExpanded((p) => !p)}
                className="flex items-center gap-1.5 text-[10px] font-bold text-primary/80 uppercase tracking-wider hover:text-primary transition-colors"
            >
                <span className="material-symbols-outlined text-[14px]">
                    {expanded ? 'expand_less' : 'expand_more'}
                </span>
                {expanded ? 'Hide' : 'Show'} Sources ({sources.length})
            </button>
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 space-y-2 overflow-hidden"
                    >
                        {sources.map((src, i) => {
                            const filename = (src.metadata as { filename?: string })?.filename || `Source ${i + 1}`
                            const score = typeof src.score === 'number' ? (src.score * 100).toFixed(0) : null
                            return (
                                <div key={i} className="p-3 bg-primary/5 border border-primary/20 rounded-xl">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="flex items-center gap-1.5 text-[10px] font-bold text-primary uppercase tracking-wider">
                                            <span className="material-symbols-outlined text-[13px]">memory</span>
                                            {filename}
                                        </span>
                                        {score && (
                                            <span className="text-[10px] font-bold text-emerald-400">{score}% relevance</span>
                                        )}
                                    </div>
                                    {src.text && (
                                        <p className="text-[11px] text-slate-400 leading-relaxed line-clamp-3">
                                            {src.text.slice(0, 200)}{src.text.length > 200 ? '…' : ''}
                                        </p>
                                    )}
                                </div>
                            )
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

function ModeBadge({ mode }: { mode?: 'rag' | 'general' }) {
    if (!mode) return null
    return (
        <span className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${mode === 'rag'
            ? 'bg-primary/10 border-primary/30 text-primary'
            : 'bg-violet-500/10 border-violet-500/30 text-violet-400'
            }`}>
            <span>{mode === 'rag' ? '📄' : '🧠'}</span>
            {mode === 'rag' ? 'Document Answer' : 'General AI Knowledge'}
        </span>
    )
}

function ChatBubble({ message }: { message: ChatMessageType }) {
    const [copied, setCopied] = useState(false)
    const isUser = message.role === 'user'
    const handleCopy = () => { navigator.clipboard.writeText(message.content); setCopied(true); setTimeout(() => setCopied(false), 2000) }

    return (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}
            className={`flex gap-4 max-w-4xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${isUser ? 'bg-slate-800 border-slate-700' : 'bg-primary/20 border-primary/30'
                }`}>
                <span className={`material-symbols-outlined ${isUser ? 'text-slate-400' : 'text-primary'}`}>
                    {isUser ? 'person' : 'smart_toy'}
                </span>
            </div>
            <div className={`flex flex-col gap-2 ${isUser ? 'items-end' : ''}`}>
                <div className={isUser
                    ? 'bg-primary text-background-dark p-5 rounded-2xl rounded-tr-none font-medium neon-shadow-sm'
                    : 'glass-panel bg-glass p-5 rounded-2xl rounded-tl-none text-slate-200 border border-primary/20 neon-shadow-xs'
                }>
                    {isUser ? (
                        <p className="leading-relaxed text-sm">{message.content}</p>
                    ) : (
                        <>
                            <div className="markdown-content text-sm">
                                <ReactMarkdown>{message.content}</ReactMarkdown>
                            </div>
                            {message.sources && message.sources.length > 0 && (
                                <SourcesPanel sources={message.sources} />
                            )}
                            <div className="mt-3">
                                <ModeBadge mode={message.mode} />
                            </div>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">
                        {isUser ? 'You' : 'Nexus AI'} • {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isUser && (
                        <button onClick={handleCopy} className="text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[14px]">{copied ? 'check' : 'content_copy'}</span>
                        </button>
                    )}
                </div>
            </div>
        </motion.div>
    )
}

const SESSION_STORAGE_KEY = 'nexus-chat-session'

export function Chat() {
    const { messages, isLoading, addMessage, setLoading, clearMessages, setMessages } = useChatStore()
    const [input, setInput] = useState('')
    const [isListening, setIsListening] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const location = useLocation()


    // Restore messages from localStorage on mount
    useEffect(() => {
        if (messages.length === 0) {
            try {
                const saved = localStorage.getItem(SESSION_STORAGE_KEY)
                if (saved) {
                    const parsed = JSON.parse(saved)
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setMessages(parsed.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })))
                    }
                }
            } catch { /* ignore */ }
        }
    }, [])

    // Persist messages to localStorage whenever they change
    useEffect(() => {
        if (messages.length > 0) {
            try {
                localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(messages))
            } catch { /* ignore */ }
        }
    }, [messages])

    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])
    useEffect(() => {
        const q = (location.state as { initialQuery?: string })?.initialQuery
        if (q) handleSend(q)
    }, [])

    const handleSend = async (queryText?: string) => {
        const query = queryText || input.trim()
        if (!query || isLoading) return
        setInput('')
        addMessage({ id: crypto.randomUUID(), role: 'user', content: query, timestamp: new Date() })
        setLoading(true)
        try {
            const response = await sendChatMessage(query)
            addMessage({ id: crypto.randomUUID(), role: 'assistant', content: response.answer, sources: response.sources, mode: response.mode, timestamp: new Date() })
        } catch {
            addMessage({ id: crypto.randomUUID(), role: 'assistant', content: 'Neural engine encountered an error. Please ensure the backend is running.', timestamp: new Date() })
        } finally { setLoading(false) }
    }

    const handleClear = () => {
        clearMessages()
        localStorage.removeItem(SESSION_STORAGE_KEY)
    }

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || [])
        if (files.length === 0) return
        setIsUploading(true)
        try {
            await uploadDocuments(files)
            addMessage({ id: crypto.randomUUID(), role: 'assistant', content: `Successfully uploaded and indexed ${files.length} document(s). You can now query them.`, timestamp: new Date() })
        } catch {
            addMessage({ id: crypto.randomUUID(), role: 'assistant', content: 'Failed to upload documents. Please try again.', timestamp: new Date() })
        } finally {
            setIsUploading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }

    const toggleVoiceInput = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            addMessage({ id: crypto.randomUUID(), role: 'assistant', content: 'Speech recognition is not supported in your browser.', timestamp: new Date() })
            return
        }

        if (isListening) {
            setIsListening(false)
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'

        recognition.onstart = () => setIsListening(true)
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setInput(prev => prev + (prev ? ' ' : '') + transcript)
        }

        recognition.start()
    }


    return (
        <div className="flex gap-6 h-[calc(100vh-7rem)]">
            {/* Main Chat */}
            <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-slate-100 font-bold text-lg">Active Session</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                            <span className="text-primary text-[10px] font-bold uppercase tracking-[0.15em]">Neural Chat Active</span>
                        </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={handleClear}>
                        <span className="material-symbols-outlined text-[16px]">add</span> New Session
                    </Button>
                </div>

                <div className="glass-panel bg-glass rounded-2xl flex-1 flex flex-col overflow-hidden border border-primary/10">
                    <div className="flex-1 overflow-y-auto p-8 space-y-8 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full">
                                <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
                                    <div className="w-16 h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4 border border-primary/30 neon-shadow">
                                        <span className="material-symbols-outlined text-primary text-3xl">smart_toy</span>
                                    </div>
                                    <h2 className="text-xl font-bold text-slate-100 mb-2">Nexus AI Assistant</h2>
                                    <p className="text-slate-500 text-sm max-w-md mb-8">Query your enterprise knowledge base — HR policies, financials, legal contracts, compliance docs.</p>
                                    <div className="grid grid-cols-2 gap-3 max-w-lg">
                                        {suggestedQueries.map((q) => (
                                            <motion.button key={q.text} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                                onClick={() => handleSend(q.text)}
                                                className="text-left p-3 rounded-xl glass-panel hover:border-primary/30 transition-all text-sm text-slate-300 flex items-start gap-2">
                                                <span className="material-symbols-outlined text-primary/60 text-[18px] mt-0.5">{q.icon}</span>
                                                <span>{q.text}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </motion.div>
                            </div>
                        ) : (
                            <>
                                <AnimatePresence mode="popLayout">
                                    {messages.map((msg) => <ChatBubble key={msg.id} message={msg} />)}
                                </AnimatePresence>
                                {isLoading && <TypingIndicator />}
                            </>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-6 border-t border-white/5">
                        <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" accept=".pdf,.txt,.docx" />
                        <div className="flex items-center gap-4">
                            <div className={`flex-1 glass-panel bg-glass p-1 rounded-[1.5rem] transition-all duration-300 ${isListening ? 'ring-[3px] ring-primary/50 shadow-[0_0_25px_rgba(37,226,244,0.3)]' : 'neon-border-focus'}`}>
                                <div className="flex items-center gap-2 px-4 py-1.5">
                                    <button onClick={() => fileInputRef.current?.click()} disabled={isUploading}
                                        className="p-2.5 text-slate-400 hover:text-primary transition-all duration-200 disabled:opacity-50 active:scale-90">
                                        <span className={`material-symbols-outlined text-[22px] ${isUploading ? 'animate-spin' : ''}`}>
                                            {isUploading ? 'sync' : 'attach_file'}
                                        </span>
                                    </button>
                                    <input value={input} onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() } }}
                                        placeholder={isListening ? 'Listening...' : 'Query the intelligence platform...'}
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 py-3.5 text-sm outline-none"
                                    />
                                    <button onClick={toggleVoiceInput} className={`p-2.5 transition-all duration-200 rounded-full ${isListening ? 'text-primary bg-primary/10' : 'text-slate-400 hover:text-primary'}`}>
                                        <span className={`material-symbols-outlined text-[22px] ${isListening ? 'animate-pulse' : ''}`}>
                                            {isListening ? 'graphic_eq' : 'mic'}
                                        </span>
                                    </button>
                                </div>
                            </div>
                            <button onClick={() => handleSend()} disabled={(!input.trim() && !isListening) || isLoading}
                                className="w-[54px] h-[54px] rounded-full bg-slate-800 border-2 border-primary/40 flex items-center justify-center text-primary hover:bg-primary hover:text-background-dark hover:border-primary transition-all duration-300 neon-shadow-sm disabled:opacity-40 disabled:hover:bg-slate-800 disabled:hover:text-primary active:scale-95 shrink-0 group">
                                <span className="material-symbols-outlined font-bold text-[24px] group-hover:translate-x-0.5 transition-transform">send</span>
                            </button>
                        </div>
                    </div>


                </div>
            </div>

            {/* Intelligence Panel (Right sidebar) */}
            <div className="w-80 glass-panel bg-glass rounded-2xl border-primary/10 overflow-y-auto p-6 hidden xl:block">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-slate-100 font-bold uppercase tracking-widest text-[10px]">Intelligence Panel</h3>
                    <span className="material-symbols-outlined text-slate-500 text-[16px]">info</span>
                </div>

                {/* Knowledge Graph */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Semantic Linkages</span>
                    </div>
                    <div className="aspect-square w-full glass-panel rounded-2xl border border-primary/20 relative overflow-hidden bg-black/20 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-40">
                            <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full border border-primary animate-pulse" />
                            <div className="absolute top-1/2 left-1/2 w-48 h-48 rounded-full border border-primary/30 rotate-45 -translate-x-1/2 -translate-y-1/2" />
                            <div className="absolute top-1/3 left-1/2 w-16 h-16 rounded-full bg-primary/20 blur-xl" />
                            <svg className="w-full h-full text-primary/40" viewBox="0 0 100 100">
                                <line x1="25" y1="25" x2="50" y2="50" stroke="currentColor" strokeWidth="0.5" />
                                <line x1="50" y1="50" x2="75" y2="25" stroke="currentColor" strokeWidth="0.5" />
                                <line x1="50" y1="50" x2="50" y2="80" stroke="currentColor" strokeWidth="0.5" />
                                <circle cx="25" cy="25" r="3" fill="currentColor" />
                                <circle cx="50" cy="50" r="4" fill="#25e2f4" />
                                <circle cx="75" cy="25" r="3" fill="currentColor" />
                                <circle cx="50" cy="80" r="3" fill="currentColor" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-bold text-primary/80 uppercase tracking-widest z-10 bg-background-dark/80 px-3 py-1 rounded-full border border-primary/20">
                            Live Syncing
                        </span>
                    </div>
                </div>

                {/* Contextual Sources — show last message's sources if any */}
                {messages.length > 0 && (() => {
                    const lastAi = [...messages].reverse().find(m => m.role === 'assistant' && m.sources && m.sources.length > 0)
                    if (!lastAi?.sources?.length) return null
                    return (
                        <div className="space-y-3 mb-8">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Contextual Sources</span>
                                <span className="text-[10px] text-slate-500 font-bold">{lastAi.sources.length} FOUND</span>
                            </div>
                            {lastAi.sources.map((src, i) => {
                                const filename = (src.metadata as { filename?: string })?.filename || `Source ${i + 1}`
                                const score = typeof src.score === 'number' ? src.score * 100 : 0
                                return (
                                    <div key={i} className="glass-panel p-4 rounded-xl border-white/5 hover:border-primary/40 transition-colors cursor-pointer group">
                                        <div className="flex items-start gap-3">
                                            <div className="bg-primary/10 p-2 rounded-[0.75rem] text-primary group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-[18px]">description</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-xs font-bold text-slate-200 truncate">{filename}</h4>
                                                {src.text && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{src.text.slice(0, 80)}…</p>}
                                            </div>
                                        </div>
                                        <div className="mt-3 w-full bg-white/5 h-1 rounded-full overflow-hidden">
                                            <div className="bg-primary h-full rounded-full transition-all" style={{ width: `${Math.max(10, score)}%` }} />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )
                })()}

                {/* Model Efficiency */}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                    <h4 className="text-[10px] font-bold text-primary uppercase tracking-widest mb-3">Model Efficiency</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Latency</p>
                            <p className="text-lg font-bold text-slate-100">124ms</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">RAG Recall</p>
                            <p className="text-lg font-bold text-slate-100">0.982</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
