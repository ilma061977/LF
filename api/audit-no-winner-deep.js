const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
 try{
  const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-DeepAudit/1.0'},cache:'no-store',signal:ac.signal});if(!r.ok)throw new Error('HTTP '+r.status);
  const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;
  while((rm=rowRe.exec(html))){
   const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));if(cells.length<18)continue;
   const concurso=Number((cells[0].match(/\d+/)||[])[0]),data=(cells[1].match(/\d{2}\/\d{2}\/\d{4}/)||[])[0];
   if(Number.isInteger(concurso)&&data&&/^Acum\.?$/i.test(cells[17]))out.push({concurso,data});
  }return out;
 }finally{clearTimeout(timer);}
}
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));};
const q=(a,p)=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),i=(b.length-1)*p,l=Math.floor(i),h=Math.ceil(i);return l===h?b[l]:b[l]+(b[h]-b[l])*(i-l);};
const dist=(a,key)=>{const o={};for(const x of a){const v=x[key];o[v]=(o[v]||0)+1;}return o;};
const parseDate=s=>{const [d,m,y]=String(s).split('/').map(Number);return Date.UTC(y,m-1,d);};
function feat(d,prev){
 const g=d.dezenas,set=new Set(g),lines=[0,0,0,0,0],cols=[0,0,0,0,0];for(const n of g){lines[Math.floor((n-1)/5)]++;cols[(n-1)%5]++;}
 let adjacent=0,longest=0,run=0;for(let n=1;n<=25;n++){if(set.has(n)){run++;longest=Math.max(longest,run);}else run=0;if(n<25&&set.has(n)&&set.has(n+1))adjacent++;}
 const centerS=new Set([7,8,9,12,13,14,17,18,19]),primeS=new Set([2,3,5,7,11,13,17,19,23]),fibS=new Set([1,2,3,5,8,13,21]);
 return{
  min:Math.min(...g),max:Math.max(...g),span:Math.max(...g)-Math.min(...g),sum:g.reduce((a,b)=>a+b,0),odd:g.filter(n=>n%2).length,
  repeat:prev?g.filter(n=>prev.dezenas.includes(n)).length:null,center:g.filter(n=>centerS.has(n)).length,adjacent,longest,
  prime:g.filter(n=>primeS.has(n)).length,fib:g.filter(n=>fibS.has(n)).length,m3:g.filter(n=>n%3===0).length,low13:g.filter(n=>n<=13).length,
  maxLine:Math.max(...lines),minLine:Math.min(...lines),maxCol:Math.max(...cols),minCol:Math.min(...cols),
  lineExtreme:(Math.max(...lines)===5||Math.min(...lines)===0)?1:0,colExtreme:(Math.max(...cols)===5||Math.min(...cols)===0)?1:0
 };
}
function smd(a,b){const sa=sd(a),sb=sd(b),sp=Math.sqrt(((a.length-1)*sa*sa+(b.length-1)*sb*sb)/Math.max(1,a.length+b.length-2));return sp?(mean(a)-mean(b))/sp:0;}
function streaks(ids){const s=new Set(ids),out=[];for(const x of ids){if(s.has(x-1))continue;let len=1;while(s.has(x+len))len++;if(len>1)out.push({start:x,end:x+len-1,len});}return out.sort((a,b)=>b.len-a.len||a.start-b.start);}
module.exports=async function(req,res){
 try{
  const live=await buildLiveBase(base,{force:false}),pages=[];for(let start=1;start<=76;start+=12){const nums=Array.from({length:Math.min(12,77-start)},(_,i)=>start+i);pages.push(...await Promise.all(nums.map(fetchPage)));}
  const accList=pages.flat().sort((a,b)=>a.concurso-b.concurso),accSet=new Set(accList.map(x=>x.concurso)),all=[],acc=[],win=[];
  for(let i=0;i<live.history.length;i++){const d=live.history[i],row={...d,...feat(d,i?live.history[i-1]:null)};all.push(row);(accSet.has(d.concurso)?acc:win).push(row);}
  if(acc.length!==accList.length)throw new Error('Mismatch acumulados/base');
  const mins=dist(acc,'min'),maxs=dist(acc,'max'),pairs={};for(const x of acc){const k=String(x.min).padStart(2,'0')+'-'+String(x.max).padStart(2,'0');pairs[k]=(pairs[k]||0)+1;}
  const gaps=[];for(let i=1;i<acc.length;i++){const contestGap=acc[i].concurso-acc[i-1].concurso,days=(parseDate(acc[i].data)-parseDate(acc[i-1].data))/86400000;gaps.push({from:acc[i-1].concurso,to:acc[i].concurso,contestGap,between:contestGap-1,days});}
  const contestG=gaps.map(x=>x.contestGap),between=gaps.map(x=>x.between),daysG=gaps.map(x=>x.days);
  const featureNames=['min','max','span','sum','odd','repeat','center','adjacent','longest','prime','fib','m3','low13','maxLine','minLine','maxCol','minCol','lineExtreme','colExtreme'];
  const features={};for(const k of featureNames){const aa=acc.map(x=>x[k]).filter(Number.isFinite),bb=win.map(x=>x[k]).filter(Number.isFinite);features[k]={accMean:mean(aa),winMean:mean(bb),delta:mean(aa)-mean(bb),smd:smd(aa,bb),accSD:sd(aa),winSD:sd(bb)};}
  const numOverall=[],numStrat=[];for(let n=1;n<=25;n++){let ca=0,cw=0;for(const x of acc)if(x.dezenas.includes(n))ca++;for(const x of win)if(x.dezenas.includes(n))cw++;numOverall.push({n,accPct:ca/acc.length*100,winPct:cw/win.length*100,delta:ca/acc.length*100-cw/win.length*100});let weighted=0,w=0;const years=[...new Set(all.map(x=>String(x.data).slice(-4)))];for(const y of years){const ay=acc.filter(x=>String(x.data).endsWith(y)),wy=win.filter(x=>String(x.data).endsWith(y));if(!ay.length||!wy.length)continue;const ap=ay.filter(x=>x.dezenas.includes(n)).length/ay.length,wp=wy.filter(x=>x.dezenas.includes(n)).length/wy.length;weighted+=(ap-wp)*ay.length;w+=ay.length;}numStrat.push({n,yearAdjustedDelta:w?weighted/w*100:0});}
  const ids=acc.map(x=>x.concurso),runs=streaks(ids);
  const rateByYear={};for(const x of all){const y=String(x.data).slice(-4);rateByYear[y]??={all:0,acc:0};rateByYear[y].all++;if(accSet.has(x.concurso))rateByYear[y].acc++;}for(const y in rateByYear)rateByYear[y].pct=rateByYear[y].acc/rateByYear[y].all*100;
  const droughtBuckets={'0':{n:0,e:0},'1':{n:0,e:0},'2':{n:0,e:0},'3-4':{n:0,e:0},'5-9':{n:0,e:0},'10+':{n:0,e:0}};let since=null;for(const x of all){const d=since==null?null:x.concurso-since-1;if(d!=null){const k=d===0?'0':d===1?'1':d===2?'2':d<=4?'3-4':d<=9?'5-9':'10+';droughtBuckets[k].n++;if(accSet.has(x.concurso))droughtBuckets[k].e++;}if(accSet.has(x.concurso))since=x.concurso;}for(const k in droughtBuckets)droughtBuckets[k].pct=droughtBuckets[k].n?droughtBuckets[k].e/droughtBuckets[k].n*100:0;
  res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,count:acc.length,allCount:all.length,
   minDist:mins,maxDist:maxs,minMaxPairs:Object.entries(pairs).sort((a,b)=>b[1]-a[1]).map(([pair,count])=>({pair,count,pct:count/acc.length*100})),
   gap:{contest:{mean:mean(contestG),median:q(contestG,.5),p10:q(contestG,.1),p90:q(contestG,.9),min:Math.min(...contestG),max:Math.max(...contestG)},between:{mean:mean(between),median:q(between,.5),p10:q(between,.1),p90:q(between,.9),min:Math.min(...between),max:Math.max(...between)},days:{mean:mean(daysG),median:q(daysG,.5),p10:q(daysG,.1),p90:q(daysG,.9),min:Math.min(...daysG),max:Math.max(...daysG)},longestGap:gaps.sort((a,b)=>b.contestGap-a.contestGap).slice(0,10),shortestGap:[...gaps].sort((a,b)=>a.contestGap-b.contestGap).slice(0,10)},
   runs:runs.slice(0,20),features,numOverall:numOverall.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)),numStrat:numStrat.sort((a,b)=>Math.abs(b.yearAdjustedDelta)-Math.abs(a.yearAdjustedDelta)),rateByYear,droughtBuckets,
   rows:acc.map((x,i)=>({concurso:x.concurso,data:x.data,min:x.min,max:x.max,span:x.span,gapFromPrev:i?x.concurso-acc[i-1].concurso:null,between:i?x.concurso-acc[i-1].concurso-1:null,daysFromPrev:i?(parseDate(x.data)-parseDate(acc[i-1].data))/86400000:null}))
  });
 }catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}
};