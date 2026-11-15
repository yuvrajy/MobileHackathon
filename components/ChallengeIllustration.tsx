import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { getChallengeScene, type ChallengeScene } from "../lib/challengeArt";

const ink = "#20251F";
const purple = "#B9A0F5";
const grass = "#B9EB62";
const yellow = "#FFD76A";
const coral = "#FF997E";
const paper = "#FFF7E8";
const water = "#9FD8F5";

function Head({ x, y, tilt = 0 }: { x: number; y: number; tilt?: number }) {
  return (
    <G transform={`translate(${x} ${y}) rotate(${tilt})`}>
      <Path
        d="M-21 1C-24-14-12-25 2-24C20-24 26-9 22 6C19 22 7 28-6 23C-17 19-21 12-21 1Z"
        fill={paper}
      />
      <Ellipse cx={-7} cy={-3} rx={3} ry={5} fill={ink} stroke="none" />
      <Ellipse cx={8} cy={-5} rx={3} ry={5} fill={ink} stroke="none" />
      <Path
        d="M-6 10Q1 5 8 10Q7 20 0 19Q-6 18-6 10Z"
        fill={coral}
        strokeWidth={3}
      />
    </G>
  );
}

function Spark({ x, y }: { x: number; y: number }) {
  return (
    <Path
      d={`M${x} ${y - 10}Q${x + 1} ${y - 1} ${x + 10} ${y}Q${x + 1} ${y + 1} ${x} ${y + 10}Q${x - 1} ${y + 1} ${x - 10} ${y}Q${x - 1} ${y - 1} ${x} ${y - 10}Z`}
      fill={yellow}
      strokeWidth={3}
    />
  );
}

function Scene({ scene }: { scene: ChallengeScene | "fallback" }) {
  switch (scene) {
    case "mannequin":
      return (
        <>
          <Path d="M148 212H223M184 174V212" />
          <Ellipse cx={185} cy={66} rx={19} ry={24} fill={yellow} />
          <Path d="M173 91H199L204 141H167Z" fill={yellow} />
          <Path d="M176 142L159 175M194 141L215 175M172 101Q142 117 145 87M199 101Q227 116 222 142" />
          <Head x={68} y={97} tilt={6} />
          <Path d="M55 122H82L88 169H49Z" fill={purple} />
          <Path d="M57 169L39 204M78 169L98 204M55 130Q25 145 28 113M82 130Q111 144 106 170" />
          <Path d="M113 63H137M130 55L139 63L130 71" strokeWidth={3} />
        </>
      );
    case "baristaSelfie":
      return (
        <>
          <Path d="M30 170H226V214H30Z" fill={purple} />
          <Head x={168} y={86} tilt={10} />
          <Path d="M154 111H184L190 170H146Z" fill={grass} />
          <Path d="M161 122H177M150 126Q134 140 140 160M184 126Q200 138 196 152" strokeWidth={3} />
          <Path d="M194 146H216L212 170H198Z" fill={paper} />
          <Path d="M200 138Q196 130 202 124M209 138Q205 130 211 124" strokeWidth={3} />
          <Head x={72} y={100} tilt={-10} />
          <Path d="M58 125H86L93 170H52Z" fill={coral} />
          <Path d="M85 134Q110 120 117 92M59 134Q38 150 46 168" />
          <Path d="M104 50H132V94H104Z" fill={yellow} />
          <Path d="M112 57H124" strokeWidth={3} />
          <Spark x={214} y={50} />
        </>
      );
    case "petDog":
      return (
        <>
          <Path d="M70 150Q72 122 110 122H170Q196 124 194 152Q190 176 160 176H100Q70 176 70 150Z" fill={yellow} />
          <Path d="M92 174V206M118 176V206M150 176V206M176 172V204M72 142Q48 128 54 104" />
          <Path d="M168 98Q170 72 196 72Q222 74 222 100Q220 124 196 126Q170 124 168 98Z" fill={yellow} />
          <Path d="M178 80Q160 86 164 114Q178 108 182 94Z" fill={coral} />
          <Circle cx={204} cy={94} r={3.5} fill={ink} stroke="none" />
          <Circle cx={219} cy={104} r={4.5} fill={ink} stroke="none" />
          <Path d="M204 113Q211 119 218 113" strokeWidth={3} />
          <Path d="M150 24Q168 44 184 62" />
          <Path d="M178 70Q178 56 194 56Q210 58 208 70Q196 76 178 70Z" fill={paper} />
          <Path d="M118 86Q98 72 106 62Q114 56 118 66Q122 56 130 62Q138 72 118 86Z" fill={coral} strokeWidth={3} />
          <Spark x={56} y={58} />
        </>
      );
    case "seaLion":
      return (
        <>
          <Path d="M26 208H230" />
          <Path d="M82 168Q122 150 168 166L172 198Q124 208 84 200Z" fill={purple} />
          <Head x={64} y={158} tilt={-28} />
          <Path d="M168 176Q206 162 208 120M160 184Q198 152 192 108" />
          <Path d="M208 120L220 114M192 108L200 96" />
          <Path d="M96 172Q138 118 198 114" />
          <Path d="M104 220L100 230M144 220V232M184 218L188 228" strokeWidth={3} />
          <Path d="M140 66Q156 52 172 66Q156 80 140 66ZM172 66L184 58M172 66L184 74" fill={grass} strokeWidth={4} />
          <Spark x={212} y={52} />
        </>
      );
    case "bottleFlip":
      return (
        <>
          <Path d="M40 196H216M58 196V222M198 196V222" />
          <Path d="M150 194V140Q150 128 160 124V112H174V124Q184 128 184 140V194Z" fill={grass} />
          <Path d="M157 102H177V112H157Z" fill={coral} />
          <Path d="M150 152H184V170H150Z" fill={purple} />
          <Path d="M64 160Q66 54 150 74" strokeDasharray="10 12" />
          <G transform="translate(84 104) rotate(-60)">
            <Path d="M-14 30V-6Q-14-14-7-17V-28H7V-17Q14-14 14-6V30Z" fill={grass} />
            <Path d="M-9-28H9V-36H-9Z" fill={coral} />
          </G>
          <Path d="M146 202L138 212M188 202L196 212M150 90L142 80M188 90L196 80" strokeWidth={3} />
          <Spark x={214} y={56} />
        </>
      );
    case "waterSplash":
      return (
        <>
          <Head x={94} y={122} tilt={-10} />
          <Path d="M78 148H110L118 202H70Z" fill={purple} />
          <Path d="M78 158Q56 172 60 198M110 158Q132 170 130 198" />
          <Path d="M196 62L224 80L206 110L182 94Z" fill={yellow} />
          <Path d="M224 80Q238 94 240 124" />
          <Path d="M184 94Q160 96 140 112Q126 122 116 112Q132 104 124 94Q148 98 170 80Z" fill={water} />
          <Path d="M66 84Q72 72 77 84Q77 92 71 92Q66 92 66 84ZM150 140Q156 128 161 140Q161 148 155 148Q150 148 150 140ZM112 60Q118 48 123 60Q123 68 117 68Q112 68 112 60Z" fill={water} strokeWidth={3} />
          <Spark x={46} y={52} />
        </>
      );
    case "fallback":
      return (
        <>
          <Path
            d="M44 211Q30 192 41 179M44 211Q49 188 61 188M185 214Q175 191 182 181M185 214Q196 194 209 197"
            stroke={grass}
          />
          <Head x={123} y={78} tilt={-8} />
          <Path d="M109 103L139 104L148 160H100Z" fill={purple} />
          <Path d="M108 114Q71 119 58 96M139 115Q177 120 196 92M109 161Q102 189 83 213M137 161Q143 189 162 211" />
          <Spark x={187} y={55} />
        </>
      );
  }
}

export function ChallengeIllustration({
  description,
  size = 112,
}: {
  description: string;
  size?: number;
}) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 256 256"
      aria-hidden={true}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <G
        fill="none"
        stroke={ink}
        strokeWidth={5}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <Scene scene={getChallengeScene(description)} />
      </G>
    </Svg>
  );
}
