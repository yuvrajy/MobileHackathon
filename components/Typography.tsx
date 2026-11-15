import { StyleSheet, Text as NativeText, type TextProps } from "react-native";
import { colors, font, typefaces } from "../lib/theme";

export function Text({ style, ...props }: TextProps) {
  const resolved = StyleSheet.flatten(style) ?? {};
  const size = typeof resolved.fontSize === "number" ? resolved.fontSize : font.body;
  const heading = size >= 24;
  const bold = Number(resolved.fontWeight) >= 700 || resolved.fontWeight === "bold";
  return <NativeText {...props} style={[
    { color: colors.text, fontSize: size, lineHeight: Math.ceil(size * 1.3), fontFamily: heading ? typefaces.display : bold ? typefaces.strong : typefaces.body, flexShrink: 1 },
    style,
    { fontWeight: "normal" },
  ]} />;
}
