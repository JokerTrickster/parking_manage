/**
 * ROI Image Canvas Component
 *
 * Canvas component for displaying learning images with ROI overlays
 * Allows clicking ROI regions to fill/empty them for training data augmentation
 */

import React, { useRef, useEffect, useState } from 'react';
import { Box, Tooltip } from '@mui/material';
import { ROIPolygon } from '../models/LearningDataManagement';

interface ROIImageCanvasProps {
  imageSrc: string;
  rois: ROIPolygon[];
  onROIClick?: (roiId: string) => void;
  highlightedROI?: string | null;
  width?: number;
  height?: number;
}

interface CanvasState {
  imageElement: HTMLImageElement | null;
  imageLoaded: boolean;
  scale: number;
  offsetX: number;
  offsetY: number;
}

const ROIImageCanvas: React.FC<ROIImageCanvasProps> = ({
  imageSrc,
  rois,
  onROIClick,
  highlightedROI = null,
  width = 800,
  height = 600,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [canvasState, setCanvasState] = useState<CanvasState>({
    imageElement: null,
    imageLoaded: false,
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [hoveredROI, setHoveredROI] = useState<string | null>(null);

  // Load image
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setCanvasState(prev => ({
        ...prev,
        imageElement: img,
        imageLoaded: true,
      }));
    };
    img.onerror = () => {
      console.error('[ROIImageCanvas] Failed to load image:', imageSrc);
    };
    img.src = imageSrc;

    // Cleanup
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, [imageSrc]);

  // Draw canvas
  useEffect(() => {
    const { imageElement, imageLoaded } = canvasState;
    if (!imageLoaded || !imageElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Calculate scale and offset
    const imageRatio = imageElement.width / imageElement.height;
    const canvasRatio = width / height;

    let scale: number, offsetX: number, offsetY: number;

    if (imageRatio > canvasRatio) {
      // Image is wider - fit to width
      scale = width / imageElement.width;
      const scaledHeight = imageElement.height * scale;
      offsetX = 0;
      offsetY = (height - scaledHeight) / 2;
    } else {
      // Image is taller - fit to height
      scale = height / imageElement.height;
      const scaledWidth = imageElement.width * scale;
      offsetX = (width - scaledWidth) / 2;
      offsetY = 0;
    }

    // Update canvas state
    setCanvasState(prev => ({
      ...prev,
      scale,
      offsetX,
      offsetY,
    }));

    // Set canvas size
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw background (dark)
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw image
    const scaledWidth = imageElement.width * scale;
    const scaledHeight = imageElement.height * scale;
    ctx.drawImage(imageElement, offsetX, offsetY, scaledWidth, scaledHeight);

    // Draw ROIs
    rois.forEach(roi => {
      const isHighlighted = roi.roi_id === highlightedROI;
      const isHovered = roi.roi_id === hoveredROI;
      const isOccupied = roi.occupied || false;

      ctx.beginPath();

      // Move to first point
      const x0 = roi.coords[0] * scale + offsetX;
      const y0 = roi.coords[1] * scale + offsetY;
      ctx.moveTo(x0, y0);

      // Draw polygon
      for (let i = 2; i < roi.coords.length; i += 2) {
        const x = roi.coords[i] * scale + offsetX;
        const y = roi.coords[i + 1] * scale + offsetY;
        ctx.lineTo(x, y);
      }
      ctx.closePath();

      // Fill ROI if occupied
      if (isOccupied) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)'; // White for occupied
        ctx.fill();
      }

      // Stroke ROI
      if (isHighlighted) {
        ctx.strokeStyle = '#ff0000';
        ctx.lineWidth = 3;
      } else if (isHovered) {
        ctx.strokeStyle = '#ffff00';
        ctx.lineWidth = 2;
      } else {
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 1.5;
      }
      ctx.stroke();

      // Draw ROI ID label
      ctx.fillStyle = isHighlighted || isHovered ? '#ffff00' : '#00ff00';
      ctx.font = '14px Arial';
      ctx.fillText(roi.roi_id, x0 + 5, y0 - 5);
    });
  }, [canvasState, rois, highlightedROI, hoveredROI, width, height]);

  // Handle canvas click
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!onROIClick || !canvasState.imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Check which ROI was clicked
    const { scale, offsetX, offsetY } = canvasState;
    const clickedROI = rois.find(roi => {
      return isPointInPolygon(
        x,
        y,
        roi.coords.map((coord, idx) =>
          idx % 2 === 0 ? coord * scale + offsetX : coord * scale + offsetY
        )
      );
    });

    if (clickedROI) {
      console.log('[ROIImageCanvas] ROI clicked:', clickedROI.roi_id);
      onROIClick(clickedROI.roi_id);
    }
  };

  // Handle mouse move for hover effect
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasState.imageLoaded) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const { scale, offsetX, offsetY } = canvasState;
    const hoveredROI = rois.find(roi => {
      return isPointInPolygon(
        x,
        y,
        roi.coords.map((coord, idx) =>
          idx % 2 === 0 ? coord * scale + offsetX : coord * scale + offsetY
        )
      );
    });

    setHoveredROI(hoveredROI ? hoveredROI.roi_id : null);

    // Change cursor
    canvas.style.cursor = hoveredROI ? 'pointer' : 'default';
  };

  // Handle mouse leave
  const handleMouseLeave = () => {
    setHoveredROI(null);
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.style.cursor = 'default';
    }
  };

  return (
    <Tooltip title={hoveredROI ? `ROI: ${hoveredROI}` : ''} followCursor>
      <Box
        sx={{
          display: 'inline-block',
          border: '1px solid #ccc',
          borderRadius: 1,
          overflow: 'hidden',
        }}
      >
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            display: 'block',
            maxWidth: '100%',
            height: 'auto',
          }}
        />
      </Box>
    </Tooltip>
  );
};

/**
 * Point-in-polygon test using ray casting algorithm
 */
function isPointInPolygon(x: number, y: number, coords: number[]): boolean {
  let inside = false;
  const n = coords.length / 2;

  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = coords[i * 2];
    const yi = coords[i * 2 + 1];
    const xj = coords[j * 2];
    const yj = coords[j * 2 + 1];

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

export default ROIImageCanvas;
