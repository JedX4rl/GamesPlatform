package service

import (
	"GamesPlatforBackend/internal/entity"
	"GamesPlatforBackend/internal/repository"
	"context"
	"time"
)

type UserService struct {
	repository repository.UserRepository
}

func (u UserService) Create(user *entity.ScoreRequest) error {
	return u.repository.Create(user)
}

func (u UserService) Get(c context.Context, nickName string) (int, error) {
	ctx, cancel := context.WithTimeout(c, time.Second*10)
	defer cancel()
	return u.repository.Get(ctx, nickName)
}

func NewUserService(repository repository.UserRepository) UserService {
	return UserService{
		repository: repository,
	}
}
