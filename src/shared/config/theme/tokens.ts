export const COLORS = {
  primary: '#0094ff',
  secondary: '#333333',
  tertiary: '#e5e7eb',
  neutral: '#ffffff',
  surface: '#ffffff',
  surfaceMuted: '#f5f6f7',
  onSurface: '#333333',
  background: '#ffffff',
  accent: '#0094ff',
  border: '#e5e7eb',
  muted: '#6b7280',
  error: '#d92d20',
} as const;

export const SPACING = {
  xs: '2px',
  sm: '10px',
  md: '30px',
  lg: '40px',
  xl: '120px',
} as const;

export const ROUNDED = {
  none: '0px',
  sm: '8px',
  md: '10px',
  lg: '16px',
  xl: '24px',
  full: '9999px',
} as const;

export const RADIUS = {
  button: 'md',
  card: 'sm',
  full: 'full',
} as const satisfies Record<string, keyof typeof ROUNDED>;

export const FONT_FAMILY = '"Geologica", Arial, Helvetica, sans-serif';

export const TYPOGRAPHY = {
  headlineDisplay: { fontSize: '48px', lineHeight: '56px', fontWeight: 400 },
  headlineLg: { fontSize: '24px', lineHeight: '29px', fontWeight: 400 },
  headlineMd: { fontSize: '20px', lineHeight: '24px', fontWeight: 400 },
  bodyLg: { fontSize: '18px', lineHeight: '1.5', fontWeight: 400 },
  bodyMd: { fontSize: '16px', lineHeight: 'normal', fontWeight: 400 },
  bodySm: { fontSize: '14px', lineHeight: '1.4', fontWeight: 400 },
  labelLg: { fontSize: '16px', lineHeight: 'normal', fontWeight: 400 },
  labelMd: { fontSize: '14px', lineHeight: 'normal', fontWeight: 400 },
  labelSm: { fontSize: '12px', lineHeight: '1.2', fontWeight: 400 },
} as const;

export const BUTTON = {
  compactPadding: `${SPACING.sm} 20px`,
  minHeight: '39px',
  minWidth: '242px',
  padding: `12px ${SPACING.md}`,
} as const;

export const CARD = {
  padding: '16px',
} as const;
