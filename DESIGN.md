# TouchGrass visual system

The UI follows the supplied TouchGrass style handoff and sketches: warm paper, dark ink outlines, flat grass/purple/yellow/coral accents, an asymmetric Create blob and Join splat, and an oval-headed doodle family. Gameplay, backend policy, private proof, results, bloopers and retention are unchanged.

## Fonts and spacing

All app text passes through `components/Typography.tsx`. Fredoka Bold is used for display text, Nunito SemiBold/ExtraBold for reading and supporting labels. Both are bundled locally via `@expo-google-fonts` and licensed under SIL OFL 1.1 (license files ship in their packages). Input text and navigation headers explicitly use the same families. If bundled font loading fails, the OS fallback keeps the app usable.

Sizes, colors, spacing and motion live in `lib/theme.ts`. Secondary text starts at 16 logical pixels, body at 18, and controls at 20. Text can scale and wrap. Forms scroll and avoid the keyboard; a focused field has an explicit treatment. Media screens keep decoration minimal.

## Original native interactions

These references informed the behavior, but no component source was copied:

- [Cartoon Button](https://21st.dev/@oldkong88/components/cartoon-button), listed MIT. Full component source requires an account/API key.
- [Motion Confetti](https://21st.dev/@motiondotdev/components/motion-confetti), listed MIT, browser dependency `motion`. Full source requires an account.
- [Eye Tracking](https://21st.dev/@harshjadhavconnect/components/eye-tracking), listed **no-license**, browser dependency `framer-motion`. Its source is not reused.

`Button`, `Doodle` and `Celebration` are original React Native implementations using SVG and core Animated instead of DOM/CSS or browser animation dependencies. Buttons depress 3 pixels and spring back. The mascot blinks only on a focused screen and glances toward the active name field; web pointer movement stays within a small range. Reduced motion disables glances, blinks and confetti. Confirmed completion/results already have static success states.

Celebrations are keyed by team and event, claimed in memory and persisted on the device, so rerenders and reconnects don't replay them. Decorative confetti cannot intercept taps.

## Challenge illustrations

`lib/challengeArt.ts` inventories every current challenge by the stable content key and exact description. `components/ChallengeIllustration.tsx` has 24 distinct SVG scenes. A neutral fallback handles future text; when adding a challenge, add its intentional scene and map entry. `tests/challengeArt.test.ts` checks catalog coverage and stable-key consistency.

The illustrations are decorative beside full challenge text. The source text files remain authoritative and are still editable independently; illustration mappings don't change challenges or gameplay.
