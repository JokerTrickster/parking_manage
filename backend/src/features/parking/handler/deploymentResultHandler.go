package handler

import (
	"main/common"
	"main/features/parking/model/entity"
	_interface "main/features/parking/model/interface"
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
)

type DeploymentResultHandler struct {
	UseCase _interface.IDeploymentResultUseCase
}

func NewDeploymentResultHandler(c *echo.Echo, useCase _interface.IDeploymentResultUseCase) _interface.IDeploymentResultHandler {
	handler := &DeploymentResultHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/parking/:projectId/deployments", handler.GetAllDeployments)
	c.GET("/v0.1/parking/:projectId/deployments/:id", handler.GetDeploymentByID)
	c.GET("/v0.1/parking/:projectId/deployments/stats", handler.GetDeploymentStats)
	c.POST("/v0.1/parking/:projectId/deployments", handler.CreateDeployment)
	c.PUT("/v0.1/parking/:projectId/deployments/:id", handler.UpdateDeployment)
	c.DELETE("/v0.1/parking/:projectId/deployments/:id", handler.DeleteDeployment)
	return handler
}

// GetAllDeployments
// @Router /v0.1/parking/{projectId}/deployments [get]
// @Summary Get All Deployment Results
// @Description Gets all deployment results for a project
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (h *DeploymentResultHandler) GetAllDeployments(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	deployments, err := h.UseCase.GetAllByProjectID(ctx, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting deployments: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Deployments retrieved successfully",
		"data":    deployments,
	})
}

// GetDeploymentByID
// @Router /v0.1/parking/{projectId}/deployments/{id} [get]
// @Summary Get Deployment Result by ID
// @Description Gets a specific deployment result by ID
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param id path int true "Deployment ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 404 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (h *DeploymentResultHandler) GetDeploymentByID(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	idStr := c.Param("id")

	if projectID == "" || idStr == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId and id are required",
		})
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid deployment ID",
		})
	}

	deployment, err := h.UseCase.GetByID(ctx, uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": "Deployment not found: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Deployment retrieved successfully",
		"data":    deployment,
	})
}

// GetDeploymentStats
// @Router /v0.1/parking/{projectId}/deployments/stats [get]
// @Summary Get Deployment Statistics
// @Description Gets deployment statistics for a project
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (h *DeploymentResultHandler) GetDeploymentStats(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	stats, err := h.UseCase.GetStats(ctx, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting deployment stats: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Deployment stats retrieved successfully",
		"data":    stats,
	})
}

// CreateDeployment
// @Router /v0.1/parking/{projectId}/deployments [post]
// @Summary Create Deployment Result
// @Description Creates a new deployment result
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param deployment body entity.DeploymentResult true "Deployment data"
// @Success 201 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (h *DeploymentResultHandler) CreateDeployment(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	var deployment entity.DeploymentResult
	if err := c.Bind(&deployment); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid request body: " + err.Error(),
		})
	}

	deployment.ProjectID = projectID

	err := h.UseCase.Create(ctx, &deployment)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error creating deployment: " + err.Error(),
		})
	}

	return c.JSON(http.StatusCreated, map[string]interface{}{
		"success": true,
		"message": "Deployment created successfully",
		"data":    deployment,
	})
}

// UpdateDeployment
// @Router /v0.1/parking/{projectId}/deployments/{id} [put]
// @Summary Update Deployment Result
// @Description Updates an existing deployment result
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param id path int true "Deployment ID"
// @Param deployment body entity.DeploymentResult true "Deployment data"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (h *DeploymentResultHandler) UpdateDeployment(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	idStr := c.Param("id")

	if projectID == "" || idStr == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId and id are required",
		})
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid deployment ID",
		})
	}

	var deployment entity.DeploymentResult
	if err := c.Bind(&deployment); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid request body: " + err.Error(),
		})
	}

	deployment.ID = uint(id)
	deployment.ProjectID = projectID

	err = h.UseCase.Update(ctx, &deployment)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error updating deployment: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Deployment updated successfully",
		"data":    deployment,
	})
}

// DeleteDeployment
// @Router /v0.1/parking/{projectId}/deployments/{id} [delete]
// @Summary Delete Deployment Result
// @Description Deletes a deployment result
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param id path int true "Deployment ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (h *DeploymentResultHandler) DeleteDeployment(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	idStr := c.Param("id")

	if projectID == "" || idStr == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId and id are required",
		})
	}

	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid deployment ID",
		})
	}

	err = h.UseCase.Delete(ctx, uint(id))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error deleting deployment: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Deployment deleted successfully",
	})
}
