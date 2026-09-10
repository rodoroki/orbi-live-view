# Ícones oficiais do ORBI LIVE

## Objetivo
Substituir exclusivamente o favicon atual por um símbolo minimalista de globo, sem alterar páginas, conteúdo ou funcionalidades.

## Implementação
- Criar um globo simples e legível em `favicon.svg`.
- Gerar versões PNG em 16, 32, 48, 180, 192 e 512 px, além de `favicon.ico` compatível.
- Atualizar o cabeçalho para usar uma única família coerente de ícones, incluindo Apple Touch Icon.
- Não criar manifest caso o projeto não possua PWA existente.

## Verificação
- Confirmar as referências finais no cabeçalho e a ausência do favicon anterior.
- Validar visualmente o símbolo em tamanhos pequenos.
- Conferir lint, tipos e compilação do projeto.
