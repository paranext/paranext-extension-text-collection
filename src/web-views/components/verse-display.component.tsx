import { useProjectData } from 'papi-frontend/react';
import { VerseRef } from '@sillsdev/scripture';
import type { ProjectMetadata } from 'shared/models/project-metadata.model';

import { Tooltip, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import {
  HighlightOff,
  RestartAlt,
  ZoomIn,
  ZoomOut,
  VerticalAlignTop,
  VerticalAlignBottom,
} from '@mui/icons-material';
import { useState, MouseEvent } from 'react';
import type { UseWebViewStateHook } from 'shared/models/web-view.model';

const defaultFontSize: number = 16;

export type VerseDisplayProps = {
  projectId: string;
  projectMetadata: ProjectMetadata | undefined;
  selectedProjectId: string;
  selectProjectId: (projectId: string) => void;
  verseRef: VerseRef;
  isFirstProject: boolean;
  isLastProject: boolean;
  onMoveUpDown: (directionUp: boolean, projectId: string) => void;
  onCloseProject: (projectId: string) => void;
  isSelected: boolean;
  useWebViewState: UseWebViewStateHook;
};

function VerseDisplay({
  projectId,
  projectMetadata,
  selectedProjectId,
  selectProjectId,
  verseRef,
  isFirstProject,
  isLastProject,
  onMoveUpDown,
  onCloseProject,
  isSelected,
  useWebViewState,
}: VerseDisplayProps) {
  const [usfm] = useProjectData('ParatextStandard', projectId).VerseUSFM(verseRef, 'Loading');
  const [fontSize, setFontSize] = useWebViewState<number>(`fontSize_${projectId}`, defaultFontSize);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  const open = Boolean(anchorEl);

  const clickHandler = () => {
    selectProjectId(selectedProjectId !== projectId || selectedProjectId === '' ? projectId : '');
  };

  return (
    <div
      onClick={clickHandler}
      className={isSelected ? 'selected' : ''}
      style={{ cursor: 'pointer' }}
      aria-hidden="true"
    >
      <div className="row">
        <div className="title">{projectMetadata?.name || '...'}</div>
        <div>
          <Tooltip title="More Actions">
            <IconButton onClick={handleClick} size="small" sx={{ ml: 2 }}>
              ...
            </IconButton>
          </Tooltip>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <MenuItem onClick={() => onCloseProject(projectId)}>
              <HighlightOff /> Close Text
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setFontSize(fontSize + 1);
              }}
            >
              <ZoomIn /> Zoom in
            </MenuItem>
            <MenuItem
              onClick={() => {
                setFontSize(fontSize - 1);
              }}
            >
              <ZoomOut /> Zoom out
            </MenuItem>
            <MenuItem
              onClick={() => {
                setFontSize(defaultFontSize);
              }}
              disabled={fontSize === defaultFontSize}
            >
              <RestartAlt /> Zoom Reset
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                onMoveUpDown(true, projectId);
              }}
              disabled={isFirstProject}
            >
              <VerticalAlignTop /> Move Up
            </MenuItem>
            <MenuItem
              onClick={() => {
                onMoveUpDown(false, projectId);
              }}
              disabled={isLastProject}
            >
              <VerticalAlignBottom /> Move Down
            </MenuItem>
          </Menu>
        </div>
      </div>
      <p className="text" style={{ fontSize }}>
        {usfm}
      </p>
    </div>
  );
}

export default VerseDisplay;
