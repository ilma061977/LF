const CAIXA='https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil';

function normalizeDraw(j){
  const concurso=Number(j?.numero),dezenas=(j?.listaDezenas||[]).map(Number).sort((a,b)=>a-b),data=String(j?.dataApuracao||'');
  if(!Number.isInteger(concurso)||dezenas.length!==15||new Set(dezenas).size!==15||dezenas.some(n=>!Number.isInteger(n)||n<1||n>25))throw new Error('Resposta oficial inválida');
  return{concurso,data,dezenas};
}
function isoDate(br){
  const m=String(br||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:null;
}
async function fetchJSON(url){
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),7000);
  try{
    const r=await fetch(url,{headers:{accept:'application/json','user-agent':'Mozilla/5.0 LF-Inteligente/3.7.4'},cache:'no-store',signal:ac.signal});
    if(!r.ok)throw new Error('CAIXA HTTP '+r.status);
    return await r.json();
  }finally{clearTimeout(timer);}
}
function validateHistory(history){
  const sorted=[...history].sort((a,b)=>a.concurso-b.concurso),missing=[],seen=new Set();
  for(const d of sorted){if(seen.has(d.concurso))throw new Error('Concurso duplicado #'+d.concurso);seen.add(d.concurso);}
  const first=sorted[0]?.concurso||0,last=sorted.at(-1)?.concurso||0;
  for(let c=first;c<=last;c++)if(!seen.has(c))missing.push(c);
  return{valid:first===1&&missing.length===0,firstContest:first,lastContest:last,expectedCount:last,loadedCount:sorted.length,missingCount:missing.length,missingContests:missing,noGaps:missing.length===0};
}
async function buildLiveBase(base,{force=false}={}){
  const now=new Date().toISOString(),history=(base.history||[]).map(d=>({concurso:Number(d.concurso),data:d.data||'',dezenas:[...(d.dezenas||[])].map(Number).sort((a,b)=>a-b)})).sort((a,b)=>a.concurso-b.concurso);
  let latest=history.at(-1)||null,official=null,warning='';
  try{
    official=await fetchJSON(CAIXA+(force?'?refresh='+Date.now():''));
    const officialLatest=normalizeDraw(official);
    if(latest&&officialLatest.concurso<latest.concurso)throw new Error('CAIXA retornou concurso anterior à base local');
    if(latest&&officialLatest.concurso===latest.concurso){
      if(officialLatest.dezenas.join('-')!==latest.dezenas.join('-'))throw new Error('Divergência entre base local e CAIXA no concurso #'+latest.concurso);
      latest={...officialLatest};
      history[history.length-1]=latest;
    }else if(!latest||officialLatest.concurso>latest.concurso){
      const start=(latest?.concurso||0)+1;
      for(let c=start;c<=officialLatest.concurso;c++){
        const j=c===officialLatest.concurso?official:await fetchJSON(CAIXA+'/'+c);
        const d=normalizeDraw(j);if(d.concurso!==c)throw new Error('CAIXA retornou concurso inesperado ao buscar #'+c);
        history.push(d);latest=d;
      }
    }
    const validation=validateHistory(history);if(!validation.valid)throw new Error('Histórico dinâmico ficou incompleto');
    const next=Number(official?.numeroConcursoProximo)||((latest?.concurso||0)+1),nextDate=isoDate(official?.dataProximoConcurso);
    return{...base,ok:true,analysisBlocked:false,analysisSuspended:false,latest,history,source:'CAIXA oficial em tempo real + base incorporada',warning:'',baseValidation:validation,officialVerification:{status:'verified',message:`Concurso ${latest.concurso} confirmado diretamente na API oficial da CAIXA.`,checkedAt:now},freshnessAlert:{possibleNewContest:false,lastKnownContest:latest.concurso,expectedContest:next,expectedDrawDate:nextDate,message:official?.dataProximoConcurso?`Próximo concurso previsto para ${official.dataProximoConcurso}.`:`Próximo concurso esperado: #${next}.`},updatedAt:now,liveUpdate:{ok:true,source:CAIXA,checkedAt:now,added:Math.max(0,history.length-(base.history||[]).length)}};
  }catch(e){
    warning='Atualização oficial em tempo real indisponível: '+String(e?.message||e);
    const validation=validateHistory(history);
    return{...base,history,latest,warning,baseValidation:validation,liveUpdate:{ok:false,source:CAIXA,checkedAt:now,error:warning},updatedAt:base.updatedAt||now};
  }
}
module.exports={CAIXA,buildLiveBase};
