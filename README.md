# Resumiq — AI-Powered Resume Builder

A full-stack SaaS application that helps job seekers build ATS-optimized resumes, get GPT-4 powered rewrites, and land more interviews.

> **Personal project — payment and OpenAI keys not configured for public use.**

---

## Screenshots

> Add screenshots here once you deploy or run locally.

---

## Features

- **Resume Builder** — Guided 6-step builder with live preview and 4 professional templates
- **ATS Score Checker** — Instant keyword match analysis against any job description (no AI cost — pure algorithm)
- **AI Bullet Rewrites** — GPT-4o-mini rewrites weak bullet points into quantified achievements
- **AI Summary Generator** — Tailored professional summary based on your resume and target role
- **AI Skills Advisor** — Identifies skills missing from your resume for a given role
- **PDF Export** — One-click pixel-perfect PDF download
- **Authentication** — JWT access + refresh token flow with auto-refresh
- **Payments** — Razorpay integration for Pro Monthly (₹499) and Pro Annual (₹3,999) plans
- **Profile Settings** — Avatar color picker, password change, notification preferences, account deletion
- **Dark landing page** — 3D animated hero card, mouse-tracked tilt, animated counters, bento feature grid

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS |
| State | Zustand with localStorage persistence |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose |
| Auth | JWT (access 15min + refresh 7d), httpOnly cookies |
| AI | OpenAI GPT-4o-mini |
| Payments | Razorpay |
| PDF Export | html2canvas + jsPDF |
| UI | Lucide React, React Hot Toast, React Hook Form |

---

## Project Structure

```
ai-resume-platform/
├── frontend/                  # Next.js 14 app
│   ├── src/
│   │   ├── app/               # App Router pages
│   │   │   ├── page.tsx       # Landing page
│   │   │   ├── pricing/       # Pricing page
│   │   │   ├── auth/          # Login & Signup
│   │   │   └── dashboard/     # All dashboard pages
│   │   ├── components/        # Reusable components
│   │   │   ├── layout/        # Sidebar, Topbar
│   │   │   ├── resume/        # Builder, Preview, Steps
│   │   │   └── Logo.tsx       # SVG logo component
│   │   ├── hooks/             # useAuth, useResume, useAI, usePayment
│   │   ├── store/             # Zustand stores
│   │   ├── lib/               # apiClient (Axios), utils
│   │   └── types/             # TypeScript interfaces
│   └── .env.local             # Frontend env vars (not committed)
│
└── backend/                   # Express.js API
    ├── src/
    │   ├── controllers/       # Route handlers
    │   ├── models/            # Mongoose schemas
    │   ├── routes/            # Express routers
    │   ├── middleware/        # Auth, error handler, rate limiter
    │   ├── services/          # atsService, aiService
    │   ├── utils/             # JWT helpers, API response
    │   └── config/            # Razorpay config
    └── .env                   # Backend env vars (not committed)
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [MongoDB Atlas](https://cloud.mongodb.com) cluster (free tier works)
- An [OpenAI API key](https://platform.openai.com) (for AI features)
- A [Razorpay account](https://razorpay.com) (for payments — test keys work)

### 1. Clone the repo

```bash
git clone https://github.com/YOUR_USERNAME/ai-resume-platform.git
cd ai-resume-platform
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
NODE_ENV=development

MONGODB_URI=your_mongodb_atlas_uri

JWT_ACCESS_SECRET=generate_a_long_random_string
JWT_REFRESH_SECRET=generate_another_long_random_string
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

OPENAI_API_KEY=sk-...

RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

FRONTEND_URL=http://localhost:3000

PRO_MONTHLY_PRICE=49900
PRO_ANNUAL_PRICE=399900
```

```bash
npm run dev
# API running at http://localhost:5000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

Create `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_...
```

```bash
npm run dev
# App running at http://localhost:3000
```

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens (min 32 chars) |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens (min 32 chars) |
| `OPENAI_API_KEY` | OpenAI API key — required for AI features |
| `RAZORPAY_KEY_ID` | Razorpay Key ID (test or live) |
| `RAZORPAY_KEY_SECRET` | Razorpay Key Secret |
| `FRONTEND_URL` | Allowed CORS origin |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key (same as backend Key ID) |

---

## API Routes

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/signup` | Register new user |
| POST | `/login` | Login |
| POST | `/logout` | Logout |
| POST | `/refresh` | Refresh access token |
| GET | `/me` | Get current user |
| PATCH | `/update-profile` | Update name / avatar |
| PATCH | `/change-password` | Change password |
| DELETE | `/delete-account` | Delete account + all resumes |

### Resumes — `/api/resumes`
| Method | Route | Description |
|--------|-------|-------------|
| GET | `/` | List all resumes |
| POST | `/` | Create resume |
| GET | `/:id` | Get single resume |
| PUT | `/:id` | Update resume |
| DELETE | `/:id` | Delete resume |
| POST | `/:id/duplicate` | Duplicate resume |

### ATS — `/api/ats`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/analyze` | Score resume against job description |
| GET | `/history/:resumeId` | Get analysis history |
| GET | `/result/:id` | Get single result |

### AI — `/api/ai` *(Pro plan required)*
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/improve-bullets` | Rewrite a single experience's bullets |
| POST | `/improve-all-bullets` | Rewrite all experience bullets |
| POST | `/generate-summary` | Generate professional summary |
| POST | `/suggest-skills` | Suggest missing skills |
| POST | `/apply-bullets` | Save improved bullets to resume |
| POST | `/apply-summary` | Save generated summary to resume |

### Payments — `/api/payment`
| Method | Route | Description |
|--------|-------|-------------|
| POST | `/create-order` | Create Razorpay order |
| POST | `/verify` | Verify payment signature |
| GET | `/history` | Payment history |

---

## Plans

| Feature | Free | Pro |
|---------|------|-----|
| Resumes | 1 | Unlimited |
| ATS Checker | Basic | Advanced |
| AI Rewrites | — | ✓ |
| AI Summary | — | ✓ |
| Skills Advisor | — | ✓ |
| PDF Export | ✓ | ✓ |
| Price | ₹0 | ₹499/mo or ₹3,999/yr |

---

## Notes

- AI features require a valid OpenAI API key. Without it, the `/api/ai/*` endpoints will fail.
- Payments use Razorpay test mode by default. Use test card `4111 1111 1111 1111` or UPI ID `success@razorpay` to simulate successful payments.
- The ATS checker is purely algorithmic (no AI cost) — it works without an OpenAI key.
- Free plan users are limited to 1 resume enforced on both frontend and backend.

---

## License

MIT — feel free to fork and build on this.
