# Worklocal Knowledge Portal

A read-only web application for browsing and searching Markdown files from the Work-Local-Inc/worklocal-knowledge GitHub repository.

## Features

- 📁 Browse repository files in a tree structure
- 📄 Render Markdown files with YAML front-matter
- 🏷️ Display metadata (title, category, tags, owner, status, priority)
- ⭐ Filter "Golden" priority files
- 🔍 Search by title and tags
- 🔗 Direct links to GitHub and raw files
- 📋 Copy file paths to clipboard
- ⚡ Server-side caching to avoid GitHub rate limits

## How to Run Locally

1. **Clone and install dependencies:**
   \`\`\`bash
   git clone <your-repo-url>
   cd worklocal-knowledge-portal
   pnpm install
   \`\`\`

2. **Set up environment variables:**
   \`\`\`bash
   cp .env.example .env.local
   \`\`\`
   
   Edit `.env.local` and add your GitHub token:
   \`\`\`env
   GITHUB_TOKEN=ghp_your_github_token_here
   REPO_OWNER=Work-Local-Inc
   REPO_NAME=worklocal-knowledge
   REPO_BRANCH=main
   \`\`\`

3. **Start the development server:**
   \`\`\`bash
   pnpm dev
   \`\`\`

4. **Open http://localhost:3000**

## Deploy to Vercel

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard:
   - `GITHUB_TOKEN` (read-only GitHub token)
   - `REPO_OWNER=Work-Local-Inc`
   - `REPO_NAME=worklocal-knowledge`
   - `REPO_BRANCH=main`
3. Deploy!

## Adding Content

### Front-matter Format

Add YAML front-matter to your Markdown files:

\`\`\`yaml
---
title: "Document Title"
category: "Category Name"
tags: ["tag1", "tag2", "tag3"]
lastUpdated: "2024-01-15"
owner: "Team Name"
status: "published"
priority: "golden"
version: "1.0"
confidentiality: "PUBLIC"
---

# Your Markdown Content Here
\`\`\`

### Golden Priority Files

Files with `priority: golden` will appear in the Golden filter. Alternatively, create a `golden-manifest.json` file in the repository root:

\`\`\`json
{
  "files": [
    "path/to/important-doc.md",
    "another/golden-file.md"
  ]
}
\`\`\`

## Architecture

- **Next.js 14** with App Router
- **Server-side GitHub API** calls (no client-side secrets)
- **5-minute caching** to respect GitHub rate limits
- **Read-only** - no write operations to the repository
- **TypeScript** for type safety
- **Tailwind CSS** for styling

## Security

- GitHub token is only used server-side
- No write operations to the repository
- Respects confidentiality levels in front-matter
- Rate limiting through caching
