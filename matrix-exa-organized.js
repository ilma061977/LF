(() => {
  'use strict';
  const UNIVERSE=3268760, BEFORE=196430, EXA=5459, APPROVED=190971, BLOCKED=3077789;
  const BLOCKED_PCT=94.15769282541392, APPROVED_PCT=5.8423071745860815, RATIO=17.116525545763494;
  const ACTIVE=['EXA-TOPO-01','EXA-TOPO-02','EXA-DIR-01','EXA-BITQ-01','EXA-SYM-01','EXA-DIST-01'];
  const fmt=n=>Number(n).toLocaleString('pt-BR');
  const pct=n=>Number(n).toLocaleString('pt-BR',{minimumFractionDigits:6,maximumFractionDigits:6})+'%';
  function card(title,badge,body,cls='is-active') { return `<article class="matrix-external-card ${cls}"><header><b>${title}</b><span class="matrix-external-badge">${badge}</span></header><p>${body}</p></article>`; }
  function apply(){
    const panel=document.querySelector('#matrix-external-audit-panel');
    const root=document.querySelector('#matrix-external-blockers');
    if(!panel||!root)return;
    const head=panel.querySelector('.panel-head');
    if(head&&!head.dataset.exaOrganized){
      head.dataset.exaOrganized='1';
      const eyebrow=head.querySelector('.eyebrow'); if(eyebrow)eyebrow.textContent='BLOQUEIOS EXA · EXTERNOS À MATRIZ 51';
      const h2=head.querySelector('h2'); if(h2)h2.textContent='Matriz 51 canônica + novos bloqueios EXA';
      const p=head.querySelector('p'); if(p)p.textContent='F01–F51 permanecem intactos. Os novos bloqueios EXA ficam separados, auditáveis e sem renumeração como F52+. A união oficial conta cada jogo uma única vez.';
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
