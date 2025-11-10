package usecase

import (
	"context"
	"time"

	"main/features/parking/model/entity"
	_interface "main/features/parking/model/interface"
)

type DeploymentResultUseCase struct {
	Repository     _interface.IDeploymentResultRepository
	ContextTimeout time.Duration
}

func NewDeploymentResultUseCase(repo _interface.IDeploymentResultRepository, timeout time.Duration) _interface.IDeploymentResultUseCase {
	return &DeploymentResultUseCase{Repository: repo, ContextTimeout: timeout}
}

// GetAllByProjectID retrieves all deployment results for a project
func (u *DeploymentResultUseCase) GetAllByProjectID(ctx context.Context, projectID string) ([]entity.DeploymentResult, error) {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	return u.Repository.GetAllByProjectID(projectID)
}

// GetByID retrieves a single deployment result by ID
func (u *DeploymentResultUseCase) GetByID(ctx context.Context, id uint) (*entity.DeploymentResult, error) {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	return u.Repository.GetByID(id)
}

// Create creates a new deployment result
func (u *DeploymentResultUseCase) Create(ctx context.Context, deployment *entity.DeploymentResult) error {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	// Set timestamps
	deployment.DeployedAt = time.Now()
	deployment.CreatedAt = time.Now()
	deployment.UpdatedAt = time.Now()

	return u.Repository.Create(deployment)
}

// Update updates an existing deployment result
func (u *DeploymentResultUseCase) Update(ctx context.Context, deployment *entity.DeploymentResult) error {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	deployment.UpdatedAt = time.Now()
	return u.Repository.Update(deployment)
}

// Delete deletes a deployment result
func (u *DeploymentResultUseCase) Delete(ctx context.Context, id uint) error {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	return u.Repository.Delete(id)
}

// GetStats retrieves deployment statistics for a project
func (u *DeploymentResultUseCase) GetStats(ctx context.Context, projectID string) (*entity.DeploymentStats, error) {
	_, cancel := context.WithTimeout(ctx, u.ContextTimeout)
	defer cancel()

	return u.Repository.GetStats(projectID)
}
