
CREATE INDEX IF NOT EXISTS idx_executions_owner_workflow_time
    ON executions (owner_id, workflow_id, started_at DESC);

CREATE INDEX IF NOT EXISTS idx_executions_owner_status_covering
    ON executions (owner_id, status)
    INCLUDE (started_at, completed_at, error);

CREATE TABLE IF NOT EXISTS query_explain_cache (
    id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id       UUID REFERENCES executions(id) ON DELETE CASCADE,
    workflow_id        UUID NOT NULL,
    owner_id           UUID NOT NULL,
    query_fingerprint  TEXT NOT NULL,
    explain_json       JSONB NOT NULL,
    scan_type          VARCHAR(50) NOT NULL,
    index_name         TEXT,
    index_depth        INTEGER,
    planning_time_ms   NUMERIC(10,3),
    execution_time_ms  NUMERIC(10,3),
    total_rows_scanned BIGINT,
    rows_returned      BIGINT,
    captured_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_explain_cache_execution
    ON query_explain_cache (execution_id, captured_at DESC);

CREATE INDEX IF NOT EXISTS idx_explain_cache_workflow_time
    ON query_explain_cache (workflow_id, captured_at DESC);

CREATE TABLE IF NOT EXISTS saga_instances (
    saga_id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    execution_id     UUID NOT NULL REFERENCES executions(id) ON DELETE CASCADE,
    workflow_id      UUID NOT NULL,
    current_step     VARCHAR(255),
    saga_state       VARCHAR(50) NOT NULL DEFAULT 'STARTED',
    started_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    completed_at     TIMESTAMPTZ,
    compensated_at   TIMESTAMPTZ,
    failed_reason    TEXT,
    version          BIGINT NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_saga_execution
    ON saga_instances (execution_id);

CREATE INDEX IF NOT EXISTS idx_saga_workflow_state
    ON saga_instances (workflow_id, saga_state, started_at DESC);


CREATE TABLE IF NOT EXISTS saga_steps (
    step_id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_id                   UUID NOT NULL REFERENCES saga_instances(saga_id) ON DELETE CASCADE,
    node_id                   VARCHAR(255) NOT NULL,
    node_type                 VARCHAR(100) NOT NULL,
    step_order                INTEGER NOT NULL,
    step_state                VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    started_at                TIMESTAMPTZ,
    completed_at              TIMESTAMPTZ,
    compensated_at            TIMESTAMPTZ,
    compensation_payload      JSONB,
    compensation_topic        VARCHAR(255),
    output_snapshot           JSONB,
    error_message             TEXT,
    CONSTRAINT uq_saga_node UNIQUE (saga_id, node_id)
);

CREATE INDEX IF NOT EXISTS idx_saga_steps_saga_order
    ON saga_steps (saga_id, step_order ASC);

CREATE INDEX IF NOT EXISTS idx_saga_steps_state
    ON saga_steps (saga_id, step_state);

CREATE TABLE IF NOT EXISTS saga_outbox (
    outbox_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    saga_id          UUID NOT NULL REFERENCES saga_instances(saga_id) ON DELETE CASCADE,
    step_id          UUID REFERENCES saga_steps(step_id) ON DELETE SET NULL,
    kafka_topic      VARCHAR(255) NOT NULL,
    event_type       VARCHAR(100) NOT NULL,
    payload          JSONB NOT NULL,
    status           VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    published_at     TIMESTAMPTZ,
    retry_count      INTEGER NOT NULL DEFAULT 0,
    last_error       TEXT
);

CREATE INDEX IF NOT EXISTS idx_outbox_pending
    ON saga_outbox (status, created_at ASC)
    WHERE status = 'PENDING';

CREATE OR REPLACE FUNCTION fn_sync_saga_state()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_saga_id         UUID := NEW.saga_id;
    v_failed_count    INTEGER;
    v_compensated_count INTEGER;
    v_committed_count   INTEGER;
    v_total_count       INTEGER;
BEGIN
    SELECT
        COUNT(*) FILTER (WHERE step_state = 'FAILED'),
        COUNT(*) FILTER (WHERE step_state = 'COMPENSATED'),
        COUNT(*) FILTER (WHERE step_state = 'COMMITTED'),
        COUNT(*)
    INTO v_failed_count, v_compensated_count, v_committed_count, v_total_count
    FROM saga_steps
    WHERE saga_id = v_saga_id;


    IF v_failed_count > 0 AND v_compensated_count = (v_total_count - v_failed_count - v_committed_count) THEN
        UPDATE saga_instances
        SET saga_state = 'COMPENSATED',
            compensated_at = NOW(),
            version = version + 1
        WHERE saga_id = v_saga_id AND saga_state NOT IN ('COMPENSATED', 'FAILED');
    ELSIF v_failed_count > 0 THEN
        UPDATE saga_instances
        SET saga_state = 'COMPENSATING',
            version = version + 1
        WHERE saga_id = v_saga_id AND saga_state NOT IN ('COMPENSATING', 'COMPENSATED', 'FAILED');
    ELSIF v_committed_count = v_total_count AND v_total_count > 0 THEN
        UPDATE saga_instances
        SET saga_state = 'COMPLETED',
            completed_at = NOW(),
            version = version + 1
        WHERE saga_id = v_saga_id AND saga_state NOT IN ('COMPLETED');
    ELSE
        UPDATE saga_instances
        SET saga_state = 'IN_PROGRESS',
            version = version + 1
        WHERE saga_id = v_saga_id AND saga_state = 'STARTED';
    END IF;

    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_saga_state ON saga_steps;
CREATE TRIGGER trg_sync_saga_state
    AFTER INSERT OR UPDATE OF step_state ON saga_steps
    FOR EACH ROW
    EXECUTE FUNCTION fn_sync_saga_state();
