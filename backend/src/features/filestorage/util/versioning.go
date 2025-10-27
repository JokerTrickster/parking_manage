package util

import (
	"fmt"
	"path/filepath"
	"strconv"
	"strings"
	"time"
)

// GenerateVersionedFilename adds timestamp suffix to filename
// Example: "parking_map.json" -> "parking_map_1698765432.json"
func GenerateVersionedFilename(originalName string) string {
	ext := filepath.Ext(originalName)
	nameWithoutExt := strings.TrimSuffix(originalName, ext)
	timestamp := GetTimestamp()

	return fmt.Sprintf("%s_%s%s", nameWithoutExt, timestamp, ext)
}

// ParseVersionFromFilename extracts original name and version from versioned filename
// Returns: originalName, version, error
// Example: "parking_map_1698765432.json" -> "parking_map.json", "1698765432", nil
func ParseVersionFromFilename(versionedName string) (string, string, error) {
	ext := filepath.Ext(versionedName)
	nameWithoutExt := strings.TrimSuffix(versionedName, ext)

	// Find last underscore
	lastUnderscoreIdx := strings.LastIndex(nameWithoutExt, "_")
	if lastUnderscoreIdx == -1 {
		// No version found, return original name
		return versionedName, "", nil
	}

	possibleVersion := nameWithoutExt[lastUnderscoreIdx+1:]

	// Validate it's a timestamp (all digits)
	if _, err := strconv.ParseInt(possibleVersion, 10, 64); err != nil {
		// Not a valid version, return original name
		return versionedName, "", nil
	}

	originalName := nameWithoutExt[:lastUnderscoreIdx] + ext
	return originalName, possibleVersion, nil
}

// GetTimestamp returns current Unix timestamp as string
func GetTimestamp() string {
	return strconv.FormatInt(time.Now().Unix(), 10)
}

// IsVersionedFilename checks if filename has version suffix
func IsVersionedFilename(filename string) bool {
	_, version, _ := ParseVersionFromFilename(filename)
	return version != ""
}

// ExtractOriginalName returns original filename without version
func ExtractOriginalName(filename string) string {
	original, _, _ := ParseVersionFromFilename(filename)
	return original
}
