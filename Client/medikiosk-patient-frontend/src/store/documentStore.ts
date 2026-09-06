import { create } from "zustand";
import type { UploadedDocument } from "@/types/document";

interface DocumentState {
  documents: UploadedDocument[];
  addDocument: (doc: UploadedDocument) => void;
  updateDocument: (id: string, patch: Partial<UploadedDocument>) => void;
  removeDocument: (id: string) => void;
  reset: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  addDocument: (doc) =>
    set((state) => ({ documents: [...state.documents, doc] })),
  updateDocument: (id, patch) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === id ? { ...doc, ...patch } : doc
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== id),
    })),
  reset: () => set({ documents: [] }),
}));
