import { readFileSync } from 'fs';
import { join } from 'path';
import * as process from 'node:process';

export default () => {
  const packageJson = readFileSync(
    join(process.cwd(), 'package.json'),
    'utf-8',
  );

  const parsed = JSON.parse(packageJson) as Record<string, unknown>;

  return {
    version: parsed.version,
  };
};
