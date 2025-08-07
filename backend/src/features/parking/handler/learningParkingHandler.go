package handler

import (
	"fmt"
	"net/http"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"

	"github.com/labstack/echo/v4"
)

type LearningParkingHandler struct {
	UseCase _interface.ILearningParkingUseCase
}

func NewLearningParkingHandler(c *echo.Echo, useCase _interface.ILearningParkingUseCase) _interface.ILearningParkingHandler {
	handler := &LearningParkingHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/parking/:projectId/learning", handler.Learning)
	return handler
}

// 학습 실행
// @Router /v0.1/parking/{projectId}/learning [post]
// @Summary 학습 실행
// @Description OpenCV를 사용하여 주차면 학습을 실행합니다.
// @Accept json
// @Produce json
// @Param projectId path string true "프로젝트 ID"
// @Param request body request.ReqLearning true "학습 요청 데이터"
// @Success 200 {object} response.ResLearning
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
func (d *LearningParkingHandler) Learning(c echo.Context) error {
	// 프로젝트 ID 가져오기
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "프로젝트 ID가 필요합니다.",
		})
	}

	// 요청 데이터 파싱
	var req request.ReqLearning
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "요청 데이터 파싱에 실패했습니다: " + err.Error(),
		})
	}

	// 파라미터 검증
	if err := validateLearningRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "파라미터 검증에 실패했습니다: " + err.Error(),
		})
	}

	// UseCase 호출
	result, err := d.UseCase.Learning(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "학습 실행 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, result)
}

// 파라미터 검증 함수
func validateLearningRequest(req request.ReqLearning) error {
	// LearningRate 검증 (0.0 ~ 1.0)
	if req.LearningRate < 0.0 || req.LearningRate > 1.0 {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("LearningRate는 0.0에서 1.0 사이의 값이어야 합니다. %f", req.LearningRate))
	}

	// Iterations 검증 (1 ~ 10000)
	if req.Iterations < 1 || req.Iterations > 10000 {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("Iterations는 1에서 10000 사이의 값이어야 합니다. %d", req.Iterations))
	}

	// VarThreshold 검증 (1이상)
	if req.VarThreshold <= 0 {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("VarThreshold는 0.0에서 1.0 사이의 값이어야 합니다. %f", req.VarThreshold))
	}

	// 경로 검증
	if req.LearningPath == "" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("LearningPath는 필수입니다. %s", req.LearningPath))
	}
	if req.TestPath == "" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("TestPath는 필수입니다. %s", req.TestPath))
	}
	if req.RoiPath == "" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("RoiPath는 필수입니다. %s", req.RoiPath))
	}

	return nil
}
