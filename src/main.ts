import papi from 'papi-backend';
import textCollectionReact from './paratext-text-collection.web-view?inline';
import textCollectionReactStyles from './paratext-text-collection.web-view.scss?inline';
import type { SavedWebViewDefinition, WebViewDefinition } from 'shared/data/web-view.model';
import { ExecutionActivationContext } from 'extension-host/extension-types/extension-activation-context.model';
import type { IWebViewProvider } from 'shared/models/web-view-provider.model';

const {
  logger,
  dataProvider: { DataProviderEngine },
} = papi;

console.log(process.env.NODE_ENV);

logger.info('Text collection extension is importing!');

const reactWebViewType = 'paratextTextCollection.react';

/**
 * Simple web view provider that provides React web views when papi requests them
 */
const reactWebViewProvider: IWebViewProvider = {
  async getWebView(savedWebView: SavedWebViewDefinition): Promise<WebViewDefinition | undefined> {
    if (savedWebView.webViewType !== reactWebViewType)
      throw new Error(
        `${reactWebViewType} provider received request to provide a ${savedWebView.webViewType} web view`,
      );
    return {
      ...savedWebView,
      title: 'Text Collection',
      content: textCollectionReact,
      styles: textCollectionReactStyles,
    };
  },
};

export async function activate(context: ExecutionActivationContext) {
  logger.info('Text collection extension is activating!');

  const reactWebViewProviderPromise = papi.webViewProviders.register(
    reactWebViewType,
    reactWebViewProvider,
  );

  // Create WebViews or get an existing WebView if one already exists for this type
  // Note: here, we are using `existingId: '?'` to indicate we do not want to create a new WebView
  // if one already exists. The WebView that already exists could have been created by anyone
  // anywhere; it just has to match `webViewType`. See `paranext-core's hello-someone.ts` for an
  // example of keeping an existing WebView that was specifically created by
  // `paranext-core's hello-someone`.
  papi.webViews.getWebView(reactWebViewType, undefined, { existingId: '?' });

  // Await the data provider promise at the end so we don't hold everything else up
  context.registrations.add(await reactWebViewProviderPromise);

  logger.info('Text collection extension is finished activating!');
}

export async function deactivate() {
  logger.info('Text collection extension is deactivating!');
}
