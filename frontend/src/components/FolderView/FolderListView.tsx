/**
 * Folder List View Component
 *
 * Displays folders as clickable cards with file counts
 * Used for learning/test categories
 */

import React from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Chip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
} from '@mui/icons-material';
import { FolderNode } from '../../models/FileStorage';
import { FileStorageService } from '../../services/FileStorageService';

interface FolderListViewProps {
  folders: FolderNode[];
  onFolderClick: (folder: FolderNode) => void;
  selectedFolder?: FolderNode | null;
}

/**
 * FolderListView Component
 *
 * Grid-based folder visualization with:
 * - Folder icon
 * - Folder name
 * - File count badge
 * - Click to navigate
 */
export const FolderListView: React.FC<FolderListViewProps> = ({
  folders,
  onFolderClick,
  selectedFolder,
}) => {
  // Empty state
  if (!folders || folders.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4, border: '2px dashed #ccc', borderRadius: 1 }}>
        <FolderIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
        <Typography variant="body2" color="text.secondary">
          폴더가 없습니다. 파일을 업로드하면 자동으로 폴더가 생성됩니다.
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ mb: 2 }}>
        폴더 목록 ({folders?.length || 0}개)
      </Typography>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(3, 1fr)',
            lg: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {folders.map((item) => {
          const isSelected = selectedFolder?.path === item.path;
          const Icon = item.isFolder ? FolderIcon : FileIcon;

          return (
            <Card
              key={item.path}
              elevation={isSelected ? 4 : 1}
              sx={{
                border: isSelected ? '2px solid primary.main' : '1px solid #e0e0e0',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  elevation: 3,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardActionArea onClick={() => onFolderClick(item)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Icon
                      sx={{
                        fontSize: 40,
                        color: isSelected ? 'primary.main' : item.isFolder ? 'action.active' : 'info.main',
                        mr: 1,
                      }}
                    />
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        variant="body1"
                        noWrap
                        sx={{
                          fontWeight: isSelected ? 'bold' : 'normal',
                          color: isSelected ? 'primary.main' : 'text.primary',
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    {item.isFolder && item.count !== undefined && (
                      <Chip
                        label={`${item.count}개 항목`}
                        size="small"
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                      />
                    )}
                    {!item.isFolder && item.size !== undefined && (
                      <Chip
                        label={FileStorageService.formatFileSize(item.size)}
                        size="small"
                        color={isSelected ? 'primary' : 'default'}
                        variant={isSelected ? 'filled' : 'outlined'}
                      />
                    )}
                    {!item.isFolder && item.uploadDate && (
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, width: '100%' }}>
                        {FileStorageService.formatDate(item.uploadDate)}
                      </Typography>
                    )}
                  </Box>
                </CardContent>
              </CardActionArea>
            </Card>
          );
        })}
      </Box>
    </Box>
  );
};
