module.exports=async function handler(req,res){
  const u=new URL(req.url,'https://lf.local');
  const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
  async function fetchPage(pg){
    const url='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/?pg='+pg;
    const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
    try{
      const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 LF-Audit/1.0'},cache:'no-store',signal:ac.signal});
      if(!r.ok)throw new Error('HTTP '+r.status);
      const html=await r.text(),out=[];
      const rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi; let rm;
      while((rm=rowRe.exec(html))){
        const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
        if(cells.length<18)continue;
        const concurso=Number((cells[0].match(/\d+/)||[])[0]),data=(cells[1].match(/\d{2}\/\d{2}\/\d{4}/)||[])[0];
        if(Number.isInteger(concurso)&&data&&/^Acum\.?$/i.test(cells[17]))out.push({concurso,data});
      }
      return {ok:true,pg,items:out};
    }finally{clearTimeout(timer);}
  }
  res.setHeader('Cache-Control','no-store');
  try{
    if(u.searchParams.has('all')){
      const pages=[];
      for(let start=1;start<=76;start+=12){
        const nums=Array.from({length:Math.min(12,77-start)},(_,i)=>start+i);
        pages.push(...await Promise.all(nums.map(fetchPage)));
      }
      const items=pages.flatMap(x=>x.items).sort((a,b)=>a.concurso-b.concurso);
      return res.status(200).json({ok:true,pages:pages.length,count:items.length,first:items[0]||null,last:items.at(-1)||null,items});
    }
    const pg=Math.max(1,Math.min(76,Math.trunc(Number(u.searchParams.get('pg'))||1)));
    const x=await fetchPage(pg);
    return res.status(200).json({...x,count:x.items.length});
  }catch(e){return res.status(500).json({ok:false,error:String(e&&e.message||e)});}
}