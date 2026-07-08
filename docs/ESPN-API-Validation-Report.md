# ESPN API Validation Report

**Generated:** 2026-07-08T00:19:01.245Z

## Summary

| Metric | Count |
|--------|-------|
| Total Endpoints | 11 |
| ✅ Approved | 10 |
| ❌ Failed | 1 |
| ⚠️ Needs Investigation | 0 |

## ✅ Approved Endpoints

| Endpoint | Status | Response Time |
|----------|--------|---------------|
| 1. Scoreboard - Placar ao Vivo | 200 | 441ms |
| 2. Summary - Resumo Completo da Partida | 200 | 564ms |
| 3. Play-by-Play - Eventos da Partida | 200 | 499ms |
| 4. Teams - Lista de Times da Liga | 200 | 100ms |
| 5. Team Roster - Escalação do Time | 200 | 258ms |
| 6. Standings - Classificação da Liga | 200 | 654ms |
| 7. Calendar - Calendário da Temporada | 200 | 93ms |
| 8. Team Schedule - Calendário de um Time | 200 | 218ms |
| 9. Team Injuries - Relatório de Lesões | 200 | 80ms |
| 10. Live Match Situation - Situação da Partida | 200 | 95ms |

## ❌ Failed Endpoints

| Endpoint | HTTP Status | Error |
|----------|-------------|-------|
| 11. Match Statistics - Estatísticas Detalhadas | 400 | HTTP 400: Bad Request |

## Detailed Results

### ✅ 1. Scoreboard - Placar ao Vivo

**URL:** `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?lang=pt`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 441ms

**Expected Fields:** leagues, events

### ✅ 2. Summary - Resumo Completo da Partida

**URL:** `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/summary?event=401841149&lang=pt`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 564ms

**Expected Fields:** boxscore, leaders, standings

### ✅ 3. Play-by-Play - Eventos da Partida

**URL:** `https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/events/401841149/competitions/401841149/plays?limit=300`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 499ms

**Expected Fields:** items, count

### ✅ 4. Teams - Lista de Times da Liga

**URL:** `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams?lang=pt`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 100ms

**Expected Fields:** sports

### ✅ 5. Team Roster - Escalação do Time

**URL:** `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams/6086/roster?lang=pt`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 258ms

**Expected Fields:** athletes, team

### ✅ 6. Standings - Classificação da Liga

**URL:** `https://site.api.espn.com/apis/v2/sports/soccer/bra.1/standings?lang=pt`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 654ms

**Expected Fields:** season, children

### ✅ 7. Calendar - Calendário da Temporada

**URL:** `https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/calendar`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 93ms

**Expected Fields:** items, count

### ✅ 8. Team Schedule - Calendário de um Time

**URL:** `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams/6086/schedule?lang=pt`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 218ms

**Expected Fields:** events

### ✅ 9. Team Injuries - Relatório de Lesões

**URL:** `https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams/6086/injuries?lang=pt`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 80ms

**Expected Fields:** 

### ✅ 10. Live Match Situation - Situação da Partida

**URL:** `https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/events/401841149/competitions/401841149/situation`

**Status:** APPROVED

**HTTP Status:** 200

**Response Time:** 95ms

**Expected Fields:** $ref

### ❌ 11. Match Statistics - Estatísticas Detalhadas

**URL:** `https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/events/401841149/competitions/401841149/statistics`

**Status:** FAILED

**HTTP Status:** 400

**Response Time:** 99ms

**Expected Fields:** 

**Error:** HTTP 400: Bad Request
