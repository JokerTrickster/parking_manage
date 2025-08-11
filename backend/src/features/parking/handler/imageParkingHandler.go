package handler

import (
	"main/common"
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type ImageParkingHandler struct {
	UseCase _interface.IImageParkingUseCase
}

func NewImageParkingHandler(c *echo.Echo, useCase _interface.IImageParkingUseCase) _interface.IImageParkingHandler {
	handler := &ImageParkingHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/parking/:projectId/:folderPath/:cctvId/images/:imageType", handler.GetImage)
	return handler
}

// 이미지 불러오기
// @Router /v0.1/parking/{projectId}/{folderPath}/{cctvId}/images/{imageType} [get]
// @Summary 이미지 불러오기
// @Description Gets a specific image (roi_result or fgmask) for a CCTV
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param folderPath path string true "Learning result folder path"
// @Param cctvId path string true "CCTV ID"
// @Param imageType path string true "Image type (roi_result or fgmask)"
// @Success 200 {object} response.ResImage
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *ImageParkingHandler) GetImage(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	folderPath := c.Param("folderPath")
	cctvID := c.Param("cctvId")
	imageType := c.Param("imageType")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	if folderPath == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "folderPath is required",
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

	// 유효한 이미지 타입인지 확인
	if imageType != "roi_result" && imageType != "fgmask" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "Invalid imageType. Supported types: roi_result, fgmask",
		})
	}

	res, err := d.UseCase.GetImage(ctx, projectID, folderPath, cctvID, imageType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting image: " + err.Error(),
		})
	}

	if res.Success {
		// 이미지 데이터를 직접 응답으로 전송
		c.Response().Header().Set("Content-Type", res.ContentType)
		c.Response().Header().Set("Cache-Control", "public, max-age=3600") // 1시간 캐시
		c.Response().Header().Set("Access-Control-Allow-Origin", "*")
		c.Response().Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
		c.Response().Header().Set("Access-Control-Allow-Headers", "Content-Type")
		return c.Blob(http.StatusOK, res.ContentType, res.Data)
	} else {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"success": false,
			"message": res.Message,
		})
	}
}
