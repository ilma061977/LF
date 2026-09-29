const fs=require('fs'),vm=require('vm'),assert=require('assert'),path=require('path');
const source=fs.readFileSync(path.join(__dirname,'../app.js'),'utf8'),c={ALL:Array.from({length:25},(_,i)=>i+1)};vm.createContext(c);
function extract(start,end){const i=source.indexOf(start);return source.slice(i,source.indexOf(end,i+start.length));}
vm.runInContext(extract('  function cycleCoverage(','  function gameNumbers(')+extract('  function verticalPctBand(','\n  function ')+extract('  function percentageAppearance(','  function numberReadingContext('),c);
const draw=(concurso,dezenas)=>({concurso,dezenas}),first=Array.from({length:15},(_,i)=>i+1),second=Array.from({length:15},(_,i)=>i+11);
let r=c.cycleCoverage([draw(1,first)]);assert.equal(r.activeLength,1);assert.deepEqual(Array.from(r.missing),second.slice(5));
r=c.cycleCoverage([draw(1,first),draw(2,second)]);assert.equal(r.cycles.length,1);assert.equal(r.cycles[0].length,2);assert.deepEqual(Array.from(r.cycles[0].last),second.slice(5));assert.equal(r.startRow,null);assert.equal(r.activeLength,0);assert.equal(r.missing.length,0);
r=c.cycleCoverage([draw(1,first),draw(2,second),draw(3,first)]);assert.equal(r.startRow.concurso,3);assert.equal(r.activeLength,1);assert.equal(r.seen.size,15);assert.deepEqual(Array.from(r.missing),second.slice(5));
for(const [pct,cls] of [[20,'p0'],[30,'p30'],[40,'p40'],[50,'p50'],[55,'p50'],[60,'p60'],[70,'p70'],[80,'p80'],[90,'p90'],[100,'p100']]){const a=c.percentageAppearance(pct),b=c.verticalPctBand(pct);assert.equal(a.cls,cls);assert.equal(a.color,b.color);assert(a.text);}
const html=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');assert(html.includes('reading-percent ${band.cls}'));assert(html.includes('pct.style.background=band.color'));assert(html.includes('cycle-history-panel'));
console.log('OK: reinício de ciclos, múltiplas dezenas no fechamento e cores percentuais idênticas às Verticais.');
