package wire

import (
	"time"

	validation "github.com/go-ozzo/ozzo-validation/v4"
	"github.com/kitecloud/kite/kite-service/internal/model"
	"gopkg.in/guregu/null.v4"
)

type CreditLimit struct {
	Type       string      `json:"type"`
	TargetID   null.String `json:"target_id"`
	MaxCredits int         `json:"max_credits"`
	CreatedAt  time.Time   `json:"created_at"`
	UpdatedAt  time.Time   `json:"updated_at"`
}

type CreditLimitListResponse = []*CreditLimit

type CreditLimitUpsertRequest struct {
	Type       string      `json:"type"`
	TargetID   null.String `json:"target_id"`
	MaxCredits int         `json:"max_credits"`
}

func (req CreditLimitUpsertRequest) Validate() error {
	return validation.ValidateStruct(&req,
		validation.Field(&req.Type, validation.Required, validation.In("server", "user")),
		validation.Field(&req.MaxCredits, validation.Min(0)),
	)
}

type CreditLimitUpsertResponse = CreditLimit

type CreditLimitDeleteRequest struct {
	Type     string      `json:"type"`
	TargetID null.String `json:"target_id"`
}

func (req CreditLimitDeleteRequest) Validate() error {
	return validation.ValidateStruct(&req,
		validation.Field(&req.Type, validation.Required, validation.In("server", "user")),
	)
}

type CreditLimitDeleteResponse = struct{}

func CreditLimitToWire(limit *model.CreditLimit) *CreditLimit {
	return &CreditLimit{
		Type:       string(limit.Type),
		TargetID:   limit.TargetID,
		MaxCredits: limit.MaxCredits,
		CreatedAt:  limit.CreatedAt,
		UpdatedAt:  limit.UpdatedAt,
	}
}
