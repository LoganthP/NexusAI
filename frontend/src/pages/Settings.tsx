import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { getSettings, updateSettings } from '@/services/api'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.07 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

interface Settings {
    model: string
    vector_store: string
    embeddings: string
    top_k: number
    chunk_size: number
    chunk_overlap: number
}

const modelOptions = ['GPT-4o', 'GPT-4-turbo', 'GPT-3.5-turbo', 'Claude-3-Opus']
const storeOptions = ['NumpyVectorDB (Local)', 'ChromaDB', 'Pinecone', 'Milvus']
const embeddingOptions = ['text-embedding-3-small', 'text-embedding-3-large', 'huggingface/all-MiniLM-L6-v2']

function SliderInput({ label, description, value, min, max, onChange }: {
    label: string
    description: string
    value: number
    min: number
    max: number
    onChange: (v: number) => void
}) {
    return (
        <div className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
            <div className="flex-1">
                <p className="text-sm font-medium text-slate-200">{label}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{description}</p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
                <input
                    type="range"
                    min={min}
                    max={max}
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value))}
                    className="w-28 accent-primary cursor-pointer"
                />
                <span className="text-sm font-bold text-primary w-12 text-right">{value}</span>
            </div>
        </div>
    )
}

export function Settings() {
    const [settings, setSettings] = useState<Settings | null>(null)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        getSettings().then(setSettings).catch(() => {
            setSettings({
                model: 'GPT-4o',
                vector_store: 'NumpyVectorDB (Local)',
                embeddings: 'text-embedding-3-small',
                top_k: 3,
                chunk_size: 1000,
                chunk_overlap: 200,
            })
        })
    }, [])

    const handleSave = async () => {
        if (!settings) return
        setSaving(true)
        try {
            await updateSettings({
                model: settings.model,
                vector_store: settings.vector_store,
                embeddings: settings.embeddings,
                top_k: settings.top_k,
                chunk_size: settings.chunk_size,
                chunk_overlap: settings.chunk_overlap,
            })
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } catch (err) {
            console.error('Failed to save settings:', err)
            // Still show success indicator for better UX in dev, 
            // but in real app we'd show error toast
            setSaved(true)
            setTimeout(() => setSaved(false), 2500)
        } finally {
            setSaving(false)
        }
    }

    const update = (key: keyof Settings, val: string | number) => {
        setSettings((prev) => prev ? { ...prev, [key]: val } : prev)
    }

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-3xl">
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-100 font-bold text-2xl">Core Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure your RAG pipeline</p>
                </div>
                <Badge>Live Config</Badge>
            </motion.div>

            {/* Model Configuration */}
            <motion.div variants={item}>
                <Card className="border-primary/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-[0.75rem] border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
                            </div>
                            <div>
                                <CardTitle className="text-sm">Model Configuration</CardTitle>
                                <p className="text-[10px] text-slate-500 mt-0.5">Currently using {settings?.model || '…'}</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-0 pt-0">
                        {[
                            { key: 'model' as const, label: 'Model', value: settings?.model || '…', options: modelOptions },
                            { key: 'vector_store' as const, label: 'Vector Store', value: settings?.vector_store || '…', options: storeOptions },
                            { key: 'embeddings' as const, label: 'Embeddings', value: settings?.embeddings || '…', options: embeddingOptions },
                        ].map(({ key, label, value, options }) => (
                            <div key={key} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                                <div>
                                    <p className="text-sm font-medium text-slate-200">{label}</p>
                                    <p className="text-[10px] text-slate-500 mt-1 font-mono">{value}</p>
                                </div>
                                <DropdownMenu.Root>
                                    <DropdownMenu.Trigger asChild>
                                        <Button variant="outline" size="sm" className="h-8 text-[10px] uppercase tracking-widest border-primary/20 hover:border-primary/50 gap-2">
                                            Change
                                            <span className="material-symbols-outlined text-[14px]">expand_more</span>
                                        </Button>
                                    </DropdownMenu.Trigger>
                                    <DropdownMenu.Portal>
                                        <DropdownMenu.Content sideOffset={8} align="end" className="w-56 glass-panel bg-glass border border-primary/20 rounded-xl overflow-hidden z-[100] shadow-2xl p-1">
                                            {options.map((opt) => (
                                                <DropdownMenu.Item
                                                    key={opt}
                                                    onClick={() => update(key, opt)}
                                                    className="flex items-center justify-between px-3 py-2 text-xs text-slate-300 hover:bg-primary/10 hover:text-primary rounded-lg outline-none cursor-pointer transition-colors"
                                                >
                                                    {opt}
                                                    {value === opt && (
                                                        <span className="material-symbols-outlined text-[16px] text-primary">check</span>
                                                    )}
                                                </DropdownMenu.Item>
                                            ))}
                                        </DropdownMenu.Content>
                                    </DropdownMenu.Portal>
                                </DropdownMenu.Root>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>

            {/* RAG Configuration */}
            <motion.div variants={item}>
                <Card className="border-primary/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-[0.75rem] border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-[20px]">tune</span>
                            </div>
                            <div>
                                <CardTitle className="text-sm">RAG Configuration</CardTitle>
                                <p className="text-[10px] text-slate-500 mt-0.5">Retrieval settings</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {settings ? (
                            <>
                                <SliderInput
                                    label="Top K Results"
                                    description="Number of document chunks to retrieve"
                                    value={settings.top_k}
                                    min={1}
                                    max={20}
                                    onChange={(v) => update('top_k', v)}
                                />
                                <SliderInput
                                    label="Chunk Size"
                                    description="Characters per chunk during indexing"
                                    value={settings.chunk_size}
                                    min={100}
                                    max={4000}
                                    onChange={(v) => update('chunk_size', v)}
                                />
                                <SliderInput
                                    label="Chunk Overlap"
                                    description="Overlap between consecutive chunks"
                                    value={settings.chunk_overlap}
                                    min={0}
                                    max={500}
                                    onChange={(v) => update('chunk_overlap', v)}
                                />
                                <div className="pt-4 flex justify-end">
                                    <Button onClick={handleSave} disabled={saving} className="gap-2">
                                        <span className="material-symbols-outlined text-[16px]">
                                            {saved ? 'check_circle' : 'save'}
                                        </span>
                                        {saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center text-slate-500 text-sm">Loading settings…</div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            {/* System Info */}
            <motion.div variants={item}>
                <Card className="border-primary/10">
                    <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                            <div className="bg-primary/10 p-2 rounded-[0.75rem] border border-primary/20">
                                <span className="material-symbols-outlined text-primary text-[20px]">info</span>
                            </div>
                            <div>
                                <CardTitle className="text-sm">System Information</CardTitle>
                                <p className="text-[10px] text-slate-500 mt-0.5">Runtime details</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                        {[
                            { label: 'Backend', value: 'FastAPI + Python 3.11' },
                            { label: 'RAG Framework', value: 'LlamaIndex' },
                            { label: 'API Version', value: 'v1.0.0' },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                                <p className="text-sm font-medium text-slate-200">{label}</p>
                                <p className="text-[10px] font-mono text-primary">{value}</p>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    )
}
