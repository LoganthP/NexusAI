import React, { useState, useEffect } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

interface SearchModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const recentSearches = [
    'Leave policy summary',
    'Q4 financial report',
    'GDPR compliance checklist',
    'Employee handbook 2024'
]

const quickActions = [
    { icon: 'history', label: 'Recent Queries', path: '/chat' },
    { icon: 'description', label: 'Browse Documents', path: '/documents' },
    { icon: 'analytics', label: 'View Insights', path: '/analytics' },
]

export function SearchModal({ isOpen, onOpenChange }: SearchModalProps) {
    const [query, setQuery] = useState('')
    const navigate = useNavigate()

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                onOpenChange(true)
            }
        }
        document.addEventListener('keydown', down)
        return () => document.removeEventListener('keydown', down)
    }, [onOpenChange])

    const handleAction = (path: string) => {
        onOpenChange(false)
        navigate(path)
    }

    return (
        <Dialog.Root open={isOpen} onOpenChange={onOpenChange}>
            <AnimatePresence>
                {isOpen && (
                    <Dialog.Portal forceMount>
                        <Dialog.Overlay asChild>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-background-dark/80 backdrop-blur-sm z-50 px-4 pt-[15vh]"
                            />
                        </Dialog.Overlay>
                        <Dialog.Content asChild>
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: -20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: -20 }}
                                className="fixed left-1/2 top-[15vh] -translate-x-1/2 w-full max-w-xl glass-panel bg-glass border border-primary/20 rounded-2xl overflow-hidden z-50 shadow-2xl"
                            >
                                <div className="flex items-center gap-3 px-4 py-4 border-b border-white/5">
                                    <span className="material-symbols-outlined text-slate-500">search</span>
                                    <input
                                        autoFocus
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        placeholder="Command search..."
                                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 outline-none"
                                    />
                                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10">
                                        <span className="text-[10px] font-bold text-slate-500 uppercase">ESC</span>
                                    </div>
                                </div>

                                <div className="p-4 space-y-6">
                                    {/* Quick Actions */}
                                    <div>
                                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Quick Actions</h3>
                                        <div className="grid grid-cols-1 gap-1">
                                            {quickActions.map((action) => (
                                                <button
                                                    key={action.label}
                                                    onClick={() => handleAction(action.path)}
                                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-primary/10 hover:text-primary transition-all group"
                                                >
                                                    <span className="material-symbols-outlined text-[20px] text-slate-500 group-hover:text-primary">{action.icon}</span>
                                                    <span className="text-sm font-medium text-slate-300 group-hover:text-primary">{action.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Recent Searches */}
                                    <div>
                                        <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 px-2">Recent Searches</h3>
                                        <div className="grid grid-cols-1 gap-1">
                                            {recentSearches.map((search) => (
                                                <button
                                                    key={search}
                                                    onClick={() => {
                                                        onOpenChange(false)
                                                        navigate('/chat', { state: { initialQuery: search } })
                                                    }}
                                                    className="flex items-center gap-3 w-full p-2.5 rounded-xl hover:bg-white/5 transition-all group"
                                                >
                                                    <span className="material-symbols-outlined text-[18px] text-slate-500">history</span>
                                                    <span className="text-sm text-slate-400 group-hover:text-slate-200">{search}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="px-6 py-4 bg-white/5 border-t border-white/5 flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">south</span> Select</span>
                                        <span className="flex items-center gap-1.5"><span className="material-symbols-outlined text-[14px]">subdirectory_arrow_left</span> Open</span>
                                    </div>
                                    <span className="text-[10px] font-bold text-primary italic uppercase tracking-widest">Neural Index Active</span>
                                </div>
                            </motion.div>
                        </Dialog.Content>
                    </Dialog.Portal>
                )}
            </AnimatePresence>
        </Dialog.Root>
    )
}
