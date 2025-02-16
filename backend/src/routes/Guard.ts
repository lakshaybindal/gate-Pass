import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();
const app = express();
import gAuth from "../middleware/guardmiddleware";
import jwt from "jsonwebtoken";
import { guardSignin, guardSignup } from "../lib/validator/guardvalidator";
export default router;
router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const check = guardSignup.safeParse(body);
  if (!check.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const guard = await prisma.guard.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
      },
    });
    const token = jwt.sign({ id: guard.id }, process.env.JWT_SECRET as string);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "guard already exists" });
  }
});

router.post("/signin", async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const check = guardSignin.safeParse(body);
  if (!check.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const guard = await prisma.guard.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
      select: {
        id: true,
        email: true,
      },
    });
    if (!guard) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: guard.id }, process.env.JWT_SECRET as string);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
});

router.put(
  "/done",
  gAuth,
  async (req: Request, res: Response): Promise<any> => {
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
  }
);
