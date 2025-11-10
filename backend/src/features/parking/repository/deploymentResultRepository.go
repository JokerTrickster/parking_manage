package repository

import (
	"main/features/parking/model/entity"
	_interface "main/features/parking/model/interface"

	"gorm.io/gorm"
)

func NewDeploymentResultRepository(gormDB *gorm.DB) _interface.IDeploymentResultRepository {
	return &DeploymentResultRepository{GormDB: gormDB}
}

// GetAllByProjectID retrieves all deployment results for a specific project
func (r *DeploymentResultRepository) GetAllByProjectID(projectID string) ([]entity.DeploymentResult, error) {
	var deployments []entity.DeploymentResult
	err := r.GormDB.Where("project_id = ?", projectID).
		Order("deployed_at DESC").
		Find(&deployments).Error
	return deployments, err
}

// GetByID retrieves a single deployment result by ID
func (r *DeploymentResultRepository) GetByID(id uint) (*entity.DeploymentResult, error) {
	var deployment entity.DeploymentResult
	err := r.GormDB.First(&deployment, id).Error
	if err != nil {
		return nil, err
	}
	return &deployment, nil
}

// Create creates a new deployment result
func (r *DeploymentResultRepository) Create(deployment *entity.DeploymentResult) error {
	return r.GormDB.Create(deployment).Error
}

// Update updates an existing deployment result
func (r *DeploymentResultRepository) Update(deployment *entity.DeploymentResult) error {
	return r.GormDB.Save(deployment).Error
}

// Delete deletes a deployment result
func (r *DeploymentResultRepository) Delete(id uint) error {
	return r.GormDB.Delete(&entity.DeploymentResult{}, id).Error
}

// GetStats retrieves deployment statistics for a project
func (r *DeploymentResultRepository) GetStats(projectID string) (*entity.DeploymentStats, error) {
	var stats entity.DeploymentStats
	stats.ProjectID = projectID

	// Count total deployments
	r.GormDB.Model(&entity.DeploymentResult{}).
		Where("project_id = ?", projectID).
		Count(&stats.TotalDeployments)

	// Count successful deployments
	r.GormDB.Model(&entity.DeploymentResult{}).
		Where("project_id = ? AND status = ?", projectID, "success").
		Count(&stats.SuccessCount)

	// Count failed deployments
	r.GormDB.Model(&entity.DeploymentResult{}).
		Where("project_id = ? AND status = ?", projectID, "failed").
		Count(&stats.FailedCount)

	// Get last deployment
	var lastDeployment entity.DeploymentResult
	err := r.GormDB.Where("project_id = ?", projectID).
		Order("deployed_at DESC").
		First(&lastDeployment).Error

	if err == nil {
		stats.LastDeployment = &lastDeployment
	}

	return &stats, nil
}
