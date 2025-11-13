# Habit Tracker Application

A comprehensive habit-tracking application designed to help users build, maintain, and improve their habits through structured goal-settings, flexible scheduling, and motivational feedback.

## Features

- **Create & Manage Habits** - Define personal habits with names, descriptions, and categories
- **Goals & Sub-Tasks** - Set main goals with sub-tasks and track progress with aggregated progress bars
- **Frequency & Targets** - Flexible scheduling (daily/weekly/monthly/quarterly/yearly) with numeric targets
- **Check-Ins & Input Interfaces** - Simple interfaces for recording habit completion
- **Progress Visualization & Streaks** - Visual feedback with charts, completion rates, and streak counters
- **Reminders & Notifications** - Due-date notifications with snooze and mark-as-done functionality
- **Calendar Integration** - Export/import .ics files for calendar synchronization
- **Habit Templates** - Pre-built and customizable habit templates
- **Rewards & Positive Feedback** - Badge system and celebratory UI for achievements

## Tech Stack

- **Frontend:** React + TypeScript + Vite + Tailwind CSS
- **Backend:** Node.js + Express + TypeScript
- **Database:** IndexedDB (local) + Cloud sync option
- **State Management:** React Context API

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- Modern web browser with IndexedDB support

### Installation

1. Install frontend dependencies:
```bash
cd frontend
npm install
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

### Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Start the frontend development server:
```bash
cd frontend
npm run dev
```

The application will be available at `http://localhost:5173` (or the port shown in the terminal).

## Deployment

### Deploying to Vercel

This project is configured to deploy to Vercel with both frontend and backend serverless functions.

#### Prerequisites
- A Vercel account (sign up at [vercel.com](https://vercel.com))
- Your code pushed to a GitHub repository

#### Deployment Steps

1. **Install Vercel CLI (optional):**
   ```bash
   npm install -g vercel
   ```

2. **Deploy via Vercel Dashboard:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect the configuration from `vercel.json`
   - Click "Deploy"

3. **Deploy via CLI:**
   ```bash
   vercel
   ```
   Follow the prompts to link your project and deploy.

#### Project Structure for Vercel

```
HabitTracker/
├── api/              # Vercel serverless functions
│   ├── health.ts     # Health check endpoint
│   └── habits.ts     # Habits API endpoint
├── frontend/         # React frontend application
├── backend/          # Original Express backend (for local dev)
├── shared/           # Shared types and utilities
├── vercel.json       # Vercel configuration
└── package.json      # Root package.json for builds
```

#### API Endpoints

Once deployed, your API endpoints will be available at:
- `https://your-project.vercel.app/api/health` - Health check
- `https://your-project.vercel.app/api/habits` - Habits CRUD operations

The frontend will automatically use these endpoints in production.

## Project Structure

```
HabitTracker/
├── api/               # Vercel serverless functions
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API (for local dev)
├── shared/            # Shared types and utilities
├── vercel.json        # Vercel deployment configuration
└── README.md
```

## License

MIT

