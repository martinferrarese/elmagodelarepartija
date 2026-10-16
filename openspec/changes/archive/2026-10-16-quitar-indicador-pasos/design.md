## Context

`src/ListaIntegrantes.tsx` renderiza al inicio de `.App-panel` un `<nav className='step-indicator' aria-label='Pasos'>` con tres `<span>` (`1 · Integrantes`, `2 · Subgrupos`, `3 · Resultado`) estilizados en `src/App.css` como píldoras. Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Quitar por completo el indicador superior de pasos y sus reglas CSS asociadas.

**Non-Goals:**
- Reemplazarlo por otro indicador de progreso o alterar la navegación entre pasos.

## Decisions

### Eliminar el bloque JSX y las reglas `.step-indicator*`
Cada paso ya encabeza el panel con su propio `Typography variant='h6'` (`¿Quiénes están en la juntada?`, `Subgrupos y montos`, `Transferencias`), por lo que el panel arranca directamente con el mensaje de error (si hubiera) y el `Stack` del paso activo.

**Alternativas consideradas:**
- Texto plano «Paso 1 de 3» o puntos indicadores: descartado por pedido explícito de omitir las etiquetas.

## Risks / Trade-offs

- [Ninguno relevante] → Ningún test ni lógica de negocio depende de `.step-indicator` ni del arreglo `pasos`.
