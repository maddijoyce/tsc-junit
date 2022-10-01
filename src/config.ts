import fs from 'fs';
import { join } from 'path';

export type Config = {
  references: { path: string }[];
};

export async function loadConfig(configFile?: string) {
  if (!configFile) return undefined;

  const location = join(process.cwd(), configFile);
  let parsed;
  try {
    const source = await fs.promises.readFile(location, 'utf-8');
    parsed = JSON.parse(source);
  } catch {
    throw new Error(`Failed to parse config: ${configFile}`);
  }

  const references = [];
  if (typeof parsed === 'object' && Array.isArray(parsed.references)) {
    for (const reference of parsed.references) {
      if (typeof reference === 'object' && typeof reference.path === 'string') {
        references.push(reference);
      }
    }
  }

  return {
    references,
  } as Config;
}
