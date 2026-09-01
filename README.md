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

## Studio systems

Open Studio from the top bar or press `Shift+S`. The workbench is code-split from the main canvas and includes:

- Reusable component masters, linked instances, exposed content properties, variants, and detach
- Deterministic row, column, and grid auto layout plus fill, hug, fixed, wrap, constraint, min/max, and breakpoint controls
- Generated React, HTML, and CSS with validation, protected canvas IDs, regeneration, code overrides, and safe content synchronization
- Named and automatic snapshots, branches, structural comparisons, restore, and bounded history storage
- Variables, conditional prototype branches, component state, overlays, form actions, mouse movement, scroll, and existing click/hold triggers
- Searchable assets with folders, WebP optimization, usage detection, global replacement, local size limits, SVGs, and fonts
- Semantic design tokens for color, spacing, radius, shadow, type, and breakpoints with project-wide replacement
- Accessibility auditing for contrast, labels, alternative text, touch targets, semantic tags, keyboard focus, and reduced motion
- Per-page SEO, social images, canonical URLs, structured data, custom head code, redirects, robots.txt, and sitemap generation
- Reusable collections, records, dynamic-page bindings, forms, validation, webhooks, test submissions, and canvas form binding
- Role-based collaborators, review comments, shareable review links, resolution states, and bounded activity history
- A permission-scoped plugin registry exposed as `window.FramewirePlugins` for components, exporters, data sources, inspectors, and AI tools
- Static project tests for overflow, overlap, missing targets, responsive coverage, accessibility, SEO, and structure
- Direct Vercel preview and production deployment, status refresh, release history, redeployment restore, and custom-domain configuration
- Removable starter-site, section, and interaction templates that insert ordinary editable layers

All Studio data is stored with the Framewire project except version snapshots, which use a separate capped Zustand store. Snapshots retain at most twelve versions and omit embedded asset payloads when a project exceeds the memory threshold.

## Local development

```bash
pnpm install
cp .env.example .env.local
pnpm dev
```

Set `GROQ_API_KEY` in `.env.local`. For the serverless APIs during local development, use `vercel dev`. The same key powers both the canvas assistant and responsive-layout generation.

Direct deployment additionally requires `VERCEL_TOKEN`. The token is read only by `api/vercel-deploy.ts` and is never sent to the browser. A Team ID can be configured per project in Studio when the destination belongs to a Vercel team.

## Deploy

Import the repository into Vercel, add `GROQ_API_KEY`, optionally `GROQ_MODEL`, and `VERCEL_TOKEN` when direct deployment is needed, then deploy. No database is required for the local-first editor.

## Privacy

Projects are stored in the browser. AI prompts send the current project summary to the configured Groq model through the server-side API route. Keys are never exposed to the client.

## License

MIT
