import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useState, useEffect } from 'react'
import {
    AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
    LineChart, Line, BarChart, Bar,
} from 'recharts'
import { getAnalytics, type AnalyticsStats } from '@/services/api'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const tooltipStyle = { backgroundColor: 'rgba(16,33,34,0.95)', border: '1px solid rgba(37,226,244,0.2)', borderRadius: '12px', color: '#e2e8f0' }

// Fallback static data used if the API is unreachable
const FALLBACK: AnalyticsStats = {
    total_queries: 0,
    total_documents: 0,
    total_embeddings: 0,
    average_response_time: 0,
    top_documents: [],
    query_trends: [
        { date: 'Mon', count: 0 }, { date: 'Tue', count: 0 },
        { date: 'Wed', count: 0 }, { date: 'Thu', count: 0 }, { date: 'Fri', count: 0 },
    ],
    response_latency: [
        { date: '00:00', latency: 0 }, { date: '06:00', latency: 0 },
        { date: '12:00', latency: 0 }, { date: '18:00', latency: 0 },
    ],
}

function SkeletonBar({ w = 'w-24' }: { w?: string }) {
    return <div className={`h-4 ${w} bg-white/10 rounded animate-pulse`} />
}

export function Analytics() {
    const [stats, setStats] = useState<AnalyticsStats | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        getAnalytics()
            .then(setStats)
            .catch(() => setStats(FALLBACK))
            .finally(() => setLoading(false))
    }, [])

    const data = stats ?? FALLBACK

    const statCards = [
        { title: 'Total Queries', value: loading ? null : data.total_queries.toLocaleString(), icon: 'search' },
        { title: 'Documents Indexed', value: loading ? null : data.total_documents.toLocaleString(), icon: 'description' },
        { title: 'Embeddings', value: loading ? null : data.total_embeddings.toLocaleString(), icon: 'database' },
        { title: 'Avg Latency', value: loading ? null : `${data.average_response_time}s`, icon: 'timer' },
    ]

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-100 font-bold text-2xl">Research Insights</h2>
                    <p className="text-slate-500 text-sm mt-1">System performance and usage analytics</p>
                </div>
                <Badge>Live Data</Badge>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="grid grid-cols-4 gap-4">
                {statCards.map((s) => (
                    <motion.div key={s.title} whileHover={{ y: -2 }}>
                        <Card className="border-primary/10 hover:border-primary/30 transition-all">
                            <CardContent className="p-5">
                                <div className="bg-primary/10 w-10 h-10 rounded-[0.75rem] flex items-center justify-center mb-3 border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-[20px]">{s.icon}</span>
                                </div>
                                {s.value !== null
                                    ? <p className="text-2xl font-bold text-slate-100">{s.value}</p>
                                    : <SkeletonBar w="w-16" />
                                }
                                <p className="text-[10px] text-slate-500 uppercase tracking-wider mt-1 font-medium">{s.title}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Charts */}
            <div className="grid grid-cols-2 gap-4">
                <motion.div variants={item}>
                    <Card className="border-primary/10">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">trending_up</span>
                                <CardTitle className="text-xs">Query Trends</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">sync</span>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <AreaChart data={data.query_trends}>
                                        <defs>
                                            <linearGradient id="neonGrad2" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="0%" stopColor="#25e2f4" stopOpacity={0.3} />
                                                <stop offset="100%" stopColor="#25e2f4" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Area type="monotone" dataKey="count" stroke="#25e2f4" strokeWidth={2} fill="url(#neonGrad2)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={item}>
                    <Card className="border-primary/10">
                        <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-[18px]">speed</span>
                                <CardTitle className="text-xs">Response Latency</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="h-[250px] flex items-center justify-center">
                                    <span className="material-symbols-outlined text-primary animate-spin text-3xl">sync</span>
                                </div>
                            ) : (
                                <ResponsiveContainer width="100%" height={250}>
                                    <LineChart data={data.response_latency}>
                                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `${v}s`} />
                                        <Tooltip contentStyle={tooltipStyle} />
                                        <Line type="monotone" dataKey="latency" stroke="#25e2f4" strokeWidth={2} dot={{ fill: '#25e2f4', r: 4 }} />
                                    </LineChart>
                                </ResponsiveContainer>
                            )}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Top Documents */}
            <motion.div variants={item}>
                <Card className="border-primary/10">
                    <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-[18px]">query_stats</span>
                            <CardTitle className="text-xs">Most Queried Documents</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {loading ? (
                            <div className="space-y-2 py-2">
                                {[1, 2, 3].map((i) => <SkeletonBar key={i} w="w-full" />)}
                            </div>
                        ) : data.top_documents.length > 0 ? (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={data.top_documents} layout="vertical">
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                                    <YAxis type="category" dataKey="filename" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} width={180} />
                                    <Tooltip contentStyle={tooltipStyle} />
                                    <Bar dataKey="views" fill="#25e2f4" radius={[0, 6, 6, 0]} barSize={20} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="py-8 text-center text-slate-500 text-sm">
                                <span className="material-symbols-outlined text-3xl mb-2 block opacity-40">bar_chart</span>
                                No query data yet — start asking questions!
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
