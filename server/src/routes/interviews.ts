import { Router } from "express";
import { z } from "zod";
import { Interview, InterviewEvaluation, InterviewMessage } from "../models/index.js";
import { interviewService } from "../services/index.js";
import { asyncRoute, auth, id, type Authed } from "../middleware/auth.js";

const router = Router();

router.post(
  '/api/interviews',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const career =
      z.object({
        career: z.string()
      })
      .parse(req.body)
      .career;

    res.status(201).json({
      success: true,
      data: await interviewService.start(id(req), career)
    });
  })
);

router.get(
  '/api/interviews/:id',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const interview =
      await Interview.findOne({
        _id: req.params.id,
        user: id(req)
      });

    if (!interview) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message:
            'Interview not found'
        }
      });
    }

    res.json({
      success: true,
      data: {
        interview,

        messages:
          await InterviewMessage.find({
            interview: interview.id
          }),

        evaluation:
          await InterviewEvaluation.findOne({
            interview: interview.id
          })
      }
    });
  })
);

router.post(
  '/api/interviews/:id/respond',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const answer =
      z.object({
        answer:
          z.string().min(10)
      })
      .parse(req.body)
      .answer;

    res.json({
      success: true,
      data:
        await interviewService.reply(
          id(req),
          String(req.params.id),
          answer
        )
    });
  })
);


export default router;
