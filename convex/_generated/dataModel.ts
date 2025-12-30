/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 */

import type { DataModelFromSchemaDefinition } from "convex/server";
import type { GenericId } from "convex/values";
import type schema from "../schema.js";

export type DataModel = DataModelFromSchemaDefinition<typeof schema>;

export type TableNames = keyof DataModel;

export type Id<TableName extends TableNames> = GenericId<TableName>;

export type Doc<TableName extends TableNames> = DataModel[TableName]["document"];
