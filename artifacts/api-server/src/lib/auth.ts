import type { NextFunction, Request, Response } from "express";
import { supabase } from "./supabase";

export interface AuthedUser {
  id: string;
  email?: string;
}

export interface AuthedRequest extends Request {
  user?: AuthedUser;
}

/**
 * Requires a valid Supabase session: reads the `Authorization: Bearer <jwt>`
 * header, verifies it with Supabase Auth, and attaches the user to the request.
 */
export async function requireAuth(
  req: AuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  const token = header?.startsWith("Bearer ") ? header.slice("Bearer ".length) : null;
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const { data, error } = await supabase().auth.getUser(token);
  if (error || !data.user) {
    res.status(401).json({ error: "Invalid or expired session" });
    return;
  }

  req.user = { id: data.user.id, email: data.user.email ?? undefined };
  next();
}
