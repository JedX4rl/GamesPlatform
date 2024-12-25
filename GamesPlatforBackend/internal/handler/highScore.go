package handler

import (
	"encoding/json"
	"github.com/go-chi/chi/v5"
	"log/slog"
	"net/http"
)

func (h *Handler) getMazeScore(w http.ResponseWriter, r *http.Request) {
	topRecords, err := h.services.Score.GetMazeScore()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		slog.Info(err.Error())
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(topRecords)
}
func (h *Handler) getMineScore(w http.ResponseWriter, r *http.Request) {
	topRecords, err := h.services.Score.GetMineScore()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(topRecords)
}
func (h *Handler) getSnakeScore(w http.ResponseWriter, r *http.Request) {
	topRecords, err := h.services.Score.GetSnakeScore()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(topRecords)
}
func (h *Handler) getTicTacScore(w http.ResponseWriter, r *http.Request) {
	topRecords, err := h.services.Score.GetTicTacScore()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)
	w.Header().Add("Content-Type", "application/json")
	err = json.NewEncoder(w).Encode(topRecords)
}

func (h *Handler) highScore(w http.ResponseWriter, r *http.Request) {

	gameName := chi.URLParam(r, "game")

	highScores, err := h.services.Score.GetHighScores(gameName)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Add("Content-Type", "application/json")
	w.WriteHeader(http.StatusOK)
	err = json.NewEncoder(w).Encode(highScores)
	if err != nil {
		return
	}
}
