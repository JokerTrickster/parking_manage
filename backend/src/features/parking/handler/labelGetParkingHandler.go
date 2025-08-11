package handler

import (
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type LabelGetParkingHandler struct {
	UseCase _interface.ILabelGetParkingUseCase
}

func NewLabelGetParkingHandler(c *echo.Echo, useCase _interface.ILabelGetParkingUseCase) _interface.ILabelGetParkingHandler {
	handler := &LabelGetParkingHandler{UseCase: useCase}
	c.GET("/v0.1/parking/:projectId/labels/:folderPath/:cctvId", handler.GetLabels)
	return handler
}

// @Summary 라벨 데이터 조회
// @Description 특정 CCTV의 라벨 데이터를 조회합니다.
// @Tags Labels
// @Accept json
// @Produce json
// @Param projectId path string true "프로젝트 ID"
// @Param folderPath path string true "폴더 경로"
// @Param cctvId path string true "CCTV ID"
// @Success 200 {object} response.ResGetLabel "라벨 데이터 조회 성공"
// @Failure 400 {object} map[string]interface{} "잘못된 요청"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /v0.1/parking/{projectId}/labels/{folderPath}/{cctvId} [get]
func (d *LabelGetParkingHandler) GetLabels(c echo.Context) error {
	ctx := c.Request().Context()
	projectID := c.Param("projectId")
	folderPath := c.Param("folderPath")
	cctvID := c.Param("cctvId")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	if folderPath == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "folderPath is required",
		})
	}

	if cctvID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "cctvId is required",
		})
	}

	res, err := d.UseCase.GetLabels(ctx, projectID, folderPath, cctvID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Failed to get labels: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
