const SOURCE='https://asloterias.com.br/lista-de-resultados-da-lotofacil?ordenacao=sorteio';

function clean(html){
  return String(html||'')
    .replace(/<script[\s\S]*?<\/script>/gi,' ')
    .replace(/<style[\s\S]*?<\/style>/gi,' ')
    .replace(/<br\s*\/?>/gi,'\n')
    .replace(/<[^>]+>/g,' ')
    .replace(/&nbsp;|&#160;/g,' ')
    .replace(/&amp;/g,'&')
    .replace(/\r/g,'')
    .replace(/[ \t]+/g,' ');
}
function parse(text){
  const out=[];
  const re=/(\d{1,4})\s*-\s*(\d{2}\/\d{2}\/\d{4})\s*-\s*((?:\d{2}\s+){14}\d{2})/g;
  let m;
  while((m=re.exec(text))){
    const concurso=Number(m[1]),ordemSorteio=m[3].trim().split(/\s+/).map(Number);
    if(ordemSorteio.length===15&&new Set(ordemSorteio).size===15&&ordemSorteio.every(n=>n>=1&&n<=25)){
      out.push({concurso,data:m[2],ordemSorteio});
    }
  }
  return out.sort((a,b)=>a.concurso-b.concurso);
}
module.exports=async function handler(req,res){
  try{
    const r=await fetch(SOURCE,{headers:{'user-agent':'Mozilla/5.0 LF-Inteligente/1.0'}});
    if(!r.ok)throw new Error('Fonte secundária retornou HTTP '+r.status);
    const rows=parse(clean(await r.text()));
    const u=new URL(req.url,'https://lf.local');
    const from=Math.max(1,Number(u.searchParams.get('from')||1));
    const to=Math.max(from,Number(u.searchParams.get('to')||999999));
    const selected=rows.filter(x=>x.concurso>=from&&x.concurso<=to);
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json({ok:true,source:'As Loterias · ordem real de sorteio',sourceUrl:SOURCE,count:selected.length,totalParsed:rows.length,from,to,rows:selected});
  }catch(e){
    res.status(502).json({ok:false,error:e.message,source:SOURCE});
  }
};