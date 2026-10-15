import type { MakerStage } from "./maker-geometry";

export const MAKER_PALETTES: Record<MakerStage, { primary: string; secondary: string; shadow: string }> = {
  hero: { primary: "#f14d1e", secondary: "#f14d1e", shadow: "#ad1305" },
  sarpoli: { primary: "#345fe3", secondary: "#253447", shadow: "#0c1741" },
  vela: { primary: "#368c7e", secondary: "#ffbe0b", shadow: "#0c3f38" },
  wardrobe: { primary: "#4b99e8", secondary: "#ffc857", shadow: "#164b8b" },
  work: { primary: "#f14d1e", secondary: "#f14d1e", shadow: "#ad1305" },
  kaizencv: { primary: "#6851cd", secondary: "#6851cd", shadow: "#291568" },
  koebsklar: { primary: "#2857e6", secondary: "#2857e6", shadow: "#0b257b" },
  "shield-family": { primary: "#6654df", secondary: "#fff8e9", shadow: "#29175f" },
  iqra: { primary: "#b68a30", secondary: "#d6b875", shadow: "#624512" },
  about: { primary: "#f14d1e", secondary: "#f14d1e", shadow: "#ad1305" },
  closing: { primary: "#f14d1e", secondary: "#f14d1e", shadow: "#ad1305" },
};
