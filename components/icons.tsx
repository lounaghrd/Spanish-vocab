import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';

interface IconProps {
  size?: number;
  color?: string;
}

const SW = 1.5; // stroke width — matches Figma "thin" weight
const LC = 'round' as const;
const LJ = 'round' as const;

// ─── Plus (+) ──────────────────────────────────────────────────────────────
// Figma: "icon=plus, weight=thin" — two perpendicular lines
export function IconPlus({ size = 24, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M12 5V19M5 12H19"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap={LC}
      />
    </Svg>
  );
}

// ─── Close (×) ─────────────────────────────────────────────────────────────
// Figma: "icon=close, weight=thin" — a plus (+) rotated 45° = two diagonal lines
export function IconClose({ size = 24, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M5.5 5.5L18.5 18.5M18.5 5.5L5.5 18.5"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap={LC}
      />
    </Svg>
  );
}

// ─── Arrow Left (long ←) ───────────────────────────────────────────────────
// Figma: "icon=back arrow - long, weight=thin" — 28×21 wide-format arrow
// A right-facing arrow (→) rotated 180°, rendered as a left-facing arrow (←)
export function IconArrowLeft({ size = 24, color = '#191919' }: IconProps) {
  const width = size;
  const height = Math.round(size * (21 / 28)); // maintain Figma's 28:21 aspect ratio
  return (
    <Svg width={width} height={height} viewBox="0 0 28 21" fill="none">
      <Path
        d="M27 10.5H1.5M8 4L1.5 10.5L8 17"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
      />
    </Svg>
  );
}

// ─── Log Out ([→]) ─────────────────────────────────────────────────────────
// Figma: "icon=log out, weight=thin" — 3-wall bracket on left + right-pointing arrow
export function IconLogOut({ size = 24, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Bracket [ — top, left, bottom walls */}
      <Path
        d="M11 4.5L4.5 4.5L4.5 19.5L11 19.5"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
      />
      {/* Arrow → — shaft + arrowhead */}
      <Path
        d="M8.5 12H20M17 8.5L20 12L17 15.5"
        stroke={color}
        strokeWidth={SW}
        strokeLinecap={LC}
        strokeLinejoin={LJ}
      />
    </Svg>
  );
}

// ─── Magnifier (Q) ─────────────────────────────────────────────────────────
// Figma: "icon=magnifier, weight=thin" — circle lens + diagonal handle
export function IconMagnifier({ size = 24, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx={10.5} cy={10.5} r={7} stroke={color} strokeWidth={SW} />
      <Line
        x1={15.5}
        y1={15.5}
        x2={20.5}
        y2={20.5}
        stroke={color}
        strokeWidth={SW}
        strokeLinecap={LC}
      />
    </Svg>
  );
}
