// Football Provider Interface
export interface FootballProvider {
  getLiveMatches(league?: string): Promise<LiveMatch[]>;
  getMatchSummary(eventId: string, league: string): Promise<MatchStats>;
  getPlayByPlay(eventId: string, league: string): Promise<PlayEvent[]>;
  getStandings(league: string): Promise<StandingsEntry[]>;
  getTeams(league: string): Promise<Team[]>;
  getTeamRoster(league: string, teamId: string): Promise<Player[]>;
  getTeamSchedule(league: string, teamId: string): Promise<Match[]>;
  getTeamInjuries(league: string, teamId: string): Promise<Injury[]>;
  getCalendar(league: string): Promise<CalendarEntry[]>;
}

// Normalized Match Stats Model
export interface MatchStats {
  eventId: string;
  league: string;
  leagueName: string;
  status: 'scheduled' | 'in_progress' | 'halftime' | 'final' | 'postponed' | 'cancelled';
  clock: string;
  period: string;
  
  homeTeam: TeamStats;
  awayTeam: TeamStats;
  
  venue?: Venue;
  startTime: Date;
}

export interface TeamStats {
  teamId: string;
  teamName: string;
  teamAbbreviation: string;
  teamLogo: string;
  isHome: boolean;
  
  goals: number;
  corners: number;
  shots: number;
  shotsOnTarget: number;
  possession: number; // percentage
  yellowCards: number;
  redCards: number;
  fouls: number;
  offsides: number;
  passes: number;
  passesAccuracy: number;
  tackles: number;
  interceptions: number;
  saves: number;
  
  form: string; // Last 5 games, e.g., "DVEVV"
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  country: string;
}

// Live Match (from Scoreboard)
export interface LiveMatch {
  eventId: string;
  league: string;
  leagueName: string;
  status: 'scheduled' | 'in_progress' | 'halftime' | 'final' | 'postponed' | 'cancelled';
  clock: string;
  period: string;
  
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
    form: string;
  };
  
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
    form: string;
  };
  
  startTime: Date;
  venue?: Venue;
}

// Play Event (from Play-by-Play)
export interface PlayEvent {
  id: string;
  type: 'goal' | 'yellow_card' | 'red_card' | 'substitution' | 'foul' | 'corner' | 'offside' | 'shot' | 'save' | 'other';
  minute: number;
  teamId: string;
  teamName: string;
  description: string;
  player?: string;
  playerIn?: string; // for substitutions
  playerOut?: string; // for substitutions
}

// Standings Entry
export interface StandingsEntry {
  rank: number;
  teamId: string;
  teamName: string;
  teamLogo: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  form?: string;
}

// Team
export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  location: string;
  logo: string;
  color: string;
  alternateColor: string;
  slug: string;
}

// Player (from Roster)
export interface Player {
  id: string;
  fullName: string;
  displayName: string;
  position: string;
  jersey?: number;
  age: number;
  height: string;
  weight: string;
  citizenship: string;
  status: 'active' | 'injured' | 'suspended';
  
  statistics: PlayerStats;
}

export interface PlayerStats {
  appearances: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCards: number;
  shots: number;
  shotsOnTarget: number;
  passes: number;
  passesAccuracy: number;
  tackles: number;
  interceptions: number;
  saves: number;
  goalsConceded: number;
}

// Injury
export interface Injury {
  playerId: string;
  playerName: string;
  injuryType: string;
  status: string;
  estimatedReturn?: Date;
}

// Match (from Schedule)
export interface Match {
  eventId: string;
  league: string;
  leagueName: string;
  status: 'scheduled' | 'in_progress' | 'halftime' | 'final' | 'postponed' | 'cancelled';
  
  homeTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
  };
  
  awayTeam: {
    id: string;
    name: string;
    abbreviation: string;
    logo: string;
    score: number;
  };
  
  startTime: Date;
  venue?: Venue;
}

// Calendar Entry
export interface CalendarEntry {
  date: Date;
  type: 'matchday' | 'offday';
  description?: string;
}

// League Mapping
export interface LeagueMapping {
  name: string;
  slug: string;
  region: string;
}
