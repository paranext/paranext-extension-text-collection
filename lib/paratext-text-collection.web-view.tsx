import papi from "papi-frontend";
import { useMemo, useState } from "react";
import { UsfmProviderDataTypes } from "extension-types";
import { RefSelector, ScriptureReference } from "papi-components";

const {
	react: {
		hooks: { useData },
	},
} = papi;

globalThis.webViewComponent = function () {
	const [scrRef, setScrRef] = useState<ScriptureReference>({
		bookNum: 1,
		chapterNum: 1,
		verseNum: 1,
	});

	const [resourceTextOne] = useData.Verse<UsfmProviderDataTypes, "Verse">(
		"usfm",
		useMemo(
			() => ({
				_bookNum: scrRef.bookNum,
				_chapterNum: scrRef.chapterNum,
				_verseNum: scrRef.verseNum,
			}),
			[scrRef]
		),
		"Loading scripture..."
	);

	const [resourceTextTwo] = useData.Verse<UsfmProviderDataTypes, "Verse">(
		"usfm",
		useMemo(
			() => ({
				_bookNum: scrRef.bookNum + 1,
				_chapterNum: scrRef.chapterNum + 1,
				_verseNum: scrRef.verseNum + 1,
			}),
			[scrRef]
		),
		"Loading John 1:1..."
	);

	const resourceNameOne = (
		<i>Resource name, that we have to get from somewhere. </i>
	);
	const resourceNameTwo = (
		<i>Resource name, that we have to get from somewhere. </i>
	);

	return (
		<>
			<div>
				{resourceNameOne}
				{resourceTextOne}
			</div>
			<div>---------------------- Some divider ---------------------</div>

			<div>
				{resourceNameTwo}
				{resourceTextTwo}
			</div>
			<div>---------------------- Some divider ---------------------</div>
			<div>
				<p>
					As long as no global verseRef is available, use this reference
					selector to simulate the global verseRef
				</p>
			</div>
			<div>
				<RefSelector
					handleSubmit={(newScrRef) => {
						setScrRef(newScrRef);
					}}
					scrRef={scrRef as ScriptureReference}
				/>
			</div>
		</>
	);
};
