package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/request"
	"net/http"

	"github.com/labstack/echo/v4"
)

type UpdateRoiHandler struct {
	UseCase _interface.IUpdateRoiUseCase
}

func NewUpdateRoiHandler(c *echo.Echo, useCase _interface.IUpdateRoiUseCase) _interface.IUpdateRoiHandler {
	handler := &UpdateRoiHandler{
		UseCase: useCase,
	}
	c.PUT("/v0.1/roi/{projectId}/update", handler.UpdateRoi)
	return handler
}

// UpdateRoi ROI 수정
// @Router /v0.1/roi/{projectId}/update [put]
// @Summary ROI 수정
// @Description
// @Description CCTV ID와 ROI ID에 해당하는 좌표를 새로운 좌표로 변경합니다.
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
// @Param        request     body      request.UpdateRoiRequest  true  "Update ROI Request"
// @Success 200 {object} response.ResUpdateRoi
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *UpdateRoiHandler) UpdateRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "project_id가 필요합니다",
		})
	}
	var req request.UpdateRoiRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "요청 데이터 파싱 실패: " + err.Error(),
		})
	}

	if req.RoiFile == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "roi_file이 필요합니다",
		})
	}

	res, err := d.UseCase.UpdateRoi(ctx, projectID, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "ROI 수정 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
