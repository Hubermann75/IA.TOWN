import type { Plugin } from 'vite';
import { createAgentRuntimeRouter } from './agentRuntime';

export default function viteAgentRuntimePlugin(): Plugin {
  return {
    name: 'ia-town-agent-runtime',
    configureServer(server) {
      server.middlewares.use('/api/agents', createAgentRuntimeRouter());
    },
  };
}
