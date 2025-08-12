package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"net/http"

	"github.com/labstack/echo/v4"
)

type DraftRoiHandler struct {
	UseCase _interface.IDraftRoiUseCase
}

func NewDraftRoiHandler(c *echo.Echo, useCase _interface.IDraftRoiUseCase) _interface.IDraftRoiHandler {
	handler := &DraftRoiHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/roi/:projectId/draft", handler.CreateDraftRoi)
	return handler
}

// ROI 드래프트 생성
// @Router /v0.1/roi/{projectId}/draft [post]
// @Summary ROI 드래프트 생성
// @Description
// @Description 지정된 ROI 파일을 기반으로 draft 폴더에 초안을 생성합니다.
// @Description
// @Description ■ errCode with 400
// @Description PARAM_BAD : 파라미터 오류
// @Description
// @Description ■ errCode with 500
// @Description INTERNAL_SERVER : 내부 로직 처리 실패
// @Description INTERNAL_DB : DB 처리 실패
// @Description
// @Accept json
// @Produce json
// @Param        projectId   path      string  true  "Project ID"
// @Param        file        query     string  true  "ROI File Name"
// @Success 200 {object} map[string]interface{}
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *DraftRoiHandler) CreateDraftRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	// projectID는 현재 세션에서 가져오거나 다른 방법으로 설정
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

	err := d.UseCase.CreateDraftRoi(ctx, projectID, roiFileName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "드래프트 생성 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success": true,
		"message": "드래프트가 성공적으로 생성되었습니다",
	})
}
