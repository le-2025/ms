import { create } from "zustand"
import { calculateBig5Result, type Big5Item, type Big5Result, getBig5Items } from "@/lib/big5"

type AssessmentVersion = "short" | "long"

type AssessmentState = {
  version: AssessmentVersion
  items: Big5Item[]
  answers: Record<string, number>
  consented: boolean
  status: "idle" | "loading" | "in_progress" | "done" | "error"
  error?: string
  result?: Big5Result
  setVersion: (v: AssessmentVersion) => void
  setConsented: (v: boolean) => void
  init: () => Promise<void>
  answer: (id: string, score: number) => void
  recompute: () => void
  reset: () => void
}

const storageKey = "workstyle_assessment_v2"

function loadFromStorage(): Pick<AssessmentState, "version" | "answers" | "consented"> | null {
  try {
    const raw = localStorage.getItem(storageKey)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { version?: AssessmentVersion; answers?: Record<string, number>; consented?: boolean }
    return {
      version: parsed.version ?? "short",
      answers: parsed.answers ?? {},
      consented: parsed.consented ?? false,
    }
  } catch {
    return null
  }
}

function saveToStorage(state: Pick<AssessmentState, "version" | "answers" | "consented">) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state))
  } catch {
    return
  }
}

export const useAssessmentStore = create<AssessmentState>((set, get) => {
  const boot = typeof window === "undefined" ? null : loadFromStorage()
  return {
    version: boot?.version ?? "short",
    items: [],
    answers: boot?.answers ?? {},
    consented: boot?.consented ?? false,
    status: "idle",
    setVersion: (v) => {
      set({ version: v })
      const { answers, consented } = get()
      saveToStorage({ version: v, answers, consented })
    },
    setConsented: (v) => {
      set({ consented: v })
      const { version, answers } = get()
      saveToStorage({ version, answers, consented: v })
    },
    init: async () => {
      const { version, answers } = get()
      set({ status: "loading", error: undefined })
      try {
        const items = await getBig5Items({ lang: "zh-cn", shuffle: true, version })
        const result = calculateBig5Result(items, answers)
        const done = items.length > 0 && items.every((it) => answers[it.id] != null)
        set({ items, result, status: done ? "done" : "in_progress" })
      } catch (e) {
        set({ status: "error", error: e instanceof Error ? e.message : "加载题目失败" })
      }
    },
    answer: (id, score) => {
      set((s) => ({ answers: { ...s.answers, [id]: score } }))
      const { version, answers, consented, items } = get()
      saveToStorage({ version, answers, consented })
      const done = items.length > 0 && items.every((it) => answers[it.id] != null)
      if (done) get().recompute()
    },
    recompute: () => {
      const { items, answers } = get()
      if (!items.length) return
      const result = calculateBig5Result(items, answers)
      const done = items.every((it) => answers[it.id] != null)
      set({ result, status: done ? "done" : "in_progress" })
    },
    reset: () => {
      set({ answers: {}, items: [], result: undefined, status: "idle", error: undefined, consented: false })
      try {
        localStorage.removeItem(storageKey)
      } catch {
        return
      }
    },
  }
})
