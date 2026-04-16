import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import PageShell from "@/components/PageShell"
import { buildManagementCards, getBandLabel, getDomainHint, getDomainLabel, type Big5Domain } from "@/lib/big5"
import { cn } from "@/lib/utils"
import { useAdminStore, type SharedReport } from "@/store/adminStore"

export default function AdminPerson() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { token, getReport } = useAdminStore()
  const [report, setReport] = useState<SharedReport | null>(null)
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading")

  useEffect(() => {
    if (!token) navigate("/admin")
  }, [navigate, token])

  useEffect(() => {
    if (!id) return
    setStatus("loading")
    void getReport(id).then((r) => {
      setReport(r)
      setStatus(r ? "ready" : "error")
    })
  }, [getReport, id])

  const cards = useMemo(() => {
    if (!report) return []
    return buildManagementCards({ scores: report.scores, bands: report.bands })
  }, [report])

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">个人详情</div>
          <div className="mt-1 text-sm text-zinc-300">建议结合 1:1 对话与实际表现校准。</div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/admin/dashboard"
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
          >
            返回列表
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
          >
            导出/打印
          </button>
        </div>
      </div>

      {status === "loading" ? <div className="mt-6 text-sm text-zinc-300">加载中…</div> : null}
      {status === "error" ? <div className="mt-6 text-sm text-red-200">未找到该记录</div> : null}

      {status === "ready" && report ? (
        <div className="mt-6 space-y-6">
          <div className="rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">{report.displayName || "未命名"}</div>
                <div className="mt-1 font-mono text-xs text-zinc-500">{report.id}</div>
              </div>
              <div className="text-xs text-zinc-400">
                {report.assessmentVersion === "short" ? "短测" : "长测"} · {formatTime(report.createdAt)}
              </div>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {(["O", "C", "E", "A", "N"] as Big5Domain[]).map((d) => (
              <div key={d} className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold">{getDomainLabel(d)}</div>
                    <div className="mt-1 text-xs text-zinc-400">{getDomainHint(d)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-semibold tabular-nums">{report.scores[d]}</div>
                    <div className="text-xs text-zinc-400">{getBandLabel(report.bands[d])}</div>
                  </div>
                </div>
                <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-zinc-950/50 ring-1 ring-zinc-800">
                  <div className="h-full bg-emerald-400" style={{ width: `${report.scores[d]}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {cards.map((c) => (
              <div key={c.title} className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
                <div className="text-sm font-semibold">{c.title}</div>
                <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
                  {c.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">1:1 话术（建议）</div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className={cn("rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-zinc-800")}>
                <div className="text-xs font-semibold text-zinc-200">沟通偏好校准</div>
                <div className="mt-2 text-sm text-zinc-300">
                  “这份报告里提到你可能更偏好 {report.bands.E === "high" ? "同步沟通" : "异步沟通"}。你觉得我用什么方式给你需求/反馈更舒服？”
                </div>
              </div>
              <div className={cn("rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-zinc-800")}>
                <div className="text-xs font-semibold text-zinc-200">任务分工讨论</div>
                <div className="mt-2 text-sm text-zinc-300">
                  “接下来两周我们有 A/B 两类任务，你更想负责哪类？你需要我提供什么节奏/资源，能让你更好交付？”
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </PageShell>
  )
}

function formatTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, "0")
  const da = String(d.getDate()).padStart(2, "0")
  const hh = String(d.getHours()).padStart(2, "0")
  const mm = String(d.getMinutes()).padStart(2, "0")
  return `${y}-${m}-${da} ${hh}:${mm}`
}

