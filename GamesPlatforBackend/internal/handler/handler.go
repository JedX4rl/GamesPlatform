package handler

import (
	"GamesPlatforBackend/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
)

type Handler struct {
	services *service.Service
}

func NewHandler(service *service.Service) *Handler {
	return &Handler{
		services: service,
	}
}

func (h *Handler) InitRoutes() *chi.Mux {
	router := chi.NewRouter()
	router.Use(middleware.RequestID)
	router.Use(middleware.URLFormat)

	router.Use(cors.Handler(cors.Options{
		AllowedMethods:   []string{"GET", "POST"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: false,
	}))

	//router.Post("/submit-score", h.submitScore)
	router.Post("/submit-maze-score", h.SubmitMazeScore)
	router.Post("/submit-mine-score", h.SubmitMineScore)
	router.Post("/submit-snake-score", h.SubmitSnakeScore)
	router.Post("/submit-tictac-score", h.SubmitTicTacScore)
	router.Get("/get_maze-score", h.getMazeScore)
	router.Get("/get_mine-score", h.getMineScore)
	router.Get("/get_snake-score", h.getSnakeScore)
	router.Get("/get_tictac-score", h.getTicTacScore)
	//router.Get("/high-score/{game}", h.highScore)

	return router
}
