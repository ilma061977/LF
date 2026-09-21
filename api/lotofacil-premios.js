const BASE='https://servicebus2.caixa.gov.br/portaldeloterias/api/lotofacil/';
function money(v){const n=Number(v);return Number.isFinite(n)?n:0}
async function getOne(concurso){
  const r=await fetch(BASE+concurso,{headers:{accept:'application/json','user-agent':'Mozilla/5.0 LF-Inteligente/1.0'}});
  if(!r.ok)throw new Error('CAIXA HTTP '+r.status+' no concurso '+concurso);
  const j=await r.json();
  const rateios=Array.isArray(j.listaRateioPremio)?j.listaRateioPremio:[];
  const premios={};
  for(const x of rateios){
    const faixa=Number(x.faixa||String(x.descricaoFaixa||'').match(/\d+/)?.[0]);
    if(faixa>=11&&faixa<=15)premios[faixa]={ganhadores:Number(x.numeroDeGanhadores||0),valor:money(x.valorPremio)};
  }
  return {
    concurso:Number(j.numero||concurso),
    data:j.dataApuracao||j.dataStr||'',
    dezenas:(j.listaDezenas||[]).map(Number),
    premios,
    arrecadacaoTotal:money(j.valorArrecadado||j.valorArrecadadoTotal),
    acumulado:money(j.valorAcumuladoProximoConcurso||j.valorAcumuladoConcursoEspecial),
    fonte:'CAIXA'
  };
}
async function pool(nums,limit=6){
  const out=[];let i=0;
  async function worker(){while(i<nums.length){const idx=i++;out[idx]=await getOne(nums[idx]);}}
  await Promise.all(Array.from({length:Math.min(limit,nums.length)},worker));
  return out;
}
module.exports=async function handler(req,res){
  try{
    const contest=Number(req.query?.concurso||0);
    let nums=[];
    if(contest)nums=[contest];
    else{
      const from=Math.max(1,Number(req.query?.from||0)),to=Math.max(from,Number(req.query?.to||from));
      if(!from||!to)throw new Error('Informe concurso ou intervalo from/to.');
      if(to-from>99)throw new Error('Intervalo máximo por consulta: 100 concursos.');
      nums=Array.from({length:to-from+1},(_,i)=>from+i);
    }
    const rows=await pool(nums);
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=3600, stale-while-revalidate=21600');
    res.status(200).json({ok:true,source:'CAIXA · Portal de Loterias',count:rows.length,rows});
  }catch(e){res.status(502).json({ok:false,error:e.message});}
};