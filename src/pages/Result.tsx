import { useEffect, useMemo, useState } from "react"
import PageShell from "@/components/PageShell"
import { buildManagementCards, getBandLabel, getDomainHint, getDomainLabel, type Big5Domain } from "@/lib/big5"
import { cn } from "@/lib/utils"
import { apiJson } from "@/lib/http"
import { useAssessmentStore } from "@/store/assessmentStore"

export default function Result() {
  const { items, answers, result, status, init, consented, version } = useAssessmentStore()
  const [displayName, setDisplayName] = useState("")
  const [shareState, setShareState] = useState<"idle" | "sending" | "done" | "error">("idle")
  const [shareError, setShareError] = useState<string | undefined>()
  const [shareId, setShareId] = useState<string | undefined>()

  useEffect(() => {
    if (status === "idle") void init()
  }, [init, status])

  const answeredCount = useMemo(() => items.filter((it) => answers[it.id] != null).length, [answers, items])
  const total = items.length
  const canShow = consented && result && total > 0

  const cards = useMemo(() => (result ? buildManagementCards(result) : []), [result])

  const share = async () => {
    if (!result) return
    setShareState("sending")
    setShareError(undefined)
    try {
      const res = await apiJson<{ id: string; createdAt: string }>("/api/share", {
        method: "POST",
        body: JSON.stringify({
          assessmentKind: "big5",
          assessmentVersion: version,
          displayName: displayName.trim() ? displayName.trim() : undefined,
          scores: result.scores,
          bands: result.bands,
        }),
      })
      setShareId(res.id)
      setShareState("done")
    } catch (e) {
      setShareState("error")
      setShareError(e instanceof Error ? e.message : "分享失败")
    }
  }

  return (
    <PageShell>
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-zinc-900/40 ring-1 ring-zinc-800">
            <div className="border-b border-zinc-800 px-6 py-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold">结果报告</div>
                  <div className="mt-1 text-xs text-zinc-400">用于沟通与协作方式对齐（不用于单一人事决策）</div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-lg bg-zinc-900 px-3 py-2 text-xs font-semibold text-zinc-200 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
                  >
                    导出/打印
                  </button>
                </div>
              </div>
            </div>

            {!consented ? (
              <div className="px-6 py-10 text-sm text-zinc-300">请先在测评页同意用途与隐私声明。</div>
            ) : !result ? (
              <div className="px-6 py-10 text-sm text-zinc-300">正在生成结果…</div>
            ) : answeredCount < total ? (
              <div className="px-6 py-10 text-sm text-zinc-300">
                当前已完成 {answeredCount}/{total} 题，完成后会自动生成更稳定的结果。
              </div>
            ) : (
              <div className="px-6 py-6">
                <div className="grid gap-3 md:grid-cols-2">
                  {(["O", "C", "E", "A", "N"] as Big5Domain[]).map((d) => (
                    <div key={d} className="rounded-2xl bg-zinc-950/40 p-5 ring-1 ring-zinc-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-semibold">{getDomainLabel(d)}</div>
                          <div className="mt-1 text-xs text-zinc-400">{getDomainHint(d)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-semibold tabular-nums">{result.scores[d]}</div>
                          <div className="text-xs text-zinc-400">{getBandLabel(result.bands[d])}</div>
                        </div>
                      </div>
                      <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-900 ring-1 ring-zinc-800">
                        <div className="h-full bg-emerald-400" style={{ width: `${result.scores[d]}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 grid gap-3 md:grid-cols-2">
                  {cards.map((c) => (
                    <div key={c.title} className="rounded-2xl bg-zinc-950/40 p-5 ring-1 ring-zinc-800">
                      <div className="text-sm font-semibold">{c.title}</div>
                      <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                        {c.items.map((it) => (
                          <li key={it}>{it}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-2xl bg-zinc-950/40 p-5 ring-1 ring-zinc-800">
                  <div className="text-sm font-semibold">解读提示</div>
                  <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                    <li>分数是倾向参考，受当下情绪与自我觉察影响；更建议看稳定模式。</li>
                    <li>不要用结果给自己或他人贴标签；用“如何协作更顺畅”来讨论。</li>
                    <li>如果你愿意分享给主管，只会分享派生得分与建议，不会分享逐题作答。</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">分享给主管（可选）</div>
            <div className="mt-3 text-sm text-zinc-300">
              仅分享派生得分与动作建议，不包含逐题作答。
            </div>
            <div className="mt-4 grid gap-2">
              <label className="text-xs text-zinc-400">展示名称（可选）</label>
              <input
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="例如：张三"
                className="h-10 rounded-xl bg-zinc-950/40 px-3 text-sm text-zinc-100 ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
            </div>

            <button
              type="button"
              disabled={!canShow || answeredCount < total || shareState === "sending" || shareState === "done"}
              onClick={() => void share()}
              className={cn(
                "mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition",
                canShow && answeredCount === total && shareState !== "done"
                  ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-300 disabled:bg-zinc-800 disabled:text-zinc-400"
                  : "bg-zinc-800 text-zinc-400",
              )}
            >
              {shareState === "sending" ? "分享中…" : shareState === "done" ? "已分享" : "分享"}
            </button>

            {shareState === "error" ? <div className="mt-3 text-xs text-red-200">{shareError}</div> : null}
            {shareState === "done" && shareId ? (
              <div className="mt-3 text-xs text-zinc-400">
                分享编号：<span className="font-mono text-zinc-300">{shareId}</span>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">下一步怎么用</div>
            <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
              <li>把“沟通方式”动作卡带到 1:1，让对方选“更舒服的沟通形式”。</li>
              <li>把“任务适配”用于分工讨论：哪些任务更能发挥优势，哪些需要兜底机制。</li>
              <li>把“风险提示”写进看板：触发条件 + 升级机制 + 预案。</li>
            </ul>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

