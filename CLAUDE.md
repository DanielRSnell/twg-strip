# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ThisWay Global corporate website built with Astro 4.16.8, React, TypeScript, and Tailwind CSS. Uses Astro Content Collections for type-safe content management with support for multiple content types (posts, videos, audio, press releases).

## Development Commands

```bash
# Development server with hot reloading
yarn dev

# Production build (runs type checking and optimization)
yarn build

# Preview production build locally
yarn preview

# Format code with Prettier
yarn format
```

## Architecture

### Content Collections System
Content is managed through Astro Content Collections in `/src/content/`:
- `blog` - Articles, videos, audio, press releases (types: `post`, `video`, `audio`, `press`)
- `about` - Company info and team data (includes CSV parsing)
- `awards` - Company recognition
- `career` - Job listings
- `homepage` - Homepage sections
- `faq`, `testimonials`, `partners`, `sections` - Page content

### Component Architecture
- **Base Components**: `/src/components/` - Reusable UI elements
- **Layout Components**: `/src/layouts/components/` - Complex layout-specific components  
- **Shortcodes**: `/src/layouts/shortcodes/` - Auto-imported content embeds (Button, Accordion, Notice, Video, Youtube, Tabs)
- **Helpers**: `/src/layouts/helpers/` - Utility components (Globe, Disqus, CustomAccordion)
- **Partials**: `/src/layouts/partials/` - Page sections (Header, Footer, CallToAction)

### Styling System
- **Tailwind CSS** with custom configuration
- **SCSS** files in `/src/styles/` for complex styling
- **Theme system** via `/src/config/theme.json` (colors, fonts, responsive scaling)
- **Bootstrap grid** integration with `tailwind-bootstrap-grid`

### Path Aliases
```typescript
"@/components/*" → "./src/layouts/components/*"
"@/shortcodes/*" → "./src/layouts/shortcodes/*" 
"@/helpers/*" → "./src/layouts/helpers/*"
"@/partials/*" → "./src/layouts/partials/*"
"@/base/*" → "./src/components/*"
"@/*" → "./src/*"
```

## Configuration Files

- `/src/config/config.json` - Site metadata, navigation, contact settings
- `/src/config/theme.json` - Color system, typography, responsive settings
- `/src/config/menu.json` - Navigation structure
- `/src/config/team.json` - Team member data
- `/src/config/media.json`, `/src/config/press.json` - Content configuration

## Content Management

### Blog Content Types
When working with blog content, use the `content_type` field:
- `post` - Standard articles
- `video` - Video content with YouTube embeds
- `audio` - Audio content with playback
- `press` - Press releases

### Adding Content
1. Create `.md` or `.mdx` files in appropriate `/src/content/` subdirectory
2. Follow existing schema patterns (check `/src/content/types/` for TypeScript definitions)
3. Use front-matter for metadata (title, description, date, content_type, etc.)

## Special Features

### Interactive Components
- **3D Globe**: Cobe-powered globe component in layouts/helpers/Globe.tsx
- **Chat Systems**: Multiple chat implementations in `/src/pages/chat/`
- **Animations**: AOS scroll animations, Framer Motion, React Spring
- **Sliders**: Swiper-based carousels

### Image Handling
- Use `ImageMod.astro` component for optimized images with WebP support
- Sharp integration for automatic image optimization
- Place images in `/public/images/` directory

### Deployment
- **Primary**: Netlify (configured via `netlify.toml`)
- **Alternative**: Docker with Nginx (`Dockerfile` and `nginx.conf`)
- **CMS**: CloudCannon integration available

## Development Notes

- TypeScript strict mode enabled
- Auto-imports configured for shortcode components
- ESLint and Prettier configured for code quality
- Uses Yarn 1.22.22 as package manager
- RSS feed and sitemap automatically generated on build