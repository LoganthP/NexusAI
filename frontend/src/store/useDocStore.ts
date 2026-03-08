import { create } from 'zustand'
import type { DocumentInfo } from '@/services/api'

interface DocState {
    documents: DocumentInfo[]
    isUploading: boolean
    uploadProgress: number
    setDocuments: (docs: DocumentInfo[]) => void
    addDocuments: (docs: DocumentInfo[]) => void
    removeDocument: (id: string) => void
    setUploading: (uploading: boolean) => void
    setUploadProgress: (progress: number) => void
}

export const useDocStore = create<DocState>((set) => ({
    documents: [],
    isUploading: false,
    uploadProgress: 0,
    setDocuments: (docs) => set({ documents: docs }),
    addDocuments: (docs) =>
        set((state) => ({ documents: [...docs, ...state.documents] })),
    removeDocument: (id) =>
        set((state) => ({
            documents: state.documents.filter((d) => d.id !== id),
        })),
    setUploading: (uploading) => set({ isUploading: uploading }),
    setUploadProgress: (progress) => set({ uploadProgress: progress }),
}))
