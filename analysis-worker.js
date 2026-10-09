self.window=self;
/* LF Inteligente V3.7.5 — Matriz 51 canônica restaurada, versionada e auditável.
 * F01–F29 preservam a matriz canônica e foram diferenciados para evitar redundâncias exatas.
 * F30–F44 ampliam a análise com métricas não duplicadas.
 * F45–F49 são experimentais (score/hipótese; não eliminam por padrão).
 * F50–F51 são operacionais.
 * Estes filtros não alteram a probabilidade matemática do sorteio.
 */
(() => {
  'use strict';

  const ALL = Array.from({ length: 25 }, (_, i) => i + 1);
  const MANDATORY_BLOCKS=new Set([29]);
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
  const SCHEMA_VERSION = 'matrix51-zero-failure-2026-10-09-v3.7.6';
  const THRESHOLD_VERSION = 'LF-M86-ZF-2026.10.09-MORPH2-SPEC2-BASE3799-v3.7.6';
  const AUDIT_VERSION = 'LF-M86-ZF-AUDIT-3799-v3.7.6';
  const AUDIT_BASE_THROUGH = 3799;
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
    const passed=distinct>=8&&distinct<=10;
    return{blocked:!passed,passed,distinct,min:8,max:10,counts:colorCounts,profile,complete,blockedProfile:false,profileDiagnostic:blockedProfile};
  }
  const FULL_COLOR_TRIPLES=Object.freeze([
    {id:1,name:'Vermelha',nums:[1,11,21]},
    {id:2,name:'Amarela',nums:[2,12,22]},
    {id:3,name:'Verde',nums:[3,13,23]},
    {id:4,name:'Marrom',nums:[4,14,24]},
    {id:5,name:'Azul',nums:[5,15,25]}
  ]);
  function buildFullColorDelayModel(history=[]){
    const rows=Array.isArray(history)?history:[];
    return FULL_COLOR_TRIPLES.map(color=>{
      const flags=rows.map(d=>{const s=new Set(d?.dezenas||[]);return color.nums.every(n=>s.has(n));});
      const occurrences=flags.reduce((a,v)=>a+(v?1:0),0),baseRate=flags.length?occurrences/flags.length:0;
      let currentDelay=0;for(let i=flags.length-1;i>=0&&!flags[i];i--)currentDelay++;
      let delay=0,cases=0,returns=0;
      for(let i=0;i<flags.length;i++){
        if(delay===currentDelay){cases++;if(flags[i])returns++;}
        delay=flags[i]?0:delay+1;
      }
      const exactRate=cases?returns/cases:0,uplift=exactRate-baseRate;
      const bonus=currentDelay>=2&&cases>=50&&uplift>0?Math.min(.75,uplift*10):0;
      return{...color,currentDelay,occurrences,baseRate:+baseRate.toFixed(6),cases,returns,exactRate:+exactRate.toFixed(6),uplift:+uplift.toFixed(6),bonus:+bonus.toFixed(3)};
    });
  }
  function fullColorDelayBonus(game,modelOrHistory=[]){
    const g=normalize(game);if(!g)return{bonus:0,matches:[]};
    const model=Array.isArray(modelOrHistory)&&modelOrHistory.length&&Array.isArray(modelOrHistory[0]?.nums)?modelOrHistory:buildFullColorDelayModel(modelOrHistory);
    const set=new Set(g),matches=model.filter(x=>Number(x.bonus)>0&&x.nums.every(n=>set.has(n))).map(x=>({...x}));
    const bonus=Math.min(1,matches.reduce((s,x)=>s+Number(x.bonus||0),0));
    return{bonus:+bonus.toFixed(3),matches};
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
    ['Miolo entre 4 e 9','Canônica F01–F29','core'],
    ['Moldura entre 9 e 11','Canônica F01–F29','core'],
    ['Linha/coluna vazia · aviso','Canônica F01–F29','advisory'],
    ['Equilíbrio dos quadrantes · observar','Canônica F01–F29','advisory'],
    ['Sequência máxima entre 3 e 5','Canônica F01–F29','core'],
    ['Maior salto até 6','Canônica F01–F29','core'],
    ['Gêmeas baixas 0/1 · aviso','Canônica F01–F29','advisory'],
    ['Espelhamento horizontal: diferença até 4','Canônica F01–F29','core'],
    ['Espelhamento vertical: diferença até 5','Canônica F01–F29','core'],
    ['Primos entre 4 e 8','Canônica F01–F29','core'],
    ['Ímpares entre 5 e 10','Canônica F01–F29','core'],
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
    ['Até 2 alertas nos novos extremos','Canônica F01–F29','advisory'],
    ['Bloqueia combinação exata de 15 dezenas já sorteada','Canônica F01–F29','core'],
    ['Repetidas com Termômetro','Complementar F30–F44','advisory'],
    ['Ausentes Persistentes de 2 Concursos','Complementar F30–F44','advisory'],
    ['Média de Atraso','Complementar F30–F44','advisory'],
    ['Finais Repetidos','Complementar F30–F44','advisory'],
    ['Linhas Opostas Ampliadas','Complementar F30–F44','advisory'],
    ['Ciclo de Dezenas','Complementar F30–F44','advisory'],
    ['Intersecção de Anomalias','Complementar F30–F44','advisory'],
    ['Similaridade 14/15 · últimos 500','Histórico','advisory'],
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
    3:{type:'fixed',rule:'Miolo 4–9'},4:{type:'fixed',rule:'Moldura 9–11'},5:{type:'advisory',rule:'Aviso se houver linha/coluna vazia'},
    6:{type:'advisory',rule:'Aviso: quadrantes 3–4; não bloqueia'},7:{type:'fixed',rule:'Sequência máxima 3–5'},8:{type:'fixed',rule:'Maior salto ≤6'},9:{type:'advisory',rule:'Aviso apenas para gêmeas baixas adjacentes 0/1; 4–4 liberado'},
    10:{type:'fixed',rule:'|superior−inferior|≤4'},11:{type:'fixed',rule:'|esquerda−direita|≤5'},12:{type:'fixed',rule:'Primos 4–8'},13:{type:'fixed',rule:'Ímpares 5–10'},14:{type:'fixed',rule:'Soma 166–220'},15:{type:'fixed',rule:'Repetidas 8–10'},
    16:{type:'fixed',rule:'<3 colunas com paridade homogênea'},17:{type:'fixed',rule:'<3 linhas com paridade homogênea'},18:{type:'fixed',rule:'Não usar as 5 da elite'},19:{type:'fixed',rule:'Usar ≥1 da elite'},
    20:{type:'conditional',rule:'Se anterior terminou baixo, evitar 21–23 no final'},21:{type:'conditional',rule:'Se anterior iniciou 04/05, iniciar abaixo de 04'},22:{type:'conditional',rule:'Se bloco extremo veio completo, não repeti-lo completo'},
    23:{type:'conditional',rule:'Casais 01–02, 03–04, 05–06, 07–08, 09–10: se o anterior teve exatamente 1 casal, exigir pelo menos 2'},24:{type:'fixed',rule:'Ausentes do anterior 5–6'},25:{type:'conditional',rule:'Com ≥2 atrasadas (≥3), usar parte do grupo'},26:{type:'fixed',rule:'Inércia flutuante: dezenas que alternaram presença/ausência ≥2 vezes nos últimos 4 concursos; usar 5–6 quando o grupo comporta a regra'},27:{type:'fixed',rule:'|L1−L5|≤2'},28:{type:'fixed',rule:'No máximo 2 métricas nos novos extremos: soma 150/230, ímpares 5/10, primos 4/8 e repetidas 7/12; 3+ bloqueiam.'},29:{type:'historical-lock',rule:'Não repetir combinação histórica 15/15'},
    30:{type:'walk-forward-80',rule:'Repetidas dentro da faixa central histórica de 80%'},31:{type:'walk-forward-80',rule:'Retorno de ausentes persistentes (2 concursos) na faixa de 80%'},32:{type:'walk-forward-80',rule:'Média de atraso na faixa histórica de 80%'},33:{type:'walk-forward-80',rule:'Mudança do perfil de finais na faixa histórica de 80%'},34:{type:'walk-forward-80',rule:'Balanço L1+L5 vs L2+L4 na faixa histórica de 80%'},35:{type:'walk-forward-80',rule:'Pendentes do ciclo na faixa histórica de 80%'},36:{type:'derived',rule:'≤2 falhas simultâneas em F30–F35'},
    37:{type:'historical-warning',rule:'Sem similaridade 14/15 nos últimos 500 concursos'},38:{type:'fixed',rule:'Cadeia posicional de paridade ≤5'},39:{type:'walk-forward-80',rule:'Terminação binária reformulada: finais 0–4 vs 5–9; maior cadeia dentro da faixa histórica de 80%'},40:{type:'walk-forward-80',rule:'Variância radial na faixa histórica de 80%'},41:{type:'walk-forward-80',rule:'Faixas 01–09/10–19/20–25 dentro das faixas históricas'},42:{type:'fixed',rule:'Sem assinatura mecânica extrema'},43:{type:'walk-forward-80',rule:'Conectividade ortogonal na faixa histórica de 80%'},44:{type:'fixed',rule:'Distância do centro de massa ≤0,85'},
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
    const history14=new Map();for(const d of history.slice(-500)){for(let i=0;i<15;i++){const k=keyOf(d.dezenas.filter((_,j)=>j!==i));history14.set(k,d.concurso);}}
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


  const EXA_ORTHOGONAL_RULES=Object.freeze({
    'EXA-TOPO-01':{label:'Topologia ocupada',rule:'Maior componente ortogonal das 15 dezenas <= 4',threshold:'fgMax4<=4',status:'QUARENTENA',enabledByDefault:false,isolatedGames:1929,exclusiveGames:1444},
    'EXA-TOPO-02':{label:'Topologia ausentes',rule:'10 ausentes formam 9 ou mais componentes ortogonais',threshold:'bgComp4>=9',status:'QUARENTENA',enabledByDefault:false,isolatedGames:735,exclusiveGames:485},
    'EXA-DEG-01':{label:'Momento de graus',rule:'Wedges do grafo ortogonal <= 5',threshold:'wedges<=5',status:'OBSERVAR',enabledByDefault:false,isolatedGames:557,exclusiveGames:101},
    'EXA-DIR-01':{label:'Anisotropia direcional',rule:'|H-V| + |D1-D2| >= 8',threshold:'dirAbsDev>=8',status:'QUARENTENA',enabledByDefault:false,isolatedGames:639,exclusiveGames:634},
    'EXA-BITQ-01':{label:'Bit-quads diagonais',rule:'8 ou mais blocos 2x2 com exatamente 2 diagonais',threshold:'q2d>=8',status:'QUARENTENA',enabledByDefault:false,isolatedGames:908,exclusiveGames:479},
    'EXA-SYM-01':{label:'Simetria D4',rule:'Variância inteira das 6 assimetrias D4 <= 5',threshold:'symVar6<=5',status:'QUARENTENA',enabledByDefault:false,isolatedGames:851,exclusiveGames:833},
    'EXA-DIST-01':{label:'Espectro de distâncias',rule:'30 ou mais pares Manhattan com distância 3',threshold:'man3>=30',status:'QUARENTENA',enabledByDefault:false,isolatedGames:845,exclusiveGames:823}
  });
  const EXA_ORTHOGONAL_SUMMARY=Object.freeze({
    baseThrough:3799,
    universe:3268760,
    matrixApprovedBeforeExa:3264961,
    activeKeys:Object.freeze(['EXA-TEMP-01','EXA-TEMP-02','EXA-TEMP-03','EXA-TEMP-04','EXA-TEMP-05','EXA-TEMP-06','EXA-TEMP-07','EXA-TEMP-08','EXA-WJ-01','EXA-CROSS-01','EXA-CROSS-02','EXA-CROSS-03','EXA-CROSS-04','EXA-CROSS-05','EXA-CROSS-06','EXA-CROSS-07','EXA-CROSS-08','EXA-CROSS-09','EXA-CROSS-10','EXA-MORPH2-01','EXA-MORPH2-02','EXA-SPEC2-01']),
    unionMarginalGames:79014,
    unionPctOfMatrix:2.420059535167495,
    unionPctOfUniverse:2.417246907084032,
    countingRule:'F29 + EXA-TEMP-01..08 + EXA-WJ-01 + EXA-CROSS-01..10 + F84-F86 · zero falhas walk-forward; cada jogo contado uma única vez',
    degIncluded:false
  });
  const EXA_N4=Array.from({length:25},()=>[]);
  for(let r=0;r<5;r++)for(let c=0;c<5;c++){const i=r*5+c;if(c>0)EXA_N4[i].push(i-1);if(c<4)EXA_N4[i].push(i+1);if(r>0)EXA_N4[i].push(i-5);if(r<4)EXA_N4[i].push(i+5);}
  function exaComponentSizes(mask){
    const rem=new Set();for(let i=0;i<25;i++)if(mask&(1<<i))rem.add(i);const sizes=[];
    while(rem.size){const start=rem.values().next().value;rem.delete(start);const stack=[start];let size=0;while(stack.length){const i=stack.pop();size++;for(const j of EXA_N4[i])if(rem.delete(j))stack.push(j);}sizes.push(size);}
    return sizes.sort((a,b)=>b-a);
  }
  function exaTransformIndex(i,type){const r=Math.floor(i/5),c=i%5;if(type===0)return c*5+4-r;if(type===1)return(4-r)*5+4-c;if(type===2)return c*5+r;if(type===3)return(4-c)*5+4-r;if(type===4)return r*5+4-c;return(4-r)*5+c;}
  function exaOrthogonalMetrics(game=[]){
    const g=normalize(game);if(!g)return null;const selected=new Set(g),mask=g.reduce((m,n)=>m|(1<<(n-1)),0)>>>0,allMask=(1<<25)-1,bg=(~mask)&allMask;
    const fgSizes=exaComponentSizes(mask),bgSizes=exaComponentSizes(bg);let wedges=0,H=0,V=0,D1=0,D2=0,q2d=0,man3=0;
    for(const n of g){const i=n-1,r=Math.floor(i/5),c=i%5;let deg=0;for(const j of EXA_N4[i])if(mask&(1<<j))deg++;wedges+=deg*(deg-1)/2;if(c<4&&selected.has(n+1))H++;if(r<4&&selected.has(n+5))V++;if(r<4&&c<4&&selected.has(n+6))D1++;if(r<4&&c>0&&selected.has(n+4))D2++;}
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){const ix=[r*5+c,r*5+c+1,(r+1)*5+c,(r+1)*5+c+1],a=ix.map(i=>(mask>>i)&1),k=a[0]+a[1]+a[2]+a[3];if(k===2&&((a[0]&&a[3])||(a[1]&&a[2])))q2d++;}
    const sym=[];for(let t=0;t<6;t++){let overlap=0;for(let i=0;i<25;i++)if((mask&(1<<i))&&(mask&(1<<exaTransformIndex(i,t))))overlap++;sym.push(15-overlap);}const symSum=sym.reduce((a,b)=>a+b,0),symSq=sym.reduce((a,b)=>a+b*b,0),symVar6=6*symSq-symSum*symSum;
    for(let a=0;a<g.length;a++){const i=g[a]-1,r=Math.floor(i/5),c=i%5;for(let b=a+1;b<g.length;b++){const j=g[b]-1;if(Math.abs(r-Math.floor(j/5))+Math.abs(c-j%5)===3)man3++;}}
    return{fgMax4:fgSizes[0]||0,bgComp4:bgSizes.length,wedges,dirAbsDev:Math.abs(H-V)+Math.abs(D1-D2),q2d,symVar6,man3};
  }
  const EXA_EXTENDED_RULES=Object.freeze({
    'EXA-SHAPE-01':{label:'Shape xadrez + q3',rule:'checker >= 7 E q3 >= 10',status:'QUARENTENA',enabledByDefault:false,id:59,marginalGames:0},
    'EXA-SHAPE-02':{label:'Shape xadrez + furos',rule:'checker >= 9 E furos >= 3',status:'QUARENTENA',enabledByDefault:false,id:60,marginalGames:0},
    'EXA-SHAPE-03':{label:'Shape arestas + q3 baixo',rule:'arestas >= 19 E q3 <= 2',status:'QUARENTENA',enabledByDefault:false,id:61,marginalGames:11},
    'EXA-SHAPE-04':{label:'Shape arestas + pontas',rule:'arestas >= 20 E pontas <= 1',status:'QUARENTENA',enabledByDefault:false,id:62,marginalGames:4},
    'EXA-SHAPE-05':{label:'Shape pontas + bifurcações',rule:'pontas <= 1 E bifurcações >= 9',status:'QUARENTENA',enabledByDefault:false,id:63,marginalGames:5},
    'EXA-SHAPE-06':{label:'Shape pontas + q3 alto',rule:'pontas <= 1 E q3 >= 10',status:'QUARENTENA',enabledByDefault:false,id:64,marginalGames:7},
    'EXA-TEMP-01':{label:'Transição perímetro × linhas',rule:'|perímetro atual-lag1| >= 10 E L1 linhas vs lag3 >= 12',status:'ATIVO',enabledByDefault:true,id:65,marginalGames:1048},
    'EXA-TEMP-02':{label:'Transição furos × perímetro',rule:'|furos atual-lag1| >= 2 E |perímetro atual-lag3| >= 16',status:'ATIVO',enabledByDefault:true,id:66,marginalGames:1028},
    'EXA-TEMP-03':{label:'Transição furos extremos × perímetro',rule:'|furos atual-lag1| >= 4 E |perímetro atual-lag3| >= 10',status:'ATIVO',enabledByDefault:true,id:67,marginalGames:136},
    'EXA-TEMP-04':{label:'Transição componentes × gaps',rule:'|componentes atual-lag1| >= 3 E L1 gaps vs lag3 <= 4',status:'ATIVO',enabledByDefault:true,id:68,marginalGames:204},
    'EXA-TEMP-05':{label:'Lag7 componentes × gaps',rule:'|componentes atual-lag7| >= 4 E L1 gaps vs lag7 <= 6',status:'ATIVO',enabledByDefault:true,id:69,marginalGames:254},
    'EXA-TEMP-06':{label:'Lag2 gaps × lag9 componentes',rule:'L1 gaps vs lag2 <= 6 E |componentes atual-lag9| >= 4',status:'ATIVO',enabledByDefault:true,id:70,marginalGames:749},
    'EXA-TEMP-07':{label:'Lag3 gaps × lag4 componentes',rule:'L1 gaps vs lag3 <= 6 E |componentes atual-lag4| >= 4',status:'ATIVO',enabledByDefault:true,id:71,marginalGames:157},
    'EXA-TEMP-08':{label:'Lag4 colunas × lag6 gaps',rule:'L1 colunas vs lag4 >= 10 E L1 gaps vs lag6 <= 6',status:'ATIVO',enabledByDefault:true,id:72,marginalGames:2076},
    'EXA-WJ-01':{label:'Walsh alta-sequência × Johnson20',rule:'Energia Walsh alta-sequência >= 900 E variância Johnson20 >= 55',status:'ATIVO',enabledByDefault:true,id:73,marginalGames:147},
    'EXA-CROSS-01':{label:'Moldura × Primos',rule:'assinaturas 2x2 moldura/miolo × primo/não-primo',status:'ATIVO',enabledByDefault:true,id:74,marginalGames:1395},
    'EXA-CROSS-02':{label:'Moldura × Paridade',rule:'assinaturas 2x2 moldura/miolo × par/ímpar',status:'ATIVO',enabledByDefault:true,id:75,marginalGames:824},
    'EXA-CROSS-03':{label:'Baixas × Primos',rule:'assinaturas 2x2 baixas/altas × primo/não-primo',status:'ATIVO',enabledByDefault:true,id:76,marginalGames:647},
    'EXA-CROSS-04':{label:'Paridade × Baixas',rule:'assinaturas 2x2 par/ímpar × baixas/altas',status:'ATIVO',enabledByDefault:true,id:77,marginalGames:411},
    'EXA-CROSS-05':{label:'Fibonacci × Primos',rule:'assinaturas 2x2 Fibonacci × Primos',status:'ATIVO',enabledByDefault:true,id:78,marginalGames:249},
    'EXA-CROSS-06':{label:'Fibonacci × Múltiplos de 3',rule:'assinaturas 2x2 Fibonacci × Múltiplos de 3',status:'ATIVO',enabledByDefault:true,id:79,marginalGames:1890},
    'EXA-CROSS-07':{label:'Fibonacci × Mágicos',rule:'assinaturas 2x2 Fibonacci × Mágicos',status:'ATIVO',enabledByDefault:true,id:80,marginalGames:1284},
    'EXA-CROSS-08':{label:'Primos × Múltiplos de 3',rule:'assinaturas 2x2 Primos × Múltiplos de 3',status:'ATIVO',enabledByDefault:true,id:81,marginalGames:850},
    'EXA-CROSS-09':{label:'Primos × Mágicos',rule:'assinaturas 2x2 Primos × Mágicos',status:'ATIVO',enabledByDefault:true,id:82,marginalGames:1098},
    'EXA-CROSS-10':{label:'Múltiplos de 3 × Mágicos',rule:'assinaturas 2x2 Múltiplos de 3 × Mágicos',status:'ATIVO',enabledByDefault:true,id:83,marginalGames:1175},
    'EXA-MORPH2-01':{label:'F84 · Grau × Bit-quads × Run-length',rule:'assinatura 0.7.5.3.0 | 2.4.3.6.1 | 8.6.2.1.0',status:'ATIVO · ZERO FALHAS',enabledByDefault:true,id:84,marginalGames:982},
    'EXA-MORPH2-02':{label:'F85 · Componentes × Bit-quads × Run-length',rule:'assinatura 14.1 | 3.3.1.7.2 | 7.4.2.1.1',status:'ATIVO · ZERO FALHAS',enabledByDefault:true,id:85,marginalGames:784},
    'EXA-SPEC2-01':{label:'F86 · Componentes × Grau × Bit-quads',rule:'assinatura 14.1 | 1.3.5.5.1 | 2.4.1.6.3',status:'ATIVO · ZERO FALHAS',enabledByDefault:true,id:86,marginalGames:1297}
  });
  function exaShapeMetrics(game=[]){
    const g=normalize(game);if(!g)return null;
    const mask=g.reduce((m,n)=>m|(1<<(n-1)),0)>>>0,selected=new Set(g);
    let edges=0,endpoints=0,junctions=0,checker=0,perimeter=0,q3=0;
    for(const n of g){const i=n-1,r=Math.floor(i/5),c=i%5;let deg=0;for(const j of EXA_N4[i])if(mask&(1<<j))deg++;edges+=deg;perimeter+=4-deg;if(deg===1)endpoints++;if(deg>=3)junctions++;checker+=((r+c)%2===0?1:-1);}
    edges/=2;checker=Math.abs(checker);
    const bg=new Set();for(let i=0;i<25;i++)if(!(mask&(1<<i)))bg.add(i);let holes=0;
    while(bg.size){const st=bg.values().next().value;bg.delete(st);const q=[st];let touch=false;while(q.length){const i=q.pop(),r=Math.floor(i/5),c=i%5;if(r===0||r===4||c===0||c===4)touch=true;for(const j of EXA_N4[i])if(bg.delete(j))q.push(j);}if(!touch)holes++;}
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){const ix=[r*5+c,r*5+c+1,(r+1)*5+c,(r+1)*5+c+1];let k=0;for(const i of ix)if(mask&(1<<i))k++;if(k===3)q3++;}
    const compN=exaComponentSizes(mask).length,lines=counts(g,row),gaps=g.slice(1).map((n,i)=>n-g[i]);
    return{edges,endpoints,junctions,checker,perimeter,q3,holes,compN,lines,gaps};
  }
  function exaTemporalMetrics(game=[],ctx={}){
    const cur=exaShapeMetrics(game);if(!cur)return{};
    const hist=ctx?.history||[],l1=(a,b)=>a.reduce((s,v,i)=>s+Math.abs(v-b[i]),0),out={};
    for(let lag=1;lag<=10;lag++){
      const d=hist.at?.(-lag);if(!d)continue;
      const a=exaShapeMetrics(d.dezenas||d);if(!a)continue;
      out['perimD'+lag]=Math.abs(cur.perimeter-a.perimeter);
      out['holesD'+lag]=Math.abs(cur.holes-a.holes);
      out['compD'+lag]=Math.abs(cur.compN-a.compN);
      out['lineL1'+lag]=l1(cur.lines,a.lines);
      out['colL1'+lag]=l1(counts(game,col),counts(d.dezenas||d,col));
      out['gapL1'+lag]=l1(cur.gaps,a.gaps);
    }
    return out;
  }

  const EXA_H8=(function(){
    let H=[[1]];
    while(H.length<8){
      const A=H.map(r=>r.slice()),n=A.length,out=Array.from({length:n*2},()=>Array(n*2).fill(0));
      for(let i=0;i<n;i++)for(let j=0;j<n;j++){out[i][j]=A[i][j];out[i][j+n]=A[i][j];out[i+n][j]=A[i][j];out[i+n][j+n]=-A[i][j];}
      H=out;
    }
    return H;
  })();
  const EXA_WALSH_HI_MODES=(function(){
    const out=[];
    for(let u=0;u<8;u++)for(let v=0;v<8;v++){
      if(u+v<8)continue;
      const w=[];let base=0;
      for(let r=0;r<5;r++)for(let c=0;c<5;c++){const z=EXA_H8[u][r]*EXA_H8[v][c];w.push(z);base+=z;}
      out.push({w,base});
    }
    return out;
  })();
  function exaPopcount25(x){
    x=x>>>0;x=x-((x>>>1)&0x55555555);x=(x&0x33333333)+((x>>>2)&0x33333333);
    return (((x+(x>>>4))&0x0F0F0F0F)*0x01010101)>>>24;
  }
  function exaWalshJohnsonMetrics(game=[],ctx={}){
    const g=normalize(game);if(!g)return{};
    let walshHigh=0;
    for(const md of EXA_WALSH_HI_MODES){
      let v=-md.base;for(const n of g)v+=2*md.w[n-1];walshHigh+=v*v;
    }
    const hist=ctx?.history||[];
    let j20M2=NaN;
    if(hist.length>=20){
      const mask=g.reduce((m,n)=>m|(1<<(n-1)),0)>>>0,ds=[];
      for(const d of hist.slice(-20)){
        const dm=(d.dezenas||d).reduce((m,n)=>m|(1<<(n-1)),0)>>>0;
        ds.push(15-exaPopcount25(mask&dm));
      }
      const sum=ds.reduce((a,b)=>a+b,0),ss=ds.reduce((a,b)=>a+b*b,0);
      j20M2=ss-sum*sum/20;
    }
    return{walshHigh,j20M2};
  }
  const EXA_BORDER_SET=new Set([1,2,3,4,5,6,10,11,15,16,20,21,22,23,24,25]);
  const EXA_PRIME_SET=new Set([2,3,5,7,11,13,17,19,23]);
  const EXA_CROSS_SIGS=Object.freeze({
    'EXA-CROSS-01':new Set(['5-1-4-5','1-3-10-1','0-4-9-2','5-0-5-5','2-4-9-0']),
    'EXA-CROSS-02':new Set(['5-1-2-7','4-1-2-8','1-3-8-3','5-0-3-7']),
    'EXA-CROSS-03':new Set(['8-0-2-5','7-0-2-6']),
    'EXA-CROSS-04':new Set(['2-7-5-1','6-1-3-5'])
  });
  function exaCrossSignature(game=[],a,b){const c=[0,0,0,0];for(const n of game){const x=a(n)?1:0,y=b(n)?1:0;c[x*2+y]++;}return c.join('-');}
  function exaCross4Metrics(game=[]){
    const g=normalize(game);if(!g)return{};
    const border=n=>EXA_BORDER_SET.has(n),prime=n=>EXA_PRIME_SET.has(n),parity=n=>n%2===0,low=n=>n<=13;
    return{br:exaCrossSignature(g,border,prime),bp:exaCrossSignature(g,border,parity),lr:exaCrossSignature(g,low,prime),pl:exaCrossSignature(g,parity,low)};
  }
  const EXA_FIB_SET=new Set([1,2,3,5,8,13,21]);
  const EXA_MAGIC_SET=new Set([5,6,7,12,13,14,19,20,21]);
  const EXA_M3_SET=new Set([3,6,9,12,15,18,21,24]);
  const EXA_PAIR_SIGS=Object.freeze({
    'EXA-CROSS-05':new Set(['10-0-1-4']),
    'EXA-CROSS-06':new Set(['11-2-1-1','9-0-4-2','10-0-4-1','11-3-1-0','9-0-5-1','7-6-0-2','11-1-1-2','4-6-5-0','11-3-0-1']),
    'EXA-CROSS-07':new Set(['4-6-4-1','9-0-4-2','5-6-4-0','10-0-2-3','10-2-0-3','3-6-4-2','6-6-0-3']),
    'EXA-CROSS-08':new Set(['2-7-6-0','9-1-5-0','9-1-4-1','2-5-8-0','1-6-7-1']),
    'EXA-CROSS-09':new Set(['8-2-5-0','10-0-3-2','4-5-5-1','9-0-2-4']),
    'EXA-CROSS-10':new Set(['7-6-0-2','10-4-0-1','8-6-0-1','9-0-4-2','9-1-5-0','8-0-5-2'])
  });
  function exaFourGroupPairMetrics(game=[]){
    const g=normalize(game);if(!g)return{};
    const fib=n=>EXA_FIB_SET.has(n),prime=n=>EXA_PRIME_SET.has(n),m3=n=>EXA_M3_SET.has(n),magic=n=>EXA_MAGIC_SET.has(n);
    return{fp:exaCrossSignature(g,fib,prime),fm:exaCrossSignature(g,fib,m3),fg:exaCrossSignature(g,fib,magic),pm:exaCrossSignature(g,prime,m3),pg:exaCrossSignature(g,prime,magic),mg:exaCrossSignature(g,m3,magic)};
  }
  function exaMorphSpec2Metrics(game=[]){
    const g=normalize(game);if(!g)return{};
    const mask=g.reduce((m,n)=>m|(1<<(n-1)),0)>>>0,comp=exaComponentSizes(mask).join('.');
    const deg=[0,0,0,0,0];
    for(const n of g){let d=0;for(const j of EXA_N4[n-1])if(mask&(1<<j))d++;deg[d]++;}
    let q1=0,q2a=0,q2d=0,q3=0,q4=0;
    for(let r=0;r<4;r++)for(let c=0;c<4;c++){
      const ix=[r*5+c,r*5+c+1,(r+1)*5+c,(r+1)*5+c+1],on=ix.filter(i=>mask&(1<<i)),k=on.length;
      if(k===1)q1++;else if(k===3)q3++;else if(k===4)q4++;else if(k===2){const d=Math.abs(on[0]-on[1]);if(d===1||d===5)q2a++;else q2d++;}
    }
    const runs=[0,0,0,0,0,0];
    for(let r=0;r<5;r++){let len=0;for(let c=0;c<=5;c++){const on=c<5&&!!(mask&(1<<(r*5+c)));if(on)len++;else if(len){runs[len]++;len=0;}}}
    for(let c=0;c<5;c++){let len=0;for(let r=0;r<=5;r++){const on=r<5&&!!(mask&(1<<(r*5+c)));if(on)len++;else if(len){runs[len]++;len=0;}}}
    const qv=[q1,q2a,q2d,q3,q4].join('.'),dh=deg.join('.'),rh=runs.slice(1).join('.');
    return{j1:dh+'|'+qv+'|'+rh,j2:comp+'|'+qv+'|'+rh,j5:comp+'|'+dh+'|'+qv};
  }

  function exaOrthogonalBlocks(game=[],ctx={}){
    const m=exaOrthogonalMetrics(game);if(!m)return{};const sh=exaShapeMetrics(game),tm=exaTemporalMetrics(game,ctx),wj=exaWalshJohnsonMetrics(game,ctx),cr=exaCross4Metrics(game),fg=exaFourGroupPairMetrics(game),ms2=exaMorphSpec2Metrics(game);
    const defs={
      'EXA-TOPO-01':['fgMax4',m.fgMax4,m.fgMax4<=4],
      'EXA-TOPO-02':['bgComp4',m.bgComp4,m.bgComp4>=9],
      'EXA-DEG-01':['wedges',m.wedges,m.wedges<=5],
      'EXA-DIR-01':['dirAbsDev',m.dirAbsDev,m.dirAbsDev>=8],
      'EXA-BITQ-01':['q2d',m.q2d,m.q2d>=8],
      'EXA-SYM-01':['symVar6',m.symVar6,m.symVar6<=5],
      'EXA-DIST-01':['man3',m.man3,m.man3>=30],
      'EXA-SHAPE-01':['checker',sh.checker,sh.checker>=7&&sh.q3>=10],
      'EXA-SHAPE-02':['checkerHoles',sh.checker+'|'+sh.holes,sh.checker>=9&&sh.holes>=3],
      'EXA-SHAPE-03':['edgesQ3',sh.edges+'|'+sh.q3,sh.edges>=19&&sh.q3<=2],
      'EXA-SHAPE-04':['edgesEndpoints',sh.edges+'|'+sh.endpoints,sh.edges>=20&&sh.endpoints<=1],
      'EXA-SHAPE-05':['endpointsJunctions',sh.endpoints+'|'+sh.junctions,sh.endpoints<=1&&sh.junctions>=9],
      'EXA-SHAPE-06':['endpointsQ3',sh.endpoints+'|'+sh.q3,sh.endpoints<=1&&sh.q3>=10],
      'EXA-TEMP-01':['perimD1|lineL13',(tm.perimD1??'—')+'|'+(tm.lineL13??'—'),Number.isFinite(tm.perimD1)&&tm.perimD1>=10&&tm.lineL13>=12],
      'EXA-TEMP-02':['holesD1|perimD3',(tm.holesD1??'—')+'|'+(tm.perimD3??'—'),Number.isFinite(tm.holesD1)&&tm.holesD1>=2&&tm.perimD3>=16],
      'EXA-TEMP-03':['holesD1|perimD3',(tm.holesD1??'—')+'|'+(tm.perimD3??'—'),Number.isFinite(tm.holesD1)&&tm.holesD1>=4&&tm.perimD3>=10],
      'EXA-TEMP-04':['compD1|gapL13',(tm.compD1??'—')+'|'+(tm.gapL13??'—'),Number.isFinite(tm.compD1)&&tm.compD1>=3&&tm.gapL13<=4],
      'EXA-TEMP-05':['compD7|gapL17',(tm.compD7??'—')+'|'+(tm.gapL17??'—'),Number.isFinite(tm.compD7)&&tm.compD7>=4&&tm.gapL17<=6],
      'EXA-TEMP-06':['gapL12|compD9',(tm.gapL12??'—')+'|'+(tm.compD9??'—'),Number.isFinite(tm.gapL12)&&tm.gapL12<=6&&tm.compD9>=4],
      'EXA-TEMP-07':['gapL13|compD4',(tm.gapL13??'—')+'|'+(tm.compD4??'—'),Number.isFinite(tm.gapL13)&&tm.gapL13<=6&&tm.compD4>=4],
      'EXA-TEMP-08':['colL14|gapL16',(tm.colL14??'—')+'|'+(tm.gapL16??'—'),Number.isFinite(tm.colL14)&&tm.colL14>=10&&tm.gapL16<=6],
      'EXA-WJ-01':['walshHigh|j20M2',(wj.walshHigh??'—')+'|'+(Number.isFinite(wj.j20M2)?wj.j20M2.toFixed(2):'—'),wj.walshHigh>=900&&wj.j20M2>=55],
      'EXA-CROSS-01':['moldura×primos',cr.br,EXA_CROSS_SIGS['EXA-CROSS-01'].has(cr.br)],
      'EXA-CROSS-02':['moldura×paridade',cr.bp,EXA_CROSS_SIGS['EXA-CROSS-02'].has(cr.bp)],
      'EXA-CROSS-03':['baixas×primos',cr.lr,EXA_CROSS_SIGS['EXA-CROSS-03'].has(cr.lr)],
      'EXA-CROSS-04':['paridade×baixas',cr.pl,EXA_CROSS_SIGS['EXA-CROSS-04'].has(cr.pl)],
      'EXA-CROSS-05':['fibonacci×primos',fg.fp,EXA_PAIR_SIGS['EXA-CROSS-05'].has(fg.fp)],
      'EXA-CROSS-06':['fibonacci×m3',fg.fm,EXA_PAIR_SIGS['EXA-CROSS-06'].has(fg.fm)],
      'EXA-CROSS-07':['fibonacci×magicos',fg.fg,EXA_PAIR_SIGS['EXA-CROSS-07'].has(fg.fg)],
      'EXA-CROSS-08':['primos×m3',fg.pm,EXA_PAIR_SIGS['EXA-CROSS-08'].has(fg.pm)],
      'EXA-CROSS-09':['primos×magicos',fg.pg,EXA_PAIR_SIGS['EXA-CROSS-09'].has(fg.pg)],
      'EXA-CROSS-10':['m3×magicos',fg.mg,EXA_PAIR_SIGS['EXA-CROSS-10'].has(fg.mg)],
      'EXA-MORPH2-01':['grau|bitquads|runs',ms2.j1,ms2.j1==='0.7.5.3.0|2.4.3.6.1|8.6.2.1.0'],
      'EXA-MORPH2-02':['componentes|bitquads|runs',ms2.j2,ms2.j2==='14.1|3.3.1.7.2|7.4.2.1.1'],
      'EXA-SPEC2-01':['componentes|grau|bitquads',ms2.j5,ms2.j5==='14.1|1.3.5.5.1|2.4.1.6.3']
    };
    return Object.fromEntries(Object.entries(defs).map(([key,[metric,value,blocked]])=>[key,{key,label:(EXA_ORTHOGONAL_RULES[key]||EXA_EXTENDED_RULES[key]).label,rule:(EXA_ORTHOGONAL_RULES[key]||EXA_EXTENDED_RULES[key]).rule,metric,value,blocked:!!blocked,passed:!blocked}]));
  }

  function inspect(game,ctx=buildContext()){
    const g=normalize(game);if(!g)return{valid:false,approved:false,filters:[],failed:[],warnings:[],metrics:{}};
    const set=new Set(g),lines=counts(g,row),cols=counts(g,col),qs=QUADRANTS.map(q=>countSet(g,q)),borderSectors=BORDER_SECTORS.map(q=>countSet(g,q));
    const center=countSet(g,CENTER),border=countSet(g,BORDER),run=maxRun(g),gap=maxGap(g),primes=countSet(g,PRIMES),odds=g.filter(n=>n%2).length,total=sum(g),repeated=ctx.latest?intersections(g,ctx.latest.dezenas):null;
    const top=lines[0]+lines[1],bottom=lines[3]+lines[4],left=cols[0]+cols[1],right=cols[3]+cols[4],elite=countSet(g,ELITE),couples=CANONICAL_COUPLES.filter(([a,b])=>set.has(a)&&set.has(b)).length;
    const absentRecent=ctx.latest?g.filter(n=>!ctx.prev.has(n)).length:0,persistentAbsent=countSet(g,ctx.persistentAbsent||new Set()),delayedCount=countSet(g,ctx.delayed||new Set()),floatingCount=countSet(g,ctx.floating||new Set()),cycleCount=countSet(g,ctx.cycleMissing||new Set());
    let boundaryAlerts=0;[[total,150,230],[odds,5,10],[primes,4,8],[repeated,7,12]].forEach(([v,min,max])=>{if(v!=null&&(v===min||v===max))boundaryAlerts++;});
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
    add(3,center>=4&&center<=9,`${center} no miolo · regra fixa 4–9`);
    add(4,border>=9&&border<=11,`${border} na moldura · regra fixa 9–11`);
    add(5,lines.every(Boolean)&&cols.every(Boolean),`AVISO · linhas ${lines.join('-')} · colunas ${cols.join('-')} · linha/coluna vazia não bloqueia`);
    add(6,qs.every(v=>v>=3&&v<=4),`AVISO · quadrantes ${qs.join('-')} · referência 3–4; não bloqueia`);
    add(7,run>=3&&run<=5,`Maior sequência ${run} · regra fixa 3–5`);
    add(8,gap<=6,`Maior salto ${gap} · regra fixa ≤6`);
    add(9,!([lines,cols].some(a=>a.some((v,i)=>i<4&&v===a[i+1]&&v<=1))),`AVISO · linhas ${lines.join('-')} · colunas ${cols.join('-')} · 4–4 liberado; aviso só para 0/1 adjacente`);
    add(10,Math.abs(top-bottom)<5,`Superior ${top} × inferior ${bottom} · diferença ${Math.abs(top-bottom)}`);
    add(11,Math.abs(left-right)<=5,`Esquerda ${left} × direita ${right} · diferença ${Math.abs(left-right)} · máximo 5`);
    add(12,primes>=4&&primes<=8,`${primes} primos · regra fixa 4–8`);
    add(13,odds>=5&&odds<=10,`${odds} ímpares · regra fixa 5–10`);
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
    add(28,boundaryAlerts<=2,`${boundaryAlerts} métrica(s) nos novos extremos (soma 150/230, ímpares 5/10, primos 4/8, repetidas 7/12) · máximo 2; 3+ bloqueiam`);
    add(29,!exactHistorical,exactHistorical?'Combinação exata de 15 dezenas já sorteada — bloqueada':'Combinação exata de 15 dezenas ainda não sorteada');

    // F30–F44: complementares, sempre definidos para não repetir mecanicamente F01–F29.
    add(30,repeated==null||inRange(repeated,ctx.repeatedRange),repeated==null?'Aguardando concurso anterior':`${repeated} repetidas · termômetro histórico ${ctx.repeatedRange.join('–')}`);
    add(31,ctx.persistentAbsent.size===0||inRange(persistentAbsent,ctx.persistentAbsentRange),`${persistentAbsent} ausentes persistentes de 2 concursos · faixa ${ctx.persistentAbsentRange.join('–')}`);
    add(32,inRange(avgDelay,ctx.avgDelayRange),`Atraso médio ${avgDelay.toFixed(2)} · faixa ${ctx.avgDelayRange.map(v=>Number(v).toFixed(2)).join('–')}`);
    add(33,ctx.latest==null||inRange(endingDelta,ctx.endingDeltaRange),ctx.latest==null?'Aguardando histórico':`Distância do perfil de finais ${endingDelta} · faixa ${ctx.endingDeltaRange.join('–')}`);
    add(34,inRange(opposedBands,ctx.opposedRange),`Faixas opostas agregadas: ${opposedBands} · faixa ${ctx.opposedRange.join('–')}`);
    add(35,ctx.cycleMissing.size===0||inRange(cycleCount,ctx.cycleRange),`${cycleCount}/${ctx.cycleMissing.size} dezenas pendentes no ciclo · faixa ${ctx.cycleRange.join('–')}`);
    const anomalyFails=checks.filter(f=>f.id>=30&&f.id<=35&&!f.passed).length;
    add(36,anomalyFails<=2,`${anomalyFails} anomalia(s) simultânea(s) entre F30–F35 · máximo 2`);
    add(37,!has14&&!exactHistorical,exactHistorical?'Similaridade 15/15':has14?`Similaridade 14/15 nos últimos 500 · concurso ${histContest}`:'Nenhuma coincidência de 14/15 nos últimos 500 concursos');
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

    const hardFailed=checks.filter(f=>MANDATORY_BLOCKS.has(f.id)&&!f.passed),warnings=checks.filter(f=>!MANDATORY_BLOCKS.has(f.id)&&f.id!==23&&!['experimental','operational'].includes(f.mode)&&!f.passed),patternCooldown=exactPatternCooldown(lines,ctx.history||[]),colorRule=mandatoryColorRule(g),lineRepeat=lineRepeatRule(g,ctx.latest),columnRepeat=columnRepeatRule(g,ctx.latest),lineColumnRepeat=lineColumnRepeatRule(g,ctx.latest),exaBlocks=exaOrthogonalBlocks(g,ctx);
    return {valid:true,approved:hardFailed.length===0&&!patternCooldown.blocked&&!colorRule.blocked&&!lineRepeat.blocked&&!columnRepeat.blocked&&!lineColumnRepeat.blocked,filters:checks,failed:hardFailed.map(f=>f.id),warnings:warnings.map(f=>f.id),patternCooldown,colorRule,lineRepeat,columnRepeat,lineColumnRepeat,exaBlocks,metrics:{lines,cols,qs,borderSectors,center,border,run,gap,primes,odds,total,repeated,elite,couples,absentRecent,persistentAbsent,delayedCount,floatingCount,cycleCount,opposedBands,hotCount,coldCount,avgDelay,endingDelta,ds,fib,m3,m5,maxHistorical:historicalCeiling,radial,adjacency,colors:colorRule.distinct,colorCounts:colorRule.counts,centroid:cm},calibrated:ctx.calibrated};
  }
  function histoSafe(x){return Number.isFinite(x)?x:0;}

  function externalRuleActive(policies={},key){
    if(policies?.[key]===true)return true;
    if(policies?.[key]===false)return false;
    if(['PADRAO','CORES','LINHA','COLUNA','LXC'].includes(String(key)))return false;
    const rule=EXA_ORTHOGONAL_RULES[key]||EXA_EXTENDED_RULES[key];
    return rule?rule.enabledByDefault===true:false;
  }
  function externalRuleBlocks(report,policies={}){
    return (externalRuleActive(policies,'PADRAO')&&report?.patternCooldown?.blocked)||
      (externalRuleActive(policies,'CORES')&&report?.colorRule?.blocked)||
      (externalRuleActive(policies,'LINHA')&&report?.lineRepeat?.blocked)||
      (externalRuleActive(policies,'COLUNA')&&report?.columnRepeat?.blocked)||
      (externalRuleActive(policies,'LXC')&&report?.lineColumnRepeat?.blocked)||Object.entries(report?.exaBlocks||{}).some(([key,row])=>externalRuleActive(policies,key)&&row?.blocked);
  }
  function policyAllows(report,policies={},externalPolicies={}){
    if(report?.valid===false||externalRuleBlocks(report,externalPolicies))return false;
    return report.filters.every(f=>{
      const explicit=policies[f.id];const policy=Number(f.id)===29?'block':(explicit||(f.id===23?'ignore':(f.mode==='core'||f.mode==='advisory')?'warn':'ignore'));
      return policy!=='block'||f.passed;
    });
  }
  function randomAllowedGame(excluded=[]){const blocked=new Set((excluded||[]).map(Number)),a=ALL.filter(n=>!blocked.has(n));if(a.length<15)return null;for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,15).sort((x,y)=>x-y);}
  function generate(ctx,quantity=1,maxAttempts=300000,options={}){const target=Math.max(1,Math.min(20,Number(quantity)||1)),out=[],seen=new Set(),excluded=options.excluded||[],policies=options.policies||{},externalPolicies=options.externalPolicies||{};let tested=0;while(out.length<target&&tested<maxAttempts){const g=randomAllowedGame(excluded);if(!g)break;const k=keyOf(g);tested++;if(seen.has(k))continue;seen.add(k);const r=inspect(g,ctx);if(policyAllows(r,policies,externalPolicies))out.push(g);}return{games:out,tested,complete:out.length===target};}

  function rangeCentral(value,range){if(!Number.isFinite(value)||!range)return 0;const mid=(range[0]+range[1])/2,half=Math.max(.5,(range[1]-range[0])/2);return Math.max(-1,1-Math.abs(value-mid)/half);}
  function candidateScoreFromReport(r,ctx,policies={},externalPolicies={}){if(!r?.valid||externalRuleBlocks(r,externalPolicies))return-Infinity;const policy=f=>Number(f.id)===29?'block':(policies[f.id]||(f.id===23?'ignore':(f.mode==='core'||f.mode==='advisory')?'warn':'ignore'));const blocked=r.filters.filter(f=>policy(f)==='block'&&!f.passed).length;if(blocked)return-Infinity;const warns=r.filters.filter(f=>policy(f)==='warn'&&!f.passed).length,m=r.metrics;let score=70-warns*1.25;score+=rangeCentral(m.total,ctx.sumRange)*5;score+=rangeCentral(m.odds,ctx.oddRange)*4;score+=rangeCentral(m.primes,ctx.primeRange)*3;if(m.repeated!=null)score+=rangeCentral(m.repeated,ctx.repeatedRange)*4;score+=Math.max(-2,3-Math.abs(m.center-6));score+=Math.max(-2,2-variance(m.lines));score+=Math.max(-2,2-variance(m.cols));score+=Math.max(-2,2-variance(m.qs));if(m.maxHistorical>=14)score-=12;else if(m.maxHistorical===13)score-=2;return +score.toFixed(6);}
  function candidateScore(game,ctx,policies={},externalPolicies={}){return candidateScoreFromReport(inspect(game,ctx),ctx,policies,externalPolicies);}
  function nCk(n,k){if(k<0||k>n)return 0;k=Math.min(k,n-k);let r=1;for(let i=1;i<=k;i++)r=r*(n-k+i)/i;return Math.round(r);}
  function unrank(pool,k,rank){const out=[];let start=0,r=Math.max(0,Math.floor(rank));for(let need=k;need>0;need--){for(let i=start;i<=pool.length-need;i++){const c=nCk(pool.length-i-1,need-1);if(r<c){out.push(pool[i]);start=i+1;break;}r-=c;}}return out;}
  function deterministicBest(ctx,policies={},options={}){
    const blocked=new Set((options.excluded||[]).map(Number)),pool=ALL.filter(n=>!blocked.has(n));if(pool.length<15)return{game:null,score:-Infinity,tested:0,total:0,approvedCount:0,rankIndex:0};
    const total=nCk(pool.length,15),sample=Math.max(100,Math.min(total,Number(options.sampleSize)||12000)),rankIndex=Math.max(0,Math.floor(Number(options.rankIndex)||0)),approved=[];let tested=0;
    for(let i=0;i<sample;i++){
      const rank=sample===1?0:Math.floor(i*(total-1)/(sample-1)),g=unrank(pool,15,rank),s=candidateScore(g,ctx,policies,options.externalPolicies||{});tested++;
      if(Number.isFinite(s))approved.push({game:g,score:s});
    }
    approved.sort((a,b)=>b.score-a.score||keyOf(a.game).localeCompare(keyOf(b.game)));
    const picked=approved[rankIndex]||null;
    return{game:picked?.game||null,score:picked?.score??-Infinity,tested,total,sample,approvedCount:approved.length,rankIndex};
  }
  function portfolioScore(games){const norm=games.map(normalize).filter(Boolean);if(norm.length<2)return{score:100,meanOverlap:0,maxOverlap:0};const overlaps=[];for(let i=0;i<norm.length;i++)for(let j=i+1;j<norm.length;j++)overlaps.push(intersections(norm[i],norm[j]));const mo=mean(overlaps),mx=Math.max(...overlaps);return{score:Math.max(0,Math.round(100-(mo-7)*12-(mx-10)*5)),meanOverlap:+mo.toFixed(2),maxOverlap:mx};}

  window.LFMatrix51={SCHEMA_VERSION,THRESHOLD_VERSION,AUDIT_VERSION,AUDIT_BASE_THROUGH,PATTERN_COOLDOWNS,THRESHOLDS,FILTERS,FULL_COLOR_TRIPLES,EXA_ORTHOGONAL_RULES,EXA_EXTENDED_RULES,EXA_ORTHOGONAL_SUMMARY,buildContext,inspect,exaOrthogonalMetrics,exaOrthogonalBlocks,generate,portfolioScore,normalize,keyOf,maxHistoricalHits,mandatoryColorRule,buildFullColorDelayModel,fullColorDelayBonus,exactPatternCooldown,externalRuleBlocks,policyAllows,candidateScore,candidateScoreFromReport,deterministicBest,nCk,unrank};
})();

self.window=self;
const M=self.LFMatrix51;
const ALL=Array.from({length:25},(_,i)=>i+1);
const MANDATORY_BLOCKS=new Set([29]);
function resolvedPolicy(f,policies={}){return Number(f.id)===29?'block':(policies[f.id]||(f.id===23?'ignore':(f.mode==='core'||f.mode==='advisory')?'warn':'ignore'));}
const keyOf=g=>g.map(n=>String(n).padStart(2,'0')).join('-');
function externalActive(policies={},key){if(policies?.[key]===true)return true;if(policies?.[key]===false)return false;if(['PADRAO','CORES','LINHA','COLUNA','LXC'].includes(String(key)))return false;const rule=M.EXA_ORTHOGONAL_RULES?.[key]||M.EXA_EXTENDED_RULES?.[key];return rule?rule.enabledByDefault===true:false;}
function blockedFailures(report,policies,externalPolicies={}){const out=report.filters.filter(f=>resolvedPolicy(f,policies)==='block'&&!f.passed);if(externalActive(externalPolicies,'PADRAO')&&report?.patternCooldown?.blocked)out.push({id:'PADRAO',name:'Carência de padrão exato'});if(externalActive(externalPolicies,'CORES')&&report?.colorRule?.blocked)out.push({id:'CORES',name:'Regra obrigatória de cores do indicado'});if(externalActive(externalPolicies,'LINHA')&&report?.lineRepeat?.blocked)out.push({id:'LINHA',name:'Distribuição de linhas igual ao concurso anterior'});if(externalActive(externalPolicies,'COLUNA')&&report?.columnRepeat?.blocked)out.push({id:'COLUNA',name:'Distribuição de colunas igual ao concurso anterior'});if(externalActive(externalPolicies,'LXC')&&report?.lineColumnRepeat?.blocked)out.push({id:'L×C',name:'Linha × Coluna igual ao concurso anterior'});for(const [key,row] of Object.entries(report?.exaBlocks||{}))if(externalActive(externalPolicies,key)&&row?.blocked)out.push({id:key,name:row.label||key});return out;}
function warnings(report,policies){return report.filters.filter(f=>resolvedPolicy(f,policies)==='warn'&&!f.passed);}
function indicatedColorValid(game,externalPolicies={}){return externalActive(externalPolicies,'CORES')?!!M.mandatoryColorRule(game)?.passed:true;}
function colorRuleValid(game,externalPolicies={}){const r=M.mandatoryColorRule(game);return externalActive(externalPolicies,'CORES')?!!r?.passed:true;}
function colorFeasible(excluded,externalPolicies={}){if(!externalActive(externalPolicies,'CORES'))return true;const block=new Set(excluded||[]),pool=ALL.filter(n=>!block.has(n));if(pool.length<15)return false;for(let t=0;t<800;t++){const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}if(colorRuleValid(a.slice(0,15),externalPolicies))return true;}return false;}
function randomColorCandidate(excluded,externalPolicies={}){const block=new Set(excluded||[]),pool=ALL.filter(n=>!block.has(n));if(pool.length<15)return null;for(let t=0;t<400;t++){const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}const g=a.slice(0,15).sort((x,y)=>x-y);if(colorRuleValid(g,externalPolicies))return g;}return null;}
function randomCandidate(excluded,colorBalanced,externalPolicies={}){const block=new Set(excluded||[]),pool=ALL.filter(n=>!block.has(n));if(pool.length<15)return null;if(colorBalanced)return randomColorCandidate(excluded,externalPolicies);for(let t=0;t<160;t++){const a=[...pool];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}const g=a.slice(0,15).sort((x,y)=>x-y);if(indicatedColorValid(g,externalPolicies))return g;}return null;}
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
function deterministicBestFromPool(ctx,policies,games,rankingConfig=null,externalPolicies={}){let best=null,bestScore=-Infinity,bestRank=-Infinity,bestMeta=null;const virginMode=rankingConfig?.mode==='virgin',vc=virginMode?buildVirginRankContext(ctx.history||[],rankingConfig?.previousVirginGames||[]):null;for(const g of games){if(!indicatedColorValid(g,externalPolicies))continue;const s=M.candidateScore(g,ctx,policies,externalPolicies);if(!Number.isFinite(s))continue;const meta=virginMode?virginRankMetrics(g,s,vc,rankingConfig?.profile||'strong'):null,rank=meta?.rankScore??s;if(rank>bestRank||(rank===bestRank&&best&&keyOf(g)<keyOf(best))){best=g;bestScore=s;bestRank=rank;bestMeta=meta;}}return{game:best,score:bestScore,rankScore:bestRank,virginMeta:bestMeta};}
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
// A mesma avaliação do NOVO INDICADO, aplicada às escolhas independentes por cores.
// Uma única varredura atende as cinco trincas; a seleção manual limita o universo.
function colorRelaxSet(raw,color){return new Set((raw?.[color]||raw?.[String(color)]||[]).map(String));}
function colorPoliciesFor(base,relax){const out={...(base||{})};for(const key of relax||[]){const m=/^F(\d{1,2})$/.exec(String(key));if(m){const id=Number(m[1]);if(id!==29)out[id]='warn';}}out[29]='block';return out;}
function colorBlockerEntry(raw){
  const id=raw?.id,key=Number.isFinite(Number(id))?`F${String(Number(id)).padStart(2,'0')}`:String(id||'ESTRUTURAL');
  const names={PADRAO:'Carência de padrão exato',CORES:'Regra estrutural de cores',LINHA:'Linha igual ao concurso anterior',COLUNA:'Coluna igual ao concurso anterior','L×C':'Linha × Coluna igual ao anterior',INDICADORES:'Metas dos indicadores',PERFIL_PRO:'Perfil PRO',ESTRUTURAL:'Regra estrutural do motor'};
  return{key,name:raw?.name||names[key]||key,removable:key!=='F29'&&(/^F\d{2}$/.test(key)||key==='INDICADORES'||key==='PERFIL_PRO')};
}
// A mesma avaliação do NOVO INDICADO, aplicada às escolhas independentes por cores.
// A busca dos 5 jogos preserva as cores já aprovadas no app e pode recalcular apenas as faltantes.
// Para cada cor sem resultado, o Worker identifica bloqueios e quais, isoladamente, destravam ao menos um candidato.
function runColorRank(d){
  const ctx=M.buildContext(d.history||[],{window:d.period||10}),policies=d.policies||{},externalPolicies=d.externalPolicies||{},quota=d.indicatorQuotas||null,profile=d.proProfile||null;
  const fixed=[...new Set((d.selected||[]).map(Number))].filter(n=>Number.isInteger(n)&&n>=1&&n<=25).sort((a,b)=>a-b);
  const singleRandom=d.mode==='single-random',five=d.mode==='five'||d.mode==='five-terminal'||singleRandom,terminalByColor=!!d.terminalByColor||d.mode==='five-terminal',pool=ALL.filter(n=>!fixed.includes(n)),choose=15-fixed.length;
  const targetColors=five?new Set(((d.targetColors||[]).length?d.targetColors:[1,2,3,4,5]).map(Number).filter(c=>c>=1&&c<=5)):null;
  const lastComplete=singleRandom?[...(d.history||[])].sort((a,b)=>Number(b.concurso)-Number(a.concurso)).find(draw=>[1,2,3,4,5].some(c=>[c,c+10,c+20].every(n=>(draw.dezenas||[]).includes(n)))):null;
  const lastCompleteColors=lastComplete?[1,2,3,4,5].filter(c=>[c,c+10,c+20].every(n=>lastComplete.dezenas.includes(n))):[];
  const pattern=game=>{const counts=Array(10).fill(0);for(const n of game||[])counts[n%10]++;return counts.sort((a,b)=>b-a).join('-');};
  const blockedPattern=lastComplete?pattern(lastComplete.dezenas):null;
  if(singleRandom)for(const color of lastCompleteColors)targetColors.delete(color);
  if(choose<0||choose>pool.length){postMessage({type:'color-rank-done',mode:d.mode,rows:[],game:null,tested:0,total:0});return;}
  const best=Object.fromEntries([1,2,3,4,5].map(c=>[c,null])),approvedPerColor={1:0,2:0,3:0,4:0,5:0};let single=null,tested=0,eligible=0;
  const diagnostics=Object.fromEntries([1,2,3,4,5].map(c=>[c,{candidates:0,counts:{},names:{},removable:{},unlock:{}}]));
  const virginMode=d.rankingMode==='virgin',virginCtx=virginMode?buildVirginRankContext(ctx.history,d.previousVirginGames||[]):null;
  const colorModel=M.buildFullColorDelayModel(ctx.history);

  const evaluateGame=(game,targetHint=0)=>{
    tested++;
    const colors=M.mandatoryColorRule(game);
    if(externalPolicies.CORES===false||colors?.passed){
      let target=0,completeCount=0;
      if(five){for(let c=1;c<=5;c++)if(game.includes(c)&&game.includes(c+10)&&game.includes(c+20)){target=c;completeCount++;}}
      if(completeCount!==1)target=0;
      if(!five||target){
        if(five&&!targetColors.has(target))return;
        if(five&&targetHint&&target!==targetHint)return;
        if(five&&terminalByColor&&Math.max(...game)!==20+target)return;
        const report=M.inspect(game,ctx),relax=five?colorRelaxSet(d.relaxByColor||{},target):new Set(),colorPolicies=five?colorPoliciesFor(policies,relax):policies;
        const score=M.candidateScoreFromReport(report,ctx,colorPolicies,externalPolicies),quotaOk=relax.has('INDICADORES')||quotaAllows(game,quota),proOk=relax.has('PERFIL_PRO')||proProfileAllows(game,report,profile);
        if(five){
          const dg=diagnostics[target];dg.candidates++;
          let blockers=blockedFailures(report,colorPolicies,externalPolicies).map(colorBlockerEntry);
          if(!quotaOk)blockers.push(colorBlockerEntry({id:'INDICADORES'}));
          if(!proOk)blockers.push(colorBlockerEntry({id:'PERFIL_PRO'}));
          if(!Number.isFinite(score)&&!blockers.length)blockers.push(colorBlockerEntry({id:'ESTRUTURAL'}));
          for(const b of blockers){dg.counts[b.key]=(dg.counts[b.key]||0)+1;dg.names[b.key]=b.name;dg.removable[b.key]=b.removable;}
          if(blockers.length===1&&blockers[0].removable){
            const b=blockers[0];let unlocked=false;
            if(/^F\d{2}$/.test(b.key)){
              const tmp=new Set(relax);tmp.add(b.key);const tmpPolicies=colorPoliciesFor(policies,tmp);unlocked=Number.isFinite(M.candidateScoreFromReport(report,ctx,tmpPolicies,externalPolicies))&&quotaOk&&proOk;
            }else if(b.key==='INDICADORES')unlocked=Number.isFinite(score)&&proOk;
            else if(b.key==='PERFIL_PRO')unlocked=Number.isFinite(score)&&quotaOk;
            if(unlocked)dg.unlock[b.key]=(dg.unlock[b.key]||0)+1;
          }
        }
        if(Number.isFinite(score)&&quotaOk&&proOk){
          eligible++;const bonus=M.fullColorDelayBonus(game,colorModel).bonus;
          const rankScore=(virginMode?virginRankMetrics(game,score,virginCtx,d.virginProfile||'strong').rankScore:score)+bonus;
          const previous=five?best[target]:single;
          if(singleRandom)approvedPerColor[target]++;
          if(singleRandom?Math.random()<1/approvedPerColor[target]:!previous||rankScore>previous.rankScore||(rankScore===previous.rankScore&&keyOf(game)<keyOf(previous.game))){
            const entry={game,score,bonus,rankScore,rankingMode:virginMode?'virgin':'standard',relaxed:[...relax]};if(five)best[target]=entry;else single=entry;
          }
        }
      }
    }
  };

  // Os 5 jogos por cores são uma geração aleatória dirigida: a trinca da cor já nasce forçada
  // e o Worker amostra somente candidatos compatíveis. Mantém Matriz 51, indicadores, Perfil PRO
  // e F29/F28/F36/F37 conforme as políticas atuais, sem varrer 3.268.760 jogos a cada clique.
  let total=0,plans=[],searchMode=five?'targeted-random':'exhaustive';
  if(five){
    const attemptsPerColor=Math.max(5000,Math.min(60000,Number(d.colorAttemptsPerColor)||20000));
    for(const color of [...targetColors].sort((a,b)=>a-b)){
      const terminal=terminalByColor?20+color:25,required=[color,color+10,color+20],forced=[...new Set([...fixed,...required])].sort((a,b)=>a-b);
      const invalid=forced.some(n=>n>terminal)||forced.length>15;
      const localPool=invalid?[]:ALL.filter(n=>n<=terminal&&!forced.includes(n)),localChoose=15-forced.length,viable=!invalid&&localChoose>=0&&localChoose<=localPool.length;
      const localTotal=viable?attemptsPerColor:0;
      plans.push({color,forced,pool:localPool,choose:localChoose,total:localTotal});total+=localTotal;
    }
  }else total=M.nCk(pool.length,choose);
  const progressEvery=Math.max(500,Math.floor(Math.max(1,total)/100));
  postMessage({type:'color-rank-progress',tested:0,total,eligible,optimized:five,searchMode});
  const maybeProgress=()=>{if(tested%progressEvery===0||tested===total)postMessage({type:'color-rank-progress',tested,total,eligible,optimized:five,searchMode});};

  if(five){
    for(const plan of plans){
      if(!plan.total)continue;
      for(let attempt=0;attempt<plan.total;attempt++){
        const shuffled=[...plan.pool];
        for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]];}
        const game=[...plan.forced,...shuffled.slice(0,plan.choose)].sort((a,b)=>a-b);
        evaluateGame(game,plan.color);maybeProgress();
      }
    }
  }else{
    eachComb(pool,choose,remaining=>{const game=[...fixed,...remaining].sort((a,b)=>a-b);evaluateGame(game,0);maybeProgress();});
  }
  if(total===0||tested!==total)postMessage({type:'color-rank-progress',tested,total,eligible,optimized:five,searchMode});
  const diagFor=color=>{const d0=diagnostics[color],mk=(key,count)=>({key,name:d0.names[key]||key,count,removable:!!d0.removable[key]});const unlockers=Object.entries(d0.unlock).map(([k,v])=>mk(k,v)).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));const topBlockers=Object.entries(d0.counts).map(([k,v])=>mk(k,v)).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key)).slice(0,8);return{candidates:d0.candidates,unlockers,topBlockers};};
  const rows=(five?[...targetColors]:[1,2,3,4,5]).sort((a,b)=>a-b).map(color=>({color,...best[color],diagnostics:diagFor(color)}));
  postMessage({type:'color-rank-done',mode:d.mode,rows,game:single,tested,total,eligible,targetColors:[...(targetColors||[])],lastComplete:lastComplete?{concurso:lastComplete.concurso,data:lastComplete.data,colors:lastCompleteColors,pattern:blockedPattern}:null,optimized:five,searchMode});
}
function exhaustiveBest(ctx,policies,excluded=[],rankIndex=0,topLimit=200,progressInfo=null,quotaSpec=null,proProfile=null,rankingConfig=null,boundary=null,fixedNumbers=[],relaxations=[],externalPolicies={}){
  const block=new Set((excluded||[]).map(Number)),start=Number(boundary?.start)||null,end=Number(boundary?.end)||null;
  const invalidBoundary=(start!=null&&(start<1||start>11))||(end!=null&&(end<15||end>25))||(start!=null&&end!=null&&end-start+1<15);
  const fixed=[...new Set((fixedNumbers||[]).map(Number).filter(n=>Number.isInteger(n)&&n>=1&&n<=25))],forced=[...new Set([...fixed,...[start,end].filter(Number.isFinite)])];
  if(invalidBoundary||fixed.length>15||fixed.some(n=>block.has(n))||forced.some(n=>(start!=null&&n<start)||(end!=null&&n>end))||forced.some(n=>block.has(n)))return{game:null,score:-Infinity,tested:0,total:0,approvedCount:0,eligibleCount:0,rankIndex,topGames:[],topScores:[],diagnostics:{boundaryRejected:true,start,end,fixed,reason:invalidBoundary?'Faixa início/fim impossível':fixed.length>15?'Mais de 15 dezenas fixas':fixed.some(n=>block.has(n))?'Dezena fixa também bloqueada':forced.some(n=>(start!=null&&n<start)||(end!=null&&n>end))?'Dezena fixa fora da faixa':'Dezena inicial/final bloqueada'}};
  const pool=ALL.filter(n=>!block.has(n)&&(start==null||n>=start)&&(end==null||n<=end)&&!forced.includes(n)),choose=15-forced.length;
  if(choose<0||pool.length<choose)return{game:null,score:-Infinity,tested:0,total:0,approvedCount:0,eligibleCount:0,rankIndex,topGames:[],topScores:[],diagnostics:{boundaryRejected:true,start,end,reason:'Faixa/exclusões não permitem formar 15 dezenas'}};
  const total=M.nCk(pool.length,choose),limit=Math.max(rankIndex+1,Math.min(1000,Number(topLimit)||200)),top=[],virginMode=rankingConfig?.mode==='virgin',virginProfile=rankingConfig?.profile||'strong',virginCtx=virginMode?buildVirginRankContext(ctx.history||[],rankingConfig?.previousVirginGames||[]):null,colorDelayModel=M.buildFullColorDelayModel?M.buildFullColorDelayModel(ctx.history||[]):[],pareto=[],relax=new Set((relaxations||[]).map(String));let tested=0,approvedCount=0,eligibleCount=0,lastProgress=0,maskSum=0,maskXor=0,firstMask=null,lastMask=null,virginScoreSum=0,virginScoreCount=0,virginN13Sum=0,virginN12Sum=0,virginNeighborSum=0,virginLastSum=0,approvedHitDist=Object.fromEntries(Array.from({length:16},(_,i)=>[i,0])),virginHistogram=Array(101).fill(0);
  const diag={colorPreRejected:0,patternRejected:0,colorRuleRejected:0,lineRepeatRejected:0,columnRepeatRejected:0,lineColumnRejected:0,quotaRejected:0,proProfileRejected:0,boundary:{start,end,forced:[...forced],universe:total},filterFirst:{},filterAny:{},blockerCounts:{},blockerNames:{},blockerRemovable:{},unlock:{},unlockPairs:{}};
  const progressEvery=Math.max(100,Math.min(500,Math.floor(total/1000)));if(!progressInfo)postMessage({type:'progress',tested:0,total,maxAttempts:total,found:0,approvedCount:0,eligibleCount:0,mode:'Busca exaustiva iniciada · preparando varredura integral'});
  eachComb(pool,choose,gref=>{const g=[...forced,...gref].sort((a,b)=>a-b);tested++;let mask=0;for(const n of g)mask|=1<<(n-1);maskSum+=mask;maskXor^=mask;if(firstMask===null)firstMask=mask;lastMask=mask;
    if(!indicatedColorValid(g,externalPolicies)){diag.colorPreRejected++;}
    else{
      const report=M.inspect(g,ctx),virginHardFail=virginMode&&report?.filters?.some(f=>Number(f.id)===29&&!f.passed),score=virginHardFail?-Infinity:(M.candidateScoreFromReport?M.candidateScoreFromReport(report,ctx,policies,externalPolicies):M.candidateScore(g,ctx,policies,externalPolicies));
      const quotaOk=relax.has('INDICADORES')||quotaAllows(g,quotaSpec),proOk=relax.has('PERFIL_PRO')||proProfileAllows(g,report,proProfile);
      let blockers=blockedFailures(report,policies,externalPolicies).map(colorBlockerEntry);
      if(!quotaOk)blockers.push(colorBlockerEntry({id:'INDICADORES'}));
      if(!proOk)blockers.push(colorBlockerEntry({id:'PERFIL_PRO'}));
      if(!Number.isFinite(score)&&!blockers.length)blockers.push(colorBlockerEntry({id:'ESTRUTURAL'}));
      for(const b of blockers){diag.blockerCounts[b.key]=(diag.blockerCounts[b.key]||0)+1;diag.blockerNames[b.key]=b.name;diag.blockerRemovable[b.key]=b.removable;}
      if(blockers.length===1&&blockers[0].removable){const b=blockers[0];let unlocked=false;if(/^F\d{2}$/.test(b.key)){const tmpPolicies=colorPoliciesFor(policies,new Set([b.key]));unlocked=Number.isFinite(M.candidateScoreFromReport(report,ctx,tmpPolicies,externalPolicies))&&quotaOk&&proOk;}else if(b.key==='INDICADORES')unlocked=Number.isFinite(score)&&proOk;else if(b.key==='PERFIL_PRO')unlocked=Number.isFinite(score)&&quotaOk;if(unlocked)diag.unlock[b.key]=(diag.unlock[b.key]||0)+1;}
      if(blockers.length===2&&blockers.every(b=>b.removable&&b.key!=='F29')){const keys=blockers.map(b=>String(b.key)).sort();const pairKey=keys.join('+');diag.unlockPairs[pairKey]=(diag.unlockPairs[pairKey]||0)+1;}
      if(!Number.isFinite(score)){
        if(report?.patternCooldown?.blocked)diag.patternRejected++;
        if(report?.colorRule?.blocked)diag.colorRuleRejected++;if(report?.lineRepeat?.blocked)diag.lineRepeatRejected++;if(report?.columnRepeat?.blocked)diag.columnRepeatRejected++;if(report?.lineColumnRepeat?.blocked)diag.lineColumnRejected++;
        const blocked=report?.filters?.filter(f=>resolvedPolicy(f,policies)==='block'&&!f.passed)||[];
        for(const f of blocked)diag.filterAny[f.id]=(diag.filterAny[f.id]||0)+1;
        if(blocked.length)diag.filterFirst[blocked[0].id]=(diag.filterFirst[blocked[0].id]||0)+1;
      }else{
        approvedCount++;if(progressInfo?.targetDraw)approvedHitDist[hits(g,progressInfo.targetDraw)]++;
        if(quotaOk&&proOk){eligibleCount++;const colorDelay=M.fullColorDelayBonus?M.fullColorDelayBonus(g,colorDelayModel):{bonus:0,matches:[]};if(virginMode){const virginMeta=virginRankMetrics(g,score,virginCtx,virginProfile),rankScore=Number(virginMeta.rankScore)+Number(colorDelay.bonus||0),meta={...virginMeta,colorDelayBonus:Number(colorDelay.bonus||0),colorDelayMatches:colorDelay.matches||[]},entry={game:g,score,rankScore,virginMeta:meta};virginScoreSum+=virginMeta.virginScore;virginN13Sum+=virginMeta.n13;virginN12Sum+=virginMeta.n12;virginNeighborSum+=virginMeta.top10Avg;virginLastSum+=virginMeta.lastOverlap;virginScoreCount++;virginHistogram[Math.max(0,Math.min(100,Math.round(virginMeta.virginScore)))]++;insertExhaustiveTop(top,entry,limit);paretoUpdate(pareto,entry);}else insertExhaustiveTop(top,{game:g,score,rankScore:Number(score)+Number(colorDelay.bonus||0),colorDelayMeta:{colorDelayBonus:Number(colorDelay.bonus||0),colorDelayMatches:colorDelay.matches||[]}},limit);}else{if(!quotaOk)diag.quotaRejected++;if(!proOk)diag.proProfileRejected++;}
      }
    }
    if(tested-lastProgress>=progressEvery||tested===total){lastProgress=tested;const provisional=top[Math.min(rankIndex,Math.max(0,top.length-1))]||top[0]||null;if(progressInfo?.type==='backtest'){const grandTested=(progressInfo.current-1)*total+tested,grandTotal=progressInfo.targets*total;postMessage({type:'backtest-integral-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,grandTested,grandTotal,approvedCount,eligibleCount});}else if(progressInfo?.type==='combined-integral')postMessage({type:'combined-integral-combo-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,approvedCount,eligibleCount});else postMessage({type:'progress',tested,total,maxAttempts:total,found:eligibleCount,approvedCount,eligibleCount,provisionalGame:provisional?.game||null,provisionalScore:provisional?.score??null,mode:'Busca exaustiva integral · 51 filtros · F29 absoluto · F28/F36/F37 conforme Perfil PRO'});}});
  const picked=top[rankIndex]||null,paretoTop=pareto.sort(exhaustiveCompare).slice(0,10);let percentile=null;if(virginMode&&picked?.virginMeta&&virginScoreCount){let le=0;for(let i=0;i<=Math.round(picked.virginMeta.virginScore);i++)le+=virginHistogram[i];percentile=Math.round(le/virginScoreCount*100);}
  const metaPercentile=m=>{if(!m||!virginScoreCount)return null;let le=0;for(let i=0;i<=Math.round(m.virginScore);i++)le+=virginHistogram[i];return Math.round(le/virginScoreCount*100);};if(virginMode){for(const e of top)if(e.virginMeta)e.virginMeta.percentile=metaPercentile(e.virginMeta);for(const e of pareto)if(e.virginMeta)e.virginMeta.percentile=metaPercentile(e.virginMeta);}const diverseTop=virginMode?diverseVirginTop(top,10):[],virginStats=virginMode?{profile:virginProfile,meanScore:virginScoreCount?+(virginScoreSum/virginScoreCount).toFixed(2):null,percentile,eligibleScored:virginScoreCount,paretoCount:pareto.length,diverseTopCount:diverseTop.length,portfolio:diverseTop.length>1?M.portfolioScore(diverseTop.map(x=>x.game)):null,coverage:virginPortfolioCoverage(diverseTop),expected:{n13:virginScoreCount?+(virginN13Sum/virginScoreCount).toFixed(2):null,n12:virginScoreCount?+(virginN12Sum/virginScoreCount).toFixed(2):null,top10Avg:virginScoreCount?+(virginNeighborSum/virginScoreCount).toFixed(2):null,lastOverlap:virginScoreCount?+(virginLastSum/virginScoreCount).toFixed(2):null}}:null;
  const fullUniverse=block.size===0&&forced.length===0&&start==null&&end==null,expectedSum=fullUniverse?M.nCk(24,14)*((1<<25)-1):null,audit={version:1,verified:tested===total&&(!fullUniverse||(total===3268760&&maskSum===expectedSum&&maskXor===0)),fullUniverse,tested,total,maskSum,expectedSum,maskXor,firstMask,lastMask};
  const diagMk=(key,count)=>({key,name:diag.blockerNames[key]||key,count,removable:!!diag.blockerRemovable[key]});const unlockers=Object.entries(diag.unlock).map(([k,v])=>diagMk(k,v)).filter(x=>x.key!=='F29'&&x.removable&&x.count>0).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key));const pairUnlockers=Object.entries(diag.unlockPairs||{}).map(([pairKey,count])=>{const keys=pairKey.split('+').filter(Boolean);return{pairKey,keys,count:Number(count||0),names:keys.map(k=>diag.blockerNames[k]||k)};}).filter(x=>x.keys.length===2&&!x.keys.includes('F29')&&x.count>0).sort((a,b)=>b.count-a.count||a.pairKey.localeCompare(b.pairKey)).slice(0,12);const topBlockers=Object.entries(diag.blockerCounts).map(([k,v])=>diagMk(k,v)).sort((a,b)=>b.count-a.count||a.key.localeCompare(b.key)).slice(0,12);const diagnostics={...diag,unlockers,pairUnlockers,topBlockers,audit,tested,total,approvedCount,eligibleCount,colorDelayModel,generatedAt:new Date().toISOString(),virginStats};
  return{audit,game:picked?.game||null,score:picked?.score??-Infinity,rankScore:picked?.rankScore??picked?.score??-Infinity,tested,total,approvedCount,eligibleCount,rankIndex,topGames:top.map(x=>x.game),topScores:top.map(x=>x.score),topMeta:top.map(x=>x.virginMeta||x.colorDelayMeta||null),virginDiverseGames:diverseTop.map(x=>x.game),virginDiverseMeta:diverseTop.map(x=>x.virginMeta),paretoGames:paretoTop.map(x=>x.game),paretoMeta:paretoTop.map(x=>x.virginMeta),virginStats,approvedHitDist,diagnostics};
}


function runGroupPatternScore(d){
  const pattern=String(d.pattern||''),m=/^(\d+)-(0|1)-(\d+)$/.exec(pattern);
  if(!m){postMessage({type:'group-pattern-score-done',pattern,error:'Composição inválida.'});return;}
  const a=Number(m[1]),mid=Number(m[2]),b=Number(m[3]);
  if(a<0||a>12||b<0||b>12||a+mid+b!==15){postMessage({type:'group-pattern-score-done',pattern,error:'A composição precisa totalizar 15 dezenas.'});return;}
  const ctx=M.buildContext(d.history||[],{window:d.period||10}),policies=d.policies||{},externalPolicies=d.externalPolicies||{},p1=Array.from({length:12},(_,i)=>i+1),p2=Array.from({length:12},(_,i)=>i+14),total=M.nCk(12,a)*M.nCk(12,b),limit=Math.max(20,Math.min(200,Number(d.topLimit)||100)),top=[],colorDelayModel=M.buildFullColorDelayModel?M.buildFullColorDelayModel(ctx.history||[]):[];
  let tested=0,approvedCount=0,lastProgress=0;const progressEvery=Math.max(250,Math.floor(total/500));
  eachComb(p1,a,left=>{eachComb(p2,b,right=>{const g=[...left,...(mid?[13]:[]),...right].sort((x,y)=>x-y);tested++;
    if(indicatedColorValid(g,externalPolicies)){const report=M.inspect(g,ctx),score=M.candidateScoreFromReport?M.candidateScoreFromReport(report,ctx,policies,externalPolicies):M.candidateScore(g,ctx,policies,externalPolicies);if(Number.isFinite(score)){approvedCount++;const colorDelay=M.fullColorDelayBonus?M.fullColorDelayBonus(g,colorDelayModel):{bonus:0},rankScore=Number(score)+Number(colorDelay?.bonus||0);insertExhaustiveTop(top,{game:[...g],score,rankScore},limit);}}
    if(tested-lastProgress>=progressEvery||tested===total){lastProgress=tested;postMessage({type:'group-pattern-score-progress',pattern,tested,total,approvedCount});}
  });});
  const picked=top[0]||null,stat=nums=>nums.map(n=>{const inc=top.map((x,i)=>({x,i})).filter(z=>z.x.game.includes(n));return{n,appearances:inc.length,bestRank:inc.length?inc[0].i+1:null,avgRankScore:inc.length?inc.reduce((s,z)=>s+Number(z.x.rankScore||0),0)/inc.length:null};}).sort((x,y)=>y.appearances-x.appearances||(x.bestRank??9999)-(y.bestRank??9999)||x.n-y.n);
  postMessage({type:'group-pattern-score-done',pattern,part1Count:a,mid,part2Count:b,tested,total,approvedCount,game:picked?.game||[],score:picked?.score??null,rankScore:picked?.rankScore??null,topCount:top.length,part1Stats:stat(p1),part2Stats:stat(p2)});
}

self.onmessage=e=>{const d=e.data||{};if(d.task==='group-pattern-score')return runGroupPatternScore(d);if(d.task==='color-rank')return runColorRank(d);if(d.task==='generate')return runGenerate(d);if(d.task==='lab')return runLab(d);if(d.task==='backtest')return runBacktest(d);if(d.task==='filter-audit')return runFilterAudit(d);if(d.task==='combined-integral')return runCombinedIntegral(d);if(d.task==='closure')return runClosure(d);};

function runGenerate(d){
  const ctx=M.buildContext(d.history||[],{window:d.period||10}),externalPolicies=d.externalPolicies||{},target=1,maxAttempts=Math.max(1000,Number(d.maxAttempts)||250000),quotaSpec=d.indicatorQuotas||(d.indicatorTargets?buildIndicatorQuotaSpec(d.history||[],d.indicatorTargets):null);
  if(d.colorBalanced&&!colorFeasible(d.excluded||[],externalPolicies)){postMessage({type:'done',games:[],tested:0,complete:false,maxAttempts,reason:'As exclusões impedem formar um jogo com 8–10 cores sem cair nas estruturas bloqueadas.'});return;}
  if(d.deterministic&&!d.colorBalanced){
    if(d.exhaustive){const rankingConfig=d.rankingMode==='virgin'?{mode:'virgin',profile:d.virginProfile||'strong',previousVirginGames:d.previousVirginGames||[]}:null,best=exhaustiveBest(ctx,d.policies||{},d.excluded||[],Math.max(0,Number(d.rankIndex)||0),Math.max(50,Number(d.topLimit)||200),null,quotaSpec,d.proProfile||null,rankingConfig,d.boundary||null,d.fixedNumbers||[],d.decisionRelaxations||[],externalPolicies);postMessage({type:'done',games:best.game?[best.game]:[],tested:best.tested,total:best.total,complete:best.audit?.verified===true,audit:best.audit,maxAttempts:best.total,deterministic:true,exhaustive:true,mode:d.rankingMode==='virgin'?'Busca exaustiva integral · Ranking Virgem exclusivo · F29 absoluto · F37 conforme política':'Busca exaustiva integral · 51 filtros · F29 absoluto · F28/F36/F37 conforme Perfil PRO',score:best.score,rankScore:best.rankScore,approvedCount:best.approvedCount,eligibleCount:best.eligibleCount,rankIndex:best.rankIndex,topGames:best.topGames,topScores:best.topScores,topMeta:best.topMeta,virginDiverseGames:best.virginDiverseGames,virginDiverseMeta:best.virginDiverseMeta,paretoGames:best.paretoGames,paretoMeta:best.paretoMeta,virginStats:best.virginStats,diagnostics:best.diagnostics});return;}
    const ex=new Set((d.excluded||[]).map(Number)),games=sampledGames(Math.max(1000,Math.min(50000,Number(d.sampleSize)||12000))).filter(g=>{if(!g.every(n=>!ex.has(n))||!indicatedColorValid(g,externalPolicies)||!quotaAllows(g,quotaSpec))return false;const rr=M.inspect(g,ctx);return proProfileAllows(g,rr,d.proProfile||null)}),best=deterministicBestFromPool(ctx,d.policies||{},games,null,externalPolicies);
    postMessage({type:'done',games:best.game?[best.game]:[],tested:best.tested,total:best.total,complete:!!best.game,maxAttempts:best.tested,deterministic:true,exhaustive:false,score:best.score,approvedCount:best.approvedCount,rankIndex:best.rankIndex});return;
  }
  const out=[],seen=new Set();let tested=0;
  while(out.length<target&&tested<maxAttempts){const g=randomCandidate(d.excluded||[],!!d.colorBalanced,externalPolicies);tested++;if(!g)continue;const k=keyOf(g);if(seen.has(k))continue;seen.add(k);const r=M.inspect(g,ctx);if(M.policyAllows(r,d.policies||{},externalPolicies)&&quotaAllows(g,quotaSpec)&&proProfileAllows(g,r,d.proProfile||null)&&(d.colorBalanced?colorRuleValid(g,externalPolicies):indicatedColorValid(g,externalPolicies)))out.push(g);if(tested%5000===0)postMessage({type:'progress',tested,found:out.length,maxAttempts});}
  postMessage({type:'done',games:out,tested,complete:out.length===target,maxAttempts});
}

function virginProfileCompareBest(ctx,policies,quotaSpec=null,proProfile=null,mode='quick',sampleSize=4000,progressInfo=null,externalPolicies={}){
  const vc=buildVirginRankContext(ctx.history||[],[]),best={light:null,strong:null,max:null},approvedHitDist=Object.fromEntries(Array.from({length:16},(_,i)=>[i,0]));let tested=0,approvedCount=0,eligibleCount=0,lastProgress=0;
  const consider=g=>{tested++;if(!indicatedColorValid(g,externalPolicies))return;const report=M.inspect(g,ctx),score=M.candidateScoreFromReport?M.candidateScoreFromReport(report,ctx,policies,externalPolicies):M.candidateScore(g,ctx,policies,externalPolicies);if(!Number.isFinite(score))return;approvedCount++;if(progressInfo?.targetDraw)approvedHitDist[hits(g,progressInfo.targetDraw)]++;if(!quotaAllows(g,quotaSpec)||!proProfileAllows(g,report,proProfile))return;eligibleCount++;const meta=virginRankMetrics(g,score,vc,'strong');for(const p of ['light','strong','max']){const rank=Number(meta.sensitivity[p]);const prev=best[p];if(!prev||rank>prev.rankScore||(rank===prev.rankScore&&(score>prev.score||(score===prev.score&&keyOf(g)<keyOf(prev.game)))))best[p]={game:[...g],score,rankScore:rank,virginMeta:{...meta,profile:p,rankScore:rank}};}};
  if(mode==='integral'){const total=M.nCk(25,15),progressEvery=Math.max(100,Math.min(500,Math.floor(total/1000)));eachComb(ALL,15,gref=>{consider([...gref]);if(tested-lastProgress>=progressEvery||tested===total){lastProgress=tested;if(progressInfo){const grandTested=(progressInfo.current-1)*total+tested,grandTotal=progressInfo.targets*total;postMessage({type:'backtest-integral-progress',contest:progressInfo.contest,current:progressInfo.current,total:progressInfo.targets,comboTested:tested,comboTotal:total,grandTested,grandTotal,approvedCount,eligibleCount});}}});return{profiles:best,tested,total,approvedCount,eligibleCount,approvedHitDist};}
  const games=sampledGames(sampleSize);for(const g of games)consider(g);return{profiles:best,tested,total:games.length,approvedCount,eligibleCount,approvedHitDist};
}

function runBacktest(d){
  const history=d.history||[],mode=d.mode==='integral'?'integral':'quick',requestedW=Number(d.testWindow)||200,w=mode==='integral'?Math.max(1,Math.min(200,requestedW)):Math.max(10,Math.min(200,requestedW)),series=Math.max(10,Math.min(5000,Number(d.series)||200)),period=Math.max(10,Math.min(200,Number(d.period)||10)),policies=d.policies||{},externalPolicies=d.externalPolicies||{},sampleSize=Math.max(1000,Math.min(12000,Number(d.sampleSize)||4000));
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
    let best=null,profileBest=null;if(d.selectionMode==='virgin'){const cmp=virginProfileCompareBest(ctx,policies,quota,null,mode,sampleSize,{type:'backtest',contest:target.concurso,current:i+1,targets:targets.length,targetDraw:target.dezenas},externalPolicies),chosen=d.virginProfile||'strong';profileBest=cmp.profiles;best={...(profileBest[chosen]||{}),approvedCount:cmp.approvedCount,eligibleCount:cmp.eligibleCount,approvedHitDist:cmp.approvedHitDist};for(const p of ['light','strong','max']){const pg=profileBest[p]?.game;if(pg)profileStrat[p].push({contest:target.concurso,h:hits(pg,target.dezenas),score:profileBest[p].score,rankScore:profileBest[p].rankScore});}}else best=mode==='integral'?exhaustiveBest(ctx,policies,[],0,1,{type:'backtest',contest:target.concurso,current:i+1,targets:targets.length,targetDraw:target.dezenas},quota,null,null,null,[],[],externalPolicies):deterministicBestFromPool(ctx,policies,sampledGames(sampleSize).filter(g=>quotaAllows(g,quota)),null,externalPolicies);
    const gen=best?.game;if(mode==='integral'){integralTargetsProcessed++;approvedTotal+=Number(best?.approvedCount||0);for(let p=0;p<=15;p++)approvedHitDist[p]+=Number(best?.approvedHitDist?.[p]||0);}
    if(!gen){skipped++;sendCheckpoint(i+1);postMessage({type:'backtest-progress',current:i+1,total:targets.length,tests:strat.length,skipped,mode,resumedFrom:startTarget});continue;}
    strat.push({contest:target.concurso,h:hits(gen,target.dezenas),score:best.score});blockPass.push(blockedFailures(M.inspect(target.dezenas,ctx),policies,externalPolicies).length===0?1:0);
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
  postMessage({type:'backtest-done',result:{mode,savg,pct,beat13,tests:sh.length,eligible,skipped,points11:sh.filter(v=>v>=11).length,points13:s13,holdout:mean(holdout),train:mean(train),allCI,trainCI,holdoutCI,randomMean,randomCI,blockPass:Math.round(mean(blockPass)*100),series,sd,randomAvgDist,seed:baseSeed,sampleSize:mode==='integral'?combinationsPerContest:sampleSize,combinationsPerContest,combinationsScanned,integralTargetsProcessed,approvedTotal,approvedHitDist,approved15:approvedHitDist[15]||0,profileCompare,method:mode==='integral'?(d.selectionMode==='virgin'?'Busca exaustiva integral por concurso: 3.268.760 combinações C(25,15), ranking Virgem exclusivo calculado simultaneamente para Leve/Forte/Máximo, com F29 absoluto · demais filtros internos apenas aviso/ranking':'Busca exaustiva integral por concurso: 3.268.760 combinações C(25,15), ranking Matriz 51 e bloqueios obrigatórios F28 + F29 + F36 + F37 do NOVO INDICADO'):'Ranking determinístico walk-forward em amostra uniforme do espaço combinatório'}});
}

function addHistoryIndex(draw,hash,h14){if(!draw?.dezenas?.length)return;hash.add(M.keyOf(draw.dezenas));for(let i=0;i<15;i++){const k=M.keyOf(draw.dezenas.filter((_,j)=>j!==i));if(!h14.has(k))h14.set(k,draw.concurso);}}
function diffCI(p1,n1,p2,n2){if(!n1||!n2)return[0,0];const d=p1-p2,se=Math.sqrt((p1*(1-p1))/n1+(p2*(1-p2))/n2),m=1.96*se;return[d-m,d+m];}
function runFilterAudit(d){
  const history=(d.history||[]).map(x=>({concurso:Number(x.concurso),data:x.data||'',dezenas:M.normalize(x.dezenas)})).filter(x=>x.dezenas).sort((a,b)=>a.concurso-b.concurso),period=Math.max(10,Math.min(200,Number(d.period)||10)),series=Math.max(1,Math.min(100,Number(d.series)||20)),sampleSize=Math.max(100,Math.min(5000,Number(d.sampleSize)||1000)),policies=d.policies||{},externalPolicies=d.externalPolicies||{};
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
    if(strategyTargetIndexes.has(i)){strategyTargetsSeen++;const best=deterministicBestFromPool(ctx,policies,strategyPool,null,externalPolicies);if(best.game){strategyHits.push(hits(best.game,target.dezenas));for(let si=0;si<series;si++)strategyRandomHitSeries[si].push(contestRandomHits[si]);}else strategySkipped++;}
    if(processed%10===0||processed===totalTargets)postMessage({type:'filter-audit-progress',current:processed,total:totalTargets,contest:target.concurso,strategyCurrent:strategyTargetsSeen,strategyTotal:strategyTargetCount});
  }
  const filters=M.FILTERS.map(f=>{const x=fs[f.id],kind=f.mode==='experimental'?'score':f.mode==='operational'?'operational':'pass',realRate=x.realTotal?x.realPass/x.realTotal:0,randomRate=x.randomTotal?x.randomPass/x.randomTotal:0,randomExclusionRate=1-randomRate;let ciLow=null,ciHigh=null;if(x.pairedN>1){const md=x.pairedSum/x.pairedN,v=Math.max(0,(x.pairedSq-(x.pairedSum*x.pairedSum/x.pairedN))/(x.pairedN-1)),m=1.96*Math.sqrt(v/x.pairedN);ciLow=md-m;ciHigh=md+m;}else{[ciLow,ciHigh]=diffCI(realRate,x.realTotal,randomRate,x.randomTotal);}const realScoreMean=x.realScoreN?x.realScoreSum/x.realScoreN:null,randomScoreMean=x.randomScoreN?x.randomScoreSum/x.randomScoreN:null;let scoreCiLow=null,scoreCiHigh=null;if(x.scorePairedN>1){const md=x.scorePairedSum/x.scorePairedN,v=Math.max(0,(x.scorePairedSq-(x.scorePairedSum*x.scorePairedSum/x.scorePairedN))/(x.scorePairedN-1)),m=1.96*Math.sqrt(v/x.scorePairedN);scoreCiLow=md-m;scoreCiHigh=md+m;}let classification='Ignorar';if(MANDATORY_BLOCKS.has(f.id))classification='Bloquear';else if(kind==='operational'||kind==='score')classification='Ignorar';else if(x.blockedReal===0&&realRate>=.995&&ciLow>0&&randomExclusionRate>=.03)classification='Bloquear';else if(realRate>=.90&&realRate>randomRate)classification='Avisar';return{...x,kind,realRate,randomRate,randomExclusionRate,ciLow,ciHigh,realScoreMean,randomScoreMean,scoreCiLow,scoreCiHigh,ciMethod:'paired-by-contest',classification};});
  const randomMeans=strategyRandomHitSeries.map(mean),strategyMean=mean(strategyHits),randomMean=mean(randomMeans),percentile=Math.round(randomMeans.filter(v=>v<=strategyMean).length/Math.max(1,randomMeans.length)*100),strategy13plus=strategyHits.filter(v=>v>=13).length,random13plusMean=mean(strategyRandomHitSeries.map(a=>a.filter(v=>v>=13).length));
  const result={auditVersion:M.AUDIT_VERSION||'LF-M51-AUDIT-v3.6.2',thresholdVersion:M.THRESHOLD_VERSION,schemaVersion:M.SCHEMA_VERSION,latestContest:history.at(-1)?.concurso||null,period,historyUniverse:history.length,warmup:minPrior,eligibleTargets:totalTargets,targets:processed,randomSeries:series,sampleSize,seed,filters,combined:{canonicalRealRate:canonicalReal/Math.max(1,canonicalRealTotal),canonicalRandomRate:canonicalRandom/Math.max(1,canonicalRandomTotal),activeRealRate:activeReal/Math.max(1,activeRealTotal),activeRandomRate:activeRandom/Math.max(1,activeRandomTotal),canonicalReal,canonicalRealTotal,canonicalRandom,canonicalRandomTotal,activeReal,activeRealTotal,activeRandom,activeRandomTotal},strategy:{tests:strategyHits.length,benchmarkTargets:strategyTargetsSeen,skipped:strategySkipped,strategyMean,randomMean,percentile,strategy13plus,random13plusMean,sampling:'diagnóstico rápido amostral; benchmark oficial combinado é o Integral 1:1'}};
  postMessage({type:'filter-audit-done',result});
}

function runCombinedIntegral(d){
  const history=(d.history||[]).map(x=>({concurso:Number(x.concurso),data:x.data||'',dezenas:M.normalize(x.dezenas)})).filter(x=>x.dezenas).sort((a,b)=>a.concurso-b.concurso);
  const period=Math.max(10,Math.min(200,Number(d.period)||10)),policies=d.policies||{},externalPolicies=d.externalPolicies||{},series=Math.max(1,Math.min(100,Number(d.series)||10)),minPrior=10,targets=history.slice(minPrior),totalTargets=targets.length;
  if(history.length<20){postMessage({type:'combined-integral-done',error:'Histórico insuficiente.'});return;}
  const signature=String(d.signature||''),resume=d.resume&&d.resume.signature===signature?d.resume:null;
  let nextIndex=Math.max(0,Math.min(totalTargets,Number(resume?.nextIndex)||0)),tests=Number(resume?.tests)||0,skipped=Number(resume?.skipped)||0,strategySum=Number(resume?.strategySum)||0,strategy13plus=Number(resume?.strategy13plus)||0;
  const strategyDist=resume?.strategyDist||{11:0,12:0,13:0,14:0,15:0},randomSums=Array.isArray(resume?.randomSums)?resume.randomSums.slice(0,series):Array(series).fill(0),random13plus=Array.isArray(resume?.random13plus)?resume.random13plus.slice(0,series):Array(series).fill(0),randomDist=Array.isArray(resume?.randomDist)?resume.randomDist.slice(0,series):Array.from({length:series},()=>({11:0,12:0,13:0,14:0,15:0}));
  while(randomSums.length<series)randomSums.push(0);while(random13plus.length<series)random13plus.push(0);while(randomDist.length<series)randomDist.push({11:0,12:0,13:0,14:0,15:0});
  for(let ti=nextIndex;ti<totalTargets;ti++){
    const target=targets[ti],prior=history.slice(0,minPrior+ti),ctx=M.buildContext(prior,{window:period}),quota=buildIndicatorQuotaSpec(prior,d.indicatorTargets||{});
    const best=exhaustiveBest(ctx,policies,[],0,1,{type:'combined-integral',contest:target.concurso,current:ti+1,targets:totalTargets},quota,null,null,null,[],[],externalPolicies);
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
  const history=d.history||[],ctx=M.buildContext(history,{window:d.period||10}),externalPolicies=d.externalPolicies||{},base=M.normalize(d.base)||[],locked=new Set(d.locked||[]),excluded=new Set(d.excluded||[]),q=Number(d.swap)||2,limit=Math.max(3,Math.min(10,Number(d.scenarios)||5));
  if(base.length!==15){postMessage({type:'lab-done',scenarios:[],tested:0});return;}
  const removable=base.filter(n=>!locked.has(n)),outside=ALL.filter(n=>!base.includes(n)&&!excluded.has(n));if(removable.length<q||outside.length<q){postMessage({type:'lab-done',scenarios:[],tested:0});return;}
  const rems=comb(removable,q),adds=comb(outside,q),best=[];let tested=0;const maxTests=q===5?25000:Infinity;
  const consider=(rs,ad)=>{const g=base.filter(n=>!rs.includes(n)).concat(ad).sort((a,b)=>a-b);tested++;if(!indicatedColorValid(g,externalPolicies))return;const r=M.inspect(g,ctx),fails=blockedFailures(r,d.policies||{},externalPolicies).length,warn=warnings(r,d.policies||{}).length,common=base.filter(n=>g.includes(n)).length,structural=M.candidateScore(g,ctx,d.policies||{},externalPolicies),hist=r.metrics.maxHistorical||13;const score=Number.isFinite(structural)?structural-warn*.5-(hist>=14?8:0)+(15-common)*.15:-Infinity;const item={game:g,failed:fails,warnings:warn,history:hist,common,score,structural,breakdown:{sum:r.metrics.total,odds:r.metrics.odds,primes:r.metrics.primes,center:r.metrics.center,border:r.metrics.border,repeated:r.metrics.repeated,lines:r.metrics.lines,cols:r.metrics.cols}};if(fails===0){best.push(item);best.sort((a,b)=>b.score-a.score||a.history-b.history||a.warnings-b.warnings||keyOf(a.game).localeCompare(keyOf(b.game)));if(best.length>Math.max(60,limit*10))best.length=Math.max(60,limit*10);}if(tested%5000===0)postMessage({type:'lab-progress',tested});};
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
  const history=d.history||[],ctx=M.buildContext(history,{window:d.period||10}),externalPolicies=d.externalPolicies||{},pool=[...new Set((d.pool||[]).map(Number))].filter(n=>n>=1&&n<=25).sort((a,b)=>a-b),count=Math.max(1,Math.min(100,Number(d.count)||10)),targetK=Math.max(11,Math.min(14,Number(d.targetK)||13)),policies=d.policies||{};
  if(pool.length<15||pool.length>21){postMessage({type:'closure-done',error:'O grupo-base deve ter de 15 a 21 dezenas.'});return;}
  const all=comb(pool,15),eligible=[];for(let i=0;i<all.length;i++){const g=all[i];if(!indicatedColorValid(g,externalPolicies)){if(i%1000===0)postMessage({type:'closure-progress',phase:'Matriz',current:i,total:all.length});continue;}const r=M.inspect(g,ctx),historicalExact=r.filters[28]&&!r.filters[28].passed;if(!historicalExact){const blocks=blockedFailures(r,policies,externalPolicies).length,warns=warnings(r,policies).length;eligible.push({game:g,score:100-blocks*10-warns,blocks,warns});}if(i%1000===0)postMessage({type:'closure-progress',phase:'Matriz',current:i,total:all.length});}
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
