import teams from '@/data/teams.json'

/**
 * Finds the logo URL for a given team ID from teams.json.
 * This is a direct, reliable lookup.
 * @param teamId - The unique ID of the team.
 * @returns The logo URL if found, otherwise undefined.
 */
export function fetchTeamLogoById(teamId: number): string | undefined {
  const found = teams.find((team: { id: number }) => team.id === teamId)
  return found?.logo
}
