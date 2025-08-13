package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"net/http"

	"github.com/labstack/echo/v4"
)

type GetImageRoiHandler struct {
	UseCase _interface.IGetImageRoiUseCase
}

func NewGetImageRoiHandler(c *echo.Echo, useCase _interface.IGetImageRoiUseCase) _interface.IGetImageRoiHandler {
	handler := &GetImageRoiHandler{
		UseCase: useCase,
	}
	c.GET("/v0.1/roi/:projectId/:folderPath", handler.GetImageRoi)
	return handler
}

// 이미지 파일 조회
// @Router /v0.1/roi/{projectId}/{folderPath} [get]
// @Summary 이미지 파일 조회
// @Description
// @Description 프로젝트의 특정 폴더에서 이미지 파일을 조회합니다.
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
// @Param        folderPath  path      string  true  "Folder Path"
// @Param        file        query     string  true  "File Name"
// @Success 200 {object} response.ResGetImageRoi
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *GetImageRoiHandler) GetImageRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)
	projectID := c.Param("projectId")
	folderPath := c.Param("folderPath")
	fileName := c.QueryParam("file")

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

	if fileName == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "file 파라미터가 필요합니다",
		})
	}

	res, err := d.UseCase.GetImageRoi(ctx, projectID, folderPath, fileName)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "이미지 조회 중 오류가 발생했습니다: " + err.Error(),
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
