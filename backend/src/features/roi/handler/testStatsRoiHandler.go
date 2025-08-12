package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"net/http"

	"github.com/labstack/echo/v4"
)

type TestStatsRoiHandler struct {
	UseCase _interface.ITestStatsRoiUseCase
}

func NewTestStatsRoiHandler(c *echo.Echo, useCase _interface.ITestStatsRoiUseCase) _interface.ITestStatsRoiHandler {
	handler := &TestStatsRoiHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/roi/:projectId/:folderPath/images", handler.GetTestStats)
	return handler
}

// 테스트 이미지 파일 조회
// @Router /v0.1/roi/{projectId}/{folderPath}/images [get]
// @Summary 테스트 이미지 파일 조회
// @Description
// @Description 프로젝트의 특정 폴더 내 이미지 파일 목록을 조회합니다.
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
// @Param        folderPath  path      string  true  "Folder Path"
// @Success 200 {object} response.ResTestStatsRoi
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *TestStatsRoiHandler) GetTestStats(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)
	projectID := c.Param("projectId")
	folderPath := c.Param("folderPath")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId가 필요합니다",
		})
	}

	if folderPath == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "folderPath가 필요합니다",
		})
	}

	res, err := d.UseCase.GetTestStats(ctx, projectID, folderPath)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "이미지 통계 조회 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
