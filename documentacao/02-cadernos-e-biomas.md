# Spec 02: Cadernos e Biomas

> Responsável: _(definir)_ · Pasta: `src/features/notebooks/` (+ `src/biomes/`) · Requisitos: RF16 a RF20, RF09 (parcial), RNF01, RNF02, RNF05, RNF07
> Antes de começar, leia `AGENTS.md`, `src/types.js` e `docs/specs/01-foco.md`. Itens **[CONFIRMAR]** estão na seção 14.

## 1. Objetivo
Cada **caderno é uma matéria de estudo** (Matemática, Português...). Ele guarda **fontes** (links, vídeos do YouTube e notas),
e define o **bioma** onde as árvores das sessões de foco daquela matéria vão crescer. Os cadernos também são a base para:
- vincular tarefas (toda tarefa pertence a um caderno);
- vincular sessões de foco;
- agrupar a floresta e os gráficos por matéria.

Por isso esta é a tela que **mais desbloqueia as outras**. Entregue a base (criar/listar/escolher bioma) antes das fontes.

## 2. Regras de negócio
1. Um caderno tem: nome, bioma e lista de fontes (`Notebook` em `types.js`).
2. O **bioma é escolhido pelo usuário** ao criar o caderno, entre `planicie`, `montanha`, `floresta`, `savana` (`BIOMES` em `biomes/config.js`). **[CONFIRMAR C1]** pode trocar depois?
3. Tipos de fonte: `link`, `youtube` e `note` (`Source`). **Sem upload de arquivos** no MVP (limite de ~5 MB do `localStorage`).
4. Cada fonte tem título, tags (categorias livres) e conteúdo conforme o tipo: `url` para link/YouTube, `text` para nota.
5. Excluir caderno exige confirmação mostrando o impacto (tarefas e sessões ligadas). O store já apaga as tarefas do caderno e **desvincula** sessões e árvores (mantém o histórico de foco).
6. Busca por texto cobre nome do caderno, título, URL, texto das notas e tags, ignorando acentos e maiúsculas (RF20).

## 3. Telas e rotas
| Rota | Componente | Função |
|---|---|---|
| `#/cadernos` | `NotebooksPage` | Grade de cards dos cadernos + busca global + botão "Novo caderno". |
| `#/cadernos/:id` | `NotebookDetailPage` | Fontes do caderno, filtros por tag, adicionar/editar/remover fonte, vídeos incorporados. |

**Ação necessária no `App.jsx`:** adicionar `<Route path="/cadernos/:id" element={<NotebookDetailPage />} />` (combine com quem cuida do layout).

## 4. Arquivos a criar
| Arquivo | O que fazer |
|---|---|
| `NotebooksPage.jsx` | Lista, busca, estado vazio ("Crie seu primeiro caderno para começar a plantar."). |
| `NotebookCard.jsx` | Nome, bioma (cor + nome), nº de fontes, tempo de foco total, nº de árvores, botões **Abrir** e **Focar** (link para `#/foco?notebookId=ID`). |
| `NotebookForm.jsx` | Criar/renomear (modal). Campos: nome e `BiomePicker`. |
| `BiomePicker.jsx` | Cards selecionáveis (radio) mostrando nome, cores do bioma e espécies. Navegável por teclado. |
| `NotebookDetailPage.jsx` | Cabeçalho (nome, bioma, editar, excluir), filtro de tags, lista de fontes, botão "Adicionar fonte". |
| `SourceForm.jsx` | Modal de fonte: tipo (radio), título, URL ou texto, tags. Validação por tipo. |
| `SourceCard.jsx` | Exibe a fonte conforme o tipo, com editar e remover. |
| `YouTubeEmbed.jsx` | `<iframe>` do vídeo (ver seção 7). |
| `lib/youtube.js` | `parseYouTubeId(url): string \| null`. |
| `lib/url.js` | `safeHttpUrl(input): string \| null` (só `http:` e `https:`). |
| `lib/search.js` | `normalize(text)` e `searchNotebooks(notebooks, query)`. |
| `components/Modal.jsx`, `components/ConfirmDialog.jsx` | Compartilhados (quem cuida do layout). Usar `<dialog>` nativo ou foco preso (focus trap). |

## 5. Mudanças no store (combinar com quem cuida do storage)
`useStore.js` já tem `addNotebook`, `updateNotebook` e `removeNotebook`, mas **faltam as ações de fonte**:
```js
/**
 * @param {string} notebookId
 * @param {Omit<import('../types.js').Source, 'id'>} src
 * @returns {string} id da fonte criada
 */
addSource: (notebookId, src) => {}

/**
 * @param {string} notebookId
 * @param {string} sourceId
 * @param {Partial<Omit<import('../types.js').Source, 'id'>>} patch
 */
updateSource: (notebookId, sourceId, patch) => {}

/**
 * @param {string} notebookId
 * @param {string} sourceId
 */
removeSource: (notebookId, sourceId) => {}
```
Regras: gerar `id` com `uid()`; remover tags vazias e duplicadas; **nunca** salvar `url` que não passe em `safeHttpUrl`.

## 6. Fluxos
**Criar caderno**
1. Botão "Novo caderno" abre `NotebookForm`.
2. Nome obrigatório (após `trim`, 1 a 60 caracteres). Bioma obrigatório, pré-selecionado em `planicie` **[CONFIRMAR C2]**.
3. Salvar chama `addNotebook({ name, biome })` e leva para `#/cadernos/:id`.

**Renomear / trocar bioma**: mesmo formulário preenchido, `updateNotebook`. Árvores já plantadas **mantêm o bioma original** (cada `Tree` guarda o seu); só novas sessões usam o novo.

**Excluir**: `ConfirmDialog` com texto do tipo "Excluir *Matemática*? Isso apaga 3 tarefas e mantém 12 sessões de foco no histórico, sem vínculo." Só então `removeNotebook`.

**Adicionar fonte**
1. Escolher o tipo. O formulário muda os campos:
   - `link`: título (opcional; se vazio usar o domínio) + URL.
   - `youtube`: URL do vídeo (validar com `parseYouTubeId`) + título.
   - `note`: título + texto.
2. Tags: campo de texto com vírgula/Enter, mostradas como chips removíveis.
3. Salvar chama `addSource`. Erros aparecem **junto ao campo** (`aria-describedby`), sem `alert`.

**Editar e remover fonte**: mesmo formulário preenchido; remover pede confirmação.

**Filtrar por tag**: chips no topo da página do caderno, com seleção múltipla (mostra fontes que tenham **todas** as tags marcadas **[CONFIRMAR C3]**).

**Buscar (RF20)**
- Campo na `NotebooksPage` (todos os cadernos) e outro no detalhe (só aquele caderno).
- `normalize = (t) => t.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()`.
- Debounce de ~200 ms. Mostrar "N resultados" e, em caso de zero, "Nada encontrado para …".
- Resultado da busca global lista o caderno e a fonte encontrada, com link para o detalhe.

## 7. YouTube
Formatos de URL a aceitar em `parseYouTubeId`: `youtube.com/watch?v=ID`, `youtu.be/ID`, `youtube.com/shorts/ID`, `youtube.com/embed/ID`, `youtube.com/live/ID`, com ou sem `www.` e `m.`, ignorando parâmetros extras (`&t=`, `?si=`). Se não reconhecer, retorna `null` e o formulário mostra "Link de vídeo do YouTube inválido".

Embed:
```jsx
<iframe
  src={`https://www.youtube-nocookie.com/embed/${id}`}
  title={`Vídeo: ${title}`}
  loading="lazy"
  allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
  allowFullScreen
  referrerPolicy="strict-origin-when-cross-origin"
/>
```
O `ID` só pode conter `[A-Za-z0-9_-]{11}`, validado em `parseYouTubeId`. Proporção 16:9 com CSS (`aspect-ratio`). Se o usuário estiver offline ou o vídeo bloqueado, mostrar também o link "Abrir no YouTube".

## 8. Segurança (RNF07)
- **Só `http:` e `https:`**. Um link `javascript:alert(1)` seria XSS ao clicar. `safeHttpUrl` usa `new URL()` e confere `protocol`.
- Links externos: `target="_blank" rel="noopener noreferrer"`.
- Notas são **texto puro** (`white-space: pre-wrap`). Sem Markdown/HTML no MVP **[CONFIRMAR C4]**.
- Nunca `dangerouslySetInnerHTML`. Para destacar o termo buscado, divida a string em partes e renderize `<mark>` com React.

## 9. Interface e acessibilidade
- Cards em grade responsiva (1 coluna no celular, 2 a 3 no desktop). Cores do bioma só como detalhe visual, sem ser a única informação (mostrar o nome).
- Formulários em modal com foco preso, `Esc` fecha, foco retorna ao botão que abriu.
- Todo campo com `<label>`. Erros anunciados (`role="alert"` apenas no momento do erro).
- Botões só com ícone precisam de `aria-label`. Alvos de toque de pelo menos 44 px.
- Estados vazios amigáveis em todas as listas.

## 10. Armazenamento
O `localStorage` tem ~5 MB. Notas longas consomem espaço. Sugestões:
- Limitar nota a 20.000 caracteres e título a 120.
- Tratar o erro `QuotaExceededError` no store e avisar o usuário para exportar o backup.

## 11. Casos de borda
| Caso | Comportamento |
|---|---|
| Nome duplicado | Permitido, mas mostrar aviso ("Já existe um caderno com esse nome") **[CONFIRMAR C5]**. |
| Caderno sem fontes | Estado vazio com botão "Adicionar fonte". |
| URL sem `https://` (`site.com`) | Normalizar adicionando `https://`; se ainda for inválida, erro. |
| URL de YouTube em fonte do tipo `link` | Aceitar como link normal (sem embed). |
| Excluir caderno com sessão de foco ativa | Bloquear com mensagem ("Termine ou desista da sessão antes"). |
| ID de caderno inexistente na rota | Mostrar "Caderno não encontrado" com link para a lista. |
| Importar backup com fontes inválidas | O store deve descartar `url` insegura na importação. |

## 12. Critérios de aceite
- [ ] Criar, renomear, trocar bioma e excluir caderno, com confirmação ao excluir.
- [ ] O bioma escolhido aparece no card e é usado pelo Foco (espécies do bioma, tema da árvore).
- [ ] Adicionar link, vídeo do YouTube e nota; editar e remover cada um.
- [ ] Vídeo toca incorporado; URL inválida mostra erro claro; `javascript:` é rejeitada.
- [ ] Tags: criar, remover e filtrar fontes.
- [ ] Busca ignora acentos e maiúsculas, em todos os cadernos e dentro de um caderno.
- [ ] Dados persistem ao recarregar e entram no backup JSON.
- [ ] Botão "Focar" abre o Foco já com o caderno selecionado.
- [ ] Funciona em 360 px e por teclado. `npm run build` passa.

## 13. Dicas para trabalhar com IA
- Ordem sugerida: (1) `lib/*` com pequenos testes manuais no console; (2) ações de fonte no store; (3) lista/criar caderno; (4) detalhe e fontes; (5) YouTube; (6) busca e tags.
- Cole `types.js`, `AGENTS.md` e a seção 8 desta spec no prompt, pois a IA costuma esquecer a validação de URL.
- Peça funções puras para `parseYouTubeId`, `safeHttpUrl` e `normalize`: são fáceis de testar e ótimas para explicar no vídeo.

## 14. Decisões a confirmar
- **C1:** o bioma de um caderno pode ser trocado depois de criado? (Proposta: sim; árvores antigas mantêm o bioma.)
- **C2:** bioma padrão ao criar: planície pré-selecionada ou o usuário é obrigado a escolher?
- **C3:** filtro por várias tags usa "todas" (E) ou "qualquer uma" (OU)?
- **C4:** notas em texto puro ou com Markdown simples (negrito, listas)? Markdown exige biblioteca e sanitização.
- **C5:** nomes de caderno repetidos: bloquear ou só avisar?
- **C6:** ao excluir um caderno, as tarefas dele são **apagadas** (como está no store) ou o usuário escolhe mover para outro caderno?
- **C7:** as fontes podem ser reordenadas manualmente ou ficam por data de criação?
