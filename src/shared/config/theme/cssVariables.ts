import { BUTTON, CARD, COLORS, FONT_FAMILY, RADIUS, ROUNDED, SPACING, TYPOGRAPHY } from './tokens';

const GENERATED_HEADER =
  '/* Generated from src/shared/config/theme/tokens.ts by `pnpm generate:tokens`. Do not edit. */';

function toKebabCase(name: string): string {
  return name.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);
}

function buildGroup(prefix: string, values: Record<string, string>): string {
  return Object.entries(values)
    .map(([name, value]) => ({ name: toKebabCase(name), value }))
    .sort((left, right) => left.name.localeCompare(right.name))
    .map(({ name, value }) => `  --${prefix}-${name}: ${value};`)
    .join('\n');
}

function mapTypography(property: 'fontSize' | 'lineHeight'): Record<string, string> {
  return Object.fromEntries(
    Object.entries(TYPOGRAPHY).map(([name, style]) => [name, style[property]]),
  );
}

function mapRadius(): Record<string, string> {
  return Object.fromEntries(
    Object.entries(RADIUS).map(([name, rounded]) => [name, `var(--rounded-${rounded})`]),
  );
}

export function buildTokensCss(): string {
  const groups = [
    buildGroup('color', COLORS),
    `  --font-family-base: ${FONT_FAMILY};`,
    buildGroup('font-size', mapTypography('fontSize')),
    buildGroup('line-height', mapTypography('lineHeight')),
    buildGroup('rounded', ROUNDED),
    buildGroup('radius', mapRadius()),
    buildGroup('spacing', SPACING),
    buildGroup('button', BUTTON),
    buildGroup('card', CARD),
  ];

  return `${GENERATED_HEADER}\n:root {\n${groups.join('\n\n')}\n}\n`;
}
