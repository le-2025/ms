import { create } from "zustand"
import { apiJson } from "@/lib/http"

export type SharedReport = {
  id: string
  assessmentKind: "big5"
  assessmentVersion: "short" | "long"
  displayName?: string
  createdAt: string
  scores: Record<"O" | "C" | "E" | "A" | "N", number>
  bands: Record<"O" | "C" | "E" | "A" | "N", "low" | "mid" | "high">
}

type AdminState = {
  token?: string
  status: "idle" | "loading" | "ready" | "error"
  error?: string
  reports: SharedReport[]
  login: (password: string) => Promise<boolean>
  logout: () => void
  loadReports: () => Promise<void>
  getReport: (id: string) => Promise<SharedReport | null>
}

const tokenKey = "workstyle_admin_token_v1"

export const useAdminStore = create<AdminState>((set, get) => {
  const bootToken = typeof window === "undefined" ? undefined : localStorage.getItem(tokenKey) || undefined
  return {
    token: bootToken,
    status: "idle",
    reports: [],
    login: async (password) => {
      set({ status: "loading", error: undefined })
      try {
        const res = await apiJson<{ token: string }>("/api/admin/login", {
          method: "POST",
          body: JSON.stringify({ password }),
        })
        localStorage.setItem(tokenKey, res.token)
        set({ token: res.token, status: "ready" })
        return true
      } catch (e) {
        set({ status: "error", error: e instanceof Error ? e.message : "登录失败" })
        return false
      }
    },
    logout: () => {
      const token = get().token
      set({ token: undefined, reports: [] })
      try {
        localStorage.removeItem(tokenKey)
      } catch {
        return
      }
      if (token) {
        void apiJson("/api/admin/logout", { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {})
      }
    },
    loadReports: async () => {
      const token = get().token
      if (!token) {
        set({ reports: [], status: "idle" })
        return
      }
      set({ status: "loading", error: undefined })
      try {
        const res = await apiJson<{ reports: SharedReport[] }>("/api/admin/reports", {
          headers: { Authorization: `Bearer ${token}` },
        })
        set({ reports: res.reports, status: "ready" })
      } catch (e) {
        set({ status: "error", error: e instanceof Error ? e.message : "加载失败" })
      }
    },
    getReport: async (id) => {
      const token = get().token
      if (!token) return null
      try {
        const res = await apiJson<{ report: SharedReport }>(`/api/admin/reports/${encodeURIComponent(id)}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        return res.report
      } catch {
        return null
      }
    },
  }
})

