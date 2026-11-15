/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as auth from "../auth.js";
import type * as constants from "../constants.js";
import type * as content from "../content.js";
import type * as errors from "../errors.js";
import type * as gallery from "../gallery.js";
import type * as game from "../game.js";
import type * as lifecycle from "../lifecycle.js";
import type * as logic_assignment from "../logic/assignment.js";
import type * as logic_content from "../logic/content.js";
import type * as logic_ranking from "../logic/ranking.js";
import type * as logic_roomCode from "../logic/roomCode.js";
import type * as media from "../media.js";
import type * as rooms from "../rooms.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  auth: typeof auth;
  constants: typeof constants;
  content: typeof content;
  errors: typeof errors;
  gallery: typeof gallery;
  game: typeof game;
  lifecycle: typeof lifecycle;
  "logic/assignment": typeof logic_assignment;
  "logic/content": typeof logic_content;
  "logic/ranking": typeof logic_ranking;
  "logic/roomCode": typeof logic_roomCode;
  media: typeof media;
  rooms: typeof rooms;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
