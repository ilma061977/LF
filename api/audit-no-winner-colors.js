const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const COLORS={
 'Vermelha':[1,11,21],'Amarela':[2,12,22],'Verde':[3,13,23],'Marrom':[4,14,24],
 'Azul':[5,15,25],'Rosa':[6,16],'Preta':[7,17],'Cinza':[8,18],'Laranja':[9,19],'Branca':[10,20]
};
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
 try{
  const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-ColorAudit/1.0'},cache:'no-store',signal:ac.signal});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;
  while((rm=rowRe.exec(html))){
   const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
   if(cells.length<18)continue;
   const concurso=Number((cells[0].match(/\d+/)||[])[0]);
   if(Number.isInteger(concurso)&&/^Acum\.?$/i.test(cells[17]))out.push(concurso);
  }return out;
 }finally{clearTimeout(timer);}
}
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));};
const smd=(a,b)=>{const sa=sd(a),sb=sd(b),sp=Math.sqrt(((a.length-1)*sa*sa+(b.length-1)*sb*sb)/Math.max(1,a.length+b.length-2));return sp?(mean(a)-mean(b))/sp:0;};
const dist=a=>{const o={};for(const v of a)o[v]=(o[v]||0)+1;return o;};
module.exports=async function(req,res){
 try{
  const live=await buildLiveBase(base,{force:false}),pages=[];
  for(let start=1;start<=76;start+=12){const nums=Array.from({length:Math.min(12,77-start)},(_,i)=>start+i);pages.push(...await Promise.all(nums.map(fetchPage)));}
  const accSet=new Set(pages.flat()),all=[],acc=[],win=[];
  for(const d of live.history){
   const set=new Set(d.dezenas),counts={};let distinct=0,full=0,absent=0;
   for(const [name,nums] of Object.entries(COLORS)){const c=nums.filter(n=>set.has(n)).length;counts[name]=c;if(c>0)distinct++;else absent++;if(c===nums.length)full++;}
   const pattern=Object.keys(COLORS).map(k=>counts[k]).join('-');
   const row={concurso:d.concurso,data:d.data,counts,distinct,full,absent,pattern};
   all.push(row);(accSet.has(d.concurso)?acc:win).push(row);
  }
  const colorStats={};const years=[...new Set(all.map(x=>String(x.data).slice(-4)))];
  for(const name of Object.keys(COLORS)){
   const aa=acc.map(x=>x.counts[name]),bb=win.map(x=>x.counts[name]);
   let weighted=0,w=0;for(const y of years){const ay=acc.filter(x=>String(x.data).endsWith(y)).map(x=>x.counts[name]),wy=win.filter(x=>String(x.data).endsWith(y)).map(x=>x.counts[name]);if(!ay.length||!wy.length)continue;weighted+=(mean(ay)-mean(wy))*ay.length;w+=ay.length;}
   const absentA=aa.filter(x=>x===0).length/acc.length*100,absentW=bb.filter(x=>x===0).length/win.length*100;
   const maxn=COLORS[name].length,fullA=aa.filter(x=>x===maxn).length/acc.length*100,fullW=bb.filter(x=>x===maxn).length/win.length*100;
   colorStats[name]={size:maxn,accMean:mean(aa),winMean:mean(bb),delta:mean(aa)-mean(bb),smd:smd(aa,bb),yearAdjustedDelta:w?weighted/w:0,absentA,absentW,absentDelta:absentA-absentW,fullA,fullW,fullDelta:fullA-fullW,distAcc:dist(aa),distWin:dist(bb)};
  }
  const patt={};for(const x of acc)patt[x.pattern]=(patt[x.pattern]||0)+1;
  const pattW={};for(const x of win)pattW[x.pattern]=(pattW[x.pattern]||0)+1;
  const topPatterns=Object.entries(patt).map(([pattern,count])=>({pattern,count,pct:count/acc.length*100,winPct:(pattW[pattern]||0)/win.length*100,delta:count/acc.length*100-(pattW[pattern]||0)/win.length*100})).sort((a,b)=>b.count-a.count).slice(0,20);
  const distinctA=dist(acc.map(x=>x.distinct)),distinctW=dist(win.map(x=>x.distinct));
  const fullA=dist(acc.map(x=>x.full)),fullW=dist(win.map(x=>x.full));
  const absentA=dist(acc.map(x=>x.absent)),absentW=dist(win.map(x=>x.absent));
  res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,count:acc.length,winCount:win.length,allCount:all.length,colorOrder:Object.keys(COLORS),colorStats,distinct:{acc:distinctA,win:distinctW,meanAcc:mean(acc.map(x=>x.distinct)),meanWin:mean(win.map(x=>x.distinct)),smd:smd(acc.map(x=>x.distinct),win.map(x=>x.distinct))},full:{acc:fullA,win:fullW,meanAcc:mean(acc.map(x=>x.full)),meanWin:mean(win.map(x=>x.full)),smd:smd(acc.map(x=>x.full),win.map(x=>x.full))},absent:{acc:absentA,win:absentW,meanAcc:mean(acc.map(x=>x.absent)),meanWin:mean(win.map(x=>x.absent)),smd:smd(acc.map(x=>x.absent),win.map(x=>x.absent))},topPatterns});
 }catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}
};