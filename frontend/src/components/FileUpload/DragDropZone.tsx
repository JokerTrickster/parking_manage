/**
 * Drag & Drop Zone Component
 *
 * File upload area with drag-and-drop support and file selection button
 * Validates files by category before upload
 */

import React, { useState, useCallback } from 'react';
import { Box, Typography, Button, LinearProgress } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { FileCategory } from '../../models/FileStorage';
import { ChunkUploader } from '../../utils/ChunkUploader';

interface DragDropZoneProps {
  category: FileCategory;
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  uploading?: boolean;
  uploadProgress?: number;
}

// Check if category requires folder upload
const isFolderCategory = (category: FileCategory): boolean => {
  return category === 'learning' || category === 'test';
};

/**
 * DragDropZone Component
 *
 * Features:
 * - Drag and drop file upload
 * - Click to select files
 * - File validation by category
 * - Multiple file support
 * - Visual feedback for drag state
 * - Upload progress indicator
 */
export const DragDropZone: React.FC<DragDropZoneProps> = ({
  category,
  onFilesSelected,
  disabled = false,
  uploading = false,
  uploadProgress = 0,
}) => {
  const [isDragging, setIsDragging] = useState(false);

  // Get accepted file extensions by category
  const acceptedExtensions = ChunkUploader.getAcceptedExtensions(category);
  const categoryLabel = ChunkUploader.getCategoryLabel(category);
  const isFolderUpload = isFolderCategory(category);

  // Validate files before passing to parent
  const handleFiles = useCallback((files: File[]) => {
    if (files.length === 0) return;

    console.log('[DragDropZone] Files selected:', {
      count: files.length,
      category,
    });

    // Log first 5 files for debugging
    console.log('[DragDropZone] Sample files:', files.slice(0, 5).map(f => ({
      name: f.name,
      size: f.size,
      type: f.type
    })));

    // Validate files
    const { valid, invalid } = ChunkUploader.validateFiles(files, category);

    console.log('[DragDropZone] Validation result:', {
      totalFiles: files.length,
      validCount: valid.length,
      invalidCount: invalid.length
    });

    // Show validation errors if any
    if (invalid.length > 0) {
      // Log first 10 invalid files
      console.warn('[DragDropZone] Invalid files (first 10):', invalid.slice(0, 10));

      const errorMessages = invalid.slice(0, 10).map(({ file, error }) => `${file.name}: ${error}`);
      const moreCount = invalid.length > 10 ? `\n\n... 외 ${invalid.length - 10}개 파일` : '';
      alert(`파일 검증 실패:\n\n${errorMessages.join('\n')}${moreCount}`);
    }

    // Pass valid files to parent
    if (valid.length > 0) {
      console.log('[DragDropZone] Passing valid files to parent:', valid.length);
      onFilesSelected(valid);
    }
  }, [category, onFilesSelected]);

  // File input change handler
  const handleFileInput = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    handleFiles(files);
    // Reset input value to allow re-selecting same file
    event.target.value = '';
  }, [handleFiles]);

  // Drag event handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !uploading) {
      setIsDragging(true);
    }
  }, [disabled, uploading]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled || uploading) return;

    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [disabled, uploading, handleFiles]);

  const isDisabled = disabled || uploading;

  return (
    <Box
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      sx={{
        border: '2px dashed',
        borderColor: isDragging ? 'primary.main' :
                     uploading ? 'success.main' :
                     '#ccc',
        borderRadius: 1,
        padding: 3,
        textAlign: 'center',
        backgroundColor: isDragging ? 'action.hover' : 'background.paper',
        cursor: isDisabled ? 'not-allowed' : 'pointer',
        opacity: isDisabled ? 0.6 : 1,
        transition: 'all 0.3s ease',
        '&:hover': {
          borderColor: isDisabled ? '#ccc' : 'primary.light',
        },
      }}
    >
      {/* Upload Progress */}
      {uploading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={uploadProgress}
            sx={{ mb: 1 }}
          />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="caption" color="text.secondary">
              업로드 진행률: {uploadProgress}%
            </Typography>
            <Typography variant="caption" color="primary">
              파일을 업로드하고 있습니다...
            </Typography>
          </Box>
        </Box>
      )}

      {!uploading && (
        <>
          {/* Upload Icon */}
          <CloudUploadIcon
            sx={{
              fontSize: 48,
              color: 'text.secondary',
              mb: 1,
            }}
          />

          {/* Title */}
          <Typography variant="body1" gutterBottom>
            {isFolderUpload ? '폴더를 여기에 드래그하거나 클릭하여 선택하세요' : '파일을 여기에 드래그하거나 클릭하여 선택하세요'}
          </Typography>

          {/* Category and Extensions */}
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {categoryLabel} - 허용 형식: {acceptedExtensions}
          </Typography>

          {/* File Input (Hidden) */}
          <input
            type="file"
            multiple
            accept={acceptedExtensions}
            onChange={handleFileInput}
            disabled={isDisabled}
            style={{ display: 'none' }}
            id={`file-input-${category}`}
            {...(isFolderUpload ? {
              webkitdirectory: "",
              directory: "",
            } as any : {})}
          />

          {/* File Select Button */}
          <label htmlFor={`file-input-${category}`}>
            <Button
              variant="outlined"
              component="span"
              disabled={isDisabled}
              startIcon={<CloudUploadIcon />}
            >
              {isFolderUpload ? '폴더 선택' : '파일 선택'}
            </Button>
          </label>

          {/* Helper Text */}
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
            최대 파일 크기: 100MB | 다중 파일 업로드 지원
          </Typography>
        </>
      )}
    </Box>
  );
};
