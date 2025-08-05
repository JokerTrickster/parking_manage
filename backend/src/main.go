package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

// ParkingDetectionRequest 요청 구조체
type ParkingDetectionRequest struct {
	CctvID        string  `json:"cctv_id" binding:"required"`
	VarThreshold  float64 `json:"var_threshold" binding:"required"`
	LearningPath  string  `json:"learning_path" binding:"required"`
	TestImagePath string  `json:"test_image_path" binding:"required"`
	JsonPath      string  `json:"json_path" binding:"required"`
}

// ParkingDetectionResponse 응답 구조체
type ParkingDetectionResponse struct {
	Success bool   `json:"success"`
	Message string `json:"message"`
	Data    struct {
		ResultPath string `json:"result_path,omitempty"`
	} `json:"data,omitempty"`
}

// ROI 결과 구조체
type RoiResult struct {
	RoiIndex        int     `json:"roi_index"`
	ForegroundRatio float64 `json:"foreground_ratio"`
}

// 저장된 결과 구조체
type SavedResult struct {
	CctvID        string      `json:"cctv_id"`
	Timestamp     string      `json:"timestamp"`
	VarThreshold  float64     `json:"var_threshold"`
	LearningPath  string      `json:"learning_path"`
	TestImagePath string      `json:"test_image_path"`
	RoiResults    []RoiResult `json:"roi_results"`
}

// 파일 업로드 요청 구조체
type FileUploadRequest struct {
	ProjectID string `form:"project_id" binding:"required"`
	FileType  string `form:"file_type" binding:"required"`
}

// 프로젝트 구조체
type Project struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Location    string `json:"location"`
}

// 프로젝트 통계 구조체
type ProjectStats struct {
	LearningImagesCount int `json:"learning_images_count"`
	TestImagesCount     int `json:"test_images_count"`
	MatchedCount        int `json:"matched_count"`
}

func main() {
	r := gin.Default()

	// CORS 설정
	config := cors.DefaultConfig()
	config.AllowAllOrigins = true
	config.AllowMethods = []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"}
	config.AllowHeaders = []string{"Origin", "Content-Type", "Accept", "Authorization"}
	r.Use(cors.New(config))

	// API 라우트 설정
	api := r.Group("/api")
	{
		api.POST("/detect-parking", detectParking)
		api.GET("/results/:timestamp", getResult)
		api.GET("/results", getAllResults)
		api.POST("/upload", uploadFile)
		api.GET("/projects", getProjects)
		api.GET("/project/:id/stats", getProjectStats)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("서버가 포트 %s에서 시작됩니다...", port)
	r.Run(":" + port)
}

// detectParking 주차 감지 API
func detectParking(c *gin.Context) {
	var req ParkingDetectionRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, ParkingDetectionResponse{
			Success: false,
			Message: "잘못된 요청 형식: " + err.Error(),
		})
		return
	}

	// 경로 검증
	if err := validatePaths(req); err != nil {
		c.JSON(http.StatusBadRequest, ParkingDetectionResponse{
			Success: false,
			Message: "경로 검증 실패: " + err.Error(),
		})
		return
	}

	// C++ 실행 파일 경로
	cppExecPath := "../opencv/build/main"

	// 명령행 인자 구성
	args := []string{
		req.CctvID,
		fmt.Sprintf("%.2f", req.VarThreshold),
		req.LearningPath,
		req.TestImagePath,
		req.JsonPath,
	}

	// C++ 프로그램 실행
	cmd := exec.Command(cppExecPath, args...)
	output, err := cmd.CombinedOutput()

	if err != nil {
		log.Printf("C++ 프로그램 실행 오류: %v", err)
		log.Printf("출력: %s", string(output))
		c.JSON(http.StatusInternalServerError, ParkingDetectionResponse{
			Success: false,
			Message: "알고리즘 실행 실패: " + err.Error(),
		})
		return
	}

	// 결과 파일 경로 생성 (타임스탬프 기반)
	timestamp := time.Now().Format("20060102_150405_000")
	resultPath := fmt.Sprintf("../../shared/results/%s", timestamp)
	resultFile := filepath.Join(resultPath, timestamp+"_parking_result.json")

	// 결과 파일 존재 확인
	if _, err := os.Stat(resultFile); os.IsNotExist(err) {
		c.JSON(http.StatusInternalServerError, ParkingDetectionResponse{
			Success: false,
			Message: "결과 파일이 생성되지 않았습니다",
		})
		return
	}

	c.JSON(http.StatusOK, ParkingDetectionResponse{
		Success: true,
		Message: "주차 감지가 성공적으로 완료되었습니다",
		Data: struct {
			ResultPath string `json:"result_path,omitempty"`
		}{
			ResultPath: resultFile,
		},
	})
}

// getResult 특정 결과 조회 API
func getResult(c *gin.Context) {
	timestamp := c.Param("timestamp")
	resultPath := fmt.Sprintf("../../shared/results/%s", timestamp)
	resultFile := filepath.Join(resultPath, timestamp+"_parking_result.json")

	// 파일 존재 확인
	if _, err := os.Stat(resultFile); os.IsNotExist(err) {
		c.JSON(http.StatusNotFound, gin.H{
			"success": false,
			"message": "결과 파일을 찾을 수 없습니다",
		})
		return
	}

	// 파일 읽기
	data, err := os.ReadFile(resultFile)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "결과 파일을 읽을 수 없습니다: " + err.Error(),
		})
		return
	}

	// JSON 파싱
	var result SavedResult
	if err := json.Unmarshal(data, &result); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "결과 파일 형식이 잘못되었습니다: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    result,
	})
}

// getAllResults 모든 결과 조회 API
func getAllResults(c *gin.Context) {
	resultsDir := "../../shared/results"

	// 디렉토리 존재 확인
	if _, err := os.Stat(resultsDir); os.IsNotExist(err) {
		c.JSON(http.StatusOK, gin.H{
			"success": true,
			"data":    []interface{}{},
		})
		return
	}

	// 디렉토리 읽기
	entries, err := os.ReadDir(resultsDir)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "결과 디렉토리를 읽을 수 없습니다: " + err.Error(),
		})
		return
	}

	var results []map[string]interface{}
	for _, entry := range entries {
		if entry.IsDir() {
			timestamp := entry.Name()
			resultFile := filepath.Join(resultsDir, timestamp, timestamp+"_parking_result.json")

			if data, err := os.ReadFile(resultFile); err == nil {
				var result SavedResult
				if json.Unmarshal(data, &result) == nil {
					results = append(results, map[string]interface{}{
						"timestamp": timestamp,
						"cctv_id":   result.CctvID,
						"result":    result,
					})
				}
			}
		}
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    results,
	})
}

// uploadFile 파일 업로드 API
func uploadFile(c *gin.Context) {
	var req FileUploadRequest
	if err := c.ShouldBind(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "잘못된 요청 형식: " + err.Error(),
		})
		return
	}

	// 파일 검증
	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "파일을 찾을 수 없습니다: " + err.Error(),
		})
		return
	}

	// 파일 타입 검증
	if req.FileType != "learning" && req.FileType != "test" {
		c.JSON(http.StatusBadRequest, gin.H{
			"success": false,
			"message": "잘못된 파일 타입입니다. 'learning' 또는 'test'만 허용됩니다.",
		})
		return
	}

	// 업로드 디렉토리 생성
	uploadDir := fmt.Sprintf("../../shared/uploads/%sImages/%s", req.FileType, req.ProjectID)
	if err := os.MkdirAll(uploadDir, 0755); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "업로드 디렉토리 생성 실패: " + err.Error(),
		})
		return
	}

	// 파일 저장
	filename := file.Filename
	if req.FileType == "test" {
		// 테스트 이미지는 단일 파일로 저장
		filename = req.ProjectID + ".jpg"
	}

	filePath := filepath.Join(uploadDir, filename)
	if err := c.SaveUploadedFile(file, filePath); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"success": false,
			"message": "파일 저장 실패: " + err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"success":   true,
		"message":   "파일이 성공적으로 업로드되었습니다",
		"file_path": filePath,
	})
}

// getProjects 프로젝트 목록 조회 API
func getProjects(c *gin.Context) {
	projects := []Project{
		{
			ID:          "banpo",
			Name:        "반포",
			Description: "반포 주차장 관리 시스템",
			Location:    "서울특별시 서초구 반포동",
		},
		{
			ID:          "gwangju",
			Name:        "전라남도 광주",
			Description: "광주 주차장 관리 시스템",
			Location:    "전라남도 광주시",
		},
		{
			ID:          "busan",
			Name:        "부산",
			Description: "부산 주차장 관리 시스템",
			Location:    "부산광역시",
		},
		{
			ID:          "daegu",
			Name:        "대구",
			Description: "대구 주차장 관리 시스템",
			Location:    "대구광역시",
		},
	}

	c.JSON(http.StatusOK, gin.H{
		"success": true,
		"data":    projects,
	})
}

// getProjectStats 프로젝트 통계 조회 API
func getProjectStats(c *gin.Context) {
	projectID := c.Param("id")

	// 실제로는 파일 시스템에서 통계를 계산해야 함
	// 여기서는 임시 데이터를 반환 (projectID에 따라 다른 값 반환)
	var stats ProjectStats
	switch projectID {
	case "banpo":
		stats = ProjectStats{
			LearningImagesCount: 150,
			TestImagesCount:     25,
			MatchedCount:        23,
		}
	case "gwangju":
		stats = ProjectStats{
			LearningImagesCount: 200,
			TestImagesCount:     30,
			MatchedCount:        28,
		}
	default:
		stats = ProjectStats{
			LearningImagesCount: 100,
			TestImagesCount:     20,
			MatchedCount:        18,
		}
	}

	c.JSON(http.StatusOK, stats)
}

// validatePaths 경로 검증 함수
func validatePaths(req ParkingDetectionRequest) error {
	// 학습 경로 확인
	if _, err := os.Stat(req.LearningPath); os.IsNotExist(err) {
		return fmt.Errorf("학습 경로가 존재하지 않습니다: %s", req.LearningPath)
	}

	// 테스트 이미지 확인
	if _, err := os.Stat(req.TestImagePath); os.IsNotExist(err) {
		return fmt.Errorf("테스트 이미지가 존재하지 않습니다: %s", req.TestImagePath)
	}

	// JSON 파일 확인
	if _, err := os.Stat(req.JsonPath); os.IsNotExist(err) {
		return fmt.Errorf("JSON 파일이 존재하지 않습니다: %s", req.JsonPath)
	}

	return nil
}
