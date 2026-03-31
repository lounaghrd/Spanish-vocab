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
// Figma: solid filled plus icon
export function IconPlus({ size = 12, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 12 12" fill="none">
      <Path
        d="M4.86111 6.80556H0V4.86111H4.86111V0H6.80556V4.86111H11.6667V6.80556H6.80556V11.6667H4.86111V6.80556Z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Plus Thin (CTA) ────────────────────────────────────────────────────────
// Figma: thinner filled plus for "Add new word" CTA buttons
export function IconPlusThin({ size = 26, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        d="M12.133 13.8664H4.04443V12.133H12.133V4.04443H13.8664V12.133H21.9558V13.8664H13.8664V21.9558H12.133V13.8664Z"
        fill={color}
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

// ─── Arrow Right (long →) ──────────────────────────────────────────────────
// Figma: "Icon/thin/forward arrow" — 22×22, white, used inside the arrow button
export function IconArrowRight({ size = 22, color = '#FFFFFF' }: IconProps) {
  const width = size;
  const height = Math.round(size * (21 / 28));
  return (
    <Svg width={width} height={height} viewBox="0 0 28 21" fill="none">
      <Path
        d="M28 10.4995L17.5322 21L16.1549 19.6185L24.2714 11.4765H0V9.52256H24.2714L16.1549 1.38149L17.5322 0L28 10.4995Z"
        fill={color}
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
        d="M0 10.4995L10.4678 21L11.8451 19.6185L3.7286 11.4765H28V9.52256H3.7286L11.8451 1.38149L10.4678 0L0 10.4995Z"
        fill={color}
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

// ─── Settings (⚙) ───────────────────────────────────────────────────────────
// Figma: "icon=Settings, weight=thin" — filled gear/cog with evenodd cutout
export function IconSettings({ size = 24, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="-2 -2 30 30" fill="none">
      <Path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.28028 21.8314L9.80707 26H16.1929L16.7197 21.8184C17.094 21.6869 17.4594 21.5171 17.8158 21.3091C18.1723 21.1013 18.5218 20.8623 18.8642 20.592L22.7593 22.2368L25.9523 16.7632L22.5494 14.2264C22.6043 13.979 22.6361 13.7592 22.6448 13.5672C22.6538 13.3749 22.6583 13.1859 22.6583 13C22.6583 12.8052 22.6561 12.6118 22.6518 12.4198C22.6472 12.2275 22.6201 12.0209 22.5705 11.7999L26 9.23684L22.8074 3.7895L18.8642 5.408C18.5218 5.13774 18.1825 4.90305 17.8463 4.70395C17.5103 4.50484 17.1348 4.33071 16.7197 4.18155L16.1929 0H9.80707L9.26713 4.16855C8.90164 4.30015 8.52958 4.47428 8.15094 4.69095C7.7723 4.90761 7.41615 5.14663 7.08248 5.408L3.19258 3.7895L0 9.23684L3.37625 11.7606C3.34443 11.9991 3.32183 12.2189 3.30846 12.4198C3.29508 12.6207 3.28839 12.8185 3.28839 13.013C3.28839 13.2167 3.29508 13.4211 3.30846 13.6264C3.32183 13.8317 3.34443 14.036 3.37625 14.2394L0 16.7632L3.19258 22.2368L7.09597 20.6053C7.40289 20.8578 7.75097 21.0947 8.14022 21.3159C8.52969 21.5369 8.90971 21.7087 9.28028 21.8314ZM14.3358 23.9474H11.6164L11.1668 20.2947C10.4432 20.1123 9.7824 19.8509 9.18447 19.5106C8.58676 19.1701 8.02538 18.7332 7.50032 18.2L4.07599 19.6368L2.71387 17.3105L5.68854 15.0738C5.582 14.7404 5.50567 14.4026 5.45956 14.0605C5.41344 13.7184 5.39038 13.3692 5.39038 13.013C5.39038 12.6253 5.41344 12.256 5.45956 11.9053C5.50567 11.5545 5.58638 11.2167 5.70168 10.8919L2.71387 8.68947L4.07599 6.36316L7.51346 7.77879C8.05628 7.24214 8.62666 6.80356 9.22459 6.46305C9.82229 6.12277 10.4741 5.87018 11.1799 5.70529L11.6379 2.05263H14.3836L14.8201 5.71829C15.4817 5.87452 16.1357 6.14033 16.7823 6.51574C17.4287 6.89114 17.9834 7.32356 18.4464 7.813L21.924 6.36316L23.2861 8.68947L20.2585 10.9525C20.3738 11.2983 20.4522 11.6369 20.4937 11.9686C20.5355 12.2999 20.5564 12.6438 20.5564 13C20.5564 13.3474 20.5355 13.6912 20.4937 14.0314C20.4522 14.372 20.3738 14.7194 20.2585 15.0738L23.2598 17.3105L21.8974 19.6368L18.4599 18.2079C17.9171 18.7359 17.3534 19.1679 16.7688 19.5041C16.1845 19.8401 15.5393 20.0993 14.8332 20.2817L14.3358 23.9474ZM15.9546 15.9065C15.1466 16.7057 14.167 17.1053 13.0159 17.1053C11.8505 17.1053 10.8673 16.7057 10.0665 15.9065C9.26563 15.1074 8.86521 14.1385 8.86521 13C8.86521 11.8615 9.26563 10.8926 10.0665 10.0935C10.8673 9.29431 11.8505 8.89474 13.0159 8.89474C14.167 8.89474 15.1466 9.29431 15.9546 10.0935C16.7626 10.8926 17.1666 11.8615 17.1666 13C17.1666 14.1385 16.7626 15.1074 15.9546 15.9065ZM15.2137 13C15.2137 14.2092 14.2226 15.1895 13 15.1895C11.7774 15.1895 10.7863 14.2092 10.7863 13C10.7863 11.7908 11.7774 10.8105 13 10.8105C14.2226 10.8105 15.2137 11.7908 15.2137 13Z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Cycle (↺) ────────────────────────────────────────────────────────────
// Figma: "Add word button=In list" icon — filled cycle/refresh symbol
export function IconCycle({ size = 24, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 26 26" fill="none">
      <Path
        d="M12.9869 20.9554C10.7944 20.9554 8.91005 20.1772 7.3338 18.6208C5.75773 17.0646 4.99678 15.1606 5.05095 12.9087V12.9022L3.60443 14.3487L2.15845 12.8962L6.17491 8.87327L10.1914 12.8962L8.74538 14.3487L7.29886 12.9022V12.8892C7.26275 14.5303 7.8074 15.9102 8.9328 17.0291C10.058 18.148 11.4094 18.7075 12.9869 18.7075C13.3971 18.7075 13.7882 18.6681 14.1602 18.5894C14.5319 18.5107 14.8937 18.3926 15.2454 18.2352L16.8818 19.865C16.3098 20.1971 15.6976 20.4618 15.0452 20.6591C14.3929 20.8566 13.7068 20.9554 12.9869 20.9554ZM19.8314 17.1331L15.8084 13.1164L17.2609 11.6639L18.7074 13.1107V13.1237C18.7436 11.4825 18.1978 10.1025 17.0703 8.98377C15.9429 7.86486 14.5904 7.30541 13.0129 7.30541C12.6207 7.30541 12.2342 7.34477 11.8532 7.42349C11.4724 7.50222 11.1061 7.62021 10.7544 7.77747L9.12455 6.14137C9.69655 5.80933 10.3122 5.54563 10.9714 5.35027C11.6306 5.15509 12.3111 5.0575 13.0129 5.0575C15.2234 5.0575 17.1134 5.8356 18.6828 7.39181C20.252 8.9482 21.0095 10.8523 20.9554 13.1042V13.1107L22.3954 11.6639L23.8479 13.1164L19.8314 17.1331Z"
        fill={color}
      />
    </Svg>
  );
}

// ─── Check (✓) ────────────────────────────────────────────────────────────
// Figma: "Add word button=Learned" icon — filled checkmark
export function IconCheck({ size = 24, color = '#191919' }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 16 16" fill="none">
      <Path
        d="M16 3.82054L6.01165 13.8667L0 7.79072L2.06382 5.71503L6.14414 10.1031L14.0687 2.13328L16 3.82054Z"
        fill={color}
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
