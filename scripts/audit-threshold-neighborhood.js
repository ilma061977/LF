const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

const root = path.join(__dirname, '..');
const box = { window: {} };
vm.runInNewContext(fs.readFileSync(path.join(root, 'matrix-51.js'), 'utf8'), box);
const M = box.window.LFMatrix51;
const history = require(path.join(root, 'data/lotofacil-base.json')).history;
assert.equal(Number(history.at(-1)?.concurso), 3793);
const universe = M.nCk(25, 15);
const nDraws = history.filter(d => d.concurso >= 4).length;
const variants = new Map();
const ids = [
  ...[65, 70, 73, 75, 77, 80, 85].map(t => `N01_MAXDIAG_${t}`),
  ...[5, 6, 7, 8, 9].map(t => `N02_MAIN_${t}`),
  ...[17, 19, 21, 23, 25].map(t => `N02_ANTI_${t}`),
  ...[43, 45, 47, 48, 49, 50, 51, 52, 53, 55].map(t => `N03_SPREAD_${t}`),
  ...[5, 6, 7, 8, 9].map(t => `N05_MAIN_${t}`),
  ...[5, 7, 8, 9, 10, 11, 13].map(t => `N05_ANTI_${t}`),
];
for (const id of ids) variants.set(id, { id, masks: new Set(), incremental: 0 });
for (const line of fs.readFileSync(path.join(root, 'auditoria/threshold-neighborhood-masks.csv'), 'utf8').trim().split(/\r?\n/).slice(1)) {
  const [id, rawMask] = line.split(',');
  const mask = Number(rawMask);
  if (!variants.has(id)) variants.set(id, { id, masks: new Set(), incremental: 0 });
  variants.get(id).masks.add(mask);
}
const phases = [
  ['descoberta', 4, 1676], ['ajuste', 1677, 2793], ['janela_pesquisada', 2794, 3793],
];
const drawMasks = history.map(d => ({
  concurso: Number(d.concurso),
  mask: d.dezenas.reduce((bits, n) => bits | (1 << (n - 1)), 0),
}));
const ctx = M.buildContext(history, { window: 10 });
for (const v of variants.values()) {
  for (const mask of v.masks) {
    const game = Array.from({ length: 25 }, (_, j) => j + 1).filter(n => mask & (1 << (n - 1)));
    if (M.policyAllows(M.inspect(game, ctx))) v.incremental++;
  }
  v.occurrences = Object.fromEntries(phases.map(([name, from, to]) => [name,
    drawMasks.reduce((s, d) => s + Number(d.concurso >= from && d.concurso <= to && v.masks.has(d.mask)), 0),
  ]));
  v.rawMatches = v.masks.size;
  v.expectedUniform = nDraws * v.rawMatches / universe;
  v.pLower = binomialCdf(v.occurrences.descoberta + v.occurrences.ajuste + v.occurrences.janela_pesquisada, nDraws, v.rawMatches / universe);
}

// Conservative Bonferroni adjustment for the 960 original hypotheses plus these 39 variants.
const familySize = 999;
for (const v of variants.values()) v.pBonferroni999 = Math.min(1, v.pLower * familySize);
const rows = [...variants.values()];
assert.equal(rows.length, 39, 'A auditoria deve contabilizar as 39 variantes, inclusive as sem correspondências.');
const groupByFamily = new Map();
for (const r of rows) {
  const family = r.id.replace(/_\d+$/, '');
  if (!groupByFamily.has(family)) groupByFamily.set(family, []);
  groupByFamily.get(family).push(r);
}
for (const items of groupByFamily.values()) {
  items.sort((a, b) => Number(a.id.match(/_(\d+)$/)[1]) - Number(b.id.match(/_(\d+)$/)[1]));
  for (let i = 0; i < items.length; i++) {
    items[i].neighborDeltaIncremental = i ? items[i].incremental - items[i - 1].incremental : null;
  }
}
const report = {
  app: 'LF Inteligente V3.7.5', baseThrough: 3793, universe, observedDraws: nDraws,
  generatedAt: new Date().toISOString(),
  variantsTestedHere: rows.length, originalExploratoryHypotheses: 960,
  multipleTestingFamilySize: familySize,
  correction: 'Bonferroni conservador; família nominal = 960 hipóteses exploratórias anteriores + 39 variantes de limiar desta análise. Não inclui todas as explorações prévias e não corrige seleção adaptativa anterior.',
  probabilityModel: 'Binomial exata sob sorteios independentes e uniformes de combinações de 15 entre 25; teste unilateral de cauda inferior para número de concursos observados.',
  caveat: 'Análise exploratória recalibrável: limites podem ser ajustados em rodadas futuras, incluindo após observar concursos novos. Quando dados já vistos forem usados para reajuste, eles deixam de ser validação independente. P-valores ajustados não demonstram poder preditivo nem justificam bloquear regras.',
  chronologicalRanges: { discovery: '4–1676', tuning: '1677–2793', laterResearchWindow: '2794–3793 (sobrepõe em 999 concursos a uma busca anterior; não é holdout independente)' },
  variants: rows.map(({ masks, ...r }) => ({...r, pLower: +r.pLower.toPrecision(8), pBonferroni999: +r.pBonferroni999.toPrecision(8), expectedUniform: +r.expectedUniform.toFixed(3)})),
};
fs.writeFileSync(path.join(root, 'auditoria/ROBUSTEZ-LIMITES-MULTIPLOS-TESTES-3793.json'), JSON.stringify(report, null, 2) + '\n');
const md = [
  '# Robustez dos limites e múltiplos testes · concurso 3793', '',
  `Foram examinadas ${rows.length} variantes vizinhas das cinco famílias de regra. O universo é de ${universe.toLocaleString('pt-BR')} combinações; a avaliação incremental usa a política atual do app no contexto #3793 (janela 10).`, '',
  '## Como interpretar', '',
  `A correção de Bonferroni usa família nominal de ${familySize} testes (960 hipóteses da busca anterior + 39 variantes aqui). Como houve outras explorações e seleção adaptativa, essa correção é apenas conservadora dentro do conjunto contabilizado; não é um teste confirmatório completo. O teste binomial unilateral compara ocorrências observadas com a fração do universo que cada regra cobre, sob sorteios uniformes independentes.`, '',
  'Os cortes podem ser recalibrados em análises futuras. Se concursos já observados forem usados para alterar limites, esses concursos não podem ser apresentados como validação independente da versão recalibrada. Nenhuma regra é ativada por esta auditoria.', '',
  'A janela #2794–#3793 compartilha 999 concursos com uma busca anterior (#2793–#3792); portanto, ela não é holdout independente. O acompanhamento é descritivo e recalibrável, sem protocolo congelado.', '',
  '## Resultados por variante', '',
  '| Variante | Jogos brutos | Adicionais à política atual | Ocorrências descoberta / ajuste / janela posterior | Esperadas (uniforme) | p ajustado ×999 | Δ adicionais vs. corte anterior |',
  '|---|---:|---:|---:|---:|---:|---:|',
  ...rows.map(r => `| ${r.id} | ${r.rawMatches.toLocaleString('pt-BR')} | ${r.incremental.toLocaleString('pt-BR')} | ${r.occurrences.descoberta} / ${r.occurrences.ajuste} / ${r.occurrences.janela_pesquisada} | ${r.expectedUniform.toFixed(3)} | ${r.pBonferroni999.toPrecision(3)} | ${r.neighborDeltaIncremental === null ? '—' : r.neighborDeltaIncremental} |`),
  '', '## Limites', '',
  'P-valores próximos de 1 após correção significam que os dados não sustentam raridade estatística para essas regras dentro deste desenho. A baixa frequência pode resultar da seleção entre muitas fórmulas; não deve ser tratada como evidência de previsão. A coluna de adicionais mede redução matemática do universo aprovado, não ganho de acerto.', '',
  '## Reproduzir', '',
  'Compile `scripts/audit-threshold-neighborhood.cpp` com C++17 para reconstruir `auditoria/threshold-neighborhood-masks.csv` e execute `node scripts/audit-threshold-neighborhood.js` para recalcular as métricas e este JSON.', ''
].join('\n');
fs.writeFileSync(path.join(root, 'auditoria/ROBUSTEZ-LIMITES-MULTIPLOS-TESTES-3793.md'), md);
console.log(JSON.stringify({variants: rows.length, minAdjustedP: Math.min(...rows.map(r => r.pBonferroni999)), maxAdjustedP: Math.max(...rows.map(r => r.pBonferroni999)), families: [...groupByFamily].map(([family, items]) => ({ family, count: items.length, minIncremental: Math.min(...items.map(x => x.incremental)), maxIncremental: Math.max(...items.map(x => x.incremental)) }))}, null, 2));

function binomialCdf(k, n, p) {
  if (k >= n) return 1;
  let term = Math.pow(1 - p, n);
  let sum = term;
  for (let i = 0; i < k; i++) {
    term *= ((n - i) / (i + 1)) * (p / (1 - p));
    sum += term;
  }
  return Math.min(1, sum);
}
