from pathlib import Path

p=Path("mega-app/index.html")
s=p.read_text(encoding="utf-8")
if "5,287325%" in s and "qexa_" in s and '"concurso":3067' in s:
    print("Mega v1.15 already applied")
    raise SystemExit(0)

def rep(a,b):
    global s
    if a not in s:
        raise RuntimeError("anchor missing: "+a[:140])
    s=s.replace(a,b,1)

s=s.replace("Mega Particular 1.14","Mega Particular 1.15")
s=s.replace("Versão 1.9 · Testes 3% + 3,5%","Versão 1.15 · QUARENTENA GEO/POS/HVD")

rep('{"concurso":3066,"data":"2026-10-03","dezenas":[4,6,9,13,28,48]}];',
    '{"concurso":3066,"data":"2026-10-03","dezenas":[4,6,9,13,28,48]},{"concurso":3067,"data":"2026-10-06","dezenas":[1,4,17,33,41,52]}];')

anchor="function testFiveExtensionFlags(g){const rows=Array(6).fill(0),cols=Array(10).fill(0),mod5=Array(5).fill(0);let primes=0,low20=0;for(const n of g){rows[Math.floor((n-1)/10)]++;cols[(n-1)%10]++;mod5[n%5]++;low20+=Number(n<=20);primes+=Number([2,3,5,7,11,13,17,19,23,29,31,37,41,43,47,53,59].includes(n))}const sig=a=>a.filter(Boolean).sort((x,y)=>y-x).join('-'),occRows=rows.filter(Boolean).length,maxM5=Math.max(...mod5),c=sig(cols);return [occRows<=4&&primes>=5&&maxM5>=3,low20<=1&&g[5]<=45&&c==='3-1-1-1']}"
newfun="function exaQuarantineFlags(g){const rows=Array(6).fill(0);let top=0,H=0,V=0,D=0;for(const n of g){const r=Math.floor((n-1)/10),c=(n-1)%10;rows[r]++;top+=Number(r<3)}const sig=rows.filter(Boolean).sort((a,b)=>b-a).join('-');for(let i=0;i<g.length;i++)for(let j=i+1;j<g.length;j++){const ri=Math.floor((g[i]-1)/10),ci=(g[i]-1)%10,rj=Math.floor((g[j]-1)/10),cj=(g[j]-1)%10,dr=Math.abs(ri-rj),dc=Math.abs(ci-cj);if(dr===0&&dc===1)H++;else if(dr===1&&dc===0)V++;else if(dr===1&&dc===1)D++}return [top>=5&&sig==='3-3',g[0]>=20&&g[3]<=28,D>=4&&(H+V+D)>=5]}"
rep(anchor,anchor+"\n"+newfun)

rep("if(d.type==='testFiveExtension')return Number(testFiveExtensionFlags(g)[d.rule]);if(d.type==='history5')",
    "if(d.type==='testFiveExtension')return Number(testFiveExtensionFlags(g)[d.rule]);if(d.type==='exaQuarantine')return Number(exaQuarantineFlags(g)[d.rule]);if(d.type==='history5')")

defs="const TEST_FIVE_EXTENSION_LABELS=[\"No máximo 4 linhas ocupadas + 5+ primos + 3+ na mesma classe módulo 5\",\"No máximo 1 dezena em 01–20 + maior ≤ 45 + colunas 3-1-1-1\"];\nTEST_FIVE_EXTENSION_LABELS.forEach((label,i)=>FILTER_DEFS.push({id:'test5_'+i,label:'Extensão 5%: '+label,type:'testFiveExtension',rule:i,max:1,category:'Extensão experimental 5% · 2 cruzamentos',desc:'Acrescentado somente após o estágio 4,75%. Passou retrospectivamente com 0 ocorrências nos três blocos, mas permanece experimental até concursos futuros independentes.'}));"
qdefs="const EXA_QUARANTINE_LABELS=['GEO-X1 · 5+ dezenas na metade superior + linhas 3-3','POS-X1 · 1ª dezena ≥ 20 + 4ª dezena ≤ 28','HVD-X1 · 4+ ligações diagonais + 5+ ligações H/V/D'];\nEXA_QUARANTINE_LABELS.forEach((label,i)=>FILTER_DEFS.push({id:'qexa_'+i,label,type:'exaQuarantine',rule:i,max:1,category:'Quarentena experimental Exa · GEO/POS/HVD',desc:i===0?'GEO: padrão geométrico. Histórico 1–3066: 0 ocorrências; marginal exato +30.829; sobreviveu ao concurso futuro 3067.':i===1?'POS: posições ordenadas. Histórico 1–3066: 0 ocorrências; marginal exato +54.661; sobreviveu ao concurso futuro 3067.':'HVD: adjacências horizontal/vertical/diagonal. Histórico 1–3066: 0 ocorrências; marginal exato +46.344; sobreviveu ao concurso futuro 3067.'}));"
rep(defs,defs+"\n"+qdefs)

rep("...[...Array(2)].map((_,i)=>['test5_'+i,{enabled:true,min:0,max:0}]),['history5',{enabled:true,min:0,max:0}]",
    "...[...Array(2)].map((_,i)=>['test5_'+i,{enabled:true,min:0,max:0}]),...[...Array(3)].map((_,i)=>['qexa_'+i,{enabled:true,min:0,max:0}]),['history5',{enabled:true,min:0,max:0}]")

rep("d.type==='rareLineColumn'||d.type==='testFourFive'||d.type==='testFourSeventyFive'||d.type==='testFiveExtension')?0:d.max",
    "d.type==='rareLineColumn'||d.type==='testFourFive'||d.type==='testFourSeventyFive'||d.type==='testFiveExtension'||d.type==='exaQuarantine')?0:d.max")

grp="{label:'EXTENSÃO EXPERIMENTAL 5%',hint:'2 cruzamentos adicionais; com o pacote 4,75% levam a união total para 5,023540%.',cats:['Extensão experimental 5% · 2 cruzamentos']},"
rep(grp,grp+"\n{label:'QUARENTENA EXPERIMENTAL · EXA',hint:'GEO-X1 + POS-X1 + HVD-X1 ativos em quarentena. Base 3067: +131.744 bloqueios marginais; união total 5,287325%. Não são oficiais.',cats:['Quarentena experimental Exa · GEO/POS/HVD']},")

rep("+testFiveExtensionFlags.toString()+'\\n'+advancedValue.toString()",
    "+testFiveExtensionFlags.toString()+'\\n'+exaQuarantineFlags.toString()+'\\n'+advancedValue.toString()")

old="<b>Configuração ativa:</b> 13 bloqueios oficiais por padrão raro + similaridade histórica 5/6 + pacotes TESTE 3%, 3,5% e 4% + 7 padrões raros de linha/coluna + 6 cruzamentos do PACOTE EXPERIMENTAL 4,5% + 2 cruzamentos do <b>PACOTE EXPERIMENTAL 4,75%</b> + 2 cruzamentos da <b>EXTENSÃO EXPERIMENTAL 5%</b>. Base 3066: <b>47.548.882</b> jogos restantes; <b>2.514.978 bloqueados (5,023540%)</b>, sem duplicar."
new="<b>Configuração ativa:</b> 13 bloqueios oficiais por padrão raro + similaridade histórica 5/6 + pacotes TESTE 3%, 3,5% e 4% + 7 padrões raros de linha/coluna + 6 cruzamentos do PACOTE EXPERIMENTAL 4,5% + 2 cruzamentos do PACOTE EXPERIMENTAL 4,75% + 2 cruzamentos da EXTENSÃO EXPERIMENTAL 5% + <b>GEO-X1 + POS-X1 + HVD-X1 em QUARENTENA EXPERIMENTAL</b>. Base 3067: <b>47.416.821</b> jogos restantes; <b>2.647.039 bloqueados (5,287325%)</b>, sem duplicar."
rep(old,new)

old2="O PACOTE EXPERIMENTAL 4,5% acrescenta <b>100.400</b> bloqueios líquidos e leva o total a <b>4,508274%</b>. O estágio <b>4,75%</b> acrescenta mais <b>126.892</b> e chega a <b>2.383.908 bloqueados / 47.679.952 aprovados (4,761734%)</b>. Mantendo esse estágio e acrescentando a extensão 5%, a união nova total passa a <b>257.962</b> sobre a v1.12, chegando a <b>2.514.978 bloqueados / 47.548.882 aprovados (5,023540%)</b>. Todos esses novos filtros permanecem experimentais."
new2="Até a extensão 5%, a base atualizada 3067 fica em <b>2.515.295 bloqueados / 47.548.565 aprovados (5,024173%)</b>. Os três candidatos da pesquisa Exa — GEO-X1, POS-X1 e HVD-X1 — acrescentam uma união marginal exata de <b>131.744</b> jogos, chegando a <b>2.647.039 bloqueados / 47.416.821 aprovados (5,287325%)</b>. Eles permanecem em <b>QUARENTENA EXPERIMENTAL</b>: passaram 1–3066 e também o primeiro teste futuro real, concurso 3067, mas não passaram o controle conservador de múltiplas hipóteses para promoção a oficial."
rep(old2,new2)

s=s.replace("Níveis de validação · base 3066","Níveis de validação · base 3067")
row="<tr><td><b>EXPERIMENTAL</b></td><td>TESTE 3,5% · TESTE 4% · linha/coluna · TESTE 4,5% · TESTE 4,75% · EXTENSÃO 5%</td><td>Os novos 4,75%/5% tiveram 0 ocorrências nos três blocos retrospectivos; isso não equivale a validação futura independente</td></tr>"
rep(row,row+"<tr><td><b>QUARENTENA</b></td><td>GEO-X1 · POS-X1 · HVD-X1</td><td>0 ocorrências em 1–3066 e 0 falhas no concurso futuro 3067; ainda não promovidos por controle de múltiplas hipóteses</td></tr>")

s=s.replace("O pacote 4,5% e os novos estágios 4,75%/5% tiveram 0 ocorrências nos três blocos retrospectivos. A primeira tentativa de 4,75% falhou no holdout e foi descartada; os substitutos atuais continuam EXPERIMENTAIS porque foram refinados após essa falha. Validação futura independente começa no concurso 3067.",
"O pacote 4,5% e os estágios 4,75%/5% tiveram 0 ocorrências nos três blocos retrospectivos. A primeira tentativa de 4,75% falhou no holdout e foi descartada. GEO-X1, POS-X1 e HVD-X1 foram selecionados depois de 1.969 hipóteses e permanecem em QUARENTENA; o concurso 3067 foi o primeiro teste futuro real e nenhum dos três o bloqueou.")

s=s.replace("Os 13 bloqueios oficiais por padrão raro, a similaridade histórica 5/6 e os pacotes 3%, 3,5%, 4%, linha/coluna, 4,5%, 4,75% e extensão 5% começam ativados nesta versão. Os pacotes não oficiais permanecem separados dos bloqueios oficiais.",
"Os 13 bloqueios oficiais por padrão raro, a similaridade histórica 5/6, os pacotes 3%, 3,5%, 4%, linha/coluna, 4,5%, 4,75%, extensão 5% e a QUARENTENA GEO/POS/HVD começam ativados nesta versão. Os três filtros de quarentena continuam separados dos bloqueios oficiais.")

if not all(x in s for x in ["Mega Particular 1.15",'"concurso":3067',"function exaQuarantineFlags","5,287325%","2.647.039","47.416.821"]):
    raise RuntimeError("post-patch verification failed")
p.write_text(s,encoding="utf-8")
print("patched",len(s))
