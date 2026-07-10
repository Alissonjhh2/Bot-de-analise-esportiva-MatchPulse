export interface MatchStats {
  goals_home: number;
  goals_away: number;
  corners_home: number;
  corners_away: number;
  offensive_pressure_home: number;
  offensive_pressure_away: number;
  shots_on_target_home: number;
  shots_on_target_away: number;
  fouls_home: number;
  fouls_away: number;
  yellow_cards_home: number;
  yellow_cards_away: number;
  red_cards_home: number;
  red_cards_away: number;
  offsides_home: number;
  offsides_away: number;
  ball_possession_home: number; // percentage
  ball_possession_away: number; // percentage
}

export interface Match {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  championship: string;
  minute: number;
  status: 'not_started' | 'live' | 'finished';
  stats: MatchStats;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchUpdateEvent {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  championship: string;
  minute: number;
  stats: MatchStats;
  timestamp: Date;
}

export interface MatchSimulatorConfig {
  updateInterval: number; // seconds
  maxMatches: number;
  teams: string[];
  championships: string[];
}
