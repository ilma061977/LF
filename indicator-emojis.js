(() => {
  'use strict';
  const ALL=Array.from({length:25},(_,i)=>i+1);
  const EMOJIS=Object.freeze({
    hot:Object.freeze({emoji:'🔥',label:'Quente'}),
    cold:Object.freeze({emoji:'❄️',label:'Fria'}),
    latest:Object.freeze({emoji:'♻️',label:'Repetida'}),
    delayed:Object.freeze({emoji:'⏳',label:'Atrasada'}),
    three:Object.freeze({emoji:'🔄',label:'3+ seguidos'})
  });
  function normalize(history=[]){return history.map(x=>({concurso:Number(x.concurso),data:x.data||'',dezenas:(x.dezenas||[]).map(Number).sort((a,b)=>a-b)}));}
  function context(history=[],endExclusive=null){
    const H=normalize(history),end=Math.max(0,Math.min(endExclusive==null?H.length:Number(endExclusive),H.length)),prior=H.slice(0,end),last10=prior.slice(-10),f=Object.fromEntries(ALL.map(n=>[n,0]));
    last10.forEach(d=>d.dezenas.forEach(n=>f[n]++));
    const has=prior.length>0,rank=[...ALL].sort((a,b)=>f[b]-f[a]||a-b),hot=new Set(has?rank.slice(0,5):[]),cold=new Set(has?[...ALL].sort((a,b)=>f[a]-f[b]||a-b).slice(0,5):[]);
    const latest=new Set(prior.at(-1)?.dezenas||[]),last3=prior.slice(-3),three=new Set();
    if(last3.length===3)for(const n of ALL)if(last3.every(d=>d.dezenas.includes(n)))three.add(n);
    const delays={};for(const n of ALL){let d=0;for(let i=prior.length-1;i>=0&&!prior[i].dezenas.includes(n);i--)d++;delays[n]=d}
    const absent=has?ALL.filter(n=>!latest.has(n)):[],delayRank=[...absent].sort((a,b)=>delays[b]-delays[a]||a-b),delayed=new Set(delayRank.slice(0,5));
    return{end,hot,cold,latest,three,delayed,f,delays,delayRank};
  }
  function markers(n,ctx){const out=[];if(ctx.hot.has(n))out.push(EMOJIS.hot);if(ctx.cold.has(n))out.push(EMOJIS.cold);if(ctx.latest.has(n))out.push(EMOJIS.latest);if(ctx.delayed.has(n))out.push(EMOJIS.delayed);if(ctx.three.has(n))out.push(EMOJIS.three);return out}
  function emojiString(n,ctx){return markers(Number(n),ctx).map(x=>x.emoji).join('')}
  function title(n,ctx){return markers(Number(n),ctx).map(x=>x.emoji+' '+x.label).join(' · ')}
  function strip(n,ctx,cls='lf-emoji-strip'){const ms=markers(Number(n),ctx);return ms.length?'<span class="'+cls+'" title="'+title(n,ctx)+'">'+ms.map(x=>'<i>'+x.emoji+'</i>').join('')+'</span>':''}
  const style=document.createElement('style');style.id='lf-indicator-emojis';style.textContent='.lf-emoji-strip{display:inline-flex;gap:2px;margin-left:4px;line-height:1;vertical-align:middle;white-space:nowrap}.lf-emoji-strip i{font-style:normal;display:inline-grid;place-items:center;min-width:15px;height:15px;font-size:12px;line-height:1}.ball .lf-emoji-strip,.mini-ball .lf-emoji-strip{position:absolute;left:50%;top:calc(100% + 4px);transform:translateX(-50%);display:grid;grid-template-columns:repeat(3,15px);grid-auto-rows:16px;justify-content:center;gap:1px;width:max-content;max-width:51px;padding:2px 3px;border:1px solid rgba(148,163,184,.38);border-radius:7px;background:rgba(255,255,255,.96);box-shadow:0 2px 7px rgba(15,23,42,.14);z-index:8}.ball .lf-emoji-strip i,.mini-ball .lf-emoji-strip i{min-width:15px;height:15px;font-size:12px}.ball,.mini-ball{position:relative}.lf-emoji-inline{font-size:13px;white-space:nowrap}';document.head.appendChild(style);
  window.LFIndicatorEmojis=Object.freeze({ALL,EMOJIS,context,markers,emojiString,title,strip});
})();