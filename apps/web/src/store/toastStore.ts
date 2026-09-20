/**
 * @file apps/web/src/store/toastStore.ts
 * @description Lightweight reactive toast notification system for non-blocking feedback
 */

import { create } from "zustand";

export type ToastType = "success" | "info" | "warning" | "error";

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
}

interface ToastStoreState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, "id">) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = "toast_" + Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts.slice(-4), item] })); // Keep max 5 toasts

    const duration = toast.duration ?? 3500;
    if (duration > 0 && typeof window !== "undefined") {
      setTimeout(() => {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }));
      }, duration);
    }
    return id;
  },
  removeToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

// Quick convenience helpers
export const toast = {
  success: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "success", title, description, duration }),
  info: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "info", title, description, duration }),
  warning: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "warning", title, description, duration }),
  error: (title: string, description?: string, duration?: number) =>
    useToastStore.getState().addToast({ type: "error", title, description, duration }),
};
