# Project Understanding: portfolio-2025

## Website Goal

This project is Romain Breton's new personal portfolio for 2026. The website
highlights projects, methodology, open-source repositories, and editorial
content, with a strong focus on:

- eco-design
- accessibility
- performance
- thoughtful interactive experiences

## Documentation Language Rule

All documentation must be written in English. If you need to create or update
documentation, always write it in English.

## Main Technologies

- Astro (SSG, file-based routing, content collections)
- TypeScript (strict configuration, path aliases)
- SCSS + Tailwind CSS v4
- MDX for editorial content
- Swup for page transitions
- Native WebGL2 (GLSL shaders loaded through Vite)
- Custom modular front-end system (modules + plugins + event bus)

## Project Architecture

### Global Structure

- `src/pages`: Astro routes
- `src/layouts`: global layouts (including JS bootstrap)
- `src/components`: Astro components (atoms/molecules/organisms)
- `src/js/classes`: core of the custom module system
- `src/js/modules`: feature/interaction modules, often lazy-loaded
- `src/js/shaders`: GLSL shaders
- `src/js/utils`: JS/TS utilities, including WebGL helpers
- `src/styles`: global and layered styles
- `content`: content data (JSON, TS, MDX)
- `config`: image and MDX configuration
- `public`: static assets (including generated SVG sprite)
- `tools`: utility scripts (for example sprite generation)

### Front-End Bootstrap

Initialization is done in `src/layouts/default.astro`:

1. import `ModulesManager` from `@js/classes/modular`
2. import module registry from `@js/modules/index`
3. instantiate with plugins (`ObserverPlugin`, `AnimationsPlugin`,
   `ResizePlugin`)

### Custom Module System

The system is based on:

- `src/js/classes/modular.ts`: central module manager
- `src/js/classes/module.ts`: base module class (lifecycle)
- `src/js/classes/modular-plugin.ts`: base plugin class
- `src/js/classes/event-bus.ts`: module/plugin communication

Key concepts:

- module discovery through `data-module-*` attributes
- lazy loading with `loader: () => import(...)`
- lifecycle: `onMount` -> `onRender`/events -> `onUnMount`
- communication through an event bus (`emit`, `on`, `call:*`)
- cross-cutting plugins:
  - intersection observer plugin
  - animation scheduler plugin
  - debounced global resize plugin

## WebGL and Shaders

- `src/js/modules/background.ts` creates and manages a WebGL2 canvas.
- Shaders are imported as raw source with `?raw`:
  - `vertex.glsl`
  - `noise-fragment.glsl`
  - `ascii-fragment.glsl`
- Rendering pipeline uses two passes:
  - noise rendering into an off-screen texture
  - ASCII post-process to the screen framebuffer
- Low-level WebGL helpers are centralized in `src/js/utils/webgl.ts` (program
  creation, fullscreen quads, render targets, uniforms, cleanup).

## Development Commands

From the project root:

- `npm install`: install dependencies
- `npm run dev`: start local Astro dev server with host exposure
- `npm run build`: Astro build for preprod space
- `npm run build:prod`: Astro build for main production space
- `npm run preview`: preview built output locally
- `npm run astro -- --help`: Astro CLI help
- `npm run sprite`: generate SVG sprite and related SCSS
- `npm run lint:js`: run ESLint on `src/js/**/*`
- `npm run lint:scss`: run Stylelint on `src/styles/**/*`

## SVG Sprite Usage

The sprite workflow is implemented in `tools/sprite.js` using `svg-sprite`.

### Input

- Source folder: `svgs/`
- Each file becomes a symbol named `icon-{fileName}`

### Output

- Symbol sprite: `public/images/svg/sprite.symbol.svg`
- CSS/sprite output directory: `public/images/svg/`
- Generated SCSS file: `src/styles/utils/_sprite.scss`

### Component Usage

`src/components/atoms/svg.astro` references symbols with:

`/images/svg/sprite.symbol.svg#icon-{icon}`

## Formatting and Quality Rules

### Prettier

Configured in `.prettierrc`:

- `tabWidth: 2`
- `semi: false`
- `trailingComma: all`
- Astro + Tailwind plugins (`prettier-plugin-astro`,
  `prettier-plugin-tailwindcss`)
- Astro override (`parser: astro`, `printWidth: 200`)

Recommended commands (no dedicated npm script yet):

- `npx prettier --check .`
- `npx prettier --write .`

### ESLint

Primary active configuration: `eslint.config.js` (flat config).

- Astro recommended base
- accessibility rules (`jsx-a11y`)
- TypeScript rules (`@typescript-eslint`)
- Markdown linting (`@eslint/markdown`)
- ignored directories: `node_modules`, `build`, `dist`, `public`

Project script:

- `npm run lint:js`

Note: `.eslintrc.cjs` is also present as a legacy strict config, but
`eslint.config.js` is the main reference.

### Stylelint

Configuration: `.stylelintrc.cjs`

- extends recommended + SCSS + HTML + Tailwind configs
- `stylelint-order` plugin
- custom CSS property ordering
- allows SCSS/Tailwind at-rules (`@use`, `@apply`, `@tailwind`, etc.)

Project script:

- `npm run lint:scss`

## Content Data Structure (`content/`)

### `content/projects.json`

Expected format: object with a `list` key containing an array of project
entries.

Entry schema:

- `id: string`
- `name: string`
- `title: string`
- `description: string`
- `url?: string (valid URL)`
- `tags: string[]`
- `role: string`
- `credits: string[]`
- `year: number`

### `content/repos.json`

Expected format: object with a `list` key containing an array of repository
entries.

Entry schema:

- `id: string`
- `name: string`
- `description: string`
- `url: string (valid URL)`
- `tags: string[]`

### `content/blog/*.mdx`

Astro `blog` collection.

Expected frontmatter:

- `title: string`
- `draft: boolean`
- `tags: string[]`
- `date: Date`
- `relative?: string`

### `content/text/*.mdx`

Astro `text` collection.

Expected frontmatter:

- `title: string`
- `seoTitle?: string`
- `ogTitle?: string`
- `seoDescription?: string`
- `ogDescription?: string`
- `draft: boolean`

### `content/contact.ts`

Default-exported plain object (currently contact email).

### `content/metadata.ts`

Global SEO/social metadata object, including:

- site name and environment-based URL (main/preprod)
- language/locale
- SEO/OG titles and descriptions
- OG image and robots directives
- Twitter card/site/creator
- theme color and extra meta tags

### `content/nav.ts`

Navigation configuration with:

- `header`
- `footerPrimary`
- `footerSecondary`
- `socials`

Each item contains at least `id`, `name`, and when relevant `url` (optional
`external`).

## Skills to Use

- **Website Backend / Frontend**: use the `astro` AND `frontend-design` AND
  `tailwind` skills
- **Code Review**: use the `code-reviewer` skill
- **Product Brainstorming**: use the `product-brainstorming` skill

---

## Code Review Standards

After completing any implementation, review the code for:

- functions longer than 30 lines (likely doing too much)
- logic duplicated more than twice (extract to a utility)
- any `any` type usage in TypeScript (replace with concrete types)
- components with more than 3 props that could be grouped into an object
- missing error handling on async operations

Run `/simplify` before presenting code to the user.
