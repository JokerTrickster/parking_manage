/**
 * Learning Data Management ViewModel
 *
 * Business logic for Learning Data Management feature
 * Handles ROI file selection, learning folder selection, CCTV selection, and image editing
 */

import React from 'react';
import {
  LearningDataManagementState,
  LearningFolder,
  CCTVInfo,
  ROIFileData,
  ROIPolygon,
} from '../models/LearningDataManagement';
import { LearningDataService } from '../services/LearningDataService';

export class LearningDataManagementViewModel {
  constructor(
    private projectId: string,
    private state: LearningDataManagementState,
    private setState: React.Dispatch<React.SetStateAction<LearningDataManagementState>>
  ) {}

  /**
   * Initialize data - load ROI files and learning folders
   */
  async initialize(): Promise<void> {
    this.setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('[LearningDataVM] Initializing for project:', this.projectId);

      const [roiFiles, learningFolders] = await Promise.all([
        LearningDataService.getROIFileList(this.projectId),
        LearningDataService.getLearningFolders(this.projectId),
      ]);

      console.log('[LearningDataVM] Loaded:', { roiFiles, learningFolders });

      this.setState(prev => ({
        ...prev,
        roiFiles,
        learningFolders,
        loading: false,
      }));
    } catch (error) {
      console.error('[LearningDataVM] Initialization failed:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load initial data. Please refresh the page.',
      }));
    }
  }

  /**
   * Select ROI file and load its data
   */
  async selectROIFile(roiFileName: string): Promise<void> {
    this.setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('[LearningDataVM] Loading ROI file:', roiFileName);

      const roiFileData = await LearningDataService.getROIFileData(this.projectId, roiFileName);

      console.log('[LearningDataVM] ROI file loaded:', {
        cctv_id: roiFileData.cctv_id,
        roi_count: roiFileData.rois?.length || 0,
        full_data: roiFileData,
      });

      this.setState(prev => ({
        ...prev,
        selectedRoiFile: roiFileName,
        selectedRoiFileData: roiFileData,
        loading: false,
      }));

      // If learning folder and CCTV are already selected, refresh display
      if (this.state.selectedLearningFolder && this.state.selectedCCTV) {
        await this.loadCurrentImage();
      }
    } catch (error) {
      console.error('[LearningDataVM] Failed to load ROI file:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load ROI file data.',
      }));
    }
  }

  /**
   * Select learning folder and load CCTV list
   */
  async selectLearningFolder(folderPath: string): Promise<void> {
    this.setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      console.log('[LearningDataVM] Loading learning folder:', folderPath);

      const cctvList = await LearningDataService.getCCTVList(this.projectId, folderPath);

      console.log('[LearningDataVM] CCTV list loaded:', cctvList);

      this.setState(prev => ({
        ...prev,
        selectedLearningFolder: folderPath,
        cctvList,
        selectedCCTV: null, // Reset CCTV selection
        currentImage: null,
        currentImageFile: null,
        loading: false,
      }));
    } catch (error) {
      console.error('[LearningDataVM] Failed to load learning folder:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load CCTV list from learning folder.',
      }));
    }
  }

  /**
   * Select CCTV and load first image
   */
  async selectCCTV(cctvId: string): Promise<void> {
    console.log('[LearningDataVM] Selecting CCTV:', cctvId);

    // Use setState callback to get latest state instead of this.state (which is stale)
    let cctvInfo: any = null;
    let shouldContinue = false;

    this.setState(prev => {
      console.log('[LearningDataVM] Available CCTV list:', prev.cctvList);

      cctvInfo = prev.cctvList.find(c => c.cctv_id === cctvId);
      console.log('[LearningDataVM] Found CCTV info:', cctvInfo);

      if (!cctvInfo) {
        console.error('[LearningDataVM] CCTV not found in list');
        return {
          ...prev,
          error: 'CCTV not found in list.',
        };
      }

      if (cctvInfo.image_files.length === 0) {
        console.error('[LearningDataVM] No image files in CCTV:', cctvInfo);
        return {
          ...prev,
          error: `No images found for this CCTV. Files: ${JSON.stringify(cctvInfo)}`,
        };
      }

      shouldContinue = true;
      return {
        ...prev,
        selectedCCTV: cctvId,
        currentImageFile: cctvInfo.image_files[0],
        error: null,
      };
    });

    // Wait for state update, then load image
    if (shouldContinue) {
      await new Promise(resolve => setTimeout(resolve, 0)); // Wait for state update
      await this.loadCurrentImage();
    }
  }

  /**
   * Load current image based on selections
   */
  private async loadCurrentImage(): Promise<void> {
    // Get current state values using a temporary variable
    let selectedLearningFolder: string | null = null;
    let selectedCCTV: string | null = null;
    let currentImageFile: string | null = null;
    let selectedRoiFileData: any = null;

    // Extract values from latest state
    this.setState(prev => {
      selectedLearningFolder = prev.selectedLearningFolder;
      selectedCCTV = prev.selectedCCTV;
      currentImageFile = prev.currentImageFile;
      selectedRoiFileData = prev.selectedRoiFileData;
      return { ...prev, loading: true, error: null };
    });

    if (!selectedLearningFolder || !selectedCCTV || !currentImageFile) {
      console.warn('[LearningDataVM] Missing required data to load image', {
        selectedLearningFolder,
        selectedCCTV,
        currentImageFile,
      });
      return;
    }

    try {
      console.log('[LearningDataVM] Loading image:', {
        folder: selectedLearningFolder,
        cctv: selectedCCTV,
        file: currentImageFile,
      });

      const imageUrl = await LearningDataService.getFirstImage(
        this.projectId,
        selectedLearningFolder,
        selectedCCTV,
        currentImageFile
      );

      console.log('[LearningDataVM] Image loaded successfully, URL:', imageUrl);

      // Initialize edited ROIs from ROI file data
      // ROI file structure: { "IP": { "cctv_id": "P1_B4_1_2", "matches": [...] } }
      let editedROIs: ROIPolygon[] = [];

      if (selectedRoiFileData) {
        // Find matching CCTV by iterating through IP addresses
        let matchingCCTVData: any = null;
        let matchingIP: string | null = null;

        for (const [ipAddress, cctvData] of Object.entries(selectedRoiFileData)) {
          if ((cctvData as any).cctv_id === selectedCCTV) {
            matchingCCTVData = cctvData;
            matchingIP = ipAddress;
            break;
          }
        }

        console.log('[LearningDataVM] ROI matching:', {
          hasRoiFileData: true,
          selectedCCTV: selectedCCTV,
          matchingIP: matchingIP,
          matchFound: !!matchingCCTVData,
          matchCount: matchingCCTVData?.matches?.length || 0,
        });

        if (matchingCCTVData && matchingCCTVData.matches) {
          // Convert ROI matches to ROIPolygon format
          editedROIs = matchingCCTVData.matches.map((match: any, index: number) => ({
            roi_id: match.parking_id,
            coords: match.original_roi,
            occupied: false,
          }));
          console.log('[LearningDataVM] Loaded ROIs:', editedROIs.length, 'regions from IP', matchingIP);
        } else {
          console.warn('[LearningDataVM] No ROI match for CCTV:', selectedCCTV);
        }
      } else {
        console.warn('[LearningDataVM] No ROI file data loaded');
      }

      this.setState(prev => ({
        ...prev,
        currentImage: imageUrl,
        editedROIs,
        hasUnsavedChanges: false,
        loading: false,
      }));
    } catch (error) {
      console.error('[LearningDataVM] Failed to load image:', error);
      this.setState(prev => ({
        ...prev,
        loading: false,
        error: 'Failed to load image.',
      }));
    }
  }

  /**
   * Toggle ROI occupied state (fill/empty)
   */
  toggleROIOccupied(roiId: string): void {
    console.log('[LearningDataVM] Toggling ROI occupied state:', roiId);

    this.setState(prev => {
      const editedROIs = prev.editedROIs.map(roi =>
        roi.roi_id === roiId ? { ...roi, occupied: !roi.occupied } : roi
      );

      return {
        ...prev,
        editedROIs,
        hasUnsavedChanges: true,
      };
    });
  }

  /**
   * Fill ROI (mark as occupied)
   */
  fillROI(roiId: string): void {
    console.log('[LearningDataVM] Filling ROI:', roiId);

    this.setState(prev => {
      const editedROIs = prev.editedROIs.map(roi =>
        roi.roi_id === roiId ? { ...roi, occupied: true } : roi
      );

      return {
        ...prev,
        editedROIs,
        hasUnsavedChanges: true,
      };
    });
  }

  /**
   * Empty ROI (mark as vacant)
   */
  emptyROI(roiId: string): void {
    console.log('[LearningDataVM] Emptying ROI:', roiId);

    this.setState(prev => {
      const editedROIs = prev.editedROIs.map(roi =>
        roi.roi_id === roiId ? { ...roi, occupied: false } : roi
      );

      return {
        ...prev,
        editedROIs,
        hasUnsavedChanges: true,
      };
    });
  }

  /**
   * Save edited image
   */
  async saveEditedImage(): Promise<void> {
    const { currentImage, currentImageFile, selectedLearningFolder, selectedCCTV, editedROIs } =
      this.state;

    if (!currentImage || !currentImageFile || !selectedLearningFolder || !selectedCCTV) {
      console.error('[LearningDataVM] Missing required data to save image');
      return;
    }

    this.setState(prev => ({ ...prev, saving: true, error: null }));

    try {
      console.log('[LearningDataVM] Saving edited image...');

      // Create canvas to draw edited image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Failed to get canvas context');

      // Load original image
      const img = new Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
        img.src = currentImage;
      });

      canvas.width = img.width;
      canvas.height = img.height;

      // Draw original image
      ctx.drawImage(img, 0, 0);

      // Fill occupied ROIs with white
      editedROIs.forEach(roi => {
        if (roi.occupied) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.beginPath();
          ctx.moveTo(roi.coords[0], roi.coords[1]);
          for (let i = 2; i < roi.coords.length; i += 2) {
            ctx.lineTo(roi.coords[i], roi.coords[i + 1]);
          }
          ctx.closePath();
          ctx.fill();
        }
      });

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(blob => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to create blob'));
        }, 'image/jpeg', 0.95);
      });

      // Save to server
      await LearningDataService.saveEditedImage({
        projectId: this.projectId,
        folderPath: selectedLearningFolder,
        cctvId: selectedCCTV,
        imageFile: currentImageFile,
        imageData: blob,
      });

      console.log('[LearningDataVM] Image saved successfully');

      this.setState(prev => ({
        ...prev,
        saving: false,
        hasUnsavedChanges: false,
        successMessage: 'Image saved successfully!',
      }));

      // Clear success message after 3 seconds
      setTimeout(() => {
        this.setState(prev => ({ ...prev, successMessage: null }));
      }, 3000);
    } catch (error) {
      console.error('[LearningDataVM] Failed to save image:', error);
      this.setState(prev => ({
        ...prev,
        saving: false,
        error: 'Failed to save edited image.',
      }));
    }
  }

  /**
   * Reset current editing state
   */
  reset(): void {
    console.log('[LearningDataVM] Resetting state');

    this.setState(prev => ({
      ...prev,
      selectedRoiFile: null,
      selectedRoiFileData: null,
      selectedLearningFolder: null,
      selectedCCTV: null,
      currentImage: null,
      currentImageFile: null,
      editedROIs: [],
      hasUnsavedChanges: false,
      error: null,
      successMessage: null,
    }));
  }
}
