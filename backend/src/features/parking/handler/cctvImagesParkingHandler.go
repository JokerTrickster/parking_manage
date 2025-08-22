package handler

import (
	"main/common"
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type CctvImageParkingHandler struct {
	UseCase _interface.ICctvImageParkingUseCase
}

func NewCctvImageParkingHandler(c *echo.Echo, useCase _interface.ICctvImageParkingUseCase) _interface.ICctvImageParkingHandler {
	handler := &CctvImageParkingHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/parking/:projectId/:cctvId/images/:imageType", handler.GetCctvImage)
	return handler
}

// 실시간 이미지 가져오기
// @Router /v0.1/parking/{projectId}/{cctvId}/images/{imageType} [get]
// @Summary 실시간 이미지 가져오기
// @Description 실시간 이미지 가져오기
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param cctvId path string true "CCTV ID"
// @Param imageType path string true "Image type (roi_result or fgmask)"
// @Success 200 {object} response.ResCctvImage
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *CctvImageParkingHandler) GetCctvImage(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	cctvID := c.Param("cctvId")
	imageType := c.Param("imageType")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	if cctvID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "cctvId is required",
		})
	}

	if imageType == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "imageType is required",
		})
	}

	res, err := d.UseCase.GetCctvImage(ctx, projectID, cctvID, imageType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting CCTV image: " + err.Error(),
		})
	}
	if res.Success {
		// 이미지 데이터를 직접 응답으로 전송
		c.Response().Header().Set("Content-Type", res.ContentType)
		c.Response().Header().Set("Cache-Control", "public, max-age=3600") // 1시간 캐시
		c.Response().Header().Set("Access-Control-Allow-Origin", "*")
		c.Response().Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type")
		return c.Blob(http.StatusOK, res.ContentType, res.Image)
	} else {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": res.Message,
		})
	}
}
