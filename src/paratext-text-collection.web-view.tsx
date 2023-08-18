import papi from 'papi-frontend';
import { useEffect, useMemo, useState } from 'react';
import { UsfmProviderDataTypes } from 'usfm-data-provider';
import { Button, RefSelector, ScriptureReference } from 'papi-components';
import { VerseRef } from '@sillsdev/scripture';

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
  const [expandedResourceName, setExpandedResourceName] = useState<string | undefined>('');

  let ref: VerseRef = new VerseRef();
  ref.bookNum;

  const [resourceText] = useData.Verse<UsfmProviderDataTypes, 'Verse'>(
    'usfm',
    useMemo(() => {
      return new VerseRef(scrRef.bookNum, scrRef.chapterNum, scrRef.verseNum);
    }, [scrRef]),
    'Loading scripture...',
  );

  const [fullChapter] = useData.Chapter<UsfmProviderDataTypes, 'Chapter'>(
    'usfm',
    useMemo(() => {
      return new VerseRef(scrRef.bookNum, scrRef.chapterNum, scrRef.verseNum);
    }, [scrRef]),
    'Loading full chapter',
  );

  const projectData = useMemo(() => {
    let textCollectionArray: {
      resourceName: string;
      resourceText: string | undefined;
    }[] = [];

    for (let i = 0; i < 3; i++) {
      const resourceName: string = `PRJ${i}`;

      textCollectionArray.push({ resourceName, resourceText });
    }

    return textCollectionArray;
  }, [resourceText]);

  const titleBarText = useMemo(() => {
    let title = '';
    if (!projectData) return;

    projectData.forEach((resource, i) => {
      title += resource.resourceName;

      if (i !== projectData.length - 1) title += ', ';
      else title += ': ';
    });

    title += scrRef.bookNum + ' ' + scrRef.chapterNum + ':' + scrRef.verseNum + ' ';

    title += '(Text Collection)';

    return title;
  }, [scrRef, projectData]);

  const temporaryTitleBarElement = (
    <>
      <p>{titleBarText}</p>
      <p>
        <i>This text should go in the title bar of the panel</i>
      </p>
      <hr />
    </>
  );

  const verseView = (
    <div className="verse-view">
      {projectData &&
        projectData.length > 0 &&
        projectData.map((dummyDataElement, i) => {
          const isLastComponent = i === projectData.length - 1;

          return (
            <>
              <div className="row">
                <Button onClick={() => setExpandedResourceName(dummyDataElement.resourceName)}>
                  {dummyDataElement.resourceName}
                </Button>
                <p className="text">{dummyDataElement.resourceText}</p>
              </div>
              {!isLastComponent && <hr />}
            </>
          );
        })}
    </div>
  );

  const fullChapterView = () => (
    <div className="full-chapter-view">
      <div className="position-title">
        <p>{expandedResourceName}</p>
      </div>
      <div className="position-button">
        <Button
          onClick={() => {
            setExpandedResourceName('');
          }}
        >
          x
        </Button>
      </div>
      <p className="position-text">{fullChapter}</p>
    </div>
  );

  const showFullChapter = expandedResourceName && expandedResourceName.length > 0;

  const temporaryScriptureReferenceControl = (
    <>
      <hr />
      <RefSelector
        handleSubmit={(newScrRef) => {
          setScrRef(newScrRef);
        }}
        scrRef={scrRef as ScriptureReference}
      />
      <p>
        <i>This Scripture Reference Selector is used to simulate a 'global' verse reference.</i>
      </p>
    </>
  );

  return (
    <>
      {temporaryTitleBarElement}
      <div className="text-collection">
        {verseView}
        {showFullChapter && fullChapterView()}
      </div>
      {temporaryScriptureReferenceControl}
    </>
  );
};
