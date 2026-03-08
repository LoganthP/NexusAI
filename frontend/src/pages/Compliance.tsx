import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const complianceChecks = [
    { title: 'GDPR Data Processing', status: 'compliant', desc: 'All data processing activities documented', icon: 'verified_user' },
    { title: 'Data Retention Policy', status: 'warning', desc: 'Review scheduled for next month', icon: 'schedule' },
    { title: 'Access Controls', status: 'compliant', desc: 'Role-based access properly configured', icon: 'shield' },
    { title: 'Encryption Standards', status: 'compliant', desc: 'AES-256 encryption at rest and in transit', icon: 'lock' },
    { title: 'Third-party Vendor Audit', status: 'risk', desc: '2 vendor contracts pending review', icon: 'warning' },
    { title: 'Employee Training', status: 'warning', desc: '85% completion rate — target 100%', icon: 'school' },
]

const riskClauses = [
    { contract: 'Vendor Agreement — CloudCorp', risk: 'high', clause: 'Unlimited liability clause detected', section: 'Section 8.2' },
    { contract: 'NDA — PartnerTech', risk: 'medium', clause: 'Non-compete period exceeds standard', section: 'Section 4.1' },
    { contract: 'SaaS License — DataFlow', risk: 'low', clause: 'Auto-renewal without 60-day notice', section: 'Section 12.3' },
]

export function Compliance() {
    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-100 font-bold text-2xl">Compliance Matrix</h2>
                    <p className="text-slate-500 text-sm mt-1">Legal, compliance & risk analysis</p>
                </div>
                <Badge variant="success">4/6 Compliant</Badge>
            </motion.div>

            {/* Compliance Grid */}
            <motion.div variants={item} className="grid grid-cols-3 gap-4">
                {complianceChecks.map((check) => (
                    <motion.div key={check.title} whileHover={{ y: -2 }}>
                        <Card className="h-full border-primary/10 hover:border-primary/30 transition-all">
                            <CardContent className="p-5">
                                <div className="flex items-start justify-between mb-3">
                                    <div className={`w-10 h-10 rounded-[0.75rem] flex items-center justify-center border ${check.status === 'compliant' ? 'bg-emerald-500/10 border-emerald-500/20' :
                                            check.status === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20' :
                                                'bg-red-500/10 border-red-500/20'
                                        }`}>
                                        <span className={`material-symbols-outlined text-[20px] ${check.status === 'compliant' ? 'text-emerald-400' :
                                                check.status === 'warning' ? 'text-yellow-400' : 'text-red-400'
                                            }`}>{check.icon}</span>
                                    </div>
                                    <Badge variant={check.status === 'compliant' ? 'success' : check.status === 'warning' ? 'warning' : 'destructive'}>
                                        {check.status}
                                    </Badge>
                                </div>
                                <h3 className="text-sm font-bold text-slate-200 mb-1">{check.title}</h3>
                                <p className="text-[10px] text-slate-500">{check.desc}</p>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Risk Clauses */}
            <motion.div variants={item}>
                <Card className="border-primary/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-400 text-[18px]">report</span>
                            <CardTitle className="text-xs">Contract Risk Detection</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        {riskClauses.map((clause, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors">
                                <div className={`w-1.5 h-8 rounded-full ${clause.risk === 'high' ? 'bg-red-500' : clause.risk === 'medium' ? 'bg-yellow-500' : 'bg-emerald-500'}`} />
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-slate-200">{clause.contract}</p>
                                    <p className="text-[10px] text-slate-500">{clause.clause} — {clause.section}</p>
                                </div>
                                <Badge variant={clause.risk === 'high' ? 'destructive' : clause.risk === 'medium' ? 'warning' : 'success'}>
                                    {clause.risk} risk
                                </Badge>
                                <Button variant="ghost" size="sm">Review</Button>
                            </motion.div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
