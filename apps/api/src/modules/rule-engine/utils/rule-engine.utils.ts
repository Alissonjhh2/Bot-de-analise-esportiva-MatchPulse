import { MatchStats } from '../../match-simulator/types/match-simulator.types';
import { StrategyCondition, ConditionOperator } from '@prisma/client';

export function getStatValue(stats: MatchStats, indicator: string, team: string): number {
  const indicatorLower = indicator.toLowerCase();
  const teamLower = team.toLowerCase();

  switch (indicatorLower) {
    case 'goals':
      return teamLower === 'home' ? stats.goals_home : 
             teamLower === 'away' ? stats.goals_away : 
             stats.goals_home + stats.goals_away;
    
    case 'corners':
      return teamLower === 'home' ? stats.corners_home : 
             teamLower === 'away' ? stats.corners_away : 
             stats.corners_home + stats.corners_away;
    
    case 'dangerous_attacks':
      return teamLower === 'home' ? stats.dangerous_attacks_home : 
             teamLower === 'away' ? stats.dangerous_attacks_away : 
             stats.dangerous_attacks_home + stats.dangerous_attacks_away;
    
    case 'shots_on_goal':
      return teamLower === 'home' ? stats.shots_on_target_home : 
             teamLower === 'away' ? stats.shots_on_target_away : 
             stats.shots_on_target_home + stats.shots_on_target_away;
    
    case 'cards':
      return teamLower === 'home' ? stats.yellow_cards_home + stats.red_cards_home : 
             teamLower === 'away' ? stats.yellow_cards_away + stats.red_cards_away : 
             stats.yellow_cards_home + stats.yellow_cards_away + stats.red_cards_home + stats.red_cards_away;
    
    case 'fouls':
      return teamLower === 'home' ? stats.fouls_home : 
             teamLower === 'away' ? stats.fouls_away : 
             stats.fouls_home + stats.fouls_away;
    
    case 'offsides':
      return teamLower === 'home' ? stats.offsides_home : 
             teamLower === 'away' ? stats.offsides_away : 
             stats.offsides_home + stats.offsides_away;
    
    case 'ball_possession':
      return teamLower === 'home' ? stats.ball_possession_home : 
             teamLower === 'away' ? stats.ball_possession_away : 
             50; // For match, return average
    
    default:
      return 0;
  }
}

export function evaluateCondition(
  actualValue: number,
  expectedValue: number,
  operator: string
): boolean {
  const operatorLower = operator.toLowerCase();

  switch (operatorLower) {
    case 'more':
      return actualValue > expectedValue;
    case 'less':
      return actualValue < expectedValue;
    case 'any':
      return true;
    case 'equal':
      return actualValue === expectedValue;
    default:
      return false;
  }
}

export function isWithinTimeRange(
  currentMinute: number,
  startMinute: number,
  endMinute: number
): boolean {
  return currentMinute >= startMinute && currentMinute <= endMinute;
}
