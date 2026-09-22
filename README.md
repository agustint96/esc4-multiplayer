# Escenario 4 · tutorial, contra la PC, de a dos u online

El minijuego del escenario 4 de
[agustint96.github.io](https://github.com/agustint96/agustint96.github.io),
tal cual (mismo `esc4-game.js`, `script.js`, `styles.css`, sprites y sonidos,
copiados de ese repo), con una segunda nave manejada por la PC o por otra
persona en el mismo teclado o en otra PC por internet.

## Modos

Al arrancar se elige con el teclado. Durante el juego, el botón **MENU**
(arriba a la izquierda) o **Escape** vuelven a esta elección.

- **1 · tutorial**: el juego del sitio con una sola nave, sin las navecitas de
  la intro ni del final: las instrucciones, una lluvia de piedras de borde
  blanco, si te pegan se reinicia, la cuenta de 10 a 1 y la nave se tiñe del
  todo. Al completar los 10 agujeros, GANASTE y de vuelta al menú.
- **2 · contra la PC**: vos con WASD o flechas (Shift acelera, Espacio aleja
  la cámara), sin tutorial: arranca el juego directo. La nave de la PC se ve
  semitransparente.
- **3 · dos jugadores**: sin tutorial, y la cámara muestra el mapa entero para
  que nadie quede fuera de pantalla.
  - Con un **joystick** conectado: el jugador 1 tiene todo el teclado (como en
    el sitio) y el jugador 2 el joystick (stick o cruceta, RB acelera).
  - Sin joystick: el jugador 1 WASD y Shift izquierdo, el jugador 2 las
    flechas y Shift derecho.
  La pantalla de elección muestra cuál de los dos va a ser. Si el navegador
  no ve el joystick, apretá cualquier botón del joystick (los navegadores no
  lo muestran hasta que se toca).
- **4 · online**: busca a alguien que también esté buscando y juegan cada uno
  en su PC, con los controles de siempre y la cámara siguiendo a tu nave.
  MENU o Escape cancelan la búsqueda o te sacan de la partida; salir cuenta
  como irse: al rival le aparece EL RIVAL SE FUE y vuelve a su elección.

## Online

El emparejador está en `servidor/` (un Worker de Cloudflare con un Durable
Object): junta de a dos a los que buscan y reenvía lo que manda cada uno.
Cada PC maneja su nave y su lluvia y le manda al otro 20 veces por segundo
dónde está, sus piedras y si está golpeada; cada una detecta sola los golpes
a su nave. Los agujeros y los goles los decide el anfitrión (el que estaba
esperando). Las posiciones viajan como fracción de la pantalla, así juegan
bien aunque los monitores sean de distinto tamaño.

Una vez emparejados, el servidor solo los presenta: el juego va directo de
una PC a la otra (WebRTC), porque la sala quedó lejos, en Miami (se le pide
Sudamérica, pero Cloudflare no tiene Durable Objects ahí). Si la conexión
directa no se logra (hay redes que no la dejan), todo sigue pasando por el
servidor. En la consola del navegador (F12) aparece "[online] conexión directa
con el rival" cuando se logra. Para ver en qué centro de datos de Cloudflare
está la sala: `https://esc4-emparejador.agustintardella7.workers.dev/donde`.

Para subir cambios del servidor: `cd servidor` y `npx wrangler deploy`. Para
probar el servidor en la PC: `npx wrangler dev` y abrir el juego con
`?servidor=ws://127.0.0.1:8787/buscar`.

## Reglas

- Tu nave lleva un halo **azul** y la de la PC uno **rojo**; las dos tienen
  su fuego. La de la PC se ve semitransparente, para no confundirlas.
- Cada nave tiene su lluvia de piedras que la persigue: borde **azul** las
  tuyas, borde **rojo** las de la PC. Caen la mitad de seguido que en el
  juego original (son dos lluvias).
- **Cualquier piedra golpea a cualquier nave.** La golpeada cae, desaparece y
  a los **3 segundos** vuelve donde la golpearon, con los goles que tenía, y
  parpadea **2 segundos** en los que no la afecta nada. Mientras está fuera de
  juego o parpadeando no nacen piedras suyas y las que venían dejan de
  perseguirla.
- Los **agujeros de gusano** aparecen de a pares, como siempre: el primero que
  entra a uno suma un gol y sale por el otro.
- Gana el primero en llegar a **10**. El marcador está en el cuadrado del
  medio (tus goles en blanco, los de la PC en rojo) y la voz cuenta 1, 2, 3…
- El color de la partida (las dos naves, el fondo, las piedras, los agujeros
  y el marcador) avanza cuando alguno llega primero a un número de goles, y
  como mucho llega al color del agujero 7 del juego original, repartido en
  los 10 goles.
- Cuando las naves se acercan se repelen un poco, sin llegar a chocarse
  (nadie se lastima ni pierde el control).
- Al terminar aparece un cartel (GANASTE / GANO LA PC, o GANO J1 / GANO J2)
  y arranca otra partida en el mismo modo.

## Qué cambia respecto del sitio

- `script.js`: arranca directo en el escenario 4 (sin pasar por el index), el
  escenario no tiene bordes de salida y hay un `shipPush` para empujar la
  nave sin sacarle el control (la repulsión entre naves); con dos jugadores
  las flechas y el Shift derecho no mueven la nave del jugador 1 y la cámara
  va sin zoom.
- `js/esc4-game.js`: la PC (bloque "Modo contra la PC"), las dos lluvias, el
  golpe con 3 s fuera de juego en vez de reiniciar la partida, el marcador, la
  voz contando para arriba, y sin la intro ni el final de las navecitas (se
  arranca en la oscuridad con el tutorial).
- `styles.css`: colores del marcador, halo azul de tu nave, la nave oculta
  mientras está fuera de juego y el parpadeo al volver.

El resto es el sitio original sin tocar. Si cambiás el juego en el portfolio
y querés traer esos cambios acá, hay que volver a aplicar esas tres cosas.

## Cómo correrlo

Necesita servirse por http (no abriendo el `index.html` directo):

```
npx http-server .
```

y abrir `http://127.0.0.1:8080` en el navegador (con Ctrl+Shift+R si se
cambió algo, para que no use lo guardado).
