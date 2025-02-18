import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();
const app = express();
export default router;

router.put("/done", async (req: Request, res: Response): Promise<any> => {
  const userId = req.query.id;
  try {
    await prisma.user.update({
      where: {
        id: Number(userId),
      },
      data: {
        parentAuth: false,
        adminAuth: false,
      },
    });
  } catch (e) {
    return res.status(400).json({ error: "Invalid input" });
  }
  return res.json({ msg: "Done" });
});
