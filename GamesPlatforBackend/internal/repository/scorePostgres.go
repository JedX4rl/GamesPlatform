package repository

import (
	"GamesPlatforBackend/internal/entity"
	"database/sql"
	"fmt"
	"log/slog"
)

type ScorePostgres struct {
	db *sql.DB
}

func (s ScorePostgres) GetScore(score entity.Score) (int, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return 0, err
	}
	query := fmt.Sprintf("SELECT scoreID FROM %s WHERE user_id = $1", score.GameName)
	row := tx.QueryRow(query, score.UserId)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return 0, err
	}
	var id int
	if err = row.Scan(&id); err != nil {
		tx.Rollback()
		return 0, err
	}
	return id, tx.Commit()

}

func (s ScorePostgres) CreateScore(score *entity.Score) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	query := fmt.Sprintf("INSERT INTO %s (user_id, score) VALUES ($1, $2) RETURNING scoreID", score.GameName)
	row := tx.QueryRow(query, score.UserId, score.Score)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return err
	}
	if err := row.Scan(&score.Id); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (s ScorePostgres) Update(score entity.Score) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}

	var sort string
	if score.GameName == "mine" || score.GameName == "maze" {
		sort = "LEAST"
	} else {
		sort = "GREATEST"
	}

	query := fmt.Sprintf("UPDATE %s SET score = %s(score, $1) WHERE scoreID = $2", score.GameName, sort)

	row := tx.QueryRow(query, score.Score, score.Id)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (s ScorePostgres) GetHighScores(gameName string) ([]entity.ScoreResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	var topRecords []entity.ScoreResponse

	var orderParam string

	if gameName == "mine" || gameName == "maze" {
		orderParam = "ASC"
	} else {
		orderParam = "DESC"
	}

	query := fmt.Sprintf(`
        SELECT u.nickname, s.score
        FROM %s s
        JOIN users u ON s.user_id = u.id
        ORDER BY s.score %s
        LIMIT 5`, gameName, orderParam)
	rows, err := tx.Query(query)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var record entity.ScoreResponse
		if err := rows.Scan(&record.NickName, &record.Score); err != nil {
			tx.Rollback()
			return nil, err
		}
		topRecords = append(topRecords, record)
	}
	return topRecords, tx.Commit()
}

func (s ScorePostgres) SetSnakeScore(score *entity.ScoreRequest) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	query := "SELECT update_score_snake($1, $2)"
	row := tx.QueryRow(query, score.NickName, score.Score)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()

}
func (s ScorePostgres) SetTicTacScore(score *entity.ScoreRequest) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	query := "SELECT update_score_tic_tac_toe($1)"
	row := tx.QueryRow(query, score.NickName)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}
func (s ScorePostgres) SetMazeScore(score *entity.ScoreRequest) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	query := "SELECT update_score_maze($1, $2)"
	row := tx.QueryRow(query, score.NickName, score.Score)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}
func (s ScorePostgres) SetMineScore(score *entity.ScoreRequest) error {
	tx, err := s.db.Begin()
	if err != nil {
		return err
	}
	query := "SELECT update_score_mine($1, $2)"
	row := tx.QueryRow(query, score.NickName, score.Score)
	if err := row.Err(); err != nil {
		tx.Rollback()
		return err
	}
	return tx.Commit()
}

func (s ScorePostgres) GetSnakeScore() ([]entity.ScoreResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	query := "SELECT * FROM get_top_5_snake()"
	rows, err := tx.Query(query)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	defer rows.Close()
	var topRecords []entity.ScoreResponse
	for rows.Next() {
		var record entity.ScoreResponse
		if err := rows.Scan(&record.NickName, &record.Score); err != nil {
			tx.Rollback()
			return nil, err
		}
		topRecords = append(topRecords, record)
	}
	return topRecords, tx.Commit()
}
func (s ScorePostgres) GetTicTacScore() ([]entity.ScoreResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	query := "SELECT * FROM get_top_5_tic_tac_toe()"
	rows, err := tx.Query(query)
	if err != nil {
		slog.Info(err.Error())
		tx.Rollback()
		return nil, err
	}
	defer rows.Close()
	var topRecords []entity.ScoreResponse
	for rows.Next() {
		var record entity.ScoreResponse
		if err := rows.Scan(&record.NickName, &record.Score); err != nil {
			tx.Rollback()
			return nil, err
		}
		topRecords = append(topRecords, record)
	}
	return topRecords, tx.Commit()
}
func (s ScorePostgres) GetMazeScore() ([]entity.ScoreResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	query := "SELECT * FROM get_top_5_maze()"
	rows, err := tx.Query(query)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	defer rows.Close()
	var topRecords []entity.ScoreResponse
	for rows.Next() {
		var record entity.ScoreResponse
		if err := rows.Scan(&record.NickName, &record.Score); err != nil {
			tx.Rollback()
			return nil, err
		}
		topRecords = append(topRecords, record)
	}
	return topRecords, tx.Commit()
}
func (s ScorePostgres) GetMineScore() ([]entity.ScoreResponse, error) {
	tx, err := s.db.Begin()
	if err != nil {
		return nil, err
	}
	query := "SELECT * FROM get_top_5_mine()"
	rows, err := tx.Query(query)
	if err != nil {
		tx.Rollback()
		return nil, err
	}
	defer rows.Close()
	var topRecords []entity.ScoreResponse
	for rows.Next() {
		var record entity.ScoreResponse
		if err := rows.Scan(&record.NickName, &record.Score); err != nil {
			tx.Rollback()
			return nil, err
		}
		topRecords = append(topRecords, record)
	}
	return topRecords, tx.Commit()
}

func NewScorePostgres(db *sql.DB) *ScorePostgres {
	return &ScorePostgres{
		db: db,
	}
}
