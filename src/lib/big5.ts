export type Big5Domain = "O" | "C" | "E" | "A" | "N"

export type Big5Keyed = string

export type Big5Choice = {
  text: string
  score: 0 | 1 | 2 | 3 | 4
  color?: number
}

export type Big5Item = {
  id: string
  text: string
  keyed: Big5Keyed
  domain: Big5Domain
  facet?: number
  num?: number
  choices: Big5Choice[]
}

export type Big5Scores = Record<Big5Domain, number>

export type Big5Bands = Record<Big5Domain, "low" | "mid" | "high">

export type Big5Result = {
  scores: Big5Scores
  bands: Big5Bands
}

export async function getBig5Items(opts: {
  lang: "zh-cn" | "en"
  shuffle: boolean
  version: "short" | "long"
}): Promise<Big5Item[]> {
  const params = new URLSearchParams({
    lang: opts.lang,
    shuffle: opts.shuffle ? "1" : "0",
    version: opts.version,
  })
  const res = await fetch(`/api/items?${params.toString()}`)
  if (!res.ok) throw new Error("题目加载失败")
  const data = (await res.json()) as { items: Big5Item[] }
  return data.items
}

export function calculateBig5Result(items: Big5Item[], answers: Record<string, number>): Big5Result {
  const domains: Big5Domain[] = ["O", "C", "E", "A", "N"]
  const sums: Record<Big5Domain, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }
  const counts: Record<Big5Domain, number> = { O: 0, C: 0, E: 0, A: 0, N: 0 }

  for (const item of items) {
    const raw = answers[item.id]
    if (raw == null) continue
    const score = item.keyed === "plus" ? raw : 4 - raw
    sums[item.domain] += score
    counts[item.domain] += 1
  }

  const scores = domains.reduce((acc, domain) => {
    const n = counts[domain] || 1
    const max = 4 * n
    const normalized = Math.round((sums[domain] / max) * 100)
    acc[domain] = clamp(normalized, 0, 100)
    return acc
  }, {} as Big5Scores)

  const bands = domains.reduce((acc, domain) => {
    const v = scores[domain]
    acc[domain] = v <= 33 ? "low" : v >= 67 ? "high" : "mid"
    return acc
  }, {} as Big5Bands)

  return { scores, bands }
}

export function getBandLabel(band: "low" | "mid" | "high"): string {
  if (band === "low") return "偏低"
  if (band === "high") return "偏高"
  return "中等"
}

export function getDomainLabel(domain: Big5Domain): string {
  if (domain === "O") return "开放性"
  if (domain === "C") return "尽责性"
  if (domain === "E") return "外向性"
  if (domain === "A") return "宜人性"
  return "情绪稳定性"
}

export function getDomainHint(domain: Big5Domain): string {
  if (domain === "O") return "偏好新鲜事物、抽象思考与探索"
  if (domain === "C") return "偏好计划、结构、按承诺交付"
  if (domain === "E") return "偏好外部刺激、社交与表达"
  if (domain === "A") return "偏好协作、共情与减少冲突"
  return "压力下更容易保持稳定（分数越高越稳定）"
}

export function buildManagementCards(result: Big5Result): Array<{
  title: string
  items: string[]
}> {
  const { bands } = result

  const comm: string[] = []
  if (bands.E === "high") comm.push("用同步沟通更有效：当面/语音优先，信息别堆太久")
  if (bands.E === "low") comm.push("用异步沟通更有效：先写清目标与背景，给对方思考时间")
  if (bands.O === "high") comm.push("沟通可以给“为什么/愿景/可能性”，再落到下一步")
  if (bands.O === "low") comm.push("沟通优先给“事实/例子/边界/步骤”，少抽象表述")

  const incentive: string[] = []
  if (bands.C === "high") incentive.push("给明确责任与交付标准，认可其可靠性与连续产出")
  if (bands.C === "low") incentive.push("把目标拆小并缩短反馈周期，用阶段性里程碑驱动")
  if (bands.N === "low") incentive.push("可以给更高压、更开放的不确定任务，但要明确优先级")
  if (bands.N === "high") incentive.push("在高压期要更早给预期与保护机制，减少突然变更")

  const taskFit: string[] = []
  if (bands.O === "high") taskFit.push("适合探索型：方案设计、产品定义、流程优化、0-1试验")
  if (bands.O === "low") taskFit.push("适合执行型：标准交付、质量把控、重复流程优化（微改良）")
  if (bands.C === "high") taskFit.push("适合 owner 角色：推进、排期、风险管理、闭环")
  if (bands.C === "low") taskFit.push("适合灵活支持：并行支援、突发处理，但需要外部节奏约束")

  const risks: string[] = []
  if (bands.A === "high") risks.push("容易为了和谐而忍耐，建议明确“可说不”的边界与升级机制")
  if (bands.A === "low") risks.push("容易直球造成冲突，建议约定反馈格式：事实-影响-建议")
  if (bands.N === "high") risks.push("压力下更敏感，建议在风险出现的第一时间同步，不要独扛")
  if (bands.N === "low") risks.push("压力下可能低估风险，建议把关键风险显式写进看板并每周检查")

  return [
    { title: "沟通方式", items: uniq(comm).slice(0, 4) },
    { title: "激励与反馈", items: uniq(incentive).slice(0, 4) },
    { title: "任务适配", items: uniq(taskFit).slice(0, 4) },
    { title: "风险提示", items: uniq(risks).slice(0, 4) },
  ]
}

function clamp(v: number, min: number, max: number): number {
  if (v < min) return min
  if (v > max) return max
  return v
}

function uniq(items: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const it of items) {
    if (seen.has(it)) continue
    seen.add(it)
    out.push(it)
  }
  return out
}
