package credit_limit

import (
	"fmt"
	"time"

	"github.com/kitecloud/kite/kite-service/internal/api/handler"
	"github.com/kitecloud/kite/kite-service/internal/api/wire"
	"github.com/kitecloud/kite/kite-service/internal/model"
	"github.com/kitecloud/kite/kite-service/internal/store"
)

type CreditLimitHandler struct {
	creditLimitStore store.CreditLimitStore
}

func NewCreditLimitHandler(creditLimitStore store.CreditLimitStore) *CreditLimitHandler {
	return &CreditLimitHandler{
		creditLimitStore: creditLimitStore,
	}
}

func (h *CreditLimitHandler) HandleCreditLimitList(c *handler.Context) (*wire.CreditLimitListResponse, error) {
	limits, err := h.creditLimitStore.CreditLimitsByApp(c.Context(), c.App.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to get credit limits: %w", err)
	}

	res := make(wire.CreditLimitListResponse, len(limits))
	for i := range limits {
		res[i] = wire.CreditLimitToWire(&limits[i])
	}

	return &res, nil
}

func (h *CreditLimitHandler) HandleCreditLimitUpsert(c *handler.Context, req wire.CreditLimitUpsertRequest) (*wire.CreditLimitUpsertResponse, error) {
	now := time.Now().UTC()

	limit, err := h.creditLimitStore.UpsertCreditLimit(c.Context(), model.CreditLimit{
		AppID:      c.App.ID,
		Type:       model.CreditLimitType(req.Type),
		TargetID:   req.TargetID,
		MaxCredits: req.MaxCredits,
		CreatedAt:  now,
		UpdatedAt:  now,
	})
	if err != nil {
		return nil, fmt.Errorf("failed to upsert credit limit: %w", err)
	}

	return wire.CreditLimitToWire(limit), nil
}

func (h *CreditLimitHandler) HandleCreditLimitDelete(c *handler.Context, req wire.CreditLimitDeleteRequest) (*wire.CreditLimitDeleteResponse, error) {
	err := h.creditLimitStore.DeleteCreditLimit(c.Context(), c.App.ID, model.CreditLimitType(req.Type), req.TargetID)
	if err != nil {
		return nil, fmt.Errorf("failed to delete credit limit: %w", err)
	}

	return &wire.CreditLimitDeleteResponse{}, nil
}
