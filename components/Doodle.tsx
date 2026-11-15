import { useIsFocused } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { colors } from "../lib/theme";
import { useReducedMotion } from "../lib/useReducedMotion";

export function Doodle({ size = 150, glance = 0 }: { size?: number; glance?: number }) {
  const focused = useIsFocused();
  const reduced = useReducedMotion();
  const [blink, setBlink] = useState(false);
  const [pointer, setPointer] = useState(0);
  useEffect(() => {
    if (!focused || reduced !== false) return;
    let close: ReturnType<typeof setTimeout>;
    const timer = setInterval(() => {
      setBlink(true);
      close = setTimeout(() => setBlink(false), 130);
    }, 4800);
    return () => { clearInterval(timer); clearTimeout(close); };
  }, [focused, reduced]);
  const dx = focused && reduced === false ? Math.max(-4, Math.min(4, pointer || glance)) : 0;
  return (
    <View accessible={false} pointerEvents="box-only" onPointerMove={(e) => setPointer((e.nativeEvent.offsetX / size - 0.5) * 8)} onPointerLeave={() => setPointer(0)} style={{ width: size, height: size }}>
      <Svg width={size} height={size} viewBox="0 0 200 200">
        <G fill="none" stroke={colors.text} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
          <Path d="M67 104 Q22 72 22 117 Q25 145 39 126 M123 103 Q177 64 178 99 Q179 115 163 108" />
          <Path d="M91 124 Q65 142 65 174 L43 177 M107 126 Q133 151 133 171 L156 176" />
          <Path d="M77 104 Q70 145 104 144 Q133 134 122 104" fill={colors.accent} />
          <Ellipse cx={99} cy={72} rx={42} ry={48} fill={colors.purple} transform="rotate(-10 99 72)" />
          {blink && focused && !reduced ? <Path d="M76 65 L91 65 M107 63 L122 63" /> : <>
            <Ellipse cx={84} cy={64} rx={11} ry={14} fill={colors.white} strokeWidth={3} />
            <Ellipse cx={114} cy={61} rx={11} ry={14} fill={colors.white} strokeWidth={3} />
            <Circle cx={85 + dx} cy={67} r={4} fill={colors.text} stroke="none" />
            <Circle cx={115 + dx} cy={64} r={4} fill={colors.text} stroke="none" />
          </>}
          <Path d="M85 88 Q102 107 117 85 Q103 87 85 88Z" fill={colors.white} strokeWidth={3} />
          <Path d="M14 57 L7 47 M25 44 L23 31 M161 40 L174 28 M171 57 L186 52" strokeWidth={3} />
          <Path d="M75 185 L83 171 L91 185 L100 166 L106 185 L117 175 L122 185" stroke={colors.success} strokeWidth={4} />
        </G>
      </Svg>
    </View>
  );
}
