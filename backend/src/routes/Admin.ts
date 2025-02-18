import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
const router = express.Router();
const app = express();
import aAuth from "../middleware/adminmiddleware";
import jwt from "jsonwebtoken";
import { adminSignin, adminSignup } from "../lib/validator/adminvalidator";
export default router;
router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const check = adminSignup.safeParse(body);
  if (!check.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const admin = await prisma.admin.create({
      data: {
        email: body.email,
        password: body.password,
        name: body.name,
        hostelName: body.hostelName,
      },
    });
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET as string);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "Admin already exists" });
  }
});

router.post("/signin", async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const check = adminSignin.safeParse(body);
  if (!check.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const admin = await prisma.admin.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
      select: {
        id: true,
        email: true,
      },
    });
    if (!admin) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: admin.id }, process.env.JWT_SECRET as string);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
});

router.get(
  "/getAll",
  aAuth,
  async (req: Request, res: Response): Promise<any> => {
    const users = await prisma.user.findMany({
      where: {
        parentAuth: true,
        adminAuth: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
    });
    return res.json({ users });
  }
);
router.put(
  "/allow",
  aAuth,
  async (req: Request, res: Response): Promise<any> => {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ error: "Invalid input" });
    }
    try {
      const user = await prisma.user.update({
        where: {
          id: Number(id),
        },
        data: {
          adminAuth: true,
        },
      });
    } catch (e) {
      return res.status(400).json({ error: "Invalid input" });
    }
    return res.json({ msg: "User allowed" });
  }
);
