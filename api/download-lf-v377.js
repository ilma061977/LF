'use strict';
const zlib=require('zlib');
const REF='dfbd5e41b81bbef90697ed053c5198794a5b3ad0';
const OWNER='ilma061977',REPO='LF';
const ROOT='LF-Inteligente-V3.7.7-Base3800-Ranking23-Premium2/';
const PATHS=[".github/mega_v114_patch.py",".github/mega_v115_patch.py",".github/mega_v116_finalize.py",".github/mega_v116_patch.py",".github/mega_v116_patch.py.gz.b64",".github/workflows/audit-v375.yml",".github/workflows/audit.yml",".github/workflows/exa-union7-audit.yml",".github/workflows/package-lf-production.yml",".github/workflows/package-mega-published.yml",".github/workflows/publish-mega-v116.yml",".github/workflows/sync-lf-offline.yml",".github/workflows/update-mega-v114.yml",".github/workflows/update-mega-v115.yml",".github/workflows/update-mega-v116.yml",".lf-operational-mode.json",".lf-release-trigger","LEIA-ME-3795.txt","PESQUISA-SEM-DEPLOY.md","README.md","RELEASE-LF-EXA-ORTHO.txt","RELEASE-LF-M51-EXA-ORGANIZADA.txt","RELEASE-LF-V377-BASE3800-R23-PREMIUM2.txt","analysis-worker.js","api/benchmark-integral/chunk.js","api/lotofacil-no-winner-profile.js","api/lotofacil-ordem.js","api/lotofacil-premios.js","api/lotofacil.js","api/no-winner-score-profile.js","api/one-winner-profile.js","api/self-test.js","api/version.js","app.js","ball-colors.js","data/audit-all-core-mandatory-true-walk-forward-2026-10-09.json","data/exa-ortho-status-2026-10-07.json","data/exa-research-4fronts-2026-10-08.json","data/exa-research-brecha-ordem-extracao-2026-10-09.json","data/exa-research-distinct-pairs-and-c79-c83-2026-10-08.json","data/exa-research-f78-f83-moldura-miolo-paridade-2026-10-08.json","data/exa-research-f84-f86-morph2-spec2-2026-10-09.json","data/exa-research-independent-quadruples-2026-10-08.json","data/exa-research-independent-triples-2026-10-08.json","data/exa-research-morph-spec-2026-10-09.json","data/exa-research-ordem-extracao-full-1-3800-2026-10-09.json","data/exa-research-q01-q15-true-rolling-walk-forward-2026-10-08.json","data/exa-research-regime-fisico-equipamento-2026-10-09.json","data/group-affinity-618-exact-rolling.json","data/group-affinity-618-matrix-holdout.json","data/group-affinity-bonus-current-sample.json","data/group-affinity-bonus-holdout.json","data/group-affinity-cross-cv.json","data/group-affinity-model.json","data/group-affinity-new-robust4.json","data/group-affinity-new-rolling-cv.json","data/group-affinity-new-search.json","data/lotofacil-base.json","data/lotofacil-ordem-extracao-1-3800.json","data/postmortem-lotofacil-3800-2026-10-09.json","data/ranking2-experimental-backtest-2026-10-09.json","data/ranking2.1-diversidade-walk-forward-2026-10-09.json","data/ranking21-portfolio-walk-forward-2026-10-09.json","data/ranking22-transition-walk-forward-2026-10-10.json","data/ranking22b-pair-transitions-walk-forward-2026-10-10.json","data/ranking22c-entry-groups-walk-forward-2026-10-10.json","data/ranking22d-composite-walk-forward-2026-10-10.json","data/ranking22e-conservative-stay-prereg-2026-10-10.json","data/ranking23-portfolio-optimizer-2026-10-10.json","data/recount-demote-20-hard-blockers-2026-10-09.json","data/recount-zero-failure-only-2026-10-09.json","estatisticas-plus.html","estatisticas-pro.html","evolucoes-21-29.html","evolucoes-30-37.html","evolucoes.html","exa-cross.html","global-search.js","historico-avancado.html","index.html","indicator-emojis.js","inteligencia.html","lib/lotofacil-live.js","lib/lotofacil-schedule.js","main.js","manual.html","matrix-51.js","matrix-exa-organized.js","operacoes.html","package.json","preview-color.html","preview-main.js","release-lf-20261008.txt","scripts/audit-core.js","scripts/exa-union7-audit.js","ui-shell.js","vercel.json","version.json"];
let crcTable=null;
function table(){if(crcTable)return crcTable;crcTable=Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=(c&1)?0xEDB88320^(c>>>1):c>>>1;return c>>>0;});return crcTable;}
function crc32(buf){const t=table();let c=0xFFFFFFFF;for(const b of buf)c=t[(c^b)&255]^(c>>>8);return(c^0xFFFFFFFF)>>>0;}
function dosDateTime(){const y=2026,m=10,d=10,h=20,min=30,sec=0;return{date:((y-1980)<<9)|(m<<5)|d,time:(h<<11)|(min<<5)|(sec>>1)};}
async function getFile(path){
  const u='https://raw.githubusercontent.com/'+OWNER+'/'+REPO+'/'+REF+'/'+path.split('/').map(encodeURIComponent).join('/');
  const r=await fetch(u,{headers:{'user-agent':'LF-Inteligente-V3.7.7'}});
  if(!r.ok)throw new Error('Falha '+r.status+' ao baixar '+path);
  return Buffer.from(await r.arrayBuffer());
}
async function fetchAll(){
  const out=[];const batch=16;
  for(let i=0;i<PATHS.length;i+=batch){
    const slice=PATHS.slice(i,i+batch);
    const got=await Promise.all(slice.map(async p=>[p,await getFile(p)]));
    out.push(...got);
  }
  return out;
}
function buildZip(files){
  const locals=[],centrals=[];let offset=0;const dt=dosDateTime();
  for(const [path,data] of files){
    const name=Buffer.from(ROOT+path,'utf8'),crc=crc32(data),compressed=zlib.deflateRawSync(data,{level:6});
    const lh=Buffer.alloc(30);
    lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt16LE(8,8);
    lh.writeUInt16LE(dt.time,10);lh.writeUInt16LE(dt.date,12);lh.writeUInt32LE(crc,14);
    lh.writeUInt32LE(compressed.length,18);lh.writeUInt32LE(data.length,22);lh.writeUInt16LE(name.length,26);lh.writeUInt16LE(0,28);
    locals.push(lh,name,compressed);
    const ch=Buffer.alloc(46);
    ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt16LE(8,10);
    ch.writeUInt16LE(dt.time,12);ch.writeUInt16LE(dt.date,14);ch.writeUInt32LE(crc,16);
    ch.writeUInt32LE(compressed.length,20);ch.writeUInt32LE(data.length,24);ch.writeUInt16LE(name.length,28);
    ch.writeUInt16LE(0,30);ch.writeUInt16LE(0,32);ch.writeUInt16LE(0,34);ch.writeUInt16LE(0,36);ch.writeUInt32LE(0,38);ch.writeUInt32LE(offset,42);
    centrals.push(ch,name);offset+=lh.length+name.length+compressed.length;
  }
  const central=Buffer.concat(centrals),end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(0,4);end.writeUInt16LE(0,6);
  end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(central.length,12);end.writeUInt32LE(offset,16);end.writeUInt16LE(0,20);
  return Buffer.concat([...locals,central,end]);
}
module.exports=async function handler(req,res){
  if(req.method!=='GET'&&req.method!=='HEAD'){res.statusCode=405;res.setHeader('Allow','GET, HEAD');return res.end('Method Not Allowed');}
  try{
    const files=await fetchAll(),zip=buildZip(files),name='LF-Inteligente-V3.7.7-Base3800-Ranking23-Premium2-COMPLETO.zip';
    res.statusCode=200;res.setHeader('Content-Type','application/zip');res.setHeader('Content-Disposition','attachment; filename="'+name+'"');
    res.setHeader('Content-Length',String(zip.length));res.setHeader('Cache-Control','public, max-age=86400, immutable');
    res.setHeader('X-LF-Source-Commit',REF);res.setHeader('X-LF-File-Count',String(files.length));
    if(req.method==='HEAD')return res.end();return res.end(zip);
  }catch(e){res.statusCode=500;res.setHeader('Content-Type','application/json; charset=utf-8');return res.end(JSON.stringify({ok:false,error:String(e&&e.message||e)}));}
};
