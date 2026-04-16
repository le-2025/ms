import { Router, type Request, type Response, type NextFunction } from "express"
import crypto from "node:crypto"
import { createAdminSession, deleteAdminSession, getSharedReport, listSharedReports, verifyAdminToken } from "../storage.js"

const router = Router()

router.post("/admin/login", async (req: Request, res: Response) => {
  const body = req.body as Partial<{ password: string }>
  const expected = process.env.ADMIN_PASSWORD || (process.env.NODE_ENV !== "production" ? "admin" : "")
  if (!expected) {
    res.status(500).json({ success: false, error: "未配置管理员口令" })
    return
  }
  if (!body.password || body.password !== expected) {
    res.status(401).json({ success: false, error: "口令错误" })
    return
  }

  const token = crypto.randomBytes(32).toString("base64url")
  await createAdminSession(token, 7 * 24 * 60 * 60 * 1000)
  res.status(200).json({ token })
})

router.post("/admin/logout", adminGuard, async (req: Request, res: Response) => {
  const token = getBearerToken(req)
  if (token) await deleteAdminSession(token)
  res.status(200).json({ success: true })
})

router.get("/admin/reports", adminGuard, async (_req: Request, res: Response) => {
  const reports = await listSharedReports()
  res.status(200).json({ reports })
})

router.get("/admin/reports/:id", adminGuard, async (req: Request, res: Response) => {
  const report = await getSharedReport(req.params.id)
  if (!report) {
    res.status(404).json({ success: false, error: "未找到" })
    return
  }
  res.status(200).json({ report })
})

async function adminGuard(req: Request, res: Response, next: NextFunction) {
  const token = getBearerToken(req)
  if (!token) {
    res.status(401).json({ success: false, error: "未登录" })
    return
  }
  const ok = await verifyAdminToken(token)
  if (!ok) {
    res.status(401).json({ success: false, error: "会话已过期" })
    return
  }
  next()
}

function getBearerToken(req: Request): string | null {
  const h = req.header("authorization") || ""
  if (!h.startsWith("Bearer ")) return null
  return h.slice("Bearer ".length).trim() || null
}

export default router
