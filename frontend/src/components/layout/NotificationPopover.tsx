import React from 'react'
import * as Popover from '@radix-ui/react-popover'
import { motion, AnimatePresence } from 'framer-motion'
import { Badge } from '@/components/ui/badge'
import { useNavigate } from 'react-router-dom'

const notifications = [
    {
        id: '1',
        title: 'New Document Indexed',
        description: 'Q4_Financial_Report.pdf is now available for querying.',
        time: '5m ago',
        type: 'success',
        icon: 'upload_file'
    },
    {
        id: '2',
        title: 'Neural Engine Performance',
        description: 'Model latency dropped by 15% after index optimization.',
        time: '2h ago',
        type: 'info',
        icon: 'speed'
    },
    {
        id: '3',
        title: 'Security Alert',
        description: 'New compliance requirements detected for GDPR region.',
        time: '5h ago',
        type: 'warning',
        icon: 'security'
    }
]

export function NotificationPopover() {
    const navigate = useNavigate()

    const handleNotificationClick = (type: string) => {
        switch (type) {
            case 'success': navigate('/documents'); break;
            case 'info': navigate('/analytics'); break;
            case 'warning': navigate('/compliance'); break;
            default: navigate('/analytics');
        }
    }

    return (
        <Popover.Root>
            <Popover.Trigger asChild>
                <button className="p-2 text-slate-400 hover:text-primary transition-colors relative">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary rounded-full border-2 border-background-dark animate-pulse" />
                </button>
            </Popover.Trigger>

            <Popover.Portal>
                <Popover.Content sideOffset={12} align="end" asChild>
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        className="w-80 glass-panel bg-glass border border-primary/20 rounded-2xl overflow-hidden z-[100] shadow-2xl"
                    >
                        <div className="p-4 border-b border-white/5 flex items-center justify-between">
                            <h3 className="text-xs font-bold text-slate-100 uppercase tracking-widest">Intelligence Feed</h3>
                            <Badge variant="outline" className="text-[9px] uppercase tracking-tighter">3 New</Badge>
                        </div>

                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.map((note) => (
                                <div
                                    key={note.id}
                                    onClick={() => handleNotificationClick(note.type)}
                                    className="p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group"
                                >
                                    <div className="flex gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 group-hover:scale-110 transition-transform">
                                            <span className="material-symbols-outlined text-primary text-[18px]">{note.icon}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-xs font-bold text-slate-200 truncate">{note.title}</h4>
                                                <span className="text-[9px] text-slate-500 font-medium uppercase">{note.time}</span>
                                            </div>
                                            <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{note.description}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={() => navigate('/analytics')}
                            className="w-full py-3 px-4 text-center text-[10px] font-bold text-primary uppercase tracking-widest hover:bg-primary/10 transition-colors border-t border-white/5"
                        >
                            View All Insight Records
                        </button>
                    </motion.div>
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    )
}
