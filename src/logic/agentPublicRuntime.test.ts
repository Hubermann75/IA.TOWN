import assert from 'node:assert/strict';
import test from 'node:test';
import express from 'express';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { buildAgentProposalSystemInstruction, createAgentRuntimeRouter } from '../../server/agentRuntime';

const validResult = {
  requestId: 'request-route-test',
  agentId: '39',
  agentName: 'MINER.PRIME',
  toolId: 'centmine.prospector-boamp-search.v1' as const,
  createdAt: '2026-11-02T12:00:00.000Z',
  durationMs: 1,
  output: 'Lecture BOAMP réalisée; aucun acte de candidature envoyé.',
  resultKind: 'REMOTE_READ_ONLY_RESULT' as const,
  externalActionExecuted: false as const,
  data: {
    dataKind: 'BOAMP_PUBLIC_TENDER_SEARCH' as const,
    sourceName: 'BOAMP' as const,
    sourceUrl: 'https://www.boamp.fr/explore/dataset/boamp/' as const,
    verificationState: 'SOURCE_FETCHED_ELIGIBILITY_UNVERIFIED' as const,
    apiAccessChargeEur: 0 as const,
    hostingAndBandwidthCostMeasured: false as const,
    keywords: 'application web',
    fetchedAt: '2026-11-02T12:00:00.000Z',
    totalMatchedCount: 0,
    recordsInspected: 0,
    excludedNotOpenOrInvalid: 0,
    omittedInspectedBeyondDisplayLimit: 0,
    opportunities: [],
  },
};

test('CEO Gemini proposal prompt preserves the V6 alias and blocks fabricated evidence, dispatch, spending, and approval', () => {
  const instruction = buildAgentProposalSystemInstruction({ id: '06', name: 'DIRECTOR.GENCY', type: 'TYPE_A_IA' });
  assert.match(instruction, /CEO.AGENT V6 #01/);
  assert.match(instruction, /n’invente aucune opportunité/);
  assert.match(instruction, /ne constitue jamais une autorisation/);
  assert.match(instruction, /ni distribuer une sous-mission/);
  assert.match(instruction, /proposition textuelle facultative/);
});

test('Prospector API is same-origin, profile-bound, and calls only its injected read-only search', async t => {
  let searchCalls = 0;
  const app = express();
  app.use('/api/agents', createAgentRuntimeRouter({
    prospect: async mission => {
      searchCalls += 1;
      assert.equal(mission, JSON.stringify({ keywords: 'application web' }));
      return validResult;
    },
  }));
  const server = createServer(app);
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(async () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())));
  const address = server.address() as AddressInfo;
  const endpoint = `http://127.0.0.1:${address.port}/api/agents/prospect`;

  const valid = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ agentId: '39', mission: JSON.stringify({ keywords: 'application web' }) }),
  });
  assert.equal(valid.status, 200);
  assert.equal((await valid.json()).resultKind, 'REMOTE_READ_ONLY_RESULT');
  assert.equal(searchCalls, 1);

  const wrongProfile = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ agentId: '38', mission: JSON.stringify({ keywords: 'application web' }) }),
  });
  assert.equal(wrongProfile.status, 403);
  assert.equal(searchCalls, 1);

  const wrongOrigin = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json', origin: 'https://attacker.example' },
    body: JSON.stringify({ agentId: '39', mission: JSON.stringify({ keywords: 'application web' }) }),
  });
  assert.equal(wrongOrigin.status, 403);
  assert.equal(searchCalls, 1);
});
