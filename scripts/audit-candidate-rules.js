const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'matrix-51.js'), 'utf8'), box);
const M = box.window.LFMatrix51;
const base = require(path.join(root, 'data/lotofacil-base.json'));
const history = base.history;
const latest = Number(history.at(-1)?.concurso);
assert.equal(latest, 3793, 'Atualize os limites desta auditoria junto com a base histórica.');
assert.equal(history.length, latest, 'Histórico deve ser contínuo desde o concurso 1.');

const previous = require(path.join(root, 'auditoria/novel-circular-active-policy.json'));
const resultRows = fs.readFileSync(path.join(root, 'auditoria/novel-circular-results.csv'), 'utf8')
  .trim().split(/\r?\n/).slice(1).map(line => line.split(','));
const masksByRank = new Map();
for (const line of fs.readFileSync(path.join(root, 'auditoria/novel-circular-top-masks.csv'), 'utf8').trim().split(/\r?\n/).slice(1)) {
  const [rank, mask] = line.split(',').map(Number);
  if (!masksByRank.has(rank)) masksByRank.set(rank, []);
  masksByRank.get(rank).push(mask);
}

const split = {
  discovery: { from: 4, to: 1676 },
  tuning: { from: 1677, to: 2793 },
  laterResearchWindow: { from: 2794, to: 3793 },
  priorSearchWindow: { from: 2793, to: 3792 },
};
const ctx = M.buildContext(history, { window: 10 });
const approved = new Map();
const rules = previous.top.slice(0, 5).map((prior, i) => {
  const rank = Number(prior.rank);
  const row = resultRows[rank - 1];
  assert(row, `Regra rank ${rank} ausente do arquivo de resultados.`);
  const [kind, f1, side1, threshold1, f2, side2, threshold2, gross] = row;
  const masks = masksByRank.get(rank) || [];
  assert.equal(masks.length, Number(gross), `Contagem bruta divergente em N${i + 1}.`);
  const matched = new Set(masks);
  const accepted = [];
  for (const mask of masks) {
    const game = Array.from({ length: 25 }, (_, j) => j + 1).filter(n => mask & (1 << (n - 1)));
    if (M.policyAllows(M.inspect(game, ctx))) {
      accepted.push({ mask, game });
      approved.set(mask, game);
    }
  }
  const occurrences = {};
  for (const [phase, range] of Object.entries(split)) {
    if (!range.from || !range.to) continue;
    occurrences[phase] = history.reduce((sum, draw) => {
      const mask = draw.dezenas.reduce((bits, n) => bits | (1 << (n - 1)), 0);
      return sum + (draw.concurso >= range.from && draw.concurso <= range.to && matched.has(mask) ? 1 : 0);
    }, 0);
  }
  const hitCounts = Object.fromEntries([11, 12, 13, 14, 15].map(k => [k, 0]));
  for (const { game } of accepted) {
    for (const draw of history) {
      const hits = game.reduce((sum, n) => sum + Number(draw.dezenas.includes(n)), 0);
      if (hits >= 11) hitCounts[hits]++;
    }
  }
  return {
    id: `N${String(i + 1).padStart(2, '0')}`,
    formula: `${f1} ${side1} ${threshold1} E ${f2} ${side2} ${threshold2}`,
    rawMatches: Number(gross),
    incrementalAt3793: accepted.length,
    selectedHistoricalOccurrences: occurrences,
    historicalHitObservations: hitCounts,
    status: 'Candidata; não ativada',
  };
});

const unionHitObservations = Object.fromEntries([11, 12, 13, 14, 15].map(k => [k, 0]));
for (const game of approved.values()) {
  for (const draw of history) {
    const hits = game.reduce((sum, n) => sum + Number(draw.dezenas.includes(n)), 0);
    if (hits >= 11) unionHitObservations[hits]++;
  }
}

const rawSum = rules.reduce((sum, rule) => sum + rule.rawMatches, 0);
const incrementalSum = rules.reduce((sum, rule) => sum + rule.incrementalAt3793, 0);
const report = {
  app: 'LF Inteligente V3.7.5',
  generatedAt: new Date().toISOString(),
  baseThrough: latest,
  baseSize: history.length,
  universe: M.nCk(25, 15),
  currentWindow: 10,
  currentPolicy: 'LFMatrix51.policyAllows com as políticas padrão e bloqueios externos atuais',
  chronologicalProtocol: split,
  holdoutStatus: 'JANELA HISTÓRICA NÃO INDEPENDENTE: 999 concursos do intervalo #2794–#3793 já constavam na janela #2793–#3792 usada pela pesquisa anterior. O protocolo é recalibrável; dados usados para ajustar limites não podem ser chamados de validação independente.',
  rules,
  rawCountSum: rawSum,
  incrementalCountSum: incrementalSum,
  exactIncrementalUnion: approved.size,
  overlapAmongRuleLists: incrementalSum - approved.size,
  exactIncrementalUnionPercent: +(approved.size / M.nCk(25, 15) * 100).toFixed(6),
  unionHistoricalHitObservations: unionHitObservations,
  hitDefinition: 'Cada contagem 11–15 soma, para os jogos adicionais aprovados pela política atual na referência #3793, os acertos que cada jogo teria obtido em cada concurso histórico carregado. É contagem descritiva de jogo×concurso, não previsão nem contagem de prêmios pagos.',
};

assert.equal(report.exactIncrementalUnion, 434);
assert.equal(report.overlapAmongRuleLists, 231);
assert.equal(report.rules[0].incrementalAt3793, 159);
assert.equal(report.rules[4].incrementalAt3793, 79);
assert.equal(report.unionHistoricalHitObservations[14], 0);
assert.equal(report.unionHistoricalHitObservations[15], 0);
fs.writeFileSync(path.join(root, 'auditoria/AVALIACAO-QUATRO-MELHORIAS-3793.json'), JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ baseThrough: latest, universe: report.universe, rules: rules.map(({ id, rawMatches, incrementalAt3793, historicalHitObservations }) => ({ id, rawMatches, incrementalAt3793, historicalHitObservations })), exactIncrementalUnion: report.exactIncrementalUnion, overlap: report.overlapAmongRuleLists, unionHistoricalHitObservations: report.unionHistoricalHitObservations }, null, 2));
