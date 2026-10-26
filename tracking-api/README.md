# tracking-api

Stores tool executions (SQLite) and serves the Reports page. Node >= 22.13, no dependencies.

Deploy on the VPS (e.g. `/opt/tracking-backend`), behind HTTPS (the portal is https, so browsers block a plain-http API):

    PORT=8200 DB_PATH=/opt/tracking-backend/data/tracking.db \
    ALLOWED_ORIGINS=https://staff.rmhadvisors.in node tracking-api/server.mjs

Portal build env: `VITE_TRACKING_API_URL=https://<your-tracking-domain>`.

A tool can report its outcome back (the launch event id is not yet passed to tools):

    PATCH /api/events/<id>   {"status":"success"|"failed"|"cancelled","errorCode":"PARSE_ERROR"}

Tests: `npm run test:tracking`.
