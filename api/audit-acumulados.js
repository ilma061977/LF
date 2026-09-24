module.exports=async function handler(req,res){
  const u=new URL(req.url,'https://lf.local');
  const pg=Math.max(1,Math.min(76,Math.trunc(Number(u.searchParams.get('pg'))||1)));
  const url='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/?pg='+pg;
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
  try{
    const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 LF-Audit/1.0'},cache:'no-store',signal:ac.signal});
    if(!r.ok)throw new Error('HTTP '+r.status);
    const html=await r.text();
    const text=html.replace(/<script[\s\S]*?<\/script>/gi,' ').replace(/<style[\s\S]*?<\/style>/gi,' ').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ');
    const re=/(\d{1,4})\s+\|?\s*(\d{2}\/\d{2}\/\d{4})[\s\S]{0,450}?Acum\./g;
    const out=[]; let m;
    while((m=re.exec(text)))out.push({concurso:Number(m[1]),data:m[2]});
    res.setHeader('Cache-Control','no-store');
    res.status(200).json({ok:true,pg,count:out.length,items:out,url});
  }catch(e){res.status(500).json({ok:false,pg,error:String(e&&e.message||e),url});}
  finally{clearTimeout(timer);}
}