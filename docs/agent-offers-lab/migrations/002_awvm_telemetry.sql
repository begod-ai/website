-- Separate AWVM retrieval events from Agent Offers experiment events while
-- continuing to use the existing durable telemetry table and indexes.

ALTER TABLE agent_offer_events
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'agent_offers_lab';

ALTER TABLE agent_offer_events
  DROP CONSTRAINT IF EXISTS agent_offer_events_source_check;

ALTER TABLE agent_offer_events
  ADD CONSTRAINT agent_offer_events_source_check CHECK (
    source IN ('agent_offers_lab', 'awvm')
  );

ALTER TABLE agent_offer_events
  DROP CONSTRAINT IF EXISTS agent_offer_events_event_type_check;

ALTER TABLE agent_offer_events
  ADD CONSTRAINT agent_offer_events_event_type_check CHECK (
    event_type IN (
      'landing_fetch',
      'page_fetch',
      'offer_endpoint_fetch',
      'outbound_action',
      'awvm_page_fetch',
      'awvm_resource_fetch'
    )
  );

-- Preserve first-generation sanitizer observations while removing them from
-- Agent Offers funnel counts.
UPDATE agent_offer_events
SET source = 'awvm', event_type = 'awvm_page_fetch'
WHERE route = '/lab/sanitizer-probe'
  AND event_type = 'page_fetch'
  AND variant IS NULL;

CREATE INDEX IF NOT EXISTS agent_offer_events_source_occurred_at_idx
  ON agent_offer_events (source, occurred_at DESC);
