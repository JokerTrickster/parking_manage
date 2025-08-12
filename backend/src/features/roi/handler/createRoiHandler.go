package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"main/features/roi/model/request"
	"net/http"

	"github.com/labstack/echo/v4"
)

type CreateRoiHandler struct {
	UseCase _interface.ICreateRoiUseCase
}

func NewCreateRoiHandler(c *echo.Echo, useCase _interface.ICreateRoiUseCase) _interface.ICreateRoiHandler {
	handler := &CreateRoiHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/roi/:projectId/create", handler.CreateRoi)
	return handler
}

// CreateRoi ROI 생성
// @Router /v0.1/roi/{projectId}/create [post]
// @Summary ROI 생성
// @Description
// @Description CCTV ID와 ROI ID에 해당하는 좌표를 입력한 좌표로 변경합니다.
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
// @Param        request     body      request.CreateRoiRequest  true  "Create ROI Request"
// @Success 200 {object} response.ResCreateRoi
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *CreateRoiHandler) CreateRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId가 필요합니다",
		})
	}
	var req request.CreateRoiRequest
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

	res, err := d.UseCase.CreateRoi(ctx, projectID, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "ROI 생성 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
