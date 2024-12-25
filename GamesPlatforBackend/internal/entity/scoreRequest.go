package entity

type ScoreRequest struct {
	NickName string `json:"nick_name" binding:"required"`
	GameName string `json:"game_name" binding:"required"`
	Score    int    `json:"score" binding:"required"`
	UserId   int    `db:"id"`
}
