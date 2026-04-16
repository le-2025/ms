import { useEffect, useMemo, useState } from "react"
import { Link, useNavigate } from "react-router-dom"
import PageShell from "@/components/PageShell"
import { cn } from "@/lib/utils"
import { getBandLabel, getDomainLabel, type Big5Domain } from "@/lib/big5"
import { useAdminStore } from "@/store/adminStore"

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { token, status, error, reports, loadReports, logout } = useAdminStore()
  const [q, setQ] = useState("")

  useEffect(() => {
    if (!token) navigate("/admin")
  }, [navigate, token])

  useEffect(() => {
    if (!token) return
    void loadReports()
  }, [loadReports, token])

  const filtered = useMemo(() => {
    const kw = q.trim().toLowerCase()
    if (!kw) return reports
    return reports.filter((r) => (r.displayName ?? "").toLowerCase().includes(kw) || r.id.toLowerCase().includes(kw))
  }, [q, reports])

  const stats = useMemo(() => buildStats(reports), [reports])

  return (
    <PageShell>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-lg font-semibold">团队概览</div>
          <div className="mt-1 text-sm text-zinc-300">仅展示员工主动分享的派生结果。</div>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void loadReports()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
          >
            刷新
          </button>
          <button
            type="button"
            onClick={() => logout()}
            className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
          >
            退出
          </button>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
          <div className="text-xs text-zinc-400">已分享人数</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{reports.length}</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
          <div className="text-xs text-zinc-400">近 7 天新增</div>
          <div className="mt-2 text-3xl font-semibold tabular-nums">{stats.last7d}</div>
        </div>
        <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
          <div className="text-xs text-zinc-400">常见倾向（粗略）</div>
          <div className="mt-2 text-sm text-zinc-200">{stats.topHint}</div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
        <div className="text-sm font-semibold">维度分布</div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {(["O", "C", "E", "A", "N"] as Big5Domain[]).map((d) => (
            <div key={d} className="rounded-2xl bg-zinc-950/40 p-4 ring-1 ring-zinc-800">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-semibold">{getDomainLabel(d)}</div>
                <div className="text-xs text-zinc-400">低/中/高</div>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                {(["low", "mid", "high"] as const).map((b) => (
                  <div key={b} className="rounded-xl bg-zinc-900/40 px-3 py-2 text-zinc-200 ring-1 ring-zinc-800">
                    <div className="text-zinc-400">{getBandLabel(b)}</div>
                    <div className="mt-1 text-lg font-semibold tabular-nums">{stats.bandCounts[d][b]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-sm font-semibold">人员列表</div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索名称或编号"
            className="h-10 w-full rounded-xl bg-zinc-950/40 px-3 text-sm text-zinc-100 ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400 sm:w-64"
          />
        </div>

        {status === "error" && error ? <div className="mt-4 text-sm text-red-200">{error}</div> : null}
        {status === "loading" ? <div className="mt-4 text-sm text-zinc-300">加载中…</div> : null}

        <div className="mt-4 overflow-hidden rounded-2xl ring-1 ring-zinc-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-zinc-950/60 text-xs text-zinc-400">
              <tr>
                <th className="px-4 py-3">名称</th>
                <th className="px-4 py-3">版本</th>
                <th className="px-4 py-3">时间</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 bg-zinc-900/30">
              {filtered.length ? (
                filtered
                  .slice()
                  .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                  .map((r) => (
                    <tr key={r.id} className="hover:bg-zinc-900/60">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-zinc-100">{r.displayName || "未命名"}</div>
                        <div className="mt-1 font-mono text-xs text-zinc-500">{r.id}</div>
                      </td>
                      <td className="px-4 py-3 text-zinc-300">{r.assessmentVersion === "short" ? "短测" : "长测"}</td>
                      <td className="px-4 py-3 text-zinc-300">{formatTime(r.createdAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/admin/person/${encodeURIComponent(r.id)}`}
                          className={cn(
                            "inline-flex items-center rounded-lg bg-zinc-950/40 px-3 py-2 text-xs font-semibold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-950",
                          )}
                        >
                          查看
                        </Link>
                      </td>
                    </tr>
                  ))
              ) : (
                <tr>
                  <td className="px-4 py-8 text-center text-sm text-zinc-400" colSpan={4}>
                    暂无数据
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
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

function buildStats(reports: Array<{ createdAt: string; bands: Record<Big5Domain, "low" | "mid" | "high"> }>): {
  bandCounts: Record<Big5Domain, Record<"low" | "mid" | "high", number>>
  last7d: number
  topHint: string
} {
  const domains: Big5Domain[] = ["O", "C", "E", "A", "N"]
  const bandCounts = domains.reduce((acc, d) => {
    acc[d] = { low: 0, mid: 0, high: 0 }
    return acc
  }, {} as Record<Big5Domain, Record<"low" | "mid" | "high", number>>)

  for (const r of reports) {
    for (const d of domains) {
      bandCounts[d][r.bands[d]] += 1
    }
  }

  const now = Date.now()
  const last7d = reports.filter((r) => now - new Date(r.createdAt).getTime() <= 7 * 24 * 60 * 60 * 1000).length

  const topHint = [
    pickTop(bandCounts.O, "开放性"),
    pickTop(bandCounts.C, "尽责性"),
    pickTop(bandCounts.E, "外向性"),
    pickTop(bandCounts.A, "宜人性"),
    pickTop(bandCounts.N, "情绪稳定性"),
  ]
    .filter(Boolean)
    .slice(0, 2)
    .join("；")

  return { bandCounts, last7d, topHint: topHint || "需要更多样本" }
}

function pickTop(counts: Record<"low" | "mid" | "high", number>, label: string): string {
  const entries = Object.entries(counts) as Array<["low" | "mid" | "high", number]>
  entries.sort((a, b) => b[1] - a[1])
  const [band, count] = entries[0]
  if (count === 0) return ""
  return `${label}${getBandLabel(band)}较多`
}

