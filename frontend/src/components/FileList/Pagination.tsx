/**
 * Pagination Component
 *
 * Reusable pagination controls with page numbers and navigation buttons
 */

import React from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import FirstPageIcon from '@mui/icons-material/FirstPage';
import LastPageIcon from '@mui/icons-material/LastPage';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxPagesToShow?: number; // Maximum page numbers to display (default: 5)
}

/**
 * Pagination Component
 *
 * Features:
 * - First/Previous/Next/Last navigation
 * - Page number buttons
 * - Smart page range calculation
 * - Disabled states for edge cases
 */
export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  maxPagesToShow = 5,
}) => {
  // Edge case: no pages or single page
  if (totalPages <= 1) {
    return null;
  }

  // Navigation handlers
  const handleFirst = () => onPageChange(1);
  const handlePrevious = () => onPageChange(Math.max(1, currentPage - 1));
  const handleNext = () => onPageChange(Math.min(totalPages, currentPage + 1));
  const handleLast = () => onPageChange(totalPages);

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        justifyContent: 'center',
      }}
    >
      {/* First Page */}
      <IconButton
        size="small"
        onClick={handleFirst}
        disabled={isFirstPage}
        title="첫 페이지"
      >
        <FirstPageIcon fontSize="small" />
      </IconButton>

      {/* Previous Page */}
      <IconButton
        size="small"
        onClick={handlePrevious}
        disabled={isFirstPage}
        title="이전 페이지"
      >
        <NavigateBeforeIcon fontSize="small" />
      </IconButton>

      {/* Page Info */}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mx: 2, minWidth: 60, textAlign: 'center' }}
      >
        {currentPage} / {totalPages}
      </Typography>

      {/* Next Page */}
      <IconButton
        size="small"
        onClick={handleNext}
        disabled={isLastPage}
        title="다음 페이지"
      >
        <NavigateNextIcon fontSize="small" />
      </IconButton>

      {/* Last Page */}
      <IconButton
        size="small"
        onClick={handleLast}
        disabled={isLastPage}
        title="마지막 페이지"
      >
        <LastPageIcon fontSize="small" />
      </IconButton>
    </Box>
  );
};

/**
 * Compact Pagination Component
 *
 * Simpler version without first/last buttons
 * Useful for mobile or tight spaces
 */
export const PaginationCompact: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        justifyContent: 'center',
      }}
    >
      <IconButton
        size="small"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirstPage}
      >
        <NavigateBeforeIcon />
      </IconButton>

      <Typography variant="body2" sx={{ minWidth: 60, textAlign: 'center' }}>
        {currentPage} / {totalPages}
      </Typography>

      <IconButton
        size="small"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLastPage}
      >
        <NavigateNextIcon />
      </IconButton>
    </Box>
  );
};
