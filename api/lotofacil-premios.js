const CAIXA='https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/';
const AS='https://asloterias.com.br/resultado-lotofacil-';
function money(v){const n=Number(v);return Number.isFinite(n)?n:0}
function brMoney(s){return Number(String(s||'0').replace(/\./g,'').replace(',','.'))||0}
function clean(html){return String(html||'').replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<br\s*\/?>/gi,'\n').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim()}
async function getCaixa(concurso){
  const r=await fetch(CAIXA+concurso,{headers:{accept:'application/json','user-agent':'Mozilla/5.0'}});
  if(!r.ok)throw new Error('CAIXA HTTP '+r.status);
  const j=await r.json(),rateios=Array.isArray(j.listaRateioPremio)?j.listaRateioPremio:[],premios={};
  for(const x of rateios){const faixa=Number(x.faixa||String(x.descricaoFaixa||'').match(/\d+/)?.[0]);if(faixa>=11&&faixa<=15)premios[faixa]={ganhadores:Number(x.numeroDeGanhadores||0),valor:money(x.valorPremio)}}
  return{concurso:Number(j.numero||concurso),data:j.dataApuracao||j.dataStr||'',dezenas:(j.listaDezenas||[]).map(Number),premios,arrecadacaoTotal:money(j.valorArrecadado||j.valorArrecadadoTotal),acumulado:money(j.valorAcumuladoProximoConcurso||j.valorAcumuladoConcursoEspecial),fonte:'CAIXA'};
}
async function getAs(concurso){
  const url=AS+concurso+'?ordenacao=sorteio',r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 LF-Inteligente/1.0'}});
  if(!r.ok)throw new Error('As Loterias HTTP '+r.status);
  const t=clean(await r.text()),premios={};
  const title=t.match(new RegExp('Resultado Lotofacil\\s+'+concurso+'[^0-9]*(\\d{1,2}\\s+de\\s+[^-]+?\\s+de\\s+\\d{4})','i'));
  const seq=t.match(/(?:Resultado Lotofacil\s+\d+[\s\S]{0,500}?)(\d{2}(?:\s+\d{2}){14})/i);
  const anchor=t.indexOf('Acertos Ganhadores');
  const seg=anchor>=0?t.slice(anchor,anchor+1200):t;
  for(const h of [15,14,13,12,11]){
    const re=new RegExp('(?:^|\\s)'+h+'\\s+([\\d.]+)\\s+([\\d.]+,\\d{2})(?=\\s|$)');
    const m=seg.match(re);if(m)premios[h]={ganhadores:Number(m[1].replace(/\./g,''))||0,valor:brMoney(m[2])};
  }
  let data='';const dm=t.match(/(\d{1,2})\s+de\s+(janeiro|fevereiro|março|abril|maio|junho|julho|agosto|setembro|outubro|novembro|dezembro)\s+de\s+(\d{4})/i);
  if(dm){const ms={janeiro:1,fevereiro:2,'março':3,abril:4,maio:5,junho:6,julho:7,agosto:8,setembro:9,outubro:10,novembro:11,dezembro:12};data=String(dm[1]).padStart(2,'0')+'/'+String(ms[dm[2].toLowerCase()]).padStart(2,'0')+'/'+dm[3]}
  return{concurso,data,dezenas:seq?seq[1].trim().split(/\s+/).map(Number).sort((a,b)=>a-b):[],premios,arrecadacaoTotal:0,acumulado:0,fonte:'As Loterias · contingência',sourceUrl:url};
}
async function getOne(concurso){try{return await getCaixa(concurso)}catch(e){return await getAs(concurso)}}
async function pool(nums,limit=5){const out=[];let i=0;async function worker(){while(i<nums.length){const idx=i++;out[idx]=await getOne(nums[idx])}}await Promise.all(Array.from({length:Math.min(limit,nums.length)},worker));return out}
module.exports=async function handler(req,res){
  try{
    const contest=Number(req.query?.concurso||0);let nums=[];
    if(contest)nums=[contest];else{const from=Math.max(1,Number(req.query?.from||0)),to=Math.max(from,Number(req.query?.to||from));if(!from||!to)throw new Error('Informe concurso ou intervalo from/to.');if(to-from>49)throw new Error('Intervalo máximo por consulta: 50 concursos.');nums=Array.from({length:to-from+1},(_,i)=>from+i)}
    const rows=await pool(nums);
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=21600');
    res.status(200).json({ok:true,source:'CAIXA com contingência As Loterias',count:rows.length,rows});
  }catch(e){res.status(502).json({ok:false,error:e.message});}
};