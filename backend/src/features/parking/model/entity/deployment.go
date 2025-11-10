package entity

import "time"

// DeploymentResult represents a deployment result record
type DeploymentResult struct {
	ID          uint      `json:"id" gorm:"primaryKey"`
	ProjectID   string    `json:"project_id" gorm:"index;not null"`
	Version     string    `json:"version" gorm:"not null"`
	Status      string    `json:"status" gorm:"not null"` // success, failed, in_progress
	DeployedBy  string    `json:"deployed_by"`
	DeployedAt  time.Time `json:"deployed_at" gorm:"not null"`
	Environment string    `json:"environment"`            // production, staging, development
	Branch      string    `json:"branch"`
	CommitHash  string    `json:"commit_hash"`
	Description string    `json:"description" gorm:"type:text"`
	Logs        string    `json:"logs" gorm:"type:text"`
	CreatedAt   time.Time `json:"created_at" gorm:"autoCreateTime"`
	UpdatedAt   time.Time `json:"updated_at" gorm:"autoUpdateTime"`
}

// TableName specifies the table name for GORM
func (DeploymentResult) TableName() string {
	return "deployment_results"
}

// DeploymentStats represents deployment statistics for a project
type DeploymentStats struct {
	ProjectID        string            `json:"project_id"`
	TotalDeployments int64             `json:"total_deployments"`
	SuccessCount     int64             `json:"success_count"`
	FailedCount      int64             `json:"failed_count"`
	LastDeployment   *DeploymentResult `json:"last_deployment"`
}
