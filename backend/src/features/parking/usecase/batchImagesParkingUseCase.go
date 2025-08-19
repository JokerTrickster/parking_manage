package usecase

import (
	"context"
	"fmt"
	"main/common"
	"os"
	"path/filepath"
	"strings"
	"time"

	_interface "main/features/parking/model/interface"

	"golang.org/x/crypto/ssh"
)

type BatchImagesParkingUseCase struct {
	Repository     _interface.IBatchImagesParkingRepository
	ContextTimeout time.Duration
}

func NewBatchImagesParkingUseCase(repo _interface.IBatchImagesParkingRepository, timeout time.Duration) _interface.IBatchImagesParkingUseCase {
	return &BatchImagesParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *BatchImagesParkingUseCase) BatchImages(ctx context.Context, projectID string) error {
	_, cancel := context.WithTimeout(ctx, d.ContextTimeout)
	defer cancel()

	// SSH 연결 설정
	config := &ssh.ClientConfig{
		User: "ubuntu",
		Auth: []ssh.AuthMethod{
			ssh.Password("ubuntu"),
		},
		HostKeyCallback: ssh.InsecureIgnoreHostKey(),
		Timeout:         30 * time.Second,
	}

	// SSH 연결
	client, err := ssh.Dial("tcp", "172.23.30.84:22", config)
	if err != nil {
		return fmt.Errorf("SSH 연결 실패: %v", err)
	}
	defer client.Close()

	// 세션 생성
	session, err := client.NewSession()
	if err != nil {
		return fmt.Errorf("SSH 세션 생성 실패: %v", err)
	}
	defer session.Close()

	// 원격 서버의 파일 목록 조회
	output, err := session.Output("find /home/ubuntu/saved_images -type f -name '*.jpg' -o -name '*.png' -o -name '*.jpeg'")
	if err != nil {
		return fmt.Errorf("원격 파일 목록 조회 실패: %v", err)
	}

	fileList := strings.Split(strings.TrimSpace(string(output)), "\n")
	if len(fileList) == 0 || (len(fileList) == 1 && fileList[0] == "") {
		return fmt.Errorf("다운로드할 파일이 없습니다")
	}

	// 로컬 저장 경로 설정
	localBasePath := filepath.Join(common.Env.UploadPath, projectID, "currentImages")
	if err := os.MkdirAll(localBasePath, 0755); err != nil {
		return fmt.Errorf("로컬 디렉토리 생성 실패: %v", err)
	}

	// 각 파일 다운로드
	for _, remoteFilePath := range fileList {
		if remoteFilePath == "" {
			continue
		}

		// 원격 파일 정보 조회
		fileInfo, err := getRemoteFileInfo(client, remoteFilePath)
		if err != nil {
			fmt.Printf("파일 정보 조회 실패 (%s): %v\n", remoteFilePath, err)
			continue
		}

		// 로컬 파일 경로 생성
		fileName := filepath.Base(remoteFilePath)
		localFilePath := filepath.Join(localBasePath, fileName)

		// 파일 다운로드
		if err := downloadFile(client, remoteFilePath, localFilePath); err != nil {
			fmt.Printf("파일 다운로드 실패 (%s): %v\n", remoteFilePath, err)
			continue
		}

		fmt.Printf("다운로드 완료: %s -> %s (%d bytes)\n", remoteFilePath, localFilePath, fileInfo.Size)
	}

	return nil
}
