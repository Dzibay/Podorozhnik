-- Схема PostgreSQL для сайта Podorozhnik.
-- Идемпотентно (CREATE IF NOT EXISTS): выполняется при первом старте контейнера postgres
-- (docker-entrypoint-initdb.d) и повторно бэкендом при старте (ensure_schema).

CREATE TABLE IF NOT EXISTS leads (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL,
    has_drawing BOOLEAN NOT NULL DEFAULT FALSE,
    comment TEXT NOT NULL DEFAULT '',
    file_name TEXT NOT NULL DEFAULT '',
    file_path TEXT NOT NULL DEFAULT '',
    file_size BIGINT NOT NULL DEFAULT 0,
    file_mime TEXT NOT NULL DEFAULT '',
    source TEXT NOT NULL DEFAULT '',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE leads ADD COLUMN IF NOT EXISTS visitor_id UUID;
ALTER TABLE leads ADD COLUMN IF NOT EXISTS session_id UUID;

CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_visitor ON leads (visitor_id) WHERE visitor_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS analytics_events (
    id              BIGSERIAL PRIMARY KEY,
    occurred_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    received_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    visitor_id      UUID NOT NULL,
    session_id      UUID NOT NULL,
    event           TEXT NOT NULL,
    path            TEXT NOT NULL DEFAULT '',
    title           TEXT NOT NULL DEFAULT '',
    referrer        TEXT NOT NULL DEFAULT '',
    utm_source      TEXT NOT NULL DEFAULT '',
    utm_medium      TEXT NOT NULL DEFAULT '',
    utm_campaign    TEXT NOT NULL DEFAULT '',
    utm_content     TEXT NOT NULL DEFAULT '',
    utm_term        TEXT NOT NULL DEFAULT '',
    label           TEXT NOT NULL DEFAULT '',
    href            TEXT NOT NULL DEFAULT '',
    props           JSONB NOT NULL DEFAULT '{}'::jsonb,
    device          TEXT NOT NULL DEFAULT '',
    viewport_w      SMALLINT
);

CREATE INDEX IF NOT EXISTS idx_ae_occurred ON analytics_events (occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_event_time ON analytics_events (event, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_path_time ON analytics_events (path, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_session ON analytics_events (session_id, occurred_at);
CREATE INDEX IF NOT EXISTS idx_ae_visitor_time ON analytics_events (visitor_id, occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_ae_utm ON analytics_events (utm_source, occurred_at DESC)
    WHERE utm_source <> '';
CREATE INDEX IF NOT EXISTS idx_ae_label ON analytics_events (event, label, occurred_at DESC)
    WHERE label <> '';
CREATE INDEX IF NOT EXISTS idx_ae_calc ON analytics_events (occurred_at DESC)
    WHERE event = 'calc';

CREATE TABLE IF NOT EXISTS telegram_recipients (
    id          BIGSERIAL PRIMARY KEY,
    chat_id     TEXT NOT NULL UNIQUE,
    name        TEXT NOT NULL DEFAULT '',
    username    TEXT NOT NULL DEFAULT '',
    enabled     BOOLEAN NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_tg_recipients_enabled
    ON telegram_recipients (enabled) WHERE enabled;
