import { useWindowDimensions } from "react-native";
import Svg, { Text as SvgText } from "react-native-svg";

const FONT = "SpaceGrotesk_700Bold";
const PAD_X = 24; // aligns with the screen's px-6 edge

/**
 * The PAL / CORO wordmark — "PAL" filled, "CORO" outlined. RN has no text-stroke,
 * so the outline is real SVG stroke. Sized to the viewport like the web hero.
 */
export function Wordmark() {
  const { width } = useWindowDimensions();
  const fontSize = Math.min(width * 0.28, 150);
  const lineH = fontSize * 0.82;
  const baseY1 = fontSize * 0.76;
  const baseY2 = baseY1 + lineH;
  const height = baseY2 + fontSize * 0.18;

  return (
    <Svg width={width} height={height}>
      <SvgText
        x={PAD_X}
        y={baseY1}
        fill="#ffffff"
        fontSize={fontSize}
        fontFamily={FONT}
        fontWeight="700"
      >
        PAL
      </SvgText>
      <SvgText
        x={PAD_X}
        y={baseY2}
        fill="#ffffff"
        fontSize={fontSize}
        fontFamily={FONT}
        fontWeight="700"
      >
        CORO
      </SvgText>
    </Svg>
  );
}
