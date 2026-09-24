const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
  try{
    const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-WinnerAudit/1.0'},cache:'no-store',signal:ac.signal});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;
    while((rm=rowRe.exec(html))){
      const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
      if(cells.length<18)continue;
      const concurso=Number((cells[0].match(/\d+/)||[])[0]),data=(cells[1].match(/\d{2}\/\d{2}\/\d{4}/)||[])[0],raw=cells[17];
      if(!Number.isInteger(concurso)||!data)continue;
      const accumulated=/^Acum\.?$/i.test(raw);
      const winners=accumulated?0:Number((raw.match(/\d+/)||[])[0]);
      out.push({concurso,data,raw,winners:Number.isFinite(winners)?winners:null,accumulated});
    }
    return out;
  }finally{clearTimeout(timer);}
}
module.exports=async function(req,res){
  try{
    const pages=[];
    for(let start=1;start<=76;start+=12){
      const nums=Array.from({length:Math.min(12,77-start)},(_,i)=>start+i);
      pages.push(...await Promise.all(nums.map(fetchPage)));
    }
    const rows=pages.flat().sort((a,b)=>a.concurso-b.concurso).filter(x=>x.concurso<=3787);
    const byId=new Map(rows.map(x=>[x.concurso,x]));
    const one=rows.filter(x=>x.winners===1);
    const afterAccumImmediate=one.filter(x=>byId.get(x.concurso-1)?.accumulated);
    const accum=rows.filter(x=>x.accumulated);
    const eligibleAccum=accum.filter(x=>byId.has(x.concurso+1));
    const nextDist={};
    for(const a of eligibleAccum){const n=byId.get(a.concurso+1);const k=n.accumulated?'accum':String(n.winners);nextDist[k]=(nextDist[k]||0)+1;}
    const firstWinnerAfterRuns=[];
    for(const a of accum){
      const prev=byId.get(a.concurso-1);
      if(prev?.accumulated)continue;
      let end=a.concurso;
      while(byId.get(end+1)?.accumulated)end++;
      const next=byId.get(end+1);
      if(next)firstWinnerAfterRuns.push({runStart:a.concurso,runEnd:end,runLength:end-a.concurso+1,nextContest:next.concurso,nextDate:next.data,winners:next.winners});
    }
    const firstAfterRunOne=firstWinnerAfterRuns.filter(x=>x.winners===1);
    const dist={}; for(const r of rows){const k=r.accumulated?'accum':String(r.winners);dist[k]=(dist[k]||0)+1;}
    res.setHeader('Cache-Control','no-store');
    res.status(200).json({
      ok:true,total:rows.length,last:rows.at(-1),distribution:dist,
      exactlyOne:{count:one.length,pct:one.length/rows.length*100,first:one[0],last:one.at(-1),contests:one.map(x=>x.concurso)},
      immediateAfterAccum:{count:afterAccumImmediate.length,pctOfOne:afterAccumImmediate.length/Math.max(1,one.length)*100,pctOfEligibleAccum:afterAccumImmediate.length/Math.max(1,eligibleAccum.length)*100,eligibleAccum:eligibleAccum.length,items:afterAccumImmediate.map(x=>({contest:x.concurso,date:x.data,prev:x.concurso-1}))},
      nextAfterAccumDistribution:nextDist,
      firstWinnerAfterAccumRun:{runs:firstWinnerAfterRuns.length,oneWinnerCount:firstAfterRunOne.length,pct:firstAfterRunOne.length/Math.max(1,firstWinnerAfterRuns.length)*100,items:firstAfterRunOne},
      source:SOURCE
    });
  }catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}
};