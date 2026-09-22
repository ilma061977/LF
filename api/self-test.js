const base = require('../data/lotofacil-base.json');

module.exports = function handler(req, res) {
  const history = Array.isArray(base.history) ? base.history : [];
  const latestRow = history.at(-1) || null;
  const latest = Number(latestRow?.concurso) || null;
  const declaredLatest = Number(base.latest?.concurso) || null;
  const validatedLatest = Number(base.baseValidation?.lastContest) || null;
  const loadedCount = Number(base.baseValidation?.loadedCount) || 0;
  const g = Array.isArray(latestRow?.dezenas) ? latestRow.dezenas.map(Number) : [];
  const lines = [0,0,0,0,0], cols = [0,0,0,0,0];
  for (const n of g) {
    if (n >= 1 && n <= 25) {
      lines[Math.floor((n-1)/5)]++;
      cols[(n-1)%5]++;
    }
  }
  const sourceVerified = base.officialVerification?.status === 'verified' || base.secondaryVerification?.status === 'verified';
  const metadataSynced = latest !== null && latest === declaredLatest && latest === validatedLatest && history.length === loadedCount;
  const checks = [
    { name: 'API histórica', pass: history.length > 0, detail: `${history.length} concursos` },
    { name: 'Base contínua', pass: base.baseValidation?.valid === true && base.baseValidation?.missingCount === 0, detail: `${base.baseValidation?.missingCount || 0} lacunas` },
    { name: 'Metadados sincronizados', pass: metadataSynced, detail: `histórico #${latest || '—'} · latest #${declaredLatest || '—'} · validação #${validatedLatest || '—'}` },
    { name: 'Último concurso', pass: latest !== null, detail: `#${latest || '—'}` },
    { name: 'Verificação externa', pass: sourceVerified, detail: base.officialVerification?.status === 'verified' ? 'CAIXA oficial' : (base.secondaryVerification?.source || 'fonte secundária') },
    { name: 'Alerta de atualização', pass: base.freshnessAlert?.possibleNewContest !== true, detail: base.freshnessAlert?.message || 'sem concurso novo pendente' },
    { name: 'Último concurso válido 15 dezenas', pass: g.length === 15 && new Set(g).size === 15, detail: g.length === 15 ? g.map(n=>String(n).padStart(2,'0')).join(' ') : 'inválido' },
    { name: 'Perfis Linha/Coluna calculáveis', pass: g.length === 15 && lines.reduce((a,b)=>a+b,0) === 15 && cols.reduce((a,b)=>a+b,0) === 15, detail: `L ${lines.join('-')} · C ${cols.join('-')}` }
  ];
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: checks.every(x => x.pass), checks, checkedAt: new Date().toISOString() });
}
