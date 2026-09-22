const CAIXA='https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil';
const SECONDARY='https://asloterias.com.br/lista-de-resultados-da-lotofacil?ordenacao=sorteio';

function normalizeDraw(j){
  const concurso=Number(j?.numero),dezenas=(j?.listaDezenas||[]).map(Number).sort((a,b)=>a-b),data=String(j?.dataApuracao||'');
  if(!Number.isInteger(concurso)||dezenas.length!==15||new Set(dezenas).size!==15||dezenas.some(n=>!Number.isInteger(n)||n<1||n>25))throw new Error('Resposta oficial inválida');
  return{concurso,data,dezenas};
}
function isoDate(br){
  const m=String(br||'').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:null;
}
function cleanHTML(html){return String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\r/g,'').replace(/[ \t]+/g,' ');}
function parseSecondary(text){
  const out=[],re=/(\d{1,4})\s*-\s*(\d{2}\/\d{2}\/\d{4})\s*-\s*((?:\d{2}\s+){14}\d{2})/g;let m;
  while((m=re.exec(text))){const concurso=Number(m[1]),dezenas=m[3].trim().split(/\s+/).map(Number).sort((a,b)=>a-b);if(dezenas.length===15&&new Set(dezenas).size===15)out.push({concurso,data:m[2],dezenas});}
  return out.sort((a,b)=>a.concurso-b.concurso);
}
async function fetchText(url){
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),7000);
  try{const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 LF-Inteligente/3.7.4'},cache:'no-store',signal:ac.signal});if(!r.ok)throw new Error('HTTP '+r.status);return await r.text();}finally{clearTimeout(timer);}
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
    const caixaError=String(e?.message||e);
    try{
      const rows=parseSecondary(cleanHTML(await fetchText(SECONDARY))),current=history.at(-1)?.concurso||0,newer=rows.filter(x=>x.concurso>current);
      for(const d of newer){if(d.concurso!==(history.at(-1)?.concurso||0)+1)throw new Error('Fonte secundária retornou lacuna antes do #'+d.concurso);history.push(d);}
      latest=history.at(-1)||latest;const validation=validateHistory(history);if(!validation.valid)throw new Error('Histórico de contingência incompleto');
      const confirmed=rows.find(x=>x.concurso===latest?.concurso);
      warning='CAIXA bloqueou a Vercel ('+caixaError+'); atualização automática usando contingência secundária.';
      return{...base,ok:true,analysisBlocked:false,analysisSuspended:false,latest,history,source:'Base incorporada + atualização automática de contingência',warning,baseValidation:validation,officialVerification:{status:'pending',message:'Consulta direta à CAIXA indisponível na Vercel; aguardando confirmação oficial direta.',checkedAt:now},secondaryVerification:{status:confirmed?'verified':'pending',latestContest:latest?.concurso||null,source:'As Loterias · atualização automática',checkedAt:now},freshnessAlert:{possibleNewContest:false,lastKnownContest:latest?.concurso||null,expectedContest:(latest?.concurso||0)+1,expectedDrawDate:base.freshnessAlert?.expectedDrawDate||null,message:`Base automática conferida até #${latest?.concurso||'—'}; próximo esperado #${(latest?.concurso||0)+1}.`},updatedAt:now,liveUpdate:{ok:true,mode:'secondary-fallback',source:SECONDARY,checkedAt:now,added:newer.length,caixaError}};
    }catch(fallbackError){
      warning='Atualização ao vivo indisponível: CAIXA '+caixaError+'; contingência '+String(fallbackError?.message||fallbackError);
      const validation=validateHistory(history);
      return{...base,history,latest,warning,baseValidation:validation,liveUpdate:{ok:false,source:CAIXA,checkedAt:now,error:warning},updatedAt:base.updatedAt||now};
    }
  }
}
module.exports={CAIXA,SECONDARY,buildLiveBase};
