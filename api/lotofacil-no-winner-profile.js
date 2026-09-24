const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
  try{
    const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-Inteligente/3.7.4'},cache:'no-store',signal:ac.signal});
    if(!r.ok)throw new Error('Fonte de acumulados HTTP '+r.status);
    const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;
    while((rm=rowRe.exec(html))){
      const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));
      if(cells.length<18)continue;
      const concurso=Number((cells[0].match(/\d+/)||[])[0]),data=(cells[1].match(/\d{2}\/\d{2}\/\d{4}/)||[])[0];
      if(Number.isInteger(concurso)&&data&&/^Acum\.?$/i.test(cells[17]))out.push({concurso,data});
    }
    return out;
  }finally{clearTimeout(timer);}
}
const mean=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0;
function quantile(values,p){if(!values.length)return 0;const a=[...values].sort((x,y)=>x-y),i=(a.length-1)*p,lo=Math.floor(i),hi=Math.ceil(i);return lo===hi?a[lo]:a[lo]+(a[hi]-a[lo])*(i-lo);}
function dist(rows,key){const o={};for(const x of rows){const v=x[key];if(v==null)continue;o[v]=(o[v]||0)+1;}return o;}
function profile(history,accumulated){
  const setAcc=new Set(accumulated.map(x=>x.concurso)),centerS=new Set([7,8,9,12,13,14,17,18,19]),all=[],acc=[];
  const colorDefs=[
    {name:'Vermelha',key:1,nums:[1,11,21]},{name:'Amarela',key:2,nums:[2,12,22]},{name:'Verde',key:3,nums:[3,13,23]},
    {name:'Marrom',key:4,nums:[4,14,24]},{name:'Azul',key:5,nums:[5,15,25]},{name:'Rosa',key:6,nums:[6,16]},
    {name:'Preta',key:7,nums:[7,17]},{name:'Cinza',key:8,nums:[8,18]},{name:'Laranja',key:9,nums:[9,19]},{name:'Branca',key:0,nums:[10,20]}
  ];
  for(let i=0;i<history.length;i++){
    const d=history[i],nums=d.dezenas,set=new Set(nums),lines=[0,0,0,0,0],cols=[0,0,0,0,0];
    for(const n of nums){lines[Math.floor((n-1)/5)]++;cols[(n-1)%5]++;}
    let adjacent=0;for(let n=1;n<25;n++)if(set.has(n)&&set.has(n+1))adjacent++;
    const colorCounts={};let distinctColors=0,fullColors=0,absentColors=0;
    for(const color of colorDefs){const count=color.nums.filter(n=>set.has(n)).length;colorCounts[color.name]=count;if(count>0)distinctColors++;else absentColors++;if(count===color.nums.length)fullColors++;}
    const row={concurso:d.concurso,data:d.data,dezenas:nums,sum:nums.reduce((a,b)=>a+b,0),odd:nums.filter(n=>n%2).length,repeat:i?nums.filter(n=>history[i-1].dezenas.includes(n)).length:null,center:nums.filter(n=>centerS.has(n)).length,lines,cols,adjacent,colorCounts,distinctColors,fullColors,absentColors};
    all.push(row);if(setAcc.has(d.concurso))acc.push(row);
  }
  if(acc.length!==accumulated.length)throw new Error('Há concursos acumulados ausentes na base histórica.');
  const freq=Array(26).fill(0),freqAll=Array(26).fill(0);for(const d of acc)for(const n of d.dezenas)freq[n]++;for(const d of all)for(const n of d.dezenas)freqAll[n]++;
  const intersection=acc.length?acc.reduce((s,d)=>new Set([...s].filter(n=>d.dezenas.includes(n))),new Set(acc[0].dezenas)) : new Set();
  const nums=Array.from({length:25},(_,i)=>i+1).map(n=>({n,count:freq[n],pct:freq[n]/Math.max(1,acc.length)*100,allCount:freqAll[n],allPct:freqAll[n]/Math.max(1,all.length)*100,delta:(freq[n]/Math.max(1,acc.length)-freqAll[n]/Math.max(1,all.length))*100}));
  const repA=acc.filter(x=>x.repeat!=null),repAll=all.filter(x=>x.repeat!=null),extreme=(rows,k)=>rows.filter(x=>Math.max(...x[k])===5||Math.min(...x[k])===0).length/Math.max(1,rows.length)*100;
  const sums=acc.map(x=>x.sum),odds=acc.map(x=>x.odd),reps=repA.map(x=>x.repeat),adjs=acc.map(x=>x.adjacent);
  const sumsAll=all.map(x=>x.sum),oddsAll=all.map(x=>x.odd),repsAll=repAll.map(x=>x.repeat),adjsAll=all.map(x=>x.adjacent);
  const winners=all.filter(x=>!setAcc.has(x.concurso));
  const colorDist=rows=>rows.reduce((o,x)=>{o[x.distinctColors]=(o[x.distinctColors]||0)+1;return o;},{});
  const colorSummary=colorDefs.map(color=>{
    const a=acc.map(x=>x.colorCounts[color.name]),w=winners.map(x=>x.colorCounts[color.name]),size=color.nums.length;
    const absentAcc=a.filter(v=>v===0).length/Math.max(1,a.length)*100,absentWin=w.filter(v=>v===0).length/Math.max(1,w.length)*100;
    const fullAcc=a.filter(v=>v===size).length/Math.max(1,a.length)*100,fullWin=w.filter(v=>v===size).length/Math.max(1,w.length)*100;
    return{name:color.name,key:color.key,nums:color.nums,size,meanAcc:mean(a),meanWin:mean(w),deltaMean:mean(a)-mean(w),absentAcc,absentWin,absentDelta:absentAcc-absentWin,fullAcc,fullWin,fullDelta:fullAcc-fullWin};
  });
  const rose=colorSummary.find(x=>x.name==='Rosa');
  const q=a=>({p10:quantile(a,.10),p50:quantile(a,.50),p90:quantile(a,.90)});
  return{
    count:acc.length,allCount:all.length,pct:acc.length/Math.max(1,all.length)*100,
    first:acc[0]?{concurso:acc[0].concurso,data:acc[0].data}:null,last:acc.at(-1)?{concurso:acc.at(-1).concurso,data:acc.at(-1).data}:null,
    intersection:[...intersection],
    averages:{sum:mean(sums),sumAll:mean(sumsAll),repeat:mean(reps),repeatAll:mean(repsAll),center:mean(acc.map(x=>x.center)),centerAll:mean(all.map(x=>x.center)),adjacent:mean(adjs),adjacentAll:mean(adjsAll),lineExtreme:extreme(acc,'lines'),lineExtremeAll:extreme(all,'lines'),colExtreme:extreme(acc,'cols'),colExtremeAll:extreme(all,'cols')},
    ranges:{sum:q(sums),sumAll:q(sumsAll),odd:q(odds),oddAll:q(oddsAll),repeat:q(reps),repeatAll:q(repsAll),adjacent:q(adjs),adjacentAll:q(adjsAll)},
    oddDist:dist(acc,'odd'),oddDistAll:dist(all,'odd'),repeatDist:dist(acc,'repeat'),repeatDistAll:dist(all,'repeat'),
    colors:{
      winnerCount:winners.length,
      distinctAcc:colorDist(acc),distinctWin:colorDist(winners),
      meanDistinctAcc:mean(acc.map(x=>x.distinctColors)),meanDistinctWin:mean(winners.map(x=>x.distinctColors)),
      pct8to10Acc:acc.filter(x=>x.distinctColors>=8).length/Math.max(1,acc.length)*100,pct8to10Win:winners.filter(x=>x.distinctColors>=8).length/Math.max(1,winners.length)*100,
      pct9to10Acc:acc.filter(x=>x.distinctColors>=9).length/Math.max(1,acc.length)*100,pct9to10Win:winners.filter(x=>x.distinctColors>=9).length/Math.max(1,winners.length)*100,
      meanAbsentAcc:mean(acc.map(x=>x.absentColors)),meanAbsentWin:mean(winners.map(x=>x.absentColors)),
      meanFullAcc:mean(acc.map(x=>x.fullColors)),meanFullWin:mean(winners.map(x=>x.fullColors)),
      rose,byColor:colorSummary
    },
    numbers:nums,yearCounts:acc.reduce((o,x)=>{const y=String(x.data||'').slice(-4);o[y]=(o[y]||0)+1;return o;}),
    latestIds:acc.slice(-12).map(x=>x.concurso)
  };
}
module.exports=async function handler(req,res){
  try{
    const live=await buildLiveBase(base,{force:false}),pages=[],latestContest=Number(live.latest?.concurso||live.history.at(-1)?.concurso||live.history.length||0),pageCount=Math.max(1,Math.ceil(latestContest/50)+1);
    for(let start=1;start<=pageCount;start+=12){const nums=Array.from({length:Math.min(12,pageCount-start+1)},(_,i)=>start+i);pages.push(...await Promise.all(nums.map(fetchPage)));}
    const accumulated=[...new Map(pages.flat().map(x=>[x.concurso,x])).values()].sort((a,b)=>a.concurso-b.concurso);
    if(accumulated.length<400)throw new Error('Fonte retornou quantidade insuficiente de concursos acumulados.');
    const data=profile(live.history,accumulated);
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json({ok:true,checkedAt:new Date().toISOString(),source:SOURCE,sourceLabel:'Loteria da Caixa · tabela histórica de ganhadores',liveBase:{latest:live.latest?.concurso||live.history.at(-1)?.concurso,validation:live.baseValidation||null},...data});
  }catch(e){
    res.setHeader('Cache-Control','no-store');
    res.status(500).json({ok:false,error:String(e&&e.message||e),checkedAt:new Date().toISOString(),source:SOURCE});
  }
};