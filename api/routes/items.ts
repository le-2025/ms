import { Router, type Request, type Response } from "express"
import { getWorkStyleItems } from "../workstyleBank.js"

const router = Router()

router.get("/items", (req: Request, res: Response) => {
  const version = String(req.query.version || "short") === "long" ? "long" : "short"
  const shuffle = String(req.query.shuffle || "1") !== "0"
  const items = getWorkStyleItems({ version, shuffle })
  res.status(200).json({ items })
})

export default router
