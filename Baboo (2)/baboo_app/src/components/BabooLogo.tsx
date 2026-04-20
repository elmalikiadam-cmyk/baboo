import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface Props {
  height?: number;
  color?: string;
}

/**
 * Logo Baboo complet (B + a + b + o + o avec oreilles sur les "oo").
 * À remplacer par l'SVG officiel du client quand dispo.
 */
export function BabooLogo({ height = 28, color = '#0a0a0a' }: Props) {
  const width = (height / 220) * 500;
  return (
    <Svg viewBox="0 0 500 220" width={width} height={height} fill={color}>
      <Path
        d="M20 30 h56 a54 54 0 0 1 40 90 a54 54 0 0 1 -40 90 h-56 z
           M56 66 v38 h20 a19 19 0 0 0 0 -38 z
           M56 140 v38 h20 a19 19 0 0 0 0 -38 z"
        fillRule="evenodd"
      />
      <Circle cx="180" cy="156" r="54" />
      <Circle cx="180" cy="156" r="22" fill="#f2efe8" />
      <Path d="M216 108 h18 v102 h-18 z" />
      <Path d="M252 10 h36 v200 h-36 z" />
      <Circle cx="306" cy="156" r="54" />
      <Circle cx="306" cy="156" r="22" fill="#f2efe8" />
      <Circle cx="380" cy="156" r="54" />
      <Circle cx="380" cy="156" r="22" fill="#f2efe8" />
      <Path d="M343 108 a22 22 0 0 1 30 -18 l-14 30 z" />
      <Circle cx="454" cy="156" r="54" />
      <Circle cx="454" cy="156" r="22" fill="#f2efe8" />
      <Path d="M491 108 a22 22 0 0 0 -30 -18 l14 30 z" />
    </Svg>
  );
}

/** Juste les deux "oo" (app icon / favicon). */
export function BabooMark({ size = 40, color = '#0a0a0a' }: Props & { size?: number }) {
  return (
    <Svg viewBox="0 0 160 100" width={size} height={(size * 100) / 160} fill={color}>
      <Circle cx="44" cy="60" r="36" />
      <Circle cx="44" cy="60" r="14" fill="#f2efe8" />
      <Path d="M20 30 a14 14 0 0 1 18 -10 l-8 18 z" />
      <Circle cx="116" cy="60" r="36" />
      <Circle cx="116" cy="60" r="14" fill="#f2efe8" />
      <Path d="M140 30 a14 14 0 0 0 -18 -10 l8 18 z" />
    </Svg>
  );
}
