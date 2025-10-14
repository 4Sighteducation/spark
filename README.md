# SPARK Assessment Platform

> **S**elf-direction · **P**urpose · **A**wareness · **R**esilience · **K**nowledge

A comprehensive psychometric assessment platform for Key Stage 3 students (ages 11-14), built with Next.js, Supabase, and TypeScript.

![SPARK Logo](./assets/SPARK%20Logo.png)

## 🎯 Project Overview

SPARK is a modern, gamified educational platform that helps schools:
- **Assess** student mindsets across 5 key dimensions
- **Understand** individual strengths and growth areas
- **Intervene** with targeted, engaging activities
- **Track** progress over time with rich dashboards
- **Empower** students through interactive, age-appropriate tools

### The 5 Dimensions

| Dimension | Focus | Color |
|-----------|-------|-------|
| **S** - Self-direction | Initiative, proactiveness, bias toward action | Pink `#E91E8C` |
| **P** - Purpose | Hope, aspirations, sense of direction | Purple `#7C3AED` |
| **A** - Awareness | Empathy, relationships, openness to difference | Cyan `#06B6D4` |
| **R** - Resilience | Grit, perseverance, reliability | Lime `#84CC16` |
| **K** - Knowledge | Curiosity, attention, valuing education | Yellow `#FBBF24` |

## ✨ Key Features (V1)

### For Students
- **Slider Questionnaire**: Modern 0-100 slider interface (more engaging than traditional Likert scales)
- **Interactive Reports**: Personalized feedback with dimension scores, statements, and reflection prompts
- **Goal Setting**: Students can record reflections and set personal goals
- **Gamified Activities**: 40 engaging activities (8 per dimension) with progress tracking
- **Beautiful UI**: Age-appropriate, colorful design with animations and celebrations

### For Teachers & Staff
- **Multi-Role Access**: Support for tutors, heads of year, heads of department, org admins
- **Flexible Dashboards**: View individual students, tutor groups, year groups, or entire school
- **Activity Management**: Assign activities, review completions, provide feedback
- **Progress Tracking**: Monitor assessment scores, activity completion, and student reflections
- **Staff Notes**: Add observations and comments on student progress

### For Admins
- **Organization Management**: Multi-tenant architecture (each school is isolated)
- **User Management**: Create staff and students, assign roles and classes
- **Data Export**: Reports and analytics
- **Role-Based Permissions**: Granular control over who sees what

## 🏗️ Architecture

### Tech Stack
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS with custom SPARK theme
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **Authentication**: Supabase Auth
- **State Management**: Zustand + TanStack Query
- **Charts**: Recharts
- **Animations**: Framer Motion
- **PDF Export**: jsPDF + html2canvas

### Database Design
- **17 core tables** covering organizations, users, assessments, activities, and more
- **Row Level Security (RLS)** ensures data isolation and role-based access
- **Optimized indexes** for performance at scale
- **JSONB fields** for flexibility (reports, activity responses, metadata)
- **Triggers** for data integrity (timestamps, student role enforcement)

See [DATABASE_ARCHITECTURE.md](./DATABASE_ARCHITECTURE.md) for full details.

## 📊 Scoring System

### Slider → Score Conversion
1. Student moves slider: **0-100** (granular, smooth UX)
2. Stored value: `slider_value / 10` = **0.0 to 10.0**
3. Dimension score: Average of question scores
4. Band assignment:
   - **0-3**: Low
   - **3-5**: Average
   - **5-8**: High
   - **8-10**: Very High

### Example
```
Question S01: Slider at 85 → Score = 8.5
Question S02: Slider at 72 → Score = 7.2
Question S03: Slider at 90 → Score = 9.0
...
Self-Direction Average: 7.8 → Band: High
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm 9+
- Supabase account
- Git

### Installation

1. **Clone the repository**
   ```bash
   cd SPARK
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new Supabase project at [supabase.com](https://supabase.com)
   - Run the database schema:
     ```bash
     # Copy the SQL from supabase-spark-schema.sql
     # Paste into Supabase SQL Editor and run
     ```

4. **Configure environment variables**
   ```bash
   # Copy env.example to .env.local
   cp env.example .env.local
   
   # Edit .env.local with your Supabase credentials
   ```

5. **Run development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   ```
   http://localhost:3000
   ```

### First-Time Setup

After running the app for the first time, you'll need to:

1. **Create an organization** (school)
2. **Create an admin user**
3. **Import questionnaire data** (from `/src/data/questionnaire.json`)
4. **Import activities** (from `spark_activities_40.json`)
5. **Create test students and classes**

Seed scripts will be provided to automate this process.

## 📁 Project Structure

```
SPARK/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── (auth)/       # Authentication pages (login, register)
│   │   ├── (student)/    # Student-facing pages
│   │   ├── (staff)/      # Staff dashboards
│   │   └── (admin)/      # Admin pages
│   ├── components/       # React components
│   │   ├── ui/           # Base UI components (buttons, inputs, etc.)
│   │   ├── questionnaire/# Questionnaire components
│   │   ├── reports/      # Report generation components
│   │   ├── activities/   # Activity components
│   │   └── dashboards/   # Dashboard components
│   ├── lib/              # Utilities and configurations
│   │   ├── supabase/     # Supabase client and helpers
│   │   ├── scoring/      # Scoring algorithms
│   │   └── pdf/          # PDF generation
│   ├── hooks/            # Custom React hooks
│   ├── types/            # TypeScript type definitions
│   ├── data/             # Static data (questionnaire, statements)
│   └── utils/            # Helper functions
├── public/               # Static assets
├── supabase/             # Supabase migrations (optional)
├── docs/                 # Additional documentation
└── tests/                # Test files
```

## 🎨 Design System

### Colors
See `tailwind.config.ts` for the full palette:
- **Dimension Colors**: Each SPARK dimension has a unique color
- **Gradients**: Beautiful gradients for each dimension
- **Neutrals**: Grays for text and backgrounds

### Typography
- **Font**: Inter (sans-serif) for body text
- **Display Font**: Custom display font for headings

### Animations
- Slide-in, fade-in, scale-in for page transitions
- Gentle bounce and pulse for engagement
- Confetti celebrations for achievements
- Sparkle effects for rewards

## 🔐 Security

### Row Level Security (RLS)
All database tables have RLS policies ensuring:
- Users can only access data in their organization
- Students see only their own data
- Staff see students based on their role scope
- Sensitive data is protected

### Authentication
- Supabase Auth with email/password
- Optional: Magic links, OAuth providers
- Session management
- Password reset flows

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint
```

## 📦 Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy!

### Other Platforms
Compatible with any platform supporting Next.js (Netlify, Railway, etc.)

## 🗺️ Roadmap

### V1 (Current Focus)
- [x] Database schema and RLS policies
- [x] Project structure and configuration
- [ ] Authentication and user management
- [ ] Slider questionnaire component
- [ ] Report generation and PDF export
- [ ] Activity library interface
- [ ] Teacher/admin dashboards

### V2 (Future)
- [ ] Mobile apps (iOS/Android) with React Native
- [ ] Parent portal
- [ ] AI coaching (like 7Cs project)
- [ ] Advanced analytics and cohort comparisons
- [ ] Push notifications
- [ ] Integrations (Google Classroom, Microsoft Teams)
- [ ] Multi-language support

### V3 (Vision)
- [ ] Longitudinal tracking over academic years
- [ ] Machine learning insights
- [ ] Research data export (anonymized)
- [ ] White-label customization for schools
- [ ] API for third-party integrations

## 📖 Documentation

- [Database Architecture](./DATABASE_ARCHITECTURE.md) - Complete schema documentation
- [API Reference](./docs/API.md) - API endpoints (coming soon)
- [Component Library](./docs/COMPONENTS.md) - UI components guide (coming soon)
- [Deployment Guide](./docs/DEPLOYMENT.md) - Production deployment (coming soon)

## 🤝 Contributing

This is a proprietary project for 4Sight Education Ltd. 

## 📄 License

Copyright © 2025 4Sight Education Ltd. All rights reserved.

## 🙋 Support

For questions or support, contact:
- **Email**: tony@4sighteducation.com
- **GitHub**: https://github.com/4Sighteducation/spark

## 🎓 Research Background

SPARK is based on validated psychometric research:
- **Pilot Study**: 190 students at Manchester Metropolitan University
- **Reliability**: Cronbach's α ranging from 0.81-0.89 across dimensions
- **Factor Analysis**: 5-factor structure confirmed
- **Validated Constructs**: Purpose and Awareness show strongest measurement properties

See `background/` folder for research reports and analysis.

---

**Built with ❤️ by 4Sight Education Ltd.**

 
 