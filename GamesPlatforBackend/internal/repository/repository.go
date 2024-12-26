package repository

import (
	"GamesPlatforBackend/internal/entity"
	"context"
	"database/sql"
	_ "github.com/lib/pq"
)

type ScoreRepository interface {
	SetSnakeScore(score *entity.ScoreRequest) error
	SetTicTacScore(score *entity.ScoreRequest) error
	SetMazeScore(score *entity.ScoreRequest) error
	SetMineScore(score *entity.ScoreRequest) error
	GetSnakeScore() ([]entity.ScoreResponse, error)
	GetTicTacScore() ([]entity.ScoreResponse, error)
	GetMazeScore() ([]entity.ScoreResponse, error)
	GetMineScore() ([]entity.ScoreResponse, error)
	Update(score entity.Score) error
	GetScore(score entity.Score) (int, error)
	CreateScore(score *entity.Score) error
	GetHighScores(gameName string) ([]entity.ScoreResponse, error)
}

type UserRepository interface {
	Create(user *entity.ScoreRequest) error
	Get(ctx context.Context, nickName string) (int, error)
}

type Repository struct {
	ScoreRepository
	UserRepository
}

func NewRepository(db *sql.DB) *Repository {
	return &Repository{
		ScoreRepository: NewScorePostgres(db),
		UserRepository:  NewUserPostgres(db),
	}
}
