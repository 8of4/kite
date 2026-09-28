package model

import (
	"time"

	"gopkg.in/guregu/null.v4"
)

type CreditLimitType string

const (
	CreditLimitTypeServer CreditLimitType = "server"
	CreditLimitTypeUser   CreditLimitType = "user"
)

type CreditLimit struct {
	ID         int64
	AppID      string
	Type       CreditLimitType
	TargetID   null.String
	MaxCredits int
	CreatedAt  time.Time
	UpdatedAt  time.Time
}
