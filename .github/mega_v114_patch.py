from pathlib import Path

p=Path("mega-app/index.html")
s=p.read_text(encoding="utf-8")
s=s.replace("Versão 1.9 · Testes 3% + 3,5%","Versão 1.14 · Bloqueio 5,023540%")
if "5,023540%" in s and "test475_" in s and "test5_" in s:
    p.write_text(s,encoding="utf-8")
    print("Mega v1.14 already applied; label synchronized")
    raise SystemExit(0)

def rep(a,b):
    global s
    if a not in s:
        raise RuntimeError("anchor missing: "+a[:100])
    s=s.replace(a,b,1)

s=s.replace("Mega Particular 1.12","Mega Particular 1.14")

f45="function testFourFiveFlags(g){const rows=Array(6).fill(0),cols=Array(10).fill(0);let adj=0,maxGap=0,minGap=Infinity;for(let i=0;i<g.length;i++){const n=g[i];rows[Math.floor((n-1)/10)]++;cols[(n-1)%10]++;if(i){const d=n-g[i-1];adj+=Number(d===1);maxGap=Math.max(maxGap,d);minGap=Math.min(minGap,d)}}const sig=a=>a.filter(Boolean).sort((x,y)=>y-x).join('-'),r=sig(rows),c=sig(cols),occRows=rows.filter(Boolean).length,occCols=cols.filter(Boolean).length,maxCol=Math.max(...cols),span=g[5]-g[0];return [r==='3-2-1'&&adj>=3,occRows<=3&&minGap>=5,occCols<=4&&adj>=3,c==='2-2-1-1'&&adj>=3,maxCol>=4&&maxGap>=25,maxCol>=4&&span>=55]}"
rep(f45,f45+"\nfunction testFourSeventyFiveFlags(g){let primes=0,low30=0,sum=0,maxGap=0;for(let i=0;i<g.length;i++){const n=g[i];sum+=n;low30+=Number(n<=30);primes+=Number([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59].includes(n));if(i)maxGap=Math.max(maxGap,n-g[i-1])}return [maxGap>=25&&primes>=4&&low30>=5,sum<=115&&maxGap>=20&&primes>=4]}\nfunction testFiveExtensionFlags(g){const rows=Array(6).fill(0),cols=Array(10).fill(0),mod5=Array(5).fill(0);let primes=0,low20=0;for(const n of g){rows[Math.floor((n-1)/10)]++;cols[(n-1)%10]++;mod5[n%5]++;low20+=Number(n<=20);primes+=Number([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59].includes(n))}const sig=a=>a.filter(Boolean).sort((x,y)=>y-x).join('-'),occRows=rows.filter(Boolean).length,maxM5=Math.max(...mod5),c=sig(cols);return [occRows<=4&&primes>=5&&maxM5>=3,low20<=1&&g[5]<=45&&c==='3-1-1-1']}")

rep("if(d.type==='testFourFive')return Number(testFourFiveFlags(g)[d.rule]);if(d.type==='history5')","if(d.type==='testFourFive')return Number(testFourFiveFlags(g)[d.rule]);if(d.type==='testFourSeventyFive')return Number(testFourSeventyFiveFlags(g)[d.rule]);if(d.type==='testFiveExtension')return Number(testFiveExtensionFlags(g)[d.rule]);if(d.type==='history5')")

d45="TEST_FOUR_FIVE_LABELS.forEach((label,i)=>FILTER_DEFS.push({id:'test45_'+i,label:'Teste 4,5%: '+label,type:'testFourFive',rule:i,max:1,category:'Pacote experimental 4,5% · 6 cruzamentos',desc:'Zero ocorrências em 1–2200, 2201–2700 e 2701–3066; permanece experimental até validação futura independente.'}));"
rep(d45,d45+"\nconst TEST_FOUR_SEVENTY_FIVE_LABELS=[\"Maior gap ≥ 25 + 4+ primos + 5+ dezenas em 01–30\",\"Soma ≤ 115 + maior gap ≥ 20 + 4+ primos\"];\nTEST_FOUR_SEVENTY_FIVE_LABELS.forEach((label,i)=>FILTER_DEFS.push({id:'test475_'+i,label:'Teste 4,75%: '+label,type:'testFourSeventyFive',rule:i,max:1,category:'Pacote experimental 4,75% · 2 cruzamentos',desc:'Passou retrospectivamente com 0 ocorrências em 1–2200, 2201–2700 e 2701–3066. Continua experimental; não é validação futura independente.'}));\nconst TEST_FIVE_EXTENSION_LABELS=[\"No máximo 4 linhas ocupadas + 5+ primos + 3+ na mesma classe módulo 5\",\"No máximo 1 dezena em 01–20 + maior ≤ 45 + colunas 3-1-1-1\"];\nTEST_FIVE_EXTENSION_LABELS.forEach((label,i)=>FILTER_DEFS.push({id:'test5_'+i,label:'Extensão 5%: '+label,type:'testFiveExtension',rule:i,max:1,category:'Extensão experimental 5% · 2 cruzamentos',desc:'Acrescentado somente após o estágio 4,75%. Passou retrospectivamente com 0 ocorrências nos três blocos, mas permanece experimental até concursos futuros independentes.'}));")

rep("...[...Array(7)].map((_,i)=>['rareLC_'+i,{enabled:true,min:0,max:0}]),['history5',{enabled:true,min:0,max:0}]","...[...Array(7)].map((_,i)=>['rareLC_'+i,{enabled:true,min:0,max:0}]),...[...Array(6)].map((_,i)=>['test45_'+i,{enabled:true,min:0,max:0}]),...[...Array(2)].map((_,i)=>['test475_'+i,{enabled:true,min:0,max:0}]),...[...Array(2)].map((_,i)=>['test5_'+i,{enabled:true,min:0,max:0}]),['history5',{enabled:true,min:0,max:0}]")

rep("d.type==='rareLineColumn'||d.type==='testFourFive')?0:d.max","d.type==='rareLineColumn'||d.type==='testFourFive'||d.type==='testFourSeventyFive'||d.type==='testFiveExtension')?0:d.max")

g45="{label:'PACOTE EXPERIMENTAL 4,5%',hint:'6 cruzamentos; acrescentam 100.400 bloqueios líquidos e levam o total para 4,508274%.',cats:['Pacote experimental 4,5% · 6 cruzamentos']},"
rep(g45,g45+"\n{label:'PACOTE EXPERIMENTAL 4,75%',hint:'2 cruzamentos; acrescentam 126.892 bloqueios líquidos sobre 4,508274% e levam o total para 4,761734%.',cats:['Pacote experimental 4,75% · 2 cruzamentos']},\n{label:'EXTENSÃO EXPERIMENTAL 5%',hint:'2 cruzamentos adicionais; com o pacote 4,75% levam a união total para 5,023540%.',cats:['Extensão experimental 5% · 2 cruzamentos']},")

rep("+testFourFiveFlags.toString()+'\\n'+advancedValue.toString()","+testFourFiveFlags.toString()+'\\n'+testFourSeventyFiveFlags.toString()+'\\n'+testFiveExtensionFlags.toString()+'\\n'+advancedValue.toString()")

rep("<b>Configuração ativa:</b> 13 bloqueios oficiais por padrão raro + similaridade histórica 5/6 + 4 cruzamentos do <b>PACOTE TESTE 3%</b> + 4 cruzamentos do <b>PACOTE TESTE 3,5%</b> + 6 cruzamentos do <b>PACOTE TESTE 4%</b> + 7 <b>PADRÕES RAROS DE LINHA/COLUNA</b> + 6 cruzamentos do <b>PACOTE EXPERIMENTAL 4,5%</b>. Base 3066: <b>47.806.844</b> jogos restantes; <b>2.257.016 bloqueados (4,508274%)</b>, sem duplicar.","<b>Configuração ativa:</b> 13 bloqueios oficiais por padrão raro + similaridade histórica 5/6 + pacotes TESTE 3%, 3,5% e 4% + 7 padrões raros de linha/coluna + 6 cruzamentos do PACOTE EXPERIMENTAL 4,5% + 2 cruzamentos do <b>PACOTE EXPERIMENTAL 4,75%</b> + 2 cruzamentos da <b>EXTENSÃO EXPERIMENTAL 5%</b>. Base 3066: <b>47.548.882</b> jogos restantes; <b>2.514.978 bloqueados (5,023540%)</b>, sem duplicar.")

rep("O novo PACOTE EXPERIMENTAL 4,5% acrescenta <b>100.400</b> bloqueios líquidos e leva o total a <b>4,508274%</b>. Os pacotes de teste/experimentais não são bloqueios oficiais e devem continuar identificados separadamente.","O PACOTE EXPERIMENTAL 4,5% acrescenta <b>100.400</b> bloqueios líquidos e leva o total a <b>4,508274%</b>. O estágio <b>4,75%</b> acrescenta mais <b>126.892</b> e chega a <b>2.383.908 bloqueados / 47.679.952 aprovados (4,761734%)</b>. Mantendo esse estágio e acrescentando a extensão 5%, a união nova total passa a <b>257.962</b> sobre a v1.12, chegando a <b>2.514.978 bloqueados / 47.548.882 aprovados (5,023540%)</b>. Todos esses novos filtros permanecem experimentais.")

s=s.replace("TESTE 3,5% · TESTE 4% · linha/coluna · TESTE 4,5%</td><td>Zero ocorrências retrospectivas não equivale a validação futura independente","TESTE 3,5% · TESTE 4% · linha/coluna · TESTE 4,5% · TESTE 4,75% · EXTENSÃO 5%</td><td>Os novos 4,75%/5% tiveram 0 ocorrências nos três blocos retrospectivos; isso não equivale a validação futura independente",1)
s=s.replace("O pacote 4,5% teve 0 ocorrências em todos os três blocos retrospectivos, mas continua experimental.","O pacote 4,5% e os novos estágios 4,75%/5% tiveram 0 ocorrências nos três blocos retrospectivos. A primeira tentativa de 4,75% falhou no holdout e foi descartada; os substitutos atuais continuam EXPERIMENTAIS porque foram refinados após essa falha. Validação futura independente começa no concurso 3067.",1)
s=s.replace("Os 13 bloqueios oficiais por padrão raro, a similaridade histórica 5/6 e os pacotes 3%, 3,5%, 4%, linha/coluna e experimental 4,5% começam ativados nesta versão. Os pacotes não oficiais permanecem separados dos bloqueios oficiais.","Os 13 bloqueios oficiais por padrão raro, a similaridade histórica 5/6 e os pacotes 3%, 3,5%, 4%, linha/coluna, 4,5%, 4,75% e extensão 5% começam ativados nesta versão. Os pacotes não oficiais permanecem separados dos bloqueios oficiais.",1)
s=s.replace("Versão 1.12","Versão 1.14")

if not all(x in s for x in ["5,023540%","test475_","test5_","test45_'+i,{enabled:true"]):
    raise RuntimeError("post-patch verification failed")
p.write_text(s,encoding="utf-8")
print("patched",len(s))
