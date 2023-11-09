import papi from 'papi-frontend';
import { useSetting, usePromise, useDialogCallback } from 'papi-frontend/react';
import { Fragment, useCallback, useEffect, useMemo } from 'react';
import { IconButton, ScriptureReference } from 'papi-components';
import { VerseRef } from '@sillsdev/scripture';
import type { WebViewProps } from 'shared/data/web-view.model';
import type { ProjectMetadata } from 'shared/models/project-metadata.model';
import { getTextCollectionTitle } from 'src/util';
import VerseDisplay from './components/verse-display.component';
import ChapterView from './components/chapter-view.component';

/** Transforms a ScriptureReference into a VerseRef */
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
  useWebViewState,
}: WebViewProps) {
  // Project IDs to show in the text collection
  const [projectIds, setProjectIds] = useWebViewState<string[]>('projectIds', []);

  // Project metadata to show in the text collection - each entry is the metadata or undefined if
  // not fetched yet
  const [projectsMetadata] = usePromise<(ProjectMetadata | undefined)[]>(
    useCallback(async () => {
      const metadataPromises = projectIds.map((projectId) =>
        papi.projectLookup.getMetadataForProject(projectId),
      );
      return Promise.all(metadataPromises);
    }, [projectIds]),
    useMemo(() => projectIds.map(() => undefined), [projectIds]),
  );

  // Project ID of the project that is focused or undefined if no project selected
  const [expandedProjectId, setExpandedProjectId] = useWebViewState<string>(
    'expandedProjectId',
    '',
  );

  // Reset the expanded project ID if it is no longer available as a choice
  useEffect(() => {
    if (!projectIds.includes(expandedProjectId)) setExpandedProjectId('');
  }, [projectIds, expandedProjectId, setExpandedProjectId]);

  // Current verse reference
  const [scrRef] = useSetting('platform.verseRef', defaultScrRef);
  const verseRef = useMemo(() => getResourceVerseRef(scrRef), [scrRef]);

  // Keep the title up-to-date
  useEffect(() => {
    const newTitle = getTextCollectionTitle(projectsMetadata, verseRef);
    if (newTitle) updateWebViewDefinition({ title: newTitle });
  }, [updateWebViewDefinition, projectsMetadata, verseRef]);

  const [selectedProjectIds, selectProjects] = useDialogCallback(
    'platform.selectMultipleProjects',
    useMemo(
      () => ({
        title: 'Select projects in Text Collection',
        prompt: 'Please select projects to show in the text collection:',
        selectedProjectIds: projectIds,
      }),
      [projectIds],
    ),
  );

  // Add the newly selected project ID
  useEffect(() => {
    if (selectedProjectIds && !papi.util.deepEqual(selectedProjectIds, projectIds))
      setProjectIds(selectedProjectIds);
  }, [projectIds, setProjectIds, selectedProjectIds]);

  const verseView = (
    <div className="verse-view">
      {projectIds.length > 0 &&
        projectIds.map((projectId, i) => {
          const isLastComponent = i === projectIds.length - 1;
          const projectMetadata = projectsMetadata.find((metadata) => metadata?.id === projectId);

          return (
            <Fragment key={projectId}>
              <VerseDisplay
                projectId={projectId}
                projectMetadata={projectMetadata}
                selectProject={setExpandedProjectId}
                verseRef={verseRef}
              />
              {!isLastComponent && <hr />}
            </Fragment>
          );
        })}
      <IconButton
        label="Select projects"
        size="medium"
        className="select-projects-button"
        onClick={selectProjects}
      >
        +
      </IconButton>
    </div>
  );

  const showFullChapter = expandedProjectId && expandedProjectId.length > 0;

  return (
    <div className="text-collection">
      {verseView}
      {showFullChapter && (
        <ChapterView
          projectId={expandedProjectId}
          projectMetadata={projectsMetadata.find((metadata) => metadata?.id === expandedProjectId)}
          closeView={() => setExpandedProjectId('')}
          verseRef={verseRef}
        />
      )}
    </div>
  );
};
