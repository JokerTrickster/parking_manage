package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/request"
	"net/http"

	"github.com/labstack/echo/v4"
)

type DeleteRoiHandler struct {
	UseCase _interface.IDeleteRoiUseCase
}

func NewDeleteRoiHandler(c *echo.Echo, useCase _interface.IDeleteRoiUseCase) _interface.IDeleteRoiHandler {
	handler := &DeleteRoiHandler{
		UseCase: useCase,
	}
	c.DELETE("/v0.1/roi/:projectId/delete", handler.DeleteRoi)
	return handler
}

// DeleteRoi ROI 삭제
// @Router /v0.1/roi/{projectId}/delete [delete]
// @Summary ROI 삭제
// @Description
// @Description CCTV ID와 ROI ID에 해당하는 좌표를 빈 배열로 설정합니다.
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
// @Param        request     body      request.DeleteRoiRequest  true  "Delete ROI Request"
// @Success 200 {object} response.ResDeleteRoi
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *DeleteRoiHandler) DeleteRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "project_id가 필요합니다",
		})
	}
	var req request.DeleteRoiRequest
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

	res, err := d.UseCase.DeleteRoi(ctx, projectID, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "ROI 삭제 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
