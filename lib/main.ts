import papi from "papi-backend";
// @ts-expect-error ts(1192) this file has no default export; the text is exported by rollup
import textCollectionReact from "./paratext-text-collection.web-view";
import textCollectionReactStyles from "./paratext-text-collection.web-view.scss?inline";
import type {
	SavedWebViewDefinition,
	WebViewDefinition,
} from "shared/data/web-view.model";
import { ExecutionActivationContext } from "extension-host/extension-types/extension-activation-context.model";
import { UnsubscriberAsync } from "shared/utils/papi-util";
import type { IWebViewProvider } from "shared/models/web-view-provider.model";

const {
	logger,
	dataProvider: { DataProviderEngine },
} = papi;

console.log(import.meta.env.PROD);

logger.info("Text collection extension is importing!");

const reactWebViewType = "paratext-text-collection.react";

/**
 * Simple web view provider that provides React web views when papi requests them
 */
const reactWebViewProvider: IWebViewProvider = {
	async getWebView(
		savedWebView: SavedWebViewDefinition
	): Promise<WebViewDefinition | undefined> {
		if (savedWebView.webViewType !== reactWebViewType)
			throw new Error(
				`${reactWebViewType} provider received request to provide a ${savedWebView.webViewType} web view`
			);
		return {
			...savedWebView,
			title: "Text Collection",
			content: textCollectionReact,
			styles: textCollectionReactStyles,
		};
	},
};

export async function activate(context: ExecutionActivationContext) {
	logger.info("Text collection extension is activating!");

	const reactWebViewProviderPromise = papi.webViewProviders.register(
		reactWebViewType,
		reactWebViewProvider
	);

	const unsubPromises = [
		papi.commands.registerCommand(
			"paratext-text-collection.do-stuff",
			(message: string) => {
				return `Text collection: ${message}`;
			}
		),
	];

	// Create webviews or get an existing webview if one already exists for this type
	// Note: here, we are using `existingId: '?'` to indicate we do not want to create a new webview
	// if one already exists. The webview that already exists could have been created by anyone
	// anywhere; it just has to match `webViewType`. See `paranext-core's hello-someone.ts` for an example of keeping
	// an existing webview that was specifically created by `paranext-core's hello-someone`.
	papi.webViews.getWebView(reactWebViewType, undefined, { existingId: "?" });

	// For now, let's just make things easy and await the data provider promise at the end so we don't hold everything else up
	const reactWebViewProviderResolved = await reactWebViewProviderPromise;

	const combinedUnsubscriber: UnsubscriberAsync =
		papi.util.aggregateUnsubscriberAsyncs(
			(await Promise.all(unsubPromises)).concat([
				reactWebViewProviderResolved.dispose,
			])
		);
	logger.info("Text collection extension is finished activating!");
	return combinedUnsubscriber;
}

export async function deactivate() {
	logger.info("Text collection extension is deactivating!");
}
