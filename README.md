# 🚋 Trolley LLM Arena

An interactive platform that evaluates Large Language Models (LLMs) by presenting them with variations of the classic "Trolley Problem" moral dilemma. Compare AI reasoning against human consensus in a comic-style interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue) ![Prisma](https://img.shields.io/badge/Prisma-7-2D3748) ![Tailwind](https://img.shields.io/badge/Tailwind-4-38B2AC)

## ✨ Features

- **27 Moral Dilemmas** - Classic and creative trolley problem variations
- **Comic-Style UI** - Engaging visual presentation with animations
- **Real-time Comparison** - See how different LLMs reason about the same problem
- **Alignment Scoring** - Measure how closely AI matches human consensus
- **TTS Reasoning** - Listen to LLM explanations via ElevenLabs voices
- **Admin Dashboard** - Manage evaluations, providers, and problems

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL database
- OpenAI/OpenRouter API key
- (Optional) ElevenLabs API key for TTS

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/TrolleyLLMArena.git
cd TrolleyLLMArena

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your credentials

# Initialize the database
npx prisma db push

# Seed problems (if needed)
npm run seed

# Start development server
npm run dev
```

Visit `http://localhost:3000` to view the leaderboard, or `/browse` to explore problems.

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | ✅ |
| `OPENAI_API_KEY` | OpenAI API key | ✅ |
| `OPENROUTER_API_KEY` | OpenRouter API key (for other models) | Optional |
| `ELEVENLABS_API_KEY` | ElevenLabs API key for TTS | Optional |
| `AUTH_SECRET` | NextAuth secret for admin auth | ✅ |
| `AUTH_GITHUB_ID` | GitHub OAuth client ID | For admin |
| `AUTH_GITHUB_SECRET` | GitHub OAuth client secret | For admin |

## 📁 Project Structure

```
├── app/                  # Next.js App Router pages
│   ├── page.tsx         # Leaderboard (home)
│   ├── browse/          # Problem viewer
│   ├── admin/           # Admin dashboard
│   └── api/             # API routes
├── components/          # React components
│   ├── leaderboard/     # Leaderboard components
│   └── trolley/         # Trolley scene components
├── data/
│   └── problems.json    # Problem definitions
├── lib/                 # Utilities
│   ├── prisma.ts        # Database client
│   ├── trolleyIterator.ts # LLM evaluation logic
│   └── rateLimit.ts     # Rate limiting
├── prisma/
│   └── schema.prisma    # Database schema
└── types/               # TypeScript types
```

## 🎯 Adding New Problems

Edit `data/problems.json` to add new trolley problems:

```json
{
  "id": "unique-problem-id",
  "title": "Problem Title",
  "text": "Description of the dilemma...",
  "humanPullVotes": 0,
  "humanNothingVotes": 0,
  "option1": {
    "src": "image-name",
    "kill": 5
  },
  "option2": {
    "src": "other-image",
    "kill": 1
  }
}
```

Then run the seed script to sync with the database.

## 🤖 Adding New LLM Providers

1. **Add to Provider table** via admin (`/admin/companies`) or database
2. **Configure in code** if using a new API:
   - Edit `lib/trolleyIterator.ts`
   - Add API configuration for new providers
3. **Optional: Add TTS voice** - Set `voiceId` in Provider to enable ElevenLabs TTS

Supported model APIs:
- OpenAI (gpt-4, gpt-4o, o1, etc.)
- OpenRouter (Claude, Gemini, Llama, etc.)

## 🧪 Testing

```bash
# Run tests in watch mode
npm run test

# Run tests once
npm run test:run
```

## 📝 Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run test` | Run Vitest in watch mode |
| `npm run test:run` | Run tests once |

## 🏗️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL + Prisma ORM
- **Styling**: Tailwind CSS 4
- **Animation**: Framer Motion
- **Auth**: NextAuth.js
- **AI**: OpenAI SDK, OpenRouter
- **TTS**: ElevenLabs
- **Testing**: Vitest + Testing Library

## 📄 License

MIT
