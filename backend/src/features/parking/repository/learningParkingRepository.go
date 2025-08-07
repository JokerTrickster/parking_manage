package repository

import (
	_interface "main/features/parking/model/interface"
)

func NewLearningParkingRepository() _interface.ILearningParkingRepository {
	return &LearningParkingRepository{}
}
