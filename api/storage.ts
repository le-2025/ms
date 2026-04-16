import { kv } from "@vercel/kv"
import crypto from "node:crypto"
import { createClient } from "redis"

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

type StorageMode = "kv" | "redis"

function getStorageMode(): StorageMode {
  if (process.env.REDIS_URL) return "redis"
  return "kv"
}

type RedisClient = ReturnType<typeof createClient>

let redisClientPromise: Promise<RedisClient> | undefined

async function getRedisClient(): Promise<RedisClient> {
  if (redisClientPromise) return redisClientPromise
  const url = process.env.REDIS_URL
  if (!url) throw new Error("REDIS_URL 未配置")
  const client = createClient({ url }) as RedisClient
  redisClientPromise = client.connect().then(() => client)
  return redisClientPromise
}

export async function createSharedReport(input: Omit<SharedReport, "id" | "createdAt">): Promise<SharedReport> {
  const now = new Date().toISOString()
  const report: SharedReport = { ...input, id: `rep_${crypto.randomUUID()}`, createdAt: now }

  if (getStorageMode() === "redis") {
    const client = await getRedisClient()
    await client.lPush(REPORT_LIST_KEY, JSON.stringify(report))
    return report
  }

  await (kv as any).lpush(REPORT_LIST_KEY, JSON.stringify(report))
  return report
}

export async function listSharedReports(): Promise<SharedReport[]> {
  if (getStorageMode() === "redis") {
    const client = await getRedisClient()
    const rawList = await client.lRange(REPORT_LIST_KEY, 0, -1)
    return rawList.map((s) => {
      const text = typeof s === "string" ? s : s.toString()
      return JSON.parse(text) as SharedReport
    })
  }

  const rawList = await (kv as any).lrange(REPORT_LIST_KEY, 0, -1)
  if (!rawList) return []
  return (rawList as unknown[]).map((item) => {
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

  if (getStorageMode() === "redis") {
    const client = await getRedisClient()
    await client.set(key, JSON.stringify(session), { EX: ttlSeconds })
    return session
  }

  await kv.set(key, JSON.stringify(session), { ex: ttlSeconds })
  return session
}

export async function deleteAdminSession(token: string): Promise<void> {
  const hash = sha256(token)
  const key = `${SESSION_KEY_PREFIX}${hash}`
  if (getStorageMode() === "redis") {
    const client = await getRedisClient()
    await client.del(key)
    return
  }
  await kv.del(key)
}

export async function verifyAdminToken(token: string): Promise<boolean> {
  const hash = sha256(token)
  const key = `${SESSION_KEY_PREFIX}${hash}`
  if (getStorageMode() === "redis") {
    const client = await getRedisClient()
    const sessionData = await client.get(key)
    return !!sessionData
  }
  const sessionData = await kv.get(key)
  return !!sessionData
}

function sha256(v: string): string {
  return crypto.createHash("sha256").update(v).digest("hex")
}
