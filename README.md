# Portfolio 2026

New portfolio project for 2026, with en emphasis on accessibility, and eco-design.

## 🚀 Project Structure

Inside of your Astro project, you'll see the following folders and files:

```text
/
├── config/
│   ├── images-configs.ts
│   └── mdx-classes.ts
├── content/
│   ├── blog/
│   ├── contact.ts
│   ├── metadata.ts
│   ├── nav.ts
│   └── repos.json
├── public/
├── src/
│   ├── components/
│   ├── images/
│   ├── js/
│   ├── layouts/
│   ├── pages/
│   │   └── index.astro
│   ├── styles/
│   └── content.config.ts
├── svgs/
├── tools/
│   └── sprite.js
├── types/
├── utils/
│   └── helpers.ts
└── package.json
```

Astro looks for `.astro` or `.md` files in the `src/pages/` directory. Each page
is exposed as a route based on its file name.

All components should be stored in `src/components/` All layouts should be
stored in `src/layouts/`

There is a content folder to store blog content and global data in `content/`

Any static assets, like images, can be placed in the `public/` directory if you
don't want to transform them.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command                   | Action                                           |
| :------------------------ | :----------------------------------------------- |
| `npm install`             | Installs dependencies                            |
| `npm run dev`             | Starts local dev server at `localhost:4321`      |
| `npm run build`           | Build your production site to `./dist/`          |
| `npm run preview`         | Preview your build locally, before deploying     |
| `npm run astro ...`       | Run CLI commands like `astro add`, `astro check` |
| `npm run astro -- --help` | Get help using the Astro CLI                     |
| `npm run sprite`          | Generate sprite svg and css                      |
| `npm run lint:js`         | Lint JS with Eslint                              |
| `npm run lint:js`         | Lint CSS with Stylelint                          |

## Sources

- [Astro](https://astro.build/)
- [Mdx](https://mdxjs.com/)
- [Swup](https://swup.js.org/)
- [SASS](https://sass-lang.com/)
- [Rehype](https://github.com/rehypejs/rehype)
- [Prettier](https://prettier.io/)
- [Eslint](https://eslint.org/)
- [Stylelint](https://stylelint.io/)
- [Typescript](https://www.typescriptlang.org/)
- [Tailwind](https://tailwindcss.com/)
