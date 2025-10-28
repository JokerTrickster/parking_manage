package mysql

import (
	"gorm.io/gorm"
)

type ExperimentSessions struct {
	gorm.Model
	VarThreshold  float64 `json:"var_threshold" gorm:"column:var_threshold"`
	LearningRate  float64 `json:"learning_rate" gorm:"column:learning_rate"`
	Iterations    int     `json:"iterations" gorm:"column:iterations"`
	LearningPath  string  `json:"learning_path" gorm:"column:learning_path"`
	TestImagePath string  `json:"test_image_path" gorm:"column:test_image_path"`
	RoiPath       string  `json:"roi_path" gorm:"column:roi_path"`
	Name          string  `json:"name" gorm:"column:name"`
	ProjectId     string  `json:"project_id" gorm:"column:project_id"`
}

type CctvResults struct {
	gorm.Model
	ExperimentSessionId int    `json:"experiment_session_id" gorm:"column:experiment_session_id"`
	CctvId              string `json:"cctv_id" gorm:"column:cctv_id"`
	LearningDataSize    int    `json:"learning_data_size" gorm:"column:learning_data_size"`
}

type RoiResults struct {
	gorm.Model
	CctvResultId int     `json:"cctv_result_id" gorm:"column:cctv_result_id"`
	RoiId        int     `json:"roi_id" gorm:"column:roi_id"`
	Rate         float64 `json:"rate" gorm:"column:rate"`
}

type FileStorageHistory struct {
	gorm.Model
	ProjectId       string  `json:"project_id" gorm:"column:project_id;type:varchar(250);not null;index:idx_project_category"`
	Category        string  `json:"category" gorm:"column:category;type:enum('map','cad','roi','learning','test');not null;index:idx_project_category"`
	Filename        string  `json:"filename" gorm:"column:filename;type:varchar(255);not null"`
	OriginalName    string  `json:"original_name" gorm:"column:original_name;type:varchar(255);not null;index:idx_original_name"`
	Version         string  `json:"version" gorm:"column:version;type:varchar(50);not null;index:idx_version"`
	FilePath        string  `json:"file_path" gorm:"column:file_path;type:text;not null"`
	FileSize        int64   `json:"file_size" gorm:"column:file_size;type:bigint;not null"`
	FileType        string  `json:"file_type" gorm:"column:file_type;type:varchar(100);not null"`
	CctvId          *string `json:"cctv_id,omitempty" gorm:"column:cctv_id;type:varchar(50);index:idx_cctv_id"`
	UserId          *int64  `json:"user_id,omitempty" gorm:"column:user_id;type:bigint"`
	UploadIp        *string `json:"upload_ip,omitempty" gorm:"column:upload_ip;type:varchar(45)"`
	UploadUserAgent *string `json:"upload_user_agent,omitempty" gorm:"column:upload_user_agent;type:text"`
}

func (FileStorageHistory) TableName() string {
	return "file_storage_history"
}
