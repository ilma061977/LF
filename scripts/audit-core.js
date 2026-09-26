const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const pkg=require('../package.json');
const base=require('../data/lotofacil-base.json');
const version=require('../version.json');

const sandbox={window:{}};
vm.runInNewContext(fs.readFileSync(require.resolve('../matrix-51.js'),'utf8'),sandbox);
const M=sandbox.window.LFMatrix51;
const history=base.history;
const appSource=fs.readFileSync(require.resolve('../app.js'),'utf8');
const workerSource=fs.readFileSync(require.resolve('../analysis-worker.js'),'utf8');
const matrixSource=fs.readFileSync(require.resolve('../matrix-51.js'),'utf8');
const indexSource=fs.readFileSync(require.resolve('../index.html'),'utf8');

assert.equal(pkg.version,'3.7.5','package.json deve estar em V3.7.5');
const meta=(indexSource.match(/<meta name="lf-build" content="([^"]+)"/)||[])[1];
assert.equal(meta,version.version,'meta lf-build e version.json devem coincidir');

// Menu superior atual.
for(const label of ['Home','Análises','Tabelas','Tendências','Estatísticas','Combinações','Simulações','Mais Sorteadas','Mais']){
  assert.ok(indexSource.includes('<summary>'+label+' <span>⌄</span></summary>'),'Categoria superior ausente: '+label);
}
assert.ok(indexSource.includes('id="lf-top-menu"'),'Menu superior principal ausente');
assert.ok(indexSource.includes('.sidebar-v2{display:none!important}'),'Barra lateral antiga deve ficar oculta na versão superior');

// Modo offline só em file://.
assert.equal((indexSource.match(/<div id="standalone-help"/g)||[]).length,0,'Aviso offline não pode existir estaticamente no HTML da Vercel');
assert.ok(indexSource.includes("const isOffline = location.protocol === 'file:'"),'Modo offline deve depender de file://');
assert.ok(indexSource.includes("if(!isOffline){"),'Bootstrap deve separar explicitamente modo web e file://');
assert.ok(indexSource.includes("help.textContent='ARQUIVO ÚNICO OFFLINE"),'Aviso offline deve ser criado somente pelo bootstrap local');
assert.equal((indexSource.match(/installVersionUpdateNotice\(\);/g)||[]).length,0,'Banner de atualização não deve ser instalado');

// Sincronização app inline x app externo.
const appMarker='/* INLINE: app.js */';
const s=indexSource.indexOf(appMarker);
const bodyStart=indexSource.indexOf('\n',s)+1;
const e=indexSource.indexOf('\n</script>',bodyStart);
assert.ok(s>=0&&e>bodyStart,'app.js inline não encontrado no index');
const inlineApp=indexSource.slice(bodyStart,e);
assert.equal(inlineApp.trimEnd(),appSource.trimEnd(),'index.html e app.js devem executar a mesma lógica');

// Estrutura HTML crítica sem IDs duplicados.
const ids=[...indexSource.matchAll(/\sid="([^"]+)"/g)].map(m=>m[1]);
const seen=new Set();
for(const id of ids){assert.ok(!seen.has(id),'ID HTML duplicado: '+id);seen.add(id);}
for(const id of ['decision-board','decision-metrics','decision-generate','color-choice-auto-generate-5','color-choice-auto-5','color-choice-auto-terminal-generate-5','color-choice-auto-terminal-5','color-choice-auto-reset','color-choice-auto-terminal-reset','run-self-test','run-filter-audit','refresh-data']){
  assert.ok(seen.has(id),'Controle crítico ausente: '+id);
}

// Novo painel do Jogo Indicado.
assert.ok(indexSource.includes('<h2>Análise do resultado</h2>'),'Novo painel Análise do resultado ausente');
assert.ok(appSource.includes('function renderDecisionAnalysisList'),'Renderer da análise detalhada ausente');
assert.ok(appSource.includes('renderDecisionAnalysisList(rep,m)'),'Renderer detalhado não está sendo chamado');
assert.ok(appSource.includes("label:'Números mágicos'"),'Análise adicional Números mágicos ausente');

// Jogo por Cores: padrão e final da cor.
assert.ok(indexSource.includes('GERAR 5 · FINAL DA COR'),'Botão GERAR Final da Cor ausente');
assert.ok(indexSource.includes('COMPLETAR 5 · FINAL DA COR'),'Botão COMPLETAR Final da Cor ausente');
assert.ok(indexSource.includes('>GERAR 5</button>'),'Botão GERAR padrão ausente');
assert.ok(indexSource.includes('>COMPLETAR 5</button>'),'Botão COMPLETAR padrão ausente');
assert.ok(appSource.includes("function completeColorAutoFive(){runColorRank('five');}"),'Handler COMPLETAR padrão ausente');
assert.ok(appSource.includes("function completeColorAutoTerminalFive(){runColorRank('five-terminal');}"),'Handler COMPLETAR Final da Cor ausente');
assert.ok(appSource.includes("function generateColorAutoFive(){if(colorRankWorker)"),'Handler GERAR padrão deve reiniciar a carteira');
assert.ok(appSource.includes("function generateColorAutoTerminalFive(){if(colorRankWorker)"),'Handler GERAR Final da Cor deve reiniciar a carteira');
assert.ok(workerSource.includes("d.mode==='five-terminal'"),'Worker não reconhece five-terminal');
assert.ok(workerSource.includes('terminalByColor'),'Worker não aplica terminal por cor');
assert.ok(workerSource.includes("type:'color-rank-done'"),'Worker não devolve color-rank-done');

// Busca exaustiva e F29 absoluto.
assert.ok(appSource.includes('function restartDecisionExhaustiveAfterMiss'),'Busca exaustiva sem reinício automático');
assert.ok(appSource.includes('const maxAttempts=5'),'Busca exaustiva deve limitar a 5 tentativas');
assert.ok(appSource.includes('currentAttempt>=maxAttempts'),'Após quinta tentativa deve abrir diagnóstico');
assert.ok(appSource.includes('M.FILTERS.map'),'Diagnóstico deve listar os 51 filtros');
assert.ok(appSource.includes('F29 é permanente'),'Painel deve informar F29 permanente');
assert.ok(appSource.includes("state.filterPolicies[29]='block'"),'F29 deve permanecer BLOQUEAR no app');
assert.ok(workerSource.includes("Number(f.id)===29?'block'"),'Worker deve manter F29 absoluto');
assert.ok(matrixSource.includes("Number(f.id)===29?'block'"),'Matriz deve manter F29 absoluto');
assert.ok((appSource.match(/restartDecisionExhaustiveAfterMiss\(d\.diagnostics\|\|null\)/g)||[]).length>=2,'Caminhos sem jogo devem reiniciar a busca');

// Base histórica.
assert.equal(history.length,base.baseValidation.loadedCount,'Contagem da base divergente');
assert.equal(base.latest.concurso,history.at(-1).concurso,'Latest divergente do histórico');
for(let i=0;i<history.length;i++){
  const row=history[i];
  assert.equal(row.concurso,i+1,'Lacuna/ordem inválida no concurso '+(i+1));
  assert.equal(row.dezenas.length,15,'Concurso sem 15 dezenas: '+row.concurso);
  assert.equal(new Set(row.dezenas).size,15,'Dezenas duplicadas no concurso '+row.concurso);
  assert.ok(row.dezenas.every(n=>Number.isInteger(n)&&n>=1&&n<=25),'Dezena inválida no concurso '+row.concurso);
}

// Regras estruturais de cores.
const colorFree0=M.mandatoryColorRule([1,11,2,12,3,13,4,14,5,15,6,7,8,9,10]);
const colorFree1=M.mandatoryColorRule([1,11,21,2,12,3,13,4,14,5,15,6,7,8,9]);
const colorFree3=M.mandatoryColorRule([1,11,21,2,12,22,3,13,23,4,5,6,7,8,9]);
assert.equal(colorFree0.complete,0);
assert.equal(colorFree1.complete,1);
assert.equal(colorFree3.complete,3);
assert.ok(colorFree0.passed&&colorFree1.passed&&colorFree3.passed,'Jogo Indicado deve aceitar 0/1/3 cores completas com 8–10 cores');

// F29, F36, F37 e Linha/Coluna.
const ctx=M.buildContext(history),last=history.at(-1).dezenas;
const inspect=game=>M.inspect(game,ctx);
const filter=(report,id)=>report.filters.find(f=>f.id===id);
const exact=inspect(last);
assert.equal(filter(exact,29).passed,false,'F29 deve bloquear histórico 15/15');
assert.equal(filter(exact,37).passed,false,'F37 deve bloquear histórico 15/15');
assert.equal(filter(exact,36).passed,false,'F36 deve detectar 3+ anomalias neste caso');
assert.equal(exact.lineRepeat.blocked,true,'Linha idêntica ao último deve bloquear');
assert.equal(exact.columnRepeat.blocked,true,'Coluna idêntica ao último deve bloquear');
const replacement=Array.from({length:25},(_,i)=>i+1).find(n=>!last.includes(n));
const near=[...last.slice(0,14),replacement].sort((a,b)=>a-b);
assert.equal(filter(inspect(near),37).passed,false,'F37 deve bloquear 14/15 histórico');
const fewColors=[1,11,21,2,12,22,3,13,23,4,14,24,5,15,25];
assert.equal(inspect(fewColors).colorRule.blocked,true,'Menos de 8 cores distintas deve bloquear');
for(const id of [28,29,36,37])assert.ok(filter(exact,id),'Filtro obrigatório ausente F'+id);

assert.equal(M.AUDIT_BASE_THROUGH,history.at(-1).concurso,'AUDIT_BASE_THROUGH deve acompanhar a base');
console.log('AUDITORIA OK · V3.7.5 · '+history.length+' concursos · menu superior · offline isolado · Jogo Indicado · cores · F29/F36/F37 · Worker sincronizado.');
