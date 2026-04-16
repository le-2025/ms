import { useEffect, useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import PageShell from "@/components/PageShell"
import { cn } from "@/lib/utils"
import { getDomainLabel, type Big5Item } from "@/lib/big5"
import { useAssessmentStore } from "@/store/assessmentStore"

export default function Test() {
  const navigate = useNavigate()
  const {
    version,
    items,
    answers,
    consented,
    status,
    error,
    setVersion,
    setConsented,
    init,
    answer,
    reset,
  } = useAssessmentStore()

  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (status === "idle") void init()
  }, [init, status])

  useEffect(() => {
    if (!items.length) return
    const firstUnanswered = items.findIndex((it) => answers[it.id] == null)
    setIndex(firstUnanswered === -1 ? 0 : firstUnanswered)
  }, [answers, items])

  const current = items[index]
  const progress = useMemo(() => {
    if (!items.length) return { answered: 0, total: 0, pct: 0 }
    const answered = items.filter((it) => answers[it.id] != null).length
    const total = items.length
    const pct = Math.round((answered / total) * 100)
    return { answered, total, pct }
  }, [answers, items])

  const onPick = (item: Big5Item, score: number) => {
    answer(item.id, score)
    const next = findNextIndex(items, answers, index, item.id)
    if (next != null) setIndex(next)
  }

  const canGoPrev = index > 0
  const canGoNext = index < items.length - 1

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-800">
          <div className="border-b border-zinc-800 px-6 py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">测评</div>
                <div className="mt-1 text-xs text-zinc-400">
                  {version === "short" ? "短测（约 7–10 分钟）" : "长测（100 题，约 12–18 分钟）"}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    reset()
                    setIndex(0)
                    void init()
                  }}
                  className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
                >
                  重新开始
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/result")}
                  className="rounded-lg bg-emerald-400 px-3 py-2 text-xs font-semibold text-zinc-950 transition hover:bg-emerald-300"
                >
                  查看结果
                </button>
              </div>
            </div>

            <div className="mt-4">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <div>
                  进度：{progress.answered}/{progress.total}
                </div>
                <div>{progress.pct}%</div>
              </div>
              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-800">
                <div className="h-full bg-emerald-400" style={{ width: `${progress.pct}%` }} />
              </div>
            </div>
          </div>

          {!consented ? (
            <div className="px-6 py-6">
              <div className="rounded-2xl bg-zinc-950/40 p-5 ring-1 ring-zinc-800">
                <div className="text-sm font-semibold">开始前请确认</div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                  <li>本工具用于协作与沟通，不作为惩罚/裁员单一依据。</li>
                  <li>默认不上传任何数据；分享给主管需要你在结果页明确点击分享。</li>
                  <li>结果是倾向参考，不是定论。</li>
                </ul>
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setConsented(true)}
                    className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
                  >
                    我已理解并同意
                  </button>
                  <a href="/" className="text-sm text-zinc-300 underline underline-offset-4 hover:text-zinc-50">
                    返回首页
                  </a>
                </div>
              </div>
            </div>
          ) : status === "error" ? (
            <div className="px-6 py-10 text-sm text-red-200">{error ?? "加载失败"}</div>
          ) : status === "loading" ? (
            <div className="px-6 py-10 text-sm text-zinc-300">正在加载题目…</div>
          ) : !current ? (
            <div className="px-6 py-10 text-sm text-zinc-300">暂无题目</div>
          ) : (
            <div className="px-6 py-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs text-zinc-400">
                  维度：<span className="text-zinc-200">{getDomainLabel(current.domain)}</span>
                </div>
                <div className="text-xs text-zinc-400">
                  题目：{index + 1}/{items.length}
                </div>
              </div>

              <div
                key={current.id}
                className="mt-4 animate-in fade-in slide-in-from-bottom-4 duration-300 rounded-2xl bg-zinc-900 shadow-xl p-8 ring-1 ring-zinc-700/50"
              >
                <div className="text-xl md:text-2xl font-bold leading-relaxed tracking-wide text-zinc-100">
                  {current.text}
                </div>
                <div className="mt-8">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <div>{current.choices[0]?.text}</div>
                    <div>{current.choices[current.choices.length - 1]?.text}</div>
                  </div>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                  {current.choices.map((c) => {
                    const chosen = answers[current.id] === c.score
                    return (
                      <button
                        key={c.score}
                        type="button"
                        onClick={() => onPick(current, c.score)}
                        className={cn(
                          "group relative flex w-full items-center justify-center overflow-hidden rounded-xl px-2 py-4 text-sm font-semibold ring-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-400",
                          chosen
                            ? "bg-emerald-400 text-zinc-950 ring-emerald-400 shadow-lg shadow-emerald-900/20 scale-[1.02]"
                            : "bg-zinc-800/40 text-zinc-300 ring-zinc-700/50 hover:bg-zinc-800 hover:text-zinc-100 hover:ring-zinc-600 hover:shadow-md",
                        )}
                      >
                        <span className="relative z-10">{c.score + 1}</span>
                        {chosen && (
                          <div className="absolute inset-0 z-0 bg-gradient-to-r from-emerald-400/0 via-white/20 to-emerald-400/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                        )}
                      </button>
                    )
                  })}
                  </div>
                  <div className="mt-3 grid grid-cols-5 gap-2 text-xs text-zinc-400">
                    {current.choices.map((c) => (
                      <div key={c.score} className="text-center">
                        {c.text}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={!canGoPrev}
                  onClick={() => setIndex((v) => Math.max(0, v - 1))}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
                    canGoPrev ? "bg-zinc-900 text-zinc-100 ring-zinc-800 hover:bg-zinc-800" : "bg-zinc-950 text-zinc-600 ring-zinc-900",
                  )}
                >
                  上一题
                </button>
                <button
                  type="button"
                  disabled={!canGoNext}
                  onClick={() => setIndex((v) => Math.min(items.length - 1, v + 1))}
                  className={cn(
                    "rounded-xl px-4 py-2 text-sm font-semibold ring-1 transition",
                    canGoNext ? "bg-zinc-900 text-zinc-100 ring-zinc-800 hover:bg-zinc-800" : "bg-zinc-950 text-zinc-600 ring-zinc-900",
                  )}
                >
                  下一题
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">版本选择</div>
            <div className="mt-3 grid gap-2">
              <button
                type="button"
                onClick={() => {
                  setVersion("short")
                  reset()
                  setIndex(0)
                  void init()
                }}
                className={cn(
                  "rounded-xl px-4 py-3 text-left text-sm ring-1 transition",
                  version === "short" ? "bg-emerald-400 text-zinc-950 ring-emerald-300" : "bg-zinc-900/40 text-zinc-100 ring-zinc-800 hover:bg-zinc-900",
                )}
              >
                短测（推荐）
              </button>
              <button
                type="button"
                onClick={() => {
                  setVersion("long")
                  reset()
                  setIndex(0)
                  void init()
                }}
                className={cn(
                  "rounded-xl px-4 py-3 text-left text-sm ring-1 transition",
                  version === "long" ? "bg-emerald-400 text-zinc-950 ring-emerald-300" : "bg-zinc-900/40 text-zinc-100 ring-zinc-800 hover:bg-zinc-900",
                )}
              >
                长测（更全面）
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">作答建议</div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
              <li>按第一直觉作答，不要迎合“公司喜欢的答案”。</li>
              <li>以最近 3–6 个月的真实行为为准。</li>
              <li>如果某题难以判断，选择更接近你日常的那一项。</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

function findNextIndex(items: Big5Item[], answers: Record<string, number>, currentIndex: number, justAnsweredId: string): number | null {
  if (!items.length) return null
  const withNew = { ...answers, [justAnsweredId]: 0 }
  for (let i = currentIndex + 1; i < items.length; i += 1) {
    if (withNew[items[i].id] == null) return i
  }
  for (let i = 0; i < items.length; i += 1) {
    if (withNew[items[i].id] == null) return i
  }
  return null
}
