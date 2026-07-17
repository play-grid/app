/* eslint-disable */
/**
 * Generated data model types.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  DocumentByName,
  TableNamesInDataModel,
  SystemTableNames,
  AnyDataModel,
} from "convex/server";
import type { GenericId } from "convex/values";

/**
 * A type describing your Convex data model.
 *
 * This type includes information about what tables you have, the type of
 * documents stored in those tables, and the indexes defined on them.
 *
 * This type is used to parameterize methods like `queryGeneric` and
 * `mutationGeneric` to make them type-safe.
 */

export type DataModel = {
  aggregate_bucket: {
    document: {
      count: number;
      indexName: string;
      keyHash: string;
      keyParts: Array<null | any>;
      nonNullCountValues: Record<string, number>;
      sumValues: Record<string, number>;
      tableKey: string;
      updatedAt: number;
      _id: Id<"aggregate_bucket">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "count"
      | "indexName"
      | "keyHash"
      | "keyParts"
      | "nonNullCountValues"
      | `nonNullCountValues.${string}`
      | "sumValues"
      | `sumValues.${string}`
      | "tableKey"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_table_index: ["tableKey", "indexName", "_creationTime"];
      by_table_index_hash: [
        "tableKey",
        "indexName",
        "keyHash",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  aggregate_extrema: {
    document: {
      count: number;
      fieldName: string;
      indexName: string;
      keyHash: string;
      sortKey: string;
      tableKey: string;
      updatedAt: number;
      value: any;
      valueHash: string;
      _id: Id<"aggregate_extrema">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "count"
      | "fieldName"
      | "indexName"
      | "keyHash"
      | "sortKey"
      | "tableKey"
      | "updatedAt"
      | "value"
      | "valueHash";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_table_index: ["tableKey", "indexName", "_creationTime"];
      by_table_index_hash_field_sort: [
        "tableKey",
        "indexName",
        "keyHash",
        "fieldName",
        "sortKey",
        "_creationTime",
      ];
      by_table_index_hash_field_value: [
        "tableKey",
        "indexName",
        "keyHash",
        "fieldName",
        "valueHash",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  aggregate_member: {
    document: {
      docId: string;
      extremaValues: Record<string, null | any>;
      indexName: string;
      keyHash: string;
      keyParts: Array<null | any>;
      kind: string;
      nonNullCountValues: Record<string, number>;
      rankKey?: null | any;
      rankNamespace?: null | any;
      rankSumValue?: null | number;
      sumValues: Record<string, number>;
      tableKey: string;
      updatedAt: number;
      _id: Id<"aggregate_member">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "docId"
      | "extremaValues"
      | `extremaValues.${string}`
      | "indexName"
      | "keyHash"
      | "keyParts"
      | "kind"
      | "nonNullCountValues"
      | `nonNullCountValues.${string}`
      | "rankKey"
      | "rankNamespace"
      | "rankSumValue"
      | "sumValues"
      | `sumValues.${string}`
      | "tableKey"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_kind_table_index: ["kind", "tableKey", "indexName", "_creationTime"];
      by_kind_table_index_doc: [
        "kind",
        "tableKey",
        "indexName",
        "docId",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  aggregate_rank_node: {
    document: {
      aggregate?: null | { count: number; sum: number };
      items: Array<{ k: null | any; s: number; v: null | any }>;
      subtrees: Array<string>;
      _id: Id<"aggregate_rank_node">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "aggregate"
      | "aggregate.count"
      | "aggregate.sum"
      | "items"
      | "subtrees";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  aggregate_rank_tree: {
    document: {
      aggregateName: string;
      maxNodeSize: number;
      namespace?: null | any;
      root: Id<"aggregate_rank_node">;
      _id: Id<"aggregate_rank_tree">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "aggregateName"
      | "maxNodeSize"
      | "namespace"
      | "root";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_aggregate_name: ["aggregateName", "_creationTime"];
      by_namespace: ["namespace", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  aggregate_state: {
    document: {
      completedAt?: null | number;
      cursor?: null | string;
      indexName: string;
      keyDefinitionHash: string;
      kind: string;
      lastError?: null | string;
      metricDefinitionHash: string;
      processed: number;
      startedAt: number;
      status: string;
      tableKey: string;
      updatedAt: number;
      _id: Id<"aggregate_state">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "completedAt"
      | "cursor"
      | "indexName"
      | "keyDefinitionHash"
      | "kind"
      | "lastError"
      | "metricDefinitionHash"
      | "processed"
      | "startedAt"
      | "status"
      | "tableKey"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_kind_status: ["kind", "status", "_creationTime"];
      by_kind_table_index: ["kind", "tableKey", "indexName", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  companies: {
    document: {
      createdAt?: number;
      imageUrl?: null | string;
      isActive: boolean;
      listId: string;
      nameAr?: null | string;
      nameEn: string;
      updatedAt: number;
      _id: Id<"companies">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "createdAt"
      | "imageUrl"
      | "isActive"
      | "listId"
      | "nameAr"
      | "nameEn"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      listId: ["listId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  countries: {
    document: {
      countryCode: string;
      createdAt?: number;
      flagUrl: string;
      name: string;
      nameAr?: null | string;
      region?: null | string;
      updatedAt: number;
      _id: Id<"countries">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "countryCode"
      | "createdAt"
      | "flagUrl"
      | "name"
      | "nameAr"
      | "region"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      countryCode: ["countryCode", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  customListItems: {
    document: {
      createdAt?: number;
      listId: string;
      teamId: string;
      _id: Id<"customListItems">;
      _creationTime: number;
    };
    fieldPaths: "_creationTime" | "_id" | "createdAt" | "listId" | "teamId";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      listId: ["listId", "_creationTime"];
      teamId: ["teamId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  customLists: {
    document: {
      createdAt?: number;
      name: string;
      slug: string;
      updatedAt: number;
      _id: Id<"customLists">;
      _creationTime: number;
    };
    fieldPaths:
      "_creationTime" | "_id" | "createdAt" | "name" | "slug" | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      slug: ["slug", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  fiveSecondsCategories: {
    document: {
      createdAt?: number;
      nameAr: string;
      nameEn: string;
      updatedAt: number;
      _id: Id<"fiveSecondsCategories">;
      _creationTime: number;
    };
    fieldPaths:
      "_creationTime" | "_id" | "createdAt" | "nameAr" | "nameEn" | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      nameAr: ["nameAr", "_creationTime"];
      nameEn: ["nameEn", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  fiveSecondsFeedback: {
    document: {
      comment?: null | string;
      createdAt?: number;
      playerId?: null | string;
      questionId: string;
      type: string;
      _id: Id<"fiveSecondsFeedback">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "comment"
      | "createdAt"
      | "playerId"
      | "questionId"
      | "type";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      questionId: ["questionId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  fiveSecondsQuestions: {
    document: {
      categoryId: string;
      createdAt?: number;
      deletedAt?: null | number;
      difficulty: string;
      text: string;
      updatedAt: number;
      _id: Id<"fiveSecondsQuestions">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "categoryId"
      | "createdAt"
      | "deletedAt"
      | "difficulty"
      | "text"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      categoryId: ["categoryId", "_creationTime"];
      difficulty: ["difficulty", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  leagues: {
    document: {
      country: string;
      createdAt?: number;
      name: string;
      regionId: string;
      teamCount: number;
      updatedAt: number;
      _id: Id<"leagues">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "country"
      | "createdAt"
      | "name"
      | "regionId"
      | "teamCount"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      regionId: ["regionId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  migration_run: {
    document: {
      allowDrift: boolean;
      cancelRequested: boolean;
      completedAt?: null | number;
      currentIndex: number;
      direction: string;
      dryRun: boolean;
      lastError?: null | string;
      migrationIds: Array<string>;
      runId: string;
      startedAt: number;
      status: string;
      updatedAt: number;
      _id: Id<"migration_run">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "allowDrift"
      | "cancelRequested"
      | "completedAt"
      | "currentIndex"
      | "direction"
      | "dryRun"
      | "lastError"
      | "migrationIds"
      | "runId"
      | "startedAt"
      | "status"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_run_id: ["runId", "_creationTime"];
      by_status: ["status", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  migration_state: {
    document: {
      applied: boolean;
      checksum: string;
      completedAt?: null | number;
      cursor?: null | string;
      direction?: null | string;
      lastError?: null | string;
      migrationId: string;
      processed: number;
      runId?: null | string;
      startedAt?: null | number;
      status: string;
      updatedAt: number;
      writeMode: string;
      _id: Id<"migration_state">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "applied"
      | "checksum"
      | "completedAt"
      | "cursor"
      | "direction"
      | "lastError"
      | "migrationId"
      | "processed"
      | "runId"
      | "startedAt"
      | "status"
      | "updatedAt"
      | "writeMode";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      by_migration_id: ["migrationId", "_creationTime"];
      by_status: ["status", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  sportRegions: {
    document: {
      createdAt?: number;
      nameAr: string;
      nameEn: string;
      teamCount: number;
      updatedAt: number;
      _id: Id<"sportRegions">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "createdAt"
      | "nameAr"
      | "nameEn"
      | "teamCount"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  statItems: {
    document: {
      category: string;
      countryId?: null | string;
      createdAt?: number;
      entityType: string;
      externalId?: null | string;
      hint?: null | string;
      imageUrl?: null | string;
      metricType: string;
      name: string;
      nameAr?: null | string;
      source: string;
      status: string;
      teamId?: null | string;
      unit: string;
      updatedAt: number;
      value: number;
      _id: Id<"statItems">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "category"
      | "countryId"
      | "createdAt"
      | "entityType"
      | "externalId"
      | "hint"
      | "imageUrl"
      | "metricType"
      | "name"
      | "nameAr"
      | "source"
      | "status"
      | "teamId"
      | "unit"
      | "updatedAt"
      | "value";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      category_status_metricType: [
        "category",
        "status",
        "metricType",
        "_creationTime",
      ];
      externalId_category_metricType: [
        "externalId",
        "category",
        "metricType",
        "_creationTime",
      ];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
  teams: {
    document: {
      createdAt?: number;
      externalId?: null | string;
      leagueId?: null | string;
      logoUrl: string;
      name: string;
      updatedAt: number;
      _id: Id<"teams">;
      _creationTime: number;
    };
    fieldPaths:
      | "_creationTime"
      | "_id"
      | "createdAt"
      | "externalId"
      | "leagueId"
      | "logoUrl"
      | "name"
      | "updatedAt";
    indexes: {
      by_id: ["_id"];
      by_creation_time: ["_creationTime"];
      externalId: ["externalId", "_creationTime"];
      leagueId: ["leagueId", "_creationTime"];
    };
    searchIndexes: {};
    vectorIndexes: {};
  };
};

/**
 * The names of all of your Convex tables.
 */
export type TableNames = TableNamesInDataModel<DataModel>;

/**
 * The type of a document stored in Convex.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Doc<TableName extends TableNames> = DocumentByName<
  DataModel,
  TableName
>;

/**
 * An identifier for a document in Convex.
 *
 * Convex documents are uniquely identified by their `Id`, which is accessible
 * on the `_id` field. To learn more, see [Document IDs](https://docs.convex.dev/using/document-ids).
 *
 * Documents can be loaded using `db.get(tableName, id)` in query and mutation functions.
 *
 * IDs are just strings at runtime, but this type can be used to distinguish them from other
 * strings when type checking.
 *
 * @typeParam TableName - A string literal type of the table name (like "users").
 */
export type Id<TableName extends TableNames | SystemTableNames> =
  GenericId<TableName>;
