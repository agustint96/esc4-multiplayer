# Escenario 4 · tutorial, contra la PC, de a dos u online

El minijuego del escenario 4 de
[agustint96.github.io](https://github.com/agustint96/agustint96.github.io),
tal cual (mismo `esc4-game.js`, `script.js`, `styles.css`, sprites y sonidos,
copiados de ese repo), con una segunda nave manejada por la PC o por otra
persona en el mismo teclado o en otra PC por internet.

## Modos

Al abrir la página hay una presentación: primero el logo en el medio de la
pantalla negra; después se aclara y aparece un agujero de gusano, llega la
nave (a color), lo mira y se mete. En otra pantalla, la del menú, sale por
otro agujero y se va hacia la derecha; la cámara la sigue hasta que el menú
queda en el medio, y ahí la nave sigue de largo (vuelve al elegir un modo).
Como los navegadores no dejan sonar nada hasta que se toca la página, si
todavía no se la tocó, al irse el logo la pantalla negra dice "presiona
cualquier tecla" y la presentación sigue con ese toque. Ya en marcha,
cualquier tecla, un click o el botón A la saltean. Mientras la nave mira el
menú no hay ninguna opción marcada: recién cuando se va se marca la primera.
Después se elige el modo con el teclado. Al pasar de una opción a otra suena
`selector.mp3` y al elegir una, `seleccion.mp3` (en `audio/Esc4/game sound/`),
también en la pausa y en el cartel de salir del online. Durante el juego, el botón **MENU**
(arriba a la izquierda) o **Escape** vuelven a esta elección.

- **1 · tutorial**: el juego del sitio con una sola nave, sin las navecitas de
  la intro ni del final: las instrucciones, una lluvia de piedras de borde
  blanco, si te pegan se reinicia, la cuenta de 10 a 1 y la nave se tiñe del
  todo. Al completar los 10 agujeros, GANASTE y de vuelta al menú.
- **2 · contra la PC**: vos con WASD o flechas (Shift acelera, Espacio aleja
  la cámara), sin tutorial: arranca el juego directo. La nave de la PC se ve
  semitransparente. La **dificultad** (fácil, regular o difícil) se elige
  en el menú, parado en esta opción: aparece abajo de "J1 teclado" y se
  cambia con los costados (LB y RB, el stick o la cruceta, las flechas, A y D
  o la ruedita), dando la vuelta; queda recordada. La PC se mueve siempre con la misma
  física que vos: la dificultad solo cambia cómo decide (cuánto tarda en
  salir a buscar un agujero nuevo, qué tan rápido se da cuenta de una
  piedra, desde qué distancia la esquiva, cuánto se equivoca de agujero o
  duda, y si usa el boost). Medido con la PC sola: tarda en promedio 4,6 s
  en meterse en un agujero en fácil, 3,2 en regular y 2,1 en difícil, y la
  golpean 7, 5,5 y 4 veces por minuto. Ver `DIFICULTADES` en
  `js/esc4-game.js`. Cuando no hay agujeros pasea por el mapa por su cuenta.
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
  Antes de buscar pide una **clave**: solo se juntan los que escriben la
  misma, y vacía es con cualquiera (los que no pusieron clave). Se guarda en
  minúsculas, solo letras y números, hasta 16, y queda escrita para la
  próxima vez. Con el joystick no se puede escribir: A busca con la que haya
  y B vuelve al menú.
  MENU o Escape cancelan la búsqueda o te sacan de la partida; salir cuenta
  como irse: al rival le aparece EL RIVAL SE FUE y vuelve a su elección.

## El mapa del online

El juego está en `juego.html`; `index.html` es el marco que lo muestra.
Normalmente el juego ocupa toda la ventana, como siempre. Online no alcanza:
el juego se mueve en píxeles, así que con pantallas distintas cada uno
jugaría en un mapa distinto (el de la pantalla chica tendría todo más cerca y
lo cruzaría más rápido). Por eso, al emparejarse, cada uno le manda al otro
el tamaño de su ventana y los dos acuerdan el mismo mapa: con la forma de la
ventana más angosta (así ninguno ve más mapa que el otro) y el alto de la
más alta (así en la chica el juego se achica, que se ve mejor que
agrandarlo). El marco pone el juego de ese tamaño y lo escala a la ventana;
lo que sobra son franjas de estrellas, sin juego. Si los dos tienen pantallas
parecidas, casi no hay franjas. Al salir del online vuelve a toda la ventana.

Lo que venga en la dirección (`?servidor=`, `?calidad=`, `?perf=1`) el marco
se lo pasa al juego.

## Adentro del portfolio

El escenario 4 de [agustint96.github.io](https://agustint96.github.io) ya no
tiene su propio juego: muestra este (`/esc4-multiplayer/`) en un iframe que
tapa todo, así lo que se cambia acá aparece allá sin copiar nada. Adentro del
iframe no está el logo de la presentación (se arranca en el menú) y el menú
suma **5 · volver al sitio**; con eso, o con Escape en el menú, el juego le
avisa al marco y el marco al sitio (`esc4-volver`), y la nave vuelve al
escenario principal por el borde derecho. El marco le avisa al juego que está
en el portfolio con `?embebido=1`. Suelto, en su propia página, todo sigue
como siempre.

Como el sitio carga lo que esté publicado acá, hay que subir este repo antes
que un cambio del sitio que dependa de algo nuevo de acá.

## Online

El emparejador está en `servidor/` (un Worker de Cloudflare con un Durable
Object): junta de a dos a los que buscan y reenvía lo que manda cada uno. Hay
una espera por clave (`/buscar?clave=...`); sin clave es la de cualquiera, así
que un juego de antes de las claves sigue encontrando rival.
Cada PC maneja su nave y su lluvia y le manda al otro 20 veces por segundo
dónde está, sus piedras y si está golpeada; cada una detecta sola los golpes
a su nave. La forma de cada piedra (sus puntas) no cambia nunca, así que viaja
una sola vez apenas nace, por el camino que no pierde nada, y en el estado va
solo dónde está; si a alguno igual le falta una, la pide. Como el mapa mide
lo mismo en las dos PCs (ver "El mapa del online"), los dos
juegan en el mismo mapa aunque los monitores sean de distinto tamaño.

Los agujeros y los goles los decide el anfitrión (el que estaba esperando),
pero el invitado no espera la ida y vuelta para salir por el otro agujero: lo
hace en el momento y el anfitrión se lo confirma después. Si el anfitrión no
lo confirma (llegó él primero a ese par), a los pocos segundos el marcador y
los agujeros vuelven a ser los suyos.

Que decida el anfitrión no le da ventaja en los empates: a cada aviso del
invitado se le descuenta lo que tardó en viajar (la mitad del ping), y el gol
del anfitrión se ve al instante pero queda a confirmar un momento (lo que
tarda un mensaje, más 50 ms). Si en ese rato llega el invitado al mismo par
con menos de 50 ms de diferencia, es gol para los dos; si llegó claramente
antes, es solo suyo. Ver "Goles online" en `js/esc4-game.js`.

Una vez emparejados, el servidor solo los presenta: el juego va directo de
una PC a la otra (WebRTC), porque la sala quedó lejos, en Miami (se le pide
Sudamérica, pero Cloudflare no tiene Durable Objects ahí). Si la conexión
directa no se logra (hay redes que no la dejan), todo sigue pasando por el
servidor. Con la conexión directa andando, por el servidor ya no pasa nada:
para que no lo corten por quedarse callado, cada uno le manda un latido cada
20 segundos, y si aun así se cae, la partida sigue igual (que se haya ido el
rival se nota porque deja de llegar su nave, no porque se cayó el socket).
En la consola del navegador (F12) aparece "[online] conexión directa con el
rival" cuando se logra. Para ver en qué centro de datos de Cloudflare está
la sala: `https://esc4-emparejador.agustintardella7.workers.dev/donde`.

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
  entra a uno suma un gol y sale por el otro. Aparecen en cualquier lugar del
  mapa (no solo en lo que ve tu cámara) y nunca pegados a ninguna de las dos
  naves, así no le quedan más cerca a una. Online los crea el anfitrión, pero
  en su pantalla se prenden recién cuando al invitado ya le llegaron: los dos
  los ven aparecer a la vez.
- Gana el primero en llegar a **10**. El marcador está en el cuadrado del
  medio (tus goles en blanco, los de la PC en rojo) y la voz cuenta 1, 2, 3…
- Si las dos naves llegan al mismo par de agujeros casi juntas (menos de
  50 ms entre una y otra), es **gol para las dos**. Si eso deja **10 a 10**,
  es **gol de oro**: aparece el cartel y el próximo gol gana (si ese también
  es de las dos, se sigue). En cada empate así la voz dice "uno más", y el
  gol que define, la felicitación.
- El color de la partida (las dos naves, el fondo, las piedras, los agujeros
  y el marcador) avanza cuando alguno llega primero a un número de goles, y
  como mucho llega al color del agujero 7 del juego original, repartido en
  los 10 goles.
- Cuando las naves se acercan se repelen un poco, sin llegar a chocarse
  (nadie se lastima ni pierde el control).
- Si las dos dan la vuelta por el mismo costado casi a la vez (menos de
  1,2 s entre una y otra), el cielo gira una pantalla entera para ese lado.
  El cielo es un tubo de 3 pantallas: al tercer giro se vuelve a ver el
  mismo. Está pintado sobre un cilindro (las estrellas se juntan hacia los
  costados y al girar aceleran en el medio) y tiene una capa de estrellas
  lejanas, más tenue, que gira la mitad. Es solo el fondo (las piedras y los
  agujeros no se mueven). Online lo decide el anfitrión y se lo avisa al
  invitado, y los dos ven el mismo cielo: el anfitrión le pasa su semilla
  (el número con el que se arman las estrellas). En el tutorial no pasa
  (ahí no se da la vuelta). Los valores están en `CIELO`, en
  `js/esc4-game.js`.
- Al terminar aparece un cartel (GANASTE / GANO LA PC, o GANO J1 / GANO J2)
  y arranca otra partida en el mismo modo.

## Qué cambia respecto del sitio

- `script.js`: arranca directo en el escenario 4 (sin pasar por el index), el
  escenario no tiene bordes de salida y hay un `shipPush` para empujar la
  nave sin sacarle el control (la repulsión entre naves); con dos jugadores
  las flechas y el Shift derecho no mueven la nave del jugador 1 y la cámara
  va sin zoom. El stick del joystick (`stickShip`) a fondo empuja igual que
  las flechas en cualquier dirección, también en diagonal (antes iba bastante
  más lento que el teclado). La física de la nave en el escenario 4 (empuje,
  boost, freno, el stick y cuánto se puede salir de la pantalla) está en un
  solo lugar, `window.naveFisica`, y `js/esc4-game.js` mueve con esa misma
  ficha la nave del jugador 2 y la de la PC: ninguna tiene números propios.
- `js/esc4-game.js`: la PC (bloque "Modo contra la PC"), las dos lluvias, el
  golpe con 3 s fuera de juego en vez de reiniciar la partida, el marcador, la
  voz contando para arriba, y sin la intro ni el final de las navecitas (se
  arranca en la oscuridad con el tutorial).
- `styles.css`: colores del marcador, halo azul de tu nave, la nave oculta
  mientras está fuera de juego y el parpadeo al volver.
- `js/calidad.js` (nuevo): la calidad automática (ver abajo). El filtro gris
  de la nave pasó de SVG (`#nave-gris` en `juego.html`) a CSS (`--nave-sat`).

El resto es el sitio original sin tocar. Si cambiás el juego en el portfolio
y querés traer esos cambios acá, hay que volver a aplicar esas cosas.

## Calidad automática

Mientras se juega, `js/calidad.js` mide cuánto tardan los cuadros. En una PC
que anda bien no cambia nada (calidad **media**, el juego de siempre). Si no
llega a 40 cuadros por segundo, pasa a **baja**: el canvas a 1x, un solo halo
en las naves, el puntero sin resplandor y la estela con la mitad de bocanadas
(más opacas, se ve igual de densa). En pantallas de más de 1,5x que andan
sobradas prueba **alta** (el canvas a 2x, más nítido) y, si los cuadros se
resienten, vuelve a media y no lo intenta más. Lo elegido queda guardado en
el navegador; una PC que quedó en baja vuelve a probar media a la semana.
Nada de esto cambia cómo se juega: el movimiento va por tiempo, no por
cuadros.

Para probar un nivel a mano: `?calidad=baja`, `?calidad=media` o
`?calidad=alta` en la URL. Con `?perf=1` se ven los cuadros por segundo.

## Cómo correrlo

Necesita servirse por http (no abriendo el `index.html` directo). Se abre
`index.html` (el marco); `juego.html` solo también anda, pero online sin el
mapa acordado (cada uno con su ventana):

```
npx http-server .
```

y abrir `http://127.0.0.1:8080` en el navegador (con Ctrl+Shift+R si se
cambió algo, para que no use lo guardado).
