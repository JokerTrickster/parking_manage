package features

import (
	parkingHandler "main/features/parking/handler"
	roiHandler "main/features/roi/handler"
	"net/http"

	"github.com/labstack/echo/v4"
)

func InitHandler(e *echo.Echo) error {
	//elb 헬스체크용
	e.GET("/health", func(c echo.Context) error {
		return c.NoContent(http.StatusOK)
	})

	parkingHandler.NewParkingHandler(e)
	roiHandler.NewRoiHandler(e)

	return nil
}
