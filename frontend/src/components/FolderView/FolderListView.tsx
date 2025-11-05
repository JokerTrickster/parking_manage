/**
 * Folder List View Component
 *
 * Displays folders as clickable cards with file counts
 * Used for learning/test categories
 */

import React, { useState } from 'react';
import {
  Card,
  CardActionArea,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Folder as FolderIcon,
  InsertDriveFile as FileIcon,
  Image as ImageIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { FolderNode } from '../../models/FileStorage';
import { FileStorageService } from '../../services/FileStorageService';
import { ImagePreviewDialog } from './ImagePreviewDialog';

interface FolderListViewProps {
  folders: FolderNode[];
  onFolderClick: (folder: FolderNode) => void;
  selectedFolder?: FolderNode | null;
  projectId: string;
  category: string;
  onDownload?: (filename: string) => void;
  onDeleteFolder?: (folderPath: string) => void;
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
  projectId,
  category,
  onDownload,
  onDeleteFolder,
}) => {
  const [previewImage, setPreviewImage] = useState<FolderNode | null>(null);

  // Check if file is an image
  const isImageFile = (filename: string): boolean => {
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
    const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
    return imageExtensions.includes(ext);
  };

  // Handle item click
  const handleItemClick = (item: FolderNode) => {
    if (item.isFolder) {
      // Navigate into folder
      onFolderClick(item);
    } else if (isImageFile(item.name)) {
      // Open image preview
      setPreviewImage(item);
    } else {
      // For non-image files, just call the folder click handler
      onFolderClick(item);
    }
  };

  const handleDeleteFolder = (event: React.MouseEvent, item: FolderNode) => {
    event.stopPropagation(); // Prevent card click
    if (onDeleteFolder && item.isFolder) {
      onDeleteFolder(item.path);
    }
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  const handleDownloadFromPreview = (filename: string) => {
    if (onDownload) {
      onDownload(filename);
    }
  };

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
          const isImage = !item.isFolder && isImageFile(item.name);
          const Icon = item.isFolder ? FolderIcon : isImage ? ImageIcon : FileIcon;

          return (
            <Card
              key={item.path}
              elevation={isSelected ? 4 : 1}
              sx={{
                border: isSelected ? '2px solid primary.main' : '1px solid #e0e0e0',
                transition: 'all 0.2s ease-in-out',
                position: 'relative',
                '&:hover': {
                  elevation: 3,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              {/* Delete button for folders */}
              {item.isFolder && onDeleteFolder && (
                <Tooltip title="폴더 삭제">
                  <IconButton
                    size="small"
                    color="error"
                    onClick={(e) => handleDeleteFolder(e, item)}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      zIndex: 1,
                      backgroundColor: 'white',
                      '&:hover': {
                        backgroundColor: 'error.light',
                        color: 'white',
                      },
                    }}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              <CardActionArea onClick={() => handleItemClick(item)}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Icon
                      sx={{
                        fontSize: 40,
                        color: isSelected
                          ? 'primary.main'
                          : item.isFolder
                          ? 'action.active'
                          : isImage
                          ? 'success.main'
                          : 'info.main',
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
                    {!item.isFolder && isImage && (
                      <Chip
                        label="이미지"
                        size="small"
                        color="success"
                        variant="outlined"
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

      {/* Image Preview Dialog */}
      <ImagePreviewDialog
        open={!!previewImage}
        imageFile={previewImage}
        projectId={projectId}
        category={category}
        allFiles={folders}
        onClose={handleClosePreview}
        onDownload={handleDownloadFromPreview}
      />
    </Box>
  );
};
