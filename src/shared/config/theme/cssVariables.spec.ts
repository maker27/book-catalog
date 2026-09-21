import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

import { buildTokensCss } from './cssVariables';

const TOKENS_CSS_PATH = resolve(process.cwd(), 'src/app/styles/tokens.css');

describe('buildTokensCss', () => {
  test('tokens.css не разошёлся с tokens.ts', () => {
    expect(readFileSync(TOKENS_CSS_PATH, 'utf8')).toBe(buildTokensCss());
  });

  test('составные имена токенов превращаются в kebab-case', () => {
    expect(buildTokensCss()).toContain('--color-on-surface: #333333;');
    expect(buildTokensCss()).toContain('--font-size-headline-lg: 24px;');
  });

  test('радиусы ссылаются на шкалу скруглений, а не дублируют значения', () => {
    expect(buildTokensCss()).toContain('--radius-card: var(--rounded-sm);');
  });
});
