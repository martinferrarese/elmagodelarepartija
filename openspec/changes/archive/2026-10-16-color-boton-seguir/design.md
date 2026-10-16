## Context

En el paso de integrantes (`paso === 'roster'` en `src/ListaIntegrantes.tsx`), tanto «Agregar» como «Seguir» son `<Button variant='contained' fullWidth>` sin prop `color`, por lo que heredan `primary` (`magoColors.gold`). Ver `proposal.md` para la motivación.

## Goals / Non-Goals

**Goals:**
- Diferenciar el botón de avance «Seguir» usando el rol `secondary` existente en `magoTheme` (`magoColors.cloakMid` `#3B1F6E`, texto `inkOnCloak`), consistente con «Agregar grupo» y «Copiar resultado».

**Non-Goals:**
- Agregar colores nuevos al tema o cambiar el estilo de otros botones del wizard.

## Decisions

### Usar `color='secondary'` en el `Button` de «Seguir»
`magoTheme` ya define `containedSecondary` sin sombra y con hover en `magoColors.cloak`. Pasar `color='secondary'` resuelve la jerarquía visual sin CSS adicional.

**Alternativas consideradas:**
- `variant='outlined'`: reservado para acciones de retroceso («Volver»); le resta peso a la acción de avanzar de paso.
- Invertir colores («Agregar» en `secondary`, «Seguir» en `primary`): descartado; se prefirió mantener «Agregar» en dorado junto al input y usar el violeta para «Seguir».

## Risks / Trade-offs

- [Estado deshabilitado con menos de 2 integrantes] → MUI aplica su estilo `Mui-disabled` estándar sobre `containedSecondary`; una vez habilitado con 2+ integrantes se muestra el violeta `secondary`.
