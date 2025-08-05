package mysql

import (
	"gorm.io/gorm"
)

// 전체, 한식, 중식, 일식, 양식, 분식, 패스트푸드, 카페, 술집, 기타
type Times struct {
	gorm.Model
	Timer       uint   `json:"timer" gorm:"column:timer"`
	Description string `json:"description" gorm:"column:description"`
}
