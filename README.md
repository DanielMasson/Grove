# Grove

Aplicativo web para estudar com foco: cronômetro que faz uma árvore crescer, tarefas em kanban e cadernos de estudo por matéria. Tudo roda no navegador, sem back-end.

- **Tema:** produtividade e estudo
- **Integrantes:** Ana Luisa Paixão, Arthur Araujo, Daniel Masson, Gabriela Nietiedt e Vanderlei Pittan.
- **Site (GitHub Pages):** https://danielmasson.github.io/Grove/
- **Repositório:** https://github.com/DanielMasson/Grove/

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
Requisitos funcionais (RF):
Foco (inspirado no Forest)
RF01. O usuário pode iniciar um cronômetro de foco escolhendo a duração (ex.: 15, 25, 45 min ou valor personalizado).
RF02. O usuário pode pausar, retomar ou desistir da sessão.
RF03. Durante a sessão, uma árvore cresce de forma visual conforme o tempo passa.
RF04. Ao concluir a sessão, a árvore é “plantada” na floresta do usuário. Se ele desistir, a árvore não é plantada e nem cresce.
RF05. O usuário pode vincular a sessão a uma tarefa ou a um caderno.
RF06. O sistema registra cada sessão (data, duração, status e vínculo).
Floresta e gráficos
RF07. O sistema exibe a floresta com todas as árvores plantadas.
RF08. O sistema exibe gráficos de tempo de foco por dia, semana e mês.
RF09. O sistema exibe o tempo de foco por caderno e/ou por tarefa.
RF10. O sistema mostra estatísticas resumidas (total de horas, média diária, sessões concluídas, sequência de dias).
Tarefas (inspirado no Trello, uso individual)
RF11. O usuário pode criar, editar e excluir tarefas, com título, descrição, prazo e prioridade.
RF12. As tarefas ficam organizadas em colunas ( A fazer, Em andamento, Concluído).
RF13. O usuário pode mover tarefas entre colunas (arrastar e soltar).
RF14. O sistema destaca tarefas com prazo próximo ou vencido.
RF15. O usuário pode filtrar tarefas por prioridade ou caderno.
Cadernos (inspirado no Google NotebookLM)
RF16. O usuário pode criar, renomear e excluir cadernos de estudo que são nomeadas ‘florestas’.
RF17. O usuário pode adicionar fontes a um caderno: links de sites, vídeos do YouTube e notas de texto.
RF18. O usuário pode editar e remover fontes, e organizá-las por categoria ou etiqueta.
RF19. O sistema exibe vídeos do YouTube incorporados dentro do caderno.
RF20. O usuário pode buscar por texto dentro dos cadernos e das fontes.
Gerais
RF21. Os dados ficam salvos no navegador (localStorage) e permanecem ao recarregar a página.
RF22. O usuário pode exportar e importar seus dados em arquivo JSON (backup).
RF23. A navegação entre as telas (Foco, Floresta/Gráficos, Tarefas, Cadernos) é acessível em qualquer momento por um menu.

Requisitos não funcionais (RNF)
RNF01. Usabilidade: interface simples e consistente, com ações principais a no máximo 2 ou 3 cliques e mensagens claras de confirmação (ex.: antes de excluir).
RNF02. Responsividade: o layout se adapta a celular, tablet e computador.
RNF03. Desempenho: carregamento rápido (sem back-end), sem travamentos ao alternar entre telas ou renderizar gráficos.
RNF04. Precisão do cronômetro: o tempo é calculado pela diferença entre horários (e não só por contagem de intervalos), para continuar correto mesmo com a aba em segundo plano.
RNF05. Acessibilidade: contraste adequado, textos alternativos, navegação por teclado, rótulos nos formulários e uso de HTML organizado.
RNF06. Persistência e privacidade: os dados ficam apenas no dispositivo do usuário, sem login e sem envio a servidores.
RNF07. Segurança: o conteúdo digitado pelo usuário é tratado como texto (evitando injeção de HTML/XSS) e os links externos abrem com rel="noopener noreferrer".
RNF08. Disponibilidade: hospedado no GitHub Pages, acessível por link público, sem instalação.
RNF09. Manutenibilidade: código organizado em pastas e módulos (ex.: storage.js, timer.js, tasks.js, notebooks.js), com nomes claros e comentários nos trechos principais.
RNF10. Documentação: README completo, com requisitos, instruções de uso e participação de cada integrante.


## Como acessar e usar
1. Abra o site (link acima).
2. Em **Cadernos**, crie um caderno por matéria e escolha o bioma; adicione fontes se quiser.
3. Em **Tarefas**, crie tarefas ligadas a um caderno e organize no kanban.
4. Em **Foco**, escolha a duração, vincule tarefa e caderno, escolha a espécie e clique em **Plantar**.
5. Veja as árvores em **Floresta** e o tempo dedicado em **Gráficos**.
6. Em **Tema**, no topo da página, escolha Claro, Escuro ou Sistema.

<img width="1827" height="916" alt="image" src="https://github.com/user-attachments/assets/6a7f5085-6c9f-4cf2-9970-ec22a3fd2c6a" />
<img width="1822" height="901" alt="image" src="https://github.com/user-attachments/assets/f3a97e9b-c2ab-4cb2-bad6-87203d29418f" />

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
|Ana|Revisão dos requisitos funcionais e não funcionais, tester geral e Scrum Master|
| Arthur | Componente `Modal` e estilos compartilhados, Tarefas (kanban acessível, filtros de prazo), Cadernos, Gráficos (sequência de dias e visão por bioma), modo escuro, testes automatizados, `index.html` e README. (Desenvolvedor)|
|Daniel|Desenvolvedor principal e dono do repositório|
|Gabriela|Requisitos funcionais, organização das inspirações (sites e telas) e organização do projeto em geral, editora do vídeo|
| Vanderlei |Desenvolvedor secundário e criador do email e do canal no youtube|
