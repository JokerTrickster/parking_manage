package handler

import (
	"main/common"
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type BatchImagesParkingHandler struct {
	UseCase _interface.IBatchImagesParkingUseCase
}

func NewBatchImagesParkingHandler(c *echo.Echo, useCase _interface.IBatchImagesParkingUseCase) _interface.IBatchImagesParkingHandler {
	handler := &BatchImagesParkingHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/parking/:projectId/images/batch", handler.BatchImages)
	return handler
}

// 배치로 이미지 저장하기
// @Router /v0.1/parking/{projectId}/images/batch [post]
// @Summary 배치로 이미지 저장하기
// @Description 배치로 이미지 저장하기
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *BatchImagesParkingHandler) BatchImages(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	err := d.UseCase.BatchImages(ctx, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting image: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "Image batch processing completed",
	})
}
