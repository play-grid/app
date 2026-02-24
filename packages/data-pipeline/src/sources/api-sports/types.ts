export interface APISportsPlayer {
  player: {
    id: number;
    name: string;
    photo: string;
  };
  statistics: Array<{
    team: {
      name: string;
    };
    goals: {
      total: number | null;
      assists: number | null;
    };
    games: {
      appearences: number | null;
    };
  }>;
}

export interface APISportsStanding {
  team: {
    id: number;
    name: string;
    logo: string;
  };
  league: {
    name: string;
  };
  rank: number;
  all: {
    win: number;
  };
}
