import { Router } from "express";
import { Course } from "../models/index.js";
import { careerService } from "../services/index.js";
import { asyncRoute, auth, id, type Authed } from "../middleware/auth.js";

const router = Router();

router.get(
  '/api/courses',
  asyncRoute(async (_req, res) => {
    res.json({
      success: true,
      data:
        await Course.find().lean()
    });
  })
);

router.get(
  '/api/careers',
  auth,
  asyncRoute(async (req: Authed, res) => {
    res.json({
      success: true,
      data: await careerService.list(
        id(req)
      )
    });
  })
);
router.get(
  '/api/careers/:name',
  asyncRoute(async (req, res) => {
    const career =
      await careerService.detail(
        String(req.params.name)
      );

    if (!career) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Career not found'
        }
      });
    }

    res.json({
      success: true,
      data: career
    });
  })
);


export default router;
