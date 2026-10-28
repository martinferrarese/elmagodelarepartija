# Compartir el Cálculo por Link (Sin Login)

Permitir que, una vez calculada la repartija, puedas compartir un enlace directo con tus amigos para que cualquiera lo abra en su celular o navegador —sin registrarse ni iniciar sesión— y vea directamente las **Transferencias**, los **Alias de cobro** y el detalle de **Cómo se calculó**, pudiendo también tocar **Editar** si necesitan revisar o ajustar algún monto.

## User Review & Critical Decisions

> [!IMPORTANT]
> El plan se redujo exclusivamente a la funcionalidad de **compartir el cálculo sin login**, descartando el resto de los cambios para mantener la aplicación simple y directa.

- **Decisión confirmada — Solo compartir el cálculo sin login**: Toda la información del cálculo (`roster`, `cuentas`/`montos`, `origen` y `aliases`) viaja codificada en el propio link (`?juntada=...`), sin cuentas de usuario ni servidores externos.
- **Apertura directa en el resultado**: Quien abre el link entra directamente a la pantalla de **Transferencias** con el cálculo listo, los alias cargados y el acordeón **Cómo se calculó** disponible. Si toca **Editar**, vuelve a la pantalla de carga con todos los nombres y montos listos para modificar.

---

## 1. Overview & Core Concept

- **Qué hace**: Agrega en la pantalla de resultados un control para copiar/compartir el enlace del cálculo actual, y permite que la aplicación reconstruya automáticamente ese cálculo cuando alguien entra desde dicho enlace.
- **Para quién**: Amigos de la juntada que reciben el link por WhatsApp y quieren ver a quién transferirle, qué alias usar y cómo se dividió cada cuenta sin tener que cargar todo de nuevo ni loguearse.
- **Valor principal**: Transparencia total ("Cuentas claras, no magia…") y acceso instantáneo desde cualquier teléfono con un solo link.

---

## 2. User Experience & Visual Design

- **Flujo del usuario**:
  1. **Quien arma la cuenta**: Carga los nombres y montos (en una o varias cuentas), toca **Calcular transferencias** y opcionalmente completa los **Alias de cobro**.
  2. **Compartir el cálculo**: En la pantalla de **Transferencias**, además de **Copiar resultado** (texto para pegar en el chat), tiene el botón **Copiar link** que copia al portapapeles la URL con el cálculo completo (incluyendo los alias que haya escrito) y muestra confirmación en pantalla (`Link copiado`).
  3. **Quien recibe el link**: Al abrir el link en su navegador, ve directamente la pantalla de **Transferencias** con los montos a transferir, los alias de los acreedores y el desplegable **Cómo se calculó**. Si quiere simular un cambio o corregir un gasto, puede tocar **Editar**.
- **Identidad visual y tema**:
  - Se mantiene intacta la estética actual del mago (`Fraunces` + `DM Sans`, superficies lavanda sobre fondo violeta y botones del tema Material UI existente).
  - Si la URL no tiene parámetro o el parámetro está corrupto/incompleto, la aplicación ignora el parámetro y arranca normalmente en `¿Cuánto puso cada uno?`.

---

## 3. Key Product Decisions & Trade-Offs

- **Decisión: Estado autocontenido en la URL (`?juntada=...`)**
  - *Enfoque elegido*: Serializar los datos de la juntada (`origen`, `roster`, subgrupos/montos y `aliases`) en JSON compacto codificado en Base64 URL-safe (`?juntada=...`).
  - *Por qué*: No requiere login, ni base de datos, ni expira con el tiempo; el link funciona siempre en cualquier dispositivo y preserva exactamente las cuentas y alias que se calcularon.

---

## 4. Technical Architecture & Data Strategy

### Diagrama de Arquitectura y Flujo de Datos

```
┌──────────────────────────────────────────────────────────────────────┐
│                     Persona A (Arma la cuenta)                       │
│                                                                      │
│  Carga nombres, montos y alias ──▶ Toca "Copiar link"                │
│                                          │                           │
│                                          ▼                           │
│                       Codifica JSON en Base64 URL-safe               │
│                       https://.../?juntada=eyJ...                    │
└──────────────────────────────────────────┬───────────────────────────┘
                                           │
                                  (Envía por WhatsApp)
                                           │
                                           ▼
┌──────────────────────────────────────────────────────────────────────┐
│                     Persona B (Abre el link)                         │
│                                                                      │
│  Lee ?juntada=... al iniciar ──▶ Valida estructura y montos          │
│                                          │                           │
│                 ┌────────────────────────┴───────────────────────┐   │
│                 ▼ (Válido)                                       ▼   │
│  Abre directo en paso "resultado":                    (Vacío o roto) │
│  - Muestra Transferencias                             Arranca normal │
│  - Muestra Alias de cobro                             en paso "lista"│
│  - Muestra "Cómo se calculó"                                         │
│  - Permite "Editar" cuentas/montos                                   │
└──────────────────────────────────────────────────────────────────────┘
```

### Modelo de Datos y Mapeo de Interacciones

- **Módulo de serialización (`src/repartija/compartir.ts`)**:
  - `codificarJuntadaCompartida(...)`: Toma `origen`, `roster`, `montos` / `cuentas` y `aliases` (solo los no vacíos) y devuelve el string codificado en Base64 URL-safe compatible con caracteres en español (UTF-8).
  - `decodificarJuntadaCompartida(param)`: Valida que el payload tenga al menos 2 integrantes únicos en `roster`, que cada subgrupo tenga al menos 2 miembros incluidos con montos enteros `>= 0`, y reconstruye tanto el estado editable (`roster`, `montos`, `cuentas`, `aliases`, `origen`) como el `Juntada` para calcular `transferencias` y `desglose`.
- **Integración en `ListaIntegrantes.tsx`**:
  - Al inicializar el estado, inspecciona `window.location.search`. Si `decodificarJuntadaCompartida` devuelve un estado válido, inicializa directamente en `paso = 'resultado'` con las transferencias y el desglose ya calculados.
  - En la vista de `resultado`, agrega el botón **Copiar link** que genera la URL con `?juntada=...`, la copia al portapapeles con `navigator.clipboard.writeText` y muestra el aviso de confirmación.
