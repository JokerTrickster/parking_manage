package handler

import (
	"main/common"
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type LearningResultsParkingHandler struct {
	UseCase _interface.ILearningResultsParkingUseCase
}

func NewLearningResultsParkingHandler(c *echo.Echo, useCase _interface.ILearningResultsParkingUseCase) _interface.ILearningResultsParkingHandler {
	handler := &LearningResultsParkingHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/parking/:projectId/learning-results/:folder", handler.GetLearningResults)
	return handler
}

// Get Learning Results
// @Router /v0.1/parking/{projectId}/learning-results/{folder} [get]
// @Summary Get Learning Results
// @Description Gets the list of CCTV results for a specific learning session
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param folder path string true "Learning result folder"
// @Success 200 {object} response.ResLearningResults
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *LearningResultsParkingHandler) GetLearningResults(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	folder := c.Param("folder")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	if folder == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "timestamp is required",
		})
	}

	res, err := d.UseCase.GetLearningResults(ctx, projectID, folder)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting learning results: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
