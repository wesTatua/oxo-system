// ── OXO THEME — Holográfica Obsidiana ─────────────────────────

export const Colors = {
  bg:        '#000008',
  bgPanel:   'rgba(0,8,18,0.88)',
  teal:      '#00d4c0',
  tealHi:    '#a0fff0',
  tealDim:   '#007060',
  tealFog:   'rgba(0,180,160,0.15)',
  border:    'rgba(0,200,180,0.55)',
  lime:      '#a0ff80',
  amber:     '#ffaa00',
  red:       '#ff4040',
  white:     '#ffffff',
  gray:      'rgba(200,255,250,0.5)',
  scan:      'rgba(0,220,200,0.03)',
} as const;

export const Fonts = {
  heading: 'Orbitron',
  mono:    'SpaceMono',
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const Radius = {
  none: 0,
  sm: 2,
  md: 4,
} as const;

// Clip-path não existe em RN — simulamos com bordas angulares via View + borders
export const panelStyle = {
  backgroundColor: Colors.bgPanel,
  borderWidth: 1,
  borderColor: Colors.border,
  borderTopRightRadius: 0,
  padding: Spacing.md,
  marginBottom: Spacing.sm,
} as const;
