import { CRPCError } from "kitcn/server";
import { initCRPC } from "../functions/generated/server";

const c = initCRPC
  .meta<{
    auth?: "optional" | "required" | "bypass";
    role?: "admin";
  }>()
  .create();

export const publicQuery = c.query.meta({ auth: "optional" });
export const publicMutation = c.mutation.meta({ auth: "optional" });

export const authQuery = c.query
  .meta({ auth: "required" })
  .use(async ({ ctx, next }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    return next({ ctx: { ...ctx, userId: identity.subject, user: identity } });
  });

export const authMutation = c.mutation
  .meta({ auth: "required" })
  .use(async ({ ctx, next }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    return next({ ctx: { ...ctx, userId: identity.subject, user: identity } });
  });

export const adminQuery = c.query
  .meta({ auth: "required", role: "admin" })
  .use(async ({ ctx, next }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    return next({ ctx: { ...ctx, userId: identity.subject, user: identity } });
  });

export const adminMutation = c.mutation
  .meta({ auth: "required", role: "admin" })
  .use(async ({ ctx, next }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new CRPCError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }
    return next({ ctx: { ...ctx, userId: identity.subject, user: identity } });
  });
