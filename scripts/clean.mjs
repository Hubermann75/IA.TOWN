import { rm } from 'node:fs/promises';

for (const target of ['dist', 'server-dist']) {
  await rm(target, { recursive: true, force: true });
}
