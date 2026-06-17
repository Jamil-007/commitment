# Initial Build - 2026-05-26

## Overview
Built complete goal-tracking web app for Boss Jamil + Jerald to hold each other accountable for personal growth.

## Requirements Gathered
- Two-person collaborative goal tracker
- Proposal/approval workflow
- Time horizons: short/medium/long term
- Individual completion tracking (both must complete)
- Deadline support
- Mobile-first design
- Simple password auth

## Build Process

### 1. Initial Setup
- Created Next.js 15 app with React 19
- Set up basic authentication (Jamil/Jerald selection + passwords)
- Created dashboard structure

### 2. Core Features Implementation
- Goal creation with proposal workflow
- Auto-approval for proposer
- Approval/reject system for pending goals
- Individual completion tracking
- Status indicators: pending → active → completed

### 3. Task System → Simplified
**Original:** Goals had sub-tasks that both users needed to complete
**Changed to:** Goals themselves are the commitments (simpler UX)
**Reason:** Boss feedback - creation should be the commitment itself

### 4. Deadline Feature
- Added optional deadline field
- Visual indicators:
  - 📅 Normal (>3 days)
  - ⏰ Warning (≤3 days, orange)
  - ⚠️ Overdue (red)
- Edit/update functionality

### 5. Mobile-First Redesign
- Responsive header (stacks vertically)
- Full-width buttons on mobile
- Cards stack content vertically
- Deadline editor optimized for mobile
- Modal scrollable on small screens

### 6. Completed Goals UI
- Made collapsible (hidden by default)
- Shows count: "✅ Completed (X)"
- Click to expand/collapse

## Technical Challenges & Solutions

### Challenge 1: Vercel Serverless Read-Only Filesystem
**Problem:** Tried to write `data/goals.json` file on server  
**Error:** File system is read-only in serverless functions  
**Solution:** Switched to Redis database for persistence

### Challenge 2: Wrong Redis Client
**Attempt 1:** Used `@vercel/kv` (deprecated)  
**Attempt 2:** Used `@upstash/redis` (REST API, wrong format)  
**Problem:** Boss's Redis is standard `redis://` format, not Upstash REST  
**Solution:** Switched to standard `redis` npm package

### Challenge 3: Missing/Empty REDIS_URL
**Problem:** Vercel KV integration created empty env var  
**Solution:** Boss provided actual Redis credentials, manually added to Vercel env vars

### Challenge 4: Vercel Deployment Protection
**Problem:** 401 errors, site asking for Vercel login  
**Solution:** Boss disabled deployment protection in Vercel settings

### Challenge 5: Goals Not Showing in UI
**Root cause:** React state not refreshing after API calls  
**Solution 1:** Added cache-busting headers (`Cache-Control: no-cache`)  
**Solution 2:** Added console logging for debugging  
**Actual issue:** Goals were in Redis, but UI logic only showed:
  - Goals pending YOUR approval (none for proposer)
  - Active goals (none until both approve)
**Final solution:** Added "Your Proposals" section to show goals awaiting other's approval

## Design Decisions

### 1. Auto-Approve Proposer
**Decision:** Person creating a goal is automatically approved  
**Reason:** Proposing = commitment already made

### 2. Removed Task System
**Original:** Goals → Tasks → Individual completion  
**Simplified:** Goals = commitments (no sub-tasks)  
**Reason:** Boss feedback - simpler workflow

### 3. Mobile-First
**Decision:** Design for mobile first, scale up  
**Reason:** Primary use case is checking on phones

### 4. Collapsible Completed
**Decision:** Hide completed goals by default  
**Reason:** Keep focus on active commitments

### 5. Standard Redis vs Upstash
**Decision:** Use standard `redis` client  
**Reason:** Boss has existing Redis instance with `redis://` URL

## Environment Setup

### Local (.env.local)
```bash
JAMIL_PASSWORD=jamil2026
JERALD_PASSWORD=jerald2026
REDIS_URL=redis://default:[password]@actor-amberish-horses-15400.db.redis.io:18021
```

### Vercel (Production)
- `REDIS_URL` - Redis connection string
- `JAMIL_PASSWORD` - Jamil's login password
- `JERALD_PASSWORD` - Jerald's login password

## Deployment History

1. **First deploy:** Failed - JSON file storage doesn't work on Vercel
2. **Second deploy:** Failed - Wrong Redis client (@vercel/kv)
3. **Third deploy:** Failed - Wrong Redis client (@upstash/redis)
4. **Fourth deploy:** Failed - Missing REDIS_URL value
5. **Fifth deploy:** Success - Standard redis client + proper credentials
6. **Subsequent deploys:** UI improvements, mobile design, deadline features

## API Endpoints Created

- `POST /api/auth/login` - Authenticate user
- `GET /api/goals` - Fetch all goals
- `POST /api/goals/create` - Create new goal with optional deadline
- `POST /api/goals/approve` - Approve pending goal
- `POST /api/goals/reject` - Reject and delete pending goal
- `POST /api/goals/toggle-goal` - Mark goal done/undone by user
- `POST /api/goals/update-deadline` - Update goal deadline

## Files Created

### Core App
- `pages/index.js` - Login page (Jamil/Jerald selection)
- `pages/dashboard.js` - Main dashboard with goals
- `pages/_app.js` - App wrapper
- `styles/globals.css` - Global styles

### API
- `pages/api/auth/login.js`
- `pages/api/goals/index.js`
- `pages/api/goals/create.js`
- `pages/api/goals/approve.js`
- `pages/api/goals/reject.js`
- `pages/api/goals/toggle-goal.js`
- `pages/api/goals/update-deadline.js`

### Utilities
- `lib/redis.js` - Redis connection helper

### Documentation
- `PROJECT.md` - Project overview and reference
- `status/2026-05-26-initial-build.md` - This file

## Lessons Learned

### 1. Update Documentation as You Go
**Mistake:** Didn't update PROJECT.md during development  
**Impact:** File was outdated when Boss asked about it  
**Fix:** Created detailed PROJECT.md + status log retroactively  
**Future:** Update docs incrementally

### 2. Verify Platform Constraints Early
**Mistake:** Assumed file system was writable on Vercel  
**Impact:** Multiple failed deployments  
**Learning:** Check serverless platform constraints first

### 3. Understand Client Requirements
**Mistake:** Used Upstash client for non-Upstash Redis  
**Impact:** Additional debugging time  
**Learning:** Verify infrastructure details before choosing libraries

### 4. Listen to User Feedback
**Success:** Simplified task system based on Boss feedback  
**Impact:** Much cleaner, easier to use app  
**Learning:** User knows their use case better than assumptions

## Final State

**Status:** ✅ Production-ready  
**URL:** https://nigs-commitment.vercel.app  
**Database:** Redis, cleared of test data  
**Next Steps:** Boss shares URL with Jerald for real use

## Statistics

- **Build time:** ~2 hours
- **Deployments:** 10+ (iterative fixes)
- **Files created:** 20+
- **API endpoints:** 7
- **Lines of code:** ~500 (estimated)

---

**Built by:** Proto (OpenClaw AI)  
**For:** Boss Jamil @ ETG  
**Date:** 2026-05-26
