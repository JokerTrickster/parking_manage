import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface RoiCanvasProps {
  imageSrc: string;
  rois: { [roiId: string]: number[] };
  editable?: boolean;
  onRoiClick?: (roiId: string) => void;
  selectedRoiId?: string;
  editMode?: 'create' | 'update' | null;
  onRoiCreate?: (coordinates: number[]) => void;
  onRoiUpdate?: (roiId: string, coordinates: number[]) => void;
}

export interface RoiCanvasRef {
  completeRoi: () => void;
  cancelRoiEdit: () => void;
  getDrawingPoints: () => number[];
}

const RoiCanvas = React.forwardRef<RoiCanvasRef, RoiCanvasProps>(({
  imageSrc,
  rois,
  editable = false,
  onRoiClick,
  selectedRoiId,
  editMode = null,
  onRoiCreate,
  onRoiUpdate
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);

  // 이미지 로드
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      setImageElement(img);
      setImageLoaded(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // ROI 그리기
  useEffect(() => {
    if (!imageLoaded || !imageElement || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 고정 크기 640x640
    const canvasWidth = 360;
    const canvasHeight = 360;

    // 이미지 비율 계산
    const imageRatio = imageElement.width / imageElement.height;
    const containerRatio = canvasWidth / canvasHeight;

    let offsetX: number, offsetY: number, scale: number;

    if (imageRatio > containerRatio) {
      // 이미지가 더 넓음 - 너비에 맞춤
      const scaledWidth = canvasWidth;
      const scaledHeight = canvasWidth / imageRatio;
      offsetX = 0;
      offsetY = (canvasHeight - scaledHeight) / 2;
      scale = scaledWidth / imageElement.width;
    } else {
      // 이미지가 더 높음 - 높이에 맞춤
      const scaledHeight = canvasHeight;
      const scaledWidth = canvasHeight * imageRatio;
      offsetX = (canvasWidth - scaledWidth) / 2;
      offsetY = 0;
      scale = scaledHeight / imageElement.height;
    }

    // 캔버스 크기 설정
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 이미지 그리기 (중앙 정렬)
    ctx.drawImage(
      imageElement,
      offsetX, offsetY,
      canvasWidth,
      canvasHeight
    );

    // ROI 그리기 (좌표 스케일링)
    Object.entries(rois).forEach(([roiId, coordinates]) => {
      if (coordinates.length < 6) return; // 최소 3개 점 필요 (6개 좌표)

      ctx.beginPath();
      ctx.strokeStyle = selectedRoiId === roiId ? '#00ff00' : '#00ff00';
      ctx.lineWidth = Math.max(1, 2 * scale); // 스케일에 맞춰 선 두께 조정

      // 첫 번째 점으로 이동 (좌표 스케일링)
      const x1 = coordinates[0] * scale + offsetX;
      const y1 = coordinates[1] * scale + offsetY;
      ctx.moveTo(x1, y1);

      // 나머지 점들을 연결
      for (let i = 2; i < coordinates.length; i += 2) {
        const x = coordinates[i] * scale + offsetX;
        const y = coordinates[i + 1] * scale + offsetY;
        ctx.lineTo(x, y);
      }

      // 다각형 닫기
      ctx.closePath();
      ctx.stroke();

      // ROI ID 표시 (첫 번째 점 근처, 스케일에 맞춰 폰트 크기 조정)
      ctx.fillStyle = selectedRoiId === roiId ? '#00ff00' : '#00ff00';
      ctx.font = `${Math.max(8, 12 * scale)}px Arial`;
      ctx.fillText(roiId, x1 + 5 * scale, y1 - 5 * scale);
    });

    // 편집 모드에서 그리는 중인 ROI 표시
    if (editMode && drawingPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#00ff00'; // 연두색으로 편집 중인 ROI 표시
      ctx.lineWidth = Math.max(1, 2 * scale);
      // 점선 제거 - 일반 선으로 표시

      // 첫 번째 점으로 이동
      const x1 = drawingPoints[0] * scale + offsetX;
      const y1 = drawingPoints[1] * scale + offsetY;
      ctx.moveTo(x1, y1);

      // 나머지 점들을 연결
      for (let i = 2; i < drawingPoints.length; i += 2) {
        const x = drawingPoints[i] * scale + offsetX;
        const y = drawingPoints[i + 1] * scale + offsetY;
        ctx.lineTo(x, y);
      }

      // 클릭할 때마다 점들이 선으로 연결됨 (마우스 따라가기 제거)

      ctx.stroke();
      
      // 클릭한 점들을 원으로 표시
      ctx.fillStyle = '#ff0000'; // 빨간색 점
      ctx.strokeStyle = '#ffffff'; // 흰색 테두리
      ctx.lineWidth = Math.max(1, 1 * scale);
      
      for (let i = 0; i < drawingPoints.length; i += 2) {
        const x = drawingPoints[i] * scale + offsetX;
        const y = drawingPoints[i + 1] * scale + offsetY;
        const radius = Math.max(3, 4 * scale);
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [imageLoaded, imageElement, rois, selectedRoiId, editMode, drawingPoints, isDrawing]);

  // 좌표 변환 함수
  const getImageCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageElement) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 고정 크기 360x360
    const canvasWidth = 360;
    const canvasHeight = 360;

    // 이미지 비율 계산
    const imageRatio = imageElement.width / imageElement.height;
    const containerRatio = canvasWidth / canvasHeight;

    let offsetX: number, offsetY: number, scale: number;

    if (imageRatio > containerRatio) {
      // 이미지가 더 넓음 - 너비에 맞춤
      const scaledWidth = canvasWidth;
      const scaledHeight = canvasWidth / imageRatio;
      offsetX = 0;
      offsetY = (canvasHeight - scaledHeight) / 2;
      scale = scaledWidth / imageElement.width;
    } else {
      // 이미지가 더 높음 - 높이에 맞춤
      const scaledHeight = canvasHeight;
      const scaledWidth = canvasHeight * imageRatio;
      offsetX = (canvasWidth - scaledWidth) / 2;
      offsetY = 0;
      scale = scaledHeight / imageElement.height;
    }

    // 클릭 좌표를 원본 이미지 좌표로 변환 (정수형으로 반올림)
    const originalX = Math.round((clickX - offsetX) / scale);
    const originalY = Math.round((clickY - offsetY) / scale);

    return { x: originalX, y: originalY, scale, offsetX, offsetY };
  };

  // ROI 클릭 이벤트
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !canvasRef.current || !imageElement) return;

    const coords = getImageCoordinates(event);
    if (!coords) return;

    // 편집 모드인 경우
    if (editMode) {
      setDrawingPoints(prev => [...prev, coords.x, coords.y]);
      setIsDrawing(true);
      return;
    }

    // 일반 모드인 경우 ROI 선택
    if (onRoiClick) {
      Object.entries(rois).forEach(([roiId, coordinates]) => {
        if (isPointInPolygon(coords.x, coords.y, coordinates)) {
          onRoiClick(roiId);
        }
      });
    }
  };

  // 마우스 이동 이벤트 - 제거 (더 이상 마우스를 따라가지 않음)
  // const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
  //   if (!editMode || !isDrawing) return;

  //   const coords = getImageCoordinates(event);
  //   if (!coords) return;

  //   // 실시간으로 그리기 업데이트
  //   setDrawingPoints(prev => {
  //     const newPoints = [...prev];
  //     if (newPoints.length >= 2) {
  //       newPoints[newPoints.length - 2] = coords.x;
  //       newPoints[newPoints.length - 1] = coords.y;
  //     }
  //     return newPoints;
  //   });
  // };

  // ROI 완성 (첫 번째 점과 마지막 점 연결)
  const completeRoi = () => {
    if (!editMode || drawingPoints.length < 6) return; // 최소 3개 점 필요

    // 첫 번째 점과 마지막 점을 연결하여 다각형 완성
    const completedPoints = [...drawingPoints];
    if (completedPoints.length >= 4) {
      completedPoints.push(completedPoints[0]); // 첫 번째 x 좌표
      completedPoints.push(completedPoints[1]); // 첫 번째 y 좌표
    }
    
    if (editMode === 'create' && onRoiCreate) {
      onRoiCreate(completedPoints);
    } else if (editMode === 'update' && selectedRoiId && onRoiUpdate) {
      onRoiUpdate(selectedRoiId, completedPoints);
    }

    // 편집 모드 초기화
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  // ROI 편집 취소
  const cancelRoiEdit = () => {
    setDrawingPoints([]);
    setIsDrawing(false);
  };

  // 외부에서 호출할 수 있는 함수들
  React.useImperativeHandle(ref, () => ({
    completeRoi,
    cancelRoiEdit,
    getDrawingPoints: () => drawingPoints
  }));

  // 점이 다각형 안에 있는지 확인하는 함수
  const isPointInPolygon = (x: number, y: number, coordinates: number[]): boolean => {
    let inside = false;
    for (let i = 0, j = coordinates.length - 2; i < coordinates.length; j = i, i += 2) {
      const xi = coordinates[i];
      const yi = coordinates[i + 1];
      const xj = coordinates[j];
      const yj = coordinates[j + 1];

      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    return inside;
  };

  return (
    <Box sx={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        style={{
          cursor: editMode ? 'crosshair' : (editable ? 'pointer' : 'default'),
          width: '360px',
          height: '360px'
        }}
      />
    </Box>
  );
});

export default RoiCanvas;
