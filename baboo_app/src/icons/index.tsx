import React from "react";
import Svg, { Circle, Path } from "react-native-svg";

type IconProps = {
  size?: number;
  color?: string;
};

const defaults = (p: IconProps) => ({
  width: p.size ?? 20,
  height: p.size ?? 20,
  stroke: p.color ?? "#0a0a0a",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  fill: "none",
});

export const SearchIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Circle cx={11} cy={11} r={7} />
    <Path d="M20 20l-3.5-3.5" />
  </Svg>
);

export const BellIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Path d="M6 8a6 6 0 0112 0c0 7 3 9 3 9H3s3-2 3-9z" />
    <Path d="M10 21a2 2 0 004 0" />
  </Svg>
);

export const UserIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Circle cx={12} cy={8} r={4} />
    <Path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
  </Svg>
);

export const HeartIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Path d="M12 21s-8-4.5-8-11a5 5 0 018-4 5 5 0 018 4c0 6.5-8 11-8 11z" />
  </Svg>
);

export const PlusIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...{ ...defaults(p), strokeWidth: 1.8 }}>
    <Path d="M12 5v14M5 12h14" />
  </Svg>
);

export const HomeIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Path d="M3 11l9-7 9 7v10H3z" />
    <Path d="M9 21v-7h6v7" />
  </Svg>
);

export const CloseIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Path d="M5 12l5 5 10-10" />
  </Svg>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Svg viewBox="0 0 24 24" {...defaults(p)}>
    <Path d="M5 12h14" />
    <Path d="M13 6l6 6-6 6" />
  </Svg>
);

// BabooLogo vit maintenant dans src/components/BabooLogo.tsx.
// Re-export pour compatibilité avec l'ancien chemin.
export { BabooLogo } from "@/components/BabooLogo";
