# ORBI LIVE — Resiliência contínua

## Objetivo
Manter `/live?mode=broadcast` funcionando diante de URLs temporárias expiradas, câmeras indisponíveis e interrupções breves, sem alterar a inteligência editorial existente.

## Implementação
- Renovar localmente os dados da webcam atual quando sua imagem falhar, usando a consulta Windy já existente e sem expor credenciais.
- Se a renovação não produzir uma imagem válida, marcar temporariamente a câmera como falha e avançar pelo selector atual.
- Impedir o retorno imediato de câmeras recém-falhadas, mantendo essa memória limitada e somente durante a sessão.
- Adicionar recuperação controlada quando não houver candidatos, com espera crescente e sem requisições contínuas.
- Adicionar um watchdog leve para detectar cena sem progresso, tentativa de carregamento travada ou ausência prolongada de cena.
- Preservar a imagem anterior durante renovação e trocar apenas depois que a próxima imagem carregar.
- Manter a rotação normal em 45 segundos, a atribuição Windy, os modos WORLD/NOW e os pesos atuais.
- Registrar eventos de recuperação apenas durante desenvolvimento.

## Detalhes técnicos
- Estender o contrato do selector com uma ação de falha/recuperação, mantendo `next()` como seleção de fallback.
- Reutilizar React Query para `refetch` localizado das regiões que contêm a câmera, sem invalidar o cache global.
- Usar backoff limitado e timers com limpeza explícita; nenhuma persistência, novo selector ou sistema paralelo de cache.
- Cobrir a lógica crítica com testes determinísticos quando possível e validar a transmissão no navegador.

## Validação
- Conferir tipos, lint e estado final da compilação.
- Validar cena normal e modo broadcast.
- Simular falha de imagem para confirmar: renovação da mesma câmera, fallback para outra e ausência de loop agressivo.
- Confirmar ausência de erros no console e que a imagem anterior permanece visível durante a recuperação.

## Fora do escopo
Sem expansão mundial, persistência, nova fonte de dados, YouTube/OBS/RTMPS ou IA/LLM.
