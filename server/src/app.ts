import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import resumeRouter from './resume.js';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import {
  User,
  StudentProfile,
  Career,
  Interview,
  InterviewMessage,
  InterviewEvaluation,
  Course,
  Question,
  RoadmapTask
} from './models/index.js';

import { config } from './config.js';

import {
  astrologyService,
  assessmentService,
  careerService,
  interviewService,
  recommendationService,
  roadmapService,
  scoringService
} from './services/core.js';

export const app = express();

app.use(helmet());

app.use(
  cors({
    origin: config.client,
    credentials: true
  })
);

app.use(express.json());

app.use('/api/resume', resumeRouter);

app.use(
  '/api',
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
  })
);

type Authed = express.Request & {
  user?: {
    id: string;
    role: string;
  };
};

const auth = (
  req: Authed,
  res: express.Response,
  next: express.NextFunction
) => {
  try {
    const authorization =
      req.headers.authorization || '';

    const tokenValue =
      authorization.replace('Bearer ', '');

    req.user = jwt.verify(
      tokenValue,
      config.jwt
    ) as any;

    next();
  } catch {
    res.status(401).json({
      success: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      }
    });
  }
};

const admin = (
  req: Authed,
  res: express.Response,
  next: express.NextFunction
) =>
  req.user?.role === 'admin'
    ? next()
    : res.status(403).json({
        success: false,
        error: {
          code: 'FORBIDDEN',
          message: 'Admin access required'
        }
      });

const asyncRoute =
  (fn: any) =>
  (req: any, res: any, next: any) =>
    Promise.resolve(
      fn(req, res, next)
    ).catch(next);

const token = (u: any) =>
  jwt.sign(
    {
      id: u._id,
      role: u.role
    },
    config.jwt,
    {
      expiresIn: '7d'
    }
  );

const id = (req: Authed) =>
  req.user!.id;

app.get(
  '/api/health',
  (_req, res) =>
    res.json({
      success: true,
      data: {
        status: 'ok'
      }
    })
);

app.post(
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

app.post(
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

app.post(
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

app.get(
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

app.get(
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

app.put(
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

app.get(
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

app.get(
  '/api/courses',
  asyncRoute(async (_req, res) => {
    res.json({
      success: true,
      data:
        await Course.find().lean()
    });
  })
);

app.get(
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
app.get(
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

app.get(
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

app.post(
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

app.post(
  '/api/interviews',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const career =
      z.object({
        career: z.string()
      })
      .parse(req.body)
      .career;

    const interview =
      await Interview.create({
        user: id(req),
        career
      });

    const question =
      'Explain one foundational skill you need for this career.';

    await InterviewMessage.create({
      interview: interview.id,
      role: 'assistant',
      content: question
    });

    res.status(201).json({
      success: true,
      data: {
        interview,
        question
      }
    });
  })
);

app.get(
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

app.post(
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
          String(req.params.id),
          answer
        )
    });
  })
);

app.get(
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

app.get(
  '/api/readiness',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const profile =
      await StudentProfile.findOne({
        user: id(req)
      });

    const assessment =
      await (
        await import(
          './models/index.js'
        )
      )
        .AssessmentAttempt
        .findOne({
          user: id(req)
        })
        .sort({
          createdAt: -1
        });

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

app.post(
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

app.post(
  '/api/roadmap/:career',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const career =
      await Career.findOne({
        name: req.params.career
      });

    if (!career) {
      return res.status(404).end();
    }

    res.json({
      success: true,
      data:
        await roadmapService.create(
          id(req),
          career
        )
    });
  })
);

app.patch(
  '/api/roadmap/tasks/:taskId',
  auth,
  asyncRoute(async (req: Authed, res) => {
    const completed =
      z.object({
        completed:
          z.boolean()
      })
      .parse(req.body)
      .completed;

    const task =
      await RoadmapTask.findOneAndUpdate(
        {
          _id: req.params.taskId,
          user: id(req)
        },
        {
          completed
        },
        {
          new: true
        }
      );

    res.json({
      success: true,
      data: task
    });
  })
);

app.get(
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

app.get(
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

app.post(
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

app.use(
  (
    error: any,
    _req: any,
    res: any,
    _next: any
  ) => {
    if (
      error instanceof z.ZodError
    ) {
      return res.status(400).json({
        success: false,
        error: {
          code:
            'VALIDATION_ERROR',

          message:
            error.issues
              .map(
                x => x.message
              )
              .join(', ')
        }
      });
    }

    console.error(error);

    res.status(500).json({
      success: false,
      error: {
        code:
          'INTERNAL_ERROR',

        message:
          error.message ||
          'An unexpected error occurred'
      }
    });
  }
);

// Serve React frontend in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const clientDist = join(__dirname, '../../client/dist');

app.use(express.static(clientDist));

// Catch-all: send index.html for any non-API route (React Router)
app.get('*', (_req, res) => {
  res.sendFile(join(clientDist, 'index.html'));
});