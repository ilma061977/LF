const base = require('../data/lotofacil-base.json');
const { buildLiveBase } = require('../lib/lotofacil-live');

module.exports = async function handler(req, res) {
  const live=await buildLiveBase(base,{force:true});
  const history = Array.isArray(live.history) ? live.history : [];
  const latestRow = history.at(-1) || null;
  const latest = Number(latestRow?.concurso) || null;
  const declaredLatest = Number(live.latest?.concurso) || null;
  const validatedLatest = Number(live.baseValidation?.lastContest) || null;
  const loadedCount = Number(live.baseValidation?.loadedCount) || 0;
  const embeddedLatest = Number(base?.history?.at?.(-1)?.concurso || base?.latest?.concurso) || 0;
  const embeddedLag = latest === null ? null : Math.max(0, latest - embeddedLatest);
  const g = Array.isArray(latestRow?.dezenas) ? latestRow.dezenas.map(Number) : [];
  const lines = [0,0,0,0,0], cols = [0,0,0,0,0];
  for (const n of g) if (n >= 1 && n <= 25) { lines[Math.floor((n-1)/5)]++; cols[(n-1)%5]++; }
  const metadataSynced = latest !== null && latest === declaredLatest && latest === validatedLatest && history.length === loadedCount;
  const staleLockConsistent = Boolean(live.analysisSuspended) === Boolean(live.freshnessAlert?.possibleNewContest);
  const checks = [
    { name: 'API histórica', pass: history.length > 0, detail: `${history.length} concursos` },
    { name: 'Base contínua', pass: live.baseValidation?.valid === true && live.baseValidation?.missingCount === 0, detail: `${live.baseValidation?.missingCount || 0} lacunas` },
    { name: 'Base incorporada de contingência', pass: embeddedLatest > 0 && embeddedLag <= 1, detail: `incorporada #${embeddedLatest || '—'} · ao vivo #${latest || '—'} · defasagem ${embeddedLag ?? '—'}` },
    { name: 'Metadados sincronizados', pass: metadataSynced, detail: `histórico #${latest || '—'} · latest #${declaredLatest || '—'} · validação #${validatedLatest || '—'}` },
    { name: 'Último concurso', pass: latest !== null, detail: `#${latest || '—'}` },
    { name: 'Atualização ao vivo', pass: live.liveUpdate?.ok === true, detail: live.liveUpdate?.ok ? `${live.liveUpdate?.mode||'caixa'} · ${live.liveUpdate?.source||''}` : (live.liveUpdate?.error || 'indisponível') },
    { name: 'Alerta de atualização', pass: live.freshnessAlert?.possibleNewContest !== true, detail: live.freshnessAlert?.message || 'sem concurso novo pendente' },
    { name: 'Trava de base atrasada', pass: staleLockConsistent, detail: live.analysisSuspended ? 'análises suspensas enquanto concurso esperado não chega' : 'base liberada dentro da janela esperada' },
    { name: 'Último concurso válido 15 dezenas', pass: g.length === 15 && new Set(g).size === 15, detail: g.length === 15 ? g.map(n=>String(n).padStart(2,'0')).join(' ') : 'inválido' },
    { name: 'Perfis Linha/Coluna calculáveis', pass: g.length === 15 && lines.reduce((a,b)=>a+b,0) === 15 && cols.reduce((a,b)=>a+b,0) === 15, detail: `L ${lines.join('-')} · C ${cols.join('-')}` }
  ];
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ ok: checks.every(x => x.pass), checks, checkedAt: new Date().toISOString() });
}
