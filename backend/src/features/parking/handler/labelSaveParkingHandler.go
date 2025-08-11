package handler

import (
	"net/http"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"

	"github.com/labstack/echo/v4"
)

type LabelSaveParkingHandler struct {
	UseCase _interface.ILabelSaveParkingUseCase
}

func NewLabelSaveParkingHandler(c *echo.Echo, useCase _interface.ILabelSaveParkingUseCase) _interface.ILabelSaveParkingHandler {
	handler := &LabelSaveParkingHandler{UseCase: useCase}
	c.POST("/v0.1/parking/:projectId/labels/:folderPath/:cctvId", handler.SaveLabels)
	return handler
}

// @Summary 라벨 데이터 저장
// @Description CCTV의 라벨 데이터를 저장합니다.
// @Tags Labels
// @Accept json
// @Produce json
// @Param projectId path string true "프로젝트 ID"
// @Param folderPath path string true "폴더 경로"
// @Param cctvId path string true "CCTV ID"
// @Param request body request.ReqLabelSave true "라벨 데이터"
// @Success 200 {object} response.ResSaveLabel "라벨 데이터 저장 성공"
// @Failure 400 {object} map[string]interface{} "잘못된 요청"
// @Failure 500 {object} map[string]interface{} "서버 오류"
// @Router /v0.1/parking/{projectId}/labels/{folderPath}/{cctvId} [post]
func (d *LabelSaveParkingHandler) SaveLabels(c echo.Context) error {
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

	var req request.ReqLabelSave
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid request body: " + err.Error(),
		})
	}

	res, err := d.UseCase.SaveLabels(ctx, projectID, folderPath, cctvID, req.Labels)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Failed to save labels: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
