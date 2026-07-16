# EduPilot AI 🚀
### AI Powered Learning Companion

EduPilot AI is a production-grade, highly responsive EdTech SaaS platform designed for student learning optimization and back-office curriculum management. Built with Next.js 15 (App Router), Prisma ORM, PostgreSQL, and next-auth role-based credentials. It integrates Google Gemini 1.5 Flash to power study helpers, quizzes, roadmaps, and doubt solvers.

---

## 🛠️ Technology Stack
* **Framework**: Next.js 15 (App Router, Serverless Route Handlers)
* **Language**: TypeScript (Strict typing check)
* **Styling**: Tailwind CSS (With curated HSL color themes & Glassmorphic panels)
* **Database**: PostgreSQL
* **ORM**: Prisma Client
* **Auth**: NextAuth/Auth.js v4 (Secure JWT session, Role-based route protection via Middleware)
* **AI Engine**: Google Gemini API (`gemini-1.5-flash` with direct REST compilation & robust fallbacks)
* **Validation**: Zod + React Hook Form
* **Charts**: Recharts (Dynamic student activity area charts & bar charts)
* **File Uploads**: Cloudinary API Integration (With fallback image generators)
* **Animation**: Framer Motion

---

## 📂 Enterprise Architecture

```
edupilot-ai/
├── prisma/
│   ├── schema.prisma   # PostgreSQL db entities
│   └── seed.ts         # Seeding code for 10 Students, 8 Courses, 40 Lessons
├── public/             # Static file assets
├── app/
│   ├── layout.tsx      # SEO metadata & Provider wrappers
│   ├── page.tsx        # Public animated landing page
│   ├── providers.tsx   # unified Theme/Auth/Toast Providers
│   ├── middleware.ts   # Role-based route guardian middleware
│   ├── (auth)/         # login, signup, forgot password
│   ├── (dashboard)/
│   │   ├── student/    # Student dashboard, course player, profile, and AI tools
│   │   └── admin/      # Admin dashboard, students, courses, categories, resources grids
│   └── api/            # API endpoints (Route handlers only, NO Express/custom server)
│       ├── auth/
│       ├── ai/         # 9 AI tool controllers calling Gemini API
│       ├── student/    # LMS progress, bookmarks, profile updates
│       └── admin/      # Back-office CRUD endpoints
├── components/
│   ├── ui/             # Core UI components (button, input, select, progress, tabs, toast, dialog)
│   └── shared/         # Navbar, ThemeProvider, Footer, ThemeToggle
├── lib/
│   ├── auth.ts         # NextAuth configuration
│   ├── db.ts           # Prisma client initializer
│   ├── gemini.ts       # Gemini API client & prompt wrappers
│   ├── cloudinary.ts   # Cloudinary image uploader
│   └── utils.ts        # Cn classname joiners & formatters
├── hooks/
│   ├── use-toast.ts    # Success/Error notification trigger
│   └── use-theme.ts    # Dark/Light theme toggles
├── types/
│   └── index.ts        # Shared TypeScript interfaces
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🤖 9 Integrated AI Companion Features

EduPilot AI integrates Google Gemini API to serve the following study systems:

1. **AI Chat Assistant**: Ask conceptual questions, returning formatted code and markdown answers.
2. **AI Quiz Generator**: Generate multiple choice quiz worksheets. Renders an interactive game quiz and logs scores.
3. **AI Roadmap Generator**: Generates step-by-step career path roadmaps with estimated timelines.
4. **AI Notes Summarizer**: Pastes long notes to generate bulleted core takeaways and action lists.
5. **AI Flashcards**: Formulate study card decks. Supports 3D click flipping and deck navigation.
6. **Career Recommendation**: Enter skills and career goals to get outlook analyses, compatibility percentages, and missing gaps.
7. **Doubt Solver**: Detail academic queries with optional course contexts to receive clear solution steps.
8. **AI Code Explainer**: Paste programming scripts to view line-by-line deconstruction and complexity analysis.
9. **Interview Prep**: Generate high-yield technical review lists for specific job roles and experience levels.

---

## 🔒 Security & Route Protection (Middleware)

Dashboard paths are protected in `middleware.ts`:
* `/student/:path*` is restricted to authenticated students and admins.
* `/admin/:path*` is restricted to users holding the `ADMIN` role. Students attempting to access it are redirected back to `/student`.
* Internal APIs (`/api/student` and `/api/ai`) inspect JWT sessions.
* Auth pages redirect already logged-in users back to their respective dashboards.

---

## ⚡ Database Seeding

The seed script (`prisma/seed.ts`) populates the database with:
* **1 Administrator**: Professor Charles (`admin@edupilot.ai` / `admin123`)
* **10 Students**: `student1@edupilot.ai` through `student10@edupilot.ai` (Passwords are hashed as `student123` through `student1023` using bcryptjs)
* **2 Categories**: Web Development, Artificial Intelligence
* **8 Courses** (4 per category)
* **40 Lessons** (5 per course, detailed content and YouTube video links)
* **Supplemental Resources**: 1 downloadable guide per course
* **History Records**: Prefilled bookmarks, completed progress records, quiz score history, chat logs, and career roadmaps for the first student user (`student1@edupilot.ai`).

---

## 🚀 Local Installation & Setup

Follow these steps to run the application locally:

### 1. Clone the project files
Ensure you have Node.js (v18+) and PostgreSQL installed.

### 2. Install dependencies
```bash
npm install
```

### 3. Setup environment variables
Create a `.env` file in the root directory (or use the created `.env.local` file):
```env
DATABASE_URL="postgresql://username:password@localhost:5432/edupilot_db?schema=public"
NEXTAUTH_SECRET="your-super-secret-key"
NEXTAUTH_URL="http://localhost:3000"
GEMINI_API_KEY="your-google-gemini-key"
CLOUDINARY_NAME="your-cloudinary-name"
CLOUDINARY_KEY="your-cloudinary-key"
CLOUDINARY_SECRET="your-cloudinary-secret"
```
> *Note: If `GEMINI_API_KEY` is not set, the app triggers a fallback engine returning high-quality mock data, ensuring 100% features functionality out-of-the-box. Similarly, Cloudinary falls back to Unsplash images.*

### 4. Push Database Schema & Seed Data
Generate Prisma Client, push model structures, and seed PostgreSQL:
```bash
npx prisma generate
npx prisma db push
npm run prisma:seed
```

### 5. Run Development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Production Vercel Deployment

EduPilot AI is configured to deploy directly on Vercel:
1. Push files to a GitHub repository.
2. Link your repository in Vercel.
3. Configure the Environment Variables under Project Settings.
4. Deploy. Vercel automatically runs `npm run build` which invokes `prisma generate` followed by the Next.js bundle compiler. No custom servers or Express modifications are required.
