import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface RoiCanvasProps {
  imageSrc: string;
  rois: { [roiId: string]: number[] };
  editable?: boolean;
  onRoiClick?: (roiId: string) => void;
  selectedRoiId?: string;
  editMode?: 'create' | 'update' | 'delete' | null;
  onRoiCreate?: (coordinates: number[]) => void;
  onRoiUpdate?: (roiId: string, coordinates: number[]) => void;
  isMobile?: boolean;
  fullscreen?: boolean;
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
  onRoiUpdate,
  isMobile = false,
  fullscreen = false
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);
  const [drawingPoints, setDrawingPoints] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hoveredRoiId, setHoveredRoiId] = useState<string | null>(null);

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

    // 동적 캔버스 크기 계산 - 부모 컨테이너에 맞춤
    const getCanvasSize = () => {
      if (fullscreen) {
        // 전체화면 모드: 최대 가능한 크기
        const maxWidth = Math.min(window.innerWidth - 32, 1200);
        const maxHeight = Math.min(window.innerHeight * 0.8, 900);
        return { width: maxWidth, height: maxHeight };
      } else if (isMobile) {
        // 모바일: 화면 너비에 맞춤
        const size = Math.min(window.innerWidth - 64, 500);
        return { width: size, height: size };
      } else {
        // 데스크톱: 부모 컨테이너 크기에 맞춤 (600-700px)
        const parentElement = canvasRef.current?.parentElement;
        if (parentElement) {
          const rect = parentElement.getBoundingClientRect();
          return { width: rect.width - 32, height: rect.height - 32 };
        }
        // 폴백: 큰 기본 크기
        return { width: 700, height: 700 };
      }
    };

    const canvasSize = getCanvasSize();
    const canvasWidth = canvasSize.width;
    const canvasHeight = canvasSize.height;

    // 캔버스를 가득 채우도록 설정 (비율 무시, fill 방식)
    const offsetX = 0;
    const offsetY = 0;
    const scaleX = canvasWidth / imageElement.width;
    const scaleY = canvasHeight / imageElement.height;
    const scale = Math.max(scaleX, scaleY); // 더 큰 스케일을 사용하여 캔버스를 가득 채움

    // 캔버스 크기 설정
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;

    // 배경 지우기
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 이미지 그리기 (캔버스를 가득 채움)
    ctx.drawImage(
      imageElement,
      0, 0,
      canvasWidth,
      canvasHeight
    );

    // ROI 그리기 (좌표 스케일링)
    Object.entries(rois).forEach(([roiId, coordinates]) => {
      if (coordinates.length < 6) return; // 최소 3개 점 필요 (6개 좌표)

      // editable이 false면 선택/호버 효과 없이 기본 연두색만 표시
      const isSelected = editable && selectedRoiId === roiId;
      const isHovered = editable && hoveredRoiId === roiId;

      ctx.beginPath();
      // 선택됨: 노란색, 호버: 주황색, 일반: 연두색
      ctx.strokeStyle = isSelected ? '#ffff00' : (isHovered ? '#ff8800' : '#00ff00');
      ctx.lineWidth = Math.max(1, (isSelected ? 3 : 2) * scaleX); // 선택된 ROI는 더 두껍게

      // 첫 번째 점으로 이동 (좌표 스케일링 - X와 Y 각각 다르게)
      const x1 = coordinates[0] * scaleX + offsetX;
      const y1 = coordinates[1] * scaleY + offsetY;
      ctx.moveTo(x1, y1);

      // 나머지 점들을 연결
      for (let i = 2; i < coordinates.length; i += 2) {
        const x = coordinates[i] * scaleX + offsetX;
        const y = coordinates[i + 1] * scaleY + offsetY;
        ctx.lineTo(x, y);
      }

      // 다각형 닫기
      ctx.closePath();
      ctx.stroke();

      // 선택된 ROI는 반투명 배경 추가 (editable일 때만)
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 0, 0.15)';
        ctx.fill();
      }

      // ROI ID 표시 (첫 번째 점 근처, 스케일에 맞춰 폰트 크기 조정)
      ctx.fillStyle = isSelected ? '#ffff00' : (isHovered ? '#ff8800' : '#00ff00');
      ctx.font = `${Math.max(8, 12 * scaleX)}px Arial`;
      ctx.fillText(roiId, x1 + 5 * scaleX, y1 - 5 * scaleY);
    });

    // 편집 모드에서 그리는 중인 ROI 표시
    if (editMode && drawingPoints.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = '#00ff00'; // 연두색으로 편집 중인 ROI 표시
      ctx.lineWidth = Math.max(1, 2 * scaleX);
      // 점선 제거 - 일반 선으로 표시

      // 첫 번째 점으로 이동
      const x1 = drawingPoints[0] * scaleX + offsetX;
      const y1 = drawingPoints[1] * scaleY + offsetY;
      ctx.moveTo(x1, y1);

      // 나머지 점들을 연결
      for (let i = 2; i < drawingPoints.length; i += 2) {
        const x = drawingPoints[i] * scaleX + offsetX;
        const y = drawingPoints[i + 1] * scaleY + offsetY;
        ctx.lineTo(x, y);
      }

      // 클릭할 때마다 점들이 선으로 연결됨 (마우스 따라가기 제거)

      ctx.stroke();

      // 클릭한 점들을 원으로 표시
      ctx.fillStyle = '#ff0000'; // 빨간색 점
      ctx.strokeStyle = '#ffffff'; // 흰색 테두리
      ctx.lineWidth = Math.max(1, 1 * scaleX);

      for (let i = 0; i < drawingPoints.length; i += 2) {
        const x = drawingPoints[i] * scaleX + offsetX;
        const y = drawingPoints[i + 1] * scaleY + offsetY;
        const radius = Math.max(3, 4 * scaleX);

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
      }
    }
  }, [imageLoaded, imageElement, rois, selectedRoiId, hoveredRoiId, editMode, drawingPoints, isDrawing, isMobile, fullscreen]);

  // 좌표 변환 함수
  const getImageCoordinates = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageElement) return null;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 캔버스 크기 (실제 크기)
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // fill 방식으로 변경 - 캔버스에 맞춰 이미지를 늘림
    const scaleX = canvasWidth / imageElement.width;
    const scaleY = canvasHeight / imageElement.height;
    const offsetX = 0;
    const offsetY = 0;

    // 클릭 좌표를 원본 이미지 좌표로 변환 (정수형으로 반올림)
    const originalX = Math.round((clickX - offsetX) / scaleX);
    const originalY = Math.round((clickY - offsetY) / scaleY);

    return { x: originalX, y: originalY, scaleX, scaleY, offsetX, offsetY };
  };

  // ROI 클릭 이벤트
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageElement) return;

    const coords = getImageCoordinates(event);
    if (!coords) return;

    // 편집 모드인 경우 - 이때만 editable 체크
    if (editMode) {
      if (!editable) return; // 편집 모드에서는 editable이 true여야 함
      setDrawingPoints(prev => [...prev, coords.x, coords.y]);
      setIsDrawing(true);
      return;
    }

    // 일반 모드인 경우 ROI 선택 - editable과 무관하게 동작
    if (onRoiClick) {
      Object.entries(rois).forEach(([roiId, coordinates]) => {
        if (isPointInPolygon(coords.x, coords.y, coordinates)) {
          onRoiClick(roiId);
        }
      });
    }
  };

  // 마우스 이동 이벤트 - ROI 호버 감지
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !imageElement || editMode) return;

    const coords = getImageCoordinates(event);
    if (!coords) return;

    // 마우스 아래에 있는 ROI 찾기
    let foundRoiId: string | null = null;
    Object.entries(rois).forEach(([roiId, coordinates]) => {
      if (isPointInPolygon(coords.x, coords.y, coordinates)) {
        foundRoiId = roiId;
      }
    });

    // 호버 상태 업데이트
    if (foundRoiId !== hoveredRoiId) {
      setHoveredRoiId(foundRoiId);
    }
  };

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
    <Box sx={{ position: 'relative', display: 'inline-block', width: '100%', height: '100%' }}>
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
        style={{
          cursor: editMode ? 'crosshair' : (hoveredRoiId ? 'pointer' : 'default'),
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          touchAction: editMode ? 'none' : 'auto' // 터치 제스처 최적화
        }}
      />
    </Box>
  );
});

export default RoiCanvas;
