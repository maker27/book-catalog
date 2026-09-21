import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import { buildTokensCss } from '../src/shared/config/theme/cssVariables.ts';

const TOKENS_CSS_PATH = fileURLToPath(new URL('../src/app/styles/tokens.css', import.meta.url));

writeFileSync(TOKENS_CSS_PATH, buildTokensCss());
