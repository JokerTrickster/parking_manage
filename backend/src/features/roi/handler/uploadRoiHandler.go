package handler

import (
	"main/common"
	_interface "main/features/roi/model/interface"
	"mime/multipart"
	"net/http"

	"github.com/labstack/echo/v4"
)

type UploadRoiHandler struct {
	UseCase _interface.IUploadRoiUseCase
}

func NewUploadRoiHandler(c *echo.Echo, useCase _interface.IUploadRoiUseCase) _interface.IUploadRoiHandler {
	handler := &UploadRoiHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/roi/:projectId/test-images", handler.UploadRoi)
	return handler
}

// 이미지 폴더 업로드
// @Router /v0.1/roi/{projectId}/test-images [post]
// @Summary 이미지 폴더 업로드
// @Description
// @Description 이미지 폴더를 서버에 저장합니다.
// @Description
// @Description ■ errCode with 400
// @Description PARAM_BAD : 파라미터 오류
// @Description
// @Description ■ errCode with 500
// @Description INTERNAL_SERVER : 내부 로직 처리 실패
// @Description INTERNAL_DB : DB 처리 실패
// @Description
// @Accept multipart/form-data
// @Produce json
// @Param        projectId   path      string  true  "Project ID"
// @Param        files       formData  file    true  "학습 이미지 폴더 내 파일들"
// @Success 200 {object} response.ResUpload
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags roi
func (d *UploadRoiHandler) UploadRoi(c echo.Context) error {
	ctx, _, _ := common.CtxGenerate(c)
	projectID := c.Param("projectId")
	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId가 필요합니다",
		})
	}

	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "multipart 폼 데이터를 파싱할 수 없습니다: " + err.Error(),
		})
	}

	var files []*multipart.FileHeader
	if formFiles := form.File["files"]; len(formFiles) > 0 {
		files = formFiles
	} else {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "업로드할 파일이 없습니다. 'files' 키로 JSON 파일들을 전송해주세요.",
		})
	}

	if len(files) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "업로드할 파일이 없습니다",
		})
	}

	res, err := d.UseCase.UploadRoi(ctx, projectID, files)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "업로드 처리 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
