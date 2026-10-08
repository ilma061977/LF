const fs=require('fs');
global.window={};
require('../matrix-51.js');
const M=global.window.LFMatrix51;
const base=JSON.parse(fs.readFileSync('data/lotofacil-base.json','utf8'));
const ctx=M.buildContext(base.history,{window:10});
const keys=['EXA-TOPO-01','EXA-TOPO-02','EXA-DEG-01','EXA-DIR-01','EXA-BITQ-01','EXA-SYM-01','EXA-DIST-01'];
const six=keys.filter(k=>k!=='EXA-DEG-01');
const exaOff=Object.fromEntries(keys.map(k=>[k,false]));
const allExternalOff={PADRAO:false,CORES:false,LINHA:false,COLUNA:false,LXC:false,...exaOff};
const stat=()=>({base:0,individual:Object.fromEntries(keys.map(k=>[k,0])),union6:0,union7:0,degExclusive:0,exclusive7:Object.fromEntries(keys.map(k=>[k,0]))});
const out={matrixOnly:stat(),withExistingExternal:stat(),universe:0,baseThrough:base.history.at(-1).concurso};
const g=[];
function add(scope,report){
  scope.base++;
  const hit=keys.filter(k=>report.exaBlocks?.[k]?.blocked);
  for(const k of hit)scope.individual[k]++;
  const h6=hit.some(k=>k!=='EXA-DEG-01');
  if(h6)scope.union6++;
  if(hit.length)scope.union7++;
  if(hit.length===1)scope.exclusive7[hit[0]]++;
  if(hit.includes('EXA-DEG-01')&&!h6)scope.degExclusive++;
}
function rec(start,left){
  if(left===0){
    out.universe++;
    const report=M.inspect(g,ctx);
    if(M.policyAllows(report,{},allExternalOff))add(out.matrixOnly,report);
    if(M.policyAllows(report,{},exaOff))add(out.withExistingExternal,report);
    return;
  }
  for(let n=start;n<=25-left+1;n++){g.push(n);rec(n+1,left-1);g.pop();}
}
rec(1,15);
console.log('EXA_UNION7_RESULT '+JSON.stringify(out));
