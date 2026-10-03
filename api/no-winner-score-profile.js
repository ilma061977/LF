const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){
  const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);
  try{
    const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-NoWinnerScore/1.0'},cache:'no-store',signal:ac.signal});
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
const median=a=>{if(!a.length)return null;const b=[...a].sort((x,y)=>x-y),m=Math.floor(b.length/2);return b.length%2?b[m]:(b[m-1]+b[m])/2;};
const dist=(rows,key)=>{const o={};for(const x of rows){const v=x[key];if(v==null)continue;o[v]=(o[v]||0)+1;}return o;};
function featureDistributions(A,B,keys){
  const out={};
  for(const k of keys){
    const da=dist(A,k),db=dist(B,k),values=[...new Set([...Object.keys(da),...Object.keys(db)])].map(v=>Number.isFinite(Number(v))?Number(v):v);
    out[k]={noWinner:da,winner:db,values,noWinnerN:A.filter(x=>x[k]!=null).length,winnerN:B.filter(x=>x[k]!=null).length};
  }
  return out;
}
function buildFeatures(history,accSet){
  const colorDefs=[[1,11,21],[2,12,22],[3,13,23],[4,14,24],[5,15,25],[6,16],[7,17],[8,18],[9,19],[10,20]];
  return history.map(d=>{
    const g=d.dezenas,set=new Set(g),lines=[0,0,0,0,0],cols=[0,0,0,0,0];
    for(const n of g){lines[Math.floor((n-1)/5)]++;cols[(n-1)%5]++;}
    let adjacent=0,longest=0,run=0;
    for(let n=1;n<=25;n++){
      if(set.has(n)){run++;longest=Math.max(longest,run);}else run=0;
      if(n<25&&set.has(n)&&set.has(n+1))adjacent++;
    }
    let distinctColors=0,fullColors=0;
    for(const nums of colorDefs){const c=nums.filter(n=>set.has(n)).length;if(c>0)distinctColors++;if(c===nums.length)fullColors++;}
    const min=Math.min(...g),max=Math.max(...g);
    return{
      concurso:d.concurso,data:d.data,dezenas:g,noWinner:accSet.has(d.concurso),
      min,max,startEnd:min+'-'+max,
      minLine:Math.min(...lines),maxLine:Math.max(...lines),lineExtreme:(Math.min(...lines)===0||Math.max(...lines)===5)?1:0,
      minCol:Math.min(...cols),maxCol:Math.max(...cols),colExtreme:(Math.min(...cols)===0||Math.max(...cols)===5)?1:0,
      adjacent,longest,distinctColors,fullColors
    };
  });
}
function cadenceByPattern(noWinner,latestContest){
  const groups={};
  for(const x of noWinner)(groups[x.startEnd]||(groups[x.startEnd]=[])).push(x.concurso);
  const out={};
  for(const [pattern,ids] of Object.entries(groups)){
    ids.sort((a,b)=>a-b);
    const intervals=[];for(let i=1;i<ids.length;i++)intervals.push(ids[i]-ids[i-1]);
    const lastContest=ids.at(-1);
    out[pattern]={
      count:ids.length,lastContest,currentGap:latestContest-lastContest,
      meanInterval:intervals.length?mean(intervals):null,
      medianInterval:intervals.length?median(intervals):null,
      minInterval:intervals.length?Math.min(...intervals):null,
      maxInterval:intervals.length?Math.max(...intervals):null
    };
  }
  return out;
}
module.exports=async function handler(req,res){
  try{
    const live=await buildLiveBase(base,{force:false}),pages=[],latestContestNumber=Number(live.latest?.concurso||live.history.at(-1)?.concurso||live.history.length||0),pageCount=Math.max(1,Math.ceil(latestContestNumber/50)+1);
    for(let start=1;start<=pageCount;start+=12){
      const nums=Array.from({length:Math.min(12,pageCount-start+1)},(_,i)=>start+i);
      pages.push(...await Promise.all(nums.map(fetchPage)));
    }
    const accumulated=[...new Map(pages.flat().map(x=>[x.concurso,x])).values()].sort((a,b)=>a.concurso-b.concurso);
    if(accumulated.length<400)throw new Error('Fonte retornou quantidade insuficiente de concursos acumulados.');
    const accSet=new Set(accumulated.map(x=>x.concurso)),all=buildFeatures(live.history,accSet);
    const noWinner=all.filter(x=>x.noWinner),winner=all.filter(x=>!x.noWinner);
    if(noWinner.length!==accumulated.length)throw new Error('Há concursos acumulados ausentes na base histórica.');
    const keys=['minLine','maxLine','lineExtreme','minCol','maxCol','colExtreme','adjacent','longest','distinctColors','fullColors','startEnd'];
    const latestContest=all.at(-1)?.concurso||0;
    const startEndNo=dist(noWinner,'startEnd'),startEndWin=dist(winner,'startEnd');
    const patterns={};
    for(const p of new Set([...Object.keys(startEndNo),...Object.keys(startEndWin)])){
      const a=Number(startEndNo[p]||0),w=Number(startEndWin[p]||0);
      patterns[p]={noWinner:a,winner:w,noWinnerPct:a/Math.max(1,noWinner.length)*100,winnerPct:w/Math.max(1,winner.length)*100};
    }
    res.setHeader('Cache-Control','public, max-age=0, s-maxage=21600, stale-while-revalidate=86400');
    res.status(200).json({
      ok:true,checkedAt:new Date().toISOString(),source:SOURCE,
      latest:{contest:latestContest,date:all.at(-1)?.data||null},
      counts:{noWinner:noWinner.length,winner:winner.length,all:all.length},
      weights:{lines:40,sequences:30,diversity:15,startEnd:10,cadence:5},
      guidance:{
        colorsLt8:{count:noWinner.filter(x=>x.distinctColors<8).length,pct:noWinner.filter(x=>x.distinctColors<8).length/Math.max(1,noWinner.length)*100,action:'block-existing',penalty:12,label:'Menos de 8 cores'},
        startGte5:{count:noWinner.filter(x=>x.min>=5).length,pct:noWinner.filter(x=>x.min>=5).length/Math.max(1,noWinner.length)*100,action:'strong-warning',penalty:8,label:'Início 05+'},
        endLte22:{count:noWinner.filter(x=>x.max<=22).length,pct:noWinner.filter(x=>x.max<=22).length/Math.max(1,noWinner.length)*100,action:'warning',penalty:5,label:'Final 22 ou menor'},
        fullColorsLte1:{count:noWinner.filter(x=>x.fullColors<=1).length,pct:noWinner.filter(x=>x.fullColors<=1).length/Math.max(1,noWinner.length)*100,action:'score-penalty',penalty:3,label:'0–1 cor completa'},
        neutral:[
          {key:'startEndCommon',label:'01→25 e 04→25',action:'score-only'},
          {key:'lineExtreme',label:'Linha extrema 0/5',action:'score-only'},
          {key:'sequences',label:'Sequências +1 / maior sequência',action:'score-only'}
        ],
        bottom5:{action:'monitor-only',label:'Bottom 5% de compatibilidade',note:'Não bloquear sem validação walk-forward específica.'}
      },
      model:featureDistributions(noWinner,winner,keys),
      patterns,
      cadence:cadenceByPattern(noWinner,latestContest),
      references:{
        noWinner:{minLine:mean(noWinner.map(x=>x.minLine)),maxLine:mean(noWinner.map(x=>x.maxLine)),lineExtremePct:mean(noWinner.map(x=>x.lineExtreme))*100,adjacent:mean(noWinner.map(x=>x.adjacent)),longest:mean(noWinner.map(x=>x.longest)),distinctColors:mean(noWinner.map(x=>x.distinctColors)),colExtremePct:mean(noWinner.map(x=>x.colExtreme))*100},
        winner:{minLine:mean(winner.map(x=>x.minLine)),maxLine:mean(winner.map(x=>x.maxLine)),lineExtremePct:mean(winner.map(x=>x.lineExtreme))*100,adjacent:mean(winner.map(x=>x.adjacent)),longest:mean(winner.map(x=>x.longest)),distinctColors:mean(winner.map(x=>x.distinctColors)),colExtremePct:mean(winner.map(x=>x.colExtreme))*100}
      }
    });
  }catch(e){
    res.setHeader('Cache-Control','no-store');
    res.status(500).json({ok:false,error:String(e&&e.message||e),checkedAt:new Date().toISOString(),source:SOURCE});
  }
};