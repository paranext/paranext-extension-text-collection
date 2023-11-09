import { useProjectData } from 'papi-frontend/react';
import { VerseRef } from '@sillsdev/scripture';
import { Button } from 'papi-components';
import type { ProjectMetadata } from 'shared/models/project-metadata.model';
import type { ProjectDataTypes } from 'papi-shared-types';

export type ChapterViewProps = {
  projectId: string;
  projectMetadata: ProjectMetadata | undefined;
  closeView: () => void;
  verseRef: VerseRef;
};

function ChapterView({ projectId, projectMetadata, closeView, verseRef }: ChapterViewProps) {
  const [usfm] = useProjectData.ChapterUSFM<ProjectDataTypes['ParatextStandard'], 'ChapterUSFM'>(
    projectId,
    verseRef,
    'Loading',
  );
  return (
    <div className="full-chapter-view">
      <div className="position-title">
        <p>{projectMetadata?.name || '...'}</p>
      </div>
      <div className="position-button">
        <Button onClick={closeView}>x</Button>
      </div>
      <p className="position-text">{usfm}</p>
    </div>
  );
}

export default ChapterView;
