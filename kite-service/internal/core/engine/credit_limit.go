package engine

import (
	"context"
	"time"

	"github.com/diamondburned/arikawa/v3/api"
	"github.com/diamondburned/arikawa/v3/discord"
	"github.com/diamondburned/arikawa/v3/gateway"
	"github.com/diamondburned/arikawa/v3/state"
	"github.com/diamondburned/arikawa/v3/utils/json/option"
	"github.com/kitecloud/kite/kite-service/internal/model"
)

func respondCreditLimit(ctx context.Context, session *state.State, event gateway.Event, message string) {
	i, ok := event.(*gateway.InteractionCreateEvent)
	if !ok {
		return
	}

	_ = session.RespondInteraction(i.ID, i.Token, api.InteractionResponse{
		Type: api.MessageInteractionWithSource,
		Data: &api.InteractionResponseData{
			Content: option.NewNullableString(message),
			Flags:   discord.EphemeralMessage,
		},
	})
}

func (s Env) creditLimitExceeded(ctx context.Context, appID string, guildID discord.GuildID, userID discord.UserID) (bool, string) {
	if s.CreditLimitStore == nil {
		return false, ""
	}

	limits, err := s.CreditLimitStore.CreditLimitsByApp(ctx, appID)
	if err != nil || len(limits) == 0 {
		return false, ""
	}

	start, end := startAndEndOfMonth(time.Now().UTC())

	if guildID != 0 {
		if cap := resolveLimit(limits, model.CreditLimitTypeServer, guildID.String()); cap > 0 {
			used, err := s.UsageStore.UsageCreditsUsedByGuildBetween(ctx, appID, guildID.String(), start, end)
			if err == nil && used >= cap {
				return true, "This server has reached its monthly usage limit for this bot."
			}
		}
	}

	if userID != 0 {
		if cap := resolveLimit(limits, model.CreditLimitTypeUser, userID.String()); cap > 0 {
			used, err := s.UsageStore.UsageCreditsUsedByUserBetween(ctx, appID, userID.String(), start, end)
			if err == nil && used >= cap {
				return true, "You have reached your monthly usage limit for this bot."
			}
		}
	}

	return false, ""
}

func resolveLimit(limits []model.CreditLimit, limitType model.CreditLimitType, targetID string) int {
	def := 0
	for _, l := range limits {
		if l.Type != limitType {
			continue
		}
		if l.TargetID.Valid && l.TargetID.String == targetID {
			return l.MaxCredits
		}
		if !l.TargetID.Valid {
			def = l.MaxCredits
		}
	}
	return def
}

func startAndEndOfMonth(t time.Time) (time.Time, time.Time) {
	year, month, _ := t.Date()
	start := time.Date(year, month, 1, 0, 0, 0, 0, t.Location())
	end := start.AddDate(0, 1, 0).Add(-time.Nanosecond)
	return start, end
}
