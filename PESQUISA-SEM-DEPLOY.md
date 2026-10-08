# PESQUISA SEM DEPLOY

Modo operacional oficial do projeto LF Inteligente para pesquisas EXA e análises internas.

## Regra principal

Enquanto este modo estiver ativo, pesquisas, cálculos, testes, cruzamentos, auditorias e arquivos internos podem ser atualizados no GitHub, mas o app público não deve ser republicado automaticamente.

## Permitido sem deploy

- Atualizar arquivos de pesquisa e cálculo.
- Registrar resultados de testes, cruzamentos e auditorias.
- Executar EXA, walk-forward, marginalidade, estabilidade e análises históricas.
- Criar ou revisar candidatos experimentais e quarentenas.
- Organizar artefatos internos de análise.

## Proibido sem comando explícito de publicação

- Criar deployment na Vercel.
- Alterar alias ou link público.
- Gerar novo link como se fosse a versão pública atual.
- Declarar que a versão pública foi atualizada.
- Considerar um ZIP como versão publicada.

## Comandos que autorizam publicação

A publicação só pode começar após instrução explícita do usuário, por exemplo:

- PUBLICAR
- FAZER DEPLOY
- GERAR LINK ATUALIZADO
- PUBLICAR NA VERCEL

## Ao sair do modo de pesquisa

Quando houver autorização explícita de publicação:

1. Reativar o fluxo de deploy.
2. Validar a revisão que será publicada.
3. Gerar ZIP completo da mesma revisão.
4. Publicar na Vercel.
5. Garantir link público sem senha, login ou proteção inesperada.
6. Verificar o link final.
7. Confirmar que o ZIP e o deployment correspondem exatamente à mesma versão.

## Trava técnica atual

Enquanto o modo estiver ativo, o projeto Vercel deve usar:

- Ignored Build Step: `exit 0` — retorno 0 ignora o build.
- Preview Deployments: desativados.

Essas travas devem ser removidas/revertidas somente quando houver autorização explícita para publicar.

## Estado atual

- Modo: **PESQUISA SEM DEPLOY**
- Status: **ATIVO**
- Deploy automático: **DESATIVADO**
- App público: **não alterar durante pesquisas**
- Data de formalização: **08/10/2026**
