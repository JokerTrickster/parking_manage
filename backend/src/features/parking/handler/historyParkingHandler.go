package handler

import (
	"main/common"
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type HistoryParkingHandler struct {
	UseCase _interface.IHistoryParkingUseCase
}

func NewHistoryParkingHandler(c *echo.Echo, useCase _interface.IHistoryParkingUseCase) _interface.IHistoryParkingHandler {
	handler := &HistoryParkingHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/parking/:projectId/history", handler.GetHistory)
	return handler
}

// Get History
// @Router /v0.1/parking/{projectId}/history [get]
// @Summary Get Learning History
// @Description Gets the learning history for a project
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Success 200 {object} response.ResHistory
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *HistoryParkingHandler) GetHistory(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	res, err := d.UseCase.GetHistory(ctx, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting history: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
