# Grove

Aplicativo web para estudar com foco: cronômetro que faz uma árvore crescer, tarefas em kanban e cadernos de estudo por matéria. Tudo roda no navegador, sem back-end.

- **Tema:** produtividade e estudo
- **Integrantes:** _(preencher)_
- **Site (GitHub Pages):** _(link)_
- **Repositório:** _(link)_

## Objetivo, problema e público-alvo
Estudantes têm dificuldade de manter o foco e de organizar o estudo por matéria. O Grove junta sessões de foco com recompensa visual (uma floresta que cresce), um quadro de tarefas e cadernos com fontes de estudo, mostrando depois quanto tempo foi dedicado a cada matéria e tarefa.
**Público-alvo:** estudantes que precisam de foco e organização por matéria.

## Tecnologias
React 18, Vite, JavaScript (JSX), React Router (HashRouter), Zustand (com persistência em `localStorage`), @dnd-kit (arrastar e soltar no kanban), Chart.js com react-chartjs-2 (gráficos). Árvores e biomas desenhados em SVG.

## Principais recursos
- **Foco:** sessões de 15 a 120 min; pausar só depois de 10 min; desistir descarta tudo. O tempo é calculado por diferença de horários e a sessão conclui mesmo se você navegar para outra tela. Vínculo opcional com tarefa e caderno; escolha da espécie e de plantar uma árvore nova ou evoluir uma existente (4 estágios).
- **Floresta:** resumo por bioma (árvores, adultas e minutos de foco) e uma cena para cada um dos 4 biomas.
- **Gráficos:** tempo de foco por dia, semana, mês, caderno e tarefa, com tabela acessível ao lado do gráfico.
- **Tarefas:** kanban com colunas personalizáveis, prioridade, prazo (com sinalização de atraso), filtros, arrastar e soltar por mouse, toque e teclado, além do seletor "Mover para".
- **Cadernos:** cada matéria tem um bioma e guarda fontes (links, vídeos do YouTube incorporados e notas) com tags, busca sem acento e filtro por tags.
- **Backup:** exportar e importar os dados em JSON, com validação na importação.
- **Acessibilidade e segurança:** navegação por teclado, rótulos nos formulários, foco visível; links validados (só http/https) e texto do usuário sempre como texto.

## Requisitos funcionais e não funcionais
_(copiar do documento de requisitos, removendo o que não foi feito. Áreas cobertas pelas specs: Foco RF01 a RF06, Floresta RF07, Gráficos RF08 a RF10, Tarefas RF11 a RF15, Cadernos RF16 a RF20.)_

## Como acessar e usar
1. Abra o site (link acima).
2. Em **Cadernos**, crie um caderno por matéria e escolha o bioma; adicione fontes se quiser.
3. Em **Tarefas**, crie tarefas ligadas a um caderno e organize no kanban.
4. Em **Foco**, escolha a duração, vincule tarefa e caderno, escolha a espécie e clique em **Plantar**.
5. Veja as árvores em **Floresta** e o tempo dedicado em **Gráficos**.

_(incluir 2 ou 3 capturas de tela)_

## Como rodar localmente
```bash
npm install
npm run dev
```
Build de produção: `npm run build`.

## Limitações conhecidas
- Os dados ficam só no navegador (`localStorage`, ~5 MB): não há sincronização entre dispositivos nem entre abas. Use **Exportar dados** para guardar backup.
- Fechar ou recarregar a aba durante uma sessão de foco descarta a sessão e a árvore (de propósito).
- Não há upload de arquivos nas fontes dos cadernos.

## Participação de cada integrante
| Integrante | Contribuição |
|---|---|
| _(nome)_ | _(o que fez)_ |
