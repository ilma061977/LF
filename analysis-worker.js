self.window=self;
importScripts('./matrix-51.js');
const M=self.LFMatrix51;
const ALL=Array.from({length:25},(_,i)=>i+1);
const MANDATORY_BLOCKS=new Set([28,29,36,37]);
function resolvedPolicy(f,policies={}){return MANDATORY_BLOCKS.has(f.id)?'block':(policies[f.id]||(f.id===23?'ignore':f.mode==='core'?'block':f.mode==='advisory'?'warn':'ignore'));}
const keyOf=g=>g.map(n=>String(n).padStart(2,'0')).join('-');
function blockedFailures(report,policies){const out=report.filters.filter(f=>resolvedPolicy(f,policies)==='block'&&!f.passed);if(report?.patternCooldown?.blocked)out.push({id:'PADRAO',name:'Carência de padrão exato'});if(report?.colorRule?.blocked)out.push({id:'CORES',name:'Mínimo obrigatório de 8 cores'});if(report?.lineRepeat?.blocked)out.push({id:'LINHA',name:'Distribuição de linhas igual ao concurso anterior'});if(report?.columnRepeat?.blocked)out.push({id:'COLUNA',name:'Distribuição de colunas igual ao concurso anterior'});if(report?.lineColumnRepeat?.blocked)out.push({id:'L×C',name:'Linha × Coluna igual ao concurso anterior'});return out;}
function warnings(report,policies){return report.filters.filter(f=>resolvedPolicy(f,policies)==='warn'&&!f.passed);}
const COLOR_ORDER=[1,2,3,4,5,6,7,8,9,0];
const BLOCKED_COLOR_PROFILES=new Set(['3-3-3-3-1-1-1-0-0-0','3-3-3-2-2-2-0-0-0-0','3-2-2-2-2-2-2-0-0-0','3-3-3-1-1-1-1-1-1-0']);
const MIOLO_NUMBERS=[7,8,9,12,13,14,17,18,19],MOLDURA_NUMBERS=[1,2,3,4,5,6,10,11,15,16,20,21,22,23,24,25];
function colorCounts(game){const c=Object.fromEntries(COLOR_ORDER.map(f=>[f,0]));for(const n of game)c[n%10]=(c[n%10]||0)+1;return c;}
function completeColorCount(game){const c=colorCounts(game);return[1,2,3,4,5].filter(f=>c[f]===3).length;}
function colorBaseValid(game){if(!game||game.length!==15)return false;const c=colorCounts(game),present=COLOR_ORDER.filter(f=>c[f]>0).length,profile=COLOR_ORDER.map(f=>c[f]).sort((a,b)=>b-a).join('-'),s=new Set(game);if(present<8||present>10)return false;if(BLOCKED_COLOR_PROFILES.has(profile))return false;if(MIOLO_NUMBERS.every(n=>s.has(n)))return false;if(MOLDURA_NUMBERS.every(n=>s.has(n)))return false;return true;}
function indicatedColorValid(game){return colorBaseValid(game)&&completeColorCount(game)<=2;}
function colorRuleValid(game){return colorBaseValid(game)&&completeColorCount(game)===1;}
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
function deterministicBestFromPool(ctx,policies,games){let best=null,bestScore=-Infinity;for(const g of games){if(!indicatedColorValid(g))continue;const s=M.candidateScore(g,ctx,policies);if(s>bestScore||(s===bestScore&&best&&keyOf(g)<keyOf(best))){best=g;bestScore=s;}}return{game:best,score:bestScore};}
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
  const rules=Array.isArray(profile?.rules)?profile.rules:[];if(!rules.length)return true;
  const m=report?.metrics||{};
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
    else if(String(r.metric||'').startsWith('ending:')){const d=Number(String(r.metric).split(':')[1]);v=game.filter(n=>n%10===d).length;}
    if(v==null||!Number.isFinite(Number(v)))return false;
    const lo=r.min==null?-Infinity:Number(r.min),hi=r.max==null?Infinity:Number(r.max);
    if(v<lo||v>hi)return false;
  }
  return true;
}

function exhaustiveCompare(a,b){return b.score-a.score||keyOf(a.game).localeCompare(keyOf(b.game));}
function insertExhaustiveTop(top,entry,limit){let lo=0,hi=top.length;while(lo<hi){const mid=(lo+hi)>>1;if(exhaustiveCompare(entry,top[mid])<0)hi=mid;else lo=mid+1;}top.splice(lo,0,entry);if(top.length>limit)top.pop();}
function virginApprovedPass(report,policies={}){
  if(!report||report.valid===false||report.patternCooldown?.blocked||report.colorRule?.blocked)return false;
  const f29=(report.filters||[]).find(f=>Number(f.id)===29);
  if(!f29?.passed)return false;
  return !(report.filters||[]).some(f=>resolvedPolicy(f,policies)==='block'&&!f.passed);
}
function exhaustiveBest(ctx,policies,excluded=[],rankIndex=0,topLimit=200,progressInfo=null,quotaSpec=null,proProfile=null,virginApprovedOnly=false){
  const block=new Set((excluded||[]).map(Number)),pool=ALL.filter(n=>!block.has(n));if(pool.length<15)return{game:null,score:-Infinity,tested:0,total:0,approvedCount:0,eligibleCount:0,rankIndex,topGames:[],topScores:[],diagnostics:null};
  const total=M.nCk(pool.length,15),limit=Math.max(rankIndex+1,Math.min(1000,Number(topLimit)||200)),top=[];let tested=0,approvedCount=0,eligibleCount=0,lastProgress=0,approvedHitDist=Object.fromEntries(Array.from({length:16},(_,i)=>[i,0]));
  const diag={colorPreRejected:0,patternRejected:0,colorRuleRejected:0,lineRepeatRejected:0,columnRepeatRejected:0,lineColumnRejected:0,quotaRejected:0,filterFirst:{},filterAny:{}};
  const progressEvery=Math.max(100,Math.min(500,Math.floor(total/1000)));if(!progressInfo)postMessage({type:'progress',tested:0,total,maxAttempts:total,found:0,approvedCount:0,eligibleCount:0,mode:'Busca exaustiva iniciada · preparando varredura integral'});
  eachComb(pool,15,gref=>{const g=[...gref];tested++;
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
        if((!virginApprovedOnly||virginApprovedPass(report,policies))&&quotaAllows(g,quotaSpec)&&proProfileAllows(g,report,proProfile)){eligibleCount++;insertExhaustiveTop(top,{game:g,score},limit);}else diag.quotaRejected++;
      }
    }
    if(tested-lastProgress>=progressEvery||tested===total){lastProgress=tested;const provisional=top[Math.min(rankIndex,Math.max(0,top.length-1))]||top[0]||null;if(progressInfo?.type==='backtest')postMessage({type:'backtest-integral-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,approvedCount,eligibleCount});else if(progressInfo?.type==='combined-integral')postMessage({type:'combined-integral-combo-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,approvedCount,eligibleCount});else postMessage({type:'progress',tested,total,maxAttempts:total,found:eligibleCount,approvedCount,eligibleCount,provisionalGame:provisional?.game||null,provisionalScore:provisional?.score??null,mode:'Busca exaustiva integral · 51 filtros · F28 + F29 + F36 + F37 obrigatórios'});}});
  const picked=top[rankIndex]||null;const diagnostics={...diag,tested,total,approvedCount,eligibleCount,generatedAt:new Date().toISOString()};
  return{game:picked?.game||null,score:picked?.score??-Infinity,tested,total,approvedCount,eligibleCount,rankIndex,topGames:top.map(x=>x.game),topScores:top.map(x=>x.score),approvedHitDist,diagnostics};
}

self.onmessage=e=>{const d=e.data||{};if(d.task==='generate')return runGenerate(d);if(d.task==='lab')return runLab(d);if(d.task==='backtest')return runBacktest(d);if(d.task==='filter-audit')return runFilterAudit(d);if(d.task==='combined-integral')return runCombinedIntegral(d);if(d.task==='closure')return runClosure(d);};

function runGenerate(d){
  const ctx=M.buildContext(d.history||[],{window:d.period||50}),target=1,maxAttempts=Math.max(1000,Number(d.maxAttempts)||250000),quotaSpec=d.indicatorQuotas||(d.indicatorTargets?buildIndicatorQuotaSpec(d.history||[],d.indicatorTargets):null);
  if(d.colorBalanced&&!colorFeasible(d.excluded||[])){postMessage({type:'done',games:[],tested:0,complete:false,maxAttempts,reason:'As exclusões impedem formar um jogo com 8–10 cores sem cair nas estruturas bloqueadas.'});return;}
  if(d.deterministic&&!d.colorBalanced){
    if(d.exhaustive){const best=exhaustiveBest(ctx,d.policies||{},d.excluded||[],Math.max(0,Number(d.rankIndex)||0),Math.max(50,Number(d.topLimit)||200),null,quotaSpec,d.proProfile||null,!!d.virginApprovedOnly);postMessage({type:'done',games:best.game?[best.game]:[],tested:best.tested,total:best.total,complete:true,maxAttempts:best.total,deterministic:true,exhaustive:true,mode:'Busca exaustiva integral · 51 filtros · F28 + F29 + F36 + F37 obrigatórios',score:best.score,approvedCount:best.approvedCount,eligibleCount:best.eligibleCount,rankIndex:best.rankIndex,topGames:best.topGames,topScores:best.topScores,diagnostics:best.diagnostics});return;}
    const ex=new Set((d.excluded||[]).map(Number)),games=sampledGames(Math.max(1000,Math.min(50000,Number(d.sampleSize)||12000))).filter(g=>{if(!g.every(n=>!ex.has(n))||!indicatedColorValid(g)||!quotaAllows(g,quotaSpec))return false;const rr=M.inspect(g,ctx);return proProfileAllows(g,rr,d.proProfile||null)&&(!d.virginApprovedOnly||virginApprovedPass(rr,d.policies||{}))}),best=deterministicBestFromPool(ctx,d.policies||{},games);
    postMessage({type:'done',games:best.game?[best.game]:[],tested:best.tested,total:best.total,complete:!!best.game,maxAttempts:best.tested,deterministic:true,exhaustive:false,score:best.score,approvedCount:best.approvedCount,rankIndex:best.rankIndex});return;
  }
  const out=[],seen=new Set();let tested=0;
  while(out.length<target&&tested<maxAttempts){const g=randomCandidate(d.excluded||[],!!d.colorBalanced);tested++;if(!g)continue;const k=keyOf(g);if(seen.has(k))continue;seen.add(k);const r=M.inspect(g,ctx);if(M.policyAllows(r,d.policies||{})&&(!d.virginApprovedOnly||virginApprovedPass(r,d.policies||{}))&&quotaAllows(g,quotaSpec)&&proProfileAllows(g,r,d.proProfile||null)&&(d.colorBalanced?colorRuleValid(g):indicatedColorValid(g)))out.push(g);if(tested%5000===0)postMessage({type:'progress',tested,found:out.length,maxAttempts});}
  postMessage({type:'done',games:out,tested,complete:out.length===target,maxAttempts});
}

function runBacktest(d){
  const history=d.history||[],w=Math.max(10,Math.min(200,Number(d.testWindow)||200)),series=Math.max(10,Math.min(5000,Number(d.series)||200)),period=Math.max(10,Math.min(200,Number(d.period)||50)),policies=d.policies||{},sampleSize=Math.max(1000,Math.min(12000,Number(d.sampleSize)||4000)),mode=d.mode==='integral'?'integral':'quick';
  if(history.length<20){postMessage({type:'backtest-done',error:'Histórico insuficiente.'});return;}
  const targets=history.slice(-Math.min(w,Math.max(0,history.length-10))),strat=[],randomSeries=Array.from({length:series},()=>[]),blockPass=[],approvedHitDist=Object.fromEntries(Array.from({length:16},(_,i)=>[i,0]));let eligible=0,skipped=0,approvedTotal=0;
  const baseSeed=((history.at(-1)?.concurso||0)*2654435761 + period*97 + w*53 + series)>>>0,rng=makeRng(baseSeed),combinationsPerContest=M.nCk(25,15);
  for(let i=0;i<targets.length;i++){
    const target=targets[i],ix=history.findIndex(x=>x.concurso===target.concurso),prior=history.slice(0,ix);if(prior.length<10)continue;eligible++;
    const ctx=M.buildContext(prior,{window:period}),quota=buildIndicatorQuotaSpec(prior,d.indicatorTargets||{});
    const best=mode==='integral'?exhaustiveBest(ctx,policies,[],0,1,{type:'backtest',contest:target.concurso,current:i+1,targets:targets.length,targetDraw:target.dezenas},quota):deterministicBestFromPool(ctx,policies,sampledGames(sampleSize).filter(g=>quotaAllows(g,quota)));const gen=best.game;if(mode==='integral'){approvedTotal+=Number(best.approvedCount||0);for(let p=0;p<=15;p++)approvedHitDist[p]+=Number(best.approvedHitDist?.[p]||0);}
    if(!gen){skipped++;postMessage({type:'backtest-progress',current:i+1,total:targets.length,tests:strat.length,skipped,mode});continue;}
    strat.push({contest:target.concurso,h:hits(gen,target.dezenas),score:best.score});blockPass.push(blockedFailures(M.inspect(target.dezenas,ctx),policies).length===0?1:0);
    for(let si=0;si<series;si++)randomSeries[si].push(hits(randomGame(rng),target.dezenas));
    postMessage({type:'backtest-progress',current:i+1,total:targets.length,tests:strat.length,skipped,mode});
  }
  const sh=strat.map(x=>x.h);if(!sh.length){postMessage({type:'backtest-done',error:'Nenhum concurso produziu jogo aprovado com as políticas atuais.'});return;}
  const hold=Math.max(1,Math.floor(sh.length*.2)),train=sh.slice(0,-hold),holdout=sh.slice(-hold),trainCI=meanCI(train),holdoutCI=meanCI(holdout),allCI=meanCI(sh);
  const savg=mean(sh),ravg=randomSeries.map(a=>mean(a)),pct=Math.round(ravg.filter(v=>v<=savg).length/Math.max(1,ravg.length)*100),randomMean=mean(ravg),randomCI=[quantile(ravg,.025),quantile(ravg,.975)];
  const dist=a=>Object.fromEntries([11,12,13,14,15].map(k=>[k,a.filter(v=>v===k).length])),sd=dist(sh),randomDists=randomSeries.map(dist),s13=(sd[13]||0)+(sd[14]||0)+(sd[15]||0),beat13=Math.round(randomDists.filter(x=>(x[13]||0)+(x[14]||0)+(x[15]||0)<s13).length/Math.max(1,series)*100),randomAvgDist=Object.fromEntries([11,12,13,14,15].map(k=>[k,mean(randomDists.map(x=>x[k]||0))]));
  postMessage({type:'backtest-done',result:{mode,savg,pct,beat13,tests:sh.length,eligible,skipped,points11:sh.filter(v=>v>=11).length,points13:s13,holdout:mean(holdout),train:mean(train),allCI,trainCI,holdoutCI,randomMean,randomCI,blockPass:Math.round(mean(blockPass)*100),series,sd,randomAvgDist,seed:baseSeed,sampleSize:mode==='integral'?combinationsPerContest:sampleSize,combinationsPerContest,approvedTotal,approvedHitDist,approved15:approvedHitDist[15]||0,method:mode==='integral'?'Busca exaustiva integral por concurso usando o mesmo candidateScore e os bloqueios obrigatórios F28 + F29 + F36 + F37 do NOVO INDICADO':'Ranking determinístico em amostra uniforme do espaço combinatório'}});
}

function addHistoryIndex(draw,hash,h14){if(!draw?.dezenas?.length)return;hash.add(M.keyOf(draw.dezenas));for(let i=0;i<15;i++){const k=M.keyOf(draw.dezenas.filter((_,j)=>j!==i));if(!h14.has(k))h14.set(k,draw.concurso);}}
function diffCI(p1,n1,p2,n2){if(!n1||!n2)return[0,0];const d=p1-p2,se=Math.sqrt((p1*(1-p1))/n1+(p2*(1-p2))/n2),m=1.96*se;return[d-m,d+m];}
function runFilterAudit(d){
  const history=(d.history||[]).map(x=>({concurso:Number(x.concurso),data:x.data||'',dezenas:M.normalize(x.dezenas)})).filter(x=>x.dezenas).sort((a,b)=>a.concurso-b.concurso),period=Math.max(10,Math.min(200,Number(d.period)||50)),series=Math.max(1,Math.min(100,Number(d.series)||20)),sampleSize=Math.max(100,Math.min(5000,Number(d.sampleSize)||1000)),policies=d.policies||{};
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
  const period=Math.max(10,Math.min(200,Number(d.period)||50)),policies=d.policies||{},series=Math.max(1,Math.min(100,Number(d.series)||10)),minPrior=10,targets=history.slice(minPrior),totalTargets=targets.length;
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
  postMessage({type:'combined-integral-done',result:{signature,historyUniverse:history.length,warmup:minPrior,eligibleTargets:totalTargets,tests,skipped,latestContest:history.at(-1)?.concurso||null,period,series,strategyMean,randomMean,percentile,strategy13plus,random13plusMean,strategyDist,randomAvgDist:Object.fromEntries([11,12,13,14,15].map(k=>[k,mean(randomDist.map(x=>x[k]||0))])),method:'Integral 1:1: para cada alvo walk-forward elegível, busca exaustiva completa com o mesmo candidateScore e os bloqueios obrigatórios F28 + F29 + F36 + F37 do NOVO INDICADO.',combinationsPerContest:M.nCk(25,15),schemaVersion:M.SCHEMA_VERSION,thresholdVersion:M.THRESHOLD_VERSION}});
}

function runLab(d){
  const history=d.history||[],ctx=M.buildContext(history,{window:d.period||50}),base=M.normalize(d.base)||[],locked=new Set(d.locked||[]),excluded=new Set(d.excluded||[]),q=Number(d.swap)||2,limit=Math.max(3,Math.min(10,Number(d.scenarios)||5));
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
  const history=d.history||[],ctx=M.buildContext(history,{window:d.period||50}),pool=[...new Set((d.pool||[]).map(Number))].filter(n=>n>=1&&n<=25).sort((a,b)=>a-b),count=Math.max(1,Math.min(100,Number(d.count)||10)),targetK=Math.max(11,Math.min(14,Number(d.targetK)||13)),policies=d.policies||{};
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
