# PromptCatalyst — Web Client

Frontend for [PromptCatalyst](https://promptcatalyst.ai), a full-stack AI platform for prompt optimization and image/video generation. The live product reached 10,000+ registered users.

**Live:** https://promptcatalyst.ai

> This repository contains the **React frontend** only. The backend API is kept in a separate private repository.

<!-- Add 2–3 screenshots or a short GIF in docs/screenshots and reference them here, e.g. ![Dashboard](docs/screenshots/dashboard.png) -->

## Overview

A single-page React application handling the full user-facing experience: authentication, the prompt-optimization workflow, image and video generation UI, subscription management and account settings.

## Features

- Prompt optimization interface
- AI image and video generation flows
- Authentication and account management
- Stripe-powered subscriptions and billing UI
- Polished UX: animated transitions, toast notifications, bulk export

## Tech stack

| Area | Technology |
|------|------------|
| Framework | React 18 (Create React App) |
| Routing | React Router 7 |
| State | Zustand |
| Styling | Tailwind CSS, Framer Motion |
| UI | Radix UI, Headless UI, Lucide icons |
| Payments | Stripe.js |
| Networking | Axios |
| Utilities | date-fns, JSZip, react-hot-toast |

## Running locally

```bash
git clone https://github.com/vahanghazaryan03/prompt-catalyst-web.git
cd prompt-catalyst-web
npm install
cp .env.example .env   # then add your own values
npm start
```

Runs at http://localhost:3000. Full functionality requires the backend API, which is not part of this repository.
