# ADR: Explicit, Type-Safe `dataProvider` for React-Admin

**Status**: Accepted
**Date**: Dec 22, 2025

### Decision

Use an **explicit, fully type-safe `dataProvider`** backed by a fixed `ResourceType` union and a static `routeMap`.
Currently, the only supported resource is `"questions"`.

### Context

* The admin panel manages **one resource only**.
* Backend is **Hono + `hcWithType`**, which requires static routes to preserve TypeScript inference.
* React-Admin resources are registered statically.
* No RBAC or multi-resource admin scope exists.

### Alternatives Considered

* **Dynamic admin routes** (e.g. `/admin/:resource`, `/admin/$Resource`)
* **Generic dataProvider** resolving endpoints at runtime

Both options were **explicitly evaluated and rejected** because:

* They introduce significant backend and client refactoring.
* They weaken or complicate type safety with Hono’s typed client.
* They solve a scalability problem that does not exist yet.

With only one resource, this would violate **YAGNI** and **KISS** by adding abstraction, runtime checks, and maintenance cost with no practical benefit.

### Why This Approach

* **Strict type safety, no `any`**
  Static calls like `client.api.admin.questions.$get` retain full inference. Dynamic access does not.

* **Minimal surface area**
  One resource → one mapping → predictable behavior.

* **Intentional simplicity**
  The design matches the current domain instead of guessing future needs.

### Consequences

* Adding a new resource requires:

  * Extending `ResourceType`
  * Adding a new entry to `routeMap`

This is deliberate and keeps the system explicit and correct.

### Future Evolution (Planned)

* Move to shared `/data/*` and `/data/admin/*` endpoints.
* Introduce ETL-fed shared datasets.
* Revisit dynamic routing **only when multiple admin resources actually exist**, using a typed registry or improved Hono support.

### Summary

Dynamic admin routing was considered and consciously rejected.
The current solution follows **KISS**, respects **YAGNI**, and maximizes type safety while keeping the upgrade path clear.