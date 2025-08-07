package main

import (
	"fmt"
	"main/common"
	"main/features"
	"os"
	"time"

	_middleware "main/middleware"

	swaggerDocs "main/docs"

	"github.com/labstack/echo/v4"

	echoSwagger "github.com/swaggo/echo-swagger"
)

//export PATH=$PATH:~/go/bin
func main() {

	// Go의 기본 multipart 메모리 제한 설정 (환경 변수로 설정)
	os.Setenv("GOMAXPROCS", "1") // CPU 사용량 제한
	// Go의 기본 32MB 제한을 우회하기 위한 설정
	// 이 설정은 Go 런타임에서 multipart 파싱 시 사용하는 메모리 제한을 늘립니다

	e := echo.New()

	// 파일 업로드 크기 제한 설정
	e.Server.MaxHeaderBytes = 1 << 30 // 1GB
	e.Server.ReadTimeout = 300 * time.Second
	e.Server.WriteTimeout = 300 * time.Second

	// 환경 변수 로드
	if err := common.LoadConfig(); err != nil {
		fmt.Printf("환경 변수 로드 실패: %v\n", err)
		return
	}

	// 설정 정보 출력 (디버그용)
	if common.Env.Debug {
		common.Env.Print()
	}

	if err := common.InitServer(); err != nil {
		fmt.Println(err)
		return
	}

	if err := _middleware.InitMiddleware(e); err != nil {
		fmt.Println(err)
		return
	}

	//핸드러 초기화

	if err := features.InitHandler(e); err != nil {
		fmt.Printf("handler 초기화 에러 : %v", err.Error())
		return
	}

	// swagger 초기화

	if common.Env.IsLocal {
		swaggerDocs.SwaggerInfo_swagger.Host = common.Env.Host + ":" + common.Env.Port
		e.GET("/swagger/*", echoSwagger.WrapHandler)
	} else {
		// swaggerDocs.SwaggerInfo.Host = fmt.Sprintf("dev-board-api.boardgame.com")
		e.GET("/swagger/*", echoSwagger.WrapHandler)
	}
	e.HideBanner = true
	e.Logger.Fatal(e.Start(":" + common.Env.Port))
	// e.Logger.Fatal(e.Start(":8080"))

	return
}
