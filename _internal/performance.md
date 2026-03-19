# Performance Optimization Plan

**Baseline (Mar 19, 2026 - Lighthouse 13, Moto G Power, Slow 4G)**

| Metric | Current | Target | Weight |
|--------|---------|--------|--------|
| FCP | 3.7s | < 1.8s | 10% |
| LCP | 5.3s | < 2.5s | 25% |
| TBT | 9,090ms | < 200ms | 30% |
| CLS | 0 | 0 | 25% |
| SI | 5.9s | < 3.4s | 10% |
| **Score** | **~15** | **90+** | |

**LCP element (before):** `div#globeCanvas` (WebGL canvas, JS-rendered)
**LCP element (after):** Hero heading text (renders immediately from HTML on mobile)
**Main thread "Other" (before):** 38,934ms (Globe WebGL + acsbapp overlay)

---

## Completed Changes

### Phase 1: Critical Blockers (TBT + LCP)

#### 1.1 - [x] Globe: LCP fix via mobile skip
Instead of a static placeholder image, we eliminated the Globe entirely on mobile via `client:media`. On mobile (where Lighthouse tests), the hero heading text is now the LCP element, which renders instantly from HTML. The existing CSS `::before` pseudo-element with globe.svg provides a visual placeholder.

**Expected impact:** LCP drops from 5.3s to ~1.5s on mobile

#### 1.2 - [x] Globe: skip WebGL on mobile
Changed `client:visible` to `client:media="(min-width: 768px)"`. Globe JS, React, cobe, and react-spring are never downloaded on mobile.

**File:** `src/pages/index.astro:62`
**Expected impact:** TBT drops by 5,000-30,000ms on mobile

#### 1.3 - [x] Globe: reduce rendering cost
- `devicePixelRatio: 2` -> `Math.min(window.devicePixelRatio || 1, 1.5)`
- `mapSamples: 33000` -> `mapSamples: 16000`

**File:** `src/layouts/helpers/Globe.tsx`
**Expected impact:** TBT -2,000ms+ on desktop

#### 1.4 - [x] Defer accessibility overlay (acsbapp.com)
Replaced immediate async load with interaction-triggered loading. The 211.9 KiB script now only downloads after first scroll, click, keydown, or touchstart.

**File:** `src/layouts/Base.astro` (bottom of body, `is:inline`)
**Expected impact:** TBT -3,000ms+

#### 1.5 - [x] Defer Lemlist tracking script
Removed synchronous `<script>` from `<head>`. Now loads via `requestIdleCallback` (fallback: `setTimeout` 3s) at bottom of body.

**File:** `src/layouts/Base.astro` (bottom of body, `is:inline`)
**Expected impact:** FCP -780ms

### Phase 2: Render-Blocking Resources (FCP + SI)

#### 2.1 - [x] Remove unused Swiper
- Removed `import "swiper/css"` from `Base.astro` (was loading on every page)
- Removed hidden brand slider section from `index.astro`
- Removed Swiper script initialization from `index.astro`
- Removed `swiper` safelist pattern from `tailwind.config.js`

**Expected impact:** -21 KiB JS, reduced CSS bundle

#### 2.2 - [x] Preload primary font
Changed primary font `preload: false` to `preload: true` in AstroFont config.

**File:** `src/layouts/Base.astro:74`
**Expected impact:** FCP -200ms

#### 2.3 - [x] Add preconnect hints
Added preconnect for `fonts.googleapis.com` and `fonts.gstatic.com` (crossorigin) at top of `<head>`.

**File:** `src/layouts/Base.astro:50-52`
**Expected impact:** FCP -100ms

### Phase 3: JavaScript Reduction (TBT)

#### 3.1 - [x] Convert NavDropDown from React to Astro + vanilla JS
Rewrote as `NavDropDown.astro` with a small inline script for mobile toggle. Desktop hover remains CSS-only. Eliminates React from the critical rendering path (NavDropDown was the only `client:load` component on most pages).

**Files:** `src/layouts/partials/NavDropDown.astro` (new), `src/layouts/partials/Header.astro`
**Expected impact:** -10 KiB JS, eliminates React hydration from header

#### 3.2 - [x] Dynamic import + defer AOS initialization
Changed from static `import AOS from "aos"` to `import("aos")` (dynamic import). Wrapped init in `requestIdleCallback`. AOS JS chunk is now a separate file only downloaded when the browser is idle.

**File:** `src/layouts/Base.astro`
**Expected impact:** -5.88 KiB from initial JS, TBT -50ms

#### 3.3 - [x] Remove console.log from homepage
Removed `console.log(testimonial.data)` from `index.astro`.

**File:** `src/pages/index.astro`

### Phase 4: Image Optimization (LCP + SI)

#### 4.1 - [x] Convert service PNGs to WebP
Converted all 3 images using Sharp:
- `assurance.png`: 54 KB -> 12 KB (78% smaller)
- `customer.png`: 54 KB -> 11 KB (80% smaller)
- `risk.png`: 51 KB -> 11 KB (79% smaller)

Updated frontmatter references in `src/content/homepage/-index.md`.
**Total savings:** 125 KiB

#### 4.2 - [x] Fix service image dimensions + lazy loading
Set `width={259} height={302}` and added `loading="lazy"` to service images in ServiceSlider.

**File:** `src/layouts/components/homepage/ServiceSlider.tsx`

### Phase 5: CSS Optimization

#### 5.1 - [x] CSS audit
`prototype.scss` was already page-scoped (only chat layouts). Swiper safelist removed from Tailwind config. CSS bundle went from 3 files (32.8 KiB gzip) to 2 files (26.6 KiB gzip).

#### 5.2 - [x] AOS CSS scope
AOS is used across 35+ files, so keeping it global is correct. The CSS stays in the main bundle (needed for initial `[data-aos]` element styling to prevent FOUC). Only the JS is dynamically loaded.

### Bonus: ServiceSlider bundle fix

#### [x] Replace DynamicIcon wildcard import with specific icons
`DynamicIcon` used `import * as FaIcons from "react-icons/fa6"` which bundled ALL 2000+ FA6 icons. Replaced with specific imports of the 3 icons used: `FaAsterisk`, `FaHandHoldingHeart`, `FaExpand`.

**File:** `src/layouts/components/homepage/ServiceSlider.tsx`
**Impact:** ServiceSlider bundle: **1,613 KiB -> 3.95 KiB** (99.8% reduction!)

#### [x] ServiceSlider deferred to scroll
Changed from `client:idle` to `client:visible`. ServiceSlider + React runtime only loads when the feature section scrolls into view.

**File:** `src/pages/index.astro`

---

## Build Results Comparison

### JS loaded on homepage (mobile)

| Before | After |
|--------|-------|
| NavDropDown.js (1.77 KiB) | Eliminated (Astro component) |
| jsx-runtime.js (1.74 KiB) | Deferred (client:visible) |
| client.js (2.05 KiB) | Deferred (client:visible) |
| index.js (React, 3.92 KiB) | Deferred (client:visible) |
| index.js (React-DOM, 44.36 KiB) | Deferred (client:visible) |
| Globe.js (23.53 KiB) | Eliminated (client:media desktop only) |
| ServiceSlider.js (1,613 KiB!) | 3.95 KiB + deferred (client:visible) |
| hoisted.js (23.70 KiB, Swiper) | Eliminated |
| aos.esm.js (5.88 KiB) | Dynamic import on idle |
| acsbapp.com/app.js (211.9 KiB) | Deferred to interaction |
| Lemlist tracking (1.6 KiB) | Deferred to idle |
| **Total initial JS: ~1,933 KiB** | **Total initial JS: ~2.12 KiB** |

### CSS loaded on homepage

| Before | After |
|--------|-------|
| 3 render-blocking files (32.8 KiB gzip) | 2 render-blocking files (26.6 KiB gzip) |

### Images on homepage

| Before | After |
|--------|-------|
| 3 PNGs (159 KiB) | 3 WebPs (34 KiB) + lazy loaded |

---

## Validation

Deploy and test with:
- [PageSpeed Insights](https://pagespeed.web.dev/) (production URL, mobile preset)
- Chrome DevTools Lighthouse (mobile preset, simulated throttling)
- Compare all 5 metrics against baseline table above
