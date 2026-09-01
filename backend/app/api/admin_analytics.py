"""Агрегации для админки. Сырые события не отдаём пачками на фронт —
только готовые срезы. При росте трафика этот слой можно перевести
на суточные rollup-таблицы, не меняя контракт ответа."""

from __future__ import annotations

from datetime import datetime, timedelta
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import APIRouter, Depends, Query

from app.auth import require_admin
from app.db import pool

router = APIRouter(dependencies=[Depends(require_admin)])
MSK = ZoneInfo("Europe/Moscow")


def _bounds(days: int) -> tuple[datetime, datetime]:
    now = datetime.now(MSK)
    end = now
    if days <= 1:
        start = now.replace(hour=0, minute=0, second=0, microsecond=0)
    else:
        start = now - timedelta(days=days)
    return start, end


def _row(keys: list[str], values: tuple | None) -> dict[str, Any]:
    values = values or (0,) * len(keys)
    out: dict[str, Any] = {}
    for k, v in zip(keys, values):
        if hasattr(v, "isoformat"):
            out[k] = v.isoformat()
        elif v is None:
            out[k] = 0
        else:
            out[k] = v
    return out


def _table(keys: list[str], rows: list[tuple]) -> list[dict[str, Any]]:
    return [_row(keys, r) for r in rows]


def _calc_breakdown(conn, start: datetime, end: datetime, action: str) -> list[dict[str, Any]]:
    rows = conn.execute(
        """
        SELECT COALESCE(NULLIF(props->>'id', ''), label) AS id,
               MAX(NULLIF(label, '')) AS label,
               COUNT(*)::int AS events,
               COUNT(DISTINCT session_id)::int AS sessions
        FROM analytics_events
        WHERE event = 'calc'
          AND occurred_at >= %s AND occurred_at < %s
          AND props->>'action' = %s
        GROUP BY 1
        ORDER BY sessions DESC, events DESC
        LIMIT 12
        """,
        (start, end, action),
    ).fetchall()
    return _table(["id", "label", "events", "sessions"], rows)


@router.get("/admin/analytics")
def analytics_summary(
    days: int = Query(default=7, ge=1, le=90),
) -> dict:
    start, end = _bounds(days)
    by_hour = days <= 1

    with pool.connection() as conn:
        kpis = conn.execute(
            """
            SELECT
                COUNT(*) FILTER (WHERE event = 'pageview') AS pageviews,
                COUNT(DISTINCT visitor_id) AS visitors,
                COUNT(DISTINCT session_id) AS sessions,
                COUNT(*) FILTER (WHERE event IN ('click', 'outbound', 'tel', 'mail')) AS clicks,
                COUNT(*) FILTER (WHERE event = 'form_start') AS form_starts,
                COUNT(*) FILTER (WHERE event = 'form_submit') AS form_ok,
                COUNT(*) FILTER (
                    WHERE event = 'tel'
                       OR (event = 'outbound' AND href LIKE 'tel:%%')
                ) AS tel_clicks,
                COUNT(*) FILTER (
                    WHERE event = 'mail'
                       OR (event = 'outbound' AND href LIKE 'mailto:%%')
                ) AS mail_clicks,
                COUNT(*) FILTER (WHERE event = 'form_error') AS form_errors
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
            """,
            (start, end),
        ).fetchone()

        live = conn.execute(
            """
            SELECT COUNT(DISTINCT session_id)
            FROM analytics_events
            WHERE occurred_at > NOW() - INTERVAL '5 minutes'
            """,
        ).fetchone()[0]

        leads_n = conn.execute(
            """
            SELECT COUNT(*) FROM leads
            WHERE created_at >= %s AND created_at < %s
            """,
            (start, end),
        ).fetchone()[0]

        bounce = conn.execute(
            """
            WITH s AS (
                SELECT session_id,
                       COUNT(*) FILTER (WHERE event = 'pageview') AS pvs,
                       COUNT(*) FILTER (
                           WHERE event IN ('click', 'outbound', 'form_start', 'form_submit', 'calc', 'tel', 'mail')
                       ) AS actions
                FROM analytics_events
                WHERE occurred_at >= %s AND occurred_at < %s
                GROUP BY session_id
            )
            SELECT
                COUNT(*)::int AS sessions,
                COUNT(*) FILTER (WHERE pvs <= 1 AND actions = 0)::int AS bounced
            FROM s
            """,
            (start, end),
        ).fetchone()

        avg_sec = conn.execute(
            """
            SELECT AVG(EXTRACT(EPOCH FROM (last_at - first_at)))
            FROM (
                SELECT MIN(occurred_at) AS first_at, MAX(occurred_at) AS last_at
                FROM analytics_events
                WHERE occurred_at >= %s AND occurred_at < %s
                GROUP BY session_id
            ) t
            WHERE last_at > first_at
            """,
            (start, end),
        ).fetchone()[0]

        if by_hour:
            series = conn.execute(
                """
                SELECT date_trunc('hour', occurred_at AT TIME ZONE 'Europe/Moscow') AS bucket,
                       COUNT(DISTINCT visitor_id) AS visitors,
                       COUNT(*) FILTER (WHERE event = 'pageview') AS pageviews
                FROM analytics_events
                WHERE occurred_at >= %s AND occurred_at < %s
                GROUP BY 1
                ORDER BY 1
                """,
                (start, end),
            ).fetchall()
        else:
            series = conn.execute(
                """
                SELECT date_trunc('day', occurred_at AT TIME ZONE 'Europe/Moscow') AS bucket,
                       COUNT(DISTINCT visitor_id) AS visitors,
                       COUNT(*) FILTER (WHERE event = 'pageview') AS pageviews
                FROM analytics_events
                WHERE occurred_at >= %s AND occurred_at < %s
                GROUP BY 1
                ORDER BY 1
                """,
                (start, end),
            ).fetchall()

        lead_series = conn.execute(
            """
            SELECT date_trunc(%s, created_at AT TIME ZONE 'Europe/Moscow') AS bucket,
                   COUNT(*) AS leads
            FROM leads
            WHERE created_at >= %s AND created_at < %s
            GROUP BY 1
            """,
            ("hour" if by_hour else "day", start, end),
        ).fetchall()

        pages = conn.execute(
            """
            SELECT path,
                   MAX(NULLIF(title, '')) AS title,
                   COUNT(*) AS views,
                   COUNT(DISTINCT visitor_id) AS visitors
            FROM analytics_events
            WHERE event = 'pageview'
              AND occurred_at >= %s AND occurred_at < %s
            GROUP BY path
            ORDER BY views DESC
            LIMIT 20
            """,
            (start, end),
        ).fetchall()

        clicks = conn.execute(
            """
            SELECT
                CASE WHEN label <> '' THEN label ELSE href END AS label,
                path,
                event,
                COUNT(*) AS count
            FROM analytics_events
            WHERE event IN ('click', 'outbound', 'tel', 'mail')
              AND occurred_at >= %s AND occurred_at < %s
              AND (label <> '' OR href <> '')
            GROUP BY 1, path, event
            ORDER BY count DESC
            LIMIT 25
            """,
            (start, end),
        ).fetchall()

        sources = conn.execute(
            """
            SELECT
                CASE
                    WHEN utm_source <> '' THEN utm_source
                    WHEN referrer <> '' THEN COALESCE(
                        regexp_replace(
                            substring(referrer from 'https?://([^/]+)'),
                            '^www\\.',
                            ''
                        ),
                        referrer
                    )
                    ELSE 'прямой заход'
                END AS source,
                COUNT(DISTINCT visitor_id) AS visitors,
                COUNT(DISTINCT session_id) AS sessions
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
            GROUP BY 1
            ORDER BY visitors DESC
            LIMIT 15
            """,
            (start, end),
        ).fetchall()

        devices = conn.execute(
            """
            SELECT COALESCE(NULLIF(device, ''), 'неизвестно') AS device,
                   COUNT(DISTINCT visitor_id) AS visitors
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
            GROUP BY 1
            ORDER BY visitors DESC
            """,
            (start, end),
        ).fetchall()

        hours = conn.execute(
            """
            SELECT EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'Europe/Moscow')::int AS hour,
                   COUNT(DISTINCT session_id) AS sessions
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
            GROUP BY 1
            ORDER BY 1
            """,
            (start, end),
        ).fetchall()

        funnel = conn.execute(
            """
            SELECT
                COUNT(DISTINCT session_id) AS visits,
                COUNT(DISTINCT session_id) FILTER (
                    WHERE path LIKE '/kalkulyator%%' OR event = 'calc'
                ) AS calculator,
                COUNT(DISTINCT session_id) FILTER (
                    WHERE event = 'calc'
                      AND COALESCE(props->>'action', '') IN (
                          'type', 'kind', 'coating', 'delivery', 'roof', 'crane', 'mass', 'metal'
                      )
                ) AS calc_engage,
                COUNT(DISTINCT session_id) FILTER (WHERE event = 'form_start') AS form_start,
                COUNT(DISTINCT session_id) FILTER (WHERE event = 'form_submit') AS form_ok
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
            """,
            (start, end),
        ).fetchone()

        recent = conn.execute(
            """
            SELECT occurred_at, event, path, label, href, device, props->>'provider' AS provider
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
              AND event NOT IN ('leave', 'scroll')
            ORDER BY occurred_at DESC
            LIMIT 60
            """,
            (start, end),
        ).fetchall()

        campaigns = conn.execute(
            """
            WITH camp AS (
                SELECT
                    utm_source,
                    utm_medium,
                    utm_campaign,
                    COUNT(DISTINCT visitor_id) AS visitors,
                    COUNT(DISTINCT session_id) AS sessions,
                    COUNT(*) FILTER (
                        WHERE event = 'tel'
                           OR (event = 'outbound' AND href LIKE 'tel:%%')
                    )::int AS tel_clicks,
                    COUNT(*) FILTER (
                        WHERE event = 'mail'
                           OR (event = 'outbound' AND href LIKE 'mailto:%%')
                    )::int AS mail_clicks
                FROM analytics_events
                WHERE occurred_at >= %s AND occurred_at < %s
                  AND utm_source <> ''
                GROUP BY 1, 2, 3
            ),
            lead_camp AS (
                SELECT e.utm_source, e.utm_medium, e.utm_campaign,
                       COUNT(DISTINCT l.id)::int AS leads
                FROM leads l
                JOIN analytics_events e
                  ON e.session_id = l.session_id
                 AND e.utm_source <> ''
                WHERE l.created_at >= %s AND l.created_at < %s
                  AND l.session_id IS NOT NULL
                  AND e.occurred_at >= %s AND e.occurred_at < %s
                GROUP BY 1, 2, 3
            )
            SELECT
                c.utm_source,
                c.utm_medium,
                c.utm_campaign,
                c.visitors,
                c.sessions,
                c.tel_clicks,
                c.mail_clicks,
                COALESCE(l.leads, 0) AS leads
            FROM camp c
            LEFT JOIN lead_camp l
              ON l.utm_source = c.utm_source
             AND l.utm_medium = c.utm_medium
             AND l.utm_campaign = c.utm_campaign
            ORDER BY c.visitors DESC, leads DESC
            LIMIT 20
            """,
            (start, end, start, end, start, end),
        ).fetchall()

        pages_per_session = conn.execute(
            """
            SELECT AVG(n)
            FROM (
                SELECT COUNT(*) FILTER (WHERE event = 'pageview') AS n
                FROM analytics_events
                WHERE occurred_at >= %s AND occurred_at < %s
                GROUP BY session_id
            ) t
            """,
            (start, end),
        ).fetchone()[0]

        dwell = conn.execute(
            """
            SELECT path, AVG((props->>'ms')::double precision)
            FROM analytics_events
            WHERE event = 'leave'
              AND occurred_at >= %s AND occurred_at < %s
              AND (props->>'ms') ~ '^[0-9]+$'
            GROUP BY path
            """,
            (start, end),
        ).fetchall()

        landings = conn.execute(
            """
            SELECT path, COUNT(*)::int AS sessions
            FROM (
                SELECT DISTINCT ON (session_id) path
                FROM analytics_events
                WHERE event = 'pageview'
                  AND occurred_at >= %s AND occurred_at < %s
                ORDER BY session_id, occurred_at
            ) t
            GROUP BY path
            ORDER BY sessions DESC
            LIMIT 10
            """,
            (start, end),
        ).fetchall()

        leads_by_page = conn.execute(
            """
            SELECT COALESCE(NULLIF(source, ''), '/') AS path, COUNT(*)::int AS leads
            FROM leads
            WHERE created_at >= %s AND created_at < %s
            GROUP BY 1
            ORDER BY leads DESC
            LIMIT 10
            """,
            (start, end),
        ).fetchall()

        calc_kpis = conn.execute(
            """
            SELECT
                COUNT(DISTINCT visitor_id) FILTER (WHERE path LIKE '/kalkulyator%%') AS visitors,
                COUNT(DISTINCT session_id) FILTER (WHERE path LIKE '/kalkulyator%%') AS sessions,
                AVG((props->>'ms')::double precision) FILTER (
                    WHERE event = 'leave'
                      AND path LIKE '/kalkulyator%%'
                      AND (props->>'ms') ~ '^[0-9]+$'
                ) AS avg_ms,
                COUNT(DISTINCT session_id) FILTER (
                    WHERE event = 'form_start' AND path LIKE '/kalkulyator%%'
                ) AS form_starts
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
            """,
            (start, end),
        ).fetchone()

        calc_leads = conn.execute(
            """
            SELECT COUNT(*) FROM leads
            WHERE created_at >= %s AND created_at < %s
              AND source LIKE '/kalkulyator%%'
            """,
            (start, end),
        ).fetchone()[0]

        calc_modes_raw = conn.execute(
            """
            SELECT mode, COUNT(*)::int AS events, COUNT(DISTINCT session_id)::int AS sessions
            FROM (
                SELECT session_id,
                    CASE
                        WHEN props->>'mode' IN ('details', 'object') THEN props->>'mode'
                        WHEN props->>'id' IN ('details', 'object') THEN props->>'id'
                        WHEN label IN ('Детали и конструкции', 'calc-mode-details') THEN 'details'
                        WHEN label IN ('Объект целиком', 'calc-mode-object') THEN 'object'
                        ELSE NULL
                    END AS mode
                FROM analytics_events
                WHERE occurred_at >= %s AND occurred_at < %s
                  AND event IN ('calc', 'click')
            ) t
            WHERE mode IS NOT NULL
            GROUP BY mode
            """,
            (start, end),
        ).fetchall()

        calc_types = _calc_breakdown(conn, start, end, "type")
        calc_kinds = _calc_breakdown(conn, start, end, "kind")
        calc_coatings = _calc_breakdown(conn, start, end, "coating")
        calc_deliveries = _calc_breakdown(conn, start, end, "delivery")
        calc_regions = _calc_breakdown(conn, start, end, "region")

        contact_places = conn.execute(
            """
            SELECT
                CASE
                    WHEN event IN ('tel', 'mail') THEN event
                    WHEN href LIKE 'tel:%%' THEN 'tel'
                    ELSE 'mail'
                END AS kind,
                CASE WHEN label <> '' THEN label ELSE href END AS label,
                COUNT(*)::int AS count
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
              AND (
                event IN ('tel', 'mail')
                OR (event = 'outbound' AND (href LIKE 'tel:%%' OR href LIKE 'mailto:%%'))
              )
            GROUP BY 1, 2
            ORDER BY count DESC
            """,
            (start, end),
        ).fetchall()

        mail_providers = conn.execute(
            """
            SELECT
                CASE
                    WHEN event = 'mail' THEN COALESCE(NULLIF(props->>'provider', ''), 'unknown')
                    ELSE 'mailto'
                END AS provider,
                COUNT(*)::int AS count
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
              AND (
                event = 'mail'
                OR (event = 'outbound' AND href LIKE 'mailto:%%')
              )
            GROUP BY 1
            ORDER BY count DESC
            """,
            (start, end),
        ).fetchall()

        contact_rows = conn.execute(
            """
            SELECT
                CASE
                    WHEN event IN ('tel', 'mail') THEN event
                    WHEN href LIKE 'tel:%%' THEN 'tel'
                    ELSE 'mail'
                END AS kind,
                CASE WHEN label <> '' THEN label ELSE href END AS label,
                path,
                CASE
                    WHEN event = 'mail' THEN COALESCE(NULLIF(props->>'provider', ''), '')
                    WHEN event = 'outbound' AND href LIKE 'mailto:%%' THEN 'mailto'
                    ELSE ''
                END AS provider,
                COUNT(*)::int AS count
            FROM analytics_events
            WHERE occurred_at >= %s AND occurred_at < %s
              AND (
                event IN ('tel', 'mail')
                OR (event = 'outbound' AND (href LIKE 'tel:%%' OR href LIKE 'mailto:%%'))
              )
            GROUP BY 1, 2, 3, 4
            ORDER BY count DESC
            LIMIT 50
            """,
            (start, end),
        ).fetchall()

    lead_map = {r[0]: r[1] for r in lead_series}
    timeseries = []
    for bucket, visitors, pageviews in series:
        timeseries.append(
            {
                "t": bucket.isoformat() if hasattr(bucket, "isoformat") else str(bucket),
                "visitors": visitors,
                "pageviews": pageviews,
                "leads": int(lead_map.get(bucket, 0)),
            }
        )
    # дни/часы без трафика, но с заявками
    known = {row["t"] for row in timeseries}
    for bucket, n in lead_series:
        key = bucket.isoformat() if hasattr(bucket, "isoformat") else str(bucket)
        if key not in known:
            timeseries.append({"t": key, "visitors": 0, "pageviews": 0, "leads": int(n)})
    timeseries.sort(key=lambda r: r["t"])

    sessions = int(kpis[2] or 0)
    bounced = int(bounce[1] or 0) if bounce else 0
    bounce_rate = (bounced / sessions) if sessions else 0

    f_visits = int(funnel[0] or 0)
    f_calc = int(funnel[1] or 0)
    f_engage = int(funnel[2] or 0)
    f_form = int(funnel[3] or 0)

    dwell_map = {r[0]: float(r[1] or 0) for r in dwell}
    pages_out = []
    for path, title, views, visitors in pages:
        pages_out.append(
            {
                "path": path,
                "title": title or "",
                "views": views,
                "visitors": visitors,
                "avg_sec": dwell_map.get(path, 0) / 1000 if dwell_map.get(path) else 0,
            }
        )

    mode_map = {r[0]: r for r in calc_modes_raw}
    calc_modes = []
    for mid, label in (
        ("details", "Детали и конструкции"),
        ("object", "Объект целиком"),
    ):
        row = mode_map.get(mid)
        calc_modes.append(
            {
                "id": mid,
                "label": label,
                "events": int(row[1]) if row else 0,
                "sessions": int(row[2]) if row else 0,
            }
        )
    mode_total = int(calc_kpis[1] or 0) or sum(m["sessions"] for m in calc_modes) or 1
    for m in calc_modes:
        m["share"] = m["sessions"] / mode_total

    return {
        "period": {"from": start.isoformat(), "to": end.isoformat(), "days": days, "by_hour": by_hour},
        "kpis": {
            "live": int(live or 0),
            "visitors": int(kpis[1] or 0),
            "sessions": sessions,
            "pageviews": int(kpis[0] or 0),
            "clicks": int(kpis[3] or 0),
            "form_starts": int(kpis[4] or 0),
            "form_errors": int(kpis[8] or 0),
            "leads": int(leads_n or 0),
            "tel_clicks": int(kpis[6] or 0),
            "mail_clicks": int(kpis[7] or 0),
            "conversion": (leads_n / sessions) if sessions else 0,
            "bounce_rate": bounce_rate,
            "avg_session_sec": float(avg_sec or 0),
            "pages_per_session": float(pages_per_session or 0),
        },
        "timeseries": timeseries,
        "pages": pages_out,
        "clicks": _table(["label", "path", "event", "count"], clicks),
        "sources": _table(["source", "visitors", "sessions"], sources),
        "devices": _table(["device", "visitors"], devices),
        "hours": _table(["hour", "sessions"], hours),
        "campaigns": _table(
            [
                "utm_source",
                "utm_medium",
                "utm_campaign",
                "visitors",
                "sessions",
                "tel_clicks",
                "mail_clicks",
                "leads",
            ],
            campaigns,
        ),
        "landings": _table(["path", "sessions"], landings),
        "leads_by_page": _table(["path", "leads"], leads_by_page),
        "calculator": {
            "visitors": int(calc_kpis[0] or 0),
            "sessions": int(calc_kpis[1] or 0),
            "avg_sec": float(calc_kpis[2] or 0) / 1000 if calc_kpis[2] else 0,
            "form_starts": int(calc_kpis[3] or 0),
            "leads": int(calc_leads or 0),
            "modes": calc_modes,
            "types": calc_types,
            "kinds": calc_kinds,
            "coatings": calc_coatings,
            "deliveries": calc_deliveries,
            "regions": calc_regions,
        },
        "contact": {
            "places": _table(["kind", "label", "count"], contact_places),
            "mail_providers": _table(["provider", "count"], mail_providers),
            "rows": _table(["kind", "label", "path", "provider", "count"], contact_rows),
        },
        "funnel": [
            {"step": "visit", "label": "Визиты", "count": f_visits},
            {"step": "calculator", "label": "Калькулятор", "count": f_calc},
            {"step": "calc_engage", "label": "Собрали расчёт", "count": f_engage},
            {"step": "form_start", "label": "Начали форму", "count": f_form},
            {"step": "lead", "label": "Заявка", "count": int(leads_n or 0)},
        ],
        "recent": [
            {
                "t": r[0].isoformat(),
                "event": r[1],
                "path": r[2],
                "label": r[3],
                "href": r[4],
                "device": r[5],
                "provider": r[6] or "",
            }
            for r in recent
        ],
    }
