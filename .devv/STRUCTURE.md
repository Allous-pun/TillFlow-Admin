# This file is only for editing file nodes, do not break the structure
## Project Description
TillFlow is an enterprise-grade admin dashboard and merchant management platform. It provides comprehensive tools for managing users, tokenization, business operations, notifications, and platform settings. The system supports both admin and merchant roles with distinct interfaces and capabilities.

## Key Features
- Complete authentication system (Login, Signup, Forgot Password) - frontend only
- Professional admin dashboard with sidebar navigation
- User management with search, filtering, and activation controls [complete]
- Tokenization management with create, update, delete, and status controls [complete]
- Business oversight with merchant business management [complete]
- Notifications & communications with broadcasts and maintenance announcements [complete]
- Platform settings management [complete]:
  - About page with company information editor
  - Contact page with contact info management
  - Feedback page with user feedback management
  - Help page with FAQ and guides system
  - Currency page with multi-currency support
- Merchant landing page with features and CTAs [next: Phase 7]

## Data Storage
Tables: None (pure frontend implementation - no backend integration)
Local: Zustand persist for auth state

## Devv SDK Integration
Built-in: None (frontend only as per requirements)
External: None

## Special Requirements
- No backend or database integration (frontend only)
- Mock authentication with localStorage persistence
- Supports both admin and merchant user roles
- Professional fintech design aesthetic

/src
├── store/              # State management directory (Zustand)
│   └── auth-store.ts  # Authentication state with persist [complete]
│
├── pages/              # Page components directory
│   ├── HomePage.tsx   # Landing page placeholder [next: Phase 7 - build full landing]
│   ├── LoginPage.tsx  # Login page with email/password [complete]
│   ├── SignupPage.tsx # Registration with role selection [complete]
│   ├── ForgotPasswordPage.tsx # Password reset flow [complete]
│   ├── DashboardPage.tsx # Main dashboard with stats and activity [complete]
│   ├── UsersPage.tsx # User management with list, filters, search, activation/deactivation, delete [complete]
│   ├── TokenizationPage.tsx # Token management with CRUD operations, status controls, search, filtering [complete]
│   ├── BusinessesPage.tsx # Business management with list, details, status controls, search, filtering by merchant/status/type, delete [complete]
│   ├── NotificationsPage.tsx # Notifications with broadcasts, scheduling, targeting, read tracking [complete]
│   ├── settings/
│   │   ├── AboutPage.tsx # About settings with company info editor and public preview [complete]
│   │   ├── ContactPage.tsx # Contact settings with email, phone, hours, locations, social media [complete]
│   │   ├── FeedbackPage.tsx # Feedback management with categories, status tracking, responses [complete]
│   │   ├── HelpPage.tsx # Help page with FAQ accordion and guides library [complete]
│   │   └── CurrencyPage.tsx # Currency settings with exchange rates and enable/disable controls [complete]
│   └── NotFoundPage.tsx # 404 error page
│
├── components/         # Components directory
│   ├── DashboardLayout.tsx # Main dashboard layout with sidebar and header [complete]
│   └── ui/            # Pre-installed shadcn/ui components
│
├── hooks/             # Custom Hooks directory
│   ├── use-mobile.ts  # Mobile detection Hook
│   └── use-toast.ts   # Toast notification system Hook
│
├── lib/               # Utility library directory
│   └── utils.ts       # Utility functions
│
├── App.tsx            # Root component with all routes configured [complete]
├── main.tsx           # Entry file
└── index.css          # Design system with fintech color scheme [complete]
