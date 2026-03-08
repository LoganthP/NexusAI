import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { AppLayout } from '@/components/layout/AppLayout'
import { Dashboard } from '@/pages/Dashboard'
import { Chat } from '@/pages/Chat'
import { Documents } from '@/pages/Documents'
import { Analytics } from '@/pages/Analytics'
import { Compliance } from '@/pages/Compliance'
import { Settings } from '@/pages/Settings'
import { Login } from '@/pages/Login'
import { useAuthStore } from '@/store/useAuthStore'

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuthStore()
    if (!isAuthenticated) return <Navigate to="/login" replace />
    return <>{children}</>
}

export default function App() {
    return (
        <BrowserRouter>
            <AnimatePresence mode="wait">
                <Routes>
                    <Route path="/login" element={<Login />} />
                    <Route path="/" element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }>
                        <Route index element={<Dashboard />} />
                        <Route path="chat" element={<Chat />} />
                        <Route path="documents" element={<Documents />} />
                        <Route path="analytics" element={<Analytics />} />
                        <Route path="compliance" element={<Compliance />} />
                        <Route path="settings" element={<Settings />} />
                    </Route>
                </Routes>
            </AnimatePresence>
        </BrowserRouter>
    )
}
