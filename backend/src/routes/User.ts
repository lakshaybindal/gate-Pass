import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userSignin, userSignup } from "../lib/validator/uservalidator";
import jwt from "jsonwebtoken";
import userAuth from "../middleware/usermiddleware";
const prisma = new PrismaClient();
const router = express.Router();
const app = express();
import nodemailer from "nodemailer";
import crypto from "crypto";
import { addHours } from "date-fns";
router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const check = userSignup.safeParse(body);
  if (!check.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const user = await prisma.user.create({
      data: {
        email: body.email,
        password: body.password,
        rollno: body.rollno,
        name: body.name,
        parentEmail: body.parentEmail,
        hostelName: body.hostelName,
      },
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "user already exists" });
  }
});

router.post("/signin", async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const check = userSignin.safeParse(body);
  if (!check.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: body.email,
        password: body.password,
      },
      select: {
        id: true,
        email: true,
      },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET as string);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASSWORD,
  },
});

router.post(
  "/sendMail",
  userAuth,
  async (req: Request, res: Response): Promise<any> => {
    const parentEmail = await prisma.user.update({
      where: {
        id: req.userId,
      },
      data: {
        parentAuthToken: crypto.randomBytes(3).toString("hex"),
        parentAuthExpiresAt: addHours(new Date(), 3),
      },
      select: {
        parentAuthToken: true,
        parentEmail: true,
      },
    });
    const link = `http://localhost:3000/api/user/authenticate?token=${parentEmail?.parentAuthToken}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: parentEmail?.parentEmail,
        subject: "Authentication Request",
        html: `<p>Your ward has requested for authentication</p><p>Click <button><a href=${link}>here</a></button> to authenticate</p>`,
      });
      return res.json({ message: "Mail sent" });
    } catch (e) {
      return res.status(400).json({ error: e, message: "Mail not sent" });
    }
  }
);

router.put("/auth", async (req: Request, res: Response): Promise<any> => {
  const { token } = req.query as { token: string };

  if (!token) {
    return res.status(400).json({ error: "Invalid token" });
  }
  try {
    const user = await prisma.user.findFirst({
      where: {
        parentAuthToken: token,
      },
    });
    if (!user) {
      return res.status(400).json({ error: "Invalid token" });
    }
    if (user.parentAuthExpiresAt && user.parentAuthExpiresAt < new Date()) {
      return res.status(400).json({
        error: "Token expired. Please request a new verification email.",
      });
    }
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        parentAuthToken: null,
        parentAuthExpiresAt: null,
        parentAuth: true,
      },
    });
    return res.json({ message: "Authenticated" });
  } catch (e) {
    return res.status(400).json({ error: "Invalid token" });
  }
});
export default router;
