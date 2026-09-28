-- name: ListCreditLimitsByApp :many
SELECT * FROM credit_limits WHERE app_id = @app_id ORDER BY created_at ASC;

-- name: UpsertCreditLimit :one
INSERT INTO credit_limits (
    app_id,
    type,
    target_id,
    max_credits,
    created_at,
    updated_at
) VALUES (
    $1, $2, $3, $4, $5, $6
)
ON CONFLICT (app_id, type, target_id) DO UPDATE SET
    max_credits = EXCLUDED.max_credits,
    updated_at = EXCLUDED.updated_at
RETURNING *;

-- name: DeleteCreditLimit :execrows
DELETE FROM credit_limits WHERE app_id = @app_id AND type = @type AND target_id IS NOT DISTINCT FROM @target_id;
