package util

import (
	"strings"
	"testing"
	"time"
)

func TestGenerateVersionedFilename(t *testing.T) {
	tests := []struct {
		name         string
		originalName string
	}{
		{
			name:         "JSON file",
			originalName: "parking_map.json",
		},
		{
			name:         "DWG file",
			originalName: "site_layout.dwg",
		},
		{
			name:         "File with multiple dots",
			originalName: "config.backup.json",
		},
		{
			name:         "File without extension",
			originalName: "readme",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			result := GenerateVersionedFilename(tt.originalName)

			// Check that result contains original name
			if !strings.Contains(result, strings.TrimSuffix(tt.originalName, "."+strings.Split(tt.originalName, ".")[len(strings.Split(tt.originalName, "."))-1])) {
				t.Errorf("GenerateVersionedFilename() result = %v, should contain base name from %v", result, tt.originalName)
			}

			// Check that result contains underscore (version separator)
			if !strings.Contains(result, "_") {
				t.Errorf("GenerateVersionedFilename() result = %v, should contain underscore", result)
			}
		})
	}
}

func TestGenerateVersionedFilename_UniqueTimestamps(t *testing.T) {
	// Generate two versioned filenames with small delay
	v1 := GenerateVersionedFilename("test.json")
	time.Sleep(1 * time.Second)
	v2 := GenerateVersionedFilename("test.json")

	if v1 == v2 {
		t.Errorf("GenerateVersionedFilename() should generate unique timestamps, got same: %v", v1)
	}
}

func TestParseVersionFromFilename(t *testing.T) {
	tests := []struct {
		name            string
		versionedName   string
		wantOriginal    string
		wantVersion     string
		wantHasVersion  bool
	}{
		{
			name:            "Versioned JSON file",
			versionedName:   "parking_map_1698765432.json",
			wantOriginal:    "parking_map.json",
			wantVersion:     "1698765432",
			wantHasVersion:  true,
		},
		{
			name:            "Versioned DWG file",
			versionedName:   "site_layout_1698765432.dwg",
			wantOriginal:    "site_layout.dwg",
			wantVersion:     "1698765432",
			wantHasVersion:  true,
		},
		{
			name:            "Non-versioned file",
			versionedName:   "image001.jpg",
			wantOriginal:    "image001.jpg",
			wantVersion:     "",
			wantHasVersion:  false,
		},
		{
			name:            "File with underscore in name",
			versionedName:   "roi_config_1698765432.json",
			wantOriginal:    "roi_config.json",
			wantVersion:     "1698765432",
			wantHasVersion:  true,
		},
		{
			name:            "File with non-numeric suffix",
			versionedName:   "file_backup.json",
			wantOriginal:    "file_backup.json",
			wantVersion:     "",
			wantHasVersion:  false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gotOriginal, gotVersion, err := ParseVersionFromFilename(tt.versionedName)

			if err != nil {
				t.Errorf("ParseVersionFromFilename() error = %v", err)
				return
			}

			if gotOriginal != tt.wantOriginal {
				t.Errorf("ParseVersionFromFilename() gotOriginal = %v, want %v", gotOriginal, tt.wantOriginal)
			}

			if gotVersion != tt.wantVersion {
				t.Errorf("ParseVersionFromFilename() gotVersion = %v, want %v", gotVersion, tt.wantVersion)
			}

			hasVersion := gotVersion != ""
			if hasVersion != tt.wantHasVersion {
				t.Errorf("ParseVersionFromFilename() hasVersion = %v, want %v", hasVersion, tt.wantHasVersion)
			}
		})
	}
}

func TestGetTimestamp(t *testing.T) {
	timestamp := GetTimestamp()

	// Check that it's a numeric string
	if timestamp == "" {
		t.Error("GetTimestamp() returned empty string")
	}

	// Check that it's not too short (Unix timestamp should be 10+ digits)
	if len(timestamp) < 10 {
		t.Errorf("GetTimestamp() = %v, length should be at least 10 digits", timestamp)
	}

	// Check that second call produces same or later timestamp
	time.Sleep(1 * time.Second)
	timestamp2 := GetTimestamp()

	if timestamp2 < timestamp {
		t.Errorf("GetTimestamp() second call = %v, should be >= first call %v", timestamp2, timestamp)
	}
}

func TestIsVersionedFilename(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     bool
	}{
		{
			name:     "Versioned file",
			filename: "parking_map_1698765432.json",
			want:     true,
		},
		{
			name:     "Non-versioned file",
			filename: "image001.jpg",
			want:     false,
		},
		{
			name:     "File with non-numeric suffix",
			filename: "file_backup.json",
			want:     false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := IsVersionedFilename(tt.filename); got != tt.want {
				t.Errorf("IsVersionedFilename() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestExtractOriginalName(t *testing.T) {
	tests := []struct {
		name     string
		filename string
		want     string
	}{
		{
			name:     "Versioned file",
			filename: "parking_map_1698765432.json",
			want:     "parking_map.json",
		},
		{
			name:     "Non-versioned file",
			filename: "image001.jpg",
			want:     "image001.jpg",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if got := ExtractOriginalName(tt.filename); got != tt.want {
				t.Errorf("ExtractOriginalName() = %v, want %v", got, tt.want)
			}
		})
	}
}

func TestRoundTripVersioning(t *testing.T) {
	// Test that generating and parsing works correctly round-trip
	originalNames := []string{
		"parking_map.json",
		"site_layout.dwg",
		"roi_config.json",
	}

	for _, original := range originalNames {
		t.Run(original, func(t *testing.T) {
			// Generate versioned filename
			versioned := GenerateVersionedFilename(original)

			// Parse it back
			parsed, version, err := ParseVersionFromFilename(versioned)

			if err != nil {
				t.Errorf("ParseVersionFromFilename() error = %v", err)
			}

			if parsed != original {
				t.Errorf("Round trip failed: original = %v, parsed = %v", original, parsed)
			}

			if version == "" {
				t.Error("Version should not be empty after round trip")
			}
		})
	}
}
