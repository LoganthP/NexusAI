import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/useAuthStore'

const navItems = [
    { icon: 'dashboard', label: 'Intelligence Hub', path: '/' },
    { icon: 'smart_toy', label: 'Neural Chat', path: '/chat' },
    { icon: 'database', label: 'Knowledge Base', path: '/documents' },
    { icon: 'analytics', label: 'Research Insights', path: '/analytics' },
    { icon: 'shield', label: 'Compliance Matrix', path: '/compliance' },
]


export function Sidebar() {
    const location = useLocation()
    const { user, logout } = useAuthStore()

    return (
        <aside className="w-72 glass-panel bg-glass flex flex-col border-r border-primary/10">
            <div className="p-6 flex flex-col h-full">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-10">
                    <div className="bg-primary/20 p-2 rounded-[0.75rem]">
                        <span className="material-symbols-outlined text-primary text-3xl">hub</span>
                    </div>
                    <div className="flex flex-col">
                        <h1 className="text-slate-100 text-xl font-bold leading-tight tracking-tight">
                            Nexus <span className="text-primary">AI</span>
                        </h1>
                        <p className="text-primary/60 text-[10px] font-medium uppercase tracking-[0.2em]">
                            RAG Intelligence
                        </p>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex flex-col gap-2 flex-1">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path
                        return (
                            <NavLink key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ x: 2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-slate-400 hover:bg-white/5 border border-transparent'
                                    )}
                                >
                                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                                    <span className="text-sm font-medium">{item.label}</span>
                                </motion.div>
                            </NavLink>
                        )
                    })}

                    {/* Settings + Theme at bottom */}
                    <div className="mt-auto pt-6 border-t border-white/5 space-y-1">
                        <NavLink to="/settings">
                            {({ isActive }) => (
                                <motion.div
                                    whileHover={{ x: 2 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={cn(
                                        'flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200',
                                        isActive
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'text-slate-400 hover:bg-white/5 border border-transparent'
                                    )}
                                >
                                    <span className="material-symbols-outlined text-[20px]">settings</span>
                                    <span className="text-sm font-medium">Core Settings</span>
                                </motion.div>
                            )}
                        </NavLink>

                    </div>
                </nav>

                {/* User section */}
                <div className="mt-6 space-y-3">
                    <div className="flex items-center gap-3 px-2">
                        <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="text-sm font-bold text-primary">
                                {(user?.username || 'A')[0].toUpperCase()}
                            </span>
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-200 truncate">{user?.username || 'Admin'}</p>
                            <p className="text-[10px] text-primary/60 font-bold uppercase tracking-wider">{user?.role || 'admin'}</p>
                        </div>
                        <button onClick={logout} className="text-slate-500 hover:text-primary transition-colors">
                            <span className="material-symbols-outlined text-[18px]">logout</span>
                        </button>
                    </div>
                </div>
            </div>
        </aside>
    )
}
