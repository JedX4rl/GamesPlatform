package service

import (
	"GamesPlatforBackend/internal/entity"
	"GamesPlatforBackend/internal/repository"
	"context"
)

type Score interface {
	SetSnakeScore(score *entity.ScoreRequest) error
	SetTicTacScore(score *entity.ScoreRequest) error
	SetMazeScore(score *entity.ScoreRequest) error
	SetMineScore(score *entity.ScoreRequest) error
	GetSnakeScore() ([]entity.ScoreResponse, error)
	GetTicTacScore() ([]entity.ScoreResponse, error)
	GetMazeScore() ([]entity.ScoreResponse, error)
	GetMineScore() ([]entity.ScoreResponse, error)

	CreateScore(score *entity.Score) error
	Update(score entity.Score) error
	GetScore(score entity.Score) (int, error)
	GetHighScores(gameName string) ([]entity.ScoreResponse, error)
}

type User interface {
	Create(user *entity.ScoreRequest) error
	Get(ctx context.Context, nickName string) (int, error)
}

type Service struct {
	Score
	User
}

func NewService(repositories *repository.Repository) *Service {
	return &Service{
		Score: NewScoreService(repositories),
		User:  NewUserService(repositories),
	}
}
