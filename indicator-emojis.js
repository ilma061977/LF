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
  function strip(n,ctx,cls='lf-emoji-strip'){const s=emojiString(n,ctx);return s?'<span class="'+cls+'" title="'+title(n,ctx)+'">'+s+'</span>':''}
  const style=document.createElement('style');style.id='lf-indicator-emojis';style.textContent='.lf-emoji-strip{display:inline-flex;gap:1px;margin-left:3px;font-size:13px;line-height:1;white-space:nowrap;vertical-align:middle}.ball .lf-emoji-strip,.mini-ball .lf-emoji-strip{position:absolute;left:50%;top:100%;transform:translate(-50%,2px);font-size:12px;z-index:3}.ball,.mini-ball{position:relative}.lf-emoji-inline{font-size:13px;white-space:nowrap}';document.head.appendChild(style);
  window.LFIndicatorEmojis=Object.freeze({ALL,EMOJIS,context,markers,emojiString,title,strip});
})();