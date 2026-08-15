-- Durable request telemetry for the begod.ai Agent Offers Lab.
-- Apply explicitly with `npm run agent-lab:migrate` or psql. The application
-- never creates or changes production tables during a request.

CREATE TABLE IF NOT EXISTS agent_offer_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at TIMESTAMPTZ NOT NULL,
  event_type TEXT NOT NULL CHECK (
    event_type IN (
      'landing_fetch',
      'page_fetch',
      'json_endpoint_fetch',
      'well_known_fetch',
      'outbound_action'
    )
  ),
  variant TEXT NULL CHECK (variant IS NULL OR variant IN ('A', 'B', 'C', 'D', 'E')),
  canary_id TEXT NULL,
  route TEXT NOT NULL,
  request_method TEXT NOT NULL,
  user_agent TEXT NOT NULL,
  agent_class TEXT NOT NULL,
  referrer TEXT NULL,
  accept_header TEXT NULL,
  query_params JSONB NOT NULL DEFAULT '{}'::jsonb,
  test_run_id VARCHAR(64) NULL CHECK (
    test_run_id IS NULL OR test_run_id ~ '^[A-Za-z0-9_-]{1,64}$'
  ),
  environment TEXT NOT NULL,
  deployment_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS agent_offer_events_occurred_at_idx
  ON agent_offer_events (occurred_at DESC);

CREATE INDEX IF NOT EXISTS agent_offer_events_event_type_idx
  ON agent_offer_events (event_type);

CREATE INDEX IF NOT EXISTS agent_offer_events_variant_idx
  ON agent_offer_events (variant);

CREATE INDEX IF NOT EXISTS agent_offer_events_agent_class_idx
  ON agent_offer_events (agent_class);

CREATE INDEX IF NOT EXISTS agent_offer_events_test_run_id_idx
  ON agent_offer_events (test_run_id)
  WHERE test_run_id IS NOT NULL;
