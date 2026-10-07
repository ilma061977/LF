from pathlib import Path
p=Path('mega-app/index.html')
s=p.read_text(encoding='utf-8')
if 'Versão 1.16 · PESQUISA EXA-2 + DELTA' in s and 'page-exaresearch' in s:
    print('Mega v1.16 already applied')
    raise SystemExit(0)

def rep(a,b,count=1):
    global s
    if a not in s:
        raise RuntimeError('anchor missing: '+a[:140])
    s=s.replace(a,b,count)

s=s.replace('Mega Particular 1.15','Mega Particular 1.16')
s=s.replace('Versão 1.15 · QUARENTENA GEO/POS/HVD','Versão 1.16 · PESQUISA EXA-2 + DELTA')

css_anchor=".tag{font-size:12px;background:#edf3f3;padding:4px 8px;border-radius:5px;display:inline-block;margin:3px 4px 3px 0}"
css_extra=""".tag{font-size:12px;background:#edf3f3;padding:4px 8px;border-radius:5px;display:inline-block;margin:3px 4px 3px 0}.level-badge{display:inline-flex;align-items:center;border-radius:999px;padding:4px 9px;font-size:11px;font-weight:850;letter-spacing:.35px;border:1px solid #cbd8dc;background:#f5f8f8}.level-badge.oficial{background:#e6f6ec;border-color:#9fd0b4;color:#075f46}.level-badge.teste{background:#eaf2ff;border-color:#b5c9ed;color:#31568f}.level-badge.quarentena{background:#fff5d9;border-color:#e3c56d;color:#7b5a00}.level-badge.reprovado{background:#fbecef;border-color:#e3b7be;color:#9a2d39}.exa-family-tabs{display:flex;gap:8px;flex-wrap:wrap;margin:12px 0}.exa-family-tabs button.active{background:var(--green);color:#fff;border-color:var(--green)}.exa-card-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.exa-card{border:1px solid var(--line);border-radius:12px;padding:15px;background:#fbfdfc}.exa-card h3{margin:4px 0 8px}.exa-card .big{font-size:24px;font-weight:800;color:var(--green)}.exa-toggle{display:flex;align-items:center;gap:8px;margin-top:12px;font-weight:700}.research-table td,.research-table th{font-size:12px;vertical-align:top}.research-table code{font-size:11px;white-space:normal}.delta-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px}.delta-box{padding:14px;border:1px solid var(--line);border-radius:10px;background:#f8fbfa;text-align:center}.delta-box strong{display:block;font-size:24px}.mirror-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}@media(max-width:900px){.exa-card-grid,.mirror-grid{grid-template-columns:1fr}.delta-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}"""
rep(css_anchor,css_extra)

old_nav='<nav class="nav" aria-label="Menu principal"><button data-page="build" class="active"><small>01</small> Monte seu jogo</button><button data-page="rules"><small>02</small> Filtros e universo</button><button data-page="stats"><small>03</small> Estatísticas</button><button data-page="research"><small>04</small> Backtest / Teste retrospectivo</button><button data-page="virgins"><small>05</small> Escolher virgens</button><button data-page="batches"><small>06</small> Lotes de jogos</button><button data-page="closure"><small>07</small> Fechamentos</button><button data-page="saved"><small>08</small> Jogos salvos</button><button data-page="history"><small>09</small> Histórico</button><button data-page="data"><small>10</small> Base e backup</button></nav>'
new_nav='<nav class="nav" aria-label="Menu principal"><button data-page="build" class="active"><small>01</small> Monte seu jogo</button><button data-page="rules"><small>02</small> Filtros e universo</button><button data-page="stats"><small>03</small> Estatísticas</button><button data-page="research"><small>04</small> Backtest / Teste retrospectivo</button><button data-page="exaresearch"><small>05</small> Pesquisa EXA · Novos padrões</button><button data-page="delta"><small>06</small> DELTA / Espelhos</button><button data-page="virgins"><small>07</small> Escolher virgens</button><button data-page="batches"><small>08</small> Lotes de jogos</button><button data-page="closure"><small>09</small> Fechamentos</button><button data-page="saved"><small>10</small> Jogos salvos</button><button data-page="history"><small>11</small> Histórico</button><button data-page="data"><small>12</small> Base e backup</button></nav>'
rep(old_nav,new_nav)

pages='''<section class="page" id="page-exaresearch" hidden>
<article class="panel"><div class="section-head"><div><div class="eyebrow">PESQUISA EXA · NOVOS PADRÕES</div><h2>DLT · ESP · SIG · AFF-X</h2></div><span class="tag">3.600 hipóteses auditadas</span></div>
<p class="muted">A tabela abaixo contém as <b>609 regras que chegaram à enumeração exata</b> depois da triagem. As 3.600 hipóteses entram no controle Bonferroni/FDR. A descoberta usa 1–3066; o concurso 3067 aparece separado como teste futuro e não foi usado para ajustar as regras.</p>
<div class="metrics"><div class="metric"><strong>5,287325%</strong><span>bloqueio-base antes da EXA-2</span></div><div class="metric"><strong>424</strong><span>regras com ≥500 marginais</span></div><div class="metric"><strong>131</strong><span>regras com ≥10.000 marginais</span></div><div class="metric"><strong>0</strong><span>passaram Bonferroni/FDR</span></div></div>
<div class="notice"><b>Níveis:</b> <span class="level-badge oficial">OFICIAL</span> <span class="level-badge teste">TESTE</span> <span class="level-badge quarentena">QUARENTENA</span> <span class="level-badge reprovado">REPROVADO</span>. Nesta rodada, nenhum filtro foi promovido a oficial.</div></article>
<article class="panel"><div class="section-head"><div><h2>QUARENTENA EXA-2</h2><p class="muted">Desligados por padrão. Ative individualmente para testar no gerador/contador. A ativação não altera o status metodológico.</p></div><span class="level-badge quarentena">QUARENTENA</span></div>
<div class="exa-card-grid">
<div class="exa-card"><span class="level-badge quarentena">QUARENTENA</span><h3>SIG-589</h3><div class="big">+50.466</div><p class="muted">0 ocorrências · assinatura de paridade posicional 58 + soma 120–139 + 4 décadas ocupadas.</p><label class="exa-toggle"><input type="checkbox" data-exa2-toggle="qexa2_0"> Ativar bloqueio</label><p class="muted">Motivo de não promoção: não passou Bonferroni/FDR após 3.600 hipóteses.</p></div>
<div class="exa-card"><span class="level-badge quarentena">QUARENTENA</span><h3>DLT-321</h3><div class="big">+33.981</div><p class="muted">0 ocorrências · Δ2+Δ5 ≥36 + Δ1 é o menor gap + 3+ gaps ≥12.</p><label class="exa-toggle"><input type="checkbox" data-exa2-toggle="qexa2_1"> Ativar bloqueio</label><p class="muted">Motivo de não promoção: não passou Bonferroni/FDR após 3.600 hipóteses.</p></div>
<div class="exa-card"><span class="level-badge quarentena">QUARENTENA</span><h3>ESP-503</h3><div class="big">+28.402</div><p class="muted">0 ocorrências · seis colunas diferentes + 2+ pares espelho decimal.</p><label class="exa-toggle"><input type="checkbox" data-exa2-toggle="qexa2_2"> Ativar bloqueio</label><p class="muted">Motivo de não promoção: não passou Bonferroni/FDR após 3.600 hipóteses.</p></div>
</div>
<div class="notice warn" style="margin-top:14px"><b>ESP-682 · candidato forte em observação:</b> +101.624 jogos marginais; 1 ocorrência histórica; módulo 5 máximo 2 + amplitude ≥55 + 2+ palíndromas. <b>Não é ativável nesta versão</b> e permanece abaixo da quarentena principal.</div>
</article>
<article class="panel"><div class="section-head"><div><h2>Validação futura</h2><p class="muted">As regras ficam congeladas. Novos concursos apenas acrescentam ✓/✕; não recalibram a definição.</p></div></div>
<div class="table-wrap"><table><thead><tr><th>Regra</th><th>3067</th><th>3068</th><th>3069</th><th>3070</th><th>Status</th></tr></thead><tbody>
<tr><td><b>SIG-589</b></td><td>✓</td><td>?</td><td>?</td><td>?</td><td><span class="level-badge quarentena">QUARENTENA</span></td></tr>
<tr><td><b>DLT-321</b></td><td>✓</td><td>?</td><td>?</td><td>?</td><td><span class="level-badge quarentena">QUARENTENA</span></td></tr>
<tr><td><b>ESP-503</b></td><td>✓</td><td>?</td><td>?</td><td>?</td><td><span class="level-badge quarentena">QUARENTENA</span></td></tr>
<tr><td><b>ESP-682</b></td><td>✓</td><td>?</td><td>?</td><td>?</td><td><span class="level-badge reprovado">REPROVADO</span></td></tr>
</tbody></table></div></article>
<article class="panel"><div class="section-head"><div><h2>Regras enumeradas exatamente</h2><p class="muted">Use os grupos abaixo para filtrar. “Universo” = combinações da regra nas 50.063.860; “Marginal” = jogos novos bloqueados depois dos atuais 5,287325%.</p></div><label class="field" style="min-width:240px">Buscar regra<input id="exa-rule-search" type="search" placeholder="ex.: SIG-589 ou mirror"></label></div>
<div class="exa-family-tabs"><button class="btn active" data-exa-family="DLT">DLT</button><button class="btn" data-exa-family="ESP">ESP</button><button class="btn" data-exa-family="SIG">SIG</button><button class="btn" data-exa-family="AFF-X">AFF-X</button></div>
<div id="exa-family-summary" class="muted"></div><div id="exa-research-table" style="margin-top:12px"></div>
<div class="toolbar" style="margin-top:14px"><button class="btn" id="exa-prev">Anterior</button><span id="exa-page-note" class="muted"></span><button class="btn" id="exa-next">Próxima</button></div></article>
<article class="panel"><div class="section-head"><div><h2>AFF-X · somente analítico</h2><p class="muted">Coocorrências são comparadas à frequência matemática esperada. Não entram como bloqueio nesta rodada.</p></div><span class="level-badge reprovado">ANAL㍌ICO</span></div><div id="affx-analytics"></div></article>
</section>
<section class="page" id="page-delta" hidden>
<article class="panel"><div class="section-head"><div><div class="eyebrow">DELTA</div><h2>Δ1 · Δ2 · Δ3 · Δ4 · Δ5</h2></div><button class="btn" id="delta-use-last">Usar último concurso</button></div><p class="muted">Usa as 6 dezenas atualmente montadas; se não houver seis, usa o último concurso carregado.</p><div id="delta-current"></div></article>
<article class="panel"><h2>Espelhos separados</h2><p class="muted">Três conceitos independentes, para evitar misturar regras diferentes.</p><div id="mirror-current"></div></article>
</section>
'''
rep('<section class="page" id="page-saved" hidden>',pages+'<section class="page" id="page-saved" hidden>')

# external data file
rep("<script>\\n'use strict';", '<script src="exa2-data.js"></script>\\n<script>\\n\\'use strict\\';')

qfun="function exaQuarantineFlags(g){const rows=Array(6).fill(0);let top=0,H=0,V=0,D=0;for(const n of g){const r=Math.floor((n-1)/10),c=(n-1)%10;rows[r]++;top+=Number(r<3)}const sig=rows.filter(Boolean).sort((a,b)=>b-a).join('-');for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){const ri=Math.floor((g[i]-1)/10),ci=(g[i]-1)%10,rj=Math.floor((g[j]-1)/10),cj=(g[j]-1)%10,dr=Math.abs(ri-rj),dc=Math.abs(ci-cj);if(dr===0&&dc===1)H++;else if(dr===1&&dc===0)V++;else if(dr===1&&dc===1)D++}return [top>=5&&sig==='3-3',g[0]>=20&&g[3]<=28,D>=4&&(H+V+D)>=5]}"
exa2fun="""function exa2Flags(g){g=[...g].sort((a,b)=>a-b);const d=g.slice(1).map((n,i)=>n-g[i]),dmin=Math.min(...d),mod5=Array(5).fill(0),cols=Array(10).fill(0);let evpos=0,mirror=0;for(let i=0;i<6;i++){const n=g[i];if(n%2===0)evpos|=(1<<i);mod5[n%5]++;cols[(n-1)%10]++}const set=new Set(g);for(const n of g){const rev=Number(String(n).padStart(2,'0').split('').reverse().join(''));if(rev!==n&&set.has(rev)&&n<rev)mirror++}const sumbin=Math.floor(g.reduce((a,b)=>a+b,0)/20),occdec=new Set(g.map(n=>Math.floor((n-1)/10))).size,colsig=cols.filter(Boolean).sort((a,b)=>b-a).join('-');return [evpos===58&&sumbin===6&&occdec===4,(d[1]+d[4])>=36&&d[0]===dmin&&d.filter(x=>x>=12).length>=3,colsig==='1-1-1-1-1-1'&&mirror>=2]}"""
rep(qfun,qfun+\\n'+exa2fun)
rep("if(d.type==='exaQuarantine')return Number(exaQuarantineFlags(g)[d.rule]);if(d.type==='history5')","if(d.type==='exaQuarantine')return Number(exaQuarantineFlags(g)[d.rule]);if(d.type==='exa2')return Number(exa2Flags(g)[d.rule]);if(d.type==='history5')")

def_anchor="EXA_QUARANTINE_LABELS.forEach((label,i)=>FILTER_DEFS.push({id:'qexa_'+i,label,type:'exaQuarantine',rule:i,max:1,category:'Quarentena experimental Exa · GEO/POS/HVD',desc:i===0?'GEO: padrão geométrico. Histórico 1–3066: 0 ocorrências; marginal exato +30.829; sobreviveu ao concurso futuro 3067.':i===1?'POS: posições ordenadas. Histórico 1–3066: 0 ocorrências; marginal exato +54.661; sobreviveu ao concurso futuro 3067.':'HVD: adjacências horizontal/vertical/diagonal. Histórico 1–3066: 0 ocorrências; marginal exato +46.344; sobreviveu ao concurso futuro 3067.'}));"
defs2="""const EXA2_LABELS=['SIG-589 · assinatura paridade/soma/décadas','DLT-321 · delta posicional extremo','ESP-503 · seis colunas + espelhos'];const EXA2_DESCS=['0 ocorrências em 1–3066; +50.466 marginais; 3067 ✓ desligado por padrão; não passou Bonferroni/FDR.','0 ocorrências em 1–3066; +33.981 marginais; 3067 ✓; desligado por padrão ; não passou Bonferroni/FDR.','0 ocorrências em 1–3066; +28.402 marginais; 3067 ✓; desligado por padrão ; não passou Bonferroni/FDR.'];EXA2_LABELS.forEach((label,i)=>FILTER_DEFS.push({id:'qexa2_'+i,label,type:'exa2',rule:i,max:1,category:'Quarentena EXA-2 · DLT/ESP/SIG',desc:EXA2_DESCS[i]}));"""
rep(def_anchor,def_anchor+'\\n'+defs2)
rep("...[[...Array(3)].map((_,i)=>['qexa_'+i,{enabled:true,min:0,max:0}]),['history5',{enabled:true(, min:0,max:0}]]","...[[...Array(3)].map((_,i)=>['qexa_'+i,{enabled:true,min:0,max:0}]),...[[...Array(3)].map((_,i)=>['qexa2_'+i,{enabled:false,min:0,max:0}]),['history5',{enabled:true,min:0,max:0}]]")
rep("d.type==='exaQuarantine')?0:d.max","d.type==='exaQuarantine'||d.type==='exa2')?0:d.max")

group_anchor="{label:'QUARENTENA EXPERIMENTAL · EXA',hint:'GEO-X1 + POS-X1 + HVD-X1 ativos em quarentena. Base 3067: +131.744 bloqueios marginais; união total 5,287325%. Não são oficiais.',cats:['Quarentena experimental Exa · GEO/POS/HVD']},"
rep(group_anchor,group_anchor+"\\n{label:'QUARENTENA EXA-2',hint:'SIG-589 + DLT-321 + ESP-503 desligados por padrão ; controles independentes para teste.',cats:['Quarentena EXA-2 · DLT/ESP/SIG']},")
rep("+exaQuarantineFlags.toString()+'\\\\n'+advancedValue.toString()","+exaQuarantineFlags.toString()+'\\\\n'+exa2Flags.toString()+'\\\\\n'+advancedValue.toString()")

names="const names={virgins:'Escolher quinas e senas virgens',batches:'Lotes de jogos',closure:'Fechamentos verificados',build:'Monte seu jogo',rules:'Filtros e universo',stats:'Estatíísticas',research:'Backtest / Teste retrospectivo',saved:'Jogos salvos',history:'Histórico',data:'Base e backup'};"
rep(names,"const names={virgins:'Escolher quinas e senas virgens',wbatches:'Lotes de jogos',closure:'Fechamentos verificados',build:'Monte seu jogo',rules:'Filtros e universo',stats:'Estatísticas',research:'Backtest / Teste retrospectivo',exaresearch:'Pesquisa EXA · Novos padrões',delta:'DELTA / Espelhos',saved:'Jogos salvos',history:'Histórico',data:'Base e backup'};")
