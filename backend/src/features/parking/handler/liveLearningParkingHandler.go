package handler

import (
	"net/http"

	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"
	"main/features/parking/model/response"
	"main/features/parking/usecase"

	"github.com/labstack/echo/v4"
)

type LiveLearningParkingHandler struct {
	UseCase _interface.ILiveLearningParkingUseCase
}

func NewLiveLearningParkingHandler(c *echo.Echo, useCase _interface.ILiveLearningParkingUseCase) _interface.ILiveLearningParkingHandler {
	handler := &LiveLearningParkingHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/parking/:projectId/learning/live", handler.LiveLearning)
	return handler
}

// 실시간 이미지 학습 실행
// @Router /v0.1/parking/{projectId}/learning/live [post]
// @Summary 실시간 이미지 학습 실행
// @Description OpenCV를 사용하여 주차면 학습을 실행합니다.
// @Accept json
// @Produce json
// @Param projectId path string true "프로젝트 ID"
// @Param request body request.ReqLiveLearning true "학습 요청 데이터"
// @Success 200 {object} response.ResLiveLearning
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *LiveLearningParkingHandler) LiveLearning(c echo.Context) error {
	// 프로젝트 ID 가져오기
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, response.ResLearning{
			FolderPath: "",
		})
	}

	// 요청 데이터 파싱
	var req request.ReqLiveLearning
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, response.ResLearning{
			FolderPath: "",
		})
	}

	// 파라미터 검증
	if err := usecase.ValidateLiveLearningRequest(req); err != nil {
		return c.JSON(http.StatusBadRequest, response.ResLearning{
			FolderPath: "",
		})
	}

	// UseCase 호출
	result, err := d.UseCase.LiveLearning(c.Request().Context(), req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, response.ResLearning{
			FolderPath: "",
		})
	}

	return c.JSON(http.StatusOK, result)
}
