export const validateFileType = (file: File, allowedTypes: string[]): boolean => {
  const fileExtension = file.name.split('.').pop()?.toLowerCase();
  return allowedTypes.includes(`.${fileExtension}`);
};

export const validateFileSize = (file: File, maxSizeMB: number): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return file.size <= maxSizeBytes;
};

export const validateProjectId = (projectId: string): boolean => {
  return /^[a-zA-Z0-9_-]+$/.test(projectId);
};

export const validateVarThreshold = (value: number): boolean => {
  return value >= 0 && value <= 100;
}; 