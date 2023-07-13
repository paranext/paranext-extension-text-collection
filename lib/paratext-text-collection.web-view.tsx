import papi from "papi-frontend";
import { useEffect, useMemo, useState } from "react";
import { UsfmProviderDataTypes } from "extension-types";
import { Button, RefSelector, ScriptureReference } from "papi-components";

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
	const [dummyData, setDummyData] =
		useState<{ resourceName: string; resourceText: string | undefined }[]>();
	const [expandedResourceName, setExpandedResourceName] = useState<
		string | undefined
	>("");
	const [titleBarText, setTitleBarText] = useState("");

	const [resourceText] = useData.Verse<UsfmProviderDataTypes, "Verse">(
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

	const [fullChapter] = useData.Chapter<UsfmProviderDataTypes, "Chapter">(
		"usfm",
		useMemo(
			() => ({
				_bookNum: scrRef.bookNum,
				_chapterNum: scrRef.chapterNum,
				_verseNum: 1,
			}),
			[scrRef]
		),
		"Loading full chapter"
	);

	useEffect(() => {
		let dummyArray: {
			resourceName: string;
			resourceText: string | undefined;
		}[] = [];

		for (let i = 0; i < 3; i++) {
			const resourceName: string = `PRJ${i}`;

			dummyArray.push({ resourceName, resourceText });
		}

		setDummyData(dummyArray);
	}, [resourceText]);

	useEffect(() => {
		let title = "";
		if (!dummyData) return;

		dummyData.forEach((resource, i) => {
			title += resource.resourceName;

			if (i !== dummyData.length - 1) title += ", ";
			else title += ": ";
		});

		title +=
			scrRef.bookNum + " " + scrRef.chapterNum + ":" + scrRef.verseNum + " ";

		title += "(Text Collection)";

		setTitleBarText(title);
	}, [scrRef, dummyData]);

	const temporaryTitleBarElement = (
		<>
			<p>{titleBarText}</p>
			<p style={{ borderBottom: "3px solid black" }}>
				<i>This text should go in the title bar of the panel</i>
			</p>
		</>
	);

	const verseView = (
		<div
			style={{
				flex: 1,
				paddingRight: "10px",
			}}
		>
			{dummyData &&
				dummyData.length > 0 &&
				dummyData.map((dummyDataElement, i) => {
					const isLastComponent = i === dummyData.length - 1;
					const borderBottomStyle = isLastComponent
						? "none"
						: "1px solid black";

					return (
						<div
							style={{
								display: "flex",
								alignItems: "center",
								borderBottom: borderBottomStyle,
							}}
						>
							<Button
								onClick={() =>
									setExpandedResourceName(dummyDataElement.resourceName)
								}
							>
								{dummyDataElement.resourceName}
							</Button>
							<p style={{ marginLeft: "10px" }}>
								{dummyDataElement.resourceText}
							</p>
						</div>
					);
				})}
		</div>
	);

	const fullChapterView = (
		<div
			style={{
				flex: 1,
				borderLeft: "1px solid black",
				paddingLeft: "10px",
				position: "relative",
			}}
		>
			<div
				style={{
					position: "absolute",
					top: 0,
					right: 0,
					zIndex: 1,
					background: "none",
					border: "none",
					padding: 0,
					margin: "5px",
					cursor: "pointer",
				}}
			>
				<Button
					onClick={() => {
						setExpandedResourceName("");
					}}
				>
					x
				</Button>
			</div>
			<p>{fullChapter}</p>
		</div>
	);

	const showFullChapter =
		expandedResourceName && expandedResourceName.length > 0;

	const temporaryScriptureReferenceControl = (
		<div style={{ paddingTop: 20, borderTop: "3px solid black" }}>
			<RefSelector
				handleSubmit={(newScrRef) => {
					setScrRef(newScrRef);
				}}
				scrRef={scrRef as ScriptureReference}
			/>
			<p>
				<i>
					This Scripture Reference Selector is used to simulate a 'global' verse
					reference.
				</i>
			</p>
		</div>
	);

	return (
		<>
			{temporaryTitleBarElement}
			<div style={{ display: "flex" }}>
				{verseView}
				{showFullChapter && fullChapterView}
			</div>
			{temporaryScriptureReferenceControl}
		</>
	);
};
