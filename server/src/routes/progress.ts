import { Router } from "express";
import { z } from "zod";
import { AssessmentAttempt, InterviewEvaluation, StudentProfile } from "../models/index.js";
import { recommendationService, scoringService } from "../services/index.js";
import { asyncRoute, auth, id, type Authed } from "../middleware/auth.js";

const router = Router();

router.get(
  '/api/recommendations',
  auth,
  asyncRoute(async (req: Authed, res) => {
    res.json({
      success: true,
      data:
        await recommendationService.match(
          id(req)
        )
    });
  })
);

router.get(
  '/api/readiness',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const profile =
      await StudentProfile.findOne({
        user: id(req)
      });

    const assessment = await AssessmentAttempt
      .findOne({ user: id(req) })
      .sort({ createdAt: -1 });

    const evaluation =
      await InterviewEvaluation
        .findOne()
        .sort({
          createdAt: -1
        });

    const skill =
      Math.min(
        100,
        (profile?.skills.length || 0) *
          12.5
      );

    const projectExperience =
      Math.min(
        100,
        (profile?.projects || 0) *
          20 +
        (profile?.experience || 0) *
          10
      );

    res.json({
      success: true,
      data:
        scoringService.readiness(
          assessment?.score || 0,
          evaluation?.overallScore || 0,
          skill,
          projectExperience
        )
    });
  })
);

router.post(
  '/api/simulator',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const data =
      z.object({
        career:
          z.string(),

        current:
          z.record(
            z.number()
              .min(0)
              .max(100)
          ),

        projected:
          z.record(
            z.number()
              .min(0)
              .max(100)
          )
      })
      .parse(req.body);

    const avg =
      (
        values:
          Record<string, number>
      ) =>
        Object.values(values)
          .reduce(
            (a, b) => a + b,
            0
          ) /
        Math.max(
          1,
          Object.keys(values).length
        );

    res.json({
      success: true,
      data: {
        currentScore:
          Math.round(
            avg(data.current)
          ),

        projectedScore:
          Math.round(
            avg(data.projected)
          ),

        disclaimer:
          'Projected readiness based on the application’s transparent scoring model. It is not a guaranteed future prediction.'
      }
    });
  })
);


export default router;
