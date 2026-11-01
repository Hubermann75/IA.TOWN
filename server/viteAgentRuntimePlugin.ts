import type { Plugin } from 'vite';
import type { NextHandleFunction } from 'connect';
import { createAgentRuntimeRouter } from './agentRuntime.ts';

export default function viteAgentRuntimePlugin(): Plugin {
  return {
    name: 'ia-town-agent-runtime',
    configureServer(server) {
      const router = createAgentRuntimeRouter();
      // Express Router is a Connect middleware at runtime; their request types differ.
      server.middlewares.use('/api/agents', router as unknown as NextHandleFunction);
    },
  };
}
