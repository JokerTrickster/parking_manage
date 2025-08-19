package handler

import (
	"net/http"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"
	"main/features/parking/model/response"
	"main/features/parking/usecase"

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
// @Tags parking
func (d *LearningParkingHandler) Learning(c echo.Context) error {
	// 프로젝트 ID 가져오기
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, response.ResLearning{
			FolderPath: "",
		})
	}

	// 요청 데이터 파싱
	var req request.ReqLearning
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, response.ResLearning{
			FolderPath: "",
		})
	}

	// 파라미터 검증
	if err := usecase.ValidateLearningRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, response.ResLearning{
			FolderPath: "",
		})
	}

	// UseCase 호출
	result, err := d.UseCase.Learning(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, response.ResLearning{
			FolderPath: "",
		})
	}

	return c.JSON(http.StatusOK, result)
}
