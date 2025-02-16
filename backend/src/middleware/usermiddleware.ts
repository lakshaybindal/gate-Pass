import { NextFunction, Request, Response } from "express";

const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../env") });

import jwt from "jsonwebtoken";
declare module "express-serve-static-core" {
  interface Request {
    userId?: number;
  }
}
interface payload {
  id: number;
}

export default function userAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("authorization");
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as payload;
    req.userId = decoded.id;
    next();
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
  }
}
