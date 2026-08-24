/**
 * Relato de erros desacoplado de qualquer ambiente específico.
 * Hoje apenas registra no console; pode ser ligado a um serviço externo depois.
 */
export function reportError(error: unknown, context: Record<string, unknown> = {}) {
  if (typeof console !== "undefined") {
    console.error("[orbi] error", error, context);
  }
}
