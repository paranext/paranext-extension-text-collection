import papi from 'papi-frontend';
import { useEffect, useMemo, useState } from 'react';
import type { UsfmProviderDataTypes } from 'usfm-data-provider';
import { Button, ScriptureReference } from 'papi-components';
import { VerseRef } from '@sillsdev/scripture';
import type { WebViewProps } from 'shared/data/web-view.model';

const {
  react: {
    hooks: { useData, useSetting },
  },
} = papi;

const getResourceVerseRef = (scrRef: ScriptureReference) => {
  let resourceVerseRef: VerseRef;
  if (scrRef) {
    resourceVerseRef = new VerseRef(scrRef.bookNum, scrRef.chapterNum, scrRef.verseNum);
  } else {
    resourceVerseRef = new VerseRef(1, 1, 1);
  }
  return resourceVerseRef;
};

const defaultScrRef: ScriptureReference = { bookNum: 1, chapterNum: 1, verseNum: 1 };

globalThis.webViewComponent = function TextCollectionWebView({
  updateWebViewDefinition,
}: WebViewProps) {
  const [expandedResourceName, setExpandedResourceName] = useState<string | undefined>('');
  const [scrRef] = useSetting('platform.verseRef', defaultScrRef);
  const verseRef = useMemo(() => getResourceVerseRef(scrRef), [scrRef]);

  const [resourceText] = useData.Verse<UsfmProviderDataTypes, 'Verse'>(
    'usfm',
    verseRef,
    'Loading scripture...',
  );

  const [fullChapter] = useData.Chapter<UsfmProviderDataTypes, 'Chapter'>(
    'usfm',
    verseRef,
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

  // Keep the title up-to-date
  useEffect(() => {
    let title = '';
    if (!projectData || !verseRef) return;

    projectData.forEach((resource, i) => {
      title += resource.resourceName;

      if (i !== projectData.length - 1) title += ', ';
      else title += ': ';
    });

    title += verseRef.toString();

    title += ' (Text Collection)';

    updateWebViewDefinition({ title });
  }, [updateWebViewDefinition, verseRef, projectData]);

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

  return (
    <div className="text-collection">
      {verseView}
      {showFullChapter && fullChapterView()}
    </div>
  );
};
