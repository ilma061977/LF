# Robustez dos limites e múltiplos testes · concurso 3793

Foram examinadas 39 variantes vizinhas das cinco famílias de regra. O universo é de 3.268.760 combinações; a avaliação incremental usa a política atual do app no contexto #3793 (janela 10).

## Como interpretar

A correção de Bonferroni usa família nominal de 999 testes (960 hipóteses da busca anterior + 39 variantes aqui). Como houve outras explorações e seleção adaptativa, essa correção é apenas conservadora dentro do conjunto contabilizado; não é um teste confirmatório completo. O teste binomial unilateral compara ocorrências observadas com a fração do universo que cada regra cobre, sob sorteios uniformes independentes.

Os cortes podem ser recalibrados em análises futuras. Se concursos já observados forem usados para alterar limites, esses concursos não podem ser apresentados como validação independente da versão recalibrada. Nenhuma regra é ativada por esta auditoria.

A janela #2794–#3793 compartilha 999 concursos com uma busca anterior (#2793–#3792); portanto, ela não é holdout independente. O acompanhamento é descritivo e recalibrável, sem protocolo congelado.

## Resultados por variante

| Variante | Jogos brutos | Adicionais à política atual | Ocorrências descoberta / ajuste / janela posterior | Esperadas (uniforme) | p ajustado ×999 | Δ adicionais vs. corte anterior |
|---|---:|---:|---:|---:|---:|---:|
| N01_MAXDIAG_65 | 0 | 0 | 0 / 0 / 0 | 0.000 | 1.00 | — |
| N01_MAXDIAG_70 | 28 | 0 | 0 / 0 / 0 | 0.032 | 1.00 | 0 |
| N01_MAXDIAG_73 | 28 | 0 | 0 / 0 / 0 | 0.032 | 1.00 | 0 |
| N01_MAXDIAG_75 | 3.232 | 159 | 0 / 0 / 0 | 3.747 | 1.00 | 159 |
| N01_MAXDIAG_77 | 3.232 | 159 | 0 / 0 / 0 | 3.747 | 1.00 | 0 |
| N01_MAXDIAG_80 | 10.404 | 366 | 3 / 0 / 3 | 12.063 | 1.00 | 207 |
| N01_MAXDIAG_85 | 10.404 | 366 | 3 / 0 / 3 | 12.063 | 1.00 | 0 |
| N02_MAIN_5 | 320 | 11 | 0 / 0 / 0 | 0.371 | 1.00 | — |
| N02_MAIN_6 | 320 | 11 | 0 / 0 / 0 | 0.371 | 1.00 | 0 |
| N02_MAIN_7 | 3.456 | 126 | 0 / 1 / 0 | 4.007 | 1.00 | 115 |
| N02_MAIN_8 | 3.456 | 126 | 0 / 1 / 0 | 4.007 | 1.00 | 0 |
| N02_MAIN_9 | 16.448 | 358 | 6 / 7 / 4 | 19.071 | 1.00 | 232 |
| N02_ANTI_17 | 12.928 | 341 | 6 / 6 / 3 | 14.990 | 1.00 | — |
| N02_ANTI_19 | 6.016 | 206 | 1 / 3 / 0 | 6.975 | 1.00 | -135 |
| N02_ANTI_21 | 3.456 | 126 | 0 / 1 / 0 | 4.007 | 1.00 | -80 |
| N02_ANTI_23 | 896 | 43 | 0 / 0 / 0 | 1.039 | 1.00 | -83 |
| N02_ANTI_25 | 128 | 6 | 0 / 0 / 0 | 0.148 | 1.00 | -37 |
| N03_SPREAD_43 | 1.848 | 83 | 0 / 0 / 0 | 2.143 | 1.00 | — |
| N03_SPREAD_45 | 1.848 | 83 | 0 / 0 / 0 | 2.143 | 1.00 | 0 |
| N03_SPREAD_47 | 3.492 | 148 | 0 / 0 / 0 | 4.049 | 1.00 | 65 |
| N03_SPREAD_48 | 3.492 | 148 | 0 / 0 / 0 | 4.049 | 1.00 | 0 |
| N03_SPREAD_49 | 3.492 | 148 | 0 / 0 / 0 | 4.049 | 1.00 | 0 |
| N03_SPREAD_50 | 4.466 | 153 | 0 / 0 / 0 | 5.178 | 1.00 | 5 |
| N03_SPREAD_51 | 4.466 | 153 | 0 / 0 / 0 | 5.178 | 1.00 | 0 |
| N03_SPREAD_52 | 4.466 | 153 | 0 / 0 / 0 | 5.178 | 1.00 | 0 |
| N03_SPREAD_53 | 4.466 | 153 | 0 / 0 / 0 | 5.178 | 1.00 | 0 |
| N03_SPREAD_55 | 5.310 | 186 | 0 / 0 / 1 | 6.157 | 1.00 | 33 |
| N05_MAIN_5 | 64 | 2 | 0 / 0 / 0 | 0.074 | 1.00 | — |
| N05_MAIN_6 | 64 | 2 | 0 / 0 / 0 | 0.074 | 1.00 | 0 |
| N05_MAIN_7 | 2.432 | 79 | 1 / 0 / 0 | 2.820 | 1.00 | 77 |
| N05_MAIN_8 | 2.432 | 79 | 1 / 0 / 0 | 2.820 | 1.00 | 0 |
| N05_MAIN_9 | 13.888 | 402 | 2 / 3 / 2 | 16.103 | 1.00 | 323 |
| N05_ANTI_5 | 0 | 0 | 0 / 0 / 0 | 0.000 | 1.00 | — |
| N05_ANTI_7 | 256 | 15 | 1 / 0 / 0 | 0.297 | 1.00 | 15 |
| N05_ANTI_8 | 256 | 15 | 1 / 0 / 0 | 0.297 | 1.00 | 0 |
| N05_ANTI_9 | 2.432 | 79 | 1 / 0 / 0 | 2.820 | 1.00 | 64 |
| N05_ANTI_10 | 2.432 | 79 | 1 / 0 / 0 | 2.820 | 1.00 | 0 |
| N05_ANTI_11 | 3.968 | 118 | 1 / 0 / 1 | 4.601 | 1.00 | 39 |
| N05_ANTI_13 | 10.624 | 234 | 5 / 2 / 2 | 12.318 | 1.00 | 116 |

## Limites

P-valores próximos de 1 após correção significam que os dados não sustentam raridade estatística para essas regras dentro deste desenho. A baixa frequência pode resultar da seleção entre muitas fórmulas; não deve ser tratada como evidência de previsão. A coluna de adicionais mede redução matemática do universo aprovado, não ganho de acerto.

## Reproduzir

Compile `scripts/audit-threshold-neighborhood.cpp` com C++17 para reconstruir `auditoria/threshold-neighborhood-masks.csv` e execute `node scripts/audit-threshold-neighborhood.js` para recalcular as métricas e este JSON.
