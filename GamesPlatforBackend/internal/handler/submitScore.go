package handler

import (
	"GamesPlatforBackend/internal/entity"
	"encoding/json"
	"log/slog"
	"net/http"
)

func (h *Handler) SubmitMazeScore(w http.ResponseWriter, r *http.Request) {
	var info entity.ScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusInternalServerError)
		return
	}
	if err := h.services.Score.SetMazeScore(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)

}

func (h *Handler) SubmitSnakeScore(w http.ResponseWriter, r *http.Request) {
	var info entity.ScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusInternalServerError)
		return
	}
	if err := h.services.Score.SetSnakeScore(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		slog.Info(err.Error())
		return
	}
	w.WriteHeader(http.StatusOK)

}

func (h *Handler) SubmitTicTacScore(w http.ResponseWriter, r *http.Request) {
	var info entity.ScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusInternalServerError)
		slog.Info(err.Error())
		return
	}
	if err := h.services.Score.SetTicTacScore(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)

}

func (h *Handler) SubmitMineScore(w http.ResponseWriter, r *http.Request) {
	var info entity.ScoreRequest
	if err := json.NewDecoder(r.Body).Decode(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusBadRequest), http.StatusInternalServerError)
		return
	}
	if err := h.services.Score.SetMineScore(&info); err != nil {
		http.Error(w, http.StatusText(http.StatusInternalServerError), http.StatusInternalServerError)
		return
	}
	w.WriteHeader(http.StatusOK)

}

//
//func (h *Handler) submitScore(w http.ResponseWriter, r *http.Request) {
//
//	var info entity.ScoreRequest
//
//	err := json.NewDecoder(r.Body).Decode(&info)
//	if err != nil {
//		http.Error(w, err.Error(), http.StatusBadRequest)
//		return
//	}
//
//	var score entity.Score
//	score.GameName = info.GameName
//	score.Score = info.Score
//
//	score.UserId, err = h.services.User.Get(r.Context(), info.NickName)
//
//	if err != nil && !errors.Is(err, sql.ErrNoRows) {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	if err != nil {
//		err = h.services.User.Create(&info)
//		if err != nil {
//			http.Error(w, err.Error(), http.StatusInternalServerError)
//			return
//		}
//		score.UserId = info.UserId
//	}
//
//	score.Id, err = h.services.Score.GetScore(score)
//	if err != nil && !errors.Is(err, sql.ErrNoRows) {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	if err != nil {
//		err = h.services.Score.CreateScore(&score)
//		if err != nil {
//			http.Error(w, err.Error(), http.StatusInternalServerError)
//			return
//		}
//	} else {
//		err = h.services.Score.Update(score)
//	}
//
//	if err != nil {
//		http.Error(w, err.Error(), http.StatusInternalServerError)
//		return
//	}
//
//	w.WriteHeader(http.StatusOK)
//}
