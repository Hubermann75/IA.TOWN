export const BOAMP_PROSPECTOR_TOOL_ID = 'centmine.prospector-boamp-search.v1';
export const BOAMP_PROSPECTOR_AGENT_ID = '39';
export const BOAMP_PROSPECTOR_AGENT_NAME = 'MINER.PRIME';
export const MAX_BOAMP_DISPLAY_RESULTS = 10;

export interface PublicTenderNotice {
  noticeId: string;
  title: string;
  publishedAt: string | null;
  deadlineAt: string;
  contractType: string | null;
  sourceUrl: string;
}

export interface PublicOpportunitySearchData {
  dataKind: 'BOAMP_PUBLIC_TENDER_SEARCH';
  sourceName: 'BOAMP';
  sourceUrl: 'https://www.boamp.fr/explore/dataset/boamp/';
  verificationState: 'SOURCE_FETCHED_ELIGIBILITY_UNVERIFIED';
  apiAccessChargeEur: 0;
  hostingAndBandwidthCostMeasured: false;
  keywords: string;
  fetchedAt: string;
  totalMatchedCount: number | null;
  recordsInspected: number;
  excludedNotOpenOrInvalid: number;
  omittedInspectedBeyondDisplayLimit: number;
  opportunities: PublicTenderNotice[];
}

export interface AgentPublicOpportunityResult {
  requestId: string;
  agentId: string;
  agentName: string;
  toolId: typeof BOAMP_PROSPECTOR_TOOL_ID;
  createdAt: string;
  durationMs: number;
  output: string;
  resultKind: 'REMOTE_READ_ONLY_RESULT';
  externalActionExecuted: false;
  data: PublicOpportunitySearchData;
}

export function parseProspectorMission(mission: string): { keywords: string } {
  let parsed: unknown;
  try {
    parsed = JSON.parse(mission);
  } catch {
    throw new Error('La mission PROSPECTOR doit être un JSON valide avec le champ keywords.');
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error('La mission PROSPECTOR doit contenir uniquement le champ keywords.');
  }
  const value = parsed as Record<string, unknown>;
  if (Object.keys(value).length !== 1 || typeof value.keywords !== 'string') {
    throw new Error('La mission PROSPECTOR doit contenir uniquement le champ keywords.');
  }
  const keywords = value.keywords.trim().replace(/\s+/g, ' ');
  if (keywords.length < 3 || keywords.length > 100 || !/^[\p{L}\p{N} '\u2019-]+$/u.test(keywords)) {
    throw new Error('Saisissez 3 à 100 caractères de recherche (lettres, chiffres, espaces, apostrophes ou tirets).');
  }
  return { keywords };
}

export function buildBoampNoticeUrl(noticeId: string): string {
  if (!/^[A-Za-z0-9][A-Za-z0-9_-]{0,49}$/.test(noticeId)) {
    throw new Error('Identifiant BOAMP invalide.');
  }
  const url = new URL('https://www.boamp.fr/pages/avis/');
  url.searchParams.set('q', `idweb:${noticeId}`);
  return url.toString();
}

function isIsoTimestamp(value: unknown): value is string {
  if (typeof value !== 'string') return false;
  const isoDate = /^\d{4}-\d{2}-\d{2}$/;
  const isoDateTime = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/;
  return (isoDate.test(value) || isoDateTime.test(value)) && Number.isFinite(Date.parse(value));
}

function isPublicTenderNotice(value: unknown): value is PublicTenderNotice {
  if (!value || typeof value !== 'object') return false;
  const notice = value as Partial<PublicTenderNotice>;
  return typeof notice.noticeId === 'string'
    && /^[A-Za-z0-9][A-Za-z0-9_-]{0,49}$/.test(notice.noticeId)
    && typeof notice.title === 'string' && notice.title.length > 0 && notice.title.length <= 500
    && (notice.publishedAt === null || isIsoTimestamp(notice.publishedAt))
    && isIsoTimestamp(notice.deadlineAt)
    && (notice.contractType === null || (typeof notice.contractType === 'string' && notice.contractType.length <= 100))
    && notice.sourceUrl === buildBoampNoticeUrl(notice.noticeId);
}

export function isPublicOpportunitySearchData(value: unknown): value is PublicOpportunitySearchData {
  if (!value || typeof value !== 'object') return false;
  const data = value as Partial<PublicOpportunitySearchData>;
  let keywordsAreSafe = false;
  if (typeof data.keywords === 'string') {
    try {
      parseProspectorMission(JSON.stringify({ keywords: data.keywords }));
      keywordsAreSafe = true;
    } catch {
      keywordsAreSafe = false;
    }
  }
  return data.dataKind === 'BOAMP_PUBLIC_TENDER_SEARCH'
    && data.sourceName === 'BOAMP'
    && data.sourceUrl === 'https://www.boamp.fr/explore/dataset/boamp/'
    && data.verificationState === 'SOURCE_FETCHED_ELIGIBILITY_UNVERIFIED'
    && data.apiAccessChargeEur === 0
    && data.hostingAndBandwidthCostMeasured === false
    && keywordsAreSafe
    && isIsoTimestamp(data.fetchedAt)
    && (data.totalMatchedCount === null || (Number.isInteger(data.totalMatchedCount) && data.totalMatchedCount! >= 0))
    && Number.isInteger(data.recordsInspected) && data.recordsInspected! >= 0 && data.recordsInspected! <= 30
    && Number.isInteger(data.excludedNotOpenOrInvalid) && data.excludedNotOpenOrInvalid! >= 0 && data.excludedNotOpenOrInvalid! <= data.recordsInspected!
    && Number.isInteger(data.omittedInspectedBeyondDisplayLimit) && data.omittedInspectedBeyondDisplayLimit! >= 0 && data.omittedInspectedBeyondDisplayLimit! <= 30
    && Array.isArray(data.opportunities) && data.opportunities.length <= MAX_BOAMP_DISPLAY_RESULTS
    && data.opportunities.every(isPublicTenderNotice)
    && data.opportunities.length + data.omittedInspectedBeyondDisplayLimit! <= data.recordsInspected! - data.excludedNotOpenOrInvalid!;
}

export function isAgentPublicOpportunityResult(value: unknown): value is AgentPublicOpportunityResult {
  if (!value || typeof value !== 'object') return false;
  const result = value as Partial<AgentPublicOpportunityResult>;
  return typeof result.requestId === 'string' && result.requestId.length > 0 && result.requestId.length <= 100
    && result.agentId === BOAMP_PROSPECTOR_AGENT_ID
    && result.agentName === BOAMP_PROSPECTOR_AGENT_NAME
    && result.toolId === BOAMP_PROSPECTOR_TOOL_ID
    && isIsoTimestamp(result.createdAt)
    && typeof result.durationMs === 'number' && Number.isFinite(result.durationMs) && result.durationMs >= 0
    && typeof result.output === 'string' && result.output.length > 0 && result.output.length <= 12_000
    && result.resultKind === 'REMOTE_READ_ONLY_RESULT'
    && result.externalActionExecuted === false
    && isPublicOpportunitySearchData(result.data);
}
