# Spec 04: Floresta

> Responsável: _(definir)_ · Pasta: `src/features/forest/` · Requisitos: RF07, RNF01, RNF05
> Antes de começar, leia `AGENTS.md`, `src/types.js` e `src/biomes/trees/TreeSvg.jsx`.
> **Pode começar já:** importe `src/seed.example.json` pelo botão "Importar dados" para ter árvores e sessões de teste.

## 1. Objetivo
Mostrar a coleção de árvores do usuário. A aba principal traz **cards-resumo por bioma**; cada bioma tem sua **aba/cena** com as árvores plantadas nele.

## 2. Dados (só leitura)
Tudo vem do `useStore`: `trees`, `sessions`, `notebooks`. Esta tela **não escreve** no store.
- `Tree`: `biome`, `species`, `stages` (1 a 4), `plantedAt`, `notebookId?`.
- Tempo de foco de um bioma = soma de `minutes` das `sessions` com aquele `biome`.
- Árvores de sessões sem caderno estão na **planície**.
- Árvore cujo caderno foi excluído continua existindo (`notebookId` fica `undefined`) e mostra "Sem caderno".

## 3. Regras
1. Os 4 biomas (`BIOMES` em `biomes/config.js`) **sempre** aparecem, mesmo vazios.
2. Cada card-resumo mostra: nome do bioma, cores do bioma como detalhe, nº de árvores, nº de árvores adultas (estágio 4) e minutos de foco totais.
3. A cena do bioma lista as árvores renderizadas com `TreeSvg` (`stage={tree.stages}`, `progress={0}`), mostrando espécie, estágio por extenso (`GROWTH_STAGES`), data de plantio e caderno.
4. Ordenar árvores da mais recente para a mais antiga **[CONFIRMAR C1]**.
5. Estado vazio por bioma: "Ainda não há árvores aqui. Foque para plantar a primeira." com link para `#/foco`.
6. Estado vazio geral (nenhuma árvore): mensagem acolhedora com link para o Foco.

## 4. Rotas e navegação
Hoje existe só `#/floresta`. Duas opções **[CONFIRMAR C2]**:
- (A, recomendada) Rotas `#/floresta` (resumo) e `#/floresta/:biome` (cena). Exige adicionar a rota em `App.jsx` (combinar com quem cuida do layout). Dá link direto e botão voltar funcionando.
- (B) Abas dentro de `#/floresta` com estado local ou `?bioma=`.

Em qualquer caso, a navegação entre bioma e resumo é uma lista de links/abas navegável por teclado. Se usar abas, seguir o padrão ARIA (`role="tablist"`, `role="tab"`, `aria-selected`, setas esquerda/direita). Se usar links, `aria-current="page"` no ativo.

## 5. Arquivos a criar
| Arquivo | O que fazer |
|---|---|
| `ForestPage.jsx` | Resumo: grade de `BiomeSummaryCard` e navegação. |
| `BiomeSummaryCard.jsx` | Card com os números do bioma e link para a cena. |
| `BiomeScenePage.jsx` | Cena do bioma: cabeçalho, lista de árvores. Rota inválida (`:biome` fora de `BIOMES`) mostra "Bioma não encontrado". |
| `forestStats.js` | Funções puras (ver seção 6). |
| `forest.css` | Estilos (só tokens). |

## 6. Funções puras sugeridas (fáceis de testar no console)
```js
/**
 * @param {import('../../types.js').Tree[]} trees
 * @param {import('../../types.js').Session[]} sessions
 * @returns {Record<import('../../types.js').BiomeId, { trees: number, adults: number, minutes: number }>}
 */
export function summarizeByBiome(trees, sessions) {}

/** Árvores de um bioma, da mais recente para a mais antiga. */
export function treesOfBiome(trees, biomeId) {}
```
Inicialize os quatro biomas com zeros para não faltar nenhum no resultado.

## 7. Cena do bioma
- Layout em grade responsiva de `TreeSvg` (o componente já usa `min(320px, 82vw)`; na grade, passar `className` para limitar a largura, ex.: ~180 px).
- Cada árvore dentro de `<figure>` com `<figcaption>` (espécie, estágio, data). O `TreeSvg` já tem `role="img"` e `aria-label`, então **não repita** o mesmo texto em `aria-hidden` ou o leitor de tela lê duplicado: use a legenda como informação visual e mantenha o label do SVG.
- Muitas árvores (100+): renderizar em lotes ("Mostrar mais") para não pesar a página **[CONFIRMAR C3]**.
- Fundo da cena com `colors.sky`/`colors.ground` do bioma é opcional; nunca como única forma de identificar o bioma (mostrar o nome).

## 8. Casos de borda
| Caso | Comportamento |
|---|---|
| Espécie/bioma inválidos vindos de backup | O `sanitize` do store já descarta; a tela não precisa tratar, mas `BIOMES[...]` deve ser acessado com cuidado. |
| Árvore sem `notebookId` | "Sem caderno". |
| Caderno renomeado/excluído | Ler o nome atual do `notebooks`; se não achar, "Sem caderno". |
| `stages` fora de 1..4 | O store clampa; a tela pode usar `Math.min/Math.max` por segurança. |
| Dados vazios | Estados vazios acima. |

## 9. Critérios de aceite
- [ ] Os 4 biomas aparecem no resumo, com números corretos conferidos com o seed.
- [ ] Cada bioma tem sua cena com as árvores certas, no estágio certo e com a espécie certa.
- [ ] Concluir uma sessão no Foco e abrir "Ver na Floresta" mostra a árvore nova ou evoluída.
- [ ] Estados vazios (geral e por bioma) com link para o Foco.
- [ ] Navegação por teclado entre resumo e biomas; `aria-current`/ARIA correto.
- [ ] Funciona em 360 px. `npm run build` passa; sem erros no console.

## 10. Ordem sugerida
1. `forestStats.js` testado no console com o seed.
2. Resumo com cards.
3. Rota e cena do bioma.
4. Estados vazios e acessibilidade.
5. (Opcional) animações leves respeitando `prefers-reduced-motion`.

## 11. Decisões a confirmar
- **C1:** ordem das árvores na cena (recentes primeiro?).
- **C2:** rotas separadas por bioma ou abas na mesma rota?
- **C3:** paginar ou limitar a cena quando houver muitas árvores?
- **C4:** clicar numa árvore abre detalhes (histórico de sessões que a fizeram crescer)? Os dados existem em `sessions` via `treeId`.
