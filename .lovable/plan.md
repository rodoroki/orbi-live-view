# Evolução de interação e descoberta do ORBI LIVE

## Objetivo
Transformar a home em uma exploração participativa, preservando o planeta como protagonista, o visual atual, as fontes reais, as rotas e o modo Broadcast.

## Implementação

1. **Camada reutilizável de descoberta**
   - Criar um `DiscoveryPrompt` compacto, acessível e descartável para mensagens, perguntas e ações contextuais.
   - Criar um gerador editorial determinístico que derive ganchos humanos exclusivamente da categoria, tempo e contexto de eventos reais já carregados.
   - Disponibilizar ações como “Ver no planeta”, “Explorar esta região”, “Entender o que aconteceu” e “Ver outros eventos” somente quando a ação tiver destino real.

2. **Globo e mapa mais responsivos**
   - Refinar hover, foco e seleção das pastilhas, com estado selecionado inequívoco e transições curtas.
   - Exibir uma chamada contextual breve ao selecionar um evento, antes da leitura técnica já existente.
   - Reutilizar o `flyTo` atual para “Ver no planeta” e exploração de região, sem novos controles permanentes.

3. **Timeline como descoberta**
   - Adicionar microcopy contextual ao estado ao vivo e ao recuo histórico.
   - Manter o futuro vazio, pois as fontes atuais não sustentam previsão.
   - Tornar a mudança histórica mais legível por contagem contextual, usando apenas eventos realmente disponíveis naquela janela.

4. **Microdesafio leve**
   - Oferecer um único desafio opcional baseado em um evento real destacado: localizar seu ponto no planeta.
   - Detectar a seleção correta e responder apenas “Encontrou.”, sem pontuação, ranking, badge ou persistência.
   - Não bloquear a exploração e ocultar o desafio quando não houver eventos reais.

5. **Continuidade editorial**
   - Reorganizar itens e detalhes de eventos: primeiro um gancho humano factual, depois título, local, severidade, categoria e horário.
   - Ao aprofundar uma descoberta, apresentar a próxima ação contextual adequada, formando a sequência descobrir → entender → explorar.
   - Usar na home três superfícies já existentes, sem criar feed: “Agora no planeta”, timeline e painel da descoberta selecionada.

6. **Idiomas, acessibilidade e movimento**
   - Adicionar toda a nova microcopy em português, inglês e espanhol.
   - Garantir foco por teclado, anúncios discretos de conclusão, áreas de toque mobile e respeito a `prefers-reduced-motion`.
   - Não adicionar dependências nem animações contínuas pesadas.

## Arquivos previstos
- Novo componente de prompt em `src/components/orbi/`.
- Nova utilidade editorial em `src/lib/intelligence/` e exportação pelo índice existente.
- Ajustes em `src/routes/index.tsx`, `DiscoveryCard.tsx`, `EventsPanel.tsx`, `NowOnPlanet.tsx`, `TimelineBar.tsx`, `GlobeView.tsx` e `FlatMapView.tsx`.
- Novos textos nos três arquivos de idioma e pequenos refinamentos em `src/styles.css` apenas se necessários.
- Registro da decisão arquitetural em `AGENTS.md`.

## Validação
- Executar testes seletivos da lógica editorial, typecheck, lint e build disponíveis.
- Verificar a home em desktop e mobile, incluindo seleção, desafio, timeline, teclado e ausência de sobreposição.
- Abrir as rotas atuais principais para confirmar que continuam funcionando e preservar `/live` e Broadcast sem alterações.

## Assunção
A primeira iteração concentrará as novas interações na home, reutilizando os painéis existentes nas demais páginas. Mensagens só aparecem quando há eventos reais carregados; nenhuma mensagem simulará atividade ou histórico.
