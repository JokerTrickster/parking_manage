/**
 * File List Table Component
 *
 * Displays files in a table format with download actions
 * Supports both versioned (map/cad/roi) and non-versioned (learning/test) categories
 */

import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Typography,
  Box,
  Chip,
  Tooltip,
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import GetAppIcon from '@mui/icons-material/GetApp';
import DeleteIcon from '@mui/icons-material/Delete';
import { FileInfo, FileCategory } from '../../models/FileStorage';
import { FileStorageService } from '../../services/FileStorageService';

interface FileListTableProps {
  files: FileInfo[];
  category: FileCategory;
  onDownload: (filename: string, originalName: string) => void;
  onDownloadLatest: (originalName: string) => void;
  onDelete: (filename: string) => void;
}

/**
 * FileListTable Component
 *
 * Renders file list with different layouts:
 * - Versioned categories (map/cad/roi): Groups by original name with version info
 * - Non-versioned categories (learning/test): Flat list with CCTV ID
 */
export const FileListTable: React.FC<FileListTableProps> = ({
  files,
  category,
  onDownload,
  onDownloadLatest,
  onDelete,
}) => {
  // Check if category supports versioning
  const isVersioned = ['map', 'cad', 'roi'].includes(category);

  // Group files by original name for versioned categories
  const fileGroups = isVersioned ? groupFilesByOriginalName(files) : { '': files };

  // Empty state
  if (files.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 3, border: '2px dashed #ccc', borderRadius: 1 }}>
        <Typography variant="body2" color="text.secondary">
          업로드된 파일이 없습니다.
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer sx={{ border: '1px solid #e0e0e0', borderRadius: 1 }}>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell><Typography variant="subtitle2">파일명</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">크기</Typography></TableCell>
            <TableCell><Typography variant="subtitle2">업로드 날짜</Typography></TableCell>
            {isVersioned && <TableCell><Typography variant="subtitle2">버전</Typography></TableCell>}
            {(category === 'learning' || category === 'test') && <TableCell><Typography variant="subtitle2">CCTV ID</Typography></TableCell>}
            <TableCell align="center"><Typography variant="subtitle2">작업</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {isVersioned ? (
            // Versioned categories: show grouped with latest on top
            Object.entries(fileGroups).map(([originalName, groupFiles]) => {
              const latestFile = groupFiles[0]; // Already sorted by version desc
              const hasMultipleVersions = groupFiles.length > 1;

              return (
                <TableRow key={originalName} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="body2">{originalName}</Typography>
                      {hasMultipleVersions && (
                        <Chip
                          label={`${groupFiles.length}개 버전`}
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
                    <Tooltip title="최신 버전 다운로드">
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => onDownloadLatest(originalName)}
                      >
                        <GetAppIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="삭제">
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => onDelete(latestFile.filename)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            // Non-versioned categories: flat list
            files.map((file) => (
              <TableRow key={file.filename} hover>
                <TableCell>
                  <Typography variant="body2">
                    {file.original_name || file.filename}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {FileStorageService.formatFileSize(file.size_bytes)}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {FileStorageService.formatDate(file.upload_date)}
                  </Typography>
                </TableCell>
                {(category === 'learning' || category === 'test') && (
                  <TableCell>
                    <Chip
                      label={file.cctv_id || '-'}
                      size="small"
                      variant="outlined"
                    />
                  </TableCell>
                )}
                <TableCell align="center">
                  <Tooltip title="다운로드">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => onDownload(file.filename, file.original_name)}
                    >
                      <DownloadIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="삭제">
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => onDelete(file.filename)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * Group files by original name for versioned categories
 * Sorts each group by version (descending)
 */
function groupFilesByOriginalName(files: FileInfo[]): Record<string, FileInfo[]> {
  const groups: Record<string, FileInfo[]> = {};

  files.forEach(file => {
    const key = file.original_name || file.filename;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(file);
  });

  // Sort each group by version (descending - latest first)
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => b.version.localeCompare(a.version));
  });

  return groups;
}
