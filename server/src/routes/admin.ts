import { Router } from "express";
import { z } from "zod";
import { Career, Course, Question, User } from "../models/index.js";
import { admin, asyncRoute, auth } from "../middleware/auth.js";

const router = Router();

router.get(
  '/api/admin/stats',
  auth,
  admin,
  asyncRoute(async (_req, res) => {
    res.json({
      success: true,
      data: {
        users:
          await User.countDocuments(),

        courses:
          await Course.countDocuments(),

        careers:
          await Career.countDocuments(),

        questions:
          await Question.countDocuments()
      }
    });
  })
);

router.get(
  '/api/admin/users',
  auth,
  admin,
  asyncRoute(async (_req, res) => {
    res.json({
      success: true,
      data:
        await User
          .find()
          .select('-passwordHash')
    });
  })
);

router.post(
  '/api/admin/careers',
  auth,
  admin,
  asyncRoute(async (req, res) => {
    const data =
      z.object({
        name:
          z.string(),

        description:
          z.string(),

        requiredSkills:
          z.array(z.string())
            .default([])
      })
      .parse(req.body);

    res.status(201).json({
      success: true,
      data:
        await Career.create(data)
    });
  })
);


export default router;
