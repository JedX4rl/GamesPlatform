package service

import (
	"GamesPlatforBackend/internal/entity"
	"GamesPlatforBackend/internal/repository"
)

type ScoreService struct {
	repository repository.ScoreRepository
}

func (s ScoreService) CreateScore(score *entity.Score) error {
	return s.repository.CreateScore(score)
}

func (s ScoreService) SetSnakeScore(score *entity.ScoreRequest) error {
	return s.repository.SetSnakeScore(score)

}
func (s ScoreService) SetTicTacScore(score *entity.ScoreRequest) error {
	return s.repository.SetTicTacScore(score)
}
func (s ScoreService) SetMazeScore(score *entity.ScoreRequest) error {
	return s.repository.SetMazeScore(score)
}
func (s ScoreService) SetMineScore(score *entity.ScoreRequest) error {
	return s.repository.SetMineScore(score)
}

func (s ScoreService) GetScore(score entity.Score) (int, error) {
	return s.repository.GetScore(score)
}

func (s ScoreService) Update(score entity.Score) error {
	return s.repository.Update(score)
}

func (s ScoreService) GetHighScores(gameName string) ([]entity.ScoreResponse, error) {
	return s.repository.GetHighScores(gameName)
}

func (s ScoreService) GetSnakeScore() ([]entity.ScoreResponse, error) {
	return s.repository.GetSnakeScore()
}
func (s ScoreService) GetTicTacScore() ([]entity.ScoreResponse, error) {
	return s.repository.GetTicTacScore()
}
func (s ScoreService) GetMazeScore() ([]entity.ScoreResponse, error) {
	return s.repository.GetMazeScore()
}
func (s ScoreService) GetMineScore() ([]entity.ScoreResponse, error) {
	return s.repository.GetMineScore()
}

func NewScoreService(repository repository.ScoreRepository) *ScoreService {
	return &ScoreService{
		repository: repository,
	}
}
