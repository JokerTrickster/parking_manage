package usecase

import (
	"context"
	"fmt"
	"main/common"
	_interface "main/features/parking/model/interface"
	"main/features/parking/model/request"
	"main/features/parking/model/response"
	"os"
	"path/filepath"
)

type DeleteFileParkingUseCase struct {
	Repository _interface.IDeleteFileParkingRepository
}

func NewDeleteFileParkingUseCase(repository _interface.IDeleteFileParkingRepository) _interface.IDeleteFileParkingUseCase {
	return &DeleteFileParkingUseCase{
		Repository: repository,
	}
}

func (d *DeleteFileParkingUseCase) DeleteFile(ctx context.Context, projectID string, folderPath string, req request.ReqDeleteFile) (response.ResDeleteFile, error) {
	// 파일 시스템에서 파일/폴더 삭제 실행
	err := deleteFileFromFileSystem(projectID, folderPath, req.DeleteName)
	if err != nil {
		return response.ResDeleteFile{
			Success: false,
			Message: fmt.Sprintf("파일/폴더 삭제에 실패했습니다: %v", err),
		}, err
	}

	return response.ResDeleteFile{
		Success: true,
		Message: fmt.Sprintf("'%s'이(가) 성공적으로 삭제되었습니다", req.DeleteName),
	}, nil
}

// 파일 시스템에서 파일/폴더 삭제
func deleteFileFromFileSystem(projectID string, folderPath string, deleteName string) error {
	// 저장 경로 설정 (기존 업로드 코드와 동일한 방식)
	uploadPath := common.Env.UploadPath
	projectPath := filepath.Join(uploadPath, projectID)
	targetPath := filepath.Join(projectPath, "uploads", folderPath)

	// 삭제할 폴더/파일 경로 구성
	fullPath := filepath.Join(targetPath, deleteName)

	fmt.Println("fullPath", fullPath)

	// 경로가 존재하는지 확인
	if _, err := os.Stat(fullPath); err != nil {
		return fmt.Errorf("삭제할 경로가 존재하지 않습니다: %s", deleteName)
	}

	// 디렉토리인지 파일인지 확인
	fileInfo, err := os.Stat(fullPath)
	if err != nil {
		return fmt.Errorf("경로 정보를 읽을 수 없습니다: %v", err)
	}

	if fileInfo.IsDir() {
		// 폴더인 경우: 폴더 내 모든 파일 삭제 후 폴더 삭제
		if err := os.RemoveAll(fullPath); err != nil {
			return fmt.Errorf("폴더 삭제 실패: %v", err)
		}
	} else {
		// 파일인 경우: 파일만 삭제
		if err := os.Remove(fullPath); err != nil {
			return fmt.Errorf("파일 삭제 실패: %v", err)
		}
	}

	return nil
}
