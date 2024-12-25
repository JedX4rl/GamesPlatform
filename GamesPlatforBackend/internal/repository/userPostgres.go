package repository

import (
	"GamesPlatforBackend/internal/entity"
	"context"
	"database/sql"
	"fmt"
	_ "github.com/lib/pq"
)

type UserPostgres struct {
	db *sql.DB
}

func (u UserPostgres) Create(user *entity.ScoreRequest) error {
	tx, err := u.db.Begin()
	if err != nil {
		return err
	}
	query := fmt.Sprintf("INSERT INTO users (nickname) VALUES ($1) RETURNING id")
	row := tx.QueryRow(query, user.NickName)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return err
	}
	err = row.Scan(&user.UserId)
	if err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (u UserPostgres) Get(ctx context.Context, nickName string) (int, error) {
	tx, err := u.db.Begin()
	if err != nil {
		return 0, err
	}
	query := fmt.Sprintf("SELECT id FROM users WHERE nickname = $1")
	row := tx.QueryRowContext(ctx, query, nickName)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return 0, err
	}

	var user entity.User

	err = row.Scan(&user.Id)
	if err != nil {
		tx.Rollback()
		return 0, err
	}
	return user.Id, tx.Commit()
}

//var postgresErr *pq.Error
//if errors.As(err, &postgresErr) && postgresErr.Code.Name() == "no_data_found" {
//tx.Rollback()
//return nil, nil

func NewUserPostgres(db *sql.DB) *UserPostgres {
	return &UserPostgres{
		db: db,
	}
}
