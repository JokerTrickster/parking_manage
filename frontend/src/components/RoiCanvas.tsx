import React, { useRef, useEffect, useState } from 'react';
import { Box } from '@mui/material';

interface RoiCanvasProps {
  imageSrc: string;
  rois: { [roiId: string]: number[] };
  editable?: boolean;
  onRoiClick?: (roiId: string) => void;
  selectedRoiId?: string;
}

const RoiCanvas: React.FC<RoiCanvasProps> = ({
  imageSrc,
  rois,
  editable = false,
  onRoiClick,
  selectedRoiId
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

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
      ctx.strokeStyle = selectedRoiId === roiId ? '#ff0000' : '#00ff00';
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
      ctx.fillStyle = selectedRoiId === roiId ? '#ff0000' : '#00ff00';
      ctx.font = `${Math.max(8, 12 * scale)}px Arial`;
      ctx.fillText(roiId, x1 + 5 * scale, y1 - 5 * scale);
    });
  }, [imageLoaded, imageElement, rois, selectedRoiId]);

  // ROI 클릭 이벤트
  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!editable || !onRoiClick || !canvasRef.current || !imageElement) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // 고정 크기 640x640
    const canvasWidth = 640;
    const canvasHeight = 640;

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

    // 클릭 좌표를 원본 이미지 좌표로 변환
    const originalX = (clickX - offsetX) / scale;
    const originalY = (clickY - offsetY) / scale;

    // 클릭한 위치가 어떤 ROI 안에 있는지 확인
    Object.entries(rois).forEach(([roiId, coordinates]) => {
      if (isPointInPolygon(originalX, originalY, coordinates)) {
        onRoiClick(roiId);
      }
    });
  };

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
          cursor: editable ? 'pointer' : 'default',
          width: '640px',
          height: '640px'
        }}
      />
    </Box>
  );
};

export default RoiCanvas;
