import type { NextFunction, Request, Response } from "express";
import { z } from "zod";

export function errorHandler(error: any, _req: Request, res: Response, _next: NextFunction) {
  if (error instanceof z.ZodError) return res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: error.issues.map((issue) => issue.message).join(", ") } });
  console.error(error);
  return res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: error.message || "An unexpected error occurred" } });
}
