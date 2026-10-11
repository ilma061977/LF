#!/usr/bin/env node
/* LF V3.7.7 release gate: run from repository root (node scripts/verify-release.mjs). */
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read = p => fs.readFileSync(p,'utf8');
const html=read('index.html'),app=read('app.js'),matrix=read('matrix-51.js'),worker=read('analysis-worker.js');
const checks=[];
function check(label,fn){try{fn();checks.push(['OK',label]);}catch(e){checks.push(['FAIL',label,e.message]);process.exitCode=1;}}
function inline(marker){const start=html.indexOf(marker);assert(start>=0,marker+' missing');const end=html.indexOf('</script>',start);assert(end>start);return html.slice(start+marker.length,end).trim();}
check('One consolidated CSS block',()=>assert.equal((html.match(/<style(?:\s[^>]*)?>/g)||[]).length,1));
check('Meta build identifies #3800',()=>assert.match(html,/name="lf-build"[^>]+base3800/));
check('Matrix code matches embedded code',()=>assert.equal(inline('/* INLINE: matrix-51.js */'),matrix.trim()));
check('App code matches embedded code',()=>assert.equal(inline('/* INLINE: app.js */'),app.trim()));
check('Worker code matches embedded code',()=>{const found=html.match(/window\.__LF_OFFLINE_WORKER_SOURCE=("(?:\\.|[^"\\])*");/);assert(found);assert.equal(JSON.parse(found[1]),worker);});
check('Offline history includes #3800 as latest',()=>assert.match(html,/window\.__LF_OFFLINE_BASE=\{"ok":true[^\n]*"latest":\{"concurso":3800/));
check('CSV buttons and live bindings',()=>{for(const id of ['stats-export-csv','charts-export-csv','export-games'])assert(html.includes('id="'+id+'"'),id);for(const id of ['stats-export-csv','charts-export-csv'])assert(app.includes("$('#"+id+"')?.addEventListener('click',exportStatsSnapshotCSV)"),id);assert(app.includes("$('#export-games').onclick"),'export-games');});
check('Ranking 2.3 remains selectable',()=>{assert(app.includes("'ranking23'"));assert(worker.includes('ranking23'));});
check('F29 only mandatory',()=>assert(matrix.includes('MANDATORY_BLOCKS=new Set([29])')));
check('Responsive breakpoint for laptop and phone',()=>{assert(html.includes('max-width:1366px'));assert(html.includes('max-width:768px'));});
for(const row of checks)console.log(row.join(' | '));
if(process.exitCode)console.error('Static verification failed. Do not publish.');
else console.log('Static verification passed. Live browser clicks, screenshots, production deploy and ZIP identity remain separate gates.');
