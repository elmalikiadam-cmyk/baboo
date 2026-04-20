import React from "react";
import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "@/theme/theme";

interface Props {
  height?: number;
  color?: string;
  holeColor?: string;
}

// Wordmark "Baboo" avec les deux points-oreilles sur les "oo".
// Reproduction géométrique fidèle du logo source (assets/baboo-logo.png du handoff).
export function BabooLogo({
  height = 28,
  color = colors.foreground,
  holeColor = colors.background,
}: Props) {
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
      <Circle cx={450} cy={134} r={12} fill={holeColor} />
      <Path d="M420 98a16 16 0 0 1 22-10l-10 22Z" />
      {/* second o + ear */}
      <Circle cx={524} cy={134} r={36} />
      <Circle cx={524} cy={134} r={12} fill={holeColor} />
      <Path d="M554 98a16 16 0 0 0-22-10l10 22Z" />
    </Svg>
  );
}
