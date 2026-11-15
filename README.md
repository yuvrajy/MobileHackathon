# touch grass

A two-hour, real-world team game for friend groups. Teams join a room by code, each get one easy, one medium and one hard challenge, capture photo or video proof in the app, and reunite for the results, an optional punishment for last place, and a private gallery that is deleted 30 minutes after the deadline.

Expo (SDK 58) + React Native + TypeScript with Expo Router, and Convex for the database, realtime queries, scheduled lifecycle functions and file storage. See [ARCHITECTURE.md](ARCHITECTURE.md) for the product rules.

## Setup

```sh
npm install
npx convex dev          # first run: log in and create a project; writes .env.local and keeps functions in sync
npm run seed            # in another terminal: imports data/challenges.json and data/punishments.json
```

Without a Convex account, `CONVEX_AGENT_MODE=anonymous npx convex dev` runs a local backend at `http://127.0.0.1:3210`. That works for the iOS simulator and tests, but phones and cloud devices need a cloud deployment.

## Running the app

The app uses native modules (camera, video, secure store, media library), so it needs a development build rather than Expo Go:

```sh
npx expo run:ios        # or: npx expo run:android, or --device for a plugged-in phone
```

`EXPO_PUBLIC_CONVEX_URL` is read at build time from `.env.local`.

## Content

`data/challenges.json` and `data/punishments.json` currently hold a small **development-only** sample set (keys start with `dev_`). To use the founders' lists, replace those files using the same shape and run `npm run seed` again. Import is idempotent: rows are upserted by `key` and keys missing from the file are disabled. The import is rejected with a list of problems if a key is duplicated, text is missing, a difficulty is not easy/medium/hard, or any tier has fewer than two enabled challenges. A room with N teams needs at least N enabled challenges per tier to start.

```json
[{"key":"challenge_001","description":"…","difficulty":"easy","category":"creative","environments":["mall"],"enabled":true}]
[{"key":"punishment_001","description":"…","category":"funny","enabled":true}]
```

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
5. Capture proof → Submit. The other phone's leaderboard updates to 1/3. Retake discards; Save as Blooper only saves to the camera roll.
6. Finish all three on A: "All challenges complete! Waiting for the other teams."
7. Finish on B (or let a short test room run out): both phones show the standings, winner, last place and gallery. Save any item.

## Revyl

`.revyl/config.yaml` defines `preview` (pull requests) and `development` build profiles for iOS and Android, and turns on Proof of Changes for pull requests.

## Known limitations

- Video length is enforced by the camera (`maxDuration`) and checked against the length the client reports. The server does not inspect media files.
- Cloud device cameras do not produce real footage, so check capture, upload and camera-roll saving on physical phones.
- Media uploads that are abandoned before `submitEvidence` (for example, the app is killed mid-upload) are not tracked, so they stay in Convex storage until removed by hand.
