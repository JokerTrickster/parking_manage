/**
 * Image Preview Dialog Component
 *
 * Displays image preview in a modal dialog
 * Supports navigation between images in the same folder
 */

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  Box,
  Typography,
  CircularProgress,
} from '@mui/material';
import {
  Close as CloseIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { FolderNode } from '../../models/FileStorage';

interface ImagePreviewDialogProps {
  open: boolean;
  imageFile: FolderNode | null;
  projectId: string;
  category: string;
  allFiles: FolderNode[];
  onClose: () => void;
  onDownload: (filename: string) => void;
}

/**
 * ImagePreviewDialog Component
 *
 * Features:
 * - Full-size image preview
 * - Previous/Next navigation
 * - Download button
 * - Loading state
 * - Error handling
 */
export const ImagePreviewDialog: React.FC<ImagePreviewDialogProps> = ({
  open,
  imageFile,
  projectId,
  category,
  allFiles,
  onClose,
  onDownload,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Filter only image files
  const imageFiles = allFiles.filter(
    (file) => !file.isFolder && isImageFile(file.name)
  );

  // Find current image index
  useEffect(() => {
    if (imageFile) {
      const index = imageFiles.findIndex((f) => f.path === imageFile.path);
      setCurrentIndex(index !== -1 ? index : 0);
    }
  }, [imageFile, imageFiles]);

  // Reset loading state when image changes
  useEffect(() => {
    if (open && imageFile) {
      setLoading(true);
      setError(false);
    }
  }, [open, imageFile]);

  if (!imageFile) {
    return null;
  }

  const currentFile = imageFiles[currentIndex] || imageFile;
  // Encode only the path components individually to preserve slashes
  const encodedPath = currentFile.path
    .split('/')
    .map(segment => encodeURIComponent(segment))
    .join('/');
  const imageUrl = `${getBaseUrl()}/v0.1/filestorage/${projectId}/${category}/download/${encodedPath}`;

  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < imageFiles.length - 1;

  const handlePrevious = () => {
    if (hasPrevious) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (hasNext) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleImageLoad = () => {
    setLoading(false);
    setError(false);
  };

  const handleImageError = () => {
    setLoading(false);
    setError(true);
  };

  const handleDownload = () => {
    onDownload(currentFile.path);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          minHeight: '80vh',
          maxHeight: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap sx={{ flex: 1, mr: 2 }}>
            {currentFile.name}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton size="small" onClick={handleDownload} title="다운로드">
              <DownloadIcon />
            </IconButton>
            <IconButton size="small" onClick={onClose}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>
        {imageFiles.length > 1 && (
          <Typography variant="caption" color="text.secondary">
            {currentIndex + 1} / {imageFiles.length}
          </Typography>
        )}
      </DialogTitle>

      <DialogContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          p: 2,
        }}
      >
        {/* Previous Button */}
        {imageFiles.length > 1 && hasPrevious && (
          <IconButton
            onClick={handlePrevious}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4,
              },
            }}
          >
            <PrevIcon />
          </IconButton>
        )}

        {/* Image */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%',
            position: 'relative',
          }}
        >
          {loading && (
            <CircularProgress
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            />
          )}

          {error ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="error" gutterBottom>
                이미지를 불러올 수 없습니다.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                파일이 손상되었거나 접근할 수 없습니다.
              </Typography>
            </Box>
          ) : (
            <img
              src={imageUrl}
              alt={currentFile.name}
              onLoad={handleImageLoad}
              onError={handleImageError}
              style={{
                maxWidth: '100%',
                maxHeight: '70vh',
                objectFit: 'contain',
                display: loading ? 'none' : 'block',
              }}
            />
          )}
        </Box>

        {/* Next Button */}
        {imageFiles.length > 1 && hasNext && (
          <IconButton
            onClick={handleNext}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              bgcolor: 'background.paper',
              boxShadow: 2,
              '&:hover': {
                bgcolor: 'background.paper',
                boxShadow: 4,
              },
            }}
          >
            <NextIcon />
          </IconButton>
        )}
      </DialogContent>
    </Dialog>
  );
};

/**
 * Check if file is an image based on extension
 */
function isImageFile(filename: string): boolean {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'];
  const ext = filename.toLowerCase().substring(filename.lastIndexOf('.'));
  return imageExtensions.includes(ext);
}

/**
 * Get base URL for API requests
 */
function getBaseUrl(): string {
  return 'http://localhost:5000';
}
