/**
 * Second Vite build step for transpiling main and packaging into an extension
 */

import { defineConfig } from 'vite';
import path from 'path';
import { importManager } from 'rollup-plugin-import-manager';
import escapeStringRegexp from 'escape-string-regexp';
import { string as importString } from 'rollup-plugin-string';
import {
  paranextProvidedModules,
  webViewGlob,
  getWebViewTsxPaths,
  insertWebViewTempDir,
  webViewTempGlob,
  getFileExtensionByModuleFormat,
} from './vite.util';

// https://vitejs.dev/config/
const extensionConfig = defineConfig(async () => {
  /** List of TypeScript WebView files transpiled in the first build step */
  const tsxWebViews = await getWebViewTsxPaths();

  return {
    plugins: [
      // Shared with https://github.com/paranext/paranext-core/blob/main/vite/vite.config.ts
      // Redirect WebView imports to their version built in the first build step
      importManager({
        // Need to include all files that could import WebViews
        include: '**/*.{ts,tsx,js,jsx}',
        units: tsxWebViews.map((webView) => {
          const webViewInfo = path.parse(webView);
          // Get the file name without the extension if it is tsx as tsx is inferred when importing
          const webViewModuleName =
            webViewInfo.ext === '.tsx' ? webViewInfo.name : webViewInfo.base;
          return {
            module:
              // Match the whole module name, nothing more, nothing less
              new RegExp(`^${escapeStringRegexp(webViewModuleName)}$`),
            actions: {
              select: 'module',
              rename: insertWebViewTempDir,
            },
          };
        }),
      }),
      // Shared with https://github.com/paranext/paranext-core/blob/main/vite/vite.config.ts
      // Import web view files as strings to pass on the papi
      {
        ...importString({
          include: [webViewGlob, webViewTempGlob],
        }),
        // importString plugin must be after any other plugins that need to transpile these files
        enforce: 'post',
      },
    ],
    build: {
      // This project is a library as it is being used in Paranext
      lib: {
        // The main entry file of the extension
        entry: path.resolve(__dirname, '../lib/main.ts'),
        // The output file name for the extension (file extension is appended)
        fileName: (moduleFormat, entryName) =>
          `paratext-text-collection.${getFileExtensionByModuleFormat(moduleFormat)}`,
        // Output to cjs format as that's what Paranext supports
        formats: ['cjs'],
      },
      rollupOptions: {
        // Do not bundle papi because it will be imported in Paranext
        external: paranextProvidedModules,
        output: {
          // Disable code splitting and chunks. Extension main must be a single file
          manualChunks: () => 'main',
        },
      },
      // Generate sourcemaps as separate files since VSCode can load them directly
      sourcemap: true,
    },
  };
});

export default extensionConfig;
