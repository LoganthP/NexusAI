import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell,
} from 'recharts'
import { useNavigate } from 'react-router-dom'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const queryTrends = [
    { date: 'Mon', count: 45 }, { date: 'Tue', count: 62 }, { date: 'Wed', count: 58 },
    { date: 'Thu', count: 91 }, { date: 'Fri', count: 78 }, { date: 'Sat', count: 35 }, { date: 'Sun', count: 42 },
]
const docTypes = [
    { name: 'PDF', value: 42, color: '#25e2f4' }, { name: 'DOCX', value: 28, color: '#0ea5e9' },
    { name: 'TXT', value: 15, color: '#06b6d4' }, { name: 'CSV', value: 10, color: '#22d3ee' },
    { name: 'PPTX', value: 5, color: '#67e8f9' },
]
const recentActivity = [
    { action: 'Query', detail: 'What is the company leave policy?', time: '2m', icon: 'smart_toy' },
    { action: 'Upload', detail: 'Q4_Financial_Report.pdf', time: '15m', icon: 'upload_file' },
    { action: 'Query', detail: 'Summarize GDPR compliance rules', time: '32m', icon: 'smart_toy' },
    { action: 'Analysis', detail: 'Contract risk analysis completed', time: '2h', icon: 'analytics' },
]
const stats = [
    { title: 'Documents', value: '1,247', change: '+12%', icon: 'database' },
    { title: 'Queries', value: '3,891', change: '+28%', icon: 'smart_toy' },
    { title: 'Latency', value: '124ms', change: '-15%', icon: 'speed' },
    { title: 'RAG Recall', value: '0.982', change: '+3%', icon: 'memory' },
]

const tooltipStyle = { backgroundColor: 'rgba(16,33,34,0.95)', border: '1px solid rgba(37,226,244,0.2)', borderRadius: '12px', color: '#e2e8f0' }

export function Dashboard() {
    const navigate = useNavigate()

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-100 font-bold text-2xl">Intelligence Hub</h2>
                    <p className="text-slate-500 text-sm mt-1">Enterprise knowledge command center</p>
                </div>
                <Badge>Neural Engine Online</Badge>
            </motion.div>


            {/* Stats Grid */}
            <motion.div variants={item} className="grid grid-cols-4 gap-4">
                {stats.map((stat) => (
                    <motion.div key={stat.title} whileHover={{ y: -2 }}>
                        <Card className="border border-primary/10 hover:border-primary/30 transition-all neon-shadow-xs">
                            <CardContent className="p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="bg-primary/10 p-2 rounded-[0.75rem] border border-primary/20">
                                        <span className="material-symbols-outlined text-primary text-[20px]">{stat.icon}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-primary'}`}>
                                        {stat.change}
                                    </span>
                                </div>
                                <p className="text-2xl font-bold text-slate-100">{stat.value}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-medium">{stat.title}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts Row */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div variants={item} className="col-span-2">
                    <Card className="border-primary/10">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
                                <CardTitle className="text-xs">Query Volume</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={220}>
                                <AreaChart data={queryTrends}>
                                    <defs>
                                        <linearGradient id="neonGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#25e2f4" stopOpacity={0.3} />
                                            <stop offset="100%" stopColor="#25e2f4" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Area type="monotone" dataKey="count" stroke="#25e2f4" strokeWidth={2} fill="url(#neonGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-primary/10">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">donut_large</span>
                                <CardTitle className="text-xs">Document Types</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <ResponsiveContainer width="100%" height={160}>
                                <PieChart>
                                    <Pie data={docTypes} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3} dataKey="value">
                                        {docTypes.map((e) => <Cell key={e.name} fill={e.color} />)}
                                    </Pie>
                                    <Tooltip contentStyle={tooltipStyle} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-3 justify-center mt-2">
                                {docTypes.map((d) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-[10px] text-slate-500">
                                        <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: d.color }} />
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Activity */}
            <motion.div variants={item}>
                <Card className="border-primary/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">history</span>
                            <CardTitle className="text-xs">Recent Activity</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            {recentActivity.map((act, i) => (
                                <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 transition-colors group cursor-pointer">
                                    <div className="w-8 h-8 rounded-[0.75rem] bg-primary/10 border border-primary/20 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-primary text-[16px]">{act.icon}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-200 truncate">{act.detail}</p>
                                        <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium">{act.action}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{act.time}</span>
                                </motion.div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
