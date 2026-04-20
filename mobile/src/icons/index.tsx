import React from "react";
import Svg, {
  Circle,
  Path,
  Rect,
  G,
  Text as SvgText,
} from "react-native-svg";

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

// ---- Baboo logo — wordmark géométrique avec oreilles de panda sur les "oo"
// Reproduction fidèle au fichier assets/baboo-logo.png du handoff.

export const BabooLogo = ({
  height = 28,
  color = "#0a0a0a",
}: {
  height?: number;
  color?: string;
}) => {
  const ratio = 560 / 180;
  const width = height * ratio;
  return (
    <Svg width={width} height={height} viewBox="0 0 560 180" fill={color}>
      {/* B */}
      <Path
        fillRule="evenodd"
        d="M22 20h66c29 0 52 20 52 46 0 14-7 26-18 34 13 8 22 22 22 38 0 28-24 50-54 50H22V20Zm32 30v42h34c12 0 21-9 21-21 0-12-9-21-21-21H54Zm0 70v42h36c13 0 23-10 23-21s-10-21-23-21H54Z"
      />
      {/* a */}
      <Path
        fillRule="evenodd"
        d="M228 80c-26 0-46 20-46 54s20 54 46 54c13 0 24-5 31-13v10h30V83h-30v10c-7-8-18-13-31-13Zm6 28c14 0 25 11 25 26s-11 26-25 26-25-11-25-26 11-26 25-26Z"
      />
      {/* b */}
      <Path
        fillRule="evenodd"
        d="M313 10h30v80c7-6 17-10 28-10 26 0 46 22 46 54s-20 54-46 54c-12 0-22-4-29-11v8h-29V10Zm52 98c-14 0-25 11-25 26s11 26 25 26 25-11 25-26-11-26-25-26Z"
      />
      {/* first o + ear */}
      <Circle cx={450} cy={134} r={36} />
      <Circle cx={450} cy={134} r={12} fill="#f2efe8" />
      <Path d="M420 98a16 16 0 0 1 22-10l-10 22Z" />
      {/* second o + ear */}
      <Circle cx={524} cy={134} r={36} />
      <Circle cx={524} cy={134} r={12} fill="#f2efe8" />
      <Path d="M554 98a16 16 0 0 0-22-10l10 22Z" />
    </Svg>
  );
};
