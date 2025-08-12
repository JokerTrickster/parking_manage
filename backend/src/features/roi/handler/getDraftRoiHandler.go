package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"net/http"

	"github.com/labstack/echo/v4"
)

type GetDraftRoiHandler struct {
	UseCase _interface.IGetDraftRoiUseCase
}

func NewGetDraftRoiHandler(c *echo.Echo, useCase _interface.IGetDraftRoiUseCase) _interface.IGetDraftRoiHandler {
	handler := &GetDraftRoiHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/roi/:projectId/draft", handler.GetDraftRoi)
	return handler
}

// GetDraftRoi 초안 JSON 파일 조회
// @Router /v0.1/roi/{projectId}/draft [get]
// @Summary ROI 초안 조회
// @Description
// @Description 초안 JSON 파일을 읽어서 필요한 정보만 응답합니다.
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
// @Param        file        query     string  true  "ROI File Name"
// @Success 200 {object} response.ResDraftRoi
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *GetDraftRoiHandler) GetDraftRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId가 필요합니다",
		})
	}

	roiFileName := c.QueryParam("file")
	if roiFileName == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "file 파라미터가 필요합니다",
		})
	}

	res, err := d.UseCase.GetDraftRoi(ctx, projectID, roiFileName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "초안 조회 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
