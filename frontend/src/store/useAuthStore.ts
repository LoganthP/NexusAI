import { create } from 'zustand'

interface User {
    username: string
    role: 'admin' | 'manager' | 'employee'
}

interface AuthState {
    user: User | null
    token: string | null
    isAuthenticated: boolean
    login: (user: User, token: string) => void
    setAuth: (user: User, token: string) => void
    logout: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
    user: localStorage.getItem('rag_user')
        ? JSON.parse(localStorage.getItem('rag_user')!)
        : null,
    token: localStorage.getItem('rag_token'),
    isAuthenticated: !!localStorage.getItem('rag_token'),
    login: (user, token) => {
        localStorage.setItem('rag_token', token)
        localStorage.setItem('rag_user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
    },
    setAuth: (user, token) => {
        localStorage.setItem('rag_token', token)
        localStorage.setItem('rag_user', JSON.stringify(user))
        set({ user, token, isAuthenticated: true })
    },
    logout: () => {
        localStorage.removeItem('rag_token')
        localStorage.removeItem('rag_user')
        set({ user: null, token: null, isAuthenticated: false })
    },
}))
