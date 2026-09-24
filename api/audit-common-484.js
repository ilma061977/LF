const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
module.exports=async function handler(req,res){
 const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
 async function fetchPage(pg){
  const url='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/?pg='+pg;
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
  try{
   const r=await fetch(url,{headers:{'user-agent':'Mozilla/5.0 LF-Audit/1.0'},cache:'no-store',signal:ac.signal});
   if(!r.ok)throw new Error('HTTP '+r.status);
   const html=await r.text(),out=[]; const rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi; let rm;
   while((rm=rowRe.exec(html))){
    const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
    if(cells.length<18)continue;
    const concurso=Number((cells[0].match(/\d+/)||[])[0]);
    if(Number.isInteger(concurso)&&/^Acum\.?$/i.test(cells[17]))out.push(concurso);
   }
   return out;
  } finally{clearTimeout(timer);}
 }
 try{
  const pages=[];
  for(let start=1;start<=76;start+=12){const nums=Array.from({length:Math.min(12,77-start)},(_,i)=>start+i);pages.push(...await Promise.all(nums.map(fetchPage)));}
  const accSet=new Set(pages.flat());
  const live=await buildLiveBase(base,{force:true}),H=live.history;
  const centerS=new Set([7,8,9,12,13,14,17,18,19]);
  function metrics(d,prev){const nums=d.dezenas,set=new Set(nums),sum=nums.reduce((a,b)=>a+b,0),odd=nums.filter(n=>n%2).length,repeat=prev?nums.filter(n=>prev.dezenas.includes(n)).length:null,lines=[0,0,0,0,0],cols=[0,0,0,0,0];for(const n of nums){lines[Math.floor((n-1)/5)]++;cols[(n-1)%5]++;}const center=nums.filter(n=>centerS.has(n)).length;let adj=0;for(let n=1;n<25;n++)if(set.has(n)&&set.has(n+1))adj++;return{sum,odd,repeat,lines,cols,center,adj};}
  const all=[],acc=[];for(let i=0;i<H.length;i++){const row={...H[i],...metrics(H[i],i?H[i-1]:null)};all.push(row);if(accSet.has(row.concurso))acc.push(row);}
  const avg=a=>a.reduce((x,y)=>x+y,0)/a.length,dist=(arr,key)=>{const o={};for(const x of arr){const v=x[key];if(v==null)continue;o[v]=(o[v]||0)+1;}return o;};
  const freq=Array(26).fill(0),freqAll=Array(26).fill(0);for(const d of acc)for(const n of d.dezenas)freq[n]++;for(const d of all)for(const n of d.dezenas)freqAll[n]++;
  const inter=acc.reduce((s,d)=>new Set([...s].filter(n=>d.dezenas.includes(n))),new Set(acc[0]?.dezenas||[]));
  const nums=Array.from({length:25},(_,i)=>i+1).map(n=>({n,count:freq[n],pct:+(freq[n]/acc.length*100).toFixed(2),allPct:+(freqAll[n]/all.length*100).toFixed(2),delta:+((freq[n]/acc.length-freqAll[n]/all.length)*100).toFixed(2)}));
  const extreme=(arr,k)=>arr.filter(x=>Math.max(...x[k])===5||Math.min(...x[k])===0).length/arr.length*100;
  const repA=acc.filter(x=>x.repeat!=null),repAll=all.filter(x=>x.repeat!=null);
  res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,count:acc.length,allCount:all.length,intersection:[...inter],top:[...nums].sort((a,b)=>b.delta-a.delta).slice(0,10),bottom:[...nums].sort((a,b)=>a.delta-b.delta).slice(0,10),avgSum:+avg(acc.map(x=>x.sum)).toFixed(2),avgSumAll:+avg(all.map(x=>x.sum)).toFixed(2),sumMin:Math.min(...acc.map(x=>x.sum)),sumMax:Math.max(...acc.map(x=>x.sum)),oddDist:dist(acc,'odd'),oddDistAll:dist(all,'odd'),avgRepeat:+avg(repA.map(x=>x.repeat)).toFixed(3),avgRepeatAll:+avg(repAll.map(x=>x.repeat)).toFixed(3),repeatDist:dist(acc,'repeat'),repeatDistAll:dist(all,'repeat'),avgCenter:+avg(acc.map(x=>x.center)).toFixed(3),avgCenterAll:+avg(all.map(x=>x.center)).toFixed(3),lineExtremePct:+extreme(acc,'lines').toFixed(2),lineExtremeAllPct:+extreme(all,'lines').toFixed(2),colExtremePct:+extreme(acc,'cols').toFixed(2),colExtremeAllPct:+extreme(all,'cols').toFixed(2),avgAdj:+avg(acc.map(x=>x.adj)).toFixed(3),avgAdjAll:+avg(all.map(x=>x.adj)).toFixed(3),latest:acc.slice(-12).map(x=>x.concurso)});
 }catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}
}