import express, { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { userSignin, userSignup } from "../lib/validator/uservalidator";
import jwt from "jsonwebtoken";
import { jwtsecret } from "../config";

const prisma = new PrismaClient();
const router = express.Router();
const app = express();
const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../env") });

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
    const token = jwt.sign({ id: user.id }, jwtsecret);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: e });
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
    const token = jwt.sign({ id: user.id }, jwtsecret);
    return res.json({ token });
  } catch (e) {
    return res.status(400).json({ error: "Invalid credentials" });
  }
});
export default router;
