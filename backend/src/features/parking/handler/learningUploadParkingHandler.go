package handler

import (
	"fmt"
	"io"
	"main/common"
	mw "main/middleware"
	"net/http"
	"os"
	"path/filepath"
	"time"

	_interface "main/features/parking/model/interface"

	"mime/multipart"

	"github.com/labstack/echo/v4"
)

type LearningUploadParkingHandler struct {
	UseCase _interface.ILearningUploadParkingUseCase
}

func NewLearningUploadParkingHandler(c *echo.Echo, useCase _interface.ILearningUploadParkingUseCase) _interface.ILearningUploadParkingHandler {
	handler := &LearningUploadParkingHandler{
		UseCase: useCase,
	}
	c.POST("/v0.1/parking/:projectId/train-images", handler.LearningUpload, mw.TokenChecker)
	return handler
}

// 학습 이미지 업로드
// @Router /v0.1/parking/{projectId}/train-images [post]
// @Summary 학습 이미지 업로드
// @Description
// @Description ■ errCode with 400
// @Description PARAM_BAD : 파라미터 오류
// @Description
// @Description ■ errCode with 500
// @Description INTERNAL_SERVER : 내부 로직 처리 실패
// @Description INTERNAL_DB : DB 처리 실패
// @Description
// @Produce json
// @Success 200 {object} bool
// @Failure 400 {object} error
// @Failure 500 {object} error
// @Tags parking
func (d *LearningUploadParkingHandler) LearningUpload(c echo.Context) error {
	projectID := c.Param("projectId")

	if projectID == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "projectId가 필요합니다",
		})
	}

	// 저장 경로 설정
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", "learningImages")

	// 폴더 생성
	if err := os.MkdirAll(targetPath, 0755); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "폴더 생성 실패: " + err.Error(),
		})
	}

	// 폴더 업로드 처리 (여러 파일)
	form, err := c.MultipartForm()
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"success": false,
			"message": "파일을 찾을 수 없습니다: " + err.Error(),
		})
	}

	files := form.File["files"]
	if len(files) == 0 {
		// 단일 파일 업로드 처리
		file, err := c.FormFile("file")
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]interface{}{
				"success": false,
				"message": "파일을 찾을 수 없습니다: " + err.Error(),
			})
		}
		files = []*multipart.FileHeader{file}
	}

	savedCount := 0
	var savedFiles []string

	for _, file := range files {
		// 파일명 생성 (타임스탬프 추가)
		timestamp := time.Now().UnixNano()
		fileName := fmt.Sprintf("learning_%d_%s", timestamp, file.Filename)
		filePath := filepath.Join(targetPath, fileName)

		// 파일 저장
		if err := saveUploadedFile(file, filePath); err != nil {
			fmt.Printf("파일 저장 실패: %s - %v\n", fileName, err)
			continue
		}

		savedCount++
		savedFiles = append(savedFiles, filePath)
		fmt.Printf("파일 저장 완료: %s\n", filePath)
	}

	// UseCase 호출 (기존 로직 유지)
	ctx, _, _ := common.CtxGenerate(c)
	if err := d.UseCase.LearningUpload(ctx); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"success": false,
			"message": "업로드 처리 중 오류가 발생했습니다: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"success":   true,
		"message":   fmt.Sprintf("%d/%d 개 파일이 성공적으로 저장되었습니다", savedCount, len(files)),
		"file_path": targetPath,
		"files":     savedFiles,
	})
}

// saveUploadedFile 파일 저장 헬퍼 함수
func saveUploadedFile(file *multipart.FileHeader, filePath string) error {
	src, err := file.Open()
	if err != nil {
		return err
	}
	defer src.Close()

	dst, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer dst.Close()

	_, err = io.Copy(dst, src)
	return err
}
