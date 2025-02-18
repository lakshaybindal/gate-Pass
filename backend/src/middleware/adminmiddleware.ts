import express, { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
interface PayLoad {
  id: number;
}
declare module "express-serve-static-core" {
  interface Request {
    adminId?: number;
  }
}

function aAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization || "";
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as PayLoad;
    if (!decoded) {
      res.status(403).json({ e: "error" });
      return;
    }
    req.adminId = decoded.id;

    next();
  } catch (e) {
    res.status(403).json({ e: e });
    return;
  }
}
export default aAuth;
