import axios from 'axios'

const api = axios.create({
    baseURL: '/api',
    headers: { 'Content-Type': 'application/json' },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('rag_token')
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

// Types
export interface ChatMessage {
    id: string
    role: 'user' | 'assistant'
    content: string
    sources?: SourceNode[]
    timestamp: Date
    mode?: 'rag' | 'general'
}

export interface SourceNode {
    text: string
    metadata: Record<string, unknown>
    score: number
}

export interface ChatResponse {
    answer: string
    sources: SourceNode[]
    mode: 'rag' | 'general'
}

export interface DocumentInfo {
    id: string
    filename: string
    status: string
    message: string
    file_type?: string
    file_size?: number
    uploaded_at?: string
    chunks?: number
}

export interface RAGSettings {
    model: string
    vector_store: string
    embeddings: string
    top_k: number
    chunk_size: number
    chunk_overlap: number
}

export interface UpdateSettingsPayload {
    model?: string
    vector_store?: string
    embeddings?: string
    top_k?: number
    chunk_size?: number
    chunk_overlap?: number
}

export interface AnalyticsStats {
    total_queries: number
    total_documents: number
    total_embeddings: number
    average_response_time: number
    top_documents: { filename: string; views: number }[]
    query_trends: { date: string; count: number }[]
    response_latency: { date: string; latency: number }[]
}

export interface LoginRequest {
    username: string
    password: string
}

export interface LoginResponse {
    access_token: string
    token_type: string
    user: { username: string; role: string }
}

// API Functions
export async function sendChatMessage(query: string, conversationId?: string): Promise<ChatResponse> {
    const { data } = await api.post('/chat/', { query, conversation_id: conversationId })
    return data
}

export async function uploadDocuments(files: File[]): Promise<DocumentInfo[]> {
    const formData = new FormData()
    files.forEach((file) => formData.append('files', file))
    const { data } = await api.post('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
}

export async function getDocuments(): Promise<{ documents: DocumentInfo[] }> {
    const { data } = await api.get('/documents/')
    return data
}

export async function deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`)
}

export async function getAnalytics(): Promise<AnalyticsStats> {
    const { data } = await api.get('/analytics/stats')
    return data
}

export async function getSettings(): Promise<RAGSettings> {
    const { data } = await api.get('/settings/')
    return data
}

export async function updateSettings(payload: UpdateSettingsPayload): Promise<{ message: string; settings: RAGSettings }> {
    const { data } = await api.put('/settings/', payload)
    return data
}

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', credentials)
    return data
}

export default api
