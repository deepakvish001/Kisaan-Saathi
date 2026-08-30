# 🌾 Kisaan Saathi

<p align="center">
  <strong>A multilingual, connectivity-aware crop diagnostic and farm decision-support platform.</strong>
</p>

<p align="center">
  React • TypeScript • Supabase • PostgreSQL • Edge Functions • Vitest
</p>

---

## 📌 Overview

Kisaan Saathi helps farmers describe visible crop symptoms, answer guided follow-up questions, and receive structured advisories with confidence indicators. The experience is designed for outdoor use, multilingual interaction, variable connectivity, voice assistance, treatment tracking, weather context, and escalation to agricultural experts when confidence is low.

> Kisaan Saathi supports decision-making; it does not replace an agronomist, laboratory diagnosis, or official agricultural guidance.

## ✨ Core Features

| Area | Capabilities |
|---|---|
| Guided diagnosis | Adaptive questions, symptom tracking, confidence progress and structured recommendations |
| Accessibility | Hindi and English UI, voice input, text-to-speech and large touch targets |
| Crop intelligence | Crop, growth-stage, symptom, disease and treatment relationships |
| Farm management | Profiles, history, reminders, treatment plans and treatment outcomes |
| Weather | Current conditions and forecast context for treatment timing |
| Image workflow | Crop image upload and analysis history |
| Reliability | Online, low-bandwidth and disconnected experience states |
| Safety | Confidence thresholds, disclaimers and expert escalation |
| Security | Supabase authentication, Row Level Security and isolated user data |

## 🧰 Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Database | PostgreSQL |
| Serverless logic | Supabase Edge Functions |
| Authentication | Supabase Auth |
| Testing | Vitest |
| Static analysis | TypeScript and ESLint |

## 🏗️ Architecture

\`\`\`text
Farmer
  │
  ▼
React application
  ├── Authentication and farm profiles
  ├── Guided diagnostic conversation
  ├── Image, voice and weather experiences
  └── Treatment plans, reminders and history
  │
  ▼
Supabase
  ├── PostgreSQL + Row Level Security
  ├── Authentication
  ├── Storage
  └── Edge Functions
      ├── chat-orchestrator
      ├── generate-advisory
      ├── analyze-crop-image
      └── weather-service
\`\`\`

## 📁 Project Structure

\`\`\`text
Kisaan-Saathi/
├── src/
│   ├── components/        # Pages and reusable product components
│   ├── contexts/          # Authentication state
│   ├── lib/               # Supabase client, translations and tests
│   ├── App.tsx            # Application composition
│   └── main.tsx           # Browser entry point
├── supabase/
│   ├── functions/         # Serverless functions
│   └── migrations/        # Versioned database schema
├── TESTING_GUIDE.md
├── package.json
└── vite.config.ts
\`\`\`

## 🚀 Local Setup

### 1. Prerequisites

Install or create:

- Node.js 18 or newer
- npm 9 or newer
- Git
- A Supabase project
- Supabase CLI when running migrations and Edge Functions locally

Check your installation:

\`\`\`bash
node --version
npm --version
git --version
\`\`\`

### 2. Clone the repository

\`\`\`bash
git clone https://github.com/deepakvish001/Kisaan-Saathi.git
cd Kisaan-Saathi
\`\`\`

### 3. Install dependencies

\`\`\`bash
npm install
\`\`\`

Use \`npm ci\` instead when you need a clean, lockfile-reproducible installation:

\`\`\`bash
npm ci
\`\`\`

### 4. Configure environment variables

Create a local environment file:

\`\`\`bash
cp .env.example .env.local
\`\`\`

If \`.env.example\` is not available on your current branch, create \`.env.local\` manually:

\`\`\`env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
\`\`\`

Never commit service-role keys or production secrets.

### 5. Link Supabase

\`\`\`bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
\`\`\`

### 6. Apply database migrations

For a linked development project:

\`\`\`bash
npx supabase db push
\`\`\`

For a fully local Supabase environment:

\`\`\`bash
npx supabase start
npx supabase db reset
\`\`\`

Migrations create the diagnostic schema, user profiles, authentication links, image analysis records, treatments, weather records and farm-characterisation data.

### 7. Serve Edge Functions locally

\`\`\`bash
npx supabase functions serve
\`\`\`

To serve one function during focused development:

\`\`\`bash
npx supabase functions serve chat-orchestrator
\`\`\`

### 8. Start the application

\`\`\`bash
npm run dev
\`\`\`

Open the URL printed by Vite, normally [http://localhost:5173](http://localhost:5173).

## ✅ Quality Checks

Run these before opening a pull request:

\`\`\`bash
npm run typecheck
npm run lint
npm run test
npm run build
\`\`\`

Use watch mode while developing:

\`\`\`bash
npm run test:watch
\`\`\`

## 🗄️ Data Model

The platform includes data for:

- crops and growth stages
- symptoms and multilingual descriptions
- diseases and prevention guidance
- weighted symptom-to-disease mappings
- diagnostic questions and conversation state
- generated advisories and confidence values
- users, farms and crop profiles
- crop images and analysis status
- treatment plans, reminders and outcomes
- weather observations and forecast context

Row Level Security policies must be reviewed whenever a table or user-facing query is added.

## 🔄 Diagnostic Workflow

1. The farmer selects language, crop, growth stage and farm profile.
2. The assistant collects symptoms through text, voice or image input.
3. The diagnostic engine asks context-sensitive follow-up questions.
4. Candidate issues receive weighted confidence scores.
5. The advisory function returns treatment, prevention and monitoring steps.
6. Low-confidence cases are escalated to an agricultural expert.
7. The farmer may save treatment actions, reminders and outcomes.

## 🧪 Testing Strategy

The project should maintain coverage across:

- translation-key parity and fallback behaviour
- authentication and protected routes
- diagnostic scoring and confidence thresholds
- Edge Function request validation
- Row Level Security policies
- treatment-plan lifecycle
- weather error and timeout handling
- offline and low-bandwidth behaviour
- keyboard navigation and accessible names

See \`TESTING_GUIDE.md\` for focused testing instructions.

## 🔐 Security Guidelines

- Keep the Supabase service-role key server-side only.
- Treat all browser input as untrusted.
- Validate Edge Function payloads before database operations.
- Enable Row Level Security for every user-owned table.
- Avoid exposing precise farm location without a product requirement.
- Do not log access tokens, health-like crop observations or personal data.
- Review storage-bucket access policies for uploaded crop images.

## 🌍 Deployment

### Frontend

\`\`\`bash
npm ci
npm run build
\`\`\`

Deploy the generated \`dist/\` directory to Vercel, Netlify, Cloudflare Pages or another static host. Configure \`VITE_SUPABASE_URL\` and \`VITE_SUPABASE_ANON_KEY\` in the hosting provider.

### Supabase

\`\`\`bash
npx supabase db push
npx supabase functions deploy
\`\`\`

Deploy individual functions when preferred:

\`\`\`bash
npx supabase functions deploy chat-orchestrator
npx supabase functions deploy generate-advisory
npx supabase functions deploy analyze-crop-image
npx supabase functions deploy weather-service
\`\`\`

## 🧭 Roadmap

- Expand crop and disease coverage
- Add regional Indian languages
- Improve image-assisted symptom classification
- Add verified agronomist review workflows
- Integrate market prices and government schemes
- Add notification delivery and reminder scheduling
- Introduce observability for Edge Functions
- Add end-to-end and database-policy test suites
- Strengthen offline data synchronisation

## 🤝 Contributing

1. Create a focused branch from \`main\`.
2. Keep each pull request limited to one independently reviewable change.
3. Add or update tests for behaviour changes.
4. Run all quality checks.
5. Explain user impact, technical approach and verification in the PR description.

Example:

\`\`\`bash
git checkout main
git pull --ff-only
git checkout -b feat/clear-change-name
npm install
npm run typecheck
npm run test
git add .
git commit -m "feat: describe the change"
git push -u origin feat/clear-change-name
\`\`\`

## 📄 License

This repository is currently intended for educational and research use. Add an explicit licence file before redistributing or using the project commercially.

## ☎️ Agricultural Support

For official support in India, farmers may contact the Kisan Call Centre at **1800-180-1551**.

---

<p align="center">
  Built to make crop guidance clearer, safer and more accessible in real farming conditions.
</p>
