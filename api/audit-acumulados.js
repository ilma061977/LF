module.exports=async function handler(req,res){
  const u=new URL(req.url,'https://lf.local');
  const pg=Math.max(1,Math.min(76,Math.trunc(Number(u.searchParams.get('pg'))||1)));
  const url='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/?pg='+pg;
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
  const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
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
    res.setHeader('Cache-Control','no-store');
    res.status(200).json({ok:true,pg,count:out.length,items:out,url});
  }catch(e){res.status(500).json({ok:false,pg,error:String(e&&e.message||e),url});}
  finally{clearTimeout(timer);}
}