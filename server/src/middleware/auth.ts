import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config.js";

export type Authed = Request & { user?: { id: string; role: string } };
export const asyncRoute = (fn: any) => (req: any, res: any, next: any) => Promise.resolve(fn(req, res, next)).catch(next);
export const auth = (req: Authed, res: Response, next: NextFunction) => {
  try { req.user = jwt.verify((req.headers.authorization || "").replace("Bearer ", ""), config.jwt) as any; next(); }
  catch { res.status(401).json({ success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } }); }
};
export const admin = (req: Authed, res: Response, next: NextFunction) => req.user?.role === "admin" ? next() : res.status(403).json({ success: false, error: { code: "FORBIDDEN", message: "Admin access required" } });
export const id = (req: Authed) => req.user!.id;
export const token = (user: any) => jwt.sign({ id: user._id, role: user.role }, config.jwt, { expiresIn: "7d" });
