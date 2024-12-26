package handler

import (
	"GamesPlatforBackend/internal/service"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/cors"
	_ "github.com/lib/pq"
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"net/http"
)

type Handler struct {
	services *service.Service
}

func NewHandler(service *service.Service) *Handler {
	return &Handler{
		services: service,
	}
}

var (
	httpRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests.",
		},
		[]string{"method", "endpoint"},
	)
	httpRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request durations in seconds.",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "endpoint"},
	)
	serverUptime = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "server_uptime_seconds",
		Help: "The uptime of the server in seconds.",
	})
	activeConnections = prometheus.NewGauge(prometheus.GaugeOpts{
		Name: "active_connections",
		Help: "The number of active connections to the server.",
	})
)

func init() {
	prometheus.MustRegister(httpRequestsTotal)
	prometheus.MustRegister(httpRequestDuration)
	prometheus.MustRegister(serverUptime)
	prometheus.MustRegister(activeConnections)
}

func MetricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		activeConnections.Inc()
		defer activeConnections.Dec()

		timer := prometheus.NewTimer(httpRequestDuration.WithLabelValues(r.Method, r.URL.Path))
		defer timer.ObserveDuration()

		httpRequestsTotal.WithLabelValues(r.Method, r.URL.Path).Inc()

		next.ServeHTTP(w, r)
	})
}

func MetricsHandler() http.Handler {
	return promhttp.Handler()
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

	router.Use(MetricsMiddleware)

	//router.Post("/submit-score", h.submitScore)
	router.Post("/submit-maze-score", h.SubmitMazeScore)
	router.Post("/submit-mine-score", h.SubmitMineScore)
	router.Post("/submit-snake-score", h.SubmitSnakeScore)
	router.Post("/submit-tictac-score", h.SubmitTicTacScore)
	router.Get("/get_maze-score", h.getMazeScore)
	router.Get("/get_mine-score", h.getMineScore)
	router.Get("/get_snake-score", h.getSnakeScore)
	router.Get("/get_tictac-score", h.getTicTacScore)
	router.Handle("/metrics", MetricsHandler())
	//router.Get("/high-score/{game}", h.highScore)

	return router
}
