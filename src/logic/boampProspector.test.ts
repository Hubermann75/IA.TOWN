import assert from 'node:assert/strict';
import test from 'node:test';
import {
  BOAMP_PROSPECTOR_AGENT_ID,
  BOAMP_PROSPECTOR_AGENT_NAME,
  BOAMP_PROSPECTOR_TOOL_ID,
  isAgentPublicOpportunityResult,
  parseProspectorMission,
} from './agentPublicOpportunity';
import { searchBoampPublicNotices } from './boampProspector';

const NOW = new Date('2026-11-02T12:00:00.000Z');

function responseFor(document: unknown, init: ResponseInit = {}): Response {
  return new Response(JSON.stringify(document), {
    status: 200,
    headers: { 'content-type': 'application/json' },
    ...init,
  });
}

function openNotice(index: number) {
  return {
    idweb: `26-${100_000 + index}`,
    objet: `Développement logiciel ${index}`,
    dateparution: '2026-11-01',
    datelimitereponse: '2026-12-02T02:00:00+02:00',
    nature: 'APPEL_OFFRE',
    type_marche_facette: 'Services',
    DONNEES: { contact: 'must not be selected or returned' },
  };
}

test('Prospector mission parser accepts only a bounded keyword search and no URL or action fields', () => {
  assert.deepEqual(parseProspectorMission(JSON.stringify({ keywords: '  développement   application web  ' })), {
    keywords: 'développement application web',
  });
  assert.throws(() => parseProspectorMission('https://evil.example/private'), /JSON valide/);
  assert.throws(() => parseProspectorMission(JSON.stringify({ keywords: 'web', url: 'http://127.0.0.1' })), /uniquement le champ keywords/);
  assert.throws(() => parseProspectorMission(JSON.stringify({ keywords: 'abc" OR *' })), /Saisissez/);
  assert.throws(() => parseProspectorMission(JSON.stringify({ keywords: 'x'.repeat(101) })), /Saisissez/);
});

test('BOAMP search is restricted to the official endpoint and returns provenance with only open ISO-dated notices', async () => {
  let requestedUrl: URL | undefined;
  let requestInit: RequestInit | undefined;
  const rows: unknown[] = Array.from({ length: 12 }, (_, index) => openNotice(index + 1));
  rows.push(
    { ...openNotice(20), datelimitereponse: '2026-10-01T00:00:00Z' },
    { ...openNotice(21), datelimitereponse: 'tomorrow' },
    { ...openNotice(22), nature: 'ATTRIBUTION' },
  );
  const data = await searchBoampPublicNotices(JSON.stringify({ keywords: 'développement application web' }), {
    now: () => NOW,
    fetcher: (async (input: RequestInfo | URL, init?: RequestInit) => {
      requestedUrl = new URL(input.toString());
      requestInit = init;
      return responseFor({ total_count: 99, results: rows });
    }) as typeof fetch,
  });

  assert.equal(requestedUrl?.origin, 'https://www.boamp.fr');
  assert.equal(requestedUrl?.pathname, '/api/explore/v2.1/catalog/datasets/boamp/records');
  assert.equal(requestedUrl?.searchParams.get('select'), 'idweb,objet,dateparution,datelimitereponse,nature,type_marche_facette');
  assert.equal(requestedUrl?.searchParams.get('limit'), '30');
  assert.equal(requestedUrl?.searchParams.get('where'), 'search(objet, "développement application web") AND nature = "APPEL_OFFRE"');
  assert.equal(requestInit?.method, 'GET');
  assert.equal(requestInit?.redirect, 'error');
  assert.equal(data.sourceName, 'BOAMP');
  assert.equal(data.verificationState, 'SOURCE_FETCHED_ELIGIBILITY_UNVERIFIED');
  assert.equal(data.totalMatchedCount, 99);
  assert.equal(data.recordsInspected, 15);
  assert.equal(data.excludedNotOpenOrInvalid, 3);
  assert.equal(data.omittedInspectedBeyondDisplayLimit, 2);
  assert.equal(data.opportunities.length, 10);
  assert.equal(data.opportunities[0].sourceUrl, 'https://www.boamp.fr/pages/avis/?q=idweb%3A26-100001');
  assert.equal(data.opportunities[0].deadlineAt, '2026-12-02T00:00:00.000Z');
  assert.equal(JSON.stringify(data).includes('must not be selected or returned'), false);
});

test('BOAMP search rejects non-JSON, HTTP errors and unbounded payloads', async () => {
  const mission = JSON.stringify({ keywords: 'développement web' });
  await assert.rejects(searchBoampPublicNotices(mission, {
    now: () => NOW,
    fetcher: (async () => new Response('<html>no</html>', { status: 200, headers: { 'content-type': 'text/html' } })) as typeof fetch,
  }), /type de contenu JSON/);
  await assert.rejects(searchBoampPublicNotices(mission, {
    now: () => NOW,
    fetcher: (async () => responseFor({}, { status: 503 })) as typeof fetch,
  }), /statut HTTP 503/);
  await assert.rejects(searchBoampPublicNotices(mission, {
    now: () => NOW,
    fetcher: (async () => responseFor({ total_count: 31, results: Array.from({ length: 31 }, (_, index) => openNotice(index)) })) as typeof fetch,
  }), /dépassé la limite/);
});

test('public result validation binds the result to the Prospector profile and official BOAMP links', () => {
  const result = {
    requestId: 'request-boamp-1',
    agentId: BOAMP_PROSPECTOR_AGENT_ID,
    agentName: BOAMP_PROSPECTOR_AGENT_NAME,
    toolId: BOAMP_PROSPECTOR_TOOL_ID,
    createdAt: NOW.toISOString(),
    durationMs: 20,
    output: 'Avis publics collectés; aucune candidature déposée.',
    resultKind: 'REMOTE_READ_ONLY_RESULT',
    externalActionExecuted: false,
    data: {
      dataKind: 'BOAMP_PUBLIC_TENDER_SEARCH',
      sourceName: 'BOAMP',
      sourceUrl: 'https://www.boamp.fr/explore/dataset/boamp/',
      verificationState: 'SOURCE_FETCHED_ELIGIBILITY_UNVERIFIED',
      apiAccessChargeEur: 0,
      hostingAndBandwidthCostMeasured: false,
      keywords: 'développement web',
      fetchedAt: NOW.toISOString(),
      totalMatchedCount: 1,
      recordsInspected: 1,
      excludedNotOpenOrInvalid: 0,
      omittedInspectedBeyondDisplayLimit: 0,
      opportunities: [{
        noticeId: '26-12345',
        title: 'Développement web',
        publishedAt: '2026-11-01T00:00:00.000Z',
        deadlineAt: '2026-12-02T02:00:00.000Z',
        contractType: 'Services',
        sourceUrl: 'https://www.boamp.fr/pages/avis/?q=idweb%3A26-12345',
      }],
    },
  };
  assert.equal(isAgentPublicOpportunityResult(result), true);
  assert.equal(isAgentPublicOpportunityResult({ ...result, agentId: '38' }), false);
  assert.equal(isAgentPublicOpportunityResult({
    ...result,
    data: { ...result.data, opportunities: [{ ...result.data.opportunities[0], sourceUrl: 'https://attacker.example/' }] },
  }), false);
});
