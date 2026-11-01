import 'dotenv/config';

import express from 'express';
import path from 'node:path';
import { createAgentRuntimeRouter } from './agentRuntime';

const app = express();
const port = Number(process.env.PORT || 3000);
const distDirectory = path.resolve(process.cwd(), 'dist');

app.disable('x-powered-by');
app.use('/api/agents', createAgentRuntimeRouter());
app.use('/api', (_request, response) => {
  response.status(404).json({ error: 'Route API inconnue.' });
});
app.use(express.static(distDirectory, { index: false }));
app.get('*', (_request, response) => {
  response.sendFile(path.join(distDirectory, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`IA TOWN server listening on port ${port}`);
});
