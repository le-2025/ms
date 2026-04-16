export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14">
        <div className="flex flex-col gap-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-zinc-900 px-3 py-1 text-xs text-zinc-300 ring-1 ring-zinc-800">
            隐私优先：默认不上传，分享需明确授权
          </div>
          <h1 className="text-balance text-3xl font-semibold tracking-tight md:text-5xl">
            用一份工作风格测评，把“猜人”变成“对齐协作方式”
          </h1>
          <p className="max-w-2xl text-pretty text-sm leading-6 text-zinc-300 md:text-base">
            员工完成测评后获得可执行的“管理动作卡”，可选择是否分享给主管。管理者在后台查看团队分布与个人建议，用更一致的规则进行沟通、分工与激励。
          </p>
          <div className="flex flex-wrap gap-3">
            <a
              href="/test"
              className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
            >
              开始测评
            </a>
            <a
              href="/admin"
              className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-zinc-100 ring-1 ring-zinc-800 transition hover:bg-zinc-800"
            >
              管理后台
            </a>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">不贴标签</div>
            <div className="mt-2 text-sm text-zinc-300">输出的是可讨论的工作偏好与风险提示，并提供对话脚本。</div>
          </div>
          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">可落地动作</div>
            <div className="mt-2 text-sm text-zinc-300">把结果转成“沟通方式 / 激励方式 / 任务适配 / 风险提示”。</div>
          </div>
          <div className="rounded-2xl bg-zinc-900/40 p-5 ring-1 ring-zinc-800">
            <div className="text-sm font-semibold">可选分享</div>
            <div className="mt-2 text-sm text-zinc-300">默认本地处理；分享仅上传派生得分，不上传逐题作答。</div>
          </div>
        </div>

        <div className="rounded-2xl bg-zinc-900/30 p-6 ring-1 ring-zinc-800">
          <div className="text-sm font-semibold">使用边界</div>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            <li>不要把结果当成“人格定论”；以实际表现与持续沟通为准。</li>
            <li>不要用结果单独做惩罚/裁员依据；可用于辅导、分工与反馈方式调整。</li>
            <li>建议配合每周 1:1 与公开看板使用，形成“目标-反馈-改进”的闭环。</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
