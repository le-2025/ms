import { Router, type Request, type Response } from "express"
import { createSharedReport, type Big5Domain } from "../storage.js"

const router = Router()

router.post("/share", async (req: Request, res: Response) => {
  const body = req.body as Partial<{
    assessmentKind: "big5"
    assessmentVersion: "short" | "long"
    displayName?: string
    scores: Record<Big5Domain, number>
    bands: Record<Big5Domain, "low" | "mid" | "high">
  }>

  if (body.assessmentKind !== "big5") {
    res.status(400).json({ success: false, error: "assessmentKind 不支持" })
    return
  }
  if (body.assessmentVersion !== "short" && body.assessmentVersion !== "long") {
    res.status(400).json({ success: false, error: "assessmentVersion 不合法" })
    return
  }
  if (!body.scores || !body.bands) {
    res.status(400).json({ success: false, error: "scores/bands 缺失" })
    return
  }

  const domains: Big5Domain[] = ["O", "C", "E", "A", "N"]
  const scores = body.scores as unknown as Record<string, unknown>
  const bands = body.bands as unknown as Record<string, unknown>
  for (const d of domains) {
    const v = scores[d]
    const b = bands[d]
    if (typeof v !== "number" || v < 0 || v > 100) {
      res.status(400).json({ success: false, error: "scores 不合法" })
      return
    }
    if (b !== "low" && b !== "mid" && b !== "high") {
      res.status(400).json({ success: false, error: "bands 不合法" })
      return
    }
  }

  const report = await createSharedReport({
    assessmentKind: "big5",
    assessmentVersion: body.assessmentVersion,
    displayName: body.displayName?.slice(0, 40),
    scores: body.scores,
    bands: body.bands,
  })

  res.status(200).json({ id: report.id, createdAt: report.createdAt })
})

export default router
