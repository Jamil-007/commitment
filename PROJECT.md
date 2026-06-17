# Commitment

**Repository:** https://github.com/Jamil-007/commitment  
**Owner:** Jamil-007 (Boss Jamil, ETG Team Lead)  
**Managed by:** Proto (OpenClaw AI)  
**Live URL:** https://nigs-commitment.vercel.app

## Project Overview

**Purpose:** Shared goal tracker for Boss Jamil and Jerald (his friend) to hold each other accountable for personal growth and improvement.

**Concept:** Two friends commit to goals together, both must approve proposed goals, and both must complete them to mark as done.

## Features

✅ **Collaborative Goal Creation**
- Either person can propose a goal
- Proposer auto-approves their own proposal
- Other person must approve before it becomes active

✅ **Time Horizons**
- Short-term (days)
- Medium-term (weeks)
- Long-term (months)

✅ **Completion Tracking**
- Each person marks goals as done individually
- Goal shows completion status: ✅ Jamil, ✅ Jerald
- When both complete → goal marked as completed/crossed out

✅ **Deadline Management**
- Optional deadlines for goals
- Visual indicators: due today, X days left, overdue
- Edit/update deadlines anytime

✅ **Simple Authentication**
- "Who are you?" login (Jamil / Jerald)
- Password-based (stored in env vars)
- No database for auth

## Tech Stack

- **Frontend:** Next.js 15, React 19
- **Backend:** Next.js API Routes
- **Database:** Redis (standard redis://, not Upstash)
- **Deployment:** Vercel
- **Styling:** Inline styles, mobile-first responsive design

## Deployment

- **Platform:** Vercel
- **Production URL:** https://nigs-commitment.vercel.app
- **Alternate URLs:** 
  - https://commitment-indol.vercel.app
  - https://commitment-7quttrxxp-jamils-projects-55112463.vercel.app

**Deploy command:**
```bash
cd /home/node/.openclaw/workspace/commitment
npx vercel --prod --token $VERCEL_TOKEN --yes
npx vercel alias set https://commitment-indol.vercel.app nigs-commitment.vercel.app --token $VERCEL_TOKEN
```

**Environment Variables (Vercel):**
- `REDIS_URL` - Redis connection string
- `JAMIL_PASSWORD` - Login password for Jamil
- `JERALD_PASSWORD` - Login password for Jerald

## Current Status

✅ **Completed:**
- Full goal creation/approval workflow
- Individual completion tracking
- Deadline system with visual indicators
- Mobile-first responsive design
- Collapsible completed section
- Redis data persistence
- Deployed and live

🎯 **Ready for real use!**
- Testing complete, Redis cleared
- Shared URL with Jerald
- Ready to track real commitments

## Data Model

```javascript
{
  id: timestamp,
  title: string,
  type: "short-term" | "medium-term" | "long-term",
  status: "pending" | "active" | "completed",
  proposedBy: "Jamil" | "Jerald",
  approvedBy: ["Jamil", "Jerald"], // starts with proposer
  needsApprovalFrom: ["user"],
  deadline: "YYYY-MM-DD" | null,
  completedBy: ["Jamil", "Jerald"],
  createdAt: ISO date string
}
```

## API Endpoints

- `GET /api/goals` - Fetch all goals
- `POST /api/goals/create` - Create new goal
- `POST /api/goals/approve` - Approve pending goal
- `POST /api/goals/reject` - Reject pending goal
- `POST /api/goals/toggle-goal` - Mark goal done/undone
- `POST /api/goals/update-deadline` - Update goal deadline

## Development Log

### 2026-05-26 - Initial Build ✅
- Built complete goal-tracking app
- Implemented proposal/approval workflow
- Added deadline management
- Mobile-first responsive design
- Deployed to production

**Detailed build notes:** See `status/2026-05-26-initial-build.md`

---

## Documentation

- **PROJECT.md** (this file) - Quick reference, current status, how to use
- **status/** - Detailed development logs, decisions, challenges, lessons learned

**Notes:**
- This file is the source of truth for quick reference
- For detailed build history and technical decisions, see status/ directory
- Proto reads this on every repo switch for context
- Last updated: 2026-05-26
