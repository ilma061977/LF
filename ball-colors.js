(() => {
  'use strict';
  const MAP = Object.freeze({
    1:Object.freeze({code:'V',name:'Vermelha',hex:'#dc2626',text:'#ffffff',numbers:Object.freeze([1,11,21])}),
    2:Object.freeze({code:'A',name:'Amarela',hex:'#facc15',text:'#111827',numbers:Object.freeze([2,12,22])}),
    3:Object.freeze({code:'V',name:'Verde',hex:'#16a34a',text:'#ffffff',numbers:Object.freeze([3,13,23])}),
    4:Object.freeze({code:'M',name:'Marrom',hex:'#7c4a2d',text:'#ffffff',numbers:Object.freeze([4,14,24])}),
    5:Object.freeze({code:'A',name:'Azul',hex:'#2563eb',text:'#ffffff',numbers:Object.freeze([5,15,25])}),
    6:Object.freeze({code:'R',name:'Rosa',hex:'#ec4899',text:'#ffffff',numbers:Object.freeze([6,16])}),
    7:Object.freeze({code:'P',name:'Preta',hex:'#111827',text:'#ffffff',numbers:Object.freeze([7,17])}),
    8:Object.freeze({code:'C',name:'Cinza',hex:'#9ca3af',text:'#111827',numbers:Object.freeze([8,18])}),
    9:Object.freeze({code:'L',name:'Laranja',hex:'#f97316',text:'#ffffff',numbers:Object.freeze([9,19])}),
    0:Object.freeze({code:'B',name:'Branca',hex:'#ffffff',text:'#111827',numbers:Object.freeze([10,20])})
  });

  const info = Object.freeze(Object.fromEntries(
    Object.entries(MAP).map(([k,v]) => [k, Object.freeze({name:v.name, code:v.code, nums:v.numbers})])
  ));

  function finalKey(n){ n=Number(n); return Number.isFinite(n) ? ((n%10)+10)%10 : 0; }
  function get(n){ return MAP[finalKey(n)]; }
  function className(n){ return 'c'+finalKey(n); }
  function title(n){ const x=get(n); return String(n).padStart(2,'0')+' · '+x.name+' ('+x.code+')'; }
  function render(n, extraClass='ball', extra=''){
    const x=get(n), num=String(Number(n)).padStart(2,'0');
    return '<span class="'+extraClass+' '+className(n)+'" title="'+title(n)+'" data-ball-number="'+num+'" data-ball-color="'+x.name+'" '+extra+'>'+num+'</span>';
  }

  const css = Object.entries(MAP).map(([k,v]) => {
    const border = k==='0' ? '#94a3b8' : (k==='7' ? '#374151' : 'rgba(15,23,42,.20)');
    return '.c'+k+'{background:'+v.hex+'!important;color:'+v.text+'!important;border-color:'+border+'!important}';
  }).join('')+
  '.lf-color-legend{display:flex;gap:6px;flex-wrap:wrap}.lf-color-legend .lf-color-item{display:inline-flex;align-items:center;gap:5px;font-size:10px;color:#64748b}.lf-color-legend .lf-color-dot{width:18px;height:18px;border-radius:50%;display:grid;place-items:center;font-size:8px;font-weight:900;border:1px solid rgba(15,23,42,.18)}';

  const style=document.createElement('style');
  style.id='lf-official-ball-colors';
  style.textContent=css;
  document.head.appendChild(style);

  window.LFOfficialBalls = Object.freeze({
    MAP, info, get, finalKey, className, title, render,
    legendHTML(){
      return '<div class="lf-color-legend">'+[1,2,3,4,5,6,7,8,9,0].map(k=>{
        const v=MAP[k], first=v.numbers.map(n=>String(n).padStart(2,'0')).join(' ');
        return '<span class="lf-color-item"><i class="lf-color-dot c'+k+'">'+v.code+'</i><span>'+v.name+': '+first+'</span></span>';
      }).join('')+'</div>';
    }
  });
})();