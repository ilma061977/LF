/* LF Inteligente V3.6.3 — Matriz 51 canônica restaurada, versionada e auditável.
 * F01–F29 preservam a matriz canônica e foram diferenciados para evitar redundâncias exatas.
 * F30–F44 ampliam a análise com métricas não duplicadas.
 * F45–F49 são experimentais (score/hipótese; não eliminam por padrão).
 * F50–F51 são operacionais.
 * Estes filtros não alteram a probabilidade matemática do sorteio.
 */
(() => {
  'use strict';

  const ALL = Array.from({ length: 25 }, (_, i) => i + 1);
  const MANDATORY_BLOCKS=new Set([28,29,36,37]);
  const BLOCKED_COLOR_PROFILES=new Set(['3-3-3-3-1-1-1-0-0-0','3-3-3-2-2-2-0-0-0-0','3-2-2-2-2-2-2-0-0-0','3-3-3-1-1-1-1-1-1-0']);
  const PRIMES = new Set([2,3,5,7,11,13,17,19,23]);
  const FIB = new Set([1,2,3,5,8,13,21]);
  const CENTER = new Set([7,8,9,12,13,14,17,18,19]);
  const BORDER = new Set([1,2,3,4,5,6,10,11,15,16,20,21,22,23,24,25]);
  const ELITE = new Set([11,13,20,24,25]);
  const QUADRANTS = [
    new Set([1,2,3,6,7,8]), new Set([4,5,9,10,14,15]),
    new Set([11,12,16,17,21,22]), new Set([18,19,20,23,24,25])
  ];
  // Segmentos disjuntos da moldura: 5 + 4 + 4 + 3 = 16 dezenas.
  const BORDER_SECTORS = [
    new Set([1,2,3,4,5]), new Set([10,15,20,25]),
    new Set([21,22,23,24]), new Set([6,11,16])
  ];
  const CANONICAL_COUPLES = [[1,2],[3,4],[5,6],[7,8],[9,10]];
  const DECADES = [new Set([1,2,3,4,5,6,7,8,9]), new Set([10,11,12,13,14,15,16,17,18,19]), new Set([20,21,22,23,24,25])];
  const SCHEMA_VERSION = 'matrix51-canonical-2026-09-v3.7.4';
  const THRESHOLD_VERSION = 'LF-M51-2026.09.22-v3.7.4';
  const AUDIT_VERSION = 'LF-M51-AUDIT-3785-F28-F29-F36-F37-v3.7.4';
  const AUDIT_BASE_THROUGH = 3785;
  // Carência por formato EXATO das cinco linhas (L1-L2-L3-L4-L5).
  // O formato volta a ser aceito quando alvo - último concurso >= intervalo.
  const PATTERN_COOLDOWNS = Object.freeze({
    '4-1-3-3-4':292,
    '4-4-4-3-0':58,
    '5-4-4-1-1':181,
    '5-4-3-2-1':264
  });

  const pad = n => String(n).padStart(2,'0');
  const keyOf = g => g.map(pad).join('-');
  const row = n => Math.floor((n-1)/5);
  const col = n => (n-1)%5;
  const sum = a => a.reduce((x,y)=>x+y,0);
  const mean = a => a.length ? sum(a)/a.length : 0;
  const variance = a => { const m=mean(a); return mean(a.map(x=>(x-m)**2)); };
  const countSet = (g,s) => g.reduce((a,n)=>a+(s.has(n)?1:0),0);
  const intersections = (a,b) => { const s=new Set(b||[]); return (a||[]).filter(n=>s.has(n)).length; };
  const counts = (g,fn) => { const a=[0,0,0,0,0]; g.forEach(n=>a[fn(n)]++); return a; };
  const signature = a => [...a].sort((x,y)=>y-x).join('');
  const quantile = (arr,q) => { if(!arr.length)return null;const s=[...arr].sort((a,b)=>a-b);return s[Math.max(0,Math.min(s.length-1,Math.round((s.length-1)*q)))]; };
  const range80 = (arr,fallback) => arr.length>=20 ? [quantile(arr,.10),quantile(arr,.90)] : fallback;
  const inRange = (x,r) => r && x>=r[0] && x<=r[1];
  const maxRun = g => { let m=1,c=1;for(let i=1;i<g.length;i++){c=g[i]===g[i-1]+1?c+1:1;m=Math.max(m,c);}return m; };
  const maxGap = g => Math.max(...g.slice(1).map((n,i)=>n-g[i]),1);
  const digitSum = n => Math.floor(n/10)+(n%10);
  const longestSame = bits => { if(!bits.length)return 0;let m=1,c=1;for(let i=1;i<bits.length;i++){c=bits[i]===bits[i-1]?c+1:1;m=Math.max(m,c);}return m; };
  const centroid = g => ({x:mean(g.map(n=>col(n))),y:mean(g.map(n=>row(n)))});
  const dist = (a,b) => Math.hypot(a.x-b.x,a.y-b.y);
  const hasExtremeTwins = a => a.some((v,i)=>i<4 && v===a[i+1] && (v===4 || v<=1));
  const homogeneousGroups = (set,groups) => groups.filter(group=>{const picked=group.filter(n=>set.has(n));return picked.length>0&&picked.every(n=>n%2===picked[0]%2);}).length;
  const neighbors = g => {const s=new Set(g);let edges=0;for(const n of g){if(col(n)<4&&s.has(n+1))edges++;if(row(n)<4&&s.has(n+5))edges++;}return edges;};
  const progressionRun = g => {const s=new Set(g);let best=1;for(const n of g)for(let d=1;d<=6;d++){let c=1,x=n+d;while(s.has(x)){c++;x+=d;}best=Math.max(best,c);}return best;};
  const blocks2x2 = g => {const s=new Set(g);let c=0;for(let r=0;r<4;r++)for(let k=0;k<4;k++){const b=[r*5+k+1,r*5+k+2,(r+1)*5+k+1,(r+1)*5+k+2];if(b.every(n=>s.has(n)))c++;}return c;};
  const endingDeltaOf = (a,b) => {const ca=Array.from({length:10},(_,d)=>(a||[]).filter(n=>n%10===d).length),cb=Array.from({length:10},(_,d)=>(b||[]).filter(n=>n%10===d).length);return sum(ca.map((v,i)=>Math.abs(v-cb[i])));};

  function normalize(game){
    if(!Array.isArray(game))return null;
    const g=[...new Set(game.map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=25))].sort((a,b)=>a-b);
    return g.length===15?g:null;
  }
  function delays(history){const out={};ALL.forEach(n=>{let d=0;for(let i=history.length-1;i>=0&&!history[i].dezenas.includes(n);i--)d++;out[n]=d;});return out;}
  function frequencyRank(history,window=10){const rows=history.slice(-window),f=Object.fromEntries(ALL.map(n=>[n,0]));rows.forEach(d=>d.dezenas.forEach(n=>f[n]++));return [...ALL].sort((a,b)=>f[b]-f[a]||a-b);}
  function topPatterns(history,fn){const m=new Map();for(const d of history){const k=signature(counts(d.dezenas,fn));m.set(k,(m.get(k)||0)+1);}return new Set([...m].sort((a,b)=>b[1]-a[1]||a[0].localeCompare(b[0])).slice(0,7).map(([k])=>k));}
  function floatingSet(prior4){const set=new Set();if(prior4.length<4)return set;for(const n of ALL){const bits=prior4.map(d=>d.dezenas.includes(n)?1:0),appears=sum(bits);let switches=0;for(let i=1;i<bits.length;i++)if(bits[i]!==bits[i-1])switches++;if(appears>=1&&appears<=3&&switches>=2)set.add(n);}return set;}
  function cycleMissingSet(history){if(!history.length)return new Set(ALL);let seen=new Set(),start=0,completedAt=-1;for(let i=history.length-1;i>=0;i--){for(const n of history[i].dezenas)seen.add(n);if(seen.size===25){completedAt=i;break;}}start=completedAt>=0?completedAt+1:0;seen=new Set();for(let i=start;i<history.length;i++)for(const n of history[i].dezenas)seen.add(n);return new Set(ALL.filter(n=>!seen.has(n)));}
  function historicalSeries(history,fn,minPrior=1){const out=[];for(let i=minPrior;i<history.length;i++){const v=fn(history[i],history.slice(0,i));if(Number.isFinite(v))out.push(v);}return out;}
  function maxHistoricalHits(game,history=[]){const g=normalize(game);if(!g)return{max:0,contests:[]};let max=0,contests=[];for(const d of history){const h=intersections(g,d.dezenas||[]);if(h>max){max=h;contests=[d.concurso];}else if(h===max)contests.push(d.concurso);}return{max,contests};}
  function mandatoryColorRule(game){
    const g=normalize(game),colorCounts=Array(10).fill(0);
    if(!g)return{blocked:true,passed:false,distinct:0,min:8,max:10,counts:colorCounts,profile:'',complete:0,blockedProfile:false};
    g.forEach(n=>colorCounts[n%10]++);
    const distinct=colorCounts.filter(Boolean).length,profile=[...colorCounts].sort((a,b)=>b-a).join('-');
    const complete=[1,2,3,4,5].filter(d=>colorCounts[d]===3).length,blockedProfile=BLOCKED_COLOR_PROFILES.has(profile);
    const passed=distinct>=8&&distinct<=10&&!blockedProfile&&complete<=2;
    return{blocked:!passed,passed,distinct,min:8,max:10,counts:colorCounts,profile,complete,blockedProfile};
  }
  function exactPatternCooldown(lineCounts,history=[]){
    const pattern=(lineCounts||[]).join('-'),interval=PATTERN_COOLDOWNS[pattern]||null;
    const latestContest=Number(history.at(-1)?.concurso)||0,targetContest=latestContest+1;
    if(!interval)return{pattern,configured:false,blocked:false,interval:null,lastContest:null,targetContest,nextEligibleContest:null,remaining:0};
    let lastContest=null;
    for(let i=history.length-1;i>=0;i--){
      const d=history[i],g=normalize(d?.dezenas);
      if(g&&counts(g,row).join('-')===pattern){lastContest=Number(d.concurso);break;}
    }
    const nextEligibleContest=lastContest==null?null:lastContest+interval;
    const blocked=nextEligibleContest!=null&&targetContest<nextEligibleContest;
    return{pattern,configured:true,blocked,interval,lastContest,targetContest,nextEligibleContest,remaining:blocked?nextEligibleContest-targetContest:0};
  }

  const FILTERS = [
    ['Formato comum das linhas','Canônica F01–F29','core'],
    ['Formato comum das colunas','Canônica F01–F29','core'],
    ['Miolo entre 5 e 7','Canônica F01–F29','core'],
    ['Moldura entre 9 e 11','Canônica F01–F29','core'],
    ['Sem linha ou coluna vazia','Canônica F01–F29','core'],
    ['Equilíbrio dos quadrantes','Canônica F01–F29','core'],
    ['Sequência máxima entre 3 e 5','Canônica F01–F29','core'],
    ['Menos de 5 números vazios entre dezenas','Canônica F01–F29','core'],
    ['Sem linhas/colunas gêmeas extremas','Canônica F01–F29','core'],
    ['Espelhamento horizontal: diferença até 4','Canônica F01–F29','core'],
    ['Espelhamento vertical: diferença até 4','Canônica F01–F29','core'],
    ['Primos entre 5 e 6','Canônica F01–F29','core'],
    ['Ímpares entre 7 e 9','Canônica F01–F29','core'],
    ['Soma entre 166 e 220','Canônica F01–F29','core'],
    ['Repetidas entre 8 e 10','Canônica F01–F29','core'],
    ['Paridade isolada nas colunas','Canônica F01–F29','advisory'],
    ['Paridade isolada nas linhas','Canônica F01–F29','advisory'],
    ['Elite: não incluir as 5','Canônica F01–F29','advisory'],
    ['Elite: incluir pelo menos 1','Canônica F01–F29','advisory'],
    ['Gatilho de finais baixos','Canônica F01–F29','advisory'],
    ['Gatilho de inícios altos','Canônica F01–F29','advisory'],
    ['Gatilho do bloco de pontas','Canônica F01–F29','advisory'],
    ['Gatilho dos casais 01–02, 03–04, 05–06, 07–08 e 09–10','Canônica F01–F29','advisory'],
    ['Ausentes recentes entre 5 e 6','Canônica F01–F29','advisory'],
    ['Atrasadas parcialmente presentes (somente com 2 ou mais atrasadas)','Canônica F01–F29','advisory'],
    ['Inércia flutuante entre 5 e 6','Canônica F01–F29','advisory'],
    ['Dispersão das linhas opostas','Canônica F01–F29','advisory'],
    ['Até 2 alertas nos limites máximos','Canônica F01–F29','advisory'],
    ['Jogo inédito no histórico','Canônica F01–F29','core'],
    ['Repetidas com Termômetro','Complementar F30–F44','advisory'],
    ['Ausentes Persistentes de 2 Concursos','Complementar F30–F44','advisory'],
    ['Média de Atraso','Complementar F30–F44','advisory'],
    ['Finais Repetidos','Complementar F30–F44','advisory'],
    ['Linhas Opostas Ampliadas','Complementar F30–F44','advisory'],
    ['Ciclo de Dezenas','Complementar F30–F44','advisory'],
    ['Intersecção de Anomalias','Complementar F30–F44','advisory'],
    ['Similaridade Histórica 14/15','Histórico','advisory'],
    ['Paridade Posicional','Histórico','advisory'],
    ['Terminação Binária','Histórico','advisory'],
    ['Variância Radial','Avançado','advisory'],
    ['Distribuição por Faixas · ex-Anti-Datas','Avançado','advisory'],
    ['Assinatura Mecânica · ex-Aposta Invertida','Avançado','advisory'],
    ['Cobertura de Rastro 2D','Avançado','advisory'],
    ['Centro de Massa','Avançado','advisory'],
    ['Matrix Shear 3D','Experimental','experimental'],
    ['Rebote Elástico','Experimental','experimental'],
    ['Densidade Fractal','Experimental','experimental'],
    ['Ressonância Harmônica','Experimental','experimental'],
    ['Mapa de Calor','Experimental','experimental'],
    ['Matriz de Cobertura Matemática','Otimização','operational'],
    ['Exportação e Carteira','Operacional','operational']
  ].map((x,i)=>({id:i+1,name:x[0],category:x[1],mode:x[2]}));

  const THRESHOLDS = Object.freeze({
    1:{type:'walk-forward',rule:'Top 7 assinaturas de linhas usando somente concursos anteriores'},
    2:{type:'walk-forward',rule:'Top 7 assinaturas de colunas usando somente concursos anteriores'},
    3:{type:'fixed',rule:'Miolo 5–7'},4:{type:'fixed',rule:'Moldura 9–11'},5:{type:'fixed',rule:'Nenhuma linha/coluna vazia'},
    6:{type:'fixed',rule:'3–4 por quadrante'},7:{type:'fixed',rule:'Sequência máxima 3–5'},8:{type:'fixed',rule:'Maior salto ≤5'},9:{type:'fixed',rule:'Sem gêmeas extremas adjacentes'},
    10:{type:'fixed',rule:'|superior−inferior|≤4'},11:{type:'fixed',rule:'|esquerda−direita|≤4'},12:{type:'fixed',rule:'Primos 5–6'},13:{type:'fixed',rule:'Ímpares 7–9'},14:{type:'fixed',rule:'Soma 166–220'},15:{type:'fixed',rule:'Repetidas 8–10'},
    16:{type:'fixed',rule:'<3 colunas com paridade homogênea'},17:{type:'fixed',rule:'<3 linhas com paridade homogênea'},18:{type:'fixed',rule:'Não usar as 5 da elite'},19:{type:'fixed',rule:'Usar ≥1 da elite'},
    20:{type:'conditional',rule:'Se anterior terminou baixo, evitar 21–23 no final'},21:{type:'conditional',rule:'Se anterior iniciou 04/05, iniciar abaixo de 04'},22:{type:'conditional',rule:'Se bloco extremo veio completo, não repeti-lo completo'},
    23:{type:'conditional',rule:'Casais 01–02, 03–04, 05–06, 07–08, 09–10: se o anterior teve exatamente 1 casal, exigir pelo menos 2'},24:{type:'fixed',rule:'Ausentes do anterior 5–6'},25:{type:'conditional',rule:'Com ≥2 atrasadas (≥3), usar parte do grupo'},26:{type:'fixed',rule:'Inércia flutuante: dezenas que alternaram presença/ausência ≥2 vezes nos últimos 4 concursos; usar 5–6 quando o grupo comporta a regra'},27:{type:'fixed',rule:'|L1−L5|≤2'},28:{type:'fixed',rule:'No máximo 2 métricas no limite máximo'},29:{type:'historical-lock',rule:'Não repetir combinação histórica 15/15'},
    30:{type:'walk-forward-80',rule:'Repetidas dentro da faixa central histórica de 80%'},31:{type:'walk-forward-80',rule:'Retorno de ausentes persistentes (2 concursos) na faixa de 80%'},32:{type:'walk-forward-80',rule:'Média de atraso na faixa histórica de 80%'},33:{type:'walk-forward-80',rule:'Mudança do perfil de finais na faixa histórica de 80%'},34:{type:'walk-forward-80',rule:'Balanço L1+L5 vs L2+L4 na faixa histórica de 80%'},35:{type:'walk-forward-80',rule:'Pendentes do ciclo na faixa histórica de 80%'},36:{type:'derived',rule:'≤2 falhas simultâneas em F30–F35'},
    37:{type:'historical-warning',rule:'Sem similaridade histórica 14/15'},38:{type:'fixed',rule:'Cadeia posicional de paridade ≤5'},39:{type:'walk-forward-80',rule:'Terminação binária reformulada: finais 0–4 vs 5–9; maior cadeia dentro da faixa histórica de 80%'},40:{type:'walk-forward-80',rule:'Variância radial na faixa histórica de 80%'},41:{type:'walk-forward-80',rule:'Faixas 01–09/10–19/20–25 dentro das faixas históricas'},42:{type:'fixed',rule:'Sem assinatura mecânica extrema'},43:{type:'walk-forward-80',rule:'Conectividade ortogonal na faixa histórica de 80%'},44:{type:'fixed',rule:'Distância do centro de massa ≤0,85'},
    45:{type:'experimental',rule:'Score Matrix Shear 3D; não eliminatório'},46:{type:'experimental',rule:'Score Rebote Elástico; não eliminatório'},47:{type:'experimental',rule:'Score Densidade Fractal; não eliminatório'},48:{type:'experimental',rule:'Score Ressonância Harmônica; não eliminatório'},49:{type:'experimental',rule:'Score Mapa de Calor; não eliminatório'},50:{type:'operational',rule:'Cobertura avaliada no módulo Fechamentos'},51:{type:'operational',rule:'Exportação/carteira; não estatístico'}
  });

  function buildContext(historyRaw=[],options={}){
    // Auditorias walk-forward chamam buildContext milhares de vezes. Quando o chamador
    // já normalizou/ordenou o histórico e mantém caches incrementais, reutilizamos esses
    // dados sem alterar a regra estatística. Isso elimina o custo quadrático de reprocessar
    // todo o passado a cada concurso.
    const history=options.normalized===true?(historyRaw||[]):(historyRaw||[]).map(d=>({concurso:Number(d.concurso),data:d.data||'',dezenas:normalize(d.dezenas)})).filter(d=>d.dezenas).sort((a,b)=>a.concurso-b.concurso);
    const requested=Math.max(10,Math.min(200,Number(options.window)||10));
    const analysisHistory=history.slice(-Math.min(requested,history.length||requested));
    const latest=history.at(-1)||null, previous=history.at(-2)||null, prev=new Set(latest?.dezenas||[]), hash=options.historyHash instanceof Set?options.historyHash:new Set(history.map(d=>keyOf(d.dezenas)));
    const history14=options.history14 instanceof Map?options.history14:new Map();if(!(options.history14 instanceof Map)){for(const d of history){for(let i=0;i<15;i++){const k=keyOf(d.dezenas.filter((_,j)=>j!==i));if(!history14.has(k))history14.set(k,d.concurso);}}}
    const temperatureHistory=history.slice(-Math.min(10,history.length||10)),temperatureFrequency=Object.fromEntries(ALL.map(n=>[n,0]));temperatureHistory.forEach(d=>d.dezenas.forEach(n=>temperatureFrequency[n]++));const rank=[...ALL].sort((a,b)=>temperatureFrequency[b]-temperatureFrequency[a]||a-b),hot=new Set(rank.slice(0,5)),cold=new Set([...ALL].sort((a,b)=>temperatureFrequency[a]-temperatureFrequency[b]||a-b).slice(0,5)),delay=options.delay&&typeof options.delay==='object'?options.delay:delays(history);
    const linePatterns=topPatterns(analysisHistory,row),columnPatterns=topPatterns(analysisHistory,col);
    const repeatedRange=range80(historicalSeries(analysisHistory,(d,prior)=>intersections(d.dezenas,prior.at(-1)?.dezenas||[]),1),[8,10]);
    const sumRange=range80(analysisHistory.map(d=>sum(d.dezenas)),[166,220]);
    const primeRange=range80(analysisHistory.map(d=>countSet(d.dezenas,PRIMES)),[5,6]);
    const oddRange=range80(analysisHistory.map(d=>d.dezenas.filter(n=>n%2).length),[7,9]);
    const digitRange=range80(analysisHistory.map(d=>sum(d.dezenas.map(digitSum))),[50,75]);
    const fibRange=range80(analysisHistory.map(d=>countSet(d.dezenas,FIB)),[2,6]);
    const m3Range=range80(analysisHistory.map(d=>d.dezenas.filter(n=>n%3===0).length),[3,7]);
    const m5Range=range80(analysisHistory.map(d=>d.dezenas.filter(n=>n%5===0).length),[1,5]);
    const radialRange=range80(analysisHistory.map(d=>sum(d.dezenas.map(n=>n*n))),[1900,4300]);
    const terminalBandRange=range80(analysisHistory.map(d=>longestSame(d.dezenas.map(n=>(n%10)<=4?0:1))),[2,6]);
    const neighborRange=range80(analysisHistory.map(d=>neighbors(d.dezenas)),[8,18]);
    const decadeRanges=DECADES.map(set=>range80(analysisHistory.map(d=>countSet(d.dezenas,set)),[2,8]));
    const persistentAbsentSeries=historicalSeries(analysisHistory,(d,prior)=>{if(prior.length<2)return NaN;const a=new Set(prior.at(-1).dezenas),b=new Set(prior.at(-2).dezenas),grp=new Set(ALL.filter(n=>!a.has(n)&&!b.has(n)));return countSet(d.dezenas,grp);},2);
    const persistentAbsentRange=range80(persistentAbsentSeries,[1,4]);
    const floatingSeries=historicalSeries(analysisHistory,(d,prior)=>{if(prior.length<4)return NaN;return countSet(d.dezenas,floatingSet(prior.slice(-4)));},4);
    const floatingRange=range80(floatingSeries,[2,6]);
    const avgDelaySeries=historicalSeries(analysisHistory,(d,prior)=>{if(!prior.length)return NaN;const dm=delays(prior);return mean(d.dezenas.map(n=>dm[n]||0));},5);
    const avgDelayRange=range80(avgDelaySeries,[0.15,2.5]);
    const endingDeltaSeries=historicalSeries(analysisHistory,(d,prior)=>prior.length?endingDeltaOf(d.dezenas,prior.at(-1).dezenas):NaN,1);
    const endingDeltaRange=range80(endingDeltaSeries,[4,10]);
    const opposedRange=range80(analysisHistory.map(d=>{const lc=counts(d.dezenas,row);return Math.abs((lc[0]+lc[4])-(lc[1]+lc[3]));}),[0,4]);
    const cycleSeries=historicalSeries(analysisHistory,(d,prior)=>prior.length?countSet(d.dezenas,cycleMissingSet(prior)):NaN,3);
    const cycleRange=range80(cycleSeries,[0,5]);
    const previousSet=new Set(previous?.dezenas||[]);
    const persistentAbsent=new Set(ALL.filter(n=>!prev.has(n)&&!previousSet.has(n)));
    const floating=floatingSet(history.slice(-4));
    const cycleMissing=cycleMissingSet(history);
    const delayed=new Set(ALL.filter(n=>(delay[n]||0)>=3));
    const previousCouples=CANONICAL_COUPLES.filter(([a,b])=>prev.has(a)&&prev.has(b)).length;
    const flags={
      lowFinals:latest?[21,22,23].includes(Math.max(...latest.dezenas)):false,
      highStarts:latest?[4,5].includes(Math.min(...latest.dezenas)):false,
      edgeBlock:latest?[1,2,3,23,24,25].every(n=>prev.has(n)):false,
      couplesTrigger:previousCouples===1,
      previousCouples
    };
    return {history,analysisHistory,window:requested,latest,previous,prev,hash,history14,rank,hot,cold,delay,delayed,persistentAbsent,floating,cycleMissing,flags,linePatterns,columnPatterns,repeatedRange,sumRange,primeRange,oddRange,digitRange,fibRange,m3Range,m5Range,radialRange,terminalBandRange,neighborRange,decadeRanges,persistentAbsentRange,floatingRange,avgDelayRange,endingDeltaRange,opposedRange,cycleRange,calibrated:analysisHistory.length>=20};
  }

  function lineRepeatRule(game,latest=null){
    const g=normalize(game),prev=normalize(latest?.dezenas||latest);
    if(!g||!prev)return{blocked:false,passed:true,currentLines:[],previousLines:[]};
    const currentLines=counts(g,row),previousLines=counts(prev,row),blocked=currentLines.every((v,i)=>v===previousLines[i]);
    return{blocked,passed:!blocked,currentLines,previousLines};
  }

  function columnRepeatRule(game,latest=null){
    const g=normalize(game),prev=normalize(latest?.dezenas||latest);
    if(!g||!prev)return{blocked:false,passed:true,currentCols:[],previousCols:[]};
    const currentCols=counts(g,col),previousCols=counts(prev,col),blocked=currentCols.every((v,i)=>v===previousCols[i]);
    return{blocked,passed:!blocked,currentCols,previousCols};
  }

  function lineColumnRepeatRule(game,latest=null){
    const g=normalize(game),prev=normalize(latest?.dezenas||latest);
    if(!g||!prev)return{blocked:false,passed:true,sameLines:false,sameCols:false,currentLines:[],currentCols:[],previousLines:[],previousCols:[]};
    const currentLines=counts(g,row),currentCols=counts(g,col),previousLines=counts(prev,row),previousCols=counts(prev,col);
    const sameLines=currentLines.every((v,i)=>v===previousLines[i]),sameCols=currentCols.every((v,i)=>v===previousCols[i]),blocked=sameLines&&sameCols;
    return{blocked,passed:!blocked,sameLines,sameCols,currentLines,currentCols,previousLines,previousCols};
  }

  function inspect(game,ctx=buildContext()){
    const g=normalize(game);if(!g)return{valid:false,approved:false,filters:[],failed:[],warnings:[],metrics:{}};
    const set=new Set(g),lines=counts(g,row),cols=counts(g,col),qs=QUADRANTS.map(q=>countSet(g,q)),borderSectors=BORDER_SECTORS.map(q=>countSet(g,q));
    const center=countSet(g,CENTER),border=countSet(g,BORDER),run=maxRun(g),gap=maxGap(g),primes=countSet(g,PRIMES),odds=g.filter(n=>n%2).length,total=sum(g),repeated=ctx.latest?intersections(g,ctx.latest.dezenas):null;
    const top=lines[0]+lines[1],bottom=lines[3]+lines[4],left=cols[0]+cols[1],right=cols[3]+cols[4],elite=countSet(g,ELITE),couples=CANONICAL_COUPLES.filter(([a,b])=>set.has(a)&&set.has(b)).length;
    const absentRecent=ctx.latest?g.filter(n=>!ctx.prev.has(n)).length:0,persistentAbsent=countSet(g,ctx.persistentAbsent||new Set()),delayedCount=countSet(g,ctx.delayed||new Set()),floatingCount=countSet(g,ctx.floating||new Set()),cycleCount=countSet(g,ctx.cycleMissing||new Set());
    let boundaryAlerts=0;[[total,220],[odds,9],[primes,6],[repeated,10]].forEach(([v,max])=>{if(v!=null&&v===max)boundaryAlerts++;});
    const hotCount=countSet(g,ctx.hot),coldCount=countSet(g,ctx.cold),avgDelay=mean(g.map(n=>ctx.delay[n]||0));
    const endings=Array.from({length:10},(_,d)=>g.filter(n=>n%10===d).length),prevEndings=ctx.latest?Array.from({length:10},(_,d)=>ctx.latest.dezenas.filter(n=>n%10===d).length):Array(10).fill(0),endingDelta=sum(endings.map((v,i)=>Math.abs(v-prevEndings[i])));
    const opposedBands=Math.abs((lines[0]+lines[4])-(lines[1]+lines[3]));
    const ds=sum(g.map(digitSum)),fib=countSet(g,FIB),m3=g.filter(n=>n%3===0).length,m5=g.filter(n=>n%5===0).length;
    const exactHistorical=ctx.hash.has(keyOf(g));let histContest=null,has14=false;if(!exactHistorical&&ctx.history14){for(let i=0;i<15;i++){const k=keyOf(g.filter((_,j)=>j!==i));if(ctx.history14.has(k)){has14=true;histContest=ctx.history14.get(k);break;}}}const historicalCeiling=exactHistorical?15:has14?14:13;
    const posParityLongest=longestSame(g.map(n=>n%2)),terminalBinaryLongest=longestSame(g.map(n=>(n%10)<=4?0:1)),radial=sum(g.map(n=>n*n));
    const decades=DECADES.map(s=>countSet(g,s)),prog=progressionRun(g),blockCount=blocks2x2(g),fullBands=lines.filter(v=>v===5).length+cols.filter(v=>v===5).length,badPattern=run>=8||prog>=9||fullBands>=2||blockCount>=7;
    const adjacency=neighbors(g),cm=centroid(g),latestCm=ctx.latest?centroid(ctx.latest.dezenas):{x:2,y:2},heatFreq=Object.fromEntries(ALL.map(n=>[n,0]));ctx.analysisHistory.slice(-10).forEach(d=>d.dezenas.forEach(n=>heatFreq[n]++));
    const heatScore=sum(g.map(n=>heatFreq[n]))/Math.max(1,ctx.analysisHistory.slice(-10).length),fractalSpread=variance([lines.filter(Boolean).length,cols.filter(Boolean).length,...qs]),shearScore=variance(g.map(n=>Math.sin((col(n)/5)*Math.PI*2)+(row(n)-2)*.35)),resonance=ctx.history.length>=5?mean([1,2,3].map(lag=>intersections(g,ctx.history.at(-lag)?.dezenas||[]))):0;

    const checks=[];const add=(id,pass,detail,score=null)=>checks.push({...FILTERS[id-1],passed:!!pass,detail,score});
    add(1,ctx.linePatterns.size?ctx.linePatterns.has(signature(lines)):lines.every(v=>v>=1&&v<=4),`Linhas ${lines.join('-')} · assinatura ${signature(lines)}`);
    add(2,ctx.columnPatterns.size?ctx.columnPatterns.has(signature(cols)):cols.every(v=>v>=1&&v<=4),`Colunas ${cols.join('-')} · assinatura ${signature(cols)}`);
    add(3,center>=5&&center<=7,`${center} no miolo · regra fixa 5–7`);
    add(4,border>=9&&border<=11,`${border} na moldura · regra fixa 9–11`);
    add(5,lines.every(Boolean)&&cols.every(Boolean),`Linhas ${lines.join('-')} · colunas ${cols.join('-')} · nenhuma pode zerar`);
    add(6,qs.every(v=>v>=3&&v<=4),`Quadrantes ${qs.join('-')} · regra fixa 3–4`);
    add(7,run>=3&&run<=5,`Maior sequência ${run} · regra fixa 3–5`);
    add(8,gap<=5,`Maior salto ${gap} · menos de 5 vazios entre dezenas`);
    add(9,!hasExtremeTwins(lines)&&!hasExtremeTwins(cols),`Linhas ${lines.join('-')} · colunas ${cols.join('-')}`);
    add(10,Math.abs(top-bottom)<5,`Superior ${top} × inferior ${bottom} · diferença ${Math.abs(top-bottom)}`);
    add(11,Math.abs(left-right)<5,`Esquerda ${left} × direita ${right} · diferença ${Math.abs(left-right)}`);
    add(12,primes>=5&&primes<=6,`${primes} primos · regra fixa 5–6`);
    add(13,odds>=7&&odds<=9,`${odds} ímpares · regra fixa 7–9`);
    add(14,total>=166&&total<=220,`Soma ${total} · regra fixa 166–220`);
    add(15,repeated==null||repeated>=8&&repeated<=10,repeated==null?'Aguardando concurso anterior':`${repeated} repetidas · regra fixa 8–10`);
    const colGroups=Array.from({length:5},(_,c)=>ALL.filter(n=>col(n)===c)),rowGroups=Array.from({length:5},(_,r)=>ALL.filter(n=>row(n)===r));
    add(16,homogeneousGroups(set,colGroups)<3,'Menos de 3 colunas com paridade homogênea');
    add(17,homogeneousGroups(set,rowGroups)<3,'Menos de 3 linhas com paridade homogênea');
    add(18,elite!==5,`${elite}/5 dezenas da elite fixa`);
    add(19,elite>0,`${elite}/5 dezenas da elite fixa`);
    add(20,!(ctx.flags.lowFinals&&[21,22,23].includes(g[14])),ctx.flags.lowFinals?`Anterior terminou baixo · atual termina ${pad(g[14])}`:'Gatilho inativo');
    add(21,!(ctx.flags.highStarts&&g[0]>=4),ctx.flags.highStarts?`Anterior iniciou alto · atual inicia ${pad(g[0])}`:'Gatilho inativo');
    add(22,!(ctx.flags.edgeBlock&&[1,2,3,23,24,25].every(n=>set.has(n))),ctx.flags.edgeBlock?'Bloco extremo esteve completo no anterior':'Gatilho inativo');
    add(23,!ctx.flags.couplesTrigger||couples>=2,ctx.flags.couplesTrigger?`Anterior teve ${ctx.flags.previousCouples} casal(is) canônicos · atual ${couples}; exige pelo menos 2`:`Gatilho inativo · anterior ${ctx.flags.previousCouples} casal(is)`);
    add(24,ctx.latest==null||absentRecent>=5&&absentRecent<=6,ctx.latest==null?'Aguardando histórico':`${absentRecent} ausentes do concurso anterior · regra fixa 5–6`);
    add(25,ctx.delayed.size<2||(delayedCount>0&&delayedCount<ctx.delayed.size),`${delayedCount}/${ctx.delayed.size} atrasadas ≥3 · aplica somente com 2+ disponíveis`);
    add(26,ctx.floating.size<5||(floatingCount>=5&&floatingCount<=6),`${floatingCount}/${ctx.floating.size} flutuantes · regra canônica corrigida 5–6`);
    add(27,Math.abs(lines[0]-lines[4])<3,`Linha 1 ${lines[0]} × linha 5 ${lines[4]} · diferença ${Math.abs(lines[0]-lines[4])}`);
    add(28,boundaryAlerts<=2,`${boundaryAlerts} métricas exatamente no limite máximo canônico · máximo 2`);
    add(29,!exactHistorical,exactHistorical?'Jogo de 15 dezenas já sorteado':'Jogo inédito no histórico carregado');

    // F30–F44: complementares, sempre definidos para não repetir mecanicamente F01–F29.
    add(30,repeated==null||inRange(repeated,ctx.repeatedRange),repeated==null?'Aguardando concurso anterior':`${repeated} repetidas · termômetro histórico ${ctx.repeatedRange.join('–')}`);
    add(31,ctx.persistentAbsent.size===0||inRange(persistentAbsent,ctx.persistentAbsentRange),`${persistentAbsent} ausentes persistentes de 2 concursos · faixa ${ctx.persistentAbsentRange.join('–')}`);
    add(32,inRange(avgDelay,ctx.avgDelayRange),`Atraso médio ${avgDelay.toFixed(2)} · faixa ${ctx.avgDelayRange.map(v=>Number(v).toFixed(2)).join('–')}`);
    add(33,ctx.latest==null||inRange(endingDelta,ctx.endingDeltaRange),ctx.latest==null?'Aguardando histórico':`Distância do perfil de finais ${endingDelta} · faixa ${ctx.endingDeltaRange.join('–')}`);
    add(34,inRange(opposedBands,ctx.opposedRange),`Faixas opostas agregadas: ${opposedBands} · faixa ${ctx.opposedRange.join('–')}`);
    add(35,ctx.cycleMissing.size===0||inRange(cycleCount,ctx.cycleRange),`${cycleCount}/${ctx.cycleMissing.size} dezenas pendentes no ciclo · faixa ${ctx.cycleRange.join('–')}`);
    const anomalyFails=checks.filter(f=>f.id>=30&&f.id<=35&&!f.passed).length;
    add(36,anomalyFails<=2,`${anomalyFails} anomalia(s) simultânea(s) entre F30–F35 · máximo 2`);
    add(37,!has14&&!exactHistorical,exactHistorical?'Similaridade 15/15':has14?`Similaridade 14/15 · concurso ${histContest}`:'Nenhuma coincidência de 14/15 encontrada');
    add(38,posParityLongest<=5,`Maior cadeia posicional de paridade ${posParityLongest}`);
    add(39,inRange(terminalBinaryLongest,ctx.terminalBandRange),`Maior cadeia de finais baixos (0–4) / altos (5–9): ${terminalBinaryLongest} · faixa ${ctx.terminalBandRange.join('–')}`);
    add(40,inRange(radial,ctx.radialRange),`Soma dos quadrados ${radial} · faixa ${ctx.radialRange.join('–')}`);
    add(41,decades.every((v,i)=>inRange(v,ctx.decadeRanges[i])),`Faixas 01–09 / 10–19 / 20–25 = ${decades.join('-')} · histórico ${ctx.decadeRanges.map(r=>r.join('–')).join(' / ')}`);
    add(42,!badPattern,badPattern?`Assinatura mecânica forte · run ${run}, prog ${prog}, faixas completas ${fullBands}, 2×2 ${blockCount}`:`Sem assinatura mecânica extrema`);
    add(43,inRange(adjacency,ctx.neighborRange),`${adjacency} conexões ortogonais no rastro 2D · faixa ${ctx.neighborRange.join('–')}`);
    add(44,dist(cm,{x:2,y:2})<=.85,`Centro (${cm.x.toFixed(2)}, ${cm.y.toFixed(2)}) · distância ${dist(cm,{x:2,y:2}).toFixed(2)}`);
    add(45,true,`Score shear ${shearScore.toFixed(3)} · experimental`,shearScore);
    add(46,true,`Deslocamento do centro vs anterior ${dist(cm,latestCm).toFixed(3)} · experimental`,dist(cm,latestCm));
    add(47,true,`Dispersão fractal ${fractalSpread.toFixed(3)} · experimental`,fractalSpread);
    add(48,true,`Ressonância ${resonance.toFixed(2)} · experimental`,resonance);
    add(49,true,`Heat score ${heatScore.toFixed(2)} · experimental`,heatScore);
    add(50,true,'Cobertura calculada no módulo Fechamentos; esta posição não elimina isoladamente.');
    add(51,true,'Exportação/carteira operacional; esta posição não elimina isoladamente.');

    const hardFailed=checks.filter(f=>(f.mode==='core'||MANDATORY_BLOCKS.has(f.id))&&!f.passed),warnings=checks.filter(f=>f.mode==='advisory'&&!MANDATORY_BLOCKS.has(f.id)&&f.id!==23&&!f.passed),patternCooldown=exactPatternCooldown(lines,ctx.history||[]),colorRule=mandatoryColorRule(g),lineRepeat=lineRepeatRule(g,ctx.latest),columnRepeat=columnRepeatRule(g,ctx.latest),lineColumnRepeat=lineColumnRepeatRule(g,ctx.latest);
    return {valid:true,approved:hardFailed.length===0&&!patternCooldown.blocked&&!colorRule.blocked&&!lineRepeat.blocked&&!columnRepeat.blocked&&!lineColumnRepeat.blocked,filters:checks,failed:hardFailed.map(f=>f.id),warnings:warnings.map(f=>f.id),patternCooldown,colorRule,lineRepeat,columnRepeat,lineColumnRepeat,metrics:{lines,cols,qs,borderSectors,center,border,run,gap,primes,odds,total,repeated,elite,couples,absentRecent,persistentAbsent,delayedCount,floatingCount,cycleCount,opposedBands,hotCount,coldCount,avgDelay,endingDelta,ds,fib,m3,m5,maxHistorical:historicalCeiling,radial,adjacency,colors:colorRule.distinct,colorCounts:colorRule.counts,centroid:cm},calibrated:ctx.calibrated};
  }
  function histoSafe(x){return Number.isFinite(x)?x:0;}

  function policyAllows(report,policies={}){
    if(report?.valid===false||report?.patternCooldown?.blocked||report?.colorRule?.blocked||report?.lineRepeat?.blocked||report?.columnRepeat?.blocked||report?.lineColumnRepeat?.blocked)return false;
    return report.filters.every(f=>{
      const policy=MANDATORY_BLOCKS.has(f.id)?'block':(policies[f.id]||(f.id===23?'ignore':f.mode==='core'?'block':f.mode==='advisory'?'warn':'ignore'));
      return policy!=='block'||f.passed;
    });
  }
  function randomAllowedGame(excluded=[]){const blocked=new Set((excluded||[]).map(Number)),a=ALL.filter(n=>!blocked.has(n));if(a.length<15)return null;for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,15).sort((x,y)=>x-y);}
  function generate(ctx,quantity=1,maxAttempts=300000,options={}){const target=Math.max(1,Math.min(20,Number(quantity)||1)),out=[],seen=new Set(),excluded=options.excluded||[],policies=options.policies||{};let tested=0;while(out.length<target&&tested<maxAttempts){const g=randomAllowedGame(excluded);if(!g)break;const k=keyOf(g);tested++;if(seen.has(k))continue;seen.add(k);const r=inspect(g,ctx);if(policyAllows(r,policies))out.push(g);}return{games:out,tested,complete:out.length===target};}

  function rangeCentral(value,range){if(!Number.isFinite(value)||!range)return 0;const mid=(range[0]+range[1])/2,half=Math.max(.5,(range[1]-range[0])/2);return Math.max(-1,1-Math.abs(value-mid)/half);}
  function candidateScoreFromReport(r,ctx,policies={}){if(!r?.valid||r.patternCooldown?.blocked||r.colorRule?.blocked||r.lineRepeat?.blocked||r.columnRepeat?.blocked||r.lineColumnRepeat?.blocked)return-Infinity;const blocked=r.filters.filter(f=>(MANDATORY_BLOCKS.has(f.id)?'block':(policies[f.id]||(f.id===23?'ignore':f.mode==='core'?'block':f.mode==='advisory'?'warn':'ignore')))==='block'&&!f.passed).length;if(blocked)return-Infinity;const warns=r.filters.filter(f=>(MANDATORY_BLOCKS.has(f.id)?'block':(policies[f.id]||(f.id===23?'ignore':f.mode==='core'?'block':f.mode==='advisory'?'warn':'ignore')))==='warn'&&!f.passed).length,m=r.metrics;let score=70-warns*1.25;score+=rangeCentral(m.total,ctx.sumRange)*5;score+=rangeCentral(m.odds,ctx.oddRange)*4;score+=rangeCentral(m.primes,ctx.primeRange)*3;if(m.repeated!=null)score+=rangeCentral(m.repeated,ctx.repeatedRange)*4;score+=Math.max(-2,3-Math.abs(m.center-6));score+=Math.max(-2,2-variance(m.lines));score+=Math.max(-2,2-variance(m.cols));score+=Math.max(-2,2-variance(m.qs));if(m.maxHistorical>=14)score-=12;else if(m.maxHistorical===13)score-=2;return +score.toFixed(6);}
  function candidateScore(game,ctx,policies={}){return candidateScoreFromReport(inspect(game,ctx),ctx,policies);}
  function nCk(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);}
  function unrank(pool,k,rank){const out=[];let start=0,r=Math.max(0,Math.floor(rank));for(let need=k;need>0;need--){for(let i=start;i<=pool.length-need;i++){const c=nCk(pool.length-i-1,need-1);if(r<c){out.push(pool[i]);start=i+1;break;}r-=c;}}return out;}
  function deterministicBest(ctx,policies={},options={}){
    const blocked=new Set((options.excluded||[]).map(Number)),pool=ALL.filter(n=>!blocked.has(n));if(pool.length<15)return{game:null,score:-Infinity,tested:0,total:0,approvedCount:0,rankIndex:0};
    const total=nCk(pool.length,15),sample=Math.max(100,Math.min(total,Number(options.sampleSize)||12000)),rankIndex=Math.max(0,Math.floor(Number(options.rankIndex)||0)),approved=[];let tested=0;
    for(let i=0;i<sample;i++){
      const rank=sample===1?0:Math.floor(i*(total-1)/(sample-1)),g=unrank(pool,15,rank),s=candidateScore(g,ctx,policies);tested++;
      if(Number.isFinite(s))approved.push({game:g,score:s});
    }
    approved.sort((a,b)=>b.score-a.score||keyOf(a.game).localeCompare(keyOf(b.game)));
    const picked=approved[rankIndex]||null;
    return{game:picked?.game||null,score:picked?.score??-Infinity,tested,total,sample,approvedCount:approved.length,rankIndex};
  }
  function portfolioScore(games){const norm=games.map(normalize).filter(Boolean);if(norm.length<2)return{score:100,meanOverlap:0,maxOverlap:0};const overlaps=[];for(let i=0;i<norm.length;i++)for(let j=i+1;j<norm.length;j++)overlaps.push(intersections(norm[i],norm[j]));const mo=mean(overlaps),mx=Math.max(...overlaps);return{score:Math.max(0,Math.round(100-(mo-7)*12-(mx-10)*5)),meanOverlap:+mo.toFixed(2),maxOverlap:mx};}

  window.LFMatrix51={SCHEMA_VERSION,THRESHOLD_VERSION,AUDIT_VERSION,AUDIT_BASE_THROUGH,PATTERN_COOLDOWNS,THRESHOLDS,FILTERS,buildContext,inspect,generate,portfolioScore,normalize,keyOf,maxHistoricalHits,mandatoryColorRule,exactPatternCooldown,policyAllows,candidateScore,candidateScoreFromReport,deterministicBest,nCk,unrank};
})();
