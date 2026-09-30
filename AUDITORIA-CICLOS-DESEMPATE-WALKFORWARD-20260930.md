# Desempate por ciclos — walk-forward

Base local: concursos #1–#3792. A descoberta usa alvos #2–#2792; os 1.000 alvos mais recentes ficam reservados para validação (#2793–#3792). Para cada alvo, o estado dos ciclos usa somente concursos anteriores ao alvo.

## Regra testada

Para cada dezena pendente em grupos com 1–3 pendências, somar `1 / quantidade de pendentes`. Escolher as 15 dezenas de maior pontuação, com desempate pseudoaleatório determinístico por concurso. Comparar com um jogo pseudoaleatório independente por alvo. A regra de app proposta é mais restrita: atua só em empate exato no score principal e não remove jogos.

| Período | Alvos | Média de acertos por jogo com ciclos | Jogo aleatório da amostra | Diferença | 11+ acertos (ciclos / aleatório) | Concursos bloqueados |
|---|---:|---:|---:|---:|---:|---:|
| Descoberta #2–#2792 | 2.791 | 9,0348 | 8,9774 | +0,0573 | 315 / 285 | 0 |
| Validação #2793–#3792 | 1.000 | 8,9250 | 8,9700 | −0,0450 | 105 / 109 | 0 |

A diferença na validação não mostra ganho sobre a amostra aleatória. A expectativa combinatória de uma aposta de 15 dezenas é 9 acertos. Por isso, o desempate fica opcional, desligado por padrão, e não é apresentado como previsão nem como bloqueio.

## Base do concurso #3792

02, 04, 06, 07, 08, 10, 11, 12, 14, 15, 16, 20, 23, 24, 25 (29/09/2026). O resultado foi corroborado por UOL, InfoMoney e Brasil 61; a confirmação direta na API oficial da CAIXA permanece pendente.

Fontes consultadas:
- https://noticias.uol.com.br/ultimas-noticias/redacao/2026/09/29/lotofacil-concurso-3792-sorteio-29-de-setembro.htm
- https://www.infomoney.com.br/consumo/lotofacil-hoje-confira-o-resultado-do-concurso-3792-sorteado-nesta-terca-29/
- https://brasil61.com/n/resultado-da-lotofacil-3792-jogo260026
