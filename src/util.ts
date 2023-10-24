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

/**
 * Strips USFM markers out and such to transform USFM into plain text
 * @param usfm USFM string
 * @returns plain text string
 */
export function stripUSFM(usfm: string | undefined) {
  return usfm
    ?.replace(/\\x .*\\x\*/g, '')
    .replace(/\\f .*\\f\*/g, '')
    .replace(/\r?\n/g, ' ')
    .replace(/\\p\s+/g, '\n  ')
    .replace(/\\(?:id|h|toc\d|mt\d|c|ms\d|mr|s\d|q\d*)\s+/g, '\n')
    .replace(/\\\S+\s+/g, '')
    .trim();
}
