# Cuenta del jueves

**Fecha:** 2026-10-23

## Problema

El mago calcula transferencias a partir de lo que cada uno ya puso. La cuenta del asado es otra cosa: el Brasi pasa un total, se reparte en partes iguales y hay que anotar quién puso, quién está corto y cuánto falta juntar.

## Decisión

Es otra pantalla del mismo sitio, en `/repartijajueves` y `/repartijajueves/`. El mago no la enlaza. Cualquier otra ruta sigue siendo el mago. El marco visual no cambia: sombrero, título, tagline y fondo.

Hay una sola cuenta y vive en el navegador (`localStorage`, clave `repartijajueves`). Otro teléfono que abra la misma URL arranca vacío. Cada cambio se guarda. Si lo guardado está roto, arranca vacía.

## Pantalla

De arriba hacia abajo, dentro del panel:

1. Campo **Total** (el monto del Brasi) e interruptor **Redondeo**.
2. **Total a juntar.** Con el interruptor apagado es el total escrito. Con el interruptor prendido es la cuota redondeada por la cantidad de personas. El campo sigue mostrando el total escrito.
3. **Cuota**, **Anotado** y **Falta**. Si lo anotado supera el total a juntar, el tercero dice **Sobran**. Sin personas, la cuota se muestra como `—` y **Pagó** no cambia montos.
4. **Morosos:** quienes están por debajo de la cuota, con el nombre y cuánto les falta. **Pasan la cuota:** quienes están por encima, con cuánto se pasan. Las dos listas se ocultan cuando están vacías.
5. Filas: nombre editable, monto, **Pagó** y **Quitar**. Una persona nueva entra en 0. **Pagó** la lleva a la cuota vigente. Si ya está justo en la cuota, **Pagó** la vuelve a 0. Si está por encima, **Pagó** la baja a la cuota.
6. Alta: campo Nombre y **Agregar**. Nombre vacío o duplicado (comparación exacta, sensible a mayúsculas, con trim) no se agrega y muestra "Nombre vacío o duplicado."
7. **Vaciar cuenta**, con confirmación en la página. Borra total, redondeo y personas.

## Reglas de plata

Los montos se guardan en centavos enteros. Vacío vale 0. No hay negativos.

Con una o más personas, la cuota visible es el total dividido la cantidad, redondeado al centavo más cercano (mitad hacia arriba). 100.000 entre 7 se ve como 14.285,71.

**Redondeo** toma esa cuota visible y la sube a la centena de pesos siguiente. 14.285,71 y 14.201,12 pasan a 14.300. Si ya es múltiplo de 100, queda igual. El total a juntar pasa a ser esa cuota por la cantidad de personas (14.300 × 7 = 100.100). Apagar el interruptor devuelve el total escrito.

Sin personas no hay cuota. El total a juntar es el del campo aunque **Redondeo** esté prendido.

El tope al editar un monto es la cuota vigente. Si la cuota baja y un monto ya guardado la supera, se sigue mostrando hasta que se edite. Esa edición también queda topeada. Cambiar el total, prender o apagar **Redondeo**, agregar o quitar a alguien no mueve los otros montos.

Falta es el total a juntar menos la suma anotada. Con centavos puede quedar polvo: si 7 pagan 14.285,71, faltan $0,03. **Redondeo** cierra eso.

## Ruta en producción

Cloudflare Pages redirige `/index.html` a `/`. Por eso la ruta no se resuelve reescribiendo a `index.html`: eso termina en la home. El build copia `index.html` a `repartijajueves.html`, y Pages sirve ese archivo en `/repartijajueves`. `/repartijajueves/` redirige ahí. Un `<base href="/">` hace que el JS y el CSS se pidan en la raíz del dominio.

## Tests

Funciones puras para la cuota, el redondeo, el tope, **Pagó**, los morosos, quienes pasan la cuota y el falta. La pantalla cubre el alta, **Pagó**, el redondeo, el tope, la confirmación de vaciar y que la cuenta sobrevive a volver a abrirla. La ruta muestra esta pantalla y el mago no la enlaza.
