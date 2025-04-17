
export interface PlayerCompetition {
  id?: number;
  player_name: string;
  game_mode: 'players' | 'computer';
  wins: number;
  losses: number;
  draws: number;
  total_games: number;
  last_played: Date | string;
  user_id?: string | null;
}
