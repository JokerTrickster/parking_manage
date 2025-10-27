package entity

// FileCategory represents the type of file being stored
type FileCategory string

const (
	CategoryMap      FileCategory = "map"
	CategoryCAD      FileCategory = "cad"
	CategoryROI      FileCategory = "roi"
	CategoryLearning FileCategory = "learning"
	CategoryTest     FileCategory = "test"
)

// IsVersioned returns true if the category supports automatic versioning
func (c FileCategory) IsVersioned() bool {
	return c == CategoryMap || c == CategoryCAD || c == CategoryROI
}

// IsValid checks if the category is valid
func (c FileCategory) IsValid() bool {
	switch c {
	case CategoryMap, CategoryCAD, CategoryROI, CategoryLearning, CategoryTest:
		return true
	default:
		return false
	}
}

// GetBasePath returns the filesystem base path for this category
// Example: "shared/{projectId}/map/"
func (c FileCategory) GetBasePath(projectID string) string {
	return string(c) + "/"
}

// String returns the string representation of the category
func (c FileCategory) String() string {
	return string(c)
}
