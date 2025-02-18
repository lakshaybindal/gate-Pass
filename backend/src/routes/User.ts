import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import {
  userMail,
  userSignin,
  userSignup,
} from "../lib/validator/uservalidator";
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
  console.log(body);
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
router.get(
  "/me",
  userAuth,
  async (req: Request, res: Response): Promise<any> => {
    try {
      const user = await prisma.user.findFirst({
        where: {
          id: req.userId,
        },
        select: {
          id: true,
          email: true,
          rollno: true,
          name: true,
          parentEmail: true,
          hostelName: true,
          parentAuth: true,
          adminAuth: true,
          parentAuthToken: true,
        },
      });
      return res.json({ user });
    } catch (e) {
      return res.status(400).json({ error: "Invalid user" });
    }
  }
);
router.post(
  "/sendMail",
  userAuth,
  async (req: Request, res: Response): Promise<any> => {
    const body = req.body;
    console.log(body);
    const check = userMail.safeParse(body);
    console.log(check);
    if (!check.success) {
      return res.status(400).json({ error: "Invalid input" });
    }
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
    const link = `http://localhost:5173/auth?token=${parentEmail?.parentAuthToken}`;
    try {
      await transporter.sendMail({
        from: process.env.EMAIL,
        to: parentEmail?.parentEmail,
        subject: "Authentication Request",
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
        <h2 style="text-align: center; color: #333;">Leave Authentication Request</h2>
        <p style="font-size: 16px; color: #555;">Your ward has requested leave authentication. Here are the details:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>From Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.from}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>To Date:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.to}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Place to Go:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.place}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #ddd;"><strong>Reason:</strong></td>
            <td style="padding: 10px; border: 1px solid #ddd;">${body.reason}</td>
          </tr>
        </table>
        <div style="text-align: center; margin-top: 20px;">
          <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
            Authenticate Now
          </a>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
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
