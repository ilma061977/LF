const base=require('../data/lotofacil-base.json');
const {buildLiveBase}=require('../lib/lotofacil-live');
const SOURCE='https://loteriadacaixa.net.br/lotofacil/todos-os-resultados-da-lotofacil-na-ordem-do-sorteio/64939/';
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/&nbsp;|&#160;/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
async function fetchPage(pg){const ac=new AbortController(),timer=setTimeout(()=>ac.abort(),8000);try{const r=await fetch(SOURCE+'?pg='+pg,{headers:{'user-agent':'Mozilla/5.0 LF-MinMaxCompare/1.0'},cache:'no-store',signal:ac.signal});if(!r.ok)throw new Error('HTTP '+r.status);const html=await r.text(),out=[],rowRe=/<tr[^>]*>([\s\S]*?)<\/tr>/gi;let rm;while((rm=rowRe.exec(html))){const cells=[...rm[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map(m=>clean(m[1]));if(cells.length<18)continue;const concurso=Number((cells[0].match(/\d+/)||[])[0]);if(Number.isInteger(concurso)&&/^Acum\.?$/i.test(cells[17]))out.push(concurso);}return out;}finally{clearTimeout(timer);}}
function erf(x){const s=x<0?-1:1;x=Math.abs(x);const a1=.254829592,a2=-.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=.3275911,t=1/(1+p*x);return s*(1-(((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t)*Math.exp(-x*x));}
const pval=z=>2*(1-.5*(1+erf(Math.abs(z)/Math.SQRT2)));
function cellTest(c1,n1,c2,n2){const p1=c1/n1,p2=c2/n2,p=(c1+c2)/(n1+n2),se=Math.sqrt(p*(1-p)*(1/n1+1/n2)),z=se?(p1-p2)/se:0,rr=p2?p1/p2:null,odds1=(c1+.5)/(n1-c1+.5),odds2=(c2+.5)/(n2-c2+.5);return{p1:p1*100,p2:p2*100,delta:(p1-p2)*100,z,p:pval(z),rr,or:odds1/odds2};}
module.exports=async function(req,res){try{
 const live=await buildLiveBase(base,{force:false}),pages=[];for(let start=1;start<=76;start+=12){const nums=Array.from({length:Math.min(12,77-start)},(_,i)=>start+i);pages.push(...await Promise.all(nums.map(fetchPage)));}
 const accSet=new Set(pages.flat()),acc=[],win=[];
 for(const x of live.history){const r={concurso:x.concurso,min:Math.min(...x.dezenas),max:Math.max(...x.dezenas)};(accSet.has(x.concurso)?acc:win).push(r);}
 const mk=rows=>{const m={};for(let a=1;a<=6;a++){m[a]={};for(let b=20;b<=25;b++)m[a][b]=0;}for(const x of rows)if(m[x.min]&&m[x.min][x.max]!=null)m[x.min][x.max]++;return m;};
 const ma=mk(acc),mw=mk(win),cells=[];
 for(let a=1;a<=6;a++)for(let b=20;b<=25;b++){const ca=ma[a][b],cw=mw[a][b],t=cellTest(ca,acc.length,cw,win.length);cells.push({start:a,end:b,acc:ca,win:cw,...t});}
 cells.sort((x,y)=>Math.abs(y.delta)-Math.abs(x.delta)||y.acc-x.acc);
 const bonf=cells.map(x=>({...x,bonf:Math.min(1,x.p*36)}));
 const starts=[];for(let a=1;a<=6;a++){const ca=acc.filter(x=>x.min===a).length,cw=win.filter(x=>x.min===a).length;starts.push({start:a,acc:ca,win:cw,...cellTest(ca,acc.length,cw,win.length)});}
 const ends=[];for(let b=20;b<=25;b++){const ca=acc.filter(x=>x.max===b).length,cw=win.filter(x=>x.max===b).length;ends.push({end:b,acc:ca,win:cw,...cellTest(ca,acc.length,cw,win.length)});}
 const groups=[
  {name:'01-02 → 24-25',fa:x=>x.min<=2&&x.max>=24},
  {name:'01 → 25',fa:x=>x.min===1&&x.max===25},
  {name:'01 → 24-25',fa:x=>x.min===1&&x.max>=24},
  {name:'01-02 → 25',fa:x=>x.min<=2&&x.max===25},
  {name:'03-06 → 25',fa:x=>x.min>=3&&x.max===25}
 ].map(g=>{const ca=acc.filter(g.fa).length,cw=win.filter(g.fa).length;return{name:g.name,acc:ca,win:cw,...cellTest(ca,acc.length,cw,win.length)};});
 res.setHeader('Cache-Control','no-store');res.status(200).json({ok:true,counts:{acc:acc.length,win:win.length,all:acc.length+win.length},matrixAcc:ma,matrixWin:mw,cells:bonf,starts,ends,groups});
}catch(e){res.status(500).json({ok:false,error:String(e&&e.stack||e)})}};