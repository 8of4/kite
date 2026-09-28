package postgres

import (
	"context"

	"github.com/jackc/pgx/v5/pgtype"
	"github.com/kitecloud/kite/kite-service/internal/db/postgres/pgmodel"
	"github.com/kitecloud/kite/kite-service/internal/model"
	"gopkg.in/guregu/null.v4"
)

func (c *Client) CreditLimitsByApp(ctx context.Context, appID string) ([]model.CreditLimit, error) {
	rows, err := c.Q.ListCreditLimitsByApp(ctx, appID)
	if err != nil {
		return nil, err
	}

	limits := make([]model.CreditLimit, 0, len(rows))
	for _, row := range rows {
		limits = append(limits, rowToCreditLimit(row))
	}

	return limits, nil
}

func (c *Client) UpsertCreditLimit(ctx context.Context, limit model.CreditLimit) (*model.CreditLimit, error) {
	row, err := c.Q.UpsertCreditLimit(ctx, pgmodel.UpsertCreditLimitParams{
		AppID:      limit.AppID,
		Type:       string(limit.Type),
		TargetID:   pgtype.Text{String: limit.TargetID.String, Valid: limit.TargetID.Valid},
		MaxCredits: int32(limit.MaxCredits),
		CreatedAt:  pgtype.Timestamp{Time: limit.CreatedAt, Valid: true},
		UpdatedAt:  pgtype.Timestamp{Time: limit.UpdatedAt, Valid: true},
	})
	if err != nil {
		return nil, err
	}

	res := rowToCreditLimit(row)
	return &res, nil
}

func (c *Client) DeleteCreditLimit(ctx context.Context, appID string, limitType model.CreditLimitType, targetID null.String) error {
	_, err := c.Q.DeleteCreditLimit(ctx, pgmodel.DeleteCreditLimitParams{
		AppID:    appID,
		Type:     string(limitType),
		TargetID: pgtype.Text{String: targetID.String, Valid: targetID.Valid},
	})
	return err
}

func rowToCreditLimit(row pgmodel.CreditLimit) model.CreditLimit {
	return model.CreditLimit{
		ID:         row.ID,
		AppID:      row.AppID,
		Type:       model.CreditLimitType(row.Type),
		TargetID:   null.NewString(row.TargetID.String, row.TargetID.Valid),
		MaxCredits: int(row.MaxCredits),
		CreatedAt:  row.CreatedAt.Time,
		UpdatedAt:  row.UpdatedAt.Time,
	}
}
