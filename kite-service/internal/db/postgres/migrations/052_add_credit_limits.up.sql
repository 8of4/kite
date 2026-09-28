ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS guild_id TEXT;
ALTER TABLE usage_records ADD COLUMN IF NOT EXISTS user_id TEXT;

CREATE INDEX IF NOT EXISTS usage_records_app_guild_created_at ON usage_records (app_id, guild_id, created_at) WHERE guild_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS usage_records_app_user_created_at ON usage_records (app_id, user_id, created_at) WHERE user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS credit_limits (
    id BIGSERIAL PRIMARY KEY,

    app_id TEXT NOT NULL REFERENCES apps(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    target_id TEXT,

    max_credits INTEGER NOT NULL,

    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,

    UNIQUE NULLS NOT DISTINCT (app_id, type, target_id)
);

CREATE INDEX IF NOT EXISTS credit_limits_app_id ON credit_limits (app_id);
