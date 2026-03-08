import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { useAuthStore } from '@/store/useAuthStore'
import { useNavigate } from 'react-router-dom'
import { login as loginApi } from '@/services/api'
import { Badge } from '@/components/ui/badge'

export function Login() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const { setAuth } = useAuthStore()
    const navigate = useNavigate()

    const handleLogin = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        if (!username || !password) {
            setError('Please enter both username and password')
            return
        }

        setError('')
        setIsLoading(true)
        try {
            const response = await loginApi({ username, password })
            setAuth(response.user as { username: string; role: 'admin' | 'manager' | 'employee' }, response.access_token)
            localStorage.setItem('rag_token', response.access_token)
            navigate('/')
        } catch (err: any) {
            console.error('Login failed:', err)
            setError(err.response?.data?.detail || 'Authentication failed. Please check your credentials.')
        } finally {
            setIsLoading(false)
        }
    }

    const demoLogin = (role: string) => {
        setUsername(role)
        setPassword(role)
        setError('')
        // Give a tiny delay for the state to update before submitting
        setTimeout(() => {
            const btn = document.getElementById('login-submit')
            if (btn) btn.click()
        }, 100)
    }

    return (
        <div className="min-h-screen mesh-gradient flex items-center justify-center relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                    className="absolute -top-1/2 -left-1/2 w-full h-full border border-primary/5 rounded-full" />
                <motion.div animate={{ rotate: -360 }} transition={{ duration: 80, repeat: Infinity, ease: 'linear' }}
                    className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 border border-primary/5 rounded-full" />
                <div className="absolute top-1/4 left-1/3 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/3 w-48 h-48 bg-primary/3 rounded-full blur-3xl" />
            </div>

            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}
                className="relative z-10 w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <motion.div initial={{ y: -10 }} animate={{ y: 0 }} className="inline-flex">
                        <div className="bg-primary/20 p-3 rounded-2xl border border-primary/30 neon-shadow mx-auto mb-4">
                            <span className="material-symbols-outlined text-primary text-4xl">hub</span>
                        </div>
                    </motion.div>
                    <h1 className="text-3xl font-bold">Nexus <span className="text-primary">AI</span></h1>
                    <p className="text-slate-500 text-sm mt-1">RAG Intelligence Platform</p>
                </div>

                {/* Login Card */}
                <div className="glass-panel bg-glass p-8 rounded-2xl border border-primary/10 neon-shadow-xs">
                    <form onSubmit={handleLogin} className="space-y-5">
                        {error && (
                            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                                className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3">
                                <span className="material-symbols-outlined text-red-400 text-[20px]">error</span>
                                <p className="text-xs text-red-400 font-medium">{error}</p>
                            </motion.div>
                        )}
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mb-2 block">Username</label>
                            <div className="glass-panel bg-glass rounded-xl px-4 py-1 neon-border-focus transition-all">
                                <input value={username} onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter username"
                                    className="w-full bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 py-2.5 text-sm outline-none" />
                            </div>
                        </div>
                        <div>
                            <label className="text-[10px] text-slate-400 uppercase tracking-widest font-medium mb-2 block">Password</label>
                            <div className="glass-panel bg-glass rounded-xl px-4 py-1 flex items-center neon-border-focus transition-all">
                                <input value={password} onChange={(e) => setPassword(e.target.value)}
                                    type={showPassword ? 'text' : 'password'} placeholder="Enter password"
                                    className="flex-1 bg-transparent border-none focus:ring-0 text-slate-100 placeholder:text-slate-500 py-2.5 text-sm outline-none" />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-slate-500 hover:text-primary transition-colors">
                                    <span className="material-symbols-outlined text-[20px]">{showPassword ? 'visibility_off' : 'visibility'}</span>
                                </button>
                            </div>
                        </div>
                        <Button id="login-submit" type="submit" disabled={isLoading} className="w-full h-12 text-base font-bold neon-shadow">
                            {isLoading ? (
                                <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                            ) : (
                                <>
                                    <span className="material-symbols-outlined text-[18px]">bolt</span>
                                    Initialize Session
                                </>
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-white/5">
                        <p className="text-center text-[10px] text-slate-500 mb-3 uppercase tracking-widest font-medium">Quick Access</p>
                        <div className="grid grid-cols-3 gap-2">
                            {['admin', 'manager', 'employee'].map((role) => (
                                <motion.button key={role} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                                    onClick={() => demoLogin(role)}
                                    className="glass-panel py-3 rounded-xl text-center hover:border-primary/30 transition-all">
                                    <span className="material-symbols-outlined text-primary text-[18px] mb-1 block">person</span>
                                    <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider capitalize">{role}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                </div>

                <p className="text-center text-[10px] text-slate-600 mt-6 uppercase tracking-widest">
                    <span className="material-symbols-outlined text-[12px] align-middle mr-1">lock</span>
                    Secured with JWT & role-based access
                </p>
            </motion.div>
        </div>
    )
}
