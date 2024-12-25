package entity

type User struct {
	Id       int    `db:"id"`
	Email    string `db:"email"`
	NickName string `db:"nickname"`
}
