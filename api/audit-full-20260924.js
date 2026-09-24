const fs=require('fs'),path=require('path'),vm=require('vm');
const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
function loadMatrix(){
  const src=fs.readFileSync(path.join(process.cwd(),'matrix-51.js'),'utf8');
  const sandbox={window:{},console,Set,Map,Math,Number,String,Array,Object,Date,JSON};
  vm.createContext(sandbox);vm.runInContext(src,sandbox,{filename:'matrix-51.js'});
  return sandbox.window.LFMatrix51;
}
const comb=(arr,k,cb,start=0,p=[])=>{if(p.length===k)return cb([...p]);for(let i=start;i<=arr.length-(k-p.length);i++){p.push(arr[i]);if(cb.stop)return;p.length&&comb(arr,k,cb,i+1,p);p.pop();if(cb.stop)return;}};
module.exports=async function(req,res){
 try{
  const live=await buildLiveBase(base,{force:false}),history=live.history||[],M=loadMatrix(),ctx=M.buildContext(history,{window:10}),latest=history.at(-1);
  const tests=[];
  const add=(name,pass,detail,extra={})=>tests.push({name,pass:!!pass,detail,...extra});
  const validDraw=d=>Array.isArray(d.dezenas)&&d.dezenas.length===15&&new Set(d.dezenas).size===15&&d.dezenas.every(n=>Number.isInteger(n)&&n>=1&&n<=25);
  const contests=history.map(x=>Number(x.concurso)),uniqueContests=new Set(contests),missing=[];for(let c=Math.min(...contests);c<=Math.max(...contests);c++)if(!uniqueContests.has(c))missing.push(c);
  add('Base histórica íntegra',history.length===3787&&latest?.concurso===3787&&history.every(validDraw)&&uniqueContests.size===history.length&&missing.length===0,
      history.length+' concursos · último #'+(latest?.concurso||'—')+' · faltantes '+missing.length);
  add('Matriz possui 51 filtros',M.FILTERS?.length===51&&M.FILTERS.every((f,i)=>f.id===i+1),'Filtros '+(M.FILTERS?.length||0)+' · IDs 1–51');
  add('Metadado de auditoria acompanha base',Number(M.AUDIT_BASE_THROUGH)===Number(latest?.concurso),'AUDIT_BASE_THROUGH '+M.AUDIT_BASE_THROUGH+' × base #'+latest?.concurso);
  const exact=M.inspect(latest.dezenas,ctx),f29=exact.filters.find(f=>f.id===29);
  add('F29 bloqueia histórico 15/15',f29&&!f29.passed&&exact.metrics.maxHistorical===15,'F29 '+(f29?.passed?'PASSOU':'BLOQUEOU')+' · maxHist '+exact.metrics.maxHistorical);
  let near=null;
  const lastSet=new Set(latest.dezenas),outside=Array.from({length:25},(_,i)=>i+1).filter(n=>!lastSet.has(n));
  outer:for(let i=0;i<15;i++)for(const n of outside){const g=latest.dezenas.filter((_,j)=>j!==i).concat(n).sort((a,b)=>a-b),r=M.inspect(g,ctx),f37=r.filters.find(f=>f.id===37),f29x=r.filters.find(f=>f.id===29);if(f37&&!f37.passed&&f29x?.passed){near={g,r,f37,f29:f29x};break outer;}}
  add('F37 bloqueia 14/15 histórico',!!near,'Teste '+(near?near.g.join(','):'não localizado')+(near?' · '+near.f37.detail:''));
  const colorGame=[1,11,21,2,12,22,3,13,23,4,14,24,5,15,25],color=M.mandatoryColorRule(colorGame);
  add('Cores <8 são bloqueadas',color.blocked===true&&color.distinct<8,'Cores distintas '+color.distinct+' · blocked '+color.blocked);
  add('Linha igual ao último bloqueia',exact.lineRepeat?.blocked===true,'blocked '+exact.lineRepeat?.blocked+' · '+(exact.lineRepeat?.currentLines||[]).join('-'));
  add('Coluna igual ao último bloqueia',exact.columnRepeat?.blocked===true,'blocked '+exact.columnRepeat?.blocked+' · '+(exact.columnRepeat?.currentCols||[]).join('-'));
  let f36case=null;const pool25=Array.from({length:25},(_,j)=>j+1),total=M.nCk(25,15);
  const probes=[Array.from({length:15},(_,i)=>i+1),Array.from({length:15},(_,i)=>i+11),[1,2,3,4,5,6,7,8,9,17,18,19,23,24,25],[1,2,3,7,8,9,10,11,12,13,14,20,21,24,25]];
  for(const g of probes){const r=M.inspect(g,ctx),f36=r.filters.find(f=>f.id===36);if(f36&&!f36.passed){f36case={g,r,f36};break;}}
  if(!f36case){const samples=50000;for(let i=0;i<samples;i++){const rank=Math.floor(i*(total-1)/Math.max(1,samples-1)),g=M.unrank(pool25,15,rank),r=M.inspect(g,ctx),f36=r.filters.find(f=>f.id===36);if(f36&&!f36.passed){f36case={g,r,f36,rank};break;}}}
  add('F36 bloqueia 3+ falhas F30–F35',!!f36case,f36case?f36case.f36.detail+' · jogo '+f36case.g.join(','):'Nenhum caso encontrado em probes + 50.000 ranks uniformes');
  const repeated=latest.dezenas,absent=Array.from({length:25},(_,i)=>i+1).filter(n=>!lastSet.has(n));let f28case=null;
  const choose10=[];const cb10=x=>{choose10.push(x);if(choose10.length>=4000)cb10.stop=true};comb(repeated,10,cb10);
  const choose5=[];const cb5=x=>choose5.push(x);comb(absent,5,cb5);
  search:for(const a of choose10)for(const b of choose5){const g=a.concat(b).sort((x,y)=>x-y),sum=g.reduce((s,n)=>s+n,0),odds=g.filter(n=>n%2).length,primes=g.filter(n=>[2,3,5,7,11,13,17,19,23].includes(n)).length;let alerts=(sum===220)+(odds===9)+(primes===6)+1;if(alerts>=3){const r=M.inspect(g,ctx),f28=r.filters.find(f=>f.id===28);if(f28&&!f28.passed){f28case={g,r,f28,alerts};break search;}}}
  add('F28 bloqueia 3+ alertas máximos',!!f28case,f28case?f28case.f28.detail:'Nenhum caso localizado');
  const universe425=M.nCk(20,13);
  add('Faixa 04→25 tem universo correto',universe425===77520,'C(20,13) = '+universe425);
  const must=[28,29,36,37],mandatory=must.every(id=>M.FILTERS.some(f=>f.id===id));
  add('F28/F29/F36/F37 presentes',mandatory,'IDs '+must.join(','));
  const failed=tests.filter(x=>!x.pass);
  res.setHeader('Cache-Control','no-store');res.status(200).json({ok:failed.length===0,tests,failed:failed.map(x=>x.name),meta:{schema:M.SCHEMA_VERSION,threshold:M.THRESHOLD_VERSION,auditVersion:M.AUDIT_VERSION,auditBase:M.AUDIT_BASE_THROUGH,latest:latest?.concurso,history:history.length}});
 }catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}
};