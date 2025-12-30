/* eslint-disable */
/**
 * Generated utilities for implementing server-side Convex functions.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 */

import {
  actionGeneric,
  httpActionGeneric,
  queryGeneric,
  mutationGeneric,
  internalActionGeneric,
  internalMutationGeneric,
  internalQueryGeneric,
} from "convex/server";
import type { DataModelFromSchemaDefinition } from "convex/server";
import type schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export const query = queryGeneric;
export const mutation = mutationGeneric;
export const action = actionGeneric;
export const internalQuery = internalQueryGeneric;
export const internalMutation = internalMutationGeneric;
export const internalAction = internalActionGeneric;
export const httpAction = httpActionGeneric;
