package store

import (
	"context"

	"github.com/kitecloud/kite/kite-service/internal/model"
	"gopkg.in/guregu/null.v4"
)

type CreditLimitStore interface {
	CreditLimitsByApp(ctx context.Context, appID string) ([]model.CreditLimit, error)
	UpsertCreditLimit(ctx context.Context, limit model.CreditLimit) (*model.CreditLimit, error)
	DeleteCreditLimit(ctx context.Context, appID string, limitType model.CreditLimitType, targetID null.String) error
}
