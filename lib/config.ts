const convexUrl = process.env.EXPO_PUBLIC_CONVEX_URL;

if (!convexUrl) {
  throw new Error("EXPO_PUBLIC_CONVEX_URL is not set. Copy .env.example to .env.local and run npx convex dev.");
}

export const CONVEX_URL = convexUrl;
export const TEST_ROOMS_ENABLED = __DEV__ && process.env.EXPO_PUBLIC_ENABLE_TEST_ROOMS === "true";
