// @ts-check
import { defineConfig } from "astro/config";
import tailwindcss from "@tailwindcss/vite";

import criticalCss from "astro-critical-css";

import mdx from "@astrojs/mdx";

// https://astro.build/config
export default defineConfig({
  output: "static",
  vite: {
    plugins: [tailwindcss()],
    build: {
      cssCodeSplit: false,
      // rollupOptions: {
      //   output: {
      //     // entryFileNames: 'scripts/[name].js',
      //     // chunkFileNames: 'chunks/[name].js',
      //     assetFileNames: 'assets/[name][extname]'
      //   }
      // }
    }
  },

  build: {
    inlineStylesheets: 'never'
  },

  integrations: [
    // criticalCss({
    //   // silent: true,
    //   // htmlPathRegex: "**/test.html",
    //   height: 1080,
    //   width: 1920,
    // }),
    mdx(),
  ],
});
