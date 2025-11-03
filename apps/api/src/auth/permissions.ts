// lib/permissions.ts (or similar)
import { createAccessControl } from 'better-auth/plugins/access';
import { adminAc, defaultStatements } from 'better-auth/plugins/admin/access';

const statement = {
  ...defaultStatements, // Includes user/session management for admins
  games: ['create', 'read', 'update', 'publish', 'delete', 'approve'], // Creators: create/update/publish; Admins: all + approve/delete
  sessions: ['create', 'read', 'list'], // Players: create/read (buy/play); Admins: list (analytics)
  dashboard: ['read'], // Creators/Admins: view earnings/ratings
} as const;

export const ac = createAccessControl(statement);

export const playerRole = ac.newRole({
  sessions: ['create', 'read'], // Buy/play sessions
});

export const creatorRole = ac.newRole({
  games: ['create', 'read', 'update', 'publish'], // Upload/edit/publish games
  dashboard: ['read'], // View personal earnings/ratings
});

export const adminRole = ac.newRole({
  ...adminAc.statements, // Full default admin perms (users/sessions)
  games: ['approve', 'create', 'delete', 'publish', 'read', 'update'],
  sessions: ['create', 'list', 'read'],
  dashboard: ['read'],
});
