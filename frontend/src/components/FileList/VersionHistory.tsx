/**
 * Version History Component
 *
 * Expandable version history for versioned file categories (map/cad/roi)
 * Shows latest version prominently with collapsible older versions
 */

import React, { useState } from 'react';
import {
  TableRow,
  TableCell,
  IconButton,
  Collapse,
  Box,
  Chip,
  Typography,
  Table,
  TableBody,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import DownloadIcon from '@mui/icons-material/Download';
import GetAppIcon from '@mui/icons-material/GetApp';
import { FileInfo } from '../../models/FileStorage';
import { FileStorageService } from '../../services/FileStorageService';

interface VersionHistoryProps {
  originalName: string;
  files: FileInfo[];
  onDownload: (filename: string, originalName: string) => void;
  onDownloadLatest: (originalName: string) => void;
}

/**
 * VersionHistory Component
 *
 * Features:
 * - Shows latest version prominently with "최신" badge
 * - Expandable list of older versions
 * - Download button for each version
 * - Special "Download Latest" button for convenience
 */
export const VersionHistory: React.FC<VersionHistoryProps> = ({
  originalName,
  files,
  onDownload,
  onDownloadLatest,
}) => {
  const [expanded, setExpanded] = useState(false);

  const latestFile = files[0]; // Files already sorted by version desc
  const olderVersions = files.slice(1);
  const hasOlderVersions = olderVersions.length > 0;

  return (
    <>
      {/* Latest Version Row */}
      <TableRow
        hover
        sx={{
          '& > *': { borderBottom: expanded ? 'none' : undefined },
          backgroundColor: expanded ? '#f5f5f5' : undefined,
        }}
      >
        <TableCell>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {hasOlderVersions && (
              <IconButton
                size="small"
                onClick={() => setExpanded(!expanded)}
                sx={{ padding: 0.5 }}
              >
                {expanded ? (
                  <ExpandLessIcon fontSize="small" />
                ) : (
                  <ExpandMoreIcon fontSize="small" />
                )}
              </IconButton>
            )}
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {originalName}
            </Typography>
            <Chip label="최신" size="small" color="primary" />
            {hasOlderVersions && (
              <Chip
                label={`${files.length}개 버전`}
                size="small"
                variant="outlined"
                sx={{ fontSize: '0.7rem' }}
              />
            )}
          </Box>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {FileStorageService.formatFileSize(latestFile.size_bytes)}
          </Typography>
        </TableCell>
        <TableCell>
          <Typography variant="body2">
            {FileStorageService.formatDate(latestFile.upload_date)}
          </Typography>
        </TableCell>
        <TableCell>
          <Chip
            label={`v${latestFile.version.slice(-8)}`}
            size="small"
            color="primary"
          />
        </TableCell>
        <TableCell align="center">
          <IconButton
            size="small"
            color="primary"
            onClick={() => onDownloadLatest(originalName)}
            title="최신 버전 다운로드"
          >
            <GetAppIcon />
          </IconButton>
        </TableCell>
      </TableRow>

      {/* Older Versions (Collapsible) */}
      {hasOlderVersions && (
        <TableRow>
          <TableCell
            colSpan={5}
            sx={{
              py: 0,
              borderBottom: expanded ? undefined : 'none',
              backgroundColor: '#fafafa',
            }}
          >
            <Collapse in={expanded} timeout="auto" unmountOnExit>
              <Box sx={{ py: 2, px: 4 }}>
                <Typography
                  variant="subtitle2"
                  color="text.secondary"
                  gutterBottom
                  sx={{ mb: 1 }}
                >
                  이전 버전 ({olderVersions.length}개)
                </Typography>

                <Table size="small">
                  <TableBody>
                    {olderVersions.map((file, index) => (
                      <TableRow
                        key={file.filename}
                        hover
                        sx={{
                          '&:last-child td': { borderBottom: 0 },
                        }}
                      >
                        <TableCell width="40%">
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Chip
                              label={`v${file.version.slice(-8)}`}
                              size="small"
                              variant="outlined"
                            />
                            <Typography variant="caption" color="text.secondary">
                              버전 {olderVersions.length - index}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell width="20%">
                          <Typography variant="body2" fontSize="0.85rem">
                            {FileStorageService.formatFileSize(file.size_bytes)}
                          </Typography>
                        </TableCell>
                        <TableCell width="30%">
                          <Typography variant="body2" fontSize="0.85rem" color="text.secondary">
                            {FileStorageService.formatDate(file.upload_date)}
                          </Typography>
                        </TableCell>
                        <TableCell width="10%" align="right">
                          <IconButton
                            size="small"
                            onClick={() => onDownload(file.filename, originalName)}
                            title="이 버전 다운로드"
                          >
                            <DownloadIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </>
  );
};
