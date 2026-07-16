import {
  FootballProvider,
  LiveMatch,
  MatchStats,
  PlayEvent,
  StandingsEntry,
  Team,
  Player,
  Injury,
  Match,
  CalendarEntry,
  TeamStats,
} from '@matchpulse/types';
import { logger } from '@matchpulse/logger';

// Cache entry
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// ESPN API Response Types (internal)
interface ESPNCompetitor {
  id: string;
  homeAway: 'home' | 'away';
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    logo: string;
  };
  score: string;
  form?: string;
  statistics?: Array<{
    name: string;
    value: number;
    displayValue: string;
  }>;
}

interface ESPNEvent {
  id: string;
  date: string;
  name: string;
  shortName: string;
  competitions: Array<{
    id: string;
    status: {
      type: {
        id: string;
        name: string;
        state: string;
      };
      displayClock?: string;
    };
    venue?: {
      id: string;
      fullName: string;
      address: {
        city: string;
        country: string;
      };
    };
    competitors: ESPNCompetitor[];
  }>;
}

interface ESPNBoxscore {
  teams: Array<{
    team: {
      displayName: string;
      id: string;
      logo: string;
    };
    statistics: Array<{
      name: string;
      displayValue: string;
    }>;
  }>;
}

interface ESPNLeader {
  name: string;
  displayName: string;
  leaders: Array<{
    athlete: {
      id: string;
      displayName: string;
      jersey?: string;
      position?: {
        name: string;
      };
    };
    statistics: Array<{
      name: string;
      value: number;
      displayValue: string;
    }>;
  }>;
}

interface ESPNSummary {
  header: {
    id: string;
  };
  competitions: Array<{
    id: string;
    competitors: ESPNCompetitor[];
  }>;
  boxscore?: ESPNBoxscore;
  leaders?: Array<{
    team: {
      displayName: string;
    };
    leaders: ESPNLeader[];
  }>;
}

interface ESPNStanding {
  team: string;
  stats: Array<{
    name: string;
    value: number;
    displayValue: string;
  }>;
}

interface ESPNStandings {
  children: Array<{
    standings: {
      entries: ESPNStanding[];
    };
  }>;
}

interface ESPNPlayItem {
  id: string;
  type: {
    id: number;
    text: string;
  };
  clock: number;
  period: number;
  team: {
    id: string;
    displayName: string;
  };
  athlete?: {
    displayName: string;
  };
  text: string;
}

interface ESPNPlays {
  items: ESPNPlayItem[];
  count: number;
}

interface ESPNSituation {
  possession: {
    homeTeam: number;
    awayTeam: number;
  };
  lastPlay: {
    text: string;
    teamId: string;
  };
}

interface ESPNTeam {
  team: {
    id: string;
    displayName: string;
    abbreviation: string;
    location: string;
    logo: string;
    color: string;
    alternateColor: string;
    slug: string;
  };
}

interface ESPNAthlete {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  displayName: string;
  position: {
    name: string;
    abbreviation: string;
  };
  jersey?: number;
  age: number;
  height: number;
  weight: number;
  citizenship: string;
  status: {
    name: string;
    type: string;
  };
  statistics?: {
    splits: {
      categories: Array<{
        name: string;
        stats: Array<{
          name: string;
          value: number;
          displayValue: string;
        }>;
      }>;
    };
  };
}

interface ESPNRoster {
  athletes: ESPNAthlete[];
  team: {
    id: string;
    displayName: string;
    logo: string;
  };
}

interface ESPNCalendar {
  items: Array<{
    $ref: string;
  }>;
  count: number;
}

interface ESPNSchedule {
  events: Array<{
    id: string;
    date: string;
    name: string;
    competitions: Array<{
      competitors: ESPNCompetitor[];
      venue?: {
        fullName: string;
        address: {
          city: string;
          country: string;
        };
      };
    }>;
  }>;
}

// Cache configuration
const CACHE_TTL = {
  scoreboard: 10 * 1000, // 10 seconds (reduced for better live updates)
  summary: 15 * 1000, // 15 seconds
  standings: 10 * 60 * 1000, // 10 minutes
  teams: 24 * 60 * 60 * 1000, // 24 hours
  roster: 6 * 60 * 60 * 1000, // 6 hours
  calendar: 24 * 60 * 60 * 1000, // 24 hours
  schedule: 30 * 60 * 1000, // 30 minutes
  injuries: 10 * 60 * 1000, // 10 minutes
  plays: 10 * 1000, // 10 seconds
};

export class ESPNProvider implements FootballProvider {
  private cache: Map<string, CacheEntry<any>> = new Map();
  private baseUrl = 'https://site.api.espn.com/apis/site/v2/sports/soccer';
  private coreUrl = 'https://sports.core.api.espn.com/v2/sports/soccer';

  constructor() {
    // Clean expired cache entries every 5 minutes
    setInterval(() => this.cleanCache(), 5 * 60 * 1000);
  }

  private cleanCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key);
      }
    }
  }

  private getCacheKey(type: string, params: string): string {
    return `${type}:${params}`;
  }

  private getFromCache<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  private setCache<T>(key: string, data: T, ttl: number): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  private async fetchWithRetry<T>(
    url: string,
    maxRetries = 3,
    initialDelay = 1000
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        logger.warn(`ESPN API request failed (attempt ${attempt + 1}/${maxRetries}): ${url}`);

        if (attempt < maxRetries - 1) {
          const delay = initialDelay * Math.pow(2, attempt);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Max retries exceeded');
  }

  async getLiveMatches(league?: string, forceRefresh = false): Promise<LiveMatch[]> {
    const cacheKey = this.getCacheKey('scoreboard', league || 'all');
    const cached = this.getFromCache<LiveMatch[]>(cacheKey);
    
    if (cached && !forceRefresh) {
      logger.info(`Returning cached live matches for ${league || 'all leagues'} (${cached.length} matches)`);
      return cached;
    }
    
    if (forceRefresh) {
      logger.info(`Force refresh requested for live matches`);
    }

    try {
      let allMatches: LiveMatch[] = [];
      
      if (league) {
        // Fetch specific league
        const url = `${this.baseUrl}/${league}/scoreboard?lang=pt`;
        logger.info(`Fetching ESPN data from: ${url}`);
        const data = await this.fetchWithRetry<{ events: ESPNEvent[]; leagues: any[] }>(url);
        logger.info(`ESPN API returned ${data.events?.length || 0} events`);
        allMatches = this.normalizeLiveMatches(data);
      } else {
        // Fetch from multiple working leagues
        logger.info(`Fetching matches from multiple leagues`);
        const workingLeagues = [
          'bra.1', 'bra.2', 'bra.3', 'bra.4',
          'uefa.champions', 'uefa.europa',
          'eng.1', 'esp.1', 'fra.1', 'ger.1', 'ita.1', 'por.1',
          'conmebol.libertadores', 'conmebol.sudamericana', 'conmebol.america',
          'caf.champions', 'chn.1',
          'fifa.world',
          // South American leagues for friendlies
          'arg.1', 'mex.1', 'col.1', 'uru.1', 'par.1', 'chi.1', 'ecu.1',
          // Additional leagues for friendlies coverage
          'tur.1', 'usa.1', 'jpn.1', 'ned.1', 'bel.1', 'rus.1', 'aut.1', 'sco.1'
        ];
        
        for (const leagueSlug of workingLeagues) {
          try {
            const url = `${this.baseUrl}/${leagueSlug}/scoreboard?lang=pt`;
            const data = await this.fetchWithRetry<{ events: ESPNEvent[]; leagues: any[] }>(url);
            const matches = this.normalizeLiveMatches(data);
            allMatches = [...allMatches, ...matches];
            logger.info(`Fetched ${matches.length} matches from ${leagueSlug}`);
          } catch (error) {
            logger.warn(`Failed to fetch from ${leagueSlug}: ${error instanceof Error ? error.message : String(error)}`);
            // Continue with other leagues even if one fails
          }
        }
      }
      
      // Filter matches for current date (Brazil timezone: UTC-3)
      const now = new Date();
      // Adjust to Brazil timezone (UTC-3)
      const brazilTime = new Date(now.getTime() - (3 * 60 * 60 * 1000));
      brazilTime.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(brazilTime);
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date(brazilTime);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const todayMatches = allMatches.filter(match => {
        const matchDate = new Date(match.startTime);
        // Include matches from yesterday to tomorrow to handle timezone differences
        return matchDate >= yesterday && matchDate < tomorrow;
      });
      
      const todayFormatted = brazilTime.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' });
      logger.info(`Filtrando jogos para: ${todayFormatted}`);
      logger.info(`Total matches: ${allMatches.length}, Today's matches: ${todayMatches.length}`);
      
      // Log status of today's matches for debugging
      todayMatches.forEach(match => {
        logger.info(`Match: ${match.homeTeam.name} vs ${match.awayTeam.name}, Status: ${match.status}, Clock: ${match.clock}`);
      });
      
      logger.info(`Normalized ${todayMatches.length} live matches for today`);
      
      this.setCache(cacheKey, todayMatches, CACHE_TTL.scoreboard);
      return todayMatches;
    } catch (error) {
      logger.error('Failed to fetch live matches', error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizeLiveMatches(data: { events: ESPNEvent[]; leagues: any[] }): LiveMatch[] {
    return data.events.map(event => {
      const competition = event.competitions[0];
      const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
      const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');

      const statusMap: Record<string, 'scheduled' | 'in_progress' | 'halftime' | 'final' | 'postponed' | 'cancelled'> = {
        'STATUS_SCHEDULED': 'scheduled',
        'STATUS_IN_PROGRESS': 'in_progress',
        'STATUS_HALFTIME': 'halftime',
        'STATUS_FINAL': 'final',
        'STATUS_FULL_TIME': 'final',
        'STATUS_POSTPONED': 'postponed',
        'STATUS_CANCELLED': 'cancelled',
        'STATUS_DELAYED': 'in_progress',
        'STATUS_SUSPENDED': 'in_progress',
        'STATUS_ABANDONED': 'postponed',
        'STATUS_FORFEIT': 'final',
        'STATUS_FIRST_HALF': 'in_progress',
        'STATUS_SECOND_HALF': 'in_progress',
        'STATUS_FINAL_PEN': 'final',
        'STATUS_AFTER_SHOOTOUT': 'final',
        'STATUS_AFTER_EXTRA_TIME': 'final',
      };

      const originalStatus = competition.status.type.name;
      const mappedStatus = statusMap[originalStatus] || 'scheduled';

      // Log status mapping for debugging
      if (mappedStatus === 'scheduled' && originalStatus !== 'STATUS_SCHEDULED') {
        logger.warn(`Unknown status mapped to scheduled: ${originalStatus} for match ${event.id}`);
      }

      return {
        eventId: event.id,
        league: data.leagues[0]?.slug || 'unknown',
        leagueName: data.leagues[0]?.name || 'Unknown',
        status: mappedStatus,
        clock: competition.status.displayClock || "0'",
        period: this.getPeriod(competition.status.type.id),
        homeTeam: {
          id: homeCompetitor?.team.id || '',
          name: homeCompetitor?.team.displayName || '',
          abbreviation: homeCompetitor?.team.abbreviation || '',
          logo: homeCompetitor?.team.logo || '',
          score: parseInt(homeCompetitor?.score || '0'),
          form: homeCompetitor?.form || '',
        },
        awayTeam: {
          id: awayCompetitor?.team.id || '',
          name: awayCompetitor?.team.displayName || '',
          abbreviation: awayCompetitor?.team.abbreviation || '',
          logo: awayCompetitor?.team.logo || '',
          score: parseInt(awayCompetitor?.score || '0'),
          form: awayCompetitor?.form || '',
        },
        startTime: new Date(event.date),
        venue: competition.venue
          ? {
              id: competition.venue.id,
              name: competition.venue.fullName,
              city: competition.venue.address.city,
              country: competition.venue.address.country,
            }
          : undefined,
      };
    });
  }

  private getPeriod(statusId: string): string {
    const periodMap: Record<string, string> = {
      '1': '1st Half',
      '2': '2nd Half',
      '3': 'Halftime',
      '4': 'Extra Time 1st',
      '5': 'Extra Time 2nd',
      '6': 'Penalties',
    };
    return periodMap[statusId] || 'Not Started';
  }

  async getMatchSummary(eventId: string, league: string): Promise<MatchStats> {
    const cacheKey = this.getCacheKey('summary', `${league}:${eventId}`);
    const cached = this.getFromCache<MatchStats>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/${league}/summary?event=${eventId}&lang=pt`;

    try {
      const data = await this.fetchWithRetry<ESPNSummary>(url);
      const stats = this.normalizeMatchStats(data, league);
      this.setCache(cacheKey, stats, CACHE_TTL.summary);
      return stats;
    } catch (error) {
      logger.error(`Failed to fetch match summary for ${eventId}`, error instanceof Error ? error : new Error(String(error)));
      throw error;
    }
  }

  private normalizeMatchStats(data: ESPNSummary, league: string): MatchStats {
    if (!data.competitions || data.competitions.length === 0) {
      logger.error(`No competitions data available for match ${data.header.id}`);
      throw new Error('No competitions data available');
    }

    const competition = data.competitions[0];
    
    if (!competition.competitors || competition.competitors.length === 0) {
      logger.error(`No competitors data available for match ${data.header.id}`);
      throw new Error('No competitors data available');
    }

    const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
    const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');

    if (!homeCompetitor || !awayCompetitor) {
      logger.error(`Missing home or away competitor for match ${data.header.id}`);
      throw new Error('Missing home or away competitor');
    }

    const homeStats = this.normalizeTeamStats(
      homeCompetitor,
      competition.competitors[0]?.statistics || [],
      true
    );
    const awayStats = this.normalizeTeamStats(
      awayCompetitor,
      competition.competitors[1]?.statistics || [],
      false
    );

    return {
      eventId: data.header.id,
      league,
      leagueName: league,
      status: 'in_progress', // Will be updated from scoreboard
      clock: '0',
      period: '1st Half',
      homeTeam: homeStats,
      awayTeam: awayStats,
      startTime: new Date(),
    };
  }

  private normalizeTeamStats(
    competitor: ESPNCompetitor,
    statistics: any[],
    isHome: boolean
  ): TeamStats {
    const getStatValue = (name: string): number => {
      const stat = statistics?.find(s => s.name === name);
      return stat ? parseFloat(stat.displayValue) || 0 : 0;
    };

    return {
      teamId: competitor.team.id,
      teamName: competitor.team.displayName,
      teamAbbreviation: competitor.team.abbreviation,
      teamLogo: competitor.team.logo,
      isHome,
      goals: parseInt(competitor.score || '0'),
      corners: getStatValue('cornerKicks'),
      shots: getStatValue('totalShots'),
      shotsOnTarget: getStatValue('shotsOnTarget'),
      possession: getStatValue('possessionPct'),
      yellowCards: getStatValue('yellowCards'),
      redCards: getStatValue('redCards'),
      fouls: getStatValue('foulsCommitted'),
      offsides: getStatValue('offsides'),
      passes: getStatValue('passes'),
      passesAccuracy: getStatValue('passAccuracy'),
      tackles: getStatValue('tackles'),
      interceptions: getStatValue('interceptions'),
      saves: getStatValue('saves'),
      form: competitor.form || '',
    };
  }

  async getPlayByPlay(eventId: string, league: string): Promise<PlayEvent[]> {
    const cacheKey = this.getCacheKey('plays', `${league}:${eventId}`);
    const cached = this.getFromCache<PlayEvent[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.coreUrl}/leagues/${league}/events/${eventId}/competitions/${eventId}/plays?limit=300`;

    try {
      const data = await this.fetchWithRetry<ESPNPlays>(url);
      const plays = this.normalizePlayEvents(data);
      this.setCache(cacheKey, plays, CACHE_TTL.plays);
      return plays;
    } catch (error) {
      logger.error(`Failed to fetch play-by-play for ${eventId}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizePlayEvents(data: ESPNPlays): PlayEvent[] {
    // Log first item for debugging
    if (data.items && data.items.length > 0) {
      logger.info(`First play event raw data:`, { rawData: JSON.stringify(data.items[0], null, 2) });
    }

    const typeMap: Record<number, PlayEvent['type']> = {
      1: 'goal',
      2: 'yellow_card',
      3: 'red_card',
      4: 'substitution',
      5: 'foul',
      6: 'corner',
      7: 'offside',
      8: 'shot',
      9: 'save',
      10: 'goal', // Penalty goal
      11: 'goal', // Own goal
      12: 'goal', // Free kick goal
      13: 'shot', // Free kick shot
      14: 'goal', // Header goal
      15: 'shot', // Header shot
    };

    return data.items.map(item => ({
      id: item.id,
      type: typeMap[item.type.id] || 'other',
      minute: item.clock,
      teamId: item.team.id,
      teamName: item.team.displayName,
      description: item.text,
      player: item.athlete?.displayName,
    }));
  }

  async getMatchSituation(eventId: string, league: string): Promise<ESPNSituation | null> {
    const cacheKey = this.getCacheKey('situation', `${league}:${eventId}`);
    const cached = this.getFromCache<ESPNSituation>(cacheKey);
    if (cached) return cached;

    const url = `${this.coreUrl}/leagues/${league}/events/${eventId}/competitions/${eventId}/situation`;

    try {
      const data = await this.fetchWithRetry<ESPNSituation>(url);
      this.setCache(cacheKey, data, CACHE_TTL.plays);
      return data;
    } catch (error) {
      logger.error(`Failed to fetch match situation for ${eventId}`, error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  async getStandings(league: string): Promise<StandingsEntry[]> {
    const cacheKey = this.getCacheKey('standings', league);
    const cached = this.getFromCache<StandingsEntry[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/${league}/standings?lang=pt`;

    try {
      const data = await this.fetchWithRetry<ESPNStandings>(url);
      const standings = this.normalizeStandings(data);
      this.setCache(cacheKey, standings, CACHE_TTL.standings);
      return standings;
    } catch (error) {
      logger.error(`Failed to fetch standings for ${league}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizeStandings(data: ESPNStandings): StandingsEntry[] {
    const entries = data.children[0]?.standings.entries || [];

    return entries.map(entry => {
      const getStat = (name: string): number => {
        const stat = entry.stats.find(s => s.name === name);
        return stat ? stat.value : 0;
      };

      return {
        rank: getStat('rank'),
        teamId: entry.team,
        teamName: entry.team,
        teamLogo: '',
        gamesPlayed: getStat('gamesPlayed'),
        wins: getStat('wins'),
        draws: getStat('ties'),
        losses: getStat('losses'),
        goalsFor: getStat('goalsFor') || getStat('totalGoals'),
        goalsAgainst: getStat('goalsAgainst') || getStat('goalsConceded'),
        goalDifference: getStat('pointDifferential'),
        points: getStat('points'),
      };
    });
  }

  async getTeams(league: string): Promise<Team[]> {
    const cacheKey = this.getCacheKey('teams', league);
    const cached = this.getFromCache<Team[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/${league}/teams?lang=pt`;

    try {
      const data = await this.fetchWithRetry<{ sports: any[] }>(url);
      const teams = this.normalizeTeams(data);
      this.setCache(cacheKey, teams, CACHE_TTL.teams);
      return teams;
    } catch (error) {
      logger.error(`Failed to fetch teams for ${league}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizeTeams(data: { sports: any[] }): Team[] {
    const teams = data.sports[0]?.leagues[0]?.teams || [];

    return teams.map((t: ESPNTeam) => ({
      id: t.team.id,
      name: t.team.displayName,
      abbreviation: t.team.abbreviation,
      location: t.team.location,
      logo: t.team.logo,
      color: t.team.color,
      alternateColor: t.team.alternateColor,
      slug: t.team.slug,
    }));
  }

  async getTeamRoster(league: string, teamId: string): Promise<Player[]> {
    const cacheKey = this.getCacheKey('roster', `${league}:${teamId}`);
    const cached = this.getFromCache<Player[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/${league}/teams/${teamId}/roster?lang=pt`;

    try {
      const data = await this.fetchWithRetry<ESPNRoster>(url);
      const roster = this.normalizeRoster(data);
      this.setCache(cacheKey, roster, CACHE_TTL.roster);
      return roster;
    } catch (error) {
      logger.error(`Failed to fetch roster for team ${teamId}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizeRoster(data: ESPNRoster): Player[] {
    return data.athletes.map(athlete => {
      const stats = athlete.statistics?.splits?.categories || [];
      const getStat = (category: string, name: string): number => {
        const cat = stats.find(c => c.name === category);
        const stat = cat?.stats.find(s => s.name === name);
        return stat ? stat.value : 0;
      };

      return {
        id: athlete.id,
        fullName: athlete.fullName,
        displayName: athlete.displayName,
        position: athlete.position.name,
        jersey: athlete.jersey,
        age: athlete.age,
        height: `${Math.floor(athlete.height / 12)}'${athlete.height % 12}"`,
        weight: `${athlete.weight} lbs`,
        citizenship: athlete.citizenship,
        status: athlete.status.type === 'active' ? 'active' : athlete.status.type === 'injured' ? 'injured' : 'suspended',
        statistics: {
          appearances: getStat('general', 'appearances'),
          goals: getStat('offensive', 'totalGoals'),
          assists: getStat('offensive', 'goalAssists'),
          yellowCards: getStat('general', 'yellowCards'),
          redCards: getStat('general', 'redCards'),
          shots: getStat('offensive', 'totalShots'),
          shotsOnTarget: getStat('offensive', 'shotsOnTarget'),
          passes: getStat('general', 'accuratePasses'),
          passesAccuracy: getStat('general', 'passAccuracy'),
          tackles: getStat('defensive', 'tackles'),
          interceptions: getStat('defensive', 'interceptions'),
          saves: getStat('goalKeeping', 'saves'),
          goalsConceded: getStat('goalKeeping', 'goalsConceded'),
        },
      };
    });
  }

  async getTeamSchedule(league: string, teamId: string): Promise<Match[]> {
    const cacheKey = this.getCacheKey('schedule', `${league}:${teamId}`);
    const cached = this.getFromCache<Match[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/${league}/teams/${teamId}/schedule?lang=pt`;

    try {
      const data = await this.fetchWithRetry<ESPNSchedule>(url);
      const schedule = this.normalizeSchedule(data);
      this.setCache(cacheKey, schedule, CACHE_TTL.schedule);
      return schedule;
    } catch (error) {
      logger.error(`Failed to fetch schedule for team ${teamId}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizeSchedule(data: ESPNSchedule): Match[] {
    return data.events.map(event => {
      const competition = event.competitions[0];
      const homeCompetitor = competition.competitors.find(c => c.homeAway === 'home');
      const awayCompetitor = competition.competitors.find(c => c.homeAway === 'away');

      return {
        eventId: event.id,
        league: 'unknown',
        leagueName: 'Unknown',
        status: 'scheduled',
        homeTeam: {
          id: homeCompetitor?.team.id || '',
          name: homeCompetitor?.team.displayName || '',
          abbreviation: homeCompetitor?.team.abbreviation || '',
          logo: homeCompetitor?.team.logo || '',
          score: parseInt(homeCompetitor?.score || '0'),
        },
        awayTeam: {
          id: awayCompetitor?.team.id || '',
          name: awayCompetitor?.team.displayName || '',
          abbreviation: awayCompetitor?.team.abbreviation || '',
          logo: awayCompetitor?.team.logo || '',
          score: parseInt(awayCompetitor?.score || '0'),
        },
        startTime: new Date(event.date),
        venue: competition.venue
          ? {
              id: 'unknown',
              name: competition.venue.fullName,
              city: competition.venue.address.city,
              country: competition.venue.address.country,
            }
          : undefined,
      };
    });
  }

  async getTeamInjuries(league: string, teamId: string): Promise<Injury[]> {
    const cacheKey = this.getCacheKey('injuries', `${league}:${teamId}`);
    const cached = this.getFromCache<Injury[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.baseUrl}/${league}/teams/${teamId}/injuries?lang=pt`;

    try {
      const data = await this.fetchWithRetry<any>(url);
      const injuries = this.normalizeInjuries(data);
      this.setCache(cacheKey, injuries, CACHE_TTL.injuries);
      return injuries;
    } catch (error) {
      logger.error(`Failed to fetch injuries for team ${teamId}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizeInjuries(data: any): Injury[] {
    // ESPN injuries endpoint returns empty object when no injuries
    if (!data.injuries || data.injuries.length === 0) {
      return [];
    }

    return data.injuries.map((injury: any) => ({
      playerId: injury.athlete?.id,
      playerName: injury.athlete?.displayName,
      injuryType: injury.injuryType,
      status: injury.status,
      estimatedReturn: injury.estimatedReturn ? new Date(injury.estimatedReturn) : undefined,
    }));
  }

  async getCalendar(league: string): Promise<CalendarEntry[]> {
    const cacheKey = this.getCacheKey('calendar', league);
    const cached = this.getFromCache<CalendarEntry[]>(cacheKey);
    if (cached) return cached;

    const url = `${this.coreUrl}/leagues/${league}/calendar`;

    try {
      const data = await this.fetchWithRetry<ESPNCalendar>(url);
      const calendar = this.normalizeCalendar(data);
      this.setCache(cacheKey, calendar, CACHE_TTL.calendar);
      return calendar;
    } catch (error) {
      logger.error(`Failed to fetch calendar for ${league}`, error instanceof Error ? error : new Error(String(error)));
      return [];
    }
  }

  private normalizeCalendar(_data: ESPNCalendar): CalendarEntry[] {
    // ESPN calendar returns references to sub-calendars
    // For now, return empty array as this endpoint needs further investigation
    return [];
  }
}
