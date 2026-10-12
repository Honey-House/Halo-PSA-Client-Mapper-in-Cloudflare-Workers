# Public API policy

This is a **browser tool**, not an integrator API. It is a single Cloudflare Worker (`src/worker.ts`)
that serves one HTML page and a few JSON and image routes the page calls. Last reviewed 2026-10-12.

## OpenAPI exception

The [Honey House / WOSP OpenAPI standard](https://github.com/Honey-House/Honey-House-Company-Documentation/blob/main/docs/decided/openapi-api-standard.md)
asks every JSON HTTP API for `/api/openapi.json` and `/api/docs`. This project records an exception:

- There is **no supported API for third-party automation**, so no OpenAPI document and no Swagger UI is
  served. Do not add `/api/docs` or `/api/openapi.json` to this Worker.
- The routes below exist only to serve the page. They can change without notice and are not a contract.
- If a real integrator API is ever wanted, build it in a FastAPI container that follows the standard and
  have this Worker call it. A Worker would otherwise need a code-first OpenAPI generator (for example Hono
  with Zod OpenAPI) and the standard paths.
- No sunset date applies: there are no legacy paths.

## What the Worker serves

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/` | The HTML page |
| GET | `/api/map-data` | All Halo agents, clients and sites with addresses, as JSON |
| GET | `/api/geocode?q=` | Geocodes one address through Mapbox |
| GET | `/api/halo-image?path=` and `/api/agent-photo?path=` | Proxies a Halo image. `path` must be on an allow-list of Halo image paths |

## Authentication and access

The Worker has **no authentication of its own**. It holds Halo API credentials (`HALO_CLIENT_ID` and
`HALO_CLIENT_SECRET` as Worker secrets), so **whoever can reach the hostname can read the Halo client, site
and agent data returned by `/api/map-data`**.

- **Required:** protect the hostname with Cloudflare Zero Trust (Cloudflare Access), as the README
  describes. Treat an unprotected deployment as a data exposure.
- The Halo credential should be a dedicated, read-only API application (Agents and Customers only).
- `workers_dev` and `preview_urls` are off in `wrangler.toml`; keep them off.
- Not implemented, worth adding: verify the Cloudflare Access JWT (`Cf-Access-Jwt-Assertion`) inside the
  Worker so an unprotected hostname fails closed.
- Not implemented: rate limiting or Turnstile. `/api/geocode` spends the Mapbox key, so put a Cloudflare
  rate-limit rule on `/api/*` until the Worker enforces one.

## Engineering

Internal OpenAPI artifacts, if any are ever produced, belong under `openapi/` in this repo for agents and
release export, never on the public hostname.
