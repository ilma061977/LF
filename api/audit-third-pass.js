const fs=require('fs'),path=require('path'),vm=require('vm');
const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
function load(){const src=fs.readFileSync(path.join(process.cwd(),'matrix-51.js'),'utf8'),s={window:{},console,Set,Map,Math,Number,String,Array,Object,Date,JSON};vm.createContext(s);vm.runInContext(src,s);return s.window.LFMatrix51;}
module.exports=async(req,res)=>{try{
 const live=await buildLiveBase(base,{force:false}),h=live.history,M=load(),ctx=M.buildContext(h,{window:10}),latest=h.at(-1),tests=[];
 const add=(name,pass,detail)=>tests.push({name,pass:!!pass,detail});
 add('Base 3787 contínua',h.length===3787&&latest?.concurso===3787&&new Set(h.map(x=>x.concurso)).size===3787, h.length+' / #'+latest?.concurso);
 add('51 filtros únicos',M.FILTERS.length===51&&new Set(M.FILTERS.map(x=>x.id)).size===51,'count '+M.FILTERS.length);
 const exact=M.inspect(latest.dezenas,ctx),f29=exact.filters.find(x=>x.id===29);add('F29 histórico',f29&&!f29.passed&&M.policyAllows(exact,{29:'block'})===false,f29?.detail);
 const set=new Set(latest.dezenas),outside=Array.from({length:25},(_,i)=>i+1).filter(n=>!set.has(n));let c37=null;
 outer:for(let i=0;i<15;i++)for(const n of outside){const g=latest.dezenas.filter((_,j)=>j!==i).concat(n).sort((a,b)=>a-b),r=M.inspect(g,ctx),f37=r.filters.find(x=>x.id===37),f29x=r.filters.find(x=>x.id===29);if(f37&&!f37.passed&&f29x?.passed){c37={g,r,f37};break outer;}}
 add('F37 14/15',!!c37,c37?.f37?.detail||'não encontrado');
 const g2=[1,2,3,4,5,6,7,8,9,10,11,12,13,15,17],r2=M.inspect(g2,ctx),x2=r2.filters.find(x=>x.id===28);
 const g3=[1,2,3,4,5,6,8,9,10,11,12,13,15,17,21],r3=M.inspect(g3,ctx),x3=r3.filters.find(x=>x.id===28);
 add('F28 2 alertas passa',!!x2?.passed,x2?.detail);
 add('F28 3 alertas bloqueia',x3&&!x3.passed,x3?.detail);
 const color=[1,11,21,2,12,22,3,13,23,4,14,24,5,15,25],cr=M.mandatoryColorRule(color);add('Cores <8 bloqueiam',cr.blocked&&cr.distinct<8,JSON.stringify(cr));
 add('Linha igual bloqueia',exact.lineRepeat?.blocked===true,JSON.stringify(exact.lineRepeat));
 add('Coluna igual bloqueia',exact.columnRepeat?.blocked===true,JSON.stringify(exact.columnRepeat));
 let c36=null;const probes=[[1,2,3,4,5,6,7,8,9,10,11,13,16,19,20],[1,2,3,4,5,6,7,8,9,17,18,19,23,24,25]],ALL=Array.from({length:25},(_,i)=>i+1);
 for(const g of probes){const r=M.inspect(g,ctx),x=r.filters.find(f=>f.id===36),fails=r.filters.filter(f=>f.id>=30&&f.id<=35&&!f.passed);if(x&&!x.passed&&fails.length>=3){c36={g,x,fails};break;}}
 if(!c36){const total=M.nCk(25,15),samples=60000;for(let i=0;i<samples;i++){const rank=Math.floor(i*(total-1)/Math.max(1,samples-1)),g=M.unrank(ALL,15,rank),r=M.inspect(g,ctx),x=r.filters.find(f=>f.id===36),fails=r.filters.filter(f=>f.id>=30&&f.id<=35&&!f.passed);if(x&&!x.passed&&fails.length>=3){c36={g,x,fails,rank};break;}}}
 add('F36 3+ falhas',!!c36,c36?c36.x.detail+' · '+c36.fails.map(x=>'F'+x.id).join(',')+' · '+c36.g.join(','):'não localizado em 60 mil ranks uniformes');
 add('Faixa 04→25 universo',M.nCk(20,13)===77520,'C(20,13)='+M.nCk(20,13));
 const failed=tests.filter(x=>!x.pass);res.setHeader('Cache-Control','no-store');res.status(200).json({ok:!failed.length,tests,failed:failed.map(x=>x.name),meta:{schema:M.SCHEMA_VERSION,threshold:M.THRESHOLD_VERSION,audit:M.AUDIT_VERSION}});
}catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}};