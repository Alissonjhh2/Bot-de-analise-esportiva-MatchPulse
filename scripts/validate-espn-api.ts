import { writeFileSync } from 'fs';

// Types for the validation results
interface EndpointTest {
  name: string;
  url: string;
  status: 'approved' | 'failed' | 'needs_investigation';
  httpStatus?: number;
  responseTime: number;
  expectedFields: string[];
  missingFields: string[];
  error?: string;
}

interface ValidationReport {
  timestamp: string;
  summary: {
    total: number;
    approved: number;
    failed: number;
    needsInvestigation: number;
  };
  results: EndpointTest[];
}

// Configuration
const LEAGUE = 'bra.1';
const TEAM_ID = '6086'; // Botafogo
const EVENT_ID = '401841149'; // Example match ID
const COMPETITION_ID = '401841149';

// Endpoints to test
const endpoints = [
  {
    name: '1. Scoreboard - Placar ao Vivo',
    url: `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE}/scoreboard?lang=pt`,
    expectedFields: ['leagues', 'events'],
  },
  {
    name: '2. Summary - Resumo Completo da Partida',
    url: `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE}/summary?event=${EVENT_ID}&lang=pt`,
    expectedFields: ['boxscore', 'leaders', 'standings'],
  },
  {
    name: '3. Play-by-Play - Eventos da Partida',
    url: `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${LEAGUE}/events/${EVENT_ID}/competitions/${COMPETITION_ID}/plays?limit=300`,
    expectedFields: ['items', 'count'],
  },
  {
    name: '4. Teams - Lista de Times da Liga',
    url: `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE}/teams?lang=pt`,
    expectedFields: ['sports'],
  },
  {
    name: '5. Team Roster - Escalação do Time',
    url: `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE}/teams/${TEAM_ID}/roster?lang=pt`,
    expectedFields: ['athletes', 'team'],
  },
  {
    name: '6. Standings - Classificação da Liga',
    url: `https://site.api.espn.com/apis/v2/sports/soccer/${LEAGUE}/standings?lang=pt`,
    expectedFields: ['season', 'children'],
  },
  {
    name: '7. Calendar - Calendário da Temporada',
    url: `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${LEAGUE}/calendar`,
    expectedFields: ['items', 'count'],
  },
  {
    name: '8. Team Schedule - Calendário de um Time',
    url: `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE}/teams/${TEAM_ID}/schedule?lang=pt`,
    expectedFields: ['events'],
  },
  {
    name: '9. Team Injuries - Relatório de Lesões',
    url: `https://site.api.espn.com/apis/site/v2/sports/soccer/${LEAGUE}/teams/${TEAM_ID}/injuries?lang=pt`,
    expectedFields: [], // Empty response when no injuries
  },
  {
    name: '10. Live Match Situation - Situação da Partida',
    url: `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${LEAGUE}/events/${EVENT_ID}/competitions/${COMPETITION_ID}/situation`,
    expectedFields: ['$ref'], // Returns reference only, not actual data
  },
  {
    name: '11. Match Statistics - Estatísticas Detalhadas',
    url: `https://sports.core.api.espn.com/v2/sports/soccer/leagues/${LEAGUE}/events/${EVENT_ID}/competitions/${COMPETITION_ID}/statistics`,
    expectedFields: [], // Returns 400 for non-live matches
  },
];

// Helper function to check if object has nested field
function hasField(obj: any, field: string): boolean {
  const keys = field.split('.');
  let current = obj;
  
  for (const key of keys) {
    if (current == null || typeof current !== 'object') {
      return false;
    }
    if (!Object.prototype.hasOwnProperty.call(current, key)) {
      return false;
    }
    current = current[key];
  }
  
  return true;
}

// Helper function to check if object has any of the expected fields
function hasAnyField(obj: any, fields: string[]): boolean {
  return fields.some(field => hasField(obj, field));
}

// Test a single endpoint
async function testEndpoint(endpoint: typeof endpoints[0]): Promise<EndpointTest> {
  const startTime = Date.now();
  const result: EndpointTest = {
    name: endpoint.name,
    url: endpoint.url,
    status: 'needs_investigation',
    responseTime: 0,
    expectedFields: endpoint.expectedFields,
    missingFields: [],
  };

  try {
    const response = await fetch(endpoint.url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
    });

    result.httpStatus = response.status;
    result.responseTime = Date.now() - startTime;

    if (!response.ok) {
      result.status = 'failed';
      result.error = `HTTP ${response.status}: ${response.statusText}`;
      return result;
    }

    const data = await response.json();

    // Check for expected fields
    const missingFields = endpoint.expectedFields.filter(field => !hasField(data, field));
    result.missingFields = missingFields;

    // If no expected fields (empty array), approve if response is valid JSON
    if (endpoint.expectedFields.length === 0) {
      result.status = 'approved';
    } else if (missingFields.length === 0) {
      result.status = 'approved';
    } else if (hasAnyField(data, endpoint.expectedFields)) {
      result.status = 'needs_investigation';
      result.error = `Missing fields: ${missingFields.join(', ')}`;
    } else {
      result.status = 'failed';
      result.error = `None of expected fields found: ${endpoint.expectedFields.join(', ')}`;
    }
  } catch (error) {
    result.responseTime = Date.now() - startTime;
    result.status = 'failed';
    result.error = error instanceof Error ? error.message : String(error);
  }

  return result;
}

// Generate Markdown report
function generateReport(results: ValidationReport): string {
  const lines: string[] = [];

  lines.push('# ESPN API Validation Report');
  lines.push('');
  lines.push(`**Generated:** ${results.timestamp}`);
  lines.push('');
  lines.push('## Summary');
  lines.push('');
  lines.push('| Metric | Count |');
  lines.push('|--------|-------|');
  lines.push(`| Total Endpoints | ${results.summary.total} |`);
  lines.push(`| ✅ Approved | ${results.summary.approved} |`);
  lines.push(`| ❌ Failed | ${results.summary.failed} |`);
  lines.push(`| ⚠️ Needs Investigation | ${results.summary.needsInvestigation} |`);
  lines.push('');

  // Approved endpoints
  const approved = results.results.filter(r => r.status === 'approved');
  if (approved.length > 0) {
    lines.push('## ✅ Approved Endpoints');
    lines.push('');
    lines.push('| Endpoint | Status | Response Time |');
    lines.push('|----------|--------|---------------|');
    for (const result of approved) {
      lines.push(`| ${result.name} | ${result.httpStatus} | ${result.responseTime}ms |`);
    }
    lines.push('');
  }

  // Failed endpoints
  const failed = results.results.filter(r => r.status === 'failed');
  if (failed.length > 0) {
    lines.push('## ❌ Failed Endpoints');
    lines.push('');
    lines.push('| Endpoint | HTTP Status | Error |');
    lines.push('|----------|-------------|-------|');
    for (const result of failed) {
      lines.push(`| ${result.name} | ${result.httpStatus || 'N/A'} | ${result.error || 'Unknown'} |`);
    }
    lines.push('');
  }

  // Needs investigation
  const needsInvestigation = results.results.filter(r => r.status === 'needs_investigation');
  if (needsInvestigation.length > 0) {
    lines.push('## ⚠️ Needs Investigation');
    lines.push('');
    lines.push('| Endpoint | HTTP Status | Response Time | Missing Fields |');
    lines.push('|----------|-------------|---------------|----------------|');
    for (const result of needsInvestigation) {
      lines.push(`| ${result.name} | ${result.httpStatus} | ${result.responseTime}ms | ${result.missingFields.join(', ')} |`);
    }
    lines.push('');
  }

  // Detailed results
  lines.push('## Detailed Results');
  lines.push('');
  for (const result of results.results) {
    const emoji = result.status === 'approved' ? '✅' : result.status === 'failed' ? '❌' : '⚠️';
    lines.push(`### ${emoji} ${result.name}`);
    lines.push('');
    lines.push(`**URL:** \`${result.url}\``);
    lines.push('');
    lines.push(`**Status:** ${result.status.toUpperCase()}`);
    lines.push('');
    lines.push(`**HTTP Status:** ${result.httpStatus || 'N/A'}`);
    lines.push('');
    lines.push(`**Response Time:** ${result.responseTime}ms`);
    lines.push('');
    lines.push(`**Expected Fields:** ${result.expectedFields.join(', ')}`);
    lines.push('');
    if (result.missingFields.length > 0) {
      lines.push(`**Missing Fields:** ${result.missingFields.join(', ')}`);
      lines.push('');
    }
    if (result.error) {
      lines.push(`**Error:** ${result.error}`);
      lines.push('');
    }
  }

  return lines.join('\n');
}

// Main execution
async function main() {
  console.log('Starting ESPN API validation...');
  console.log(`League: ${LEAGUE}`);
  console.log(`Team ID: ${TEAM_ID}`);
  console.log(`Event ID: ${EVENT_ID}`);
  console.log('');

  const results: EndpointTest[] = [];

  for (const endpoint of endpoints) {
    console.log(`Testing: ${endpoint.name}`);
    const result = await testEndpoint(endpoint);
    results.push(result);
    console.log(`  Status: ${result.status} (${result.responseTime}ms)`);
    console.log('');
  }

  const report: ValidationReport = {
    timestamp: new Date().toISOString(),
    summary: {
      total: results.length,
      approved: results.filter(r => r.status === 'approved').length,
      failed: results.filter(r => r.status === 'failed').length,
      needsInvestigation: results.filter(r => r.status === 'needs_investigation').length,
    },
    results,
  };

  const markdown = generateReport(report);
  const outputPath = './docs/ESPN-API-Validation-Report.md';
  writeFileSync(outputPath, markdown);

  console.log('Validation complete!');
  console.log(`Report saved to: ${outputPath}`);
  console.log('');
  console.log('Summary:');
  console.log(`  Total: ${report.summary.total}`);
  console.log(`  Approved: ${report.summary.approved}`);
  console.log(`  Failed: ${report.summary.failed}`);
  console.log(`  Needs Investigation: ${report.summary.needsInvestigation}`);
}

// Run the validation
main().catch(console.error);
