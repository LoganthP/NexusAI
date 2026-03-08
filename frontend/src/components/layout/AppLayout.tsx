import { Outlet, useNavigate, Link } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { SearchModal } from './SearchModal'
import { NotificationPopover } from './NotificationPopover'
import { useAuthStore } from '@/store/useAuthStore'

export function AppLayout() {
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const { logout } = useAuthStore()
    const navigate = useNavigate()

    return (
        <div className="flex h-screen w-full overflow-hidden">
            <Sidebar />
            <main className="flex-1 flex flex-col relative overflow-hidden">
                {/* Header */}
                <header className="h-16 flex items-center justify-between px-8 glass-panel border-b border-white/5">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                                <span className="text-primary text-[10px] font-bold uppercase tracking-[0.15em]">
                                    Neural Engine Connected
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setIsSearchOpen(true)}
                            className="p-2 text-slate-400 hover:text-primary transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">search</span>
                        </button>

                        <NotificationPopover />

                        <div className="w-px h-6 bg-white/10" />

                        <DropdownMenu.Root>
                            <DropdownMenu.Trigger asChild>
                                <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">more_vert</span>
                                </button>
                            </DropdownMenu.Trigger>

                            <DropdownMenu.Portal>
                                <DropdownMenu.Content sideOffset={8} align="end" asChild>
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="w-48 glass-panel bg-glass border border-primary/20 rounded-xl overflow-hidden z-[100] shadow-2xl p-1"
                                    >
                                        <DropdownMenu.Item
                                            onClick={() => navigate('/settings')}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-primary/10 hover:text-primary rounded-lg outline-none cursor-pointer transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">settings</span>
                                            Core Settings
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Item
                                            onClick={() => navigate('/analytics')}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-primary/10 hover:text-primary rounded-lg outline-none cursor-pointer transition-colors"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">analytics</span>
                                            Usage Data
                                        </DropdownMenu.Item>
                                        <DropdownMenu.Separator className="h-px bg-white/5 my-1" />
                                        <DropdownMenu.Item
                                            onClick={logout}
                                            className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg outline-none cursor-pointer transition-colors font-bold uppercase tracking-widest text-[10px]"
                                        >
                                            <span className="material-symbols-outlined text-[18px]">logout</span>
                                            Terminate Session
                                        </DropdownMenu.Item>
                                    </motion.div>
                                </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                        </DropdownMenu.Root>
                    </div>
                </header>

                <SearchModal isOpen={isSearchOpen} onOpenChange={setIsSearchOpen} />

                {/* Page content */}
                <div className="flex-1 overflow-y-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-8"
                    >
                        <Outlet />
                    </motion.div>
                </div>
            </main>
        </div>
    )
}
