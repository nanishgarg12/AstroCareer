import { Router } from "express";
import bcrypt from "bcrypt";
import { z } from "zod";
import { User } from "../models/index.js";
import { asyncRoute, auth, id, token, type Authed } from "../middleware/auth.js";

const router = Router();

router.post(
  '/api/auth/register',
  asyncRoute(async (req: any, res: any) => {
    const data = z
      .object({
        name: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(8)
      })
      .parse(req.body);

    if (
      await User.exists({
        email: data.email.toLowerCase()
      })
    ) {
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: 'Email already registered'
        }
      });
    }

    const user = await User.create({
      name: data.name,
      email: data.email.toLowerCase(),
      passwordHash: await bcrypt.hash(
        data.password,
        12
      )
    });

    res.status(201).json({
      success: true,
      data: {
        token: token(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  })
);

router.post(
  '/api/auth/login',
  asyncRoute(async (req, res) => {
    const data = z
      .object({
        email: z.string().email(),
        password: z.string()
      })
      .parse(req.body);

    const user = await User.findOne({
      email: data.email.toLowerCase()
    });

    if (
      !user ||
      !(await bcrypt.compare(
        data.password,
        user.passwordHash
      ))
    ) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        }
      });
    }

    res.json({
      success: true,
      data: {
        token: token(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        }
      }
    });
  })
);

router.post(
  '/api/auth/logout',
  auth,
  (_req, res) =>
    res.json({
      success: true,
      data: {
        message:
          'Logged out; discard your token on the client.'
      }
    })
);

router.get(
  '/api/auth/me',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const user = await User
      .findById(id(req))
      .select('-passwordHash');

    res.json({
      success: true,
      data: user
    });
  })
);


export default router;
