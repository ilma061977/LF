self.window=self;
importScripts('./matrix-51.js');
const M=self.LFMatrix51;
const ALL=Array.from({length:25},(_,i)=>i+1);
const MANDATORY_BLOCKS=new Set([29]);
function resolvedPolicy(f,policies={}){return Number(f.id)===29?'block':(policies[f.id]||([28,36,37].includes(Number(f.id))?'block':(MANDATORY_BLOCKS.has(f.id)?'block':(f.id===23?'ignore':f.mode==='core'?'block':f.mode==='advisory'?'warn':'ignore'))));}
const keyOf=g=>g.map(n=>String(n).padStart(2,'0')).join('-');
function blockedFailures(report,policies){const out=report.filters.filter(f=>resolvedPolicy(f,policies)==='block'&&!f.passed);if(report?.patternCooldown?.blocked)out.push({id:'PADRAO',name:'Carência de padrão exato'});if(report?.colorRule?.blocked)out.push({id:'CORES',name:'Regra obrigatória de cores do indicado'});if(report?.lineRepeat?.blocked)out.push({id:'LINHA',name:'Distribuição de linhas igual ao concurso anterior'});if(report?.columnRepeat?.blocked)out.push({id:'COLUNA',name:'Distribuição de colunas igual ao concurso anterior'});if(report?.lineColumnRepeat?.blocked)out.push({id:'L×C',name:'Linha × Coluna igual ao concurso anterior'});return out;}
function warnings(report,policies){return report.filters.filter(f=>resolvedPolicy(f,policies)==='warn'&&!f.passed);}
function indicatedColorValid(game){return !!M.mandatoryColorRule(game)?.passed;}
function colorRuleValid(game){const r=M.mandatoryColorRule(game);return !!r?.passed&&Number(r.complete)===1;}
function colorFeasible(excluded){const block=new Set(excluded||[]),pool=ALL.filter(n=>!block.has(n));if(pool.length<15)return false;for(let t=0;t<800;t++){const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(colorRuleValid(a.slice(0,15)))return true;}return false;}
function randomColorCandidate(excluded){const block=new Set(excluded||[]),pool=ALL.filter(n=>!block.has(n));if(pool.length<15)return null;for(let t=0;t<400;t++){const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}const g=a.slice(0,15).sort((x,y)=>x-y);if(colorRuleValid(g))return g;}return null;}
function randomCandidate(excluded,colorBalanced){const block=new Set(excluded||[]),pool=ALL.filter(n=>!block.has(n));if(pool.length<15)return null;if(colorBalanced)return randomColorCandidate(excluded);for(let t=0;t<160;t++){const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}const g=a.slice(0,15).sort((x,y)=>x-y);if(indicatedColorValid(g))return g;}return null;}
function comb(arr,k){const out=[];const rec=(s,p)=>{if(p.length===k){out.push([...p]);return;}for(let i=s;i<=arr.length-(k-p.length);i++){p.push(arr[i]);rec(i+1,p);p.pop();}};rec(0,[]);return out;}
function eachComb(arr,k,cb,limit=Infinity){let count=0,p=[];const rec=s=>{if(count>=limit)return;if(p.length===k){count++;cb(p);return;}for(let i=s;i<=arr.length-(k-p.length)&&count<limit;i++){p.push(arr[i]);rec(i+1);p.pop();}};rec(0);return count;}
function hits(a,b){const s=new Set(b||[]);return (a||[]).reduce((t,n)=>t+(s.has(n)?1:0),0);}
function mean(a){return a.length?a.reduce((x,y)=>x+y,0)/a.length:0;}
function variance(a){const m=mean(a);return a.length?mean(a.map(x=>(x-m)**2)):0;}
function stdev(a){return Math.sqrt(variance(a));}
function quantile(a,q){if(!a.length)return 0;const s=[...a].sort((x,y)=>x-y),i=Math.max(0,Math.min(s.length-1,Math.round((s.length-1)*q)));return s[i];}
function meanCI(a){if(!a.length)return[0,0];const m=mean(a),se=stdev(a)/Math.sqrt(a.length),d=1.96*se;return[m-d,m+d];}
function makeRng(seed=0x6d2b79f5){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
function randomGame(rng=Math.random){const a=[...ALL];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,15).sort((x,y)=>x-y);}
function patternSignature(game,byRow=true){const c=[0,0,0,0,0];for(const n of game||[])c[byRow?Math.floor((n-1)/5):(n-1)%5]++;return [...c].sort((a,b)=>b-a).join('');}
function bumpPattern(freq,key){freq.set(key,(freq.get(key)||0)+1);}
function topPatternSet(freq){return new Set([...freq].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,7).map(([k])=>k));}
function updateDelays(delay,draw){for(const n of ALL)delay[n]=(delay[n]||0)+1;for(const n of draw?.dezenas||[])delay[n]=0;}
function sampledGames(sampleSize){const total=M.nCk(25,15),n=Math.max(100,Math.min(total,Number(sampleSize)||1000)),out=[];for(let i=0;i<n;i++){const rank=n===1?0:Math.floor(i*(total-1)/(n-1));out.push(M.unrank(ALL,15,rank));}return out;}
function deterministicBestFromPool(ctx,policies,games,rankingConfig=null){let best=null,bestScore=-Infinity,bestRank=-Infinity,bestMeta=null;const virginMode=rankingConfig?.mode==='virgin',vc=virginMode?buildVirginRankContext(ctx.history||[],rankingConfig?.previousVirginGames||[]):null;for(const g of games){if(!indicatedColorValid(g))continue;const s=M.candidateScore(g,ctx,policies);if(!Number.isFinite(s))continue;const meta=virginMode?virginRankMetrics(g,s,vc,rankingConfig?.profile||'strong'):null,rank=meta?.rankScore??s;if(rank>bestRank||(rank===bestRank&&best&&keyOf(g)<keyOf(best))){best=g;bestScore=s;bestRank=rank;bestMeta=meta;}}return{game:best,score:bestScore,rankScore:bestRank,virginMeta:bestMeta};}
function buildIndicatorQuotaSpec(history,rawTargets={}){
  const f=Object.fromEntries(ALL.map(n=>[n,0])),last10=(history||[]).slice(-10);for(const d of last10)for(const n of d.dezenas||[])f[n]=(f[n]||0)+1;
  const hasHistory=(history||[]).length>0,hot=hasHistory?[...ALL].sort((a,b)=>f[b]-f[a]||a-b).slice(0,5):[],cold=hasHistory?[...ALL].sort((a,b)=>f[a]-f[b]||a-b).slice(0,5):[],latest=new Set(history?.at(-1)?.dezenas||[]),last3=(history||[]).slice(-3),three=last3.length===3?ALL.filter(n=>last3.every(d=>(d.dezenas||[]).includes(n))):[];
  const dm={};for(const n of ALL){let delay=0;for(let i=(history||[]).length-1;i>=0&&!(history[i].dezenas||[]).includes(n);i--)delay++;dm[n]=delay;}
  const absent10=hasHistory?ALL.filter(n=>!latest.has(n)):[],delayed=[...absent10].sort((a,b)=>dm[b]-dm[a]||a-b).slice(0,5),availableGroups={hot,cold,latest:[...latest],delayed,three},targets={},groups={};
  for(const key of Object.keys(availableGroups)){const available=availableGroups[key].length,raw=Math.max(1,Math.min(5,Number(rawTargets?.[key])||1));targets[key]=available?Math.min(raw,Math.min(5,available)):0;groups[key]=availableGroups[key].slice(0,targets[key]);}
  return{targets,groups};
}
function quotaAllows(game,spec){
  if(!spec)return true;
  for(const key of Object.keys(spec.targets||{})){const target=Number(spec.targets[key]||0);if(target<=0)continue;const set=new Set(spec.groups?.[key]||[]);let count=0;for(const n of game)if(set.has(n))count++;if(count!==target)return false;}
  if(spec.mode==='random'){const hot=new Set(spec.groups?.hot||[]),cold=new Set(spec.groups?.cold||[]);let union=0;for(const n of game)if(hot.has(n)||cold.has(n))union++;if(union<1||union>8)return false;}
  return true;
}

function proProfileAllows(game,report,profile){
  const rules=Array.isArray(profile?.rules)?profile.rules:[],m=report?.metrics||{},groups=profile?.indicatorGroups||{};
  const hot=new Set(groups.hot||[]),cold=new Set(groups.cold||[]),latest=new Set(groups.latest||[]);
  const h=game.filter(n=>hot.has(n)).length,c=game.filter(n=>cold.has(n)).length,rep=game.filter(n=>latest.has(n)).length,distinctColors=new Set(game.map(n=>n%10)).size;
  if(distinctColors<8||(h===5&&c===5)||(h===0&&c===0)||(h===5&&c===4)||(h===4&&c===5)||rep>=12)return false;
  if(!rules.length)return true;
  for(const r of rules){
    let v=null;
    if(r.metric==='sum')v=m.total;
    else if(r.metric==='odd')v=m.odds;
    else if(r.metric==='prime')v=m.primes;
    else if(r.metric==='fib')v=m.fib;
    else if(r.metric==='m3')v=m.m3;
    else if(r.metric==='border')v=m.border;
    else if(r.metric==='center')v=m.center;
    else if(r.metric==='repeat')v=m.repeated;
    else if(r.metric==='run')v=m.run;
    else if(['hot','cold','latest','delayed','three'].includes(r.metric)){const s=new Set(groups[r.metric]||[]);v=game.filter(n=>s.has(n)).length;}
    else if(String(r.metric||'').startsWith('ending:')){const d=Number(String(r.metric).split(':')[1]);v=game.filter(n=>n%10===d).length;}
    if(v==null||!Number.isFinite(Number(v)))return false;
    const lo=r.min==null?-Infinity:Number(r.min),hi=r.max==null?Infinity:Number(r.max);
    if(v<lo||v>hi)return false;
  }
  return true;
}

function clamp01(x){return Math.max(0,Math.min(100,Number(x)||0));}
function mask25(game){let m=0;for(const n of game||[])m|=(1<<(Number(n)-1));return m>>>0;}
function popcount32(x){x=x>>>0;x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);return (((x+(x>>>4))&0x0F0F0F0F)*0x01010101)>>>24;}
function buildVirginRankContext(history=[],previousVirginGames=[]){
  const hist=(history||[]).map(d=>({contest:Number(d.concurso)||0,mask:mask25(d.dezenas||[])})),pairFreq=new Int32Array(26*26),triFreq=new Int32Array(26*26*26);
  for(const d of history||[]){const g=(d.dezenas||[]).map(Number).sort((a,b)=>a-b);for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++)pairFreq[g[i]*26+g[j]]++;for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++)for(let k=j+1;k<g.length;k++)triFreq[(g[i]*26+g[j])*26+g[k]]++;}
  let pairMin=Infinity,pairMax=-Infinity,triMin=Infinity,triMax=-Infinity;
  for(let a=1;a<=25;a++)for(let b=a+1;b<=25;b++){const v=pairFreq[a*26+b];pairMin=Math.min(pairMin,v);pairMax=Math.max(pairMax,v);for(let d=b+1;d<=25;d++){const t=triFreq[(a*26+b)*26+d];triMin=Math.min(triMin,t);triMax=Math.max(triMax,t);}}
  return{hist,h10:hist.slice(-10),h20:hist.slice(-20),h50:hist.slice(-50),h100:hist.slice(-100),pairFreq,triFreq,pairMin,pairMax,triMin,triMax,previous:(previousVirginGames||[]).map(mask25).filter(Boolean)};
}
function recentOverlapMax(mask,arr){let mx=0;for(const d of arr){const h=popcount32(mask&d.mask);if(h>mx)mx=h;}return mx;}
function virginRankMetrics(game,matrixScore,vc,profile='strong'){
  const mask=mask25(game),top=[],counts={12:0,13:0,14:0,15:0};let max=0;
  for(const d of vc.hist){const h=popcount32(mask&d.mask);if(h>max)max=h;if(h>=12&&h<=15)counts[h]++;if(top.length<10){top.push(h);top.sort((a,b)=>b-a);}else if(h>top[9]){top[9]=h;top.sort((a,b)=>b-a);}}
  const top10avg=top.length?mean(top):0,lastOverlap=vc.hist.length?popcount32(mask&vc.hist.at(-1).mask):0,recent10=recentOverlapMax(mask,vc.h10),recent20=recentOverlapMax(mask,vc.h20),recent50=recentOverlapMax(mask,vc.h50),recent100=recentOverlapMax(mask,vc.h100);
  let pairSum=0,pairN=0,triSum=0,triN=0;
  for(let i=0;i<game.length;i++)for(let j=i+1;j<game.length;j++){pairSum+=vc.pairFreq[game[i]*26+game[j]];pairN++;for(let k=j+1;k<game.length;k++){triSum+=vc.triFreq[(game[i]*26+game[j])*26+game[k]];triN++;}}
  const pairAvg=pairN?pairSum/pairN:0,triAvg=triN?triSum/triN:0,pairNovel=clamp01((vc.pairMax-pairAvg)/Math.max(1,vc.pairMax-vc.pairMin)*100),triNovel=clamp01((vc.triMax-triAvg)/Math.max(1,vc.triMax-vc.triMin)*100),pairTripleScore=(pairNovel+triNovel)/2;
  let priorMax=0;for(const pm of vc.previous)priorMax=Math.max(priorMax,popcount32(mask&pm));const diversityScore=vc.previous.length?clamp01((15-priorMax)/5*100):100;
  const score13=clamp01(100-counts[13]*10),score12=clamp01(100-Math.max(0,counts[12]-30)*1.5),neighborScore=clamp01((13.5-top10avg)/1.5*100);
  const overlapScore=x=>clamp01((13-x)/4*100),recentScore=.5*overlapScore(recent10)+.3*overlapScore(recent50)+.2*overlapScore(recent100);
  const virginScore=clamp01(.35*score13+.25*score12+.20*neighborScore+.10*recentScore+.05*pairTripleScore+.05*diversityScore);
  const matrixNorm=clamp01((Number(matrixScore)-70)/18*100),weights=profile==='light'?{matrix:.7,virgin:.3}:profile==='max'?{matrix:.3,virgin:.7}:{matrix:.5,virgin:.5},rankScore=weights.matrix*matrixNorm+weights.virgin*virginScore;
  const sensitivity={light:.7*matrixNorm+.3*virginScore,strong:.5*matrixNorm+.5*virginScore,max:.3*matrixNorm+.7*virginScore};
  return{matrixScore:Number(matrixScore),matrixNorm:+matrixNorm.toFixed(2),virginScore:+virginScore.toFixed(2),rankScore:+rankScore.toFixed(2),profile,maxHistorical:max,n13:counts[13],n12:counts[12],top10Avg:+top10avg.toFixed(2),lastOverlap,recent10,recent20,recent50,recent100,pairAvg:+pairAvg.toFixed(2),triAvg:+triAvg.toFixed(2),pairTripleScore:+pairTripleScore.toFixed(2),previousVirginMaxOverlap:priorMax||null,diversityScore:+diversityScore.toFixed(2),sensitivity:{light:+sensitivity.light.toFixed(2),strong:+sensitivity.strong.toFixed(2),max:+sensitivity.max.toFixed(2)}};
}
function paretoUpdate(front,entry){
  const e=entry.virginMeta;if(!e)return;
  if(front.some(x=>x.virginMeta.matrixNorm>=e.matrixNorm&&x.virginMeta.virginScore>=e.virginScore&&(x.virginMeta.matrixNorm>e.matrixNorm||x.virginMeta.virginScore>e.virginScore)))return;
  for(let i=front.length-1;i>=0;i--){const x=front[i].virginMeta;if(e.matrixNorm>=x.matrixNorm&&e.virginScore>=x.virginScore&&(e.matrixNorm>x.matrixNorm||e.virginScore>x.virginScore))front.splice(i,1);}
  front.push(entry);
}
function exhaustiveCompare(a,b){const ar=Number(a.rankScore??a.score),br=Number(b.rankScore??b.score);return br-ar||Number(b.score)-Number(a.score)||keyOf(a.game).localeCompare(keyOf(b.game));}
function diverseVirginTop(top,limit=10){
  const source=top.slice(0,Math.min(300,top.length)),selected=[];if(!source.length)return selected;selected.push(source.shift());
  while(selected.length<limit&&source.length){let pick=-1;for(const cap of [12,13,14,15]){pick=source.findIndex(x=>selected.every(s=>hits(x.game,s.game)<=cap));if(pick>=0)break;}if(pick<0)break;selected.push(source.splice(pick,1)[0]);}
  return selected;
}
function virginPortfolioCoverage(entries=[]){
  const nums=new Set(),pairs=new Set(),triples=new Set(),games=entries.map(x=>x.game||x).filter(g=>Array.isArray(g)&&g.length===15);
  for(const g of games){for(const n of g)nums.add(n);for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){pairs.add(g[i]+'-'+g[j]);for(let k=j+1;k<g.length;k++)triples.add(g[i]+'-'+g[j]+'-'+g[k]);}}
  return{games:games.length,numbers:nums.size,pairs:pairs.size,triples:triples.size,pairPct:+(pairs.size/300*100).toFixed(1),triplePct:+(triples.size/2300*100).toFixed(1)};
}
function insertExhaustiveTop(top,entry,limit){let lo=0,hi=top.length;while(lo<hi){const mid=(lo+hi)>>1;if(exhaustiveCompare(entry,top[mid])<0)hi=mid;else lo=mid+1;}top.splice(lo,0,entry);if(top.length>limit)top.pop();}
function exhaustiveBest(ctx,policies,excluded=[],rankIndex=0,topLimit=200,progressInfo=null,quotaSpec=null,proProfile=null,rankingConfig=null,boundary=null,fixedNumbers=[]){
  const block=new Set((excluded||[]).map(Number)),start=Number(boundary?.start)||null,end=Number(boundary?.end)||null;
  const invalidBoundary=(start!=null&&(start<1||start>11))||(end!=null&&(end<15||end>25))||(start!=null&&end!=null&&end-start+1<15);
  const fixed=[...new Set((fixedNumbers||[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=25))],forced=[...new Set([...fixed,...[start,end].filter(Number.isFinite)])];
  if(invalidBoundary||fixed.length>15||fixed.some(n=>block.has(n))||forced.some(n=>(start!=null&&n<start)||(end!=null&&n>end))||forced.some(n=>block.has(n)))return{game:null,score:-Infinity,tested:0,total:0,approvedCount:0,eligibleCount:0,rankIndex,topGames:[],topScores:[],diagnostics:{boundaryRejected:true,start,end,fixed,reason:invalidBoundary?'Faixa início/fim impossível':fixed.length>15?'Mais de 15 dezenas fixas':fixed.some(n=>block.has(n))?'Dezena fixa também bloqueada':forced.some(n=>(start!=null&&n<start)||(end!=null&&n>end))?'Dezena fixa fora da faixa':'Dezena inicial/final bloqueada'}};
  const pool=ALL.filter(n=>!block.has(n)&&(start==null||n>=start)&&(end==null||n<=end)&&!forced.includes(n)),choose=15-forced.length;
  if(choose<0||pool.length<choose)return{game:null,score:-Infinity,tested:0,total:0,approvedCount:0,eligibleCount:0,rankIndex,topGames:[],topScores:[],diagnostics:{boundaryRejected:true,start,end,reason:'Faixa/exclusões não permitem formar 15 dezenas'}};
  const total=M.nCk(pool.length,choose),limit=Math.max(rankIndex+1,Math.min(1000,Number(topLimit)||200)),top=[],virginMode=rankingConfig?.mode==='virgin',virginProfile=rankingConfig?.profile||'strong',virginCtx=virginMode?buildVirginRankContext(ctx.history||[],rankingConfig?.previousVirginGames||[]):null,pareto=[];let tested=0,approvedCount=0,eligibleCount=0,lastProgress=0,maskSum=0,maskXor=0,firstMask=null,lastMask=null,virginScoreSum=0,virginScoreCount=0,virginN13Sum=0,virginN12Sum=0,virginNeighborSum=0,virginLastSum=0,approvedHitDist=Object.fromEntries(Array.from({length:16},(_,i)=>[i,0])),virginHistogram=Array(101).fill(0);
  const diag={colorPreRejected:0,patternRejected:0,colorRuleRejected:0,lineRepeatRejected:0,columnRepeatRejected:0,lineColumnRejected:0,quotaRejected:0,boundary:{start,end,forced:[...forced],universe:total},filterFirst:{},filterAny:{}};
  const progressEvery=Math.max(100,Math.min(500,Math.floor(total/1000)));if(!progressInfo)postMessage({type:'progress',tested:0,total,maxAttempts:total,found:0,approvedCount:0,eligibleCount:0,mode:'Busca exaustiva iniciada · preparando varredura integral'});
  eachComb(pool,choose,gref=>{const g=[...forced,...gref].sort((a,b)=>a-b);tested++;let mask=0;for(const n of g)mask|=1<<(n-1);maskSum+=mask;maskXor^=mask;if(firstMask===null)firstMask=mask;lastMask=mask;
    if(!indicatedColorValid(g)){diag.colorPreRejected++;}
    else{
      const report=M.inspect(g,ctx),score=M.candidateScoreFromReport?M.candidateScoreFromReport(report,ctx,policies):M.candidateScore(g,ctx,policies);
      if(!Number.isFinite(score)){
        if(report?.patternCooldown?.blocked)diag.patternRejected++;
        if(report?.colorRule?.blocked)diag.colorRuleRejected++;if(report?.lineRepeat?.blocked)diag.lineRepeatRejected++;if(report?.columnRepeat?.blocked)diag.columnRepeatRejected++;if(report?.lineColumnRepeat?.blocked)diag.lineColumnRejected++;
        const blocked=report?.filters?.filter(f=>resolvedPolicy(f,policies)==='block'&&!f.passed)||[];
        for(const f of blocked)diag.filterAny[f.id]=(diag.filterAny[f.id]||0)+1;
        if(blocked.length)diag.filterFirst[blocked[0].id]=(diag.filterFirst[blocked[0].id]||0)+1;
      }else{
        approvedCount++;if(progressInfo?.targetDraw)approvedHitDist[hits(g,progressInfo.targetDraw)]++;
        if(quotaAllows(g,quotaSpec)&&proProfileAllows(g,report,proProfile)){eligibleCount++;if(virginMode){const virginMeta=virginRankMetrics(g,score,virginCtx,virginProfile),entry={game:g,score,rankScore:virginMeta.rankScore,virginMeta};virginScoreSum+=virginMeta.virginScore;virginN13Sum+=virginMeta.n13;virginN12Sum+=virginMeta.n12;virginNeighborSum+=virginMeta.top10Avg;virginLastSum+=virginMeta.lastOverlap;virginScoreCount++;virginHistogram[Math.max(0,Math.min(100,Math.round(virginMeta.virginScore)))]++;insertExhaustiveTop(top,entry,limit);paretoUpdate(pareto,entry);}else insertExhaustiveTop(top,{game:g,score},limit);}else diag.quotaRejected++;
      }
    }
    if(tested-lastProgress>=progressEvery||tested===total){lastProgress=tested;const provisional=top[Math.min(rankIndex,Math.max(0,top.length-1))]||top[0]||null;if(progressInfo?.type==='backtest'){const grandTested=(progressInfo.current-1)*total+tested,grandTotal=progressInfo.targets*total;postMessage({type:'backtest-integral-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,grandTested,grandTotal,approvedCount,eligibleCount});}else if(progressInfo?.type==='combined-integral')postMessage({type:'combined-integral-combo-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,approvedCount,eligibleCount});else postMessage({type:'progress',tested,total,maxAttempts:total,found:eligibleCount,approvedCount,eligibleCount,provisionalGame:provisional?.game||null,provisionalScore:provisional?.score??null,mode:'Busca exaustiva integral · 51 filtros · F28 + F29 + F36 + F37 obrigatórios'});}});
  const picked=top[rankIndex]||null,paretoTop=pareto.sort(exhaustiveCompare).slice(0,10);let percentile=null;if(virginMode&&picked?.virginMeta&&virginScoreCount){let le=0;for(let i=0;i<=Math.round(picked.virginMeta.virginScore);i++)le+=virginHistogram[i];percentile=Math.round(le/virginScoreCount*100);}
  const metaPercentile=m=>{if(!m||!virginScoreCount)return null;let le=0;for(let i=0;i<=Math.round(m.virginScore);i++)le+=virginHistogram[i];return Math.round(le/virginScoreCount*100);};if(virginMode){for(const e of top)if(e.virginMeta)e.virginMeta.percentile=metaPercentile(e.virginMeta);for(const e of pareto)if(e.virginMeta)e.virginMeta.percentile=metaPercentile(e.virginMeta);}const diverseTop=virginMode?diverseVirginTop(top,10):[],virginStats=virginMode?{profile:virginProfile,meanScore:virginScoreCount?+(virginScoreSum/virginScoreCount).toFixed(2):null,percentile,eligibleScored:virginScoreCount,paretoCount:pareto.length,diverseTopCount:diverseTop.length,portfolio:diverseTop.length>1?M.portfolioScore(diverseTop.map(x=>x.game)):null,coverage:virginPortfolioCoverage(diverseTop),expected:{n13:virginScoreCount?+(virginN13Sum/virginScoreCount).toFixed(2):null,n12:virginScoreCount?+(virginN12Sum/virginScoreCount).toFixed(2):null,top10Avg:virginScoreCount?+(virginNeighborSum/virginScoreCount).toFixed(2):null,lastOverlap:virginScoreCount?+(virginLastSum/virginScoreCount).toFixed(2):null}}:null;
  const fullUniverse=block.size===0&&forced.length===0&&start==null&&end==null,expectedSum=fullUniverse?M.nCk(24,14)*((1<<25)-1):null,audit={version:1,verified:tested===total&&(!fullUniverse||(total===3268760&&maskSum===expectedSum&&maskXor===0)),fullUniverse,tested,total,maskSum,expectedSum,maskXor,firstMask,lastMask};
  const diagnostics={...diag,audit,tested,total,approvedCount,eligibleCount,generatedAt:new Date().toISOString(),virginStats};
  return{audit,game:picked?.game||null,score:picked?.score??-Infinity,rankScore:picked?.rankScore??picked?.score??-Infinity,tested,total,approvedCount,eligibleCount,rankIndex,topGames:top.map(x=>x.game),topScores:top.map(x=>x.score),topMeta:top.map(x=>x.virginMeta||null),virginDiverseGames:diverseTop.map(x=>x.game),virginDiverseMeta:diverseTop.map(x=>x.virginMeta),paretoGames:paretoTop.map(x=>x.game),paretoMeta:paretoTop.map(x=>x.virginMeta),virginStats,approvedHitDist,diagnostics};
}

self.onmessage=e=>{const d=e.data||{};if(d.task==='generate')return runGenerate(d);if(d.task==='lab')return runLab(d);if(d.task==='backtest')return runBacktest(d);if(d.task==='filter-audit')return runFilterAudit(d);if(d.task==='combined-integral')return runCombinedIntegral(d);if(d.task==='closure')return runClosure(d);};

function runGenerate(d){
  const ctx=M.buildContext(d.history||[],{window:d.period||10}),target=1,maxAttempts=Math.max(1000,Number(d.maxAttempts)||250000),quotaSpec=d.indicatorQuotas||(d.indicatorTargets?buildIndicatorQuotaSpec(d.history||[],d.indicatorTargets):null);
  if(d.colorBalanced&&!colorFeasible(d.excluded||[])){postMessage({type:'done',games:[],tested:0,complete:false,maxAttempts,reason:'As exclusões impedem formar um jogo com 8–10 cores sem cair nas estruturas bloqueadas.'});return;}
  if(d.deterministic&&!d.colorBalanced){
    if(d.exhaustive){const rankingConfig=d.rankingMode==='virgin'?{mode:'virgin',profile:d.virginProfile||'strong',previousVirginGames:d.previousVirginGames||[]}:null,best=exhaustiveBest(ctx,d.policies||{},d.excluded||[],Math.max(0,Number(d.rankIndex)||0),Math.max(50,Number(d.topLimit)||200),null,quotaSpec,d.proProfile||null,rankingConfig,d.boundary||null,d.fixedNumbers||[]);postMessage({type:'done',games:best.game?[best.game]:[],tested:best.tested,total:best.total,complete:best.audit?.verified===true,audit:best.audit,maxAttempts:best.total,deterministic:true,exhaustive:true,mode:d.rankingMode==='virgin'?'Busca exaustiva integral · Ranking Virgem exclusivo · F29 + F37 obrigatórios':'Busca exaustiva integral · 51 filtros · F28 + F29 + F36 + F37 obrigatórios',score:best.score,rankScore:best.rankScore,approvedCount:best.approvedCount,eligibleCount:best.eligibleCount,rankIndex:best.rankIndex,topGames:best.topGames,topScores:best.topScores,topMeta:best.topMeta,virginDiverseGames:best.virginDiverseGames,virginDiverseMeta:best.virginDiverseMeta,paretoGames:best.paretoGames,paretoMeta:best.paretoMeta,virginStats:best.virginStats,diagnostics:best.diagnostics});return;}
    const ex=new Set((d.excluded||[]).map(Number)),games=sampledGames(Math.max(1000,Math.min(50000,Number(d.sampleSize)||12000))).filter(g=>{if(!g.every(n=>!ex.has(n))||!indicatedColorValid(g)||!quotaAllows(g,quotaSpec))return false;const rr=M.inspect(g,ctx);return proProfileAllows(g,rr,d.proProfile||null)}),best=deterministicBestFromPool(ctx,d.policies||{},games);
    postMessage({type:'done',games:best.game?[best.game]:[],tested:best.tested,total:best.total,complete:!!best.game,maxAttempts:best.tested,deterministic:true,exhaustive:false,score:best.score,approvedCount:best.approvedCount,rankIndex:best.rankIndex});return;
  }
  const out=[],seen=new Set();let tested=0;
  while(out.length<target&&tested<maxAttempts){const g=randomCandidate(d.excluded||[],!!d.colorBalanced);tested++;if(!g)continue;const k=keyOf(g);if(seen.has(k))continue;seen.add(k);const r=M.inspect(g,ctx);if(M.policyAllows(r,d.policies||{})&&quotaAllows(g,quotaSpec)&&proProfileAllows(g,r,d.proProfile||null)&&(d.colorBalanced?colorRuleValid(g):indicatedColorValid(g)))out.push(g);if(tested%5000===0)postMessage({type:'progress',tested,found:out.length,maxAttempts});}
  postMessage({type:'done',games:out,tested,complete:out.length===target,maxAttempts});
}

function virginProfileCompareBest(ctx,policies,quotaSpec=null,proProfile=null,mode='quick',sampleSize=4000,progressInfo=null){
  const vc=buildVirginRankContext(ctx.history||[],[]),best={light:null,strong:null,max:null},approvedHitDist=Object.fromEntries(Array.from({length:16},(_,i)=>[i,0]));let tested=0,approvedCount=0,eligibleCount=0,lastProgress=0;
  const consider=g=>{tested++;if(!indicatedColorValid(g))return;const report=M.inspect(g,ctx),score=M.candidateScoreFromReport?M.candidateScoreFromReport(report,ctx,policies):M.candidateScore(g,ctx,policies);if(!Number.isFinite(score))return;approvedCount++;if(progressInfo?.targetDraw)approvedHitDist[hits(g,progressInfo.targetDraw)]++;if(!quotaAllows(g,quotaSpec)||!proProfileAllows(g,report,proProfile))return;eligibleCount++;const meta=virginRankMetrics(g,score,vc,'strong');for(const p of ['light','strong','max']){const rank=Number(meta.sensitivity[p]);const prev=best[p];if(!prev||rank>prev.rankScore||(rank===prev.rankScore&&(score>prev.score||(score===prev.score&&keyOf(g)<keyOf(prev.game)))))best[p]={game:[...g],score,rankScore:rank,virginMeta:{...meta,profile:p,rankScore:rank}};}};
  if(mode==='integral'){const total=M.nCk(25,15),progressEvery=Math.max(100,Math.min(500,Math.floor(total/1000)));eachComb(ALL,15,gref=>{consider([...gref]);if(tested-lastProgress>=progressEvery||tested===total){lastProgress=tested;if(progressInfo){const grandTested=(progressInfo.current-1)*total+tested,grandTotal=progressInfo.targets*total;postMessage({type:'backtest-integral-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,grandTested,grandTotal,approvedCount,eligibleCount});}}});return{profiles:best,tested,total,approvedCount,eligibleCount,approvedHitDist};}
  const games=sampledGames(sampleSize);for(const g of games)consider(g);return{profiles:best,tested,total:games.length,approvedCount,eligibleCount,approvedHitDist};
}

function runBacktest(d){
  const history=d.history||[],mode=d.mode==='integral'?'integral':'quick',requestedW=Number(d.testWindow)||200,w=mode==='integral'?Math.max(1,Math.min(200,requestedW)):Math.max(10,Math.min(200,requestedW)),series=Math.max(10,Math.min(5000,Number(d.series)||200)),period=Math.max(10,Math.min(200,Number(d.period)||10)),policies=d.policies||{},sampleSize=Math.max(1000,Math.min(12000,Number(d.sampleSize)||4000));
  if(history.length<20){postMessage({type:'backtest-done',error:'Histórico insuficiente.'});return;}
  const targets=history.slice(-Math.min(w,Math.max(0,history.length-10))),combinationsPerContest=M.nCk(25,15),emptyDist=()=>Object.fromEntries([11,12,13,14,15].map(k=>[k,0]));
  const resume=mode==='integral'&&d.resume&&Number.isInteger(Number(d.resume.nextTargetIndex))?d.resume:null,startTarget=Math.max(0,Math.min(targets.length,Number(resume?.nextTargetIndex)||0));
  const strat=Array.isArray(resume?.strat)?resume.strat.slice():[],profileStrat={light:Array.isArray(resume?.profileStrat?.light)?resume.profileStrat.light.slice():[],strong:Array.isArray(resume?.profileStrat?.strong)?resume.profileStrat.strong.slice():[],max:Array.isArray(resume?.profileStrat?.max)?resume.profileStrat.max.slice():[]},blockPass=Array.isArray(resume?.blockPass)?resume.blockPass.slice():[],approvedHitDist={...Object.fromEntries(Array.from({length:16},(_,i)=>[i,0])),...(resume?.approvedHitDist||{})};
  let eligible=Number(resume?.eligible)||0,skipped=Number(resume?.skipped)||0,approvedTotal=Number(resume?.approvedTotal)||0,integralTargetsProcessed=Number(resume?.integralTargetsProcessed)||0;
  const randomSummary=Array.from({length:series},(_,i)=>{const x=resume?.randomSummary?.[i];return x?{sum:Number(x.sum)||0,n:Number(x.n)||0,dist:{...emptyDist(),...(x.dist||{})}}:{sum:0,n:0,dist:emptyDist()};});
  const baseSeed=((history.at(-1)?.concurso||0)*2654435761 + period*97 + w*53 + series)>>>0;
  const sendCheckpoint=nextTargetIndex=>{if(mode!=='integral')return;postMessage({type:'backtest-checkpoint',checkpoint:{nextTargetIndex,strat,profileStrat,blockPass,approvedHitDist,eligible,skipped,approvedTotal,integralTargetsProcessed,randomSummary,baseSeed,combinationsPerContest,totalTargets:targets.length,updatedAt:new Date().toISOString()}});};
  for(let i=startTarget;i<targets.length;i++){
    const target=targets[i],ix=history.findIndex(x=>x.concurso===target.concurso),prior=history.slice(0,ix);if(prior.length<10){sendCheckpoint(i+1);continue;}eligible++;
    const ctx=M.buildContext(prior,{window:period}),quota=buildIndicatorQuotaSpec(prior,d.indicatorTargets||{});
    let best=null,profileBest=null;if(d.selectionMode==='virgin'){const cmp=virginProfileCompareBest(ctx,policies,quota,null,mode,sampleSize,{type:'backtest',contest:target.concurso,current:i+1,targets:targets.length,targetDraw:target.dezenas}),chosen=d.virginProfile||'strong';profileBest=cmp.profiles;best={...(profileBest[chosen]||{}),approvedCount:cmp.approvedCount,eligibleCount:cmp.eligibleCount,approvedHitDist:cmp.approvedHitDist};for(const p of ['light','strong','max']){const pg=profileBest[p]?.game;if(pg)profileStrat[p].push({contest:target.concurso,h:hits(pg,target.dezenas),score:profileBest[p].score,rankScore:profileBest[p].rankScore});}}else best=mode==='integral'?exhaustiveBest(ctx,policies,[],0,1,{type:'backtest',contest:target.concurso,current:i+1,targets:targets.length,targetDraw:target.dezenas},quota):deterministicBestFromPool(ctx,policies,sampledGames(sampleSize).filter(g=>quotaAllows(g,quota)));
    const gen=best?.game;if(mode==='integral'){integralTargetsProcessed++;approvedTotal+=Number(best?.approvedCount||0);for(let p=0;p<=15;p++)approvedHitDist[p]+=Number(best?.approvedHitDist?.[p]||0);}
    if(!gen){skipped++;sendCheckpoint(i+1);postMessage({type:'backtest-progress',current:i+1,total:targets.length,tests:strat.length,skipped,mode,resumedFrom:startTarget});continue;}
    strat.push({contest:target.concurso,h:hits(gen,target.dezenas),score:best.score});blockPass.push(blockedFailures(M.inspect(target.dezenas,ctx),policies).length===0?1:0);
    const rng=makeRng((baseSeed^Math.imul(Number(target.concurso)||0,2246822519))>>>0);
    for(let si=0;si<series;si++){const h=hits(randomGame(rng),target.dezenas),rs=randomSummary[si];rs.sum+=h;rs.n++;if(h>=11&&h<=15)rs.dist[h]=(rs.dist[h]||0)+1;}
    sendCheckpoint(i+1);postMessage({type:'backtest-progress',current:i+1,total:targets.length,tests:strat.length,skipped,mode,resumedFrom:startTarget});
  }
  const sh=strat.map(x=>x.h);if(!sh.length){postMessage({type:'backtest-done',error:'Nenhum concurso produziu jogo aprovado com as políticas atuais.'});return;}
  const hold=Math.max(1,Math.floor(sh.length*.2)),train=sh.slice(0,-hold),holdout=sh.slice(-hold),trainCI=meanCI(train),holdoutCI=meanCI(holdout),allCI=meanCI(sh);
  const savg=mean(sh),ravg=randomSummary.map(x=>x.n?x.sum/x.n:0),pct=Math.round(ravg.filter(v=>v<=savg).length/Math.max(1,ravg.length)*100),randomMean=mean(ravg),randomCI=[quantile(ravg,.025),quantile(ravg,.975)];
  const dist=a=>Object.fromEntries([11,12,13,14,15].map(k=>[k,a.filter(v=>v===k).length])),sd=dist(sh),randomDists=randomSummary.map(x=>x.dist),s13=(sd[13]||0)+(sd[14]||0)+(sd[15]||0),beat13=Math.round(randomDists.filter(x=>(x[13]||0)+(x[14]||0)+(x[15]||0)<s13).length/Math.max(1,series)*100),randomAvgDist=Object.fromEntries([11,12,13,14,15].map(k=>[k,mean(randomDists.map(x=>x[k]||0))]));
  const combinationsScanned=mode==='integral'?integralTargetsProcessed*combinationsPerContest:sh.length*sampleSize;
  const profileCompare=d.selectionMode==='virgin'?Object.fromEntries(['light','strong','max'].map(p=>{const a=profileStrat[p].map(x=>x.h),dd=dist(a);return[p,{tests:a.length,avg:mean(a),points11:a.filter(v=>v>=11).length,dist:dd}];})):null;
  postMessage({type:'backtest-done',result:{mode,savg,pct,beat13,tests:sh.length,eligible,skipped,points11:sh.filter(v=>v>=11).length,points13:s13,holdout:mean(holdout),train:mean(train),allCI,trainCI,holdoutCI,randomMean,randomCI,blockPass:Math.round(mean(blockPass)*100),series,sd,randomAvgDist,seed:baseSeed,sampleSize:mode==='integral'?combinationsPerContest:sampleSize,combinationsPerContest,combinationsScanned,integralTargetsProcessed,approvedTotal,approvedHitDist,approved15:approvedHitDist[15]||0,profileCompare,method:mode==='integral'?(d.selectionMode==='virgin'?'Busca exaustiva integral por concurso: 3.268.760 combinações C(25,15), ranking Virgem exclusivo calculado simultaneamente para Leve/Forte/Máximo, com F28 + F29 + F36 + F37 obrigatórios':'Busca exaustiva integral por concurso: 3.268.760 combinações C(25,15), ranking Matriz 51 e bloqueios obrigatórios F28 + F29 + F36 + F37 do NOVO INDICADO'):'Ranking determinístico walk-forward em amostra uniforme do espaço combinatório'}});
}

function addHistoryIndex(draw,hash,h14){if(!draw?.dezenas?.length)return;hash.add(M.keyOf(draw.dezenas));for(let i=0;i<15;i++){const k=M.keyOf(draw.dezenas.filter((_,j)=>j!==i));if(!h14.has(k))h14.set(k,draw.concurso);}}
function diffCI(p1,n1,p2,n2){if(!n1||!n2)return[0,0];const d=p1-p2,se=Math.sqrt((p1*(1-p1))/n1+(p2*(1-p2))/n2),m=1.96*se;return[d-m,d+m];}
function runFilterAudit(d){
  const history=(d.history||[]).map(x=>({concurso:Number(x.concurso),data:x.data||'',dezenas:M.normalize(x.dezenas)})).filter(x=>x.dezenas).sort((a,b)=>a.concurso-b.concurso),period=Math.max(10,Math.min(200,Number(d.period)||10)),series=Math.max(1,Math.min(100,Number(d.series)||20)),sampleSize=Math.max(100,Math.min(5000,Number(d.sampleSize)||1000)),policies=d.policies||{};
  if(history.length<20){postMessage({type:'filter-audit-done',error:'Histórico insuficiente para a auditoria integral.'});return;}
  const fs=Object.fromEntries(M.FILTERS.map(f=>[f.id,{id:f.id,realPass:0,realTotal:0,randomPass:0,randomTotal:0,realScoreN:0,realScoreSum:0,realScoreSq:0,randomScoreN:0,randomScoreSum:0,randomScoreSq:0,pairedN:0,pairedSum:0,pairedSq:0,scorePairedN:0,scorePairedSum:0,scorePairedSq:0,activations:0,blockedReal:0}])),hash=new Set(),h14=new Map(),minPrior=10,totalTargets=Math.max(0,history.length-minPrior),seed=((history.at(-1)?.concurso||0)*2246822519+period*3266489917+series*668265263)>>>0,rng=makeRng(seed),strategyHits=[];
  const lineFreq=new Map(),colFreq=new Map(),delay=Object.fromEntries(ALL.map(n=>[n,0]));
  const strategyTargetCount=Math.min(250,totalTargets),strategyTargetIndexes=new Set();for(let k=0;k<strategyTargetCount;k++){const off=strategyTargetCount===1?0:Math.round(k*(totalTargets-1)/(strategyTargetCount-1));strategyTargetIndexes.add(minPrior+off);}const strategyPool=sampledGames(sampleSize),strategyRandomHitSeries=Array.from({length:series},()=>[]);
  let canonicalReal=0,canonicalRealTotal=0,canonicalRandom=0,canonicalRandomTotal=0,activeReal=0,activeRealTotal=0,activeRandom=0,activeRandomTotal=0,processed=0,strategySkipped=0,strategyTargetsSeen=0;
  const blockPass=r=>r.filters.every(f=>{const p=resolvedPolicy(f,policies);return p!=='block'||f.passed;});
  const isActivated=f=>{const meta=M.THRESHOLDS?.[f.id];if(meta?.type==='conditional')return !String(f.detail||'').toLowerCase().includes('gatilho inativo');return f.mode!=='operational';};
  for(let i=0;i<history.length;i++){
    if(i>0){const prevDraw=history[i-1];addHistoryIndex(prevDraw,hash,h14);bumpPattern(lineFreq,patternSignature(prevDraw.dezenas,true));bumpPattern(colFreq,patternSignature(prevDraw.dezenas,false));updateDelays(delay,prevDraw);}if(i<minPrior)continue;
    const target=history[i],prior=history.slice(0,i),ctx=M.buildContext(prior,{window:period,historyHash:hash,history14:h14,normalized:true,linePatterns:topPatternSet(lineFreq),columnPatterns:topPatternSet(colFreq),delay}),real=M.inspect(target.dezenas,ctx);processed++;
    for(const f of real.filters){const x=fs[f.id];x.realTotal++;if(f.passed)x.realPass++;if(isActivated(f))x.activations++;if(!f.passed&&f.mode!=='experimental'&&f.mode!=='operational')x.blockedReal++;if(Number.isFinite(f.score)){x.realScoreN++;x.realScoreSum+=f.score;x.realScoreSq+=f.score*f.score;}}
    canonicalRealTotal++;if(real.filters.slice(0,29).every(f=>f.passed))canonicalReal++;activeRealTotal++;if(blockPass(real))activeReal++;
    const randomPassBy=Object.fromEntries(M.FILTERS.map(f=>[f.id,0])),randomScoreBy=Object.fromEntries(M.FILTERS.map(f=>[f.id,{sum:0,n:0}])),contestRandomHits=[];
    for(let si=0;si<series;si++){const g=randomGame(rng),rr=M.inspect(g,ctx);contestRandomHits[si]=hits(g,target.dezenas);for(const f of rr.filters){const x=fs[f.id];x.randomTotal++;if(f.passed){x.randomPass++;randomPassBy[f.id]++;}if(Number.isFinite(f.score)){x.randomScoreN++;x.randomScoreSum+=f.score;x.randomScoreSq+=f.score*f.score;randomScoreBy[f.id].sum+=f.score;randomScoreBy[f.id].n++;}}canonicalRandomTotal++;if(rr.filters.slice(0,29).every(f=>f.passed))canonicalRandom++;activeRandomTotal++;if(blockPass(rr))activeRandom++;}
    for(const f of real.filters){const x=fs[f.id],meta=M.FILTERS[f.id-1];if(meta.mode!=='operational'){const diff=(f.passed?1:0)-(randomPassBy[f.id]/series);x.pairedN++;x.pairedSum+=diff;x.pairedSq+=diff*diff;}if(meta.mode==='experimental'&&Number.isFinite(f.score)&&randomScoreBy[f.id].n){const diff=f.score-randomScoreBy[f.id].sum/randomScoreBy[f.id].n;x.scorePairedN++;x.scorePairedSum+=diff;x.scorePairedSq+=diff*diff;}}
    if(strategyTargetIndexes.has(i)){strategyTargetsSeen++;const best=deterministicBestFromPool(ctx,policies,strategyPool);if(best.game){strategyHits.push(hits(best.game,target.dezenas));for(let si=0;si<series;si++)strategyRandomHitSeries[si].push(contestRandomHits[si]);}else strategySkipped++;}
    if(processed%10===0||processed===totalTargets)postMessage({type:'filter-audit-progress',current:processed,total:totalTargets,contest:target.concurso,strategyCurrent:strategyTargetsSeen,strategyTotal:strategyTargetCount});
  }
  const filters=M.FILTERS.map(f=>{const x=fs[f.id],kind=f.mode==='experimental'?'score':f.mode==='operational'?'operational':'pass',realRate=x.realTotal?x.realPass/x.realTotal:0,randomRate=x.randomTotal?x.randomPass/x.randomTotal:0,randomExclusionRate=1-randomRate;let ciLow=null,ciHigh=null;if(x.pairedN>1){const md=x.pairedSum/x.pairedN,v=Math.max(0,(x.pairedSq-(x.pairedSum*x.pairedSum/x.pairedN))/(x.pairedN-1)),m=1.96*Math.sqrt(v/x.pairedN);ciLow=md-m;ciHigh=md+m;}else{[ciLow,ciHigh]=diffCI(realRate,x.realTotal,randomRate,x.randomTotal);}const realScoreMean=x.realScoreN?x.realScoreSum/x.realScoreN:null,randomScoreMean=x.randomScoreN?x.randomScoreSum/x.randomScoreN:null;let scoreCiLow=null,scoreCiHigh=null;if(x.scorePairedN>1){const md=x.scorePairedSum/x.scorePairedN,v=Math.max(0,(x.scorePairedSq-(x.scorePairedSum*x.scorePairedSum/x.scorePairedN))/(x.scorePairedN-1)),m=1.96*Math.sqrt(v/x.scorePairedN);scoreCiLow=md-m;scoreCiHigh=md+m;}let classification='Ignorar';if(MANDATORY_BLOCKS.has(f.id))classification='Bloquear';else if(kind==='operational'||kind==='score')classification='Ignorar';else if(x.blockedReal===0&&realRate>=.995&&ciLow>0&&randomExclusionRate>=.03)classification='Bloquear';else if(realRate>=.90&&realRate>randomRate)classification='Avisar';return{...x,kind,realRate,randomRate,randomExclusionRate,ciLow,ciHigh,realScoreMean,randomScoreMean,scoreCiLow,scoreCiHigh,ciMethod:'paired-by-contest',classification};});
  const randomMeans=strategyRandomHitSeries.map(mean),strategyMean=mean(strategyHits),randomMean=mean(randomMeans),percentile=Math.round(randomMeans.filter(v=>v<=strategyMean).length/Math.max(1,randomMeans.length)*100),strategy13plus=strategyHits.filter(v=>v>=13).length,random13plusMean=mean(strategyRandomHitSeries.map(a=>a.filter(v=>v>=13).length));
  const result={auditVersion:M.AUDIT_VERSION||'LF-M51-AUDIT-v3.6.2',thresholdVersion:M.THRESHOLD_VERSION,schemaVersion:M.SCHEMA_VERSION,latestContest:history.at(-1)?.concurso||null,period,historyUniverse:history.length,warmup:minPrior,eligibleTargets:totalTargets,targets:processed,randomSeries:series,sampleSize,seed,filters,combined:{canonicalRealRate:canonicalReal/Math.max(1,canonicalRealTotal),canonicalRandomRate:canonicalRandom/Math.max(1,canonicalRandomTotal),activeRealRate:activeReal/Math.max(1,activeRealTotal),activeRandomRate:activeRandom/Math.max(1,activeRandomTotal),canonicalReal,canonicalRealTotal,canonicalRandom,canonicalRandomTotal,activeReal,activeRealTotal,activeRandom,activeRandomTotal},strategy:{tests:strategyHits.length,benchmarkTargets:strategyTargetsSeen,skipped:strategySkipped,strategyMean,randomMean,percentile,strategy13plus,random13plusMean,sampling:'diagnóstico rápido amostral; benchmark oficial combinado é o Integral 1:1'}};
  postMessage({type:'filter-audit-done',result});
}

function runCombinedIntegral(d){
  const history=(d.history||[]).map(x=>({concurso:Number(x.concurso),data:x.data||'',dezenas:M.normalize(x.dezenas)})).filter(x=>x.dezenas).sort((a,b)=>a.concurso-b.concurso);
  const period=Math.max(10,Math.min(200,Number(d.period)||10)),policies=d.policies||{},series=Math.max(1,Math.min(100,Number(d.series)||10)),minPrior=10,targets=history.slice(minPrior),totalTargets=targets.length;
  if(history.length<20){postMessage({type:'combined-integral-done',error:'Histórico insuficiente.'});return;}
  const signature=String(d.signature||''),resume=d.resume&&d.resume.signature===signature?d.resume:null;
  let nextIndex=Math.max(0,Math.min(totalTargets,Number(resume?.nextIndex)||0)),tests=Number(resume?.tests)||0,skipped=Number(resume?.skipped)||0,strategySum=Number(resume?.strategySum)||0,strategy13plus=Number(resume?.strategy13plus)||0;
  const strategyDist=resume?.strategyDist||{11:0,12:0,13:0,14:0,15:0},randomSums=Array.isArray(resume?.randomSums)?resume.randomSums.slice(0,series):Array(series).fill(0),random13plus=Array.isArray(resume?.random13plus)?resume.random13plus.slice(0,series):Array(series).fill(0),randomDist=Array.isArray(resume?.randomDist)?resume.randomDist.slice(0,series):Array.from({length:series},()=>({11:0,12:0,13:0,14:0,15:0}));
  while(randomSums.length<series)randomSums.push(0);while(random13plus.length<series)random13plus.push(0);while(randomDist.length<series)randomDist.push({11:0,12:0,13:0,14:0,15:0});
  for(let ti=nextIndex;ti<totalTargets;ti++){
    const target=targets[ti],prior=history.slice(0,minPrior+ti),ctx=M.buildContext(prior,{window:period}),quota=buildIndicatorQuotaSpec(prior,d.indicatorTargets||{});
    const best=exhaustiveBest(ctx,policies,[],0,1,{type:'combined-integral',contest:target.concurso,current:ti+1,targets:totalTargets},quota);
    if(best.game){
      const h=hits(best.game,target.dezenas);tests++;strategySum+=h;if(h>=13)strategy13plus++;if(h>=11)strategyDist[h]=(strategyDist[h]||0)+1;
      for(let si=0;si<series;si++){const rng=makeRng(((target.concurso*2654435761)^(si*2246822519)^period)>>>0),rh=hits(randomGame(rng),target.dezenas);randomSums[si]+=rh;if(rh>=13)random13plus[si]++;if(rh>=11)randomDist[si][rh]=(randomDist[si][rh]||0)+1;}
    }else skipped++;
    nextIndex=ti+1;
    const checkpoint={signature,nextIndex,tests,skipped,strategySum,strategy13plus,strategyDist,randomSums,random13plus,randomDist,historyUniverse:history.length,warmup:minPrior,totalTargets,latestContest:history.at(-1)?.concurso||null,period,series,schemaVersion:M.SCHEMA_VERSION,thresholdVersion:M.THRESHOLD_VERSION};
    postMessage({type:'combined-integral-checkpoint',checkpoint,contest:target.concurso,current:nextIndex,total:totalTargets});
  }
  const strategyMean=tests?strategySum/tests:0,randomMeans=randomSums.map(v=>tests?v/tests:0),randomMean=mean(randomMeans),percentile=Math.round(randomMeans.filter(v=>v<=strategyMean).length/Math.max(1,series)*100),random13plusMean=mean(random13plus);
  postMessage({type:'combined-integral-done',result:{signature,historyUniverse:history.length,warmup:minPrior,eligibleTargets:totalTargets,tests,skipped,latestContest:history.at(-1)?.concurso||null,period,series,strategyMean,randomMean,percentile,strategy13plus,random13plusMean,strategyDist,randomAvgDist:Object.fromEntries([11,12,13,14,15].map(k=>[k,mean(randomDist.map(x=>x[k]||0))])),method:'Integral 1:1: para cada alvo walk-forward elegível, busca exaustiva completa com o ranking Matriz 51 e os bloqueios obrigatórios F28 + F29 + F36 + F37 do NOVO INDICADO.',combinationsPerContest:M.nCk(25,15),schemaVersion:M.SCHEMA_VERSION,thresholdVersion:M.THRESHOLD_VERSION}});
}

function runLab(d){
  const history=d.history||[],ctx=M.buildContext(history,{window:d.period||10}),base=M.normalize(d.base)||[],locked=new Set(d.locked||[]),excluded=new Set(d.excluded||[]),q=Number(d.swap)||2,limit=Math.max(3,Math.min(10,Number(d.scenarios)||5));
  if(base.length!==15){postMessage({type:'lab-done',scenarios:[],tested:0});return;}
  const removable=base.filter(n=>!locked.has(n)),outside=ALL.filter(n=>!base.includes(n)&&!excluded.has(n));if(removable.length<q||outside.length<q){postMessage({type:'lab-done',scenarios:[],tested:0});return;}
  const rems=comb(removable,q),adds=comb(outside,q),best=[];let tested=0;const maxTests=q===5?25000:Infinity;
  const consider=(rs,ad)=>{const g=base.filter(n=>!rs.includes(n)).concat(ad).sort((a,b)=>a-b);tested++;if(!indicatedColorValid(g))return;const r=M.inspect(g,ctx),fails=blockedFailures(r,d.policies||{}).length,warn=warnings(r,d.policies||{}).length,common=base.filter(n=>g.includes(n)).length,structural=M.candidateScore(g,ctx,d.policies||{}),hist=r.metrics.maxHistorical||13;const score=Number.isFinite(structural)?structural-warn*.5-(hist>=14?8:0)+(15-common)*.15:-Infinity;const item={game:g,failed:fails,warnings:warn,history:hist,common,score,structural,breakdown:{sum:r.metrics.total,odds:r.metrics.odds,primes:r.metrics.primes,center:r.metrics.center,border:r.metrics.border,repeated:r.metrics.repeated,lines:r.metrics.lines,cols:r.metrics.cols}};if(fails===0){best.push(item);best.sort((a,b)=>b.score-a.score||a.history-b.history||a.warnings-b.warnings||keyOf(a.game).localeCompare(keyOf(b.game)));if(best.length>Math.max(60,limit*10))best.length=Math.max(60,limit*10);}if(tested%5000===0)postMessage({type:'lab-progress',tested});};
  if(q===5){const totalSpace=rems.length*adds.length,target=Math.min(maxTests,totalSpace),sampled=new Set(),rng=makeRng((base.reduce((a,b)=>a*31+b,17)+locked.size*101+excluded.size*1009)>>>0);let guard=0;while(tested<target&&guard<target*12){guard++;const ri=Math.floor(rng()*rems.length),ai=Math.floor(rng()*adds.length),k=`${ri}:${ai}`;if(sampled.has(k))continue;sampled.add(k);consider(rems[ri],adds[ai]);}}else{for(const rs of rems)for(const ad of adds)consider(rs,ad);}
  const pool=[],poolSeen=new Set();for(const x of best){const k=keyOf(x.game);if(!poolSeen.has(k)){poolSeen.add(k);pool.push(x);}}
  const chosen=[],seen=new Set(),take=(x,tag)=>{if(!x)return;const k=keyOf(x.game);if(seen.has(k))return;seen.add(k);chosen.push({...x,tag});};
  take(pool[0],'Melhor equilíbrio estrutural');
  take([...pool].sort((a,b)=>a.history-b.history||b.structural-a.structural||a.warnings-b.warnings).find(x=>!seen.has(keyOf(x.game))),'Melhor histórico');
  const overlap=(a,b)=>a.filter(n=>b.includes(n)).length;let diverse=null,divScore=Infinity;for(const x of pool){if(seen.has(keyOf(x.game)))continue;const v=chosen.length?Math.max(...chosen.map(y=>overlap(x.game,y.game))):0;if(v<divScore||(v===divScore&&(!diverse||x.score>diverse.score))){divScore=v;diverse=x;}}take(diverse,'Maior diversidade');
  for(const x of pool){if(chosen.length>=limit)break;take(x,`Cenário ${chosen.length+1}`);}postMessage({type:'lab-done',scenarios:chosen.slice(0,limit),tested});
}

function subsetKey(a){return a.join('-');}
function coverageKeys(game,k){const keys=[];eachComb(game,k,p=>keys.push(subsetKey(p)));return keys;}
function runClosure(d){
  const history=d.history||[],ctx=M.buildContext(history,{window:d.period||10}),pool=[...new Set((d.pool||[]).map(Number))].filter(n=>n>=1&&n<=25).sort((a,b)=>a-b),count=Math.max(1,Math.min(100,Number(d.count)||10)),targetK=Math.max(11,Math.min(14,Number(d.targetK)||13)),policies=d.policies||{};
  if(pool.length<15||pool.length>20){postMessage({type:'closure-done',error:'O grupo-base deve ter de 15 a 20 dezenas.'});return;}
  const all=comb(pool,15),eligible=[];for(let i=0;i<all.length;i++){const g=all[i];if(!indicatedColorValid(g)){if(i%1000===0)postMessage({type:'closure-progress',phase:'Matriz',current:i,total:all.length});continue;}const r=M.inspect(g,ctx),historicalExact=r.filters[28]&&!r.filters[28].passed;if(!historicalExact){const blocks=blockedFailures(r,policies).length,warns=warnings(r,policies).length;eligible.push({game:g,score:100-blocks*10-warns,blocks,warns});}if(i%1000===0)postMessage({type:'closure-progress',phase:'Matriz',current:i,total:all.length});}
  if(!eligible.length){postMessage({type:'closure-done',error:'Todas as combinações do grupo-base coincidem com resultados históricos bloqueados.'});return;}
  eligible.sort((a,b)=>keyOf(a.game).localeCompare(keyOf(b.game)));
  const cap=targetK===11?2200:targetK===12?4500:9000;let candidates=eligible;if(eligible.length>cap){candidates=[];for(let i=0;i<cap;i++)candidates.push(eligible[Math.floor(i*(eligible.length-1)/(cap-1))]);}
  const covered=new Set(),selected=[],gains=[];
  for(let step=0;step<count&&candidates.length;step++){
    let bestIndex=-1,bestGain=-1,bestScore=-Infinity,bestKey='';
    for(let i=0;i<candidates.length;i++){
      const c=candidates[i];let gain=0;eachComb(c.game,targetK,p=>{if(!covered.has(subsetKey(p)))gain++;});const k=keyOf(c.game);
      if(gain>bestGain||(gain===bestGain&&(c.score>bestScore||(c.score===bestScore&&(bestIndex<0||k<bestKey))))){bestIndex=i;bestGain=gain;bestScore=c.score;bestKey=k;}
    }
    if(bestIndex<0||bestGain<=0)break;const chosen=candidates.splice(bestIndex,1)[0];selected.push(chosen.game);gains.push(bestGain);eachComb(chosen.game,targetK,p=>covered.add(subsetKey(p)));postMessage({type:'closure-progress',phase:'Cobertura',current:step+1,total:count,covered:covered.size});
  }
  const universe=M.nCk(pool.length,targetK),coverage=universe?covered.size/universe*100:0,uncovered=[];eachComb(pool,targetK,p=>{const k=subsetKey(p);if(!covered.has(k)&&uncovered.length<25)uncovered.push([...p]);});
  postMessage({type:'closure-done',result:{games:selected,gains,targetK,poolSize:pool.length,universe,covered:covered.size,coverage,uncovered,eligible:eligible.length,candidates:candidates.length+selected.length,algorithm:'Greedy determinístico; cobertura do portfólio calculada exatamente'}});
}
