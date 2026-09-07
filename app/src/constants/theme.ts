export const invictusTheme = {
  // Neo-brutalist palette: raw, high-contrast, bold
  bg: "#F5F0E8", // raw off-white / aged paper
  surface: "#FFFFFF", // stark white cards
  surfaceHigh: "#E8E2D6", // slight cream tint for elevated
  accent: "#C8FF00", // electric lime — primary action
  accentDark: "#1A1A1A", // near-black used with accent
  ink: "#0D0D0D", // pure ink black for borders + text
  text: "#0D0D0D", // black text on light
  textMuted: "#555555", // dark grey muted
  danger: "#FF2222", // raw red — no softening
  success: "#00CC44", // sharp green
  warning: "#FFCC00", // brutalist yellow
  border: "#0D0D0D", // thick black borders — core brutalist rule
  borderThin: "#CCCCCC", // for subtle dividers only
  fontSizes: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 24,
    xxl: 36,
    counter: 96,
  },
  radius: {
    none: 0,
    sm: 0, // neo-brutalist: sharp corners
    md: 0, // neo-brutalist: sharp corners
    lg: 0,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  combatAccent: "#FF4444", // red accent for combat cards

  // Neo-brutalist offset shadow (simulated with borderBottom/Right)
  shadow: {
    offset: 4,
    offsetLg: 6,
    color: "#0D0D0D",
  },
};

// Phase-specific accent colors for neo-brutalist phase badges
export const PHASE_COLORS: Record<string, { bg: string; text: string }> = {
  warmup: { bg: "#FFCC00", text: "#0D0D0D" }, // yellow
  main: { bg: "#C8FF00", text: "#0D0D0D" }, // lime
  circuit: { bg: "#FF6B00", text: "#FFFFFF" }, // bold orange
  abs: { bg: "#FF2222", text: "#FFFFFF" }, // red
  cooldown: { bg: "#0066FF", text: "#FFFFFF" }, // bold blue
};
