import { useProjectData } from 'papi-frontend/react';
import { VerseRef } from '@sillsdev/scripture';
import { Button } from 'papi-components';
import type { ProjectMetadata } from 'shared/models/project-metadata.model';

export type VerseDisplayProps = {
  projectId: string;
  projectMetadata: ProjectMetadata | undefined;
  selectProject: (projectId: string) => void;
  verseRef: VerseRef;
};

function VerseDisplay({ projectId, projectMetadata, selectProject, verseRef }: VerseDisplayProps) {
  const [usfm] = useProjectData('ParatextStandard', projectId).VerseUSFM(verseRef, 'Loading');
  return (
    <div className="row">
      <Button onClick={() => selectProject(projectId)}>{projectMetadata?.name || '...'}</Button>
      <p className="text">{usfm}</p>
    </div>
  );
}

export default VerseDisplay;
