const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
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
const app=appSource,worker=workerSource,index=indexSource;

assert.equal(pkg.version,'3.7.5','package.json deve estar em V3.7.5');
const meta=(indexSource.match(/<meta name="lf-build" content="([^"]+)"/)||[])[1];
assert.equal(meta,version.version,'meta lf-build e version.json devem coincidir');

// Auditoria de arquivos HTML auxiliares e links locais.
const rootDir=path.resolve(__dirname,'..');
const htmlFiles=fs.readdirSync(rootDir).filter(f=>f.endsWith('.html'));
for(const file of htmlFiles){
  const src=fs.readFileSync(path.join(rootDir,file),'utf8');
  if(file!=='index.html'){
    assert.equal(src.includes('ARQUIVO ÚNICO OFFLINE'),false,'Mensagem offline indevida em '+file);
    assert.equal(src.includes('id="standalone-help"'),false,'Aviso standalone indevido em '+file);
  }
  for(const m of src.matchAll(/href=["'](?:\.\/|\/)([^"'#?]+\.html)(?:[?#][^"']*)?["']/g)){
    assert.ok(fs.existsSync(path.join(rootDir,m[1])),'Link HTML quebrado em '+file+': '+m[1]);
  }
}
assert.equal(indexSource.includes('comparativo-solotofacil.html'),false,'Comparativo SoloToFácil deve permanecer fora do app');

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
assert.equal(indexSource.includes('ARQUIVO ÚNICO OFFLINE'),false,'Mensagem offline antiga deve ter sido removida');
assert.ok(indexSource.includes('OFFLINE LOCAL · base até #'),'Aviso offline deve explicar recursos locais e dependências online');
assert.equal((indexSource.match(/installVersionUpdateNotice\(\);/g)||[]).length,0,'Banner de atualização não deve ser instalado');

// Sincronização app inline x app externo.
const appMarker='/* INLINE: app.js */';
const s=indexSource.indexOf(appMarker);
const bodyStart=indexSource.indexOf('\n',s)+1;
const e=indexSource.indexOf('\n</script>',bodyStart);
assert.ok(s>=0&&e>bodyStart,'app.js inline não encontrado no index');
const inlineApp=indexSource.slice(bodyStart,e);
assert.equal(inlineApp.trimEnd(),appSource.trimEnd(),'index.html e app.js devem executar a mesma lógica');

// Sincronização Worker inline x Worker externo.
const workerMarker='window.__LF_OFFLINE_WORKER_SOURCE=';
const workerStart=indexSource.indexOf(workerMarker);
assert.ok(workerStart>=0,'Worker offline incorporado não encontrado');
let wp=workerStart+workerMarker.length,wq=wp+1,escaped=false;
for(;wq<indexSource.length;wq++){
  const ch=indexSource[wq];
  if(escaped){escaped=false;continue;}
  if(ch==='\\'){escaped=true;continue;}
  if(ch==='"')break;
}
const inlineWorker=JSON.parse(indexSource.slice(wp,wq+1));
assert.ok(inlineWorker.includes("type:'color-rank-done'"),'Worker offline incorporado deve manter o fluxo por cores');
assert.ok(workerSource.includes("searchMode=five?'targeted-random':'exhaustive'"),'Worker web deve usar busca aleatória direcionada nos 5 jogos por cores');

// Todas as tasks enviadas pelo app precisam existir no Worker.
const appTasks=[...new Set([...appSource.matchAll(/task:'([^']+)'/g)].map(m=>m[1]))];
for(const task of appTasks){
  const handled=workerSource.includes("d.task==='"+task+"'")||workerSource.includes("d.task === '"+task+"'")||workerSource.includes("case '"+task+"'")||workerSource.includes("task==='"+task+"'");
  assert.ok(handled,'Task enviada pelo app sem handler no Worker: '+task);
}

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
for(const label of ['Números ímpares','Números pares','Repetidas do anterior','Números na moldura','Números no miolo','Números primos','Múltiplos de 3','Números de Fibonacci','Soma das dezenas','Naipes · finais distintos','Maior sequência','Atrasadas','Números mágicos']){
  assert.ok(appSource.includes("label:'"+label+"'"),'Métrica ausente no Jogo Indicado: '+label);
}

// Jogo por Cores: padrão e final da cor.
assert.ok(indexSource.includes('GERAR 5 · FINAL DA COR'),'Botão GERAR Final da Cor ausente');
assert.ok(indexSource.includes('COMPLETAR 5 · FINAL DA COR'),'Botão COMPLETAR Final da Cor ausente');
assert.ok(indexSource.includes('>GERAR 5</button>'),'Botão GERAR padrão ausente');
assert.ok(indexSource.includes('>COMPLETAR 5</button>'),'Botão COMPLETAR padrão ausente');
assert.ok(appSource.includes("function completeColorAutoFive(){runColorRank('five');}"),'Handler COMPLETAR padrão ausente');
assert.ok(appSource.includes("function completeColorAutoTerminalFive(){runColorRank('five-terminal');}"),'Handler COMPLETAR Final da Cor ausente');
assert.ok(appSource.includes("function generateColorAutoFive(){if(colorRankWorker)"),'Handler GERAR padrão deve reiniciar a carteira');
assert.ok(appSource.includes("function generateColorAutoTerminalFive(){if(colorRankWorker)"),'Handler GERAR Final da Cor deve reiniciar a carteira');
assert.ok(appSource.includes("state.colorAutoGames=[];state.colorAutoRelax={1:[],2:[],3:[],4:[],5:[]};renderColorAutoFive();runColorRank('five');"),'GERAR padrão deve zerar a carteira antes da busca');
assert.ok(appSource.includes("state.colorAutoTerminalGames=[];state.colorAutoTerminalRelax={1:[],2:[],3:[],4:[],5:[]};renderColorAutoTerminalFive();runColorRank('five-terminal');"),'GERAR Final da Cor deve zerar a carteira antes da busca');
assert.equal(appSource.includes('GERAR / COMPLETAR 5'),false,'Textos antigos GERAR / COMPLETAR não devem permanecer no app');
assert.equal(indexSource.includes('GERAR / COMPLETAR 5'),false,'Textos antigos GERAR / COMPLETAR não devem permanecer no HTML');
assert.ok(workerSource.includes("d.mode==='five-terminal'"),'Worker não reconhece five-terminal');
assert.ok(workerSource.includes('terminalByColor'),'Worker não aplica terminal por cor');
assert.ok(workerSource.includes("type:'color-rank-done'"),'Worker não devolve color-rank-done');
assert.ok(workerSource.includes("attemptsPerColor"),'Worker web deve limitar a busca por cor em vez de varrer todo o universo');

// Busca exaustiva e F29 absoluto.
assert.ok(appSource.includes('function restartDecisionExhaustiveAfterMiss'),'Busca exaustiva sem reinício automático');
assert.ok(appSource.includes('const maxAttempts=3'),'Busca exaustiva deve limitar a 3 tentativas completas');
assert.ok(appSource.includes('currentAttempt>=maxAttempts'),'Após a terceira tentativa deve abrir diagnóstico');
assert.ok(appSource.includes('M.FILTERS.map'),'Diagnóstico deve listar os 51 filtros');
assert.ok(appSource.includes('As 3 tentativas completas terminaram sem formar um jogo válido de 15 dezenas'),'Fluxo adaptativo deve informar 3 tentativas completas');
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

assert.ok(appSource.includes('function verticalRange(startSelector,endSelector)'),'Verticais devem separar intervalo calculado da janela visual');
assert.ok(appSource.includes('displayRows=rows.slice(-30)'),'Verticais devem limitar apenas colunas visíveis a 30');
assert.equal(appSource.includes('if(rows.length>30){rows=rows.slice(-30)'),false,'Nenhuma Vertical pode cortar o intervalo antes do cálculo');
assert.ok(appSource.includes("label:'0%'"),'Faixa explícita de 0% deve existir');
assert.ok(appSource.includes('function cycleVerticalNumber(n)'),'Ciclo persistente deve ser compartilhado pelas quatro Verticais');
assert.equal(appSource.includes('cycleVertical4Number'),false,'Vertical 4 não deve manter ciclo exclusivo');
assert.ok(indexSource.includes('dynamic-nav-counts'),'Contadores laterais devem ser calculados automaticamente');
assert.equal(indexSource.includes('Esta página auxiliar faz parte da versão completa'),false,'Modo offline não deve bloquear links HTML auxiliares extraídos');
const schedule=require('../lib/lotofacil-schedule');
let sch=schedule.resolveExpectedSchedule({lastKnownContest:3795,lastKnownDate:'02/10/2026',expectedContest:3796});
assert.equal(sch.date,'2026-10-03','Concurso 3796 deve respeitar antecipação oficial de 03/10/2026');
sch=schedule.resolveExpectedSchedule({lastKnownContest:3796,lastKnownDate:'03/10/2026',expectedContest:3797});
assert.equal(sch.date,'2026-10-05','Após a antecipação, 04/10/2026 não pode ser tratado como novo sorteio');


assert(app.includes('function runGroupPatternScore('), 'método de score por composição ausente do app');
assert(worker.includes("task==='group-pattern-score'"), 'Worker não possui tarefa de score por composição');
assert(index.includes('id="group-pattern-score-result"'), 'painel de resultado por composição ausente');
assert(app.includes('estrutura primeiro; escolha das dezenas decidida pelo score do jogo completo'), 'regra corrigida da composição não está documentada no app');
assert(index.includes('data-page-panel="absentnext"'), 'aba 10 Ausentes Próximo ausente');
assert(index.includes('data-page="absentnext"'), 'menu da aba 10 Ausentes Próximo ausente');
assert(app.includes('function renderAbsentNext()'), 'renderer da aba 10 Ausentes Próximo ausente');
assert(app.includes('absentnext:renderAbsentNext'), 'roteamento da aba 10 Ausentes Próximo ausente');
assert(app.includes("['Probabilidade matemática','60,00%'") , 'probabilidade matemática de 60% não documentada');
assert(app.includes('function absentNextStat('), 'cálculo histórico de retorno após ausência ausente');

assert(index.includes('<option value="all" selected>Histórico completo</option>')&&index.includes('<option value="5">Últimos 5</option>')&&index.includes('<option value="10">Últimos 10</option>')&&index.includes('<option value="20">Últimos 20</option>')&&index.includes('<option value="score">Score combinado</option>'), '10 Ausentes: seletor Histórico/U5/U10/U20/Score ausente');
assert(app.includes("rankWindow==='score'?x.score:rankWindow==='20'?x.f20:rankWindow==='10'?x.f10:rankWindow==='5'?x.f5:x.all.rate"), '10 Ausentes: ordenação Score/U5/U10/U20 incorreta');
assert(app.includes("taxa histórica de retorno no concurso seguinte quando a dezena estava ausente"), '10 Ausentes: critério histórico não documentado');
assert(app.includes('delay10:delay10(n)'), '10 Ausentes: atraso limitado aos últimos 10 ausente');
assert(index.includes('Atraso · últimos 10'), '10 Ausentes: cabeçalho de atraso últimos 10 ausente');
assert(app.includes('function absentDelayReturnAnalysis('), 'análise de retorno por atraso ausente');
assert(index.includes('id="absentnext-delay-body"'), 'tabela de retorno por atraso ausente');
assert(index.includes('ATRASO 1 · 2 · 3 · 4 · 5 · 6 · 7 · 8 · 9 · 10+'), 'painel de atraso 1–10+ ausente');
assert(app.includes('function absentCurrentProfileAnalysis('), 'perfil atual exato das ausentes ausente');
assert(index.includes('id="absentnext-profile-current"'), 'painel perfil atual exato ausente');
assert(app.includes("function absentDelayBuckets(){return ['1','2','3','4','5','6','7','8','9','10+'];}"), 'faixas de atraso 1–9/10+ ausentes');
assert(app.includes('function absentScoreRows('), 'Score das 10 ausentes ausente');
assert(index.includes('id="absentnext-score-panel"'), 'painel Score das 10 ausentes ausente');
assert(index.includes('Histórico · 20%'), 'componentes do Score das ausentes não documentados');
assert(app.includes('(components.history+components.recent10+components.recent20+components.delay+components.profile)/5'), 'Score das ausentes não usa cinco componentes iguais');
assert(app.includes('Não é chance calculada'), 'Score das ausentes precisa declarar que não é probabilidade');
assert(app.includes('function absentWalkForwardBuild('), 'walk-forward das 10 ausentes ausente');
assert(index.includes('id="absentnext-wf-panel"'), 'painel walk-forward das ausentes ausente');
assert(app.includes('function optimizeAbsentWeights('), 'otimizador de pesos das ausentes ausente');
assert(index.includes('id="absentnext-optimize-weights"'), 'botão de otimização de pesos ausente');
assert(app.includes("stability=stableHigh===3&&stabilityAvg>=65?'Forte'"), 'estabilidade do Score ausente');
assert(app.includes("confidence=x.profileExact?"), 'confiança da amostra do Score ausente');
assert(index.includes('id="absentnext-profile-transition"'), 'transição de perfil das ausentes ausente');
assert(app.includes('nextProfiles'), 'cálculo da transição de perfil ausente');

assert(app.includes("['Últimos 100',all.slice(-100)]"), '10 Ausentes: backtest Últimos 100 ausente');
assert(app.includes("['Últimos 500',all.slice(-500)]"), '10 Ausentes: backtest Últimos 500 ausente');
assert(app.includes("['Últimos 1.000',all.slice(-1000)]"), '10 Ausentes: backtest Últimos 1.000 ausente');
assert(app.includes('random5=top10*5/10'), '10 Ausentes: acaso empírico Top 5 ausente');
assert(app.includes("INFORMATIVO · NÃO USAR NO NOVO INDICADO"), '10 Ausentes: trava informativa sem consistência ausente');
assert(index.includes('id="absentnext-wf-status"'), '10 Ausentes: status do walk-forward ausente');
assert(index.includes('id="absentnext-component-panel"'), 'painel de auditoria U5/U10 ausente');
assert(index.includes('<option value="5">Últimos 5</option>'), 'ordenação Últimos 5 ausente');
assert(app.includes('function renderAbsentComponentAudit()'), 'auditoria de componentes ausente do app');
assert(app.includes('recent5:recentPct(x.n,5)'), 'walk-forward não calcula janela U5');
assert(app.includes('function absentComboAnalysisData('), '10 Ausentes: análise de duplas/trincas/quadras ausente');
assert(app.includes('function renderAbsentComboAnalysis()'), '10 Ausentes: renderer de combinações ausente');
assert(index.includes('id="absentnext-combo-panel"'), '10 Ausentes: painel de combinações ausente');
assert(index.includes('Últimos 10 sem o atual'), '10 Ausentes: janela 10 sem concurso atual não documentada');
assert(app.includes('Math.sqrt(Math.max(0,f)*Math.max(0,d))'), '10 Ausentes: score briga frequência × atraso ausente');
assert(app.includes('renderAbsentComboAnalysis();'), '10 Ausentes: combinações não ligadas ao renderer principal');

assert.ok(indexSource.includes('class="page absentnext-page" data-page-panel="absentnext"'),'Ausentes Próximo deve usar layout dedicado');
assert.ok(indexSource.includes('id="absentnext-overview"'),'Resumo Agora das ausentes ausente');
assert.ok(indexSource.includes('data-absent-jump="absentnext-component-panel"'),'Atalhos da aba Ausentes Próximo ausentes');
assert.ok(indexSource.includes('id="absentnext-layout-v2"'),'CSS dedicado da aba Ausentes Próximo ausente');
assert.ok(appSource.includes("Top 5 · Score atual"),'Resumo Top 5 do Score ausente');
assert.ok(appSource.includes("Top 5 · Últimos 5"),'Resumo Top 5 U5 ausente');
assert.ok(appSource.includes("Top 5 · Últimos 10"),'Resumo Top 5 U10 ausente');
assert.ok(appSource.includes("Componente que mais ajuda · holdout"),'Resumo da auditoria de componentes ausente');

assert.ok(appSource.includes('function verticalLatestValidation('),'Validação cronológica das Verticais ausente');
assert.ok(appSource.includes('h.slice(Math.max(0,targetIndex-windowSize),targetIndex)'),'Validação Vertical deve calcular percentual sem incluir o sorteio-alvo');
assert.ok(appSource.includes('function verticalValidationCell('),'Célula de acerto/erro das Verticais ausente');
assert.ok(appSource.includes('✓ ACERTO'),'Marca visual de acerto das Verticais ausente');
assert.ok(appSource.includes('function vertical4PreviousValidationHTML('),'Validação da lista anterior da Vertical 4 ausente');
assert.ok((appSource.slice(appSource.indexOf('function renderVertical3()'),appSource.indexOf('function renderClosures()'))).includes('${verticalValidationCell(x.n)}'),'Vertical 3 sem célula individual de validação ✓/×');
assert.ok(indexSource.includes('id="vertical-validation-v1"'),'CSS da validação cronológica das Verticais ausente');

assert(app.includes('function absentVerticalCell('), 'marcação Ausente Próximo ausente das Verticais');
assert((app.match(/absentVerticalHeader\(\)/g)||[]).length>=5, 'cabeçalho Ausente Próximo não está nas quatro Verticais');
assert((app.match(/absentVerticalCell\(x\.n\)/g)||[]).length===4, 'Score das ausentes não está marcado exatamente nas quatro Verticais');
assert(index.includes('data-page-panel="absentnext"'), 'aba 10 Ausentes · Próximo ausente');
assert(index.includes('id="absentnext-combo-window"'), 'janela 5/10 das combinações ausentes ausente');

assert(app.includes("consistent=req.every(x=>x.n>0&&x.gain5>0)&&!!hold&&hold.n>0&&hold.gain5>0"), '10 Ausentes: holdout final não participa da aprovação do Top 5');
assert(index.indexOf('id="absentnext-component-panel"') < index.indexOf('id="absentnext-wf-panel"') && index.indexOf('id="absentnext-wf-panel"') < index.indexOf('id="absentnext-combo-panel"'), '10 Ausentes: ordem visual 5 Componentes → 6 Walk-forward → 7 Combinações incorreta');

assert(app.includes('function linecolsPatternStats('), 'estatística completa Linhas + Colunas ausente');
assert(app.includes('O walk-forward continua sem usar o concurso-alvo.'), 'texto de walk-forward Linhas + Colunas ausente');
assert(index.includes('id="linecols-combined-patterns"'), 'terceiro painel Linhas + Colunas ausente');
assert(index.includes('id="linecols-pattern-window"'), 'janelas 5/10/20/50/100/Todos ausentes em Linhas × Grades');

assert(app.includes('function linecolsPatternCatalog('), 'catálogo Linhas/Colunas/L+C ausente');
assert(app.includes('function renderLinecolsRankings()'), 'ranking frequentes/atrasados/raros ausente');
assert(app.includes('row.avgRepeat=intervals.length'), 'intervalo médio de repetição ausente');
assert(app.includes('row.minRepeat=intervals.length'), 'menor intervalo de repetição ausente');
assert(app.includes('row.maxRepeat=intervals.length'), 'maior intervalo de repetição ausente');
assert(app.includes("row.lastDate=row.dates.at(-1)||'—'"), 'data da última ocorrência ausente');
assert(index.includes('id="linecols-window-rankings"'), 'painel Top padrões por janela ausente');
assert(index.includes('id="linecols-rows-rankings"') && index.includes('id="linecols-cols-rankings"') && index.includes('id="linecols-combined-rankings"'), 'rankings Linhas/Colunas/L+C incompletos');
assert(index.includes('Menor intervalo') && index.includes('Maior intervalo'), 'colunas de repetição L+C ausentes');

assert(app.includes('function linecolsRepeatStatus('), 'posição descritiva do atraso ausente');
assert(app.includes('row.delayPercentile=intervals.length'), 'percentil descritivo do atraso não calculado');
assert(app.includes('function linecolsDisplayKey('), 'formato simplificado Linhas × Colunas ausente');
assert(app.includes('Estimativa descritiva:'), 'texto da estimativa descritiva ausente');
assert(index.includes('Média para repetir'), 'coluna Média para repetir ausente');
assert(index.includes('Estimativa descritiva'), 'coluna Estimativa descritiva ausente');
assert(!app.slice(app.indexOf('function linecolsRepeatStatus('),app.indexOf('function linecolsRepeatText(')).includes('FAIXA HISTÓRICA'), 'rótulo Faixa histórica ainda presente no status Linhas/Colunas');
assert(matrixSource.includes('unionMarginalGames:5560'), 'união EXA oficial 5.560 ausente da Matriz');
assert(workerSource.includes('unionMarginalGames:5560'), 'união EXA oficial 5.560 ausente do Worker');
assert(app.includes('União EXA oficial:'), 'painel não exibe união EXA oficial');
assert(app.includes("EXA-ORTHO-UNION5560-7ACTIVE-2026-10-07-v4"), 'schema dos 7 bloqueios EXA não atualizado');
console.log('AUDITORIA OK · V3.7.5 · '+history.length+' concursos · menu superior · offline isolado · Jogo Indicado · cores · F29/F36/F37 · Worker sincronizado.');
