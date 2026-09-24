(()=>{'use strict';
  const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
  const pageTitle=name=>document.querySelector('.nav-item[data-page="'+name+'"] b')?.textContent?.trim()||name;

  function fallbackPage(name){
    if(window.__LF_APP_READY)return;
    const panel=$('.page[data-page-panel="'+name+'"]');if(!panel)return;
    $$('.page').forEach(p=>p.classList.toggle('active',p===panel));
    $$('.nav-item[data-page]').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
    const t=$('#page-title');if(t)t.textContent=pageTitle(name);
    $('#sidebar')?.classList.remove('open');
    try{history.replaceState(null,'',name==='decision'?location.pathname:location.pathname+'?page='+encodeURIComponent(name));}catch{}
  }

  function toggleGroup(btn){
    if(window.__LF_APP_READY)return;
    const group=btn.closest('.nav-group');if(!group)return;
    const next=!group.classList.contains('open');
    $$('.nav-group').forEach(g=>{if(g!==group){g.classList.remove('open');g.querySelector('.nav-group-toggle')?.setAttribute('aria-expanded','false');}});
    group.classList.toggle('open',next);
    btn.setAttribute('aria-expanded',String(next));
  }

  function renderSearch(input){
    if(window.__LF_APP_READY)return;
    const q=String(input?.value||'').trim(),active=!!q;
    document.body.classList.toggle('nav-searching',active);
    const clear=$('#nav-search-clear'),empty=$('#nav-empty'),box=$('#nav-global-results');
    if(clear)clear.hidden=!active;
    const rs=active&&window.LFGlobalSearch?window.LFGlobalSearch.search(q).slice(0,12):[];
    if(box){
      box.hidden=!rs.length;
      box.innerHTML=rs.map(x=>'<a href="'+x.url+'"><b>'+x.title+'</b><em>ABRIR</em><small>'+x.section+'</small></a>').join('');
    }
    if(empty)empty.hidden=!active||rs.length>0;
  }

  document.addEventListener('click',e=>{
    if(window.__LF_APP_READY)return;
    if(e.target.closest?.('#menu-button')){e.preventDefault();$('#sidebar')?.classList.toggle('open');return;}
    if(e.target.closest?.('#sidebar-close')){e.preventDefault();$('#sidebar')?.classList.remove('open');return;}
    if(e.target.closest?.('#nav-search-clear')){e.preventDefault();const input=$('#nav-search');if(input){input.value='';renderSearch(input);input.focus();}return;}
    const group=e.target.closest?.('.nav-group-toggle');if(group){e.preventDefault();toggleGroup(group);return;}
    const nav=e.target.closest?.('.nav-item[data-page]');if(nav){e.preventDefault();fallbackPage(nav.dataset.page);}
  });
  document.addEventListener('input',e=>{if(e.target?.id==='nav-search')renderSearch(e.target);});
  document.addEventListener('keydown',e=>{if(e.target?.id==='nav-search'&&e.key==='Escape'){e.target.value='';renderSearch(e.target);e.target.blur();}});
  window.addEventListener('lf:app-failed',()=>{document.documentElement.dataset.lfFallback='1';const s=$('#data-status');if(s)s.textContent='Modo de contingência ativo';});
})();