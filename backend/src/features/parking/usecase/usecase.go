package usecase

import (
	"fmt"
	"io"
	"io/fs"
	"main/features/parking/model/request"
	"mime/multipart"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/ssh"
)

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

// 디렉토리 내 파일 수를 세는 헬퍼 함수
func countFilesInDirectory(dirPath string) (int, error) {
	count := 0
	err := filepath.WalkDir(dirPath, func(path string, d fs.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if !d.IsDir() {
			count++
		}
		return nil
	})
	return count, err
}

func validatePaths(path string) error {
	if _, err := os.Stat(path); os.IsNotExist(err) {
		return fmt.Errorf("경로가 존재하지 않습니다: %s", path)
	}
	return nil
}

// 원격 파일 정보 조회
func getRemoteFileInfo(client *ssh.Client, remotePath string) (*struct {
	Size int64
	Mode os.FileMode
}, error) {
	session, err := client.NewSession()
	if err != nil {
		return nil, err
	}
	defer session.Close()

	output, err := session.Output(fmt.Sprintf("stat -c '%%s %%a' %s", remotePath))
	if err != nil {
		return nil, err
	}

	var size int64
	var mode uint32
	_, err = fmt.Sscanf(string(output), "%d %o", &size, &mode)
	if err != nil {
		return nil, err
	}

	return &struct {
		Size int64
		Mode os.FileMode
	}{
		Size: size,
		Mode: os.FileMode(mode),
	}, nil
}

// 파일 다운로드
func downloadFile(client *ssh.Client, remotePath, localPath string) error {
	// 원격 파일 읽기
	session, err := client.NewSession()
	if err != nil {
		return err
	}
	defer session.Close()

	// 원격 파일을 stdout으로 출력하는 명령어
	session.Stdout = nil
	output, err := session.Output(fmt.Sprintf("cat %s", remotePath))
	if err != nil {
		return fmt.Errorf("원격 파일 읽기 실패: %v", err)
	}

	// 로컬 파일 생성
	localFile, err := os.Create(localPath)
	if err != nil {
		return fmt.Errorf("로컬 파일 생성 실패: %v", err)
	}
	defer localFile.Close()

	// 파일 내용 쓰기
	_, err = io.Copy(localFile, strings.NewReader(string(output)))
	if err != nil {
		return fmt.Errorf("파일 쓰기 실패: %v", err)
	}

	return nil
}

// 파라미터 검증 함수
func ValidateLearningRequest(req request.ReqLearning) error {
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

// 파라미터 검증 함수
func ValidateLiveLearningRequest(req request.ReqLiveLearning) error {
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

	if req.RoiPath == "" {
		return echo.NewHTTPError(http.StatusBadRequest, fmt.Sprintf("RoiPath는 필수입니다. %s", req.RoiPath))
	}

	return nil
}

func getCurrentTimestamp() string {
	return time.Now().Format("20060102150405")
}
