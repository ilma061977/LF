(() => {
  'use strict';
  const UNIVERSE=3268760, BEFORE=196430, EXA=5459, APPROVED=190971, BLOCKED=3077789;
  const BLOCKED_PCT=94.15769282541392, APPROVED_PCT=5.8423071745860815, RATIO=17.116525545763494;
  const ACTIVE=['EXA-TOPO-01','EXA-TOPO-02','EXA-DIR-01','EXA-BITQ-01','EXA-SYM-01','EXA-DIST-01'];
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
    'EXA-DIST-01':58
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
      if(/Matriz 51/i.test(t))el.textContent=t.replace(/Matriz 51/ig,'Matriz 58');
      if(/^51\s*\+\s*EXA$/i.test(t.trim()))el.textContent='58 filtros';
    });
  }

  const PRIORITY_GROUPS=[
    {key:'p1',title:'P1 · EXTREMA',subtitle:'F29 · trava histórica absoluta',ids:[29]},
    {key:'p2',title:'P2 · ESTRUTURAIS',subtitle:'F01–F15 · estrutura base do jogo',ids:Array.from({length:15},(_,i)=>i+1)},
    {key:'p3',title:'P3 · CONDICIONAIS',subtitle:'F16–F28 · condições e limites',ids:Array.from({length:13},(_,i)=>i+16)},
    {key:'p4',title:'P4 · COMPLEMENTARES',subtitle:'F30–F37 · filtros complementares',ids:Array.from({length:8},(_,i)=>i+30)},
    {key:'p5',title:'P5 · AVANÇADOS',subtitle:'F38–F44 · análises avançadas',ids:Array.from({length:7},(_,i)=>i+38)},
    {key:'p6',title:'P6 · EXPERIMENTAIS',subtitle:'F45–F49 · hipóteses em validação',ids:Array.from({length:5},(_,i)=>i+45)},
    {key:'p7',title:'P7 · OPERACIONAIS',subtitle:'F50–F51 · controles operacionais',ids:[50,51]},
    {key:'p8',title:'P8 · EXA',subtitle:'F52–F58 · novos bloqueios EXA numerados',ids:[]}
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
  function apply(){
    organizeMatrixByPriority();
    numberExaLabels();
    const panel=document.querySelector('#matrix-external-audit-panel');
    const root=document.querySelector('#matrix-external-blockers');
    if(!panel||!root)return;
    const head=panel.querySelector('.panel-head');
    if(head&&!head.dataset.exaOrganized){
      head.dataset.exaOrganized='1';
      const eyebrow=head.querySelector('.eyebrow'); if(eyebrow)eyebrow.textContent='BLOQUEIOS EXA · EXTERNOS À MATRIZ 51';
      const h2=head.querySelector('h2'); if(h2)h2.textContent='Matriz 58 · Matriz 58 filtros numerados';
      const p=head.querySelector('p'); if(p)p.textContent='F01–F51 permanecem intactos. Os novos bloqueios EXA agora recebem F52–F58 na interface, preservando os IDs técnicos EXA-*. A união oficial conta cada jogo uma única vez.';
      const pill=head.querySelector('.status-pill'); if(pill)pill.textContent='51 + EXA';
    }
    let summary=panel.querySelector('#matrix-exa-official-summary');
    if(!summary){summary=document.createElement('section');summary.id='matrix-exa-official-summary';summary.className='matrix-external-section';root.parentNode.insertBefore(summary,root);}
    summary.innerHTML=`<h3>RESUMO OFICIAL · MATRIZ 51 + EXA</h3><div class="matrix-external-grid">${card('UNIVERSO','100%',`<b>${fmt(UNIVERSE)}</b> combinações possíveis da Lotofácil.`)}${card('APROVADOS ANTES DO EXA','M51',`<b>${fmt(BEFORE)}</b> jogos aprovados pela Matriz 51 antes da união EXA.`)}${card('UNIÃO EXA EXATA','ATIVA',`<b>${fmt(EXA)}</b> novos jogos marginais bloqueados, contando cada combinação apenas uma vez.`,'is-blocked')}${card('APROVADOS FINAIS',pct(APPROVED_PCT),`<b>${fmt(APPROVED)}</b> jogos restantes após Matriz 51 + EXA.`)}${card('BLOQUEADOS TOTAIS',pct(BLOCKED_PCT),`<b>${fmt(BLOCKED)}</b> combinações fora do conjunto aprovado.`,'is-blocked')}${card('CONCENTRAÇÃO',RATIO.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2})+'× menor',`O conjunto final tem <b>${fmt(APPROVED)}</b> combinações. A chance matemática de uma aposta individual continua <b>1 em ${fmt(UNIVERSE)}</b>; 1 em ${fmt(APPROVED)} é apenas uma leitura condicional se o resultado estiver no conjunto aprovado.`)}</div>`;
    const section=root.querySelector('.matrix-external-section');
    if(section){const grid=section.querySelector('.matrix-external-grid');if(grid){const cs=[...grid.querySelectorAll('.matrix-external-card')];const exaCards=cs.filter(c=>ACTIVE.some(k=>c.textContent.includes(k))||c.textContent.includes('EXA-DEG-01'));if(exaCards.length&&!section.dataset.exaOrganized){section.dataset.exaOrganized='1';const title=section.querySelector('h3');if(title)title.textContent='1. BLOQUEIOS EXA · EXTERNOS À MATRIZ 51';exaCards.forEach(c=>grid.prepend(c));const note=document.createElement('div');note.className='matrix-external-note';note.innerHTML='<b>União oficial:</b> TOPO-01 || TOPO-02 || DIR-01 || BITQ-01 || SYM-01 || DIST-01 = <b>5.459 jogos marginais únicos</b>. <b>EXA-DEG-01 permanece desligado por padrão.</b>';section.appendChild(note);}}}
  }
  const observer=new MutationObserver(()=>apply());observer.observe(document.documentElement,{subtree:true,childList:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();
