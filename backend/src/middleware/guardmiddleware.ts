import express, { Response, Request, NextFunction } from "express";
import jwt from "jsonwebtoken";
interface PayLoad {
  id: number;
}
declare module "express-serve-static-core" {
  interface Request {
    guardId?: number;
  }
}

function gAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization || "";
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as PayLoad;
    if (!decoded) {
      res.status(403).json({ e: "eror" });
      return;
    }
    req.guardId = decoded.id;

    next();
  } catch (e) {
    res.status(403).json({ e: e });
    return;
  }
}
export default gAuth;
