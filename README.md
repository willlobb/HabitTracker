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

## Project Structure

```
HabitTracker/
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
├── shared/            # Shared types and utilities
└── README.md
```

## License

MIT

