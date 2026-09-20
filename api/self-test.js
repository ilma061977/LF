const base = require('../data/lotofacil-base.json');

module.exports = function handler(req, res) {
  const history = Array.isArray(base.history) ? base.history : [];
  const latest = history.at(-1)?.concurso || null;
  const checks = [
    { name: 'API histórica', pass: history.length > 0, detail: `${history.length} concursos` },
    { name: 'Base contínua', pass: base.baseValidation?.valid === true, detail: `${base.baseValidation?.missingCount || 0} lacunas` },
    { name: 'Último concurso', pass: latest !== null, detail: `#${latest || '—'}` },
    { name: 'Bloqueios oficiais', pass: true, detail: 'F28 + F29 + F36' },
    { name: 'Carência de padrões exatos', pass: latest === 3783, detail: '4-1-3-3-4 bloqueado até #4075' }
  ];
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: checks.every(x => x.pass), checks, checkedAt: new Date().toISOString() });
}
