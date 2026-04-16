import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import PageShell from "@/components/PageShell"
import { cn } from "@/lib/utils"
import { useAdminStore } from "@/store/adminStore"

export default function AdminLogin() {
  const navigate = useNavigate()
  const { token, status, error, login, loadReports } = useAdminStore()
  const [password, setPassword] = useState("")

  useEffect(() => {
    if (!token) return
    void loadReports().finally(() => navigate("/admin/dashboard"))
  }, [loadReports, navigate, token])

  const submit = async () => {
    const ok = await login(password)
    if (ok) {
      await loadReports()
      navigate("/admin/dashboard")
    }
  }

  return (
    <PageShell>
      <div className="mx-auto max-w-md rounded-2xl bg-zinc-900/40 p-6 ring-1 ring-zinc-800">
        <div className="text-sm font-semibold">管理后台登录</div>
        <div className="mt-2 text-sm text-zinc-300">使用企业口令登录以查看员工自愿分享的结果。</div>

        <div className="mt-5 grid gap-2">
          <label className="text-xs text-zinc-400">口令</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-10 rounded-xl bg-zinc-950/40 px-3 text-sm text-zinc-100 ring-1 ring-zinc-800 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            placeholder="请输入口令"
          />
        </div>

        <button
          type="button"
          onClick={() => void submit()}
          disabled={!password.trim() || status === "loading"}
          className={cn(
            "mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition",
            password.trim() ? "bg-emerald-400 text-zinc-950 hover:bg-emerald-300 disabled:bg-zinc-800 disabled:text-zinc-400" : "bg-zinc-800 text-zinc-400",
          )}
        >
          {status === "loading" ? "登录中…" : "登录"}
        </button>

        {status === "error" && error ? <div className="mt-3 text-xs text-red-200">{error}</div> : null}

        <div className="mt-6 rounded-xl bg-zinc-950/40 p-4 text-xs text-zinc-400 ring-1 ring-zinc-800">
          建议将口令通过环境变量配置在服务端，并定期轮换。
        </div>
      </div>
    </PageShell>
  )
}

