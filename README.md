# Grove

Aplicativo web para estudar com foco: cronômetro que faz uma árvore crescer, tarefas em kanban e cadernos de estudo por matéria. Tudo roda no navegador, sem back-end.

- **Tema:** produtividade e estudo
- **Integrantes:** Arthur _(sobrenome)_ e Vanderlei _(sobrenome)_
- **Site (GitHub Pages):** _(link: https://SEU-USUARIO.github.io/Grove/)_
- **Repositório:** _(link)_

## Objetivo, problema e público-alvo
Estudantes têm dificuldade de manter o foco e de organizar o estudo por matéria. O Grove junta sessões de foco com recompensa visual (uma floresta que cresce), um quadro de tarefas e cadernos com fontes de estudo, mostrando depois quanto tempo foi dedicado a cada matéria e tarefa.
**Público-alvo:** estudantes que precisam de foco e organização por matéria.

## Tecnologias
React 18, Vite, JavaScript (JSX), React Router (HashRouter), Zustand (com persistência em `localStorage`), @dnd-kit (arrastar e soltar no kanban), Chart.js com react-chartjs-2 (gráficos) e Vitest (testes). Árvores e biomas desenhados em SVG.

## Principais recursos
- **Foco:** sessões de 15 a 120 min; pausar só depois de 10 min; desistir descarta tudo. O tempo é calculado por diferença de horários e a sessão conclui mesmo se você navegar para outra tela. Vínculo opcional com tarefa e caderno; escolha da espécie e de plantar uma árvore nova ou evoluir uma existente (4 estágios).
- **Meta diária:** defina quantos minutos quer focar hoje e acompanhe o progresso numa barra.
- **Avisos ao terminar:** notificação do navegador (com a aba em segundo plano) e/ou um tom curto, ambos opcionais e desligados por padrão.
- **Floresta:** resumo por bioma (árvores, adultas e minutos de foco) e uma cena para cada um dos 4 biomas.
- **Gráficos:** tempo de foco por dia, semana, mês, caderno, tarefa e bioma, com tabela acessível ao lado do gráfico, além da sequência atual e da melhor sequência de dias com foco.
- **Tarefas:** kanban com colunas personalizáveis, prioridade, prazo (com sinalização de atraso), filtros por caderno, prioridade, prazo e texto, arrastar e soltar por mouse, toque e teclado (pelo botão "Arrastar" de cada cartão), além do seletor "Mover para".
- **Cadernos:** cada matéria tem um bioma e guarda fontes (links, vídeos do YouTube incorporados e notas) com tags, busca sem acento e filtro por tags.
- **Modo escuro:** tema Claro, Escuro ou Sistema (segue o sistema operacional), com contraste de texto de pelo menos 4,5:1.
- **Backup e dados de exemplo:** exportar e importar os dados em JSON, com validação na importação, e carregar dados de exemplo para conhecer o app.
- **Acessibilidade e segurança:** navegação por teclado, rótulos nos formulários, foco visível; links validados (só http/https) e texto do usuário sempre como texto.

## Requisitos funcionais e não funcionais
<!-- TODO: copiar do documento de requisitos apenas o que foi feito.
     Áreas: Foco RF01 a RF06, Floresta RF07, Gráficos RF08 a RF10, Tarefas RF11 a RF15, Cadernos RF16 a RF20. -->
_(copiar do documento de requisitos, removendo o que não foi feito)_

## Como acessar e usar
1. Abra o site (link acima).
2. Em **Cadernos**, crie um caderno por matéria e escolha o bioma; adicione fontes se quiser.
3. Em **Tarefas**, crie tarefas ligadas a um caderno e organize no kanban.
4. Em **Foco**, escolha a duração, vincule tarefa e caderno, escolha a espécie e clique em **Plantar**.
5. Veja as árvores em **Floresta** e o tempo dedicado em **Gráficos**.
6. Em **Tema**, no topo da página, escolha Claro, Escuro ou Sistema.

<!-- TODO: tirar 2 ou 3 capturas (Foco em andamento, Floresta, Tarefas), salvar em docs/img/ e incluir assim:
![Sessão de foco em andamento, com a árvore crescendo e o tempo restante](docs/img/foco.png)
![Floresta com o resumo por bioma](docs/img/floresta.png)
![Quadro de tarefas em colunas](docs/img/tarefas.png)
-->

## Como rodar localmente
```bash
npm install
npm run dev
```
Build de produção: `npm run build`. Testes: `npm test`.

## Limitações conhecidas
- Os dados ficam só no navegador (`localStorage`, ~5 MB): não há sincronização entre dispositivos nem entre abas. Use **Exportar dados** para guardar backup.
- Fechar ou recarregar a aba durante uma sessão de foco descarta a sessão e a árvore (de propósito).
- Não há upload de arquivos nas fontes dos cadernos.
- As cenas dos biomas (céu e chão) mantêm cores claras também no modo escuro.

## Participação de cada integrante
| Integrante | Contribuição |
|---|---|
| Arthur | Componente `Modal` e estilos compartilhados, Tarefas (kanban acessível, filtros de prazo), Cadernos, Gráficos (sequência de dias e visão por bioma), modo escuro, testes automatizados, `index.html` e README. |
| Vanderlei | _(pedir ao Vanderlei)_ |
