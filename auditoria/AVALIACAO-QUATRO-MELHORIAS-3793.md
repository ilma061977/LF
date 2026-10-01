# Auditoria das quatro melhorias de regras candidatas

**Aplicativo:** LF Inteligente V3.7.5  
**Base de referência:** concurso 3793 (30/09/2026)  
**Universo:** 3.268.760 combinações de 15 dezenas  
**Dados reproduzíveis:** `AVALIACAO-QUATRO-MELHORIAS-3793.json`  
**Rotina reproduzível:** `scripts/audit-candidate-rules.js`

## Resultado

Foram auditadas cinco regras geométricas que não fazem parte dos bloqueios atuais. Juntas, elas listam 665 jogos adicionais individualmente, mas 231 dessas entradas se sobrepõem. A união exata contém **434 jogos distintos**, ou **0,01328%** do universo. Os números incrementais aplicam a política atual do app no contexto do concurso 3793 (janela 10), de modo que não contam jogos já retirados por essa política.

| Regra | Condição | Correspondências brutas | Adicionais após política atual | Ocorrências do resultado real: descoberta / ajuste / janela histórica |
|---|---|---:|---:|---:|
| N01 | `rotation90_matches ≥ 17` e `max_diagonal_occupancy_ratio_x100 ≤ 75` | 3.232 | 159 | 0 / 0 / 0 |
| N02 | `reflection_main_diagonal_matches ≤ 7` e `reflection_anti_diagonal_matches ≥ 21` | 3.456 | 126 | 0 / 1 / 0 |
| N03 | `rotation90_matches ≥ 17` e `diagonal_density_spread ≤ 50` | 4.466 | 153 | 0 / 0 / 0 |
| N04 | `rotation90_matches ≥ 17` e `diagonal_density_spread ≤ 47` | 3.492 | 148 | 0 / 0 / 0 |
| N05 | `reflection_main_diagonal_matches ≤ 7` e `reflection_anti_diagonal_matches ≤ 9` | 2.432 | 79 | 1 / 0 / 0 |
| **União exata** | Jogos distintos atingidos por pelo menos uma regra | — | **434** | **1 / 1 / 0** |

### Protocolo cronológico

- **Descoberta:** concursos 4–1676.
- **Ajuste:** concursos 1677–2793.
- **Janela posterior de pesquisa:** concursos 2794–3793.
- **Acompanhamento recalibrável:** limites podem ser revistos em análises futuras. Se concursos já observados forem usados para reajustar uma regra, eles não contam como validação independente dessa versão recalibrada.

A janela 2794–3793 **não é independente**. A busca anterior consultou os concursos 2793–3792, que compartilham 999 resultados com ela. Portanto, os zeros observados nessa coluna não confirmam generalização; a aplicação sinaliza essa limitação e não ativou nenhuma regra.

Veja também [Robustez dos limites e correção de múltiplos testes](ROBUSTEZ-LIMITES-MULTIPLOS-TESTES-3793.md), que compara 39 cortes vizinhos e mostra por que as ocorrências raras não bastam para justificar o bloqueio.

## Faixas de acerto dos jogos adicionais

Cada número abaixo soma os acertos obtidos pelos jogos adicionais da regra em cada concurso histórico. É uma contagem de **jogo × concurso**, não de prêmios pagos nem de apostas efetivamente feitas. As listas por regra se sobrepõem; use a linha da união para contar uma vez cada jogo distinto.

| Regra / união | 11 acertos | 12 | 13 | 14 | 15 |
|---|---:|---:|---:|---:|---:|
| N01 | 52.919 | 9.974 | 851 | 0 | 0 |
| N02 | 42.444 | 8.263 | 800 | 0 | 0 |
| N03 | 51.404 | 9.824 | 828 | 0 | 0 |
| N04 | 49.628 | 9.479 | 795 | 0 | 0 |
| N05 | 26.937 | 5.122 | 423 | 0 | 0 |
| **União de 434 jogos** | **145.987** | **27.875** | **2.461** | **0** | **0** |

Essas somas são descritivas e crescem com o número de concursos observados; não medem probabilidade de premiação nem demonstram que bloquear os jogos melhora os resultados.

## Como reproduzir

Na raiz do pacote, execute `node scripts/audit-candidate-rules.js`. O script verifica que a base termina em 3793, recalcula as condições e a interseção com a política vigente, computa a união sem duplicidade, separa as três faixas cronológicas e reproduz as contagens 11–15. O teste também confere os totais esperados antes de gravar o JSON da auditoria.
