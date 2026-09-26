import { Router } from "express";
import { z } from "zod";
import { assessmentService } from "../services/index.js";
import { asyncRoute, auth, id, type Authed } from "../middleware/auth.js";

const router = Router();

router.get(
  '/api/assessment/:career/questions',
  auth,
  asyncRoute(async (req, res) => {
    res.json({
      success: true,
      data:
        await assessmentService.questions(
          String(req.params.career)
        )
    });
  })
);

router.post(
  '/api/assessment/:career/submit',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const answers = z
      .object({
        answers:
          z.array(z.number())
      })
      .parse(req.body)
      .answers;

    res.json({
      success: true,
      data:
        await assessmentService.submit(
          id(req),
          String(req.params.career),
          answers
        )
    });
  })
);


export default router;
