import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  auditSystemHealth, 
  recordBetaDiagnostic, 
  generateBetaBugReportMarkdown, 
  createBetaReleasePackage,
  BetaDiagnosticRecord
} from './betaAuditor';

test('auditSystemHealth - returns 100% and STABLE when no anomalies exist', () => {
  const health = auditSystemHealth([], 94, 3600);
  assert.equal(health.buildStatus, 'STABLE');
  assert.equal(health.score, 100);
  assert.equal(health.totalAnomaliesLogged, 0);
  assert.equal(health.unresolvedCount, 0);
  assert.equal(health.activeAgentsMonitored, 94);
});

test('auditSystemHealth - penalizes score and marks CRITICAL when critical anomaly occurs', () => {
  const records: BetaDiagnosticRecord[] = [
    {
      id: 'ERR-1',
      timestamp: '2026-11-01T12:00:00Z',
      category: 'NETWORK',
      severity: 'CRITICAL',
      sourceModule: 'CCC.CONNECT',
      message: 'Packet loss exceeds 80%',
      resolved: false
    }
  ];
  const health = auditSystemHealth(records, 94, 3600);
  assert.equal(health.buildStatus, 'CRITICAL');
  assert.equal(health.score, 75);
  assert.equal(health.unresolvedCount, 1);
});

test('recordBetaDiagnostic - appends newest anomaly at index 0', () => {
  let records: BetaDiagnosticRecord[] = [];
  records = recordBetaDiagnostic(records, 'FINANCE', 'MEDIUM', 'COST_GUARD', 'API threshold at 85%');
  assert.equal(records.length, 1);
  assert.equal(records[0].sourceModule, 'COST_GUARD');
  assert.equal(records[0].resolved, false);
});

test('generateBetaBugReportMarkdown - synthesizes clean Markdown with headers', () => {
  const health = auditSystemHealth([], 94, 1800);
  const md = generateBetaBugReportMarkdown(health, []);
  assert.ok(md.includes('# IA TOWN — RAPPORT DE DIAGNOSTIC BETA v1.0'));
  assert.ok(md.includes('Version'));
});

test('createBetaReleasePackage - includes executable name and manifest', () => {
  const pkg = createBetaReleasePackage();
  assert.equal(pkg.desktopExecutableName, 'IA_TOWN_Beta_v1.0_Setup.exe');
  assert.equal(pkg.version, 'v1.0.0-BETA');
  assert.ok(pkg.manifest.files.includes('IA_TOWN_Beta_v1.0_Setup.exe'));
});
