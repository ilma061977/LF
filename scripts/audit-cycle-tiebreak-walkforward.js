const fs=require('fs'),vm=require('vm'),path=require('path'),assert=require('assert'),root=path.join(__dirname,'..'),source=fs.readFileSync(path.join(root,'app.js'),'utf8'),ALL=Array.from({length:25},(_,i)=>i+1),info=Object.fromEntries([1,2,3,4,5,6,7,8,9,0].map(k=>[k,{name:String(k),nums:ALL.filter(n=>n%10===k)}]));
const ctx={ALL,state:{groups:[]},COLOR_ORDER:[1,2,3,4,5,6,7,8,9,0],COLOR_INFO:info,mean:a=>a.reduce((x,y)=>x+y,0)/a.length};vm.createContext(ctx);const a=source.indexOf('  function cycleCoverage('),b=source.indexOf('  const cycleEscape',a);vm.runInContext(source.slice(a,b),ctx);
const history=require(path.join(root,'data/lotofacil-base.json')).history.sort((a,b)=>a.concurso-b.concurso);assert.equal(history.at(-1).concurso,3792);assert.equal(history.length,3792);
const groups=ctx.groupCycleDefinitions().filter(([key])=>!key.startsWith('custom')).map(([key,name,nums])=>({key,name,nums:Array.from(nums),members:new Set(nums)}));
const seen=groups.map(()=>new Set()),active=groups.map(()=>false),rows=[];
function seeded(seed){let x=(seed>>>0)||1;return()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return(x>>>0)/4294967296;};}
function sampleRandom(seed){const a=ALL.slice(),rnd=seeded(seed);for(let i=a.length-1;i>0;i--){const j=Math.floor(rnd()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a.slice(0,15);}
for(let i=0;i<history.length;i++){
 const draw=history[i],contest=draw.concurso;
 if(i>0){
   const priority=Array(25).fill(0);
   for(let g=0;g<groups.length;g++)if(active[g]){const missing=groups[g].nums.filter(n=>!seen[g].has(n));if(missing.length>0&&missing.length<=3)for(const n of missing)priority[n-1]+=1/missing.length;}
   const rnd=seeded(contest*2654435761);
   const tie=ALL.map(()=>rnd());
   const cycleGame=ALL.slice().sort((x,y)=>priority[y-1]-priority[x-1]||tie[y-1]-tie[x-1]).slice(0,15);
   const randomGame=sampleRandom((contest+991)*2246822519);
   const actual=new Set(draw.dezenas);
   const hits=game=>game.filter(n=>actual.has(n)).length;
   rows.push({contest,cycle:hits(cycleGame),random:hits(randomGame)});
 }
 // Advance cycle state only after scoring the target draw.
 for(let g=0;g<groups.length;g++){
   for(const n of draw.dezenas)if(groups[g].members.has(n))seen[g].add(n);
   if(seen[g].size===groups[g].nums.length){seen[g].clear();active[g]=false;}
   else active[g]=true;
 }
}
const validationStart=history.length-1000;assert.equal(rows.filter(r=>r.contest>validationStart).length,1000);
function summarize(sample){const n=sample.length,cycle=sample.reduce((s,x)=>s+x.cycle,0)/n,random=sample.reduce((s,x)=>s+x.random,0)/n;return{targets:n,from:sample[0].contest,to:sample.at(-1).contest,cycleMean:+cycle.toFixed(4),randomSampleMean:+random.toFixed(4),deltaVsSample:+(cycle-random).toFixed(4),randomExpected:9,cycle11plus:sample.filter(x=>x.cycle>=11).length,random11plus:sample.filter(x=>x.random>=11).length,drawsBlockedByCycle:0};}
const discovery=rows.filter(r=>r.contest<=validationStart),holdout=rows.filter(r=>r.contest>validationStart),result={rule:'Somar 1/p para cada dezena pendente em grupos com 1–3 pendências; escolher as 15 maiores pontuações, empate pseudoaleatório fixo por concurso.',noFuture:true,discovery:summarize(discovery),validation1000:summarize(holdout),note:'Teste descritivo isolado da orientação por ciclos; compara com uma carteira pseudoaleatória por alvo. Não demonstra vantagem preditiva. No app, o critério só desempata scores principais exatamente iguais.'};
console.log(JSON.stringify(result,null,2));

