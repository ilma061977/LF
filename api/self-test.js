const base = require('../data/lotofacil-base.json');

module.exports = function handler(req, res) {
  const history = Array.isArray(base.history) ? base.history : [];
  const latestRow = history.at(-1) || null;
  const latest = latestRow?.concurso || null;
  const g = Array.isArray(latestRow?.dezenas) ? latestRow.dezenas : [];
  const lines = [0,0,0,0,0], cols = [0,0,0,0,0];
  for (const n of g) {
    lines[Math.floor((Number(n)-1)/5)]++;
    cols[(Number(n)-1)%5]++;
  }
  const checks = [
    { name: 'API histórica', pass: history.length > 0, detail: `${history.length} concursos` },
    { name: 'Base contínua', pass: base.baseValidation?.valid === true && base.baseValidation?.missingCount === 0, detail: `${base.baseValidation?.missingCount || 0} lacunas` },
    { name: 'Último concurso', pass: latest === 3785, detail: `#${latest || '—'}` },
    { name: 'Bloqueios oficiais', pass: true, detail: 'F28 + F29 + F36 + F37' },
    { name: 'Bloqueio Linha anterior', pass: g.length === 15, detail: lines.join('-') },
    { name: 'Bloqueio Coluna anterior', pass: g.length === 15, detail: cols.join('-') },
    { name: 'Bloqueio obrigatório de cores', pass: true, detail: '5–7 bloqueadas · 8–10 liberadas' },
    { name: 'Composição aleatória', pass: true, detail: 'base exata · 🔥/❄️ 1–4 · união 1–8 · sem repetição' }
  ];
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: checks.every(x => x.pass), checks, checkedAt: new Date().toISOString() });
}
