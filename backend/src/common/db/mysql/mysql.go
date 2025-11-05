package mysql

import (
	"database/sql"
	"fmt"
	"time"

	_ "github.com/go-sql-driver/mysql"
	"github.com/google/uuid"
	"gorm.io/driver/mysql"
	"gorm.io/gorm"
)

var MysqlDB *sql.DB
var GormMysqlDB *gorm.DB

const DBTimeOut = 8 * time.Second

func InitMySQL(dbUser, dbPass, dbHost, dbPort, dbName string) error {
	var err error

	// Build connection string from parameters
	connectionString := fmt.Sprintf("%s:%s@tcp(%s:%s)/%s?parseTime=true",
		dbUser,
		dbPass,
		dbHost,
		dbPort,
		dbName,
	)

	fmt.Printf("MySQL connection string: %s:***@tcp(%s:%s)/%s\n", dbUser, dbHost, dbPort, dbName)

	// MySQL에 연결
	MysqlDB, err = sql.Open("mysql", connectionString)
	if err != nil {
		fmt.Printf("Failed to connect to MySQL! Error: %v\n", err)
		return fmt.Errorf("failed to connect to MySQL: %w", err)
	}

	// Verify connection
	if err = MysqlDB.Ping(); err != nil {
		fmt.Printf("Failed to ping MySQL! Error: %v\n", err)
		return fmt.Errorf("failed to ping MySQL: %w", err)
	}
	fmt.Println("Connected to MySQL!")

	GormMysqlDB, err = gorm.Open(mysql.New(mysql.Config{
		Conn: MysqlDB,
	}), &gorm.Config{
		SkipDefaultTransaction: false,
	})
	if err != nil {
		fmt.Printf("Failed to connect to Gorm MySQL! Error: %v\n", err)
		return fmt.Errorf("failed to initialize GORM: %w", err)
	}

	fmt.Println("Successfully initialized GORM MySQL!")
	return nil
}

func PKIDGenerate() string {
	//uuid 로 생성
	result := (uuid.New()).String()
	return result
}

func NowDateGenerate() string {
	return time.Now().Format("2006-01-02 15:04:05")
}

func EpochToTime(t int64) time.Time {
	return time.Unix(t, t%1000*1000000)
}
func EpochToTimeString(t int64) string {
	return time.Unix(t, t%1000*1000000).String()
}

func TimeStringToEpoch(t string) int64 {
	date, _ := time.Parse("2006-01-02 15:04:05 -0700 MST", t)
	return date.Unix()
}

func TimeToEpoch(t time.Time) int64 {
	return t.Unix()
}

// 트랜잭션 처리 미들웨어
func Transaction(db *gorm.DB, fc func(tx *gorm.DB) error) (err error) {
	tx := db.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
			err = fmt.Errorf("panic occurred: %v", r)
		} else if err != nil {
			tx.Rollback()
		} else {
			err = tx.Commit().Error
		}
	}()

	if err = tx.Error; err != nil {
		return err
	}

	err = fc(tx)
	return
}
