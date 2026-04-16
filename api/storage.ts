import { kv } from "@vercel/kv"
import crypto from "node:crypto"

export type Big5Domain = "O" | "C" | "E" | "A" | "N"

export type SharedReport = {
  id: string
  assessmentKind: "big5"
  assessmentVersion: "short" | "long"
  displayName?: string
  createdAt: string
  scores: Record<Big5Domain, number>
  bands: Record<Big5Domain, "low" | "mid" | "high">
}

type AdminSession = {
  id: string
  tokenHash: string
  createdAt: string
  expiresAt: string
}

// ---------------------------------------------------------
// Vercel KV (Redis) 操作
// 我们使用 List 或 Sorted Set 存储 reports，由于只有十几个人的量级，
// 直接使用 List (lpush/lrange) 或 Hash 最为简单。
// Session 用单个 String Key 设置过期时间 (EX)
// ---------------------------------------------------------

const REPORT_LIST_KEY = "workstyle:reports:list"
const SESSION_KEY_PREFIX = "workstyle:session:"

export async function createSharedReport(input: Omit<SharedReport, "id" | "createdAt">): Promise<SharedReport> {
  const now = new Date().toISOString()
  const report: SharedReport = { ...input, id: `rep_${crypto.randomUUID()}`, createdAt: now }
  
  // 将最新的报告插入到 Redis List 左侧（最新在前）
  await kv.lpush(REPORT_LIST_KEY, JSON.stringify(report))
  return report
}

export async function listSharedReports(): Promise<SharedReport[]> {
  // 获取整个列表 (0 到 -1 表示所有)
  const rawList = await kv.lrange(REPORT_LIST_KEY, 0, -1)
  if (!rawList) return []
  
  // kv.lrange 返回的数据如果已经是对象（@vercel/kv 会自动解析 JSON），则直接断言
  // 如果是字符串数组，则解析
  return rawList.map((item: unknown) => {
    if (typeof item === "string") return JSON.parse(item) as SharedReport
    return item as SharedReport
  })
}

export async function getSharedReport(id: string): Promise<SharedReport | undefined> {
  // 遍历寻找（数据量小的情况下可接受）
  const all = await listSharedReports()
  return all.find((r) => r.id === id)
}

export async function createAdminSession(token: string, ttlMs: number): Promise<AdminSession> {
  const now = new Date()
  const hash = sha256(token)
  const session: AdminSession = {
    id: `ses_${crypto.randomUUID()}`,
    tokenHash: hash,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttlMs).toISOString(),
  }
  
  const key = `${SESSION_KEY_PREFIX}${hash}`
  const ttlSeconds = Math.floor(ttlMs / 1000)
  
  // 将 session 存入 KV 并设置过期时间
  await kv.set(key, JSON.stringify(session), { ex: ttlSeconds })
  
  return session
}

export async function deleteAdminSession(token: string): Promise<void> {
  const hash = sha256(token)
  const key = `${SESSION_KEY_PREFIX}${hash}`
  await kv.del(key)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const hash = sha256(token)
  const key = `${SESSION_KEY_PREFIX}${hash}`
  const sessionData = await kv.get(key)
  return !!sessionData
}

function sha256(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex")
}

