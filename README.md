# Ottimo Master Tutor 🎓

A full-stack, RAG-enabled Smart Tutor Web Application for school textbook publishers.

**Student Mode** — 24/7 Socratic AI guide that never gives direct homework answers. Guides students through discovery using the uploaded textbook as its knowledge base.

**Teacher Mode** — Auto-generates chapter-based test papers (MCQ, true/false, short/long answer) with answer keys, exportable to PDF.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14+ (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| Auth & DB | Supabase (PostgreSQL + Auth) |
| Vector Store | Chroma Cloud (`chromadb`) |
| AI Models | Gemini 2.5 Flash (chat) · Gemini 2.5 Pro (generation) |
| Embeddings | `text-embedding-004` (Google) |
| PDF Parsing | `pdf-parse` (in-house chunker, no LangChain) |
| Math Rendering | KaTeX via `rehype-katex` |
| PDF Export | `jsPDF` |
| Deployment | Vercel |

---

## Local Development

### 1. Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project
- A [Google AI Studio](https://aistudio.google.com) API key
- Chroma running locally: `docker run -p 8000:8000 chromadb/chroma`

### 2. Clone and install

```bash
cd ottimo-master-tutor
npm install
```

### 3. Configure environment

```bash
cp .env.example .env.local
# Fill in your Supabase URL/keys, Gemini API key, and Chroma URL
```

### 4. Set up the database

Run the SQL from `supabase/schema.sql` in your [Supabase SQL Editor](https://supabase.com/dashboard).

Also enable **Google OAuth** in Supabase → Authentication → Providers → Google.

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Project Structure

```
ottimo-master-tutor/
├── app/
│   ├── api/
│   │   ├── chat/route.ts            # Streaming Socratic chat (Gemini + Chroma RAG)
│   │   ├── generate-test/route.ts   # Teacher quiz generation (Gemini 2.5 Pro)
│   │   └── ingest-pdf/route.ts      # PDF chunking + embedding pipeline
│   ├── auth/callback/route.ts       # Supabase OAuth callback
│   ├── dashboard/
│   │   ├── student/page.tsx         # Dual-pane: PDF viewer + Socratic chat
│   │   └── teacher/page.tsx         # Test paper generator studio
│   ├── login/page.tsx               # Auth (email + Google OAuth)
│   ├── layout.tsx
│   └── page.tsx                     # Publisher landing page
├── components/
│   ├── ChatInterface.tsx            # Streaming chat with Markdown + KaTeX
│   ├── PDFViewer.tsx                # react-pdf with drag-drop upload + ingestion
│   └── QuizBuilder.tsx             # Quiz config + question preview + PDF export
├── lib/
│   ├── env.ts                       # Centralized env — fails fast if missing
│   ├── supabaseClient.ts            # Browser + server Supabase clients
│   ├── chromaClient.ts              # Chroma Cloud upsert/query interface
│   ├── gemini.ts                    # Gemini model initialization
│   ├── socraticPrompt.ts            # Socratic + Teacher system prompts
│   ├── pdfChunker.ts               # In-house PDF → chunks pipeline
│   └── utils.ts                     # cn() Tailwind merge helper
├── supabase/
│   └── schema.sql                   # DB schema with RLS policies
└── .env.example
```

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Set all env vars from `.env.example` in the Vercel dashboard under **Settings → Environment Variables**.

Also set Chroma to point to your [Chroma Cloud](https://cloud.trychroma.com) instance (set `CHROMA_URL` and `CHROMA_API_KEY`).

---

## Architecture: RAG Pipeline

```
Student asks question
        ↓
Embed question with text-embedding-004
        ↓
Query Chroma for top-5 relevant textbook chunks
        ↓
Inject chunks into Socratic system prompt
        ↓
Stream Gemini 2.5 Flash response via SSE
        ↓
Render Markdown + KaTeX in ChatInterface
```

---

## Key Design Decisions

- **No LangChain**: The PDF chunker is ~60 lines of custom code. LangChain's entire bundle for equivalent functionality would add 100MB+ of dependencies with significant maintenance overhead.
- **Supabase-only auth**: No Firebase duplication. Supabase handles auth, RLS-protected DB, and optional Storage — a single coherent backend.
- **Gemini 2.5 Flash for chat**: Streaming latency is the priority for student UX. 2.5 Pro is reserved for teacher test generation where quality matters more than speed.
- **Socratic enforcement in prompt**: The Socratic mode is enforced by the system prompt, not by code logic — making it easy to tune without deploys.

---

## License

MIT
