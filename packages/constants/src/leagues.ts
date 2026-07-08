import { LeagueMapping } from '@matchpulse/types';

export const LEAGUE_MAPPINGS: LeagueMapping[] = [
  { name: 'Campeonato Brasileiro', slug: 'bra.1', region: 'BRA' },
  { name: 'Campeonato Brasileiro Série B', slug: 'bra.2', region: 'BRA' },
  { name: 'Série C do Brasil', slug: 'bra.3', region: 'BRA' },
  { name: 'Copa do Brasil', slug: 'bra.cup', region: 'BRA' },
  { name: 'Liga dos Campeões da UEFA', slug: 'uefa.champions', region: 'EUR' },
  { name: 'Liga Europa da UEFA', slug: 'uefa.europa', region: 'EUR' },
  { name: 'Copa do Mundo', slug: 'fifa.world', region: 'INT' },
  { name: 'CONMEBOL Libertadores', slug: 'conmebol.libertadores', region: 'SA' },
  { name: 'CONMEBOL Sul-Americana', slug: 'conmebol.sudamericana', region: 'SA' },
  { name: 'Premier League', slug: 'eng.1', region: 'ENG' },
  { name: 'LALIGA', slug: 'esp.1', region: 'ESP' },
  { name: 'Ligue 1', slug: 'fra.1', region: 'FRA' },
  { name: 'Bundesliga', slug: 'ger.1', region: 'GER' },
  { name: 'Série A', slug: 'ita.1', region: 'ITA' },
  { name: 'Copa das Nações da África', slug: 'caf.champions', region: 'AFR' },
  { name: 'Campeonato Chinês', slug: 'chn.1', region: 'CHN' },
  { name: 'Campeonato Português', slug: 'por.1', region: 'POR' },
  { name: 'Mundial Feminino', slug: 'fifa.womens_world', region: 'INT' },
  { name: 'Campeonato Paulista', slug: 'bra.paulista', region: 'BRA' },
  { name: 'Campeonato Carioca', slug: 'bra.carioca', region: 'BRA' },
  { name: 'Campeonato Gaúcho', slug: 'bra.gaucha', region: 'BRA' },
  { name: 'Campeonato Mineiro', slug: 'bra.mineiro', region: 'BRA' },
  { name: 'Copa do Nordeste', slug: 'bra.nordeste', region: 'BRA' },
  { name: 'Supercopa do Brasil', slug: 'bra.supercopa', region: 'BRA' },
  { name: 'Eliminatórias Eurocopa', slug: 'uefa.euro_qual', region: 'EUR' },
  { name: 'Copa São Paulo', slug: 'bra.copasp', region: 'BRA' },
  { name: 'Copa América', slug: 'conmebol.america', region: 'SA' },
  { name: 'Amistoso', slug: 'friendly', region: 'INT' },
  { name: 'Brasileiro - S20', slug: 'bra.s20', region: 'BRA' },
  { name: 'Copa do Brasil - S17', slug: 'bra.cup.s17', region: 'BRA' },
  { name: 'Copa do Brasil - S20', slug: 'bra.cup.s20', region: 'BRA' },
  { name: 'Pan-Americano - Futebol Feminino', slug: 'pan_american_womens', region: 'INT' },
];

export const DEFAULT_LEAGUE = 'bra.1';

export function getLeagueSlug(name: string): string | undefined {
  return LEAGUE_MAPPINGS.find(mapping => mapping.name === name)?.slug;
}

export function getLeagueName(slug: string): string | undefined {
  return LEAGUE_MAPPINGS.find(mapping => mapping.slug === slug)?.name;
}

export function getAllLeagues(): LeagueMapping[] {
  return LEAGUE_MAPPINGS;
}
