package usecase

import (
	"context"
	"fmt"
	"time"

	_interface "main/features/parking/model/interface"
)

type LearningUploadParkingUseCase struct {
	Repository     _interface.ILearningUploadParkingRepository
	ContextTimeout time.Duration
}

func NewLearningUploadParkingUseCase(repo _interface.ILearningUploadParkingRepository, timeout time.Duration) _interface.ILearningUploadParkingUseCase {
	return &LearningUploadParkingUseCase{Repository: repo, ContextTimeout: timeout}
}

func (d *LearningUploadParkingUseCase) LearningUpload(c context.Context) error {
	ctx, cancel := context.WithTimeout(c, d.ContextTimeout)
	defer cancel()
	fmt.Println(ctx)
	return nil
}
