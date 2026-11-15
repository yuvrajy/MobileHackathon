import Svg, { Circle, Ellipse, G, Path, Rect } from "react-native-svg";
import { getChallengeScene, type ChallengeScene } from "../lib/challengeArt";

const ink = "#20251F";
const purple = "#B9A0F5";
const grass = "#B9EB62";
const yellow = "#FFD76A";
const coral = "#FF997E";
const paper = "#FFF7E8";

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

function Camera({ x, y, scale = 1 }: { x: number; y: number; scale?: number }) {
  return (
    <G transform={`translate(${x} ${y}) scale(${scale})`}>
      <Path d="M-24-15H-11L-6-23H9L14-15H26V17H-24Z" fill={purple} />
      <Circle r={10} fill={paper} />
      <Circle cx={19} cy={-7} r={2} fill={ink} stroke="none" />
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
    case "teamColor":
      return (
        <>
          <Path d="M49 188Q36 139 66 117L91 131Q115 146 112 184M65 158L50 213M83 163L98 210M152 166L142 211M176 165L196 207M157 118Q133 126 116 109Q101 95 95 113M178 119Q206 136 199 178" />
          <Path d="M56 117Q76 109 88 129L92 165L55 166Z" fill={purple} />
          <Path d="M149 120Q163 108 181 122L181 169H146Z" fill={grass} />
          <Head x={72} y={89} tilt={-12} />
          <Head x={165} y={88} tilt={12} />
          <Path
            d="M107 144Q128 126 148 145L143 180Q122 193 105 176Z"
            fill={purple}
          />
          <Camera x={126} y={207} scale={0.6} />
          <Spark x={215} y={66} />
        </>
      );
    case "storeSign":
      return (
        <>
          <Path d="M30 39H222V98H30ZM45 99V203H218V99" fill={yellow} />
          <Path d="M30 81H222M53 39V80M85 39V80M118 39V80M151 39V80M185 39V80" />
          <Path d="M156 70L171 48L185 70M162 62H180" strokeWidth={5} />
          <Path d="M77 135Q100 104 155 62M76 156Q58 175 48 203M83 158Q103 175 105 207" />
          <Path d="M61 123Q80 119 91 137L86 164H58Z" fill={purple} />
          <Head x={66} y={99} tilt={-15} />
          <Path d="M121 119H202V191H121" fill={paper} />
          <Path d="M136 142H185M136 158H172" strokeWidth={4} />
        </>
      );
    case "superhero":
      return (
        <>
          <Path d="M110 106Q64 109 36 165Q77 150 102 175Z" fill={coral} />
          <Path d="M103 109Q128 107 136 132L129 165L93 162Z" fill={purple} />
          <Path d="M130 122Q155 91 164 46L179 42M101 127Q66 115 66 148L89 150M104 162Q103 187 75 213M125 162Q138 186 151 213" />
          <Head x={113} y={80} tilt={-13} />
          <Path
            d="M182 180L188 216H220L226 180ZM202 179V118M202 153Q170 150 172 125Q199 123 202 153M203 138Q227 137 232 111Q210 109 203 138"
            fill={grass}
          />
          <Spark x={46} y={69} />
        </>
      );
    case "shoes":
      return (
        <>
          <Rect x={35} y={33} width={186} height={150} rx={8} fill={paper} />
          <Path d="M35 107H221M45 164H209" />
          <Path d="M54 64V86L92 89L96 101H48V64Z" fill={purple} />
          <Path
            d="M118 68L136 80L160 84L165 101H110V86ZM179 59H204V96H176V82H186V59Z"
            fill={coral}
          />
          <Path d="M128 86L137 84M140 90L149 88" strokeWidth={3} />
          <Head x={87} y={172} tilt={-20} />
          <Path d="M82 197Q67 211 58 222M93 198L112 222M105 194Q137 187 153 153M69 196Q39 188 44 154" />
          <Path d="M149 146L155 153L151 164" />
          <Spark x={187} y={137} />
        </>
      );
    case "tallest":
      return (
        <>
          <Path d="M151 215V39H207V215Z" fill={purple} />
          <Path
            d="M142 39H218M161 61H169M188 61H196M161 85H169M188 85H196M161 109H169M188 109H196M161 134H169M188 134H196M161 159H169M188 159H196"
            strokeWidth={4}
          />
          <Path d="M130 207V45M120 56L130 43L139 56" />
          <Head x={66} y={128} tilt={-25} />
          <Path d="M60 152Q44 173 56 186H83L84 157Z" fill={grass} />
          <Path d="M60 186L44 213M78 186L93 213M82 158Q107 147 110 117M55 157Q29 162 31 181" />
          <Camera x={108} y={111} scale={0.55} />
        </>
      );
    case "menu":
      return (
        <>
          <Path
            d="M104 62Q145 52 181 64L216 185Q174 174 143 191L104 177Z"
            fill={yellow}
          />
          <Path
            d="M143 191L132 78M148 87H176M154 103H187M160 151H193"
            strokeWidth={4}
          />
          <Path d="M163 126Q176 109 188 126Q181 139 169 138Z" fill={coral} />
          <Head x={65} y={93} tilt={14} />
          <Path d="M55 119L85 126L88 173H50Z" fill={purple} />
          <Path d="M84 132Q114 112 158 128M51 132Q25 151 46 166M58 174L43 214M80 174L97 213M56 66Q68 46 82 59Q95 72 78 79M79 89V90" />
          <Spark x={213} y={47} />
        </>
      );
    case "numberSign":
      return (
        <>
          <Path
            d="M124 36L219 44L211 126L118 118ZM165 123L161 214"
            fill={grass}
          />
          <Path
            d="M139 64L146 58V96M166 61Q151 61 155 83Q159 104 171 94Q178 83 172 68Q170 62 166 61ZM188 69L198 62V99"
            strokeWidth={4}
          />
          <Head x={62} y={121} tilt={-12} />
          <Path d="M51 145Q64 139 79 148L85 178H48Z" fill={coral} />
          <Path d="M80 150Q111 151 116 133M52 151Q29 154 39 179M56 179L43 214M77 179L96 214" />
          <Camera x={110} y={132} scale={0.65} />
          <Spark x={47} y={52} />
        </>
      );
    case "album":
      return (
        <>
          <Path d="M35 36L217 39L214 218L36 215Z" fill={yellow} />
          <Circle cx={179} cy={70} r={17} fill={coral} />
          <Path d="M46 176L206 176M52 193H198" strokeWidth={9} />
          <Head x={116} y={86} tilt={18} />
          <Path d="M104 110L131 108L148 146L112 158L92 132Z" fill={purple} />
          <Path d="M101 119Q65 108 64 81M134 119Q155 137 183 114M114 155Q105 173 77 180L63 174M132 151Q151 156 156 185L176 191" />
          <Path d="M59 79L64 70L69 81" strokeWidth={4} />
        </>
      );
    case "slowWalk":
      return (
        <>
          <Path d="M96 109Q58 108 36 133L87 144Z" fill={coral} />
          <Head x={130} y={73} tilt={-11} />
          <Path d="M112 97L139 105L133 156L99 151Z" fill={purple} />
          <Path d="M113 111Q86 127 70 112M137 115Q164 140 186 128M107 153Q98 181 65 199L43 197M130 154Q160 155 161 190L180 209" />
          <Path
            d="M32 68H72M28 84H60M37 158H67M197 65V99M207 65V99"
            strokeWidth={4}
          />
          <Path d="M45 218H208" />
          <Spark x={178} y={53} />
        </>
      );
    case "rainbow":
      return (
        <>
          <Path
            d="M38 119Q38 30 127 30Q216 30 216 119"
            stroke={coral}
            strokeWidth={15}
          />
          <Path
            d="M54 119Q54 47 127 47Q200 47 200 119"
            stroke={yellow}
            strokeWidth={14}
          />
          <Path
            d="M70 119Q70 63 127 63Q184 63 184 119"
            stroke={grass}
            strokeWidth={14}
          />
          <Path
            d="M86 119Q86 80 127 80Q168 80 168 119"
            stroke={purple}
            strokeWidth={14}
          />
          <Path d="M31 132H225M42 133V165H70V133M185 133V165H213V133" />
          <Head x={127} y={143} />
          <Path d="M112 167L143 167L147 195H108Z" fill={grass} />
          <Path d="M110 173Q90 172 85 154M144 173Q165 175 172 152M115 196L103 219M139 196L152 219" />
          <Camera x={128} y={185} scale={0.65} />
        </>
      );
    case "commercial":
      return (
        <>
          <Path d="M147 113H205V179H147ZM158 113V97H192V113" fill={grass} />
          <Path d="M159 138Q175 121 191 139Q181 159 164 153Z" fill={yellow} />
          <Path d="M134 181H219L210 216H142Z" fill={purple} />
          <Head x={70} y={86} tilt={-13} />
          <Path d="M58 111L85 111L94 162H51Z" fill={coral} />
          <Path d="M84 119Q109 132 142 119M56 120Q34 131 38 157M60 162L45 212M81 163L104 210" />
          <Camera x={40} y={160} scale={0.55} />
          <Spark x={170} y={60} />
          <Path d="M202 70L212 60M212 89L227 87" />
        </>
      );
    case "perspective":
      return (
        <>
          <Path d="M41 202L62 82L117 67L148 195Z" fill={coral} />
          <Path d="M62 82L96 99L117 67M96 99L107 199M63 127L89 132" />
          <Head x={190} y={153} tilt={-15} />
          <Path d="M181 176L201 177L205 196H176Z" fill={purple} />
          <Path d="M180 181Q166 166 149 150M178 197L168 215M201 197L213 214" />
          <Camera x={150} y={149} scale={0.5} />
          <Path d="M144 119L159 109M137 99L145 84M31 214H225" strokeWidth={4} />
        </>
      );
    case "humanLetters":
      return (
        <>
          <Head x={56} y={80} tilt={-8} />
          <Path d="M56 107V164M28 115Q56 105 86 115M56 163L38 208M56 164L73 208" />
          <Path d="M44 111H68V152H44Z" fill={purple} />
          <Head x={126} y={91} />
          <Path d="M114 117L98 151L88 202M136 117L154 150L162 202M114 117L126 147L136 117M121 153L111 210M132 153L142 210" />
          <Path d="M114 118L126 143L136 118L139 160H112Z" fill={grass} />
          <Head x={195} y={77} tilt={8} />
          <Path d="M185 104V168L180 209M185 109Q225 94 224 124Q224 142 188 141M185 168L207 207" />
          <Path d="M184 105H198V153H184Z" fill={coral} />
        </>
      );
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
    case "reunion":
      return (
        <>
          <Path d="M31 217H224V155H182V173H138V192H94V210H31Z" fill={purple} />
          <Head x={66} y={124} tilt={-15} />
          <Head x={188} y={77} tilt={18} />
          <Path d="M52 149L80 145L91 181H55Z" fill={grass} />
          <Path d="M173 102L200 101L204 138H171Z" fill={coral} />
          <Path d="M78 150Q110 133 124 104M55 155Q76 129 108 118M59 182L45 207M81 181L101 190M174 109Q147 113 124 104M197 110Q162 130 139 125M177 139L162 166M197 139L215 153" />
          <Path
            d="M116 71Q103 57 112 49Q123 42 128 55Q137 40 147 49Q159 63 116 85Z"
            fill={yellow}
          />
        </>
      );
    case "reflection":
      return (
        <>
          <Path
            d="M115 32Q170 24 220 42L217 212Q160 222 115 205Z"
            fill={purple}
          />
          <Path d="M128 48H207V195H128Z" fill={paper} />
          <Circle cx={183} cy={73} r={13} fill={yellow} />
          <Path
            d="M129 166L153 119L174 150L192 126L207 168V195H128Z"
            fill={grass}
          />
          <Path d="M151 94L169 76M145 112L177 80" strokeWidth={3} />
          <Head x={61} y={112} tilt={12} />
          <Path d="M50 137H76L82 177H43Z" fill={coral} />
          <Path d="M75 144Q95 125 112 130M49 145Q27 167 44 180M51 178L34 213M73 178L89 213" />
          <Camera x={108} y={129} scale={0.55} />
        </>
      );
    case "documentary":
      return (
        <>
          <Path
            d="M156 142L150 182H214L220 142ZM161 142Q155 113 178 115M198 142V122"
            fill={yellow}
          />
          <Path
            d="M151 163H216M170 144L167 180M197 144L194 180"
            strokeWidth={3}
          />
          <Circle cx={162} cy={196} r={7} fill={ink} />
          <Circle cx={203} cy={196} r={7} fill={ink} />
          <Head x={183} y={69} tilt={12} />
          <Path d="M169 94L194 95L202 130H164Z" fill={grass} />
          <Path d="M169 102Q145 117 152 140M193 103Q216 114 208 141" />
          <Head x={67} y={120} tilt={-20} />
          <Path d="M55 145L80 143L89 182H47Z" fill={purple} />
          <Path d="M79 151Q101 126 117 115M50 154Q28 137 36 119M55 182L42 216M78 182L98 216" />
          <Camera x={111} y={115} scale={0.6} />
          <Path d="M30 91L46 95M32 77L52 85" strokeWidth={3} />
        </>
      );
    case "employee":
      return (
        <>
          <Head x={68} y={80} tilt={-8} />
          <Head x={190} y={106} tilt={15} />
          <Path d="M51 106H83L91 163H45Z" fill={grass} />
          <Path d="M56 106L68 124L78 106M63 138H78" strokeWidth={3} />
          <Path d="M176 131H202L211 176H168Z" fill={purple} />
          <Path d="M82 117Q112 137 132 115M52 118Q29 137 43 160M55 165L40 212M79 165L96 211M177 139Q157 155 144 145M181 176L164 212M202 176L218 212" />
          <Path
            d="M113 93L123 74L138 89L156 85L151 116L126 125Z"
            fill={yellow}
          />
          <Camera x={148} y={145} scale={0.5} />
          <Spark x={134} y={48} />
        </>
      );
    case "movie":
      return (
        <>
          <Path
            d="M32 38L124 25L128 51L36 65ZM38 67H128V102H38Z"
            fill={purple}
          />
          <Path
            d="M49 37L66 59M78 33L94 54M105 29L122 50"
            stroke={paper}
            strokeWidth={9}
          />
          <Head x={111} y={131} tilt={-18} />
          <Path d="M99 155L126 151L145 181L106 188Z" fill={coral} />
          <Path d="M100 163Q63 159 54 126M125 159Q159 143 173 110M110 188L89 215M137 182L168 209" />
          <Path d="M172 110L181 65L191 68L186 115Z" fill={yellow} />
          <Path d="M164 110L198 118" />
          <Path d="M196 164L223 158V203H190Z" fill={grass} />
          <Spark x={210} y={46} />
        </>
      );
    case "installation":
      return (
        <>
          <Path
            d="M93 180L128 110L164 180ZM110 145L145 143M128 110L154 82L183 178M153 84L170 85L182 124L162 119ZM91 180H192V196H91Z"
            fill={paper}
          />
          <Path d="M102 164L134 177L160 151L183 177" stroke={purple} />
          <Head x={55} y={101} tilt={20} />
          <Path d="M44 125H72L85 164L50 176Z" fill={coral} />
          <Path d="M72 135Q100 127 117 145M49 137Q27 156 44 176M54 174L38 210M74 169L95 211" />
          <Path
            d="M198 165L206 212H228L235 165ZM202 155H230M211 154V146H222V155"
            fill={grass}
          />
          <Spark x={185} y={49} />
        </>
      );
    case "rhymes":
      return (
        <>
          <Path
            d="M28 39H207Q227 39 227 60V106Q227 120 207 120H121L98 140V120H28Z"
            fill={yellow}
          />
          <G strokeWidth={3}>
            <Path
              d="M42 70L41 57L51 63L61 57L64 71Q67 87 54 89Q39 88 42 70Z"
              fill={purple}
            />
            <Path d="M47 73V75M58 73V75M37 80L46 79M61 80L70 78" />
            <Path d="M78 82H105M81 81L83 60H99L102 82" fill={purple} />
            <Path
              d="M113 89L122 76Q119 69 131 55Q138 49 143 56Q147 62 130 79L118 93Z"
              fill={purple}
            />
            <Path
              d="M150 61L173 65L176 89L150 84ZM156 65L159 82M165 67L168 84"
              fill={purple}
            />
            <Path
              d="M188 79Q183 68 193 67Q198 56 204 64Q217 70 213 80L217 87L197 88Q186 91 183 101Q178 107 176 98"
              fill={purple}
            />
            <Circle cx={205} cy={77} r={1.5} fill={ink} stroke="none" />
          </G>
          <Head x={89} y={164} tilt={-12} />
          <Path d="M76 189H102L108 213H68Z" fill={grass} />
          <Path d="M73 196Q40 187 45 150M103 196Q135 180 151 166" />
          <Path d="M149 155L161 160L151 175Z" fill={coral} />
          <Path
            d="M171 145Q189 152 176 167M186 138Q212 153 193 175"
            strokeWidth={3}
          />
        </>
      );
    case "cooking":
      return (
        <>
          <Head x={130} y={100} />
          <Path
            d="M109 78L105 59Q85 48 98 33Q108 23 121 33Q137 17 149 33Q172 29 174 47Q175 60 153 61L151 79Z"
            fill={paper}
          />
          <Path d="M113 126H147L158 187H101Z" fill={grass} />
          <Path d="M113 128L120 148H142L147 128M120 161H142" />
          <Path d="M111 137Q79 137 62 105M146 137Q181 143 194 111" />
          <Path
            d="M51 111L66 101L55 77L43 84ZM190 113L197 77M188 77L201 78"
            fill={yellow}
          />
          <Path d="M32 187H224V213H32Z" fill={purple} />
          <Path
            d="M68 187Q75 167 95 170Q114 169 119 187M163 187V172H195V187"
            fill={paper}
          />
          <Spark x={208} y={48} />
        </>
      );
    case "floating":
      return (
        <>
          <Ellipse
            cx={126}
            cy={212}
            rx={73}
            ry={8}
            fill={purple}
            stroke="none"
          />
          <Head x={98} y={62} tilt={-20} />
          <Path d="M88 87L115 88L130 122L95 132Z" fill={grass} />
          <Path d="M90 98Q50 123 38 88M113 98Q151 91 164 62M101 131Q82 151 61 146L46 153M124 126Q151 125 152 151L174 157" />
          <Head x={183} y={124} tilt={20} />
          <Path d="M171 148L197 148L203 171L171 178Z" fill={coral} />
          <Path d="M174 156Q151 166 145 150M198 155Q222 139 224 122M179 178L160 191M199 173L219 185" />
          <Path
            d="M62 177L57 188M112 170V186M207 199L211 210"
            strokeWidth={3}
          />
          <Spark x={49} y={50} />
        </>
      );
    case "musicVideo":
      return (
        <>
          <Head x={121} y={79} tilt={17} />
          <Path d="M107 103L135 102L147 147L109 159L95 130Z" fill={purple} />
          <Path d="M105 114Q76 120 64 93M133 114Q165 127 173 95M114 159Q91 176 73 204L53 205M137 152Q164 159 155 183L174 204" />
          <Path d="M58 86L70 77L82 98L70 106Z" fill={coral} />
          <Path
            d="M38 47V77Q22 82 25 70Q27 64 38 66M38 47L59 41V65Q44 71 46 61Q49 56 59 57M190 48V77Q174 84 176 72Q179 65 190 67M190 48L210 55"
            strokeWidth={4}
          />
          <Camera x={206} y={174} scale={0.65} />
          <Path d="M206 187L191 217M206 187L221 217" />
          <Spark x={210} y={110} />
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
