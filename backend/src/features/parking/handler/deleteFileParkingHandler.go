package handler

import (
	"main/common"
	"main/features/parking/model/request"
	"net/http"

	_interface "main/features/parking/model/interface"

	"github.com/labstack/echo/v4"
)

type DeleteFileParkingHandler struct {
	UseCase _interface.IDeleteFileParkingUseCase
}

func NewDeleteFileParkingHandler(c *echo.Echo, useCase _interface.IDeleteFileParkingUseCase) _interface.IDeleteFileParkingHandler {
	handler := &DeleteFileParkingHandler{
		UseCase: useCase,
	}
	c.DELETE("/v0.1/parking/:projectId/:folderPath", handler.DeleteFile)
	return handler
}

// 파일/폴더 삭제
// @Router /v0.1/parking/{projectId}/{folderPath} [delete]
// @Summary 파일/폴더 삭제
// @Description
// @Description 지정된 프로젝트의 파일/폴더를 삭제합니다.
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
// @Param        request     body      request.ReqDeleteFile  true  "삭제할 파일/폴더 정보"
// @Success 200 {object} response.ResDeleteFile
// @Failure 400 {object} map[string]interface{}
// @Failure 500 {object} map[string]interface{}
// @Tags parking
func (d *DeleteFileParkingHandler) DeleteFile(c echo.Context) error {
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

	var req request.ReqDeleteFile
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "요청 데이터를 파싱할 수 없습니다: " + err.Error(),
		})
	}

	// 요청 데이터 검증
	if req.DeleteName == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "deleteName이 필요합니다",
		})
	}

	res, err := d.UseCase.DeleteFile(ctx, projectID, folderPath, req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "삭제 처리 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, res)
}
