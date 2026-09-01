# Framewire

Framewire is a local-first visual website builder for designing responsive single-page and multi-page websites on an infinite canvas. Build with drag-and-drop components, connect screens in prototype mode, preview real interactions, ask Groq-powered AI to edit the canvas, and export clean source code as a ZIP.

## Features

- Infinite canvas with pan, zoom, snap-to-grid, frames, drag, and resize
- Multiple pages with desktop, tablet, and mobile frame presets
- Layer tree, element properties, reusable component library, and design tokens
- Custom accessible dropdowns with contextual search for larger destination lists
- Prototype connectors with click, double-click, hover, long-press, key, submit, and delayed triggers
- Actions for page navigation, URLs, visibility, scrolling, text changes, and animations
- Interactive preview with device sizing, page navigation, and AI-generated responsive layouts
- Groq AI sidebar that returns structured canvas operations
- Figma-style tool, editing, view, and workspace keyboard shortcuts with a searchable shortcut guide
- Fully removable starter pages, frames, and elements with an undoable blank-project reset
- Responsive source export with generated tablet and mobile layouts emitted as media queries
- Undo, redo, auto-save, light and dark modes, import, project JSON, and ZIP source export
- Vercel-ready serverless Groq proxy

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `GROQ_API_KEY` in `.env.local`. For the serverless APIs during local development, use `vercel dev`. The same key powers both the canvas assistant and responsive-layout generation.

## Deploy

Import the repository into Vercel, add `GROQ_API_KEY` and optionally `GROQ_MODEL`, then deploy. No database is required.

## Privacy

Projects are stored in the browser. AI prompts send the current project summary to the configured Groq model through the server-side API route. Keys are never exposed to the client.

## License

MIT
