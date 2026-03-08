import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useDocStore } from '@/store/useDocStore'
import { uploadDocuments, getDocuments, deleteDocument } from '@/services/api'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } }
const item = { hidden: { opacity: 0, y: 15 }, show: { opacity: 1, y: 0 } }

const typeIcons: Record<string, { icon: string; color: string }> = {
    pdf: { icon: 'picture_as_pdf', color: 'text-red-400' },
    docx: { icon: 'description', color: 'text-blue-400' },
    doc: { icon: 'description', color: 'text-blue-400' },
    txt: { icon: 'text_snippet', color: 'text-emerald-400' },
    csv: { icon: 'table_chart', color: 'text-yellow-400' },
    pptx: { icon: 'slideshow', color: 'text-orange-400' },
}

function formatBytes(bytes: number): string {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

export function Documents() {
    const { documents, setDocuments, isUploading, setUploading, uploadProgress, setUploadProgress } = useDocStore()
    const [search, setSearch] = useState('')

    useEffect(() => {
        getDocuments().then(res => setDocuments(res.documents || [])).catch(console.error)
    }, [])

    const onDrop = useCallback(async (files: File[]) => {
        setUploading(true)
        setUploadProgress(10)
        const interval = setInterval(() => setUploadProgress(Math.min(uploadProgress + 10, 90)), 300)
        try {
            await uploadDocuments(files)
            setUploadProgress(100)
            const res = await getDocuments()
            setDocuments(res.documents || [])
        } catch (err) { console.error(err) }
        clearInterval(interval)
        setTimeout(() => { setUploading(false); setUploadProgress(0) }, 500)
    }, [])

    const handleDelete = async (id: string) => {
        try { await deleteDocument(id); setDocuments(documents.filter((d: any) => d.id !== id)) } catch { }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/pdf': ['.pdf'], 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'], 'text/plain': ['.txt'], 'text/csv': ['.csv'], 'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'] } })

    const filtered = documents.filter((d: any) => d.filename?.toLowerCase().includes(search.toLowerCase()))

    return (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
            <motion.div variants={item} className="flex items-center justify-between">
                <div>
                    <h2 className="text-slate-100 font-bold text-2xl">Knowledge Base</h2>
                    <p className="text-slate-500 text-sm mt-1">Upload and manage enterprise documents</p>
                </div>
                <Badge>{documents.length} documents</Badge>
            </motion.div>

            {/* Stat Cards */}
            <motion.div variants={item} className="grid grid-cols-3 gap-4">
                {[
                    {
                        label: 'Total Documents',
                        value: documents.length,
                        icon: 'description',
                    },
                    {
                        label: 'Total Chunks',
                        value: documents.reduce((sum: number, d: any) => sum + (d.chunks || 0), 0),
                        icon: 'layers',
                    },
                    {
                        label: 'Total Size',
                        value: formatBytes(documents.reduce((sum: number, d: any) => sum + (d.file_size || 0), 0)),
                        icon: 'storage',
                    },
                ].map((stat) => (
                    <motion.div key={stat.label} whileHover={{ y: -2 }}>
                        <Card className="border-primary/10 hover:border-primary/30 transition-all">
                            <CardContent className="p-5 flex items-center gap-4">
                                <div className="bg-primary/10 p-3 rounded-[0.75rem] border border-primary/20">
                                    <span className="material-symbols-outlined text-primary text-[22px]">{stat.icon}</span>
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-slate-100">{stat.value}</p>
                                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-medium mt-0.5">{stat.label}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>

            {/* Upload Zone */}
            <motion.div variants={item}>
                <div {...getRootProps()} className={`glass-panel rounded-2xl p-10 border-2 border-dashed border-white/10 text-center cursor-pointer transition-all hover:border-primary/30 ${isDragActive ? 'border-primary bg-primary/5 neon-shadow-xs' : ''}`}>
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center border border-primary/30">
                            <span className="material-symbols-outlined text-primary text-3xl">cloud_upload</span>
                        </div>
                        <p className="text-slate-300 text-sm font-medium">Drag & drop files here</p>
                        <p className="text-[10px] text-slate-500 uppercase tracking-wider">or click to browse • PDF, DOCX, TXT, CSV, PPTX</p>
                        <Button variant="outline" size="sm" className="mt-2">
                            <span className="material-symbols-outlined text-[16px]">upload</span> Browse Files
                        </Button>
                    </div>
                </div>
            </motion.div>

            {isUploading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <Card className="border-primary/20">
                        <CardContent className="p-4">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-[20px] animate-spin">sync</span>
                                <div className="flex-1">
                                    <p className="text-xs text-slate-300 font-medium mb-1">Processing documents...</p>
                                    <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                                        <motion.div className="bg-primary h-full rounded-full" animate={{ width: `${uploadProgress}%` }} transition={{ duration: 0.3 }} />
                                    </div>
                                </div>
                                <span className="text-[10px] text-primary font-bold">{uploadProgress}%</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            )}

            {/* Search */}
            <motion.div variants={item}>
                <div className="glass-panel bg-glass px-4 py-2 rounded-xl flex items-center gap-2 neon-border-focus transition-all">
                    <span className="material-symbols-outlined text-slate-500 text-[20px]">search</span>
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search documents..."
                        className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 text-sm py-2 outline-none" />
                </div>
            </motion.div>

            {/* Documents list */}
            <motion.div variants={item} className="space-y-2">
                <AnimatePresence>
                    {filtered.map((doc: any) => {
                        const ext = doc.filename?.split('.').pop()?.toLowerCase() || ''
                        const typeInfo = typeIcons[ext] || { icon: 'draft', color: 'text-slate-400' }
                        return (
                            <motion.div key={doc.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                                className="glass-panel p-4 rounded-xl flex items-center gap-4 hover:border-primary/30 transition-all cursor-pointer group">
                                <div className={`w-10 h-10 rounded-xl ${ext === 'pdf' ? 'bg-red-500/10' : ext === 'docx' || ext === 'doc' ? 'bg-blue-500/10' : ext === 'csv' ? 'bg-yellow-500/10' : 'bg-primary/10'} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                    <span className={`material-symbols-outlined ${typeInfo.color} text-[20px]`}>{typeInfo.icon}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="text-sm font-bold text-slate-200 truncate">{doc.filename}</h4>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {formatBytes(doc.file_size || 0)} • {doc.chunks || 0} chunks • {doc.uploaded_at ? new Date(doc.uploaded_at).toLocaleDateString() : ''}
                                    </p>
                                </div>
                                <Badge variant={doc.status === 'Indexed' ? 'success' : doc.status === 'Error' ? 'destructive' : 'warning'}>
                                    {doc.status}
                                </Badge>
                                <button onClick={() => handleDelete(doc.id)} className="text-slate-500 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                </button>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
                {filtered.length === 0 && !isUploading && (
                    <div className="text-center py-12 text-slate-500">
                        <span className="material-symbols-outlined text-4xl mb-3 block opacity-40">folder_open</span>
                        <p className="text-sm">No documents found. Upload files to get started.</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    )
}
