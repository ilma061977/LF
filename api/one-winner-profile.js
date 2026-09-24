const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
 try{
  const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-OneWinnerProfile/1.0'},cache:'no-store',signal:ac.signal});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;
  while((rm=rowRe.exec(html))){
   const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
   if(cells.length<18)continue;
   const concurso=Number((cells[0].match(/\d+/)||[])[0]),data=(cells[1].match(/\d{2}\/\d{2}\/\d{4}/)||[])[0],raw=cells[17];
   if(!Number.isInteger(concurso)||!data)continue;
   const accumulated=/^Acum\.?$/i.test(raw),winners=accumulated?0:Number((raw.match(/\d+/)||[])[0]);
   const betsRaw=cells[19]||'',bets=/\d/.test(betsRaw)?Number(betsRaw.replace(/\D/g,'')):null;
   out.push({concurso,data,winners:Number.isFinite(winners)?winners:null,accumulated,bets:Number.isFinite(bets)?bets:null});
  }return out;
 }finally{clearTimeout(timer);}
}
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
const sd=a=>{if(a.length<2)return 0;const m=mean(a);return Math.sqrt(a.reduce((s,v)=>s+(v-m)**2,0)/(a.length-1));};
const smd=(a,b)=>{if(!a.length||!b.length)return 0;const sa=sd(a),sb=sd(b),sp=Math.sqrt(((a.length-1)*sa*sa+(b.length-1)*sb*sb)/Math.max(1,a.length+b.length-2));return sp?(mean(a)-mean(b))/sp:0;};
const dist=(rows,key)=>{const o={};for(const x of rows){const v=x[key];if(v==null)continue;o[v]=(o[v]||0)+1;}return o;};
const COLORS=[
 ['Vermelha',[1,11,21]],['Amarela',[2,12,22]],['Verde',[3,13,23]],['Marrom',[4,14,24]],['Azul',[5,15,25]],
 ['Rosa',[6,16]],['Preta',[7,17]],['Cinza',[8,18]],['Laranja',[9,19]],['Branca',[10,20]]
];
function feat(d,prev){
 const g=d.dezenas,set=new Set(g),lines=[0,0,0,0,0],cols=[0,0,0,0,0];for(const n of g){lines[Math.floor((n-1)/5)]++;cols[(n-1)%5]++;}
 let adjacent=0,longest=0,run=0;for(let n=1;n<=25;n++){if(set.has(n)){run++;longest=Math.max(longest,run);}else run=0;if(n<25&&set.has(n)&&set.has(n+1))adjacent++;}
 const centerS=new Set([7,8,9,12,13,14,17,18,19]),primeS=new Set([2,3,5,7,11,13,17,19,23]),fibS=new Set([1,2,3,5,8,13,21]);
 const colorCounts={},colorPresent=[];let distinctColors=0,fullColors=0,absentColors=0;
 for(const [name,nums] of COLORS){const c=nums.filter(n=>set.has(n)).length;colorCounts[name]=c;colorPresent.push(c);if(c>0)distinctColors++;else absentColors++;if(c===nums.length)fullColors++;}
 return{
  sum:g.reduce((a,b)=>a+b,0),odd:g.filter(n=>n%2).length,repeat:prev?g.filter(n=>prev.dezenas.includes(n)).length:null,
  center:g.filter(n=>centerS.has(n)).length,prime:g.filter(n=>primeS.has(n)).length,fib:g.filter(n=>fibS.has(n)).length,m3:g.filter(n=>n%3===0).length,low13:g.filter(n=>n<=13).length,
  adjacent,longest,min:Math.min(...g),max:Math.max(...g),span:Math.max(...g)-Math.min(...g),
  maxLine:Math.max(...lines),minLine:Math.min(...lines),lineExtreme:(Math.max(...lines)===5||Math.min(...lines)===0)?1:0,
  maxCol:Math.max(...cols),minCol:Math.min(...cols),colExtreme:(Math.max(...cols)===5||Math.min(...cols)===0)?1:0,
  distinctColors,fullColors,absentColors,colorCounts,
  sumChange:prev?g.reduce((a,b)=>a+b,0)-prev.dezenas.reduce((a,b)=>a+b,0):null
 };
}
function summarize(A,B,featureNames,years){
 const out={};for(const k of featureNames){
  const aa=A.map(x=>x[k]).filter(Number.isFinite),bb=B.map(x=>x[k]).filter(Number.isFinite);
  let weighted=0,w=0;
  for(const y of years){
   const ay=A.filter(x=>String(x.data).endsWith(y)&&Number.isFinite(x[k])).map(x=>x[k]),by=B.filter(x=>String(x.data).endsWith(y)&&Number.isFinite(x[k])).map(x=>x[k]);
   if(!ay.length||!by.length)continue;weighted+=(mean(ay)-mean(by))*ay.length;w+=ay.length;
  }
  const pooled=Math.sqrt(((aa.length-1)*sd(aa)**2+(bb.length-1)*sd(bb)**2)/Math.max(1,aa.length+bb.length-2));
  out[k]={aMean:mean(aa),bMean:mean(bb),delta:mean(aa)-mean(bb),smd:smd(aa,bb),yearAdjustedDelta:w?weighted/w:0,yearAdjustedSmd:pooled&&w?(weighted/w)/pooled:0};
 }
 return out;
}

function featureDistributions(A,B,keys){
 const out={};
 for(const k of keys){
  const da=dist(A,k),db=dist(B,k),vals=[...new Set([...Object.keys(da),...Object.keys(db)])].map(Number).sort((a,b)=>a-b);
  out[k]={one:da,multi:db,values:vals,oneN:A.filter(x=>Number.isFinite(x[k])).length,multiN:B.filter(x=>Number.isFinite(x[k])).length};
 }
 return out;
}
module.exports=async function(req,res){
 try{
  const live=await buildLiveBase(base,{force:false}),pages=[],latestContest=Number(live.latest?.concurso||live.history.at(-1)?.concurso||live.history.length||0),pageCount=Math.max(1,Math.ceil(latestContest/50)+1);
  for(let start=1;start<=pageCount;start+=12){
   const nums=Array.from({length:Math.min(12,pageCount-start+1)},(_,i)=>start+i);
   pages.push(...await Promise.all(nums.map(fetchPage)));
  }
  const winRows=pages.flat().sort((a,b)=>a.concurso-b.concurso),winMap=new Map(winRows.map(x=>[x.concurso,x])),all=[];
  for(let i=0;i<live.history.length;i++){
   const d=live.history[i],w=winMap.get(d.concurso);if(!w)continue;
   const prev=i?live.history[i-1]:null,prevW=prev?winMap.get(prev.concurso):null;
   all.push({...d,...feat(d,prev),winners:w.winners,accumulated:w.accumulated,bets:w.bets,afterAccum:!!prevW?.accumulated});
  }
  const one=all.filter(x=>x.winners===1),multi=all.filter(x=>x.winners>=2);
  const afterOne=all.filter(x=>x.afterAccum&&x.winners===1),afterMulti=all.filter(x=>x.afterAccum&&x.winners>=2);
  const keys=['minLine','maxLine','lineExtreme','adjacent','longest','distinctColors','colExtreme','minCol','fullColors'];
  const latestContest=all.at(-1)||null;
  const med=a=>{const b=a.filter(Number.isFinite).sort((x,y)=>x-y);if(!b.length)return null;const m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2;};
  const betSummary=rows=>{const a=rows.map(x=>x.bets).filter(Number.isFinite);return{n:a.length,mean:mean(a),median:med(a)};};
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
  res.status(200).json({
   ok:true,checkedAt:new Date().toISOString(),source:SOURCE,
   counts:{all:all.length,one:one.length,multi:multi.length,afterOne:afterOne.length,afterMulti:afterMulti.length},
   latest:{contest:latestContest?.concurso||null,date:latestContest?.data||null,accumulated:!!latestContest?.accumulated,winners:latestContest?.winners??null},
   weights:{lines:40,sequences:30,diversity:15,postAccum:15},
   model:{
    general:featureDistributions(one,multi,keys),
    postAccum:featureDistributions(afterOne,afterMulti,keys)
   },
   references:{
    one:{minLine:mean(one.map(x=>x.minLine)),maxLine:mean(one.map(x=>x.maxLine)),lineExtremePct:mean(one.map(x=>x.lineExtreme))*100,adjacent:mean(one.map(x=>x.adjacent)),longest:mean(one.map(x=>x.longest)),distinctColors:mean(one.map(x=>x.distinctColors)),colExtremePct:mean(one.map(x=>x.colExtreme))*100},
    multi:{minLine:mean(multi.map(x=>x.minLine)),maxLine:mean(multi.map(x=>x.maxLine)),lineExtremePct:mean(multi.map(x=>x.lineExtreme))*100,adjacent:mean(multi.map(x=>x.adjacent)),longest:mean(multi.map(x=>x.longest)),distinctColors:mean(multi.map(x=>x.distinctColors)),colExtremePct:mean(multi.map(x=>x.colExtreme))*100},
    afterOne:{minLine:mean(afterOne.map(x=>x.minLine)),maxLine:mean(afterOne.map(x=>x.maxLine)),lineExtremePct:mean(afterOne.map(x=>x.lineExtreme))*100,adjacent:mean(afterOne.map(x=>x.adjacent)),longest:mean(afterOne.map(x=>x.longest)),distinctColors:mean(afterOne.map(x=>x.distinctColors)),colExtremePct:mean(afterOne.map(x=>x.colExtreme))*100},
    afterMulti:{minLine:mean(afterMulti.map(x=>x.minLine)),maxLine:mean(afterMulti.map(x=>x.maxLine)),lineExtremePct:mean(afterMulti.map(x=>x.lineExtreme))*100,adjacent:mean(afterMulti.map(x=>x.adjacent)),longest:mean(afterMulti.map(x=>x.longest)),distinctColors:mean(afterMulti.map(x=>x.distinctColors)),colExtremePct:mean(afterMulti.map(x=>x.colExtreme))*100}
   },
   bets:{one:betSummary(one),multi:betSummary(multi),afterOne:betSummary(afterOne),afterMulti:betSummary(afterMulti)}
  });
 }catch(e){
  res.setHeader('Cache-Control','no-store');
  res.status(500).json({ok:false,error:String(e&&e.message||e),checkedAt:new Date().toISOString(),source:SOURCE});
 }
};