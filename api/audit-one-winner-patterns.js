const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
 const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
 try{
  const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-OneWinnerPattern/1.0'},cache:'no-store',signal:ac.signal});
  if(!r.ok)throw new Error('HTTP '+r.status);
  const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;
  while((rm=rowRe.exec(html))){
   const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
   if(cells.length<18)continue;
   const concurso=Number((cells[0].match(/\d+/)||[])[0]),data=(cells[1].match(/\d{2}\/\d{2}\/\d{4}/)||[])[0],raw=cells[17];
   if(!Number.isInteger(concurso)||!data)continue;
   const accumulated=/^Acum\.?$/i.test(raw),winners=accumulated?0:Number((raw.match(/\d+/)||[])[0]);
   out.push({concurso,data,winners:Number.isFinite(winners)?winners:null,accumulated});
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
module.exports=async function(req,res){
 try{
  const live=await buildLiveBase(base,{force:false}),pages=[];
  for(let start=1;start<=76;start+=12){const nums=Array.from({length:Math.min(12,77-start)},(_,i)=>start+i);pages.push(...await Promise.all(nums.map(fetchPage)));}
  const winRows=pages.flat().sort((a,b)=>a.concurso-b.concurso),winMap=new Map(winRows.map(x=>[x.concurso,x]));
  const all=[];
  for(let i=0;i<live.history.length;i++){
   const d=live.history[i],w=winMap.get(d.concurso);if(!w)continue;
   const prev=i?live.history[i-1]:null,prevW=prev?winMap.get(prev.concurso):null;
   all.push({...d,...feat(d,prev),winners:w.winners,accumulated:w.accumulated,afterAccum:!!prevW?.accumulated,prevAccum:!!prevW?.accumulated,prevWinners:prevW?.winners??null});
  }
  const one=all.filter(x=>x.winners===1),multi=all.filter(x=>x.winners>=2),nonOneWin=all.filter(x=>x.winners>=2);
  const after=all.filter(x=>x.afterAccum),afterOne=after.filter(x=>x.winners===1),afterMulti=after.filter(x=>x.winners>=2),afterAccumAgain=after.filter(x=>x.winners===0);
  const oneNotAfter=one.filter(x=>!x.afterAccum);
  const years=[...new Set(all.map(x=>String(x.data).slice(-4)))];
  const featureNames=['sum','odd','repeat','center','prime','fib','m3','low13','adjacent','longest','min','max','span','maxLine','minLine','lineExtreme','maxCol','minCol','colExtreme','distinctColors','fullColors','absentColors','sumChange'];
  const oneVsMulti=summarize(one,multi,featureNames,years);
  const afterOneVsAfterMulti=summarize(afterOne,afterMulti,featureNames,years);
  const afterOneVsOtherOne=summarize(afterOne,oneNotAfter,featureNames,years);
  const freqCompare=(A,B)=>Array.from({length:25},(_,i)=>i+1).map(n=>{
    const ap=A.filter(x=>x.dezenas.includes(n)).length/Math.max(1,A.length)*100,bp=B.filter(x=>x.dezenas.includes(n)).length/Math.max(1,B.length)*100;
    let weighted=0,w=0;for(const y of years){const ay=A.filter(x=>String(x.data).endsWith(y)),by=B.filter(x=>String(x.data).endsWith(y));if(!ay.length||!by.length)continue;weighted+=((ay.filter(x=>x.dezenas.includes(n)).length/ay.length)-(by.filter(x=>x.dezenas.includes(n)).length/by.length))*ay.length;w+=ay.length;}
    return{n,aPct:ap,bPct:bp,delta:ap-bp,yearAdjustedDelta:w?weighted/w*100:0};
  }).sort((a,b)=>Math.abs(b.yearAdjustedDelta)-Math.abs(a.yearAdjustedDelta));
  const colorCompare=(A,B)=>COLORS.map(([name,nums])=>{
    const aa=A.map(x=>x.colorCounts[name]),bb=B.map(x=>x.colorCounts[name]);
    return{name,nums,aMean:mean(aa),bMean:mean(bb),delta:mean(aa)-mean(bb),absentA:aa.filter(x=>x===0).length/Math.max(1,aa.length)*100,absentB:bb.filter(x=>x===0).length/Math.max(1,bb.length)*100,fullA:aa.filter(x=>x===nums.length).length/Math.max(1,aa.length)*100,fullB:bb.filter(x=>x===nums.length).length/Math.max(1,bb.length)*100};
  }).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
  const repeatPairs=dist(afterOne,'repeat');
  const recent={};
  for(const w of [50,100,200,500]){const tail=all.slice(-w),a=tail.filter(x=>x.winners===1),b=tail.filter(x=>x.afterAccum&&x.winners===1);recent[w]={one:a.length,onePct:a.length/tail.length*100,afterOne:b.length,afterOnePct:b.length/tail.length*100};}
  res.setHeader('Cache-Control','no-store');res.status(200).json({
   ok:true,counts:{all:all.length,one:one.length,multi:multi.length,after:after.length,afterOne:afterOne.length,afterMulti:afterMulti.length,afterAccumAgain:afterAccumAgain.length,oneNotAfter:oneNotAfter.length},
   oneVsMulti,afterOneVsAfterMulti,afterOneVsOtherOne,
   numsOneVsMulti:freqCompare(one,multi),numsAfterOneVsAfterMulti:freqCompare(afterOne,afterMulti),numsAfterOneVsOtherOne:freqCompare(afterOne,oneNotAfter),
   colorsOneVsMulti:colorCompare(one,multi),colorsAfterOneVsAfterMulti:colorCompare(afterOne,afterMulti),
   dist:{oneOdd:dist(one,'odd'),oneRepeat:dist(one,'repeat'),afterOneOdd:dist(afterOne,'odd'),afterOneRepeat:repeatPairs,afterOneColors:dist(afterOne,'distinctColors')},
   recent,
   latestAfterOne:afterOne.slice(-20).map(x=>({concurso:x.concurso,data:x.data,dezenas:x.dezenas,repeat:x.repeat,sum:x.sum,odd:x.odd,distinctColors:x.distinctColors}))
  });
 }catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}
};