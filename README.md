# MyCoach - Performance Coaching Platform

A production-ready web application connecting performance coaches and athletes.

**Live Demo:** [https://my-rehab-seven.vercel.app](https://my-rehab-seven.vercel.app)

## Features
- **Coach Dashboard:** Invite athletes, assign training plans with YouTube videos and instructions, track performance.
- **Athlete Dashboard:** View assigned training plans, submit results (feedback + photo proof), track performance on a calendar.
- **Real-time Messaging:** Chat between coaches and athletes with image sharing.
- **AI Insights:** Automated performance analysis using NVIDIA NIM API to detect trends and provide tips.
- **PWA:** Installable on mobile devices with offline capabilities.
- **Training Timers:** Built-in stopwatch, countdown, and interval timers with audio cues.
- **Secure Auth:** Role-based access control with email/password authentication.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui.
- **Backend:** Next.js Server Actions, Prisma ORM.
- **Database:** PostgreSQL (Supabase).
- **Authentication:** NextAuth.js.
- **Email:** Resend.
- **AI:** NVIDIA NIM API (Llama 3.1).
- **Storage:** Supabase Storage (exercise-media, avatars).

## Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Installation
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables (.env):
   - `DATABASE_URL`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
   - `RESEND_API_KEY`
   - `NVIDIA_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`

4. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
## License
MIT
