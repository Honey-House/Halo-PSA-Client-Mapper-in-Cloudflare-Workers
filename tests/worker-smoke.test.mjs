// Run with Node 22.18+. These tests deliberately never call Halo or Mapbox.
import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import worker from '../src/worker.ts';

const originalFetch = globalThis.fetch;
let outboundCalls = 0;
globalThis.fetch = async () => {
  outboundCalls += 1;
  throw new Error('Network is not allowed in the mapper smoke test');
};
after(() => {
  globalThis.fetch = originalFetch;
  assert.equal(outboundCalls, 0);
});

function request(path, method = 'GET') {
  return worker.fetch(new Request(new URL(path, 'https://mapper.example.test'), { method }), {});
}

test('serves the map UI without loading tenant records', async () => {
  const response = await request('/');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^text\/html/);
  assert.match(await response.text(), /Halo Client Mapper/);
});

test('missing local bindings produce an empty payload, not an external request', async () => {
  const response = await request('/api/map-data');
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.deepEqual(result.agents, []);
  assert.deepEqual(result.organizations, []);
  assert.ok(result.configChecks.some((check) => check.required && !check.ok));
});

test('the geocoder requires input and image routes reject unsupported paths', async () => {
  assert.equal((await request('/api/geocode')).status, 400);
  for (const path of ['/api/halo-image', '/api/agent-photo']) {
    assert.equal((await request(path + '?path=%2Fnot-a-mapper-image')).status, 400);
  }
});

test('no public integration schema, API docs, or mutation route is exposed', async () => {
  for (const path of ['/api/openapi.json', '/api/docs', '/mcp']) {
    assert.equal((await request(path)).status, 404);
  }
  assert.equal((await request('/api/map-data', 'POST')).status, 404);
});
