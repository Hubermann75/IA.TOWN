import { randomUUID } from 'node:crypto';
import {
  BOAMP_PROSPECTOR_AGENT_ID,
  BOAMP_PROSPECTOR_AGENT_NAME,
  BOAMP_PROSPECTOR_TOOL_ID,
  MAX_BOAMP_DISPLAY_RESULTS,
  buildBoampNoticeUrl,
  parseProspectorMission,
  type PublicOpportunitySearchData,
  type PublicTenderNotice,
} from './agentPublicOpportunity';

const BOAMP_RECORDS_ENDPOINT = 'https://www.boamp.fr/api/explore/v2.1/catalog/datasets/boamp/records';
const MAX_API_ROWS = 30;
const MAX_RESPONSE_BYTES = 512_000;
const REQUEST_TIMEOUT_MS = 8_000;

export class BoampProspectorError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'BoampProspectorError';
  }
}

export interface BoampProspectorOptions {
  fetcher?: typeof fetch;
  now?: () => Date;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function normalizeIsoSourceDate(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/;
  const dateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
  if (!dateOnly.test(value) && !dateTime.test(value)) return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  if (dateOnly.test(value) && parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed.toISOString();
}

function cleanText(value: unknown, maxLength: number): string | null {
  if (typeof value !== 'string') return null;
  const cleaned = value.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!cleaned) return null;
  return cleaned.slice(0, maxLength);
}

async function readBoundedJson(response: Response): Promise<unknown> {
  if (!response.body) throw new BoampProspectorError('La source BOAMP a renvoyé un corps vide.');
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESPONSE_BYTES) {
        await reader.cancel();
        throw new BoampProspectorError('La réponse BOAMP dépasse la limite de taille autorisée.');
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const bytes = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes)) as unknown;
  } catch {
    throw new BoampProspectorError('La source BOAMP n’a pas renvoyé un JSON exploitable.');
  }
}

function buildRecordsUrl(keywords: string): URL {
  const url = new URL(BOAMP_RECORDS_ENDPOINT);
  url.search = new URLSearchParams({
    select: 'idweb,objet,dateparution,datelimitereponse,nature,type_marche_facette',
    where: `search(objet, "${keywords}") AND nature = "APPEL_OFFRE"`,
    limit: String(MAX_API_ROWS),
    order_by: 'dateparution desc',
  }).toString();
  return url;
}

function summarize(data: PublicOpportunitySearchData): string {
  const apiCount = data.totalMatchedCount === null ? 'inconnu' : String(data.totalMatchedCount);
  return [
    `Recherche publique BOAMP effectuée pour « ${data.keywords} ».`,
    `Collecte : ${data.fetchedAt}. Le jeu de données correspond à sa dernière mise à jour publiée, pas nécessairement à l’instant de collecte.`,
    `${data.opportunities.length} avis affichés; ${data.recordsInspected} enregistrements examinés sur un total API annoncé de ${apiCount}.`,
    `${data.excludedNotOpenOrInvalid} enregistrements examinés écartés (avis non ouverts, échéance absente/invalide ou titre/identifiant inutilisable).`,
    `${data.omittedInspectedBeyondDisplayLimit} avis ouverts supplémentaires non affichés au-delà de la limite de présentation.`,
    'Accès à l’API annoncé gratuit; les frais d’hébergement et de bande passante côté IA TOWN ne sont pas mesurés.',
    'Un avis public est une piste à examiner, pas une preuve d’éligibilité, de rentabilité, de candidature recevable ou de revenu. Aucun contact, dépôt de candidature, paiement ou engagement n’a été exécuté.',
  ].join('\n');
}

export async function searchBoampPublicNotices(
  mission: string,
  options: BoampProspectorOptions = {},
): Promise<PublicOpportunitySearchData> {
  const { keywords } = parseProspectorMission(mission);
  const fetcher = options.fetcher ?? globalThis.fetch;
  const now = options.now?.() ?? new Date();
  if (!Number.isFinite(now.getTime())) throw new BoampProspectorError('Horloge locale invalide.');
  const fetchedAt = now.toISOString();

  let response: Response;
  try {
    response = await fetcher(buildRecordsUrl(keywords), {
      method: 'GET',
      headers: { Accept: 'application/json', 'User-Agent': 'IA-TOWN-public-read-only-prospector/1.0' },
      redirect: 'error',
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    });
  } catch {
    throw new BoampProspectorError('Connexion BOAMP impossible ou interrompue. Aucune opportunité n’a été confirmée.');
  }
  if (!response.ok) {
    throw new BoampProspectorError(`La source BOAMP a répondu avec le statut HTTP ${response.status}.`);
  }
  if (!response.headers.get('content-type')?.toLowerCase().includes('application/json')) {
    throw new BoampProspectorError('La source BOAMP n’a pas renvoyé le type de contenu JSON attendu.');
  }

  const document = await readBoundedJson(response);
  if (!isPlainObject(document) || !Array.isArray(document.results)) {
    throw new BoampProspectorError('La réponse BOAMP ne contient pas la liste de résultats attendue.');
  }
  if (document.results.length > MAX_API_ROWS) {
    throw new BoampProspectorError('La source BOAMP a dépassé la limite de résultats demandée.');
  }

  const totalMatchedCount = Number.isInteger(document.total_count) && (document.total_count as number) >= 0
    ? document.total_count as number
    : null;
  const opportunities: PublicTenderNotice[] = [];
  let excludedNotOpenOrInvalid = 0;
  let omittedInspectedBeyondDisplayLimit = 0;
  const nowMs = now.getTime();

  for (const row of document.results) {
    if (!isPlainObject(row)) {
      excludedNotOpenOrInvalid += 1;
      continue;
    }
    const noticeId = cleanText(row.idweb, 50);
    const title = cleanText(row.objet, 500);
    const deadlineAt = normalizeIsoSourceDate(row.datelimitereponse);
    if (row.nature !== 'APPEL_OFFRE' || !noticeId || !/^[A-Za-z0-9][A-Za-z0-9_-]{0,49}$/.test(noticeId)
      || !title || !deadlineAt || Date.parse(deadlineAt) <= nowMs) {
      excludedNotOpenOrInvalid += 1;
      continue;
    }

    const notice: PublicTenderNotice = {
      noticeId,
      title,
      publishedAt: normalizeIsoSourceDate(row.dateparution),
      deadlineAt,
      contractType: cleanText(row.type_marche_facette, 100),
      sourceUrl: buildBoampNoticeUrl(noticeId),
    };
    if (opportunities.length < MAX_BOAMP_DISPLAY_RESULTS) opportunities.push(notice);
    else omittedInspectedBeyondDisplayLimit += 1;
  }

  return {
    dataKind: 'BOAMP_PUBLIC_TENDER_SEARCH',
    sourceName: 'BOAMP',
    sourceUrl: 'https://www.boamp.fr/explore/dataset/boamp/',
    verificationState: 'SOURCE_FETCHED_ELIGIBILITY_UNVERIFIED',
    apiAccessChargeEur: 0,
    hostingAndBandwidthCostMeasured: false,
    keywords,
    fetchedAt,
    totalMatchedCount,
    recordsInspected: document.results.length,
    excludedNotOpenOrInvalid,
    omittedInspectedBeyondDisplayLimit,
    opportunities,
  };
}

export async function createBoampProspectorResult(
  mission: string,
  options: BoampProspectorOptions & { requestId?: () => string } = {},
) {
  const startedAt = Date.now();
  const data = await searchBoampPublicNotices(mission, options);
  return {
    requestId: options.requestId?.() ?? randomUUID(),
    agentId: BOAMP_PROSPECTOR_AGENT_ID,
    agentName: BOAMP_PROSPECTOR_AGENT_NAME,
    toolId: BOAMP_PROSPECTOR_TOOL_ID,
    createdAt: data.fetchedAt,
    durationMs: Math.max(0, Date.now() - startedAt),
    output: summarize(data),
    resultKind: 'REMOTE_READ_ONLY_RESULT' as const,
    externalActionExecuted: false as const,
    data,
  };
}
