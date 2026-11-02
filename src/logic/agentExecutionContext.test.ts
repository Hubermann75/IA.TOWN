import assert from 'node:assert/strict';
import test from 'node:test';
import { AGENT_REGISTRY } from '../data/agentRegistry';
import { INITIAL_BUILDINGS } from '../data/seedData';
import { buildLocalAgentExecutionContext } from './agentExecutionContext';
import { createAgentTask } from './agentTaskEngine';

test('CEO snapshot uses the real local catalog and queue summaries without copying mission payloads', () => {
  const agent = AGENT_REGISTRY.find(candidate => candidate.id === '71')!;
  const task = createAgentTask(agent, 'PRIVATE_INPUT_SHOULD_NOT_ENTER_THE_EXECUTIVE_SNAPSHOT', {
    id: 'context-task', now: '2026-11-02T12:00:00.000Z',
  });
  const context = buildLocalAgentExecutionContext([task]);

  assert.equal(context.source, 'LOCAL_AGENT_REGISTRY_AND_BROWSER_TASK_QUEUE');
  assert.equal(context.agents.length, AGENT_REGISTRY.length);
  assert.equal(context.agents.length, 94);
  assert.equal(context.buildings.length, INITIAL_BUILDINGS.length);
  assert.equal(context.buildings.length, 16);
  assert.equal(context.agents.find(candidate => candidate.id === '71')?.visualState, 'QUEUED');
  assert.deepEqual(context.tasks, [{
    id: 'context-task', agentId: '71', agentName: agent.name, status: 'QUEUED', updatedAt: '2026-11-02T12:00:00.000Z',
  }]);
  assert.equal(JSON.stringify(context).includes('PRIVATE_INPUT_SHOULD_NOT_ENTER'), false);
});
