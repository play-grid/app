import {
  boolean,
  convexTable,
  defineSchema,
  index,
  integer,
  text,
  timestamp,
} from "kitcn/orm";

export const fiveSecondsCategories = convexTable(
  "fiveSecondsCategories",
  {
    nameEn: text().notNull(),
    nameAr: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [index("nameEn").on(t.nameEn), index("nameAr").on(t.nameAr)],
);

export const fiveSecondsQuestions = convexTable(
  "fiveSecondsQuestions",
  {
    text: text().notNull(),
    difficulty: text().notNull(),
    categoryId: text()
      .references(() => fiveSecondsCategories.id, { onDelete: "cascade" })
      .notNull(),
    deletedAt: timestamp(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("categoryId").on(t.categoryId),
    index("difficulty").on(t.difficulty),
  ],
);

export const fiveSecondsFeedback = convexTable(
  "fiveSecondsFeedback",
  {
    questionId: text()
      .references(() => fiveSecondsQuestions.id, { onDelete: "cascade" })
      .notNull(),
    type: text().notNull(),
    comment: text(),
    playerId: text(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [index("questionId").on(t.questionId)],
);

export const sportRegions = convexTable(
  "sportRegions",
  {
    nameEn: text().notNull(),
    nameAr: text().notNull(),
    teamCount: integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
);

export const leagues = convexTable(
  "leagues",
  {
    name: text().notNull(),
    country: text().notNull(),
    regionId: text()
      .references(() => sportRegions.id, { onDelete: "cascade" })
      .notNull(),
    teamCount: integer().notNull().default(0),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [index("regionId").on(t.regionId)],
);

export const teams = convexTable(
  "teams",
  {
    name: text().notNull(),
    logoUrl: text().notNull(),
    leagueId: text().references(() => leagues.id, { onDelete: "set null" }),
    externalId: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("leagueId").on(t.leagueId),
    index("externalId").on(t.externalId),
  ],
);

export const customLists = convexTable(
  "customLists",
  {
    name: text().notNull(),
    slug: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [index("slug").on(t.slug)],
);

export const customListItems = convexTable(
  "customListItems",
  {
    listId: text()
      .references(() => customLists.id, { onDelete: "cascade" })
      .notNull(),
    teamId: text()
      .references(() => teams.id, { onDelete: "cascade" })
      .notNull(),
    createdAt: timestamp().notNull().defaultNow(),
  },
  (t) => [index("listId").on(t.listId), index("teamId").on(t.teamId)],
);

export const companies = convexTable(
  "companies",
  {
    nameEn: text().notNull(),
    nameAr: text(),
    listId: text().notNull(),
    isActive: boolean().notNull().default(true),
    imageUrl: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [index("listId").on(t.listId)],
);

export const countries = convexTable(
  "countries",
  {
    name: text().notNull(),
    nameAr: text(),
    flagUrl: text().notNull(),
    countryCode: text().notNull(),
    region: text(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [index("countryCode").on(t.countryCode)],
);

export const statItems = convexTable(
  "statItems",
  {
    entityType: text().notNull(),
    externalId: text(),
    category: text().notNull(),
    name: text().notNull(),
    nameAr: text(),
    metricType: text().notNull(),
    value: integer().notNull(),
    unit: text().notNull(),
    imageUrl: text(),
    teamId: text().references(() => teams.id, { onDelete: "set null" }),
    countryId: text().references(() => countries.id, { onDelete: "set null" }),
    hint: text(),
    source: text().notNull(),
    status: text().notNull(),
    createdAt: timestamp().notNull().defaultNow(),
    updatedAt: timestamp().notNull().defaultNow().$onUpdateFn(() => new Date()),
  },
  (t) => [
    index("category_status_metricType").on(t.category, t.status, t.metricType),
    index("externalId_category_metricType").on(t.externalId, t.category, t.metricType),
  ],
);

export default defineSchema({
  fiveSecondsCategories,
  fiveSecondsQuestions,
  fiveSecondsFeedback,
  sportRegions,
  leagues,
  teams,
  customLists,
  customListItems,
  companies,
  countries,
  statItems,
}).relations((r) => ({
  fiveSecondsCategories: {
    questions: r.many.fiveSecondsQuestions(),
  },
  fiveSecondsQuestions: {
    category: r.one.fiveSecondsCategories({ from: r.fiveSecondsQuestions.categoryId, to: r.fiveSecondsCategories.id }),
    feedback: r.many.fiveSecondsFeedback(),
  },
  fiveSecondsFeedback: {
    question: r.one.fiveSecondsQuestions({ from: r.fiveSecondsFeedback.questionId, to: r.fiveSecondsQuestions.id }),
  },
  sportRegions: {
    leagues: r.many.leagues(),
  },
  leagues: {
    region: r.one.sportRegions({ from: r.leagues.regionId, to: r.sportRegions.id }),
    teams: r.many.teams(),
  },
  teams: {
    league: r.one.leagues({ from: r.teams.leagueId, to: r.leagues.id }),
  },
  customLists: {
    items: r.many.customListItems(),
  },
  customListItems: {
    list: r.one.customLists({ from: r.customListItems.listId, to: r.customLists.id }),
    team: r.one.teams({ from: r.customListItems.teamId, to: r.teams.id }),
  },
  statItems: {
    team: r.one.teams({ from: r.statItems.teamId, to: r.teams.id }),
    country: r.one.countries({ from: r.statItems.countryId, to: r.countries.id }),
  },
}));
