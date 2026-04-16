import { Link, useLocation } from "react-router-dom"
import { cn } from "@/lib/utils"

export default function PageShell(props: { children: React.ReactNode; variant?: "plain" | "app" }) {
  const location = useLocation()
  const variant = props.variant ?? "app"

  return (
    <div className={cn("min-h-screen bg-zinc-950 text-zinc-50", variant === "plain" && "bg-zinc-950")}>
      <header className="border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
          <Link to="/" className="group inline-flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-zinc-900 ring-1 ring-zinc-800 transition group-hover:ring-zinc-700">
              <div className="h-3 w-3 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.14)]" />
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold tracking-wide">工作风格测评</div>
              <div className="text-xs text-zinc-400">隐私优先 · 用于协作与沟通</div>
            </div>
          </Link>

          <nav className="flex items-center gap-2">
            <Link
              to="/test"
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50",
                location.pathname === "/test" && "bg-zinc-900 text-zinc-50",
              )}
            >
              开始测评
            </Link>
            <Link
              to="/admin"
              className={cn(
                "rounded-lg px-3 py-2 text-sm text-zinc-300 transition hover:bg-zinc-900 hover:text-zinc-50",
                location.pathname.startsWith("/admin") && "bg-zinc-900 text-zinc-50",
              )}
            >
              管理后台
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl px-4 py-10">{props.children}</main>

      <footer className="border-t border-zinc-800/80 py-8">
        <div className="mx-auto w-full max-w-6xl px-4 text-xs text-zinc-500">
          结果用于沟通、分工、激励方式匹配，不应作为单一人事决策依据。
        </div>
      </footer>
    </div>
  )
}

