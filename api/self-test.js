const base = require('../data/lotofacil-base.json');
const { buildLiveBase } = require('../lib/lotofacil-live');
const { resolveExpectedSchedule } = require('../lib/lotofacil-schedule');
module.exports = async function handler(req,res){
  const live=await buildLiveBase(base,{force:true}),history=Array.isArray(live.history)?live.history:[],latestRow=history.at(-1)||null,latest=Number(latestRow?.concurso)||null,declaredLatest=Number(live.latest?.concurso)||null,validatedLatest=Number(live.baseValidation?.lastContest)||null,loadedCount=Number(live.baseValidation?.loadedCount)||0,embeddedLatest=Number(base?.history?.at?.(-1)?.concurso||base?.latest?.concurso)||0,embeddedLag=latest===null?null:Math.max(0,latest-embeddedLatest),g=Array.isArray(latestRow?.dezenas)?latestRow.dezenas.map(Number):[],lines=[0,0,0,0,0],cols=[0,0,0,0,0];
  for(const n of g)if(n>=1&&n<=25){lines[Math.floor((n-1)/5)]++;cols[(n-1)%5]++;}
  const metadataSynced=latest!==null&&latest===declaredLatest&&latest===validatedLatest&&history.length===loadedCount,usableHistory=live.baseValidation?.valid===true&&live.analysisBlocked!==true&&live.analysisSuspended!==true,expected=(latest||0)+1,schedule=resolveExpectedSchedule({lastKnownContest:latest,lastKnownDate:latestRow?.data,expectedContest:expected,embeddedFreshness:base.freshnessAlert}),calendarSynced=Number(live.freshnessAlert?.expectedContest)===expected&&String(live.freshnessAlert?.expectedDrawDate||'')===String(schedule.date||'');
  const checks=[
    {name:'API histórica',pass:history.length>0,critical:true,detail:`${history.length} concursos`},
    {name:'Base contínua',pass:live.baseValidation?.valid===true&&live.baseValidation?.missingCount===0,critical:true,detail:`${live.baseValidation?.missingCount||0} lacunas`},
    {name:'Base incorporada de contingência',pass:embeddedLatest>0&&embeddedLag<=1,critical:true,detail:`incorporada #${embeddedLatest||'—'} · ao vivo #${latest||'—'} · defasagem ${embeddedLag??'—'}`},
    {name:'Metadados sincronizados',pass:metadataSynced,critical:true,detail:`histórico #${latest||'—'} · latest #${declaredLatest||'—'} · validação #${validatedLatest||'—'}`},
    {name:'Atualização da base',pass:live.liveUpdate?.ok===true,critical:true,detail:live.liveUpdate?.ok?`${live.liveUpdate?.mode||'caixa'} · ${live.liveUpdate?.source||''}`:(live.liveUpdate?.error||'indisponível')},
    {name:'Confirmação oficial direta CAIXA',pass:live.officialVerification?.status==='verified',critical:false,detail:live.officialVerification?.message||'pendente'},
    {name:'Confirmação secundária',pass:live.secondaryVerification?.status==='verified'||live.officialVerification?.status==='verified',critical:false,detail:live.officialVerification?.status==='verified'?'dispensada: CAIXA oficial confirmada':`${live.secondaryVerification?.status||'pendente'} · ${live.secondaryVerification?.source||'sem fonte'}`},
    {name:'Calendário/frescor centralizado',pass:calendarSynced,critical:true,detail:`#${expected} · ${schedule.date||'—'} ${schedule.time||''} · ${schedule.source||'—'}`},
    {name:'Alerta de atualização',pass:live.freshnessAlert?.possibleNewContest!==true,critical:true,detail:live.freshnessAlert?.message||'sem concurso novo pendente'},
    {name:'Análises com histórico íntegro',pass:usableHistory,critical:true,detail:usableHistory?`liberadas até #${latest||'—'}`:'histórico incompleto ou indisponível'},
    {name:'Último concurso válido 15 dezenas',pass:g.length===15&&new Set(g).size===15,critical:true,detail:g.length===15?g.map(n=>String(n).padStart(2,'0')).join(' '):'inválido'},
    {name:'Perfis Linha/Coluna calculáveis',pass:g.length===15&&lines.reduce((a,b)=>a+b,0)===15&&cols.reduce((a,b)=>a+b,0)===15,critical:true,detail:`L ${lines.join('-')} · C ${cols.join('-')}`}
  ];
  res.setHeader('Cache-Control','no-store');res.status(200).json({ok:checks.filter(x=>x.critical!==false).every(x=>x.pass),checks,checkedAt:new Date().toISOString()});
};
