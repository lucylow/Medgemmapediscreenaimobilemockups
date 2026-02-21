# MedGemma PediScreen AI

## Overview
A React-based medical screening application for pediatric health, built with Vite, Tailwind CSS v4, and various UI libraries (MUI, Radix UI). Originally exported from Figma Make.

## Project Architecture
- **Framework**: React 18 + Vite 6
- **Styling**: Tailwind CSS v4 with @tailwindcss/vite plugin
- **UI Libraries**: MUI (Material UI), Radix UI, Lucide icons
- **Routing**: react-router v7
- **Package Manager**: pnpm
- **Build Output**: `dist/`

## Project Structure
```
src/
  main.tsx          - Entry point
  app/
    App.tsx         - Root component
    routes.tsx      - Route definitions
    components/     - Shared components (ui/, figma/)
    screens/        - Page-level screen components
    data/           - Mock data
  styles/           - CSS files (fonts, theme, tailwind)
index.html          - HTML template
vite.config.ts      - Vite configuration
```

## Development
- Dev server: `npx vite --host 0.0.0.0 --port 5000`
- Build: `npx vite build`
- Output goes to `dist/`

## Recent Changes
- 2026-02-21: Initial import from GitHub, configured for Replit environment
  - Added server config to vite.config.ts (host, port, allowedHosts)
  - Installed react/react-dom as peer dependencies
  - Approved pnpm build scripts for @tailwindcss/oxide and esbuild
  - Created .gitignore
  - Set up deployment as static site
