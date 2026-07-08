# ESPN Brasil API - Especificação Técnica para Integração MatchPulse

## Visão Geral

A ESPN disponibiliza uma API pública não oficial utilizada para alimentar seus sites e aplicativos. Esta API fornece dados em tempo real de partidas de futebol, incluindo placares, estatísticas, escalações e muito mais.

### Domínios da API

- **Site API**: `site.api.espn.com` - Dados amigáveis ao usuário (scores, news, teams, standings)
- **Core API**: `sports.core.api.espn.com` - Dados detalhados (athletes, stats, odds, play-by-play)
- **CDN**: `cdn.espn.com` - Dados otimizados para CDN

### Suporte a Idioma

A API suporta o parâmetro `lang=pt` para retornar dados em português brasileiro.

---

## Endpoints Principais

### 1. Scoreboard - Placar ao Vivo

#### Endpoint
```
GET https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/scoreboard
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1` para Brasileirão Série A)
- `lang` (opcional): Idioma da resposta (ex: `pt` para português)
- `dates` (opcional): Data específica no formato YYYYMMDD
- `limit` (opcional): Limite de resultados

#### Exemplo de Uso
```bash
# Brasileirão Série A hoje
curl "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?lang=pt"

# Brasileirão Série A em data específica
curl "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/scoreboard?lang=pt&dates=20260716"
```

#### Resposta
```json
{
  "leagues": [
    {
      "id": "630",
      "name": "Campeonato Brasileiro",
      "abbreviation": "Série A",
      "slug": "bra.1",
      "season": {
        "year": 2026,
        "displayName": "2026 Campeonato Brasileiro"
      },
      "calendar": ["2026-07-16T08:00Z", "2026-07-17T08:00Z"]
    }
  ],
  "events": [
    {
      "id": "401841149",
      "date": "2026-07-16T22:30Z",
      "name": "Santos em Botafogo",
      "shortName": "SAN @ BOT",
      "competitions": [
        {
          "id": "401841149",
          "status": {
            "type": {
              "id": "1",
              "name": "STATUS_SCHEDULED",
              "state": "pre"
            },
            "displayClock": "0'"
          },
          "venue": {
            "id": "10707",
            "fullName": "Joao Havelange Stadium",
            "address": {
              "city": "Rio de Janeiro",
              "country": "Brasil"
            }
          },
          "competitors": [
            {
              "id": "6086",
              "homeAway": "home",
              "team": {
                "id": "6086",
                "displayName": "Botafogo",
                "abbreviation": "BOT",
                "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/6086.png"
              },
              "score": "0",
              "form": "DVEVV",
              "statistics": []
            },
            {
              "id": "2674",
              "homeAway": "away",
              "team": {
                "id": "2674",
                "displayName": "Santos",
                "abbreviation": "SAN",
                "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/2674.png"
              },
              "score": "0",
              "form": "VVDED",
              "statistics": []
            }
          ]
        }
      ]
    }
  ]
}
```

#### Dados Disponíveis
- Informações da liga e temporada
- Lista de partidas (events)
- Status da partida (scheduled, in_progress, completed)
- Placar atual
- Estádion e localização
- Times participantes com logos
- Forma recente dos times (últimos 5 jogos)
- Link para estatísticas e resumo

---

### 2. Summary - Resumo Completo da Partida

#### Endpoint
```
GET https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/summary?event={eventId}
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `event` (obrigatório): ID da partida (obtido do scoreboard)
- `lang` (opcional): Idioma da resposta

#### Exemplo de Uso
```bash
curl "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/summary?event=401841149&lang=pt"
```

#### Resposta
```json
{
  "header": {
    "id": "401841149",
    "season": {
      "year": 2026,
      "name": "2026 Brasileiro Serie A"
    }
  },
  "competitions": [
    {
      "id": "401841149",
      "date": "2026-07-16T22:30Z",
      "status": {
        "type": {
          "id": "1",
          "name": "STATUS_SCHEDULED"
        }
      },
      "competitors": [
        {
          "id": "6086",
          "homeAway": "home",
          "team": {
            "displayName": "Botafogo",
            "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/6086.png"
          },
          "record": [
            {
              "type": "total",
              "summary": "6-4-7",
              "displayValue": "6-4-7"
            }
          ],
          "statistics": [
            {
              "name": "goalDifference",
              "displayValue": "0",
              "label": "Goal Difference"
            },
            {
              "name": "totalGoals",
              "displayValue": "31",
              "label": "Total Goals"
            }
          ]
        }
      ]
    }
  ],
  "boxscore": {
    "form": [
      {
        "team": {
          "displayName": "Botafogo"
        },
        "events": [
          {
            "id": "401841146",
            "gameDate": "2026-05-30T20:30Z",
            "score": "2-1",
            "gameResult": "L"
          }
        ]
      }
    ],
    "teams": [
      {
        "team": {
          "displayName": "Botafogo"
        },
        "statistics": [
          {
            "name": "goalDifference",
            "displayValue": "0"
          }
        ]
      }
    ]
  },
  "leaders": [
    {
      "team": {
        "displayName": "Botafogo"
      },
      "leaders": [
        {
          "name": "goalsLeaders",
          "displayName": "Goals",
          "leaders": [
            {
              "displayValue": "Matches: 15, Goals: 7",
              "athlete": {
                "id": "224103",
                "displayName": "Arthur Cabral",
                "jersey": "19",
                "position": {
                  "name": "Forward",
                  "abbreviation": "F"
                }
              },
              "statistics": [
                {
                  "name": "totalGoals",
                  "value": 7.0,
                  "displayValue": "7"
                }
              ]
            }
          ]
        }
      ]
    }
  ],
  "standings": {
    "header": "Brazilian Serie A Standings",
    "groups": [
      {
        "standings": {
          "entries": [
            {
              "team": "Palmeiras",
              "stats": [
                {
                  "name": "gamesPlayed",
                  "value": 18.0,
                  "displayValue": "18"
                },
                {
                  "name": "points",
                  "value": 41.0,
                  "displayValue": "41"
                },
                {
                  "name": "rank",
                  "value": 1.0,
                  "displayValue": "1"
                }
              ]
            }
          ]
        }
      }
    ]
  }
}
```

#### Dados Disponíveis
- Resumo completo da partida
- Estatísticas dos times na partida
- Forma recente (últimos 5 jogos)
- Artilheiros e líderes da partida
- Classificação atual da liga
- Histórico head-to-head
- Notícias relacionadas

---

### 3. Play-by-Play - Eventos da Partida em Tempo Real

#### Endpoint
```
GET https://sports.core.api.espn.com/v2/sports/soccer/leagues/{league}/events/{eventId}/competitions/{competitionId}/plays
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `eventId` (obrigatório): ID da partida
- `competitionId` (obrigatório): ID da competição (geralmente igual ao eventId)
- `limit` (opcional): Limite de eventos (padrão: 25)

#### Exemplo de Uso
```bash
curl "https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/events/401841149/competitions/401841149/plays?limit=300"
```

#### Resposta
```json
{
  "$ref": "http://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/events/401841149/competitions/401841149/plays?source=38&lang=en&region=us",
  "count": 0,
  "pageIndex": 0,
  "pageSize": 25,
  "pageCount": 0,
  "items": []
}
```

**Nota**: Para partidas não iniciadas, o array de itens estará vazio. Durante a partida, conterá:
- Gols
- Cartões amarelos e vermelhos
- Substituições
- Faltas
- Escanteios
- Outros eventos relevantes

#### Dados Disponíveis (durante partida)
- Tipo de evento (goal, card, substitution, etc.)
- Minuto do evento
- Jogador envolvido
- Time do jogador
- Descrição do evento

---

### 4. Teams - Lista de Times da Liga

#### Endpoint
```
GET https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/teams
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `lang` (opcional): Idioma da resposta

#### Exemplo de Uso
```bash
curl "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams?lang=pt"
```

#### Resposta
```json
{
  "sports": [
    {
      "id": "600",
      "leagues": [
        {
          "id": "630",
          "name": "Brazilian Serie A",
          "abbreviation": "Brazil Serie A",
          "slug": "bra.1",
          "season": {
            "year": 2026,
            "displayName": "2026"
          },
          "teams": [
            {
              "team": {
                "id": "6086",
                "displayName": "Botafogo",
                "abbreviation": "BOT",
                "location": "Botafogo",
                "color": "000000",
                "alternateColor": "fafafc",
                "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/6086.png",
                "slug": "bra.botafogo",
                "uid": "s:600~t:6086"
              },
              "links": [
                {
                  "rel": ["clubhouse", "desktop", "team"],
                  "href": "https://www.espn.com/soccer/club/_/id/6086/botafogo",
                  "text": "Clubhouse"
                }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

#### Dados Disponíveis
- Lista completa de times da liga
- ID, nome, abreviação do time
- Cores do time
- Logo em alta resolução
- Links para páginas do time

---

### 5. Team Roster - Escalação do Time

#### Endpoint
```
GET https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/teams/{teamId}/roster
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `teamId` (obrigatório): ID do time (ex: `6086` para Botafogo)
- `lang` (opcional): Idioma da resposta

#### Exemplo de Uso
```bash
curl "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams/6086/roster?lang=pt"
```

#### Resposta
```json
{
  "timestamp": "2026-07-08T00:00:05Z",
  "status": "success",
  "season": {
    "year": 2026,
    "displayName": "2026 Futebol Brasileiro",
    "type": 13907,
    "name": "2026 Brasileiro Serie A"
  },
  "athletes": [
    {
      "id": "304659",
      "uid": "s:600~a:304659",
      "firstName": "Matheus",
      "lastName": "Nascimento",
      "fullName": "Matheus Nascimento",
      "displayName": "Matheus Nascimento",
      "weight": 168.0,
      "displayWeight": "168 lbs",
      "height": 72.0,
      "displayHeight": "6' 0\"",
      "age": 22,
      "dateOfBirth": "2004-03-03T08:00Z",
      "gender": "MALE",
      "position": {
        "id": "19",
        "name": "Forward",
        "displayName": "Forward",
        "abbreviation": "F"
      },
      "jersey": null,
      "citizenship": "Brazil",
      "citizenshipCountry": {
        "alternateId": "20",
        "abbreviation": "BRA"
      },
      "flag": {
        "href": "https://a.espncdn.com/i/teamlogos/countries/500/bra.png",
        "alt": "Brazil"
      },
      "injuries": [],
      "status": {
        "id": "1",
        "name": "Active",
        "type": "active",
        "abbreviation": "Active"
      },
      "statistics": {
        "splits": {
          "id": "0",
          "name": "Total",
          "abbreviation": "Total",
          "type": "total",
          "categories": [
            {
              "name": "general",
              "displayName": "General",
              "stats": [
                {
                  "name": "appearances",
                  "displayName": "Appearances",
                  "value": 0.0,
                  "displayValue": "0"
                },
                {
                  "name": "yellowCards",
                  "displayName": "Yellow Cards",
                  "value": 0.0,
                  "displayValue": "0"
                }
              ]
            },
            {
              "name": "offensive",
              "displayName": "Offensive",
              "stats": [
                {
                  "name": "totalGoals",
                  "displayName": "Total Goals",
                  "value": 0.0,
                  "displayValue": "0"
                },
                {
                  "name": "goalAssists",
                  "displayName": "Assists",
                  "value": 0.0,
                  "displayValue": "0"
                }
              ]
            }
          ]
        }
      }
    }
  ],
  "team": {
    "id": "6086",
    "abbreviation": "BOT",
    "location": "Botafogo",
    "name": "Botafogo",
    "displayName": "Botafogo",
    "clubhouse": "https://www.espn.com/soccer/club/_/id/6086/botafogo",
    "color": "000000",
    "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/6086.png",
    "recordSummary": "6-4-7",
    "seasonSummary": "2026",
    "standingSummary": "12th in Brazilian Serie A"
  }
}
```

#### Dados Disponíveis
- Lista completa de jogadores do time
- Informações pessoais (nome, idade, data de nascimento)
- Posição e número da camisa
- Nacionalidade
- Estatísticas da temporada
- Lesões
- Status (ativo, lesionado, etc.)

---

### 6. Standings - Classificação da Liga

#### Endpoint
```
GET https://site.api.espn.com/apis/v2/sports/soccer/{league}/standings
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `lang` (opcional): Idioma da resposta

#### Exemplo de Uso
```bash
curl "https://site.api.espn.com/apis/v2/sports/soccer/bra.1/standings?lang=pt"
```

#### Resposta
```json
{
  "season": {
    "year": 2026,
    "displayName": "2026",
    "type": 2
  },
  "children": [
    {
      "id": "0",
      "name": "Brazilian Serie A",
      "abbreviation": "BRA",
      "shortName": "Brazil Serie A",
      "standings": {
        "entries": [
          {
            "team": {
              "id": "2029",
              "uid": "s:600~t:2029",
              "location": "Palmeiras",
              "name": "Palmeiras",
              "abbreviation": "PAL",
              "displayName": "Palmeiras",
              "logo": "https://a.espncdn.com/i/teamlogos/soccer/500/2029.png"
            },
            "stats": [
              {
                "name": "gamesPlayed",
                "value": 18.0,
                "displayValue": "18"
              },
              {
                "name": "wins",
                "value": 12.0,
                "displayValue": "12"
              },
              {
                "name": "losses",
                "value": 1.0,
                "displayValue": "1"
              },
              {
                "name": "ties",
                "value": 5.0,
                "displayValue": "5"
              },
              {
                "name": "points",
                "value": 41.0,
                "displayValue": "41"
              },
              {
                "name": "pointDifferential",
                "value": 17.0,
                "displayValue": "+17"
              },
              {
                "name": "rank",
                "value": 1.0,
                "displayValue": "1"
              }
            ]
          }
        ]
      }
    }
  ]
}
```

#### Dados Disponíveis
- Classificação completa da liga
- Pontos, vitórias, empates, derrotas
- Saldo de gols
- Jogos disputados
- Posição na tabela

---

### 7. Calendar - Calendário da Temporada

#### Endpoint
```
GET https://sports.core.api.espn.com/v2/sports/soccer/leagues/{league}/calendar
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `dates` (opcional): Filtro de datas
- `weeks` (opcional): Filtro de semanas
- `seasontype` (opcional): Tipo de temporada (regular, postseason)

#### Exemplo de Uso
```bash
curl "https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/calendar"
```

#### Resposta
```json
{
  "leagues": [
    {
      "id": "630",
      "name": "Campeonato Brasileiro",
      "calendar": [
        "2026-01-28T08:00Z",
        "2026-01-29T08:00Z",
        "2026-02-04T08:00Z",
        "2026-02-05T08:00Z"
      ]
    }
  ]
}
```

#### Dados Disponíveis
- Datas de jogos da temporada
- Estrutura por semanas
- Tipos de temporada (regular, playoffs)

---

### 8. Team Schedule - Calendário de um Time

#### Endpoint
```
GET https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/teams/{teamId}/schedule
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `teamId` (obrigatório): ID do time
- `lang` (opcional): Idioma da resposta

#### Exemplo de Uso
```bash
curl "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams/6086/schedule?lang=pt"
```

#### Dados Disponíveis
- Próximos jogos do time
- Jogos anteriores
- Resultados
- Horários e locais

---

### 9. Team Injuries - Relatório de Lesões

#### Endpoint
```
GET https://site.api.espn.com/apis/site/v2/sports/soccer/{league}/teams/{teamId}/injuries
```

#### Parâmetros
- `league` (obrigatório): Slug da liga (ex: `bra.1`)
- `teamId` (obrigatório): ID do time
- `lang` (opcional): Idioma da resposta

#### Exemplo de Uso
```bash
curl "https://site.api.espn.com/apis/site/v2/sports/soccer/bra.1/teams/6086/injuries?lang=pt"
```

#### Dados Disponíveis
- Jogadores lesionados
- Tipo de lesão
- Tempo estimado de recuperação
- Status do jogador

---

### 10. Live Match Situation - Situação da Partida em Tempo Real

#### Endpoint
```
GET https://sports.core.api.espn.com/v2/sports/soccer/leagues/{league}/events/{eventId}/competitions/{competitionId}/situation
```

#### Parâmetros
- `league` (obrigatório): Slug da liga
- `eventId` (obrigatório): ID da partida
- `competitionId` (obrigatório): ID da competição

#### Exemplo de Uso
```bash
curl "https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/events/401841149/competitions/401841149/situation"
```

#### Dados Disponíveis
- Posse de bola
- Minuto atual
- Situação do jogo
- Contexto em tempo real

---

### 11. Match Statistics - Estatísticas Detalhadas da Partida

#### Endpoint
```
GET https://sports.core.api.espn.com/v2/sports/soccer/leagues/{league}/events/{eventId}/competitions/{competitionId}/statistics
```

#### Parâmetros
- `league` (obrigatório): Slug da liga
- `eventId` (obrigatório): ID da partida
- `competitionId` (obrigatório): ID da competição

#### Exemplo de Uso
```bash
curl "https://sports.core.api.espn.com/v2/sports/soccer/leagues/bra.1/events/401841149/competitions/401841149/statistics"
```

#### Dados Disponíveis
- Estatísticas ofensivas (chutes, posse, passes)
- Estatísticas defensivas (desarmes, interceptações)
- Estatísticas de goleiro (defesas, gols sofridos)
- Estatísticas por jogador

**Nota:** Este endpoint retorna HTTP 400 para partidas não iniciadas ou finalizadas. Funciona apenas para partidas em andamento (STATUS_IN_PROGRESS). Para estatísticas de partidas finalizadas, use o endpoint **Summary**.

---

## Ligas Disponíveis

### Brasil
- **Brasileirão Série A**: `bra.1`
- **Brasileirão Série B**: `bra.2`
- **Copa do Brasil**: `bra.cup`
- **Copa Sudamericana**: `conmebol.sudamericana`
- **Libertadores**: `conmebol.libertadores`

### Europa
- **Premier League**: `eng.1`
- **La Liga**: `esp.1`
- **Bundesliga**: `ger.1`
- **Serie A**: `ita.1`
- **Ligue 1**: `fra.1`
- **UEFA Champions League**: `uefa.champions`
- **UEFA Europa League**: `uefa.europa`

### América do Sul
- **Argentina Primera División**: `arg.1`
- **Colombia Liga BetPlay**: `col.1`
- **Chile Primera División**: `chi.1`

### Outras
- **MLS**: `usa.1`
- **Liga MX**: `mex.1`
- **FIFA World Cup**: `fifa.world`

---

## Mapeamento para MatchPulse

### Estratégia de Integração

#### 1. Substituição do MatchSimulator
- Utilizar o endpoint **Scoreboard** para obter partidas reais em tempo real
- Substituir dados simulados por dados reais da ESPN

#### 2. Dados de Estatísticas
- Mapear estatísticas do scoreboard para o formato MatchStats:
  - `goals_home`/`goals_away` → `competitors[].score`
  - `corners_home`/`corners_away` → `competitors[].statistics` (corner kicks)
  - `dangerous_attacks_home`/`dangerous_attacks_away` → `competitors[].statistics`
  - `shots_on_target_home`/`shots_on_target_away` → `competitors[].statistics`
  - `fouls_home`/`fouls_away` → `competitors[].statistics`
  - `offsides_home`/`offsides_away` → `competitors[].statistics`
  - `ball_possession_home`/`ball_possession_away` → `competitors[].statistics`

#### 3. Escalações
- Utilizar o endpoint **Team Roster** para obter escalações
- Mapear para estrutura de jogadores do MatchPulse

#### 4. Play-by-Play
- Utilizar o endpoint **Plays** para eventos em tempo real
- Mapear gols, cartões, substituições para notificações

#### 5. Calendário
- Utilizar o endpoint **Calendar** para agendar partidas
- Criar jobs para monitoramento de partidas específicas

### Considerações Importantes

#### Rate Limiting
- A API não tem documentação oficial sobre rate limiting
- Recomendado implementar cache e polling intervalado (ex: 30-60 segundos)
- Evitar requisições excessivas para não ser bloqueado

#### Autenticação
- Não requer autenticação
- Acesso público via HTTP/HTTPS

#### Idioma
- Utilizar `lang=pt` para dados em português brasileiro
- Nomes de times e competições em português

#### Timezone
- Datas em UTC
- Converter para timezone local (America/Sao_Paulo)

#### Disponibilidade
- API não oficial, pode sofrer alterações sem aviso
- Implementar fallback para dados simulados em caso de falha

#### Status da Partida
- `STATUS_SCHEDULED`: Partida não iniciada
- `STATUS_IN_PROGRESS`: Partida em andamento
- `STATUS_HALFTIME`: Intervalo
- `STATUS_FINAL`: Partida finalizada
- `STATUS_POSTPONED`: Partida adiada
- `STATUS_CANCELLED`: Partida cancelada

---

## Exemplo de Fluxo de Integração

### 1. Obter Partidas do Dia
```typescript
async function getTodayMatches(league: string) {
  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/scoreboard?lang=pt`
  );
  const data = await response.json();
  return data.events;
}
```

### 2. Obter Estatísticas da Partida
```typescript
async function getMatchStats(league: string, eventId: string) {
  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/summary?event=${eventId}&lang=pt`
  );
  const data = await response.json();
  return data.competitions[0].competitors;
}
```

### 3. Obter Escalação do Time
```typescript
async function getTeamRoster(league: string, teamId: string) {
  const response = await fetch(
    `https://site.api.espn.com/apis/site/v2/sports/soccer/${league}/teams/${teamId}/roster?lang=pt`
  );
  const data = await response.json();
  return data.athletes;
}
```

### 4. Obter Play-by-Play
```typescript
async function getPlayByPlay(league: string, eventId: string) {
  const response = await fetch(
    `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${league}/events/${eventId}/competitions/${eventId}/plays?limit=300`
  );
  const data = await response.json();
  return data.items;
}
```

---

## Limitações e Restrições

1. **API Não Oficial**: Não há documentação oficial da ESPN, pode mudar sem aviso
2. **Sem SLA**: Não há garantia de disponibilidade ou uptime
3. **Rate Limiting Desconhecido**: Limites não documentados, usar com moderação
4. **Dados Incompletos**: Algumas estatísticas podem não estar disponíveis para todas as ligas
5. **Play-by-Play**: Disponível apenas durante partidas ao vivo
6. **Escalações**: Pode não incluir escalações confirmadas antes do jogo

---

## Recomendações para Implementação

1. **Cache**: Implementar cache de 30-60 segundos para reduzir requisições
2. **Fallback**: Manter simulador como fallback em caso de falha da API
3. **Monitoramento**: Implementar health checks para detectar falhas da API
4. **Logging**: Registrar todas as requisições e respostas para debugging
5. **Retry**: Implementar retry com exponential backoff para falhas temporárias
6. **Validação**: Validar estrutura dos dados antes de processar
7. **Timezone**: Converter todas as datas para timezone local consistente
8. **Normalização**: Normalizar nomes de times e competições para consistência

---

## Conclusão

A API da ESPN fornece dados abrangentes de futebol que podem substituir completamente o simulador atual do MatchPulse. A integração permitirá:

- Dados reais em tempo real
- Estatísticas precisas de partidas
- Escalações atualizadas
- Play-by-play detalhado
- Suporte a múltiplas ligas internacionais

A implementação deve ser feita gradualmente, começando com o scoreboard e expandindo para outros endpoints conforme necessário.
