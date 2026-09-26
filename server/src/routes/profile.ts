import { Router } from "express";
import { z } from "zod";
import { StudentProfile } from "../models/index.js";
import { astrologyService } from "../services/index.js";
import { asyncRoute, auth, id, type Authed } from "../middleware/auth.js";

const router = Router();

router.get(
  '/api/profile',
  auth,
  asyncRoute(async (req: Authed, res) => {
    res.json({
      success: true,
      data:
        await StudentProfile.findOne({
          user: id(req)
        })
    });
  })
);

router.put(
  '/api/profile',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const data = z
      .object({
        dateOfBirth:
          z.string().optional(),

        birthTime:
          z.string().optional(),

        birthPlace:
          z.string().optional(),

        college:
          z.string().optional(),

        course:
          z.string().optional(),

        specialization:
          z.string().optional(),

        semester:
          z.string().optional(),

        interests:
          z.array(z.string())
            .default([]),

        skills:
          z.array(z.string())
            .default([]),

        languages:
          z.array(z.string())
            .default([]),

        projects:
          z.number()
            .min(0)
            .default(0),

        experience:
          z.number()
            .min(0)
            .default(0),

        preferredCareers:
          z.array(z.string())
            .default([])
      })
      .parse(req.body);

    const profile =
      await StudentProfile.findOneAndUpdate(
        {
          user: id(req)
        },
        {
          ...data,
          user: id(req)
        },
        {
          upsert: true,
          new: true
        }
      );

    res.json({
      success: true,
      data: profile
    });
  })
);

router.get(
  '/api/astrology',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const profile =
      await StudentProfile.findOne({
        user: id(req)
      });

    res.json({
      success: true,
      data: astrologyService.get(
        profile?.dateOfBirth?.toISOString()
      )
    });
  })
);


export default router;
