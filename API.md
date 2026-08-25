# API

All responses use `{ success, data }`; errors use `{ success:false, error:{ code, message } }`. Send `Authorization: Bearer <token>` for protected endpoints.

| Area | Endpoints |
|---|---|
| Authentication | `POST /api/auth/register`, `/login`, `/logout`; `GET /me` |
| Profile | `GET`, `PUT /api/profile` |
| Exploration | `GET /api/courses`, `/careers`, `/careers/:name`, `/astrology`, `/recommendations`, `/readiness` |
| Assessment | `GET /api/assessment/:career/questions`, `POST /api/assessment/:career/submit` |
| Interview | `POST /api/interviews`, `GET /api/interviews/:id`, `POST /api/interviews/:id/respond` |
| Planning | `POST /api/simulator`, `POST /api/roadmap/:career`, `PATCH /api/roadmap/tasks/:taskId` |
| Admin | `GET /api/admin/stats`, `/users`; `POST /api/admin/careers` |

Assessment submissions accept `{ "answers": [0, 2, 1] }`. The simulator accepts `{ career, current: { DSA:60 }, projected: { DSA:80 } }`.
