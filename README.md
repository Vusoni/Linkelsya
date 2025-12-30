# Linkelsya - AI Document Editor

A clean, minimal document editor with AI-powered writing assistance and knowledge context. Write documents informed by your reference materials, with an AI assistant that helps you draft, edit, and refine.

## Features

- **Rich Text Editor** - A distraction-free writing environment with serif typography
- **Knowledge Context** - Add reference materials that inform AI suggestions
- **AI Writing Assistant** - Chat with AI to draft, edit, or improve your writing
- **Auto-save** - Documents save automatically as you type
- **Clean Design** - Soft shadows, rounded corners, and classic typography

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Rich Text**: TipTap
- **Database**: Convex
- **AI**: OpenAI GPT-4

## Getting Started

### Prerequisites

- Node.js 18+
- A Convex account (free at [convex.dev](https://convex.dev))
- An OpenAI API key

### Installation

1. Clone and install dependencies:

```bash
npm install
```

2. Set up Convex:

```bash
npx convex dev
```

This will:
- Create a Convex project (or connect to an existing one)
- Generate type-safe API bindings
- Start the Convex development server

3. Configure environment variables:

Create a `.env.local` file:

```env
NEXT_PUBLIC_CONVEX_URL=your_convex_deployment_url
```

4. Add your OpenAI API key to Convex:

Go to your [Convex dashboard](https://dashboard.convex.dev), select your project, navigate to Settings → Environment Variables, and add:

```
OPENAI_API_KEY=your_openai_api_key
```

5. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── auth/              # Login/Signup
│   ├── dashboard/         # Document list
│   └── editor/[id]/       # Document editor
├── components/
│   ├── ui/                # Reusable UI components
│   ├── landing/           # Landing page components
│   ├── auth/              # Auth form
│   ├── dashboard/         # Dashboard components
│   ├── editor/            # Editor components
│   └── providers/         # Context providers
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── auth.ts            # Authentication
│   ├── documents.ts       # Document CRUD
│   ├── knowledge.ts       # Knowledge CRUD
│   └── ai.ts              # OpenAI integration
└── lib/                   # Utilities
```

## Usage

1. **Sign Up / Sign In** - Create an account or sign in
2. **Create Document** - Click "New Document" on the dashboard
3. **Write** - Use the rich text editor to compose your document
4. **Add Knowledge** - Use the left sidebar to add reference materials
5. **Chat with AI** - Use the right sidebar to get AI writing assistance

The AI assistant has access to:
- Your current document content
- All knowledge items you've added
- Your conversation history

## Design System

The app uses a warm, classic aesthetic:

- **Colors**: Cream backgrounds (#FDFBF7), forest green accents (#2C5545)
- **Typography**: Crimson Pro (serif) for content, Inter (sans-serif) for UI
- **Shadows**: Soft, subtle shadows for depth
- **Corners**: Rounded corners (8-12px) for a friendly feel

## License

MIT
