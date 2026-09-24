const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
 try{
  const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-3GroupBlockAudit/1.0'},cache:'no-store',signal:ac.signal});
  if(!r.ok)throw new Error('HTTP '+r.status);const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;
  while((rm=rowRe.exec(html))){const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));if(cells.length<18)continue;
   const concurso=Number((cells[0].match(/\d+/)||[])[0]),data=(cells[1].match(/\d{2}\/\d{2}\/\d{4}/)||[])[0];
   if(!Number.isInteger(concurso)||!data)continue;const raw=cells[17],acc=/^Acum\.?$/i.test(raw),num=Number((String(raw).replace(/\./g,'').match(/\d+/)||[])[0]);
   out.push({concurso,data,winners:acc?0:(Number.isFinite(num)?num:null),accumulated:acc});
  } return out;
 }finally{clearTimeout(timer);}
}
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const dist=(rows,key)=>rows.reduce((o,x)=>{const v=x[key];o[v]=(o[v]||0)+1;return o;},{});
const pct=(n,d)=>d?100*n/d:0;
function feat(history,wmap){
 const colorDefs=[[1,11,21],[2,12,22],[3,13,23],[4,14,24],[5,15,25],[6,16],[7,17],[8,18],[9,19],[10,20]];
 return history.map((d,i)=>{const g=d.dezenas,set=new Set(g),lines=[0,0,0,0,0],cols=[0,0,0,0,0];for(const n of g){lines[Math.floor((n-1)/5)]++;cols[(n-1)%5]++;}
  let adjacent=0,longest=0,run=0;for(let n=1;n<=25;n++){if(set.has(n)){run++;longest=Math.max(longest,run);}else run=0;if(n<25&&set.has(n)&&set.has(n+1))adjacent++;}
  let distinctColors=0,fullColors=0;for(const a of colorDefs){const c=a.filter(n=>set.has(n)).length;if(c>0)distinctColors++;if(c===a.length)fullColors++;}
  const w=wmap.get(d.concurso)||{},prev=i?wmap.get(history[i-1].concurso):null,min=Math.min(...g),max=Math.max(...g);
  return{concurso:d.concurso,data:d.data,winners:w.winners??null,accumulated:!!w.accumulated,afterAccum:!!prev?.accumulated,min,max,startEnd:min+'-'+max,
   sum:g.reduce((a,b)=>a+b,0),odd:g.filter(n=>n%2).length,repeat:i?g.filter(n=>history[i-1].dezenas.includes(n)).length:null,
   minLine:Math.min(...lines),maxLine:Math.max(...lines),lineExtreme:(Math.min(...lines)===0||Math.max(...lines)===5)?1:0,lineSig:lines.join('-'),
   minCol:Math.min(...cols),maxCol:Math.max(...cols),colExtreme:(Math.min(...cols)===0||Math.max(...cols)===5)?1:0,colSig:cols.join('-'),
   adjacent,longest,distinctColors,fullColors};
 });
}
function summary(rows){return{n:rows.length,min:mean(rows.map(x=>x.min)),max:mean(rows.map(x=>x.max)),sum:mean(rows.map(x=>x.sum)),odd:mean(rows.map(x=>x.odd)),repeat:mean(rows.map(x=>x.repeat).filter(Number.isFinite)),minLine:mean(rows.map(x=>x.minLine)),maxLine:mean(rows.map(x=>x.maxLine)),lineExtreme:pct(rows.filter(x=>x.lineExtreme).length,rows.length),adjacent:mean(rows.map(x=>x.adjacent)),longest:mean(rows.map(x=>x.longest)),colors:mean(rows.map(x=>x.distinctColors)),colExtreme:pct(rows.filter(x=>x.colExtreme).length,rows.length)};}
function condition(rows,fn){return rows.filter(fn).length;}
function candidate(name,fn,a,b,c){const A=condition(a,fn),B=condition(b,fn),C=condition(c,fn);return{name,noWinner:A,noWinnerPct:pct(A,a.length),one:B,onePct:pct(B,b.length),afterOne:C,afterOnePct:pct(C,c.length)};}
module.exports=async(req,res)=>{try{
 const live=await buildLiveBase(base,{force:false}),pages=[];for(let s=1;s<=76;s+=12){const nums=Array.from({length:Math.min(12,77-s)},(_,i)=>s+i);pages.push(...await Promise.all(nums.map(fetchPage)));}
 const wr=pages.flat(),wmap=new Map(wr.map(x=>[x.concurso,x])),all=feat(live.history,wmap),nw=all.filter(x=>x.accumulated),one=all.filter(x=>x.winners===1),after=all.filter(x=>x.afterAccum&&x.winners===1);
 const candidates=[
  candidate('cores<=7',x=>x.distinctColors<=7,nw,one,after),
  candidate('cores=10',x=>x.distinctColors===10,nw,one,after),
  candidate('linha extrema',x=>x.lineExtreme===1,nw,one,after),
  candidate('sem linha extrema',x=>x.lineExtreme===0,nw,one,after),
  candidate('links<=7',x=>x.adjacent<=7,nw,one,after),
  candidate('links>=10',x=>x.adjacent>=10,nw,one,after),
  candidate('maior seq<=4',x=>x.longest<=4,nw,one,after),
  candidate('maior seq>=6',x=>x.longest>=6,nw,one,after),
  candidate('coluna extrema',x=>x.colExtreme===1,nw,one,after),
  candidate('fullColors<=1',x=>x.fullColors<=1,nw,one,after),
  candidate('fullColors>=4',x=>x.fullColors>=4,nw,one,after),
  candidate('inicio=2 fim=25',x=>x.min===2&&x.max===25,nw,one,after),
  candidate('inicio=4 fim=25',x=>x.min===4&&x.max===25,nw,one,after),
  candidate('inicio=1 fim=25',x=>x.min===1&&x.max===25,nw,one,after),
  candidate('inicio>=5',x=>x.min>=5,nw,one,after),
  candidate('fim<=22',x=>x.max<=22,nw,one,after),
  candidate('perfil forte A',x=>x.lineExtreme===1&&x.adjacent>=9,nw,one,after),
  candidate('perfil forte B',x=>x.maxLine===5&&x.longest>=6,nw,one,after),
  candidate('perfil anti-semganhador A',x=>x.lineExtreme===0&&x.adjacent<=7,nw,one,after),
  candidate('perfil anti-semganhador B',x=>x.longest<=4&&x.distinctColors<=8,nw,one,after)
 ];
 const topStartEnd=(rows)=>Object.entries(dist(rows,'startEnd')).map(([k,v])=>({pattern:k,count:v,pct:pct(v,rows.length)})).sort((a,b)=>b.count-a.count).slice(0,15);
 res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,summary:{noWinner:summary(nw),one:summary(one),afterOne:summary(after)},candidates,topStartEnd:{noWinner:topStartEnd(nw),one:topStartEnd(one),afterOne:topStartEnd(after)},counts:{noWinner:nw.length,one:one.length,afterOne:after.length}});
}catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}};