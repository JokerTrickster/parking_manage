/**
 * Auto Save Indicator Component
 *
 * Visual indicator for map editor auto-save status
 * Shows loading spinner during save and success checkmark when complete
 */

import React from 'react';
import { CircularProgress, Box, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { AutoSaveState } from '../../models/FileStorage';

interface AutoSaveIndicatorProps {
  state: AutoSaveState;
}

/**
 * AutoSaveIndicator Component
 *
 * Renders different UI based on save state:
 * - Saving: Loading spinner + "저장 중..." text
 * - Success: Green checkmark + "저장 완료" text
 * - Error: Red error icon + error message (rare, mostly logged)
 * - Idle: Nothing (hidden)
 *
 * Auto-hides after 2 seconds of success/error (controlled by ViewModel)
 */
export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({ state }) => {
  // Don't render anything when idle
  if (!state.saving && !state.success && state.success !== false) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        padding: '6px 12px',
        borderRadius: 1,
        backgroundColor:
          state.saving ? '#fff3e0' : // Orange for saving
          state.success ? '#e8f5e9' : // Green for success
          '#ffebee', // Red for error
        transition: 'all 0.3s ease',
        boxShadow: 1,
      }}
    >
      {/* Saving State */}
      {state.saving && (
        <>
          <CircularProgress size={16} thickness={4} />
          <Typography variant="body2" color="text.secondary">
            저장 중...
          </Typography>
        </>
      )}

      {/* Success State */}
      {!state.saving && state.success === true && (
        <>
          <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#4caf50', fontWeight: 500 }}>
            저장 완료
          </Typography>
        </>
      )}

      {/* Error State (rarely shown to user) */}
      {!state.saving && state.success === false && state.error && (
        <>
          <ErrorIcon sx={{ color: '#f44336', fontSize: 20 }} />
          <Typography variant="body2" sx={{ color: '#f44336' }}>
            {state.error}
          </Typography>
        </>
      )}
    </Box>
  );
};

/**
 * Compact Auto Save Indicator
 *
 * Smaller version for toolbar placement
 * Shows only icons without text
 */
export const AutoSaveIndicatorCompact: React.FC<AutoSaveIndicatorProps> = ({ state }) => {
  if (!state.saving && !state.success && state.success !== false) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 32,
        height: 32,
        borderRadius: '50%',
        backgroundColor:
          state.saving ? '#fff3e0' :
          state.success ? '#e8f5e9' :
          '#ffebee',
        transition: 'all 0.3s ease',
      }}
      title={
        state.saving ? '저장 중...' :
        state.success ? '저장 완료' :
        state.error || '오류 발생'
      }
    >
      {state.saving && <CircularProgress size={16} thickness={4} />}
      {!state.saving && state.success === true && (
        <CheckCircleIcon sx={{ color: '#4caf50', fontSize: 18 }} />
      )}
      {!state.saving && state.success === false && (
        <ErrorIcon sx={{ color: '#f44336', fontSize: 18 }} />
      )}
    </Box>
  );
};
