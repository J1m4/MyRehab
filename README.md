# MyRehab - Physical Therapy Platform

A production-ready web application connecting physical therapists and clients.

## Features
- **Therapist Dashboard:** Invite clients, assign workouts with YouTube videos and instructions, track progress.
- **Client Dashboard:** View assigned workouts, submit results (feedback + media), track completion.
- **Real-time Messaging:** Chat between therapists and clients.
- **AI Insights:** Automated analysis of client feedback using NVIDIA NIM API to detect pain points and trends.
- **PWA:** Installable on mobile devices with offline capabilities.
- **Timers:** Built-in stopwatch, countdown, and interval timers for exercises.
- **Secure Auth:** Role-based access control with email/password authentication.

## Tech Stack
- **Frontend:** Next.js 15 (App Router), Tailwind CSS, shadcn/ui.
- **Backend:** Next.js Server Actions, Prisma ORM.
- **Database:** PostgreSQL.
- **Authentication:** NextAuth.js.
- **Email:** Resend.
- **AI:** NVIDIA NIM API (`meta/llama3-8b-instruct`).
- **Storage:** Cloudinary.

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
3. Set up environment variables:
   Copy `.env.example` to `.env` and fill in the values.
4. Initialize the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```
5. Run the development server:
   ```bash
   npm run dev
   ```

## Project Structure
- `src/app/dashboard`: Role-specific dashboards.
- `src/app/workout`: Workout details and exercise tracking.
- `src/app/messages`: Messaging interface.
- `src/app/timers`: Timer utilities.
- `src/app/actions`: Server actions for database and API operations.
- `src/lib`: Shared utilities (Prisma, Auth).
- `src/components`: Reusable UI components.

## License
MIT
