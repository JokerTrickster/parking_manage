package handler

import (
	"main/common"
	_interface "main/features/parking/model/interface"
	"net/http"

	"github.com/labstack/echo/v4"
)

type LearningStatsParkingHandler struct {
	UseCase _interface.ILearningStatsParkingUseCase
}

func NewLearningStatsParkingHandler(c *echo.Echo, useCase _interface.ILearningStatsParkingUseCase) _interface.ILearningStatsParkingHandler {
	handler := &LearningStatsParkingHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/parking/:projectId/images/train-folders", handler.GetLearningStats)
	return handler
}

// 학습 이미지 폴더 통계 조회
// @Router /v0.1/parking/{projectId}/images/train-folders [get]
// @Summary 학습 이미지 폴더 통계 조회
// @Description
// @Description 프로젝트의 학습 이미지 폴더 목록과 통계를 조회합니다.
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
// @Success 200 {object} response.ResLearningStats
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *LearningStatsParkingHandler) GetLearningStats(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId가 필요합니다",
		})
	}

	res, err := d.UseCase.GetLearningStats(ctx, projectID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "폴더 통계 조회 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
