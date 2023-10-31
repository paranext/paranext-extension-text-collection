import { VerseRef } from '@sillsdev/scripture';
import type { ProjectMetadata } from 'shared/models/project-metadata.model';

export function getTextCollectionTitle(
  projectsMetadata: (ProjectMetadata | undefined)[],
  verseRef: VerseRef,
) {
  if (!projectsMetadata || projectsMetadata.includes(undefined) || !verseRef) return undefined;

  // Type assert projectsMetadata as not containing undefined since we just checked for that
  return `${(projectsMetadata as ProjectMetadata[])
    .map((projectMetadata) => projectMetadata.name)
    .join(', ')}: ${verseRef.toString()} (Text Collection)`;
}
