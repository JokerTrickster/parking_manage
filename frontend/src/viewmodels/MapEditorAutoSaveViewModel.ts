/**
 * Map Editor Auto-Save ViewModel
 *
 * Manages the state and logic for auto-saving map editor data to the server
 * Implements fire-and-forget pattern (202 Accepted)
 */

import { FileStorageService } from '../services/FileStorageService';
import { AutoSaveState } from '../models/FileStorage';

/**
 * MapEditorAutoSaveViewModel Class
 *
 * Responsibilities:
 * - Auto-save map JSON to server when user exports
 * - Maintain local download functionality (existing behavior)
 * - Track save state (saving, success, error)
 * - Fire-and-forget pattern: doesn't block UI
 */
export class MapEditorAutoSaveViewModel {
  private state: AutoSaveState;
  private setState: React.Dispatch<React.SetStateAction<AutoSaveState>>;

  constructor(
    state: AutoSaveState,
    setState: React.Dispatch<React.SetStateAction<AutoSaveState>>
  ) {
    this.state = state;
    this.setState = setState;
  }

  /**
   * Auto-save map data to server
   *
   * This method:
   * 1. Converts map data to JSON blob
   * 2. Creates a File object
   * 3. Calls auto-upload API (returns 202 immediately)
   * 4. Updates state to show success
   * 5. Auto-hides success message after 2 seconds
   *
   * Errors are logged but NOT shown to user (fire-and-forget)
   *
   * @param projectId - Current project identifier
   * @param mapData - Map editor data object
   */
  async autoSave(projectId: string, mapData: object): Promise<void> {
    try {
      console.log('[MapEditorAutoSave] Starting auto-save:', { projectId });

      this.setState({
        saving: true,
        success: null,
        error: null,
      });

      // Convert map data to JSON blob
      const jsonString = JSON.stringify(mapData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const file = new File([blob], 'parking_map.json', { type: 'application/json' });

      // Call auto-upload API (202 Accepted response)
      await FileStorageService.autoUploadMap(projectId, file);

      // Success - mark as saved
      this.setState({
        saving: false,
        success: true,
        error: null,
      });

      console.log('[MapEditorAutoSave] Auto-save successful');

      // Auto-hide success message after 2 seconds
      setTimeout(() => {
        this.setState(prev => ({
          ...prev,
          success: null,
        }));
      }, 2000);

    } catch (error) {
      console.error('[MapEditorAutoSave] Auto-save failed:', error);

      // Don't show error to user - just log it
      // Backend will log the actual upload failure
      this.setState({
        saving: false,
        success: false,
        error: null, // Don't expose error to user
      });

      // Auto-hide failure indicator after 2 seconds
      setTimeout(() => {
        this.setState(prev => ({
          ...prev,
          success: null,
        }));
      }, 2000);
    }
  }

  /**
   * Download map data locally (existing functionality)
   *
   * Creates a download link and triggers browser download.
   * This preserves the existing behavior of local file export.
   *
   * @param mapData - Map editor data object
   * @param filename - Desired filename (default: parking_map.json)
   */
  downloadLocal(mapData: object, filename: string = 'parking_map.json'): void {
    try {
      console.log('[MapEditorAutoSave] Downloading locally:', filename);

      const jsonString = JSON.stringify(mapData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      window.URL.revokeObjectURL(url);

      console.log('[MapEditorAutoSave] Local download successful');
    } catch (error) {
      console.error('[MapEditorAutoSave] Local download failed:', error);
      this.setState({
        saving: false,
        success: false,
        error: '로컬 다운로드에 실패했습니다.',
      });
    }
  }

  /**
   * Export map (combined: local download + server upload)
   *
   * This is the main method to be called from the map editor.
   * It performs both local download (existing) and server upload (new).
   *
   * @param projectId - Current project identifier
   * @param mapData - Map editor data object
   * @param filename - Desired filename for local download
   */
  async export(
    projectId: string,
    mapData: object,
    filename: string = 'parking_map.json'
  ): Promise<void> {
    // Local download first (user sees file immediately)
    this.downloadLocal(mapData, filename);

    // Then auto-save to server (background, non-blocking)
    if (projectId) {
      await this.autoSave(projectId, mapData);
    } else {
      console.warn('[MapEditorAutoSave] No project ID - skipping server upload');
    }
  }

  /**
   * Reset state
   * Clears all state flags
   */
  resetState(): void {
    this.setState({
      saving: false,
      success: null,
      error: null,
    });
  }

  // Getters
  get saving(): boolean {
    return this.state.saving;
  }

  get success(): boolean | null {
    return this.state.success;
  }

  get error(): string | null {
    return this.state.error;
  }
}
