# touch grass (demo branch)

> The `demo` branch runs 20-minute games against its own Convex deployment (`.env.local` in this checkout). Each challenge file has two lines: the first goes to the host's team, the second to the joining team, and new rooms start with the first punishment selected. Challenge icons live in `assets/challenges/` and are mapped by content key in `lib/challengeIcons.ts`.

A two-hour, real-world team game for friend groups. Teams join a room by code, each get one easy, one medium and one hard challenge, capture photo or video proof in the app, and reunite for the results, an optional punishment for last place, and a private gallery that is deleted 30 minutes after the deadline.

Expo (SDK 58) + React Native + TypeScript with Expo Router, and Convex for the database, realtime queries, scheduled lifecycle functions and file storage. See [ARCHITECTURE.md](ARCHITECTURE.md) for the product rules.

## Setup

```sh
npm install
npx convex dev          # first run: log in and create a project; writes .env.local and keeps functions in sync
npm run content         # in another terminal: pushes content/*.txt (challenges and punishments)
```

Without a Convex account, `CONVEX_AGENT_MODE=anonymous npx convex dev` runs a local backend at `http://127.0.0.1:3210`. That works for the iOS simulator and tests, but phones and cloud devices need a cloud deployment.

## Running the app

The app uses native modules (camera, video, secure store, media library), so it needs a development build rather than Expo Go:

```sh
npx expo run:ios        # or: npx expo run:android, or --device for a plugged-in phone
```

`EXPO_PUBLIC_CONVEX_URL` is read at build time from `.env.local`.

## Content

Challenges and punishments live in plain text files, one per line:

```text
content/challenges/easy.txt
content/challenges/medium.txt
content/challenges/hard.txt
content/punishments.txt
```

Blank lines and lines starting with `#` are ignored. Edit the files, then push them to the Convex deployment:

```sh
npm run content             # dev deployment from .env.local
npm run content -- --prod   # production deployment
```

A push replaces the live lists: new lines are added and removed lines are disabled. Games that already started keep the challenges they were dealt. The push is refused with line numbers if a file repeats a line, and with a message if any difficulty has fewer than two challenges. A room with N teams needs at least N challenges in each difficulty to start. The current lines are development samples.

## Short test rooms

Production games are always two hours. To test the deadline and expiry quickly on a development deployment:

```sh
npx convex env set ALLOW_TEST_ROOMS true
echo "EXPO_PUBLIC_ENABLE_TEST_ROOMS=true" >> .env.local   # then rebuild the dev app
```

Create room then shows a dev-only "test game length" field (1-30 minutes). Test rooms expire 2 minutes after their deadline. Never set `ALLOW_TEST_ROOMS` on production.

## Checks

```sh
npm run typecheck   # app and convex/
npm run lint
npm test            # vitest + convex-test: assignment, ranking, content validation and backend flows
```

## Demo walkthrough (two phones)

1. Phone A: Create room → team name (photo optional) → lobby shows the code. Start is disabled with one team.
2. Phone B: Join room → code + name. Both lobbies list two teams; B sees "Waiting for host".
3. A: Punishment → pick one or Skip → Save. B sees it. A: Start game.
4. Both see the same countdown and different easy/medium/hard challenges.
5. Capture proof → Submit. The other phone's leaderboard updates to 1/3. Retake discards; Save as Blooper uploads the clip without counting it, and it appears in the Bloopers section of the results.
6. Finish all three on A: "All challenges complete! Waiting for the other teams."
7. Finish on B (or let a short test room run out): both phones show the standings, winner, last place and gallery. Save any item.

## Revyl

`.revyl/config.yaml` defines `preview` (pull requests) and `development` build profiles for iOS and Android, and turns on Proof of Changes for pull requests.

## Known limitations

- Video length is enforced by the camera (`maxDuration`) and checked against the length the client reports. The server does not inspect media files.
- Cloud device cameras do not produce real footage, so check capture, upload and camera-roll saving on physical phones.
- Media uploads that are abandoned before `submitEvidence` (for example, the app is killed mid-upload) are not tracked, so they stay in Convex storage until removed by hand.
