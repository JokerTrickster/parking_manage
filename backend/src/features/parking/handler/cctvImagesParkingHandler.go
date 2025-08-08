package handler

import (
	"main/common"
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type CctvImagesParkingHandler struct {
	UseCase _interface.ICctvImagesParkingUseCase
}

func NewCctvImagesParkingHandler(c *echo.Echo, useCase _interface.ICctvImagesParkingUseCase) _interface.ICctvImagesParkingHandler {
	handler := &CctvImagesParkingHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/parking/:projectId/:folder/:cctvId/images", handler.GetCctvImages)
	return handler
}

// Get CCTV Images
// @Router /v0.1/parking/{projectId}/{folder}/{cctvId}/images [get]
// @Summary Get CCTV Images
// @Description Gets the ROI result and foreground mask images for a specific CCTV
// @Accept json
// @Produce json
// @Param projectId path string true "Project ID"
// @Param folder path string true "Learning result folder"
// @Param cctvId path string true "CCTV ID"
// @Success 200 {object} response.ResCctvImages
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *CctvImagesParkingHandler) GetCctvImages(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)

	projectID := c.Param("projectId")
	folder := c.Param("folder")
	cctvID := c.Param("cctvId")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId is required",
		})
	}

	if folder == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "timestamp is required",
		})
	}

	if cctvID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "cctvId is required",
		})
	}

	res, err := d.UseCase.GetCctvImages(ctx, projectID, folder, cctvID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "Error getting CCTV images: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
