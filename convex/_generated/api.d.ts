/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as appUpdateActions from "../appUpdateActions.js";
import type * as appUpdateDelivery from "../appUpdateDelivery.js";
import type * as appUpdateHttp from "../appUpdateHttp.js";
import type * as appUpdates from "../appUpdates.js";
import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_appUpdateConfig from "../lib/appUpdateConfig.js";
import type * as lib_appUpdateSchema from "../lib/appUpdateSchema.js";
import type * as lib_appUpdateTokens from "../lib/appUpdateTokens.js";
import type * as lib_emailLocale from "../lib/emailLocale.js";
import type * as lib_tokens from "../lib/tokens.js";
import type * as lib_validators from "../lib/validators.js";
import type * as shieldActions from "../shieldActions.js";
import type * as shieldEmailDelivery from "../shieldEmailDelivery.js";
import type * as shieldOffers from "../shieldOffers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  appUpdateActions: typeof appUpdateActions;
  appUpdateDelivery: typeof appUpdateDelivery;
  appUpdateHttp: typeof appUpdateHttp;
  appUpdates: typeof appUpdates;
  crons: typeof crons;
  http: typeof http;
  "lib/appUpdateConfig": typeof lib_appUpdateConfig;
  "lib/appUpdateSchema": typeof lib_appUpdateSchema;
  "lib/appUpdateTokens": typeof lib_appUpdateTokens;
  "lib/emailLocale": typeof lib_emailLocale;
  "lib/tokens": typeof lib_tokens;
  "lib/validators": typeof lib_validators;
  shieldActions: typeof shieldActions;
  shieldEmailDelivery: typeof shieldEmailDelivery;
  shieldOffers: typeof shieldOffers;
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
