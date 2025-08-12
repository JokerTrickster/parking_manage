package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/request"
	"net/http"

	"github.com/labstack/echo/v4"
)

type ReadRoiHandler struct {
	UseCase _interface.IReadRoiUseCase
}

func NewReadRoiHandler(c *echo.Echo, useCase _interface.IReadRoiUseCase) _interface.IReadRoiHandler {
	handler := &ReadRoiHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/roi/:projectId/read", handler.ReadRoi)
	return handler
}

// ReadRoi ROI 읽기
// @Router /v0.1/roi/{projectId}/read [post]
// @Summary ROI 읽기
// @Description
// @Description CCTV ID에 해당하는 모든 ROI 좌표를 배열로 반환합니다.
// @Description
// @Description ■ errCode with 400
// @Description PARAM_BAD : 파라미터 오류
// @Description
// @Description ■ errCode with 500
// @Description INTERNAL_SERVER : 내부 로직 처리 실패
// @Description
// @Accept json
// @Produce json
// @Param        projectId   path      string  true  "Project ID"
// @Param        request     body      request.ReadRoiRequest  true  "Read ROI Request"
// @Success 200 {object} response.ResReadRoi
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *ReadRoiHandler) ReadRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "project_id가 필요합니다",
		})
	}
	var req request.ReadRoiRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "요청 데이터 파싱 실패: " + err.Error(),
		})
	}

	if req.CctvID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "cctv_id가 필요합니다",
		})
	}

	if req.RoiFile == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "roi_file이 필요합니다",
		})
	}

	res, err := d.UseCase.ReadRoi(ctx, projectID, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "ROI 읽기 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
