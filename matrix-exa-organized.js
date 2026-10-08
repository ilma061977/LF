(() => {
  'use strict';
  const UNIVERSE=3268760, BEFORE=698339, EXA=15872, APPROVED=682467, BLOCKED=2586293;
  const BLOCKED_PCT=79.1215323241841, APPROVED_PCT=20.878467675815905, RATIO=4.789623527584484;
  const ACTIVE=['EXA-TOPO-01','EXA-TOPO-02','EXA-DIR-01','EXA-BITQ-01','EXA-SYM-01','EXA-DIST-01','EXA-SHAPE-01','EXA-SHAPE-02','EXA-SHAPE-03','EXA-SHAPE-04','EXA-SHAPE-05','EXA-SHAPE-06','EXA-TEMP-01','EXA-TEMP-02','EXA-TEMP-03','EXA-TEMP-04'];
  const fmt=n=>Number(n).toLocaleString('pt-BR');
  const pct=n=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:6,maximumFractionDigits:6})+'%';
  function card(title,badge,body,cls='is-active') { return `<article class="matrix-external-card ${cls}"><header><b>${title}</b><span class="matrix-external-badge">${badge}</span></header><p>${body}</p></article>`; }

  const EXA_NUMBERING=Object.freeze({
    'EXA-TOPO-01':52,
    'EXA-TOPO-02':53,
    'EXA-DEG-01':54,
    'EXA-DIR-01':55,
    'EXA-BITQ-01':56,
    'EXA-SYM-01':57,
    'EXA-DIST-01':58,
    'EXA-SHAPE-01':59,
    'EXA-SHAPE-02':60,
    'EXA-SHAPE-03':61,
    'EXA-SHAPE-04':62,
    'EXA-SHAPE-05':63,
    'EXA-SHAPE-06':64,
    'EXA-TEMP-01':65,
    'EXA-TEMP-02':66,
    'EXA-TEMP-03':67,
    'EXA-TEMP-04':68,
    'EXA-TEMP-05':69,
    'EXA-TEMP-06':70,
    'EXA-TEMP-07':71,
    'EXA-TEMP-08':72
  });
  function numberExaLabels(){
    const all=[...document.querySelectorAll('body *')];
    for(const el of all){
      if(el.children.length)continue;
      const t=(el.textContent||'').trim();
      for(const [key,num] of Object.entries(EXA_NUMBERING)){
        if(!t.includes(key))continue;
        if(t.includes('F'+num))break;
        el.textContent=t.replace(key,`F${num} · ${key}`);
        break;
      }
    }
    document.querySelectorAll('h1,h2,h3,.status-pill,.eyebrow').forEach(el=>{
      const t=el.textContent||'';
      if(/Matriz 51/i.test(t))el.textContent=t.replace(/Matriz 51/ig,'Matriz 72');
      if(/^51\s*\+\s*EXA$/i.test(t.trim()))el.textContent='72 filtros';
    });
  }


  const EXA_PRIORITY_DEFS=Object.freeze([
    {id:52,key:'EXA-TOPO-01',name:'Topologia ocupada',status:'ATIVO',detail:'Maior componente ortogonal das 15 dezenas ≤ 4'},
    {id:53,key:'EXA-TOPO-02',name:'Topologia ausentes',status:'ATIVO · OBSERVAR',detail:'10 ausentes em 9+ componentes ortogonais'},
    {id:54,key:'EXA-DEG-01',name:'Momento de graus',status:'DESLIGADO · OBSERVAR',detail:'Wedges do grafo ortogonal ≤ 5'},
    {id:55,key:'EXA-DIR-01',name:'Anisotropia direcional',status:'ATIVO',detail:'|H−V| + |D1−D2| ≥ 8'},
    {id:56,key:'EXA-BITQ-01',name:'Bit-quads diagonais',status:'ATIVO · OBSERVAR',detail:'8+ blocos 2×2 com duas diagonais'},
    {id:57,key:'EXA-SYM-01',name:'Simetria D4',status:'ATIVO',detail:'Variância inteira das assimetrias D4 ≤ 5'},
    {id:58,key:'EXA-DIST-01',name:'Espectro de distâncias',status:'ATIVO',detail:'30+ pares Manhattan à distância 3'},
    {id:59,key:'EXA-SHAPE-01',name:'Xadrez + q3',status:'ATIVO',detail:'checker ≥7 e q3 ≥10'},
    {id:60,key:'EXA-SHAPE-02',name:'Xadrez + furos',status:'ATIVO',detail:'checker ≥9 e furos ≥3'},
    {id:61,key:'EXA-SHAPE-03',name:'Arestas + q3 baixo',status:'ATIVO',detail:'arestas ≥19 e q3 ≤2'},
    {id:62,key:'EXA-SHAPE-04',name:'Arestas + pontas',status:'ATIVO',detail:'arestas ≥20 e pontas ≤1'},
    {id:63,key:'EXA-SHAPE-05',name:'Pontas + bifurcações',status:'ATIVO',detail:'pontas ≤1 e bifurcações ≥9'},
    {id:64,key:'EXA-SHAPE-06',name:'Pontas + q3 alto',status:'ATIVO',detail:'pontas ≤1 e q3 ≥10'},
    {id:65,key:'EXA-TEMP-01',name:'Perímetro × linhas',status:'ATIVO · 0 HISTÓRICO',detail:'Δ perímetro lag1 ≥10 e L1 linhas lag3 ≥12 · 1.048 marginais'},
    {id:66,key:'EXA-TEMP-02',name:'Furos × perímetro',status:'ATIVO · 0 HISTÓRICO',detail:'Δ furos lag1 ≥2 e Δ perímetro lag3 ≥16 · 1.028 marginais'},
    {id:67,key:'EXA-TEMP-03',name:'Furos extremos × perímetro',status:'ATIVO · 0 HISTÓRICO',detail:'Δ furos lag1 ≥4 e Δ perímetro lag3 ≥10 · 136 marginais'},
    {id:68,key:'EXA-TEMP-04',name:'Componentes × gaps',status:'ATIVO · 0 HISTÓRICO',detail:'Δ componentes lag1 ≥3 e L1 gaps lag3 ≤4 · 204 marginais'},
    {id:69,key:'EXA-TEMP-05',name:'Lag7 · componentes × gaps',status:'ATIVO · 0 HISTÓRICO',detail:'Δ componentes lag7 ≥4 e L1 gaps lag7 ≤6 · 254 marginais'},
    {id:70,key:'EXA-TEMP-06',name:'Lag2 × lag9',status:'ATIVO · 0 HISTÓRICO',detail:'L1 gaps lag2 ≤6 e Δ componentes lag9 ≥4 · 749 marginais'},
    {id:71,key:'EXA-TEMP-07',name:'Lag3 × lag4',status:'ATIVO · 0 HISTÓRICO',detail:'L1 gaps lag3 ≤6 e Δ componentes lag4 ≥4 · 157 marginais'},
    {id:72,key:'EXA-TEMP-08',name:'Lag4 × lag6',status:'ATIVO · 0 HISTÓRICO',detail:'L1 colunas lag4 ≥10 e L1 gaps lag6 ≤6 · 2.076 marginais'}
  ]);
  function makeExaPriorityCard(def){
    const article=document.createElement('article');
    article.className='filter-card exa-priority-card';
    article.dataset.filterId=String(def.id);
    article.dataset.exaKey=def.key;
    const active=def.id!==54;
    article.innerHTML=`<div class="filter-card-head"><span class="filter-id">F${String(def.id).padStart(2,'0')}</span><span class="status-pill">${def.status}</span></div><h3>${def.name}</h3><p>${def.detail}</p><div class="filter-detail"><b>${def.key}</b> · ${active?'bloqueio EXA oficial':'experimental / observar; não bloqueia por padrão'}</div>`;
    return article;
  }

  const PRIORITY_GROUPS=[
    {key:'p1',title:'P1 · PROTEÇÃO HISTÓRICA',subtitle:'Finalidade: travas absolutas contra repetições históricas',ids:[29]},
    {key:'p2',title:'P2 · ESTRUTURAIS',subtitle:'Finalidade: forma básica, distribuição e topologia primária',ids:[...Array.from({length:15},(_,i)=>i+1),52,53]},
    {key:'p3',title:'P3 · CONDICIONAIS',subtitle:'Finalidade: condições, limites e gatilhos de contexto',ids:Array.from({length:13},(_,i)=>i+16)},
    {key:'p4',title:'P4 · COMPLEMENTARES',subtitle:'Finalidade: termômetros históricos e anomalias combinadas',ids:Array.from({length:8},(_,i)=>i+30)},
    {key:'p5',title:'P5 · AVANÇADOS / GEOMÉTRICOS',subtitle:'Finalidade: geometria, simetria, topologia e forma · F38–F44 + F55–F64',ids:[...Array.from({length:7},(_,i)=>i+38),55,56,57,58,59,60,61,62,63,64]},
    {key:'p6',title:'P6 · TEMPORAIS / WALK-FORWARD',subtitle:'Finalidade: transições contra lag 1 até lag 10 · zero ocorrência histórica · ≥100 marginais',ids:[65,66,67,68,69,70,71,72]},
    {key:'p7',title:'P7 · EXPERIMENTAIS / OBSERVAR',subtitle:'Finalidade: hipóteses ainda não eliminatórias · F45–F49 + F54',ids:[...Array.from({length:5},(_,i)=>i+45),54]},
    {key:'p8',title:'P8 · OPERACIONAIS',subtitle:'Finalidade: cobertura, carteira e exportação',ids:[50,51]}
  ];
  const priorityOf=id=>PRIORITY_GROUPS.find(g=>g.ids.includes(Number(id)))||null;
  function ensurePriorityStyles(){
    if(document.querySelector('#matrix-priority-styles'))return;
    const st=document.createElement('style');st.id='matrix-priority-styles';st.textContent=`
      #filter-grid.matrix-priority-layout{display:block!important}
      .matrix-priority-group{margin:0 0 18px;border:1px solid rgba(148,163,184,.24);border-radius:16px;padding:14px;background:rgba(15,23,42,.18)}
      .matrix-priority-group>header{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:0 0 12px;padding:0 2px 10px;border-bottom:1px solid rgba(148,163,184,.18)}
      .matrix-priority-group>header b{font-size:15px;letter-spacing:.02em}
      .matrix-priority-group>header small{font-size:12px;opacity:.78;text-align:right}
      .matrix-priority-items{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:12px}
      .matrix-priority-group[data-priority="p1"]{border-color:rgba(239,68,68,.38);background:rgba(127,29,29,.08)}
      .matrix-priority-group[data-priority="p6"],.matrix-priority-group[data-priority="p7"]{background:rgba(30,41,59,.16)}
      @media(max-width:720px){.matrix-priority-group>header{align-items:flex-start;flex-direction:column}.matrix-priority-group>header small{text-align:left}.matrix-priority-items{grid-template-columns:1fr}}
    `;document.head.appendChild(st);
  }
  function organizeMatrixByPriority(){
    const grid=document.querySelector('#filter-grid');if(!grid)return;
    const flat=[...grid.children].filter(x=>x.classList?.contains('filter-card'));
    if(!flat.length)return;
    ensurePriorityStyles();
    const byId=new Map(flat.map(card=>{const m=(card.querySelector('.filter-id')?.textContent||'').match(/F(\d+)/);return [m?Number(m[1]):0,card];}));
    for(const def of EXA_PRIORITY_DEFS)if(!byId.has(def.id))byId.set(def.id,makeExaPriorityCard(def));
    grid.innerHTML='';grid.classList.add('matrix-priority-layout');
    for(const g of PRIORITY_GROUPS){
      const cards=g.ids.map(id=>byId.get(id)).filter(Boolean);if(!cards.length)continue;
      const section=document.createElement('section');section.className='matrix-priority-group';section.dataset.priority=g.key;
      section.innerHTML=`<header><b>${g.title}</b><small>${g.subtitle}</small></header><div class="matrix-priority-items"></div>`;
      const items=section.querySelector('.matrix-priority-items');cards.forEach(card=>items.appendChild(card));grid.appendChild(section);
    }
    const known=new Set(PRIORITY_GROUPS.flatMap(g=>g.ids));const leftovers=[...byId.entries()].filter(([id])=>!known.has(id)).map(([,card])=>card);
    if(leftovers.length){const section=document.createElement('section');section.className='matrix-priority-group';section.dataset.priority='other';section.innerHTML='<header><b>OUTROS</b><small>Filtros fora do agrupamento canônico</small></header><div class="matrix-priority-items"></div>';leftovers.forEach(card=>section.querySelector('.matrix-priority-items').appendChild(card));grid.appendChild(section);}
  }
  const EXPERIMENTAL_RESEARCH=[
    {id:'C8-R1',name:'max8 ≤ 5',occ:0,last:null,delay:null,universe:290,marginal:1},
    {id:'C8-R2',name:'isolados8 ≥ 3',occ:1,last:2916,delay:883,universe:2200,marginal:7},
    {id:'DIA-R1',name:'componentes diagonais ≥ 12',occ:1,last:192,delay:3607,universe:1382,marginal:0},
    {id:'DIA-R2',name:'diagMax ≤ 2',occ:1,last:192,delay:3607,universe:402,marginal:0},
    {id:'C8-SIG-753',name:'assinatura 8-vizinhos 7-5-3',occ:0,last:null,delay:null,universe:1160,marginal:19}
  ];
  function renderExperimentalResearch(panel,root){
    let box=panel.querySelector('#matrix-exa-experimental-research');
    if(!box){box=document.createElement('section');box.id='matrix-exa-experimental-research';box.className='matrix-external-section';root.parentNode.insertBefore(box,root);}
    const rows=EXPERIMENTAL_RESEARCH.map(x=>card(
      x.id+' · '+x.name,
      'EXPERIMENTAL / OBSERVAR',
      `Ocorrências históricas: <b>${x.occ}</b> · Última: <b>${x.last?'#'+x.last:'nunca até #3799'}</b> · Atraso: <b>${x.delay==null?'—':x.delay+' concursos'}</b><br>Universo exato: <b>${fmt(x.universe)}</b> jogos · Ganho marginal sobre os <b>685.700</b> atuais: <b>${fmt(x.marginal)}</b>.`,
      'is-active'
    )).join('');
    box.innerHTML=`<h3>EXPERIMENTAIS · OBSERVAR · 5 CANDIDATOS</h3><div class="matrix-external-grid">${rows}</div><div class="matrix-external-note"><b>Walk-forward / holdout:</b> max8≤5 = 0 ocorrências; isolados8≥3 = 1 ocorrência (#2916); componentes diagonais≥12 = 1 (#192); diagMax≤2 = 1 (#192); assinatura 7-5-3 = 0. No holdout #2797–#3799, somente isolados8≥3 marcou 1 concurso. <b>União exata dos 5 no universo:</b> 5.010 jogos. <b>União marginal após F01–F68:</b> 27 jogos. Ganho muito pequeno; nenhum é ativado como bloqueio.</div>`;
  }
  function apply(){
    organizeMatrixByPriority();
    numberExaLabels();
    const panel=document.querySelector('#matrix-external-audit-panel');
    const root=document.querySelector('#matrix-external-blockers');
    if(!panel||!root)return;
    renderExperimentalResearch(panel,root);
    const head=panel.querySelector('.panel-head');
    if(head&&!head.dataset.exaOrganized){
      head.dataset.exaOrganized='1';
      const eyebrow=head.querySelector('.eyebrow'); if(eyebrow)eyebrow.textContent='MATRIZ 58 · EXA NUMERADOS';
      const h2=head.querySelector('h2'); if(h2)h2.textContent='Matriz 72 · F01–F72 por prioridade e finalidade';
      const p=head.querySelector('p'); if(p)p.textContent='F06 agora é AVISO/OBSERVAR e não elimina jogos. Os bloqueios EXA F52–F58 entram na organização por prioridade. F52/F53 ficam em Estruturais; F55–F58 em Avançados; F54 em Experimentais e desligado. A união oficial conta cada jogo uma única vez.';
      const pill=head.querySelector('.status-pill'); if(pill)pill.textContent='72 filtros';
    }
    let summary=panel.querySelector('#matrix-exa-official-summary');
    if(!summary){summary=document.createElement('section');summary.id='matrix-exa-official-summary';summary.className='matrix-external-section';root.parentNode.insertBefore(summary,root);}
    summary.innerHTML=`<h3>RESUMO OFICIAL · MATRIZ 72</h3><div class="matrix-external-grid">${card('UNIVERSO','100%',`<b>${fmt(UNIVERSE)}</b> combinações possíveis da Lotofácil.`)}${card('APROVADOS ANTES DO EXA','F01–F51',`<b>${fmt(BEFORE)}</b> jogos aprovados pelos filtros F01–F51 antes da união F52–F72.`)}${card('UNIÃO EXA EXATA','ATIVA',`<b>${fmt(EXA)}</b> novos jogos marginais bloqueados, contando cada combinação apenas uma vez.`,'is-blocked')}${card('APROVADOS FINAIS',pct(APPROVED_PCT),`<b>${fmt(APPROVED)}</b> jogos restantes após F01–F58.`)}${card('BLOQUEADOS TOTAIS',pct(BLOCKED_PCT),`<b>${fmt(BLOCKED)}</b> combinações fora do conjunto aprovado.`,'is-blocked')}${card('CONCENTRAÇÃO',RATIO.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'× menor',`O conjunto final tem <b>${fmt(APPROVED)}</b> combinações. A chance matemática de uma aposta individual continua <b>1 em ${fmt(UNIVERSE)}</b>; 1 em ${fmt(APPROVED)} é apenas uma leitura condicional se o resultado estiver no conjunto aprovado.`)}</div>`;
    const section=root.querySelector('.matrix-external-section');
    if(section){const grid=section.querySelector('.matrix-external-grid');if(grid){const cs=[...grid.querySelectorAll('.matrix-external-card')];const exaCards=cs.filter(c=>ACTIVE.some(k=>c.textContent.includes(k))||c.textContent.includes('EXA-DEG-01'));if(exaCards.length&&!section.dataset.exaOrganized){section.dataset.exaOrganized='1';const title=section.querySelector('h3');if(title)title.textContent='EXA · F52–F72 · CONTROLES E AUDITORIA';exaCards.forEach(c=>grid.prepend(c));const note=document.createElement('div');note.className='matrix-external-note';note.innerHTML='<b>União oficial:</b> F52–F53 || F55–F72 = <b>15.872 jogos marginais únicos</b>. F54 / EXA-DEG-01 permanece desligado por padrão.';section.appendChild(note);}}}
  }
  const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{subtree:true,childList:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
