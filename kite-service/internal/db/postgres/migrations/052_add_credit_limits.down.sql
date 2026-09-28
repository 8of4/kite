DROP TABLE IF EXISTS credit_limits;

DROP INDEX IF EXISTS usage_records_app_guild_created_at;
DROP INDEX IF EXISTS usage_records_app_user_created_at;

ALTER TABLE usage_records DROP COLUMN IF EXISTS guild_id;
ALTER TABLE usage_records DROP COLUMN IF EXISTS user_id;
