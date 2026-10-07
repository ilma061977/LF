from pathlib import Path
p=Path("mega-app/index.html")
s=p.read_text(encoding="utf-8")
s=s.replace("Versão 1.14 · Bloqueio 5,023540%","Versão 1.16 · PESQUISA EXA-2 / DELTA · Base ativa 5,287325%")
s=s.replace("Este arquivo já contém os concursos <b>1 a 3066</b>, até <b>03/10/2026</b>. Você pode importar novos resultados abaixo.","Este arquivo já contém os concursos <b>1 a 3067</b>, até <b>06/10/2026</b>. Você pode importar novos resultados abaixo.")
s=s.replace("Base 1–3065 consultada em 02/10/2026; concurso 3066 incorporado em 04/10/2026 após conferência do resultado. Atualização por arquivo, sem conexão automática.","Base 1–3065 consultada em 02/10/2026; concurso 3066 incorporado em 04/10/2026 e concurso 3067 incorporado em 07/10/2026 após conferência dos resultados. Atualização por arquivo, sem conexão automática.")
assert '"concurso":3067' in s
assert "qexa2_"+"" in s
assert "Versão 1.16 · PESQUISA EXA-2 / DELTA" in s
p.write_text(s,encoding="utf-8")
print("patched",len(s))
