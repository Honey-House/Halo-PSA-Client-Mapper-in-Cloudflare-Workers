# Good Heart Open Build Standard

This repository uses GHOBS `ghobs/v1`, pinned to version `0.1.12` (standard commit `a57a4fabd02cda61dcd286b2491470d58ac97207`). The app manifest is [app.yml](../app.yml); the managed instructions and project entry point are in [AGENTS.md](../AGENTS.md).

## Scope

1. Internal desktop operations map on Cloudflare Workers. The HTML consumes JSON/image routes from the same Worker; these routes are not a supported integration API or a separate automation surface. See [the route inventory and access requirements](PUBLIC_API.md). No new OpenAPI, Swagger, or MCP route is in scope.
2. No changes to Worker runtime, bindings, deploy settings, or Cloudflare Access. Treat protected deployment/access verification as an operator step, not as a result implied by a local smoke pass.
3. `CHK-001` and `UPD-001` have deployment-policy exceptions in the manifest. Run the vendored checker before pushing; refresh the pinned standard manually. If using `ghobs sync` to refresh, omit the newly generated check/sync workflow files from the commit and re-run validation locally. Do not change the existing release process.

## Verify

```sh
python .ghobs/ghobs.py check
node --test tests/worker-smoke.test.mjs
```

The Node smoke suite (22.18+) uses the Worker entry point with synthetic requests and no external network calls. It checks the map shell, missing-binding behavior and existing browser route boundaries. It does not validate Edge Access, Halo tenant responses, or Mapbox quotas. For runtime changes, check the relevant workflow with synthetic fixtures first and use an authorized Cloudflare environment for any provider integration test.

## Handoff

1. **Work tracker:** [GitHub Issues](https://github.com/Honey-House/Halo-PSA-Client-Mapper-in-Cloudflare-Workers/issues) is the one authoritative queue for public-safe work. Use `Honey-House/Halo-PSA-Client-Mapper-in-Cloudflare-Workers#<number>` in related changes and the same issue for state, title, owner or unassigned, priority, acceptance criteria, verification, and next action. An issue is planned until work is claimed; record in-progress, blocked (including what must happen next), or in-review state on the same record. Assign an owner before work starts.
2. **Protect access and history:** for sensitive reports, follow [SECURITY.md](../SECURITY.md); never create a public issue or post client data, real hostnames, or private report references. Keep an ID mapping for an authorized move, and link or close duplicates only within the appropriate visibility. For closed work, record the outcome and evidence, including any verification gap. Use the active issue or its linked draft PR for handoff; do not create a second queue.
3. **Starting ref:** `main`; original base `81658d328e687712058ac7faff04465d7a619a9c`. The Git history for this document identifies the adoption change. Owner: repository maintainer; no implementation claimed here.
4. **Done:** local policy/tooling adoption and offline read-only smoke coverage. The browser workflow and deployment configuration are not changed. Read the verification result in the release handoff; a local pass does not certify every manual GHOBS control.
5. **Next:** on the next runtime change, review the existing map route inventory with the owner and add a synthetic matching fixture if changing client or staff matching. Verify Cloudflare Access and the deployed revision from the authorized dashboard before certifying production, without collecting tenant records. Confirm brand and manual UI/error requirements on the next applicable UI change.
6. **Deploy evidence:** [README.md](../README.md) documents Cloudflare Workers Builds and a custom domain on `halo-client-mapper`; the actual Git link/deployment status must be checked in Cloudflare Workers & Pages by an authorized operator. No GitHub Actions deployment is defined here.
