import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userSignup } from "../lib/validator/uservalidator";
const prisma = new PrismaClient();
const router = express.Router();
const app = express();

router.post("/signup", async (req: Request, res: Response): Promise<any> => {
  const body = req.body;
  const check = userSignup.safeParse(body);
  if (!check.success) {
    return res.status(400).json({ error: "Invalid input" });
  }
  try {
    const user = await prisma.user.create({
      data: {
        email: body.username,
        password: body.password,
        rollno: body.rollno,
        name: body.name,
        parentEmail: body.parentEmail,
        hostelName: body.hostelName,
      },
    });
  } catch (e) {}
});

export default router;
