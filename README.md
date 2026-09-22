# Escenario 4 · Multiplayer

Spin-off del minijuego del escenario 4 de [agustint96.github.io](https://github.com/agustint96/agustint96.github.io),
pensado como juego 1v1 aparte (no vive en el portfolio, necesita conexión en
tiempo real entre dos jugadores).

## Cómo se juega (diseño acordado)

- 2 jugadores, cada uno con su nave y su propia lluvia de piedras que lo
  persigue a él (fórmula de puntería/compromiso portada tal cual de
  `PUNTERIA`/`BUSQUEDA`/`COMPROMISO` en esc4-game.js, una instancia por
  jugador). Las piedras son polígonos negros con borde blanco, como en el
  juego real — no sprites de asteroide.
- **Cualquier piedra golpea a cualquier nave que la toque**, sea o no la suya.
  Ahí está la táctica: atraer al rival a la zona donde cae tu propia lluvia.
- Al ser golpeada, una nave desaparece **3 segundos**: invulnerable, sin
  lluvia propia, fuera de juego del todo.
- Los **agujeros de gusano aparecen de a pares**, igual que en el juego
  original: el primero en tocar cualquiera de los dos se lleva el punto **y**
  es teletransportado a la posición del otro agujero del par (ahí sigue
  jugando, no es un final). Gana quien llegue a **10**.
- Todavía **sin choque entre naves** (pendiente).

## Motor: qué se portó del juego real y qué no

Investigué a fondo esc4-game.js (y script.js, donde vive la física de vuelo
real) antes de escribir esto. Resumen de decisiones:

- **Cámara**: portada tal cual en espíritu — un zoom con pivote alrededor de
  la nave (`ctx.setTransform` con origen en la posición de la nave), en vez
  de un canvas fijo. La diferencia con el original: acá siempre centra a tu
  nave en pantalla (más simple), mientras que el juego real fija el punto
  donde sea que la nave ya esté en pantalla (necesario ahí porque además hay
  un sistema de seguir al mouse/touch que no tiene sentido acá).
- **Física de vuelo**: NO se portó tal cual — la del juego real vive en
  script.js, compartida por todo el sitio, pensada para mouse/touch +
  gamepad con seguimiento de puntero. Se reescribió una física arcade simple
  (aceleración + fricción + velocidad máxima) calibrada a ojo para que se
  sienta similar, no es una réplica numérica.
- **Mundo**: el juego real no tiene límites (todo vive en coordenadas de
  pantalla, sin mapa). Acá sí hace falta un mundo con bordes (2600×1900) para
  que el rival no se pueda alejar infinito y quedar imposible de encontrar.
- **Piedras**: fórmula de puntería/compromiso portada literal, con los
  mismos números (`COMPROMISO=110`, `BUSQUEDA_MAX=0.5`, etc.) y polígonos en
  vez de sprites.
- **Agujeros**: pares con teletransporte, como el original — con anillo
  doble girando en sentidos opuestos (versión liviana con puntos, no el
  sprite cacheado con `shadowBlur` del juego real, que es mucho más caro).
- **Explícitamente descartado** (es narrativa, no motor): intro/final con
  navecitas, tutorial, coloreado progresivo de la nave, audio, filtros SVG
  de saturación de color.

## Estado actual

Prototipo jugable: lobby para crear/unirse a una sala P2P (WebRTC vía
[PeerJS](https://peerjs.com/), sin servidor propio), cámara con zoom-pivote
en un mundo de 2600×1900, lluvia de piedras homing con stun de 3s, y
agujeros de a pares con teletransporte + marcador a 10. El host (quien crea
la sala, P1) es la autoridad para los agujeros y el marcador: sin esto,
sincronizar "quién llegó primero" entre dos relojes distintos sería mucho
más complicado. Limitación conocida: como el host resuelve por orden de
llegada del mensaje (no por timestamp real), ante un empate muy ajustado
tiene una ligera ventaja de latencia. Además, como los agujeros se generan
relativos a la posición del host, tienden a aparecer más cerca de él.

También hay un **modo práctica contra una IA simple** (botón "Practicar
contra la PC" en el lobby) para poder probar el juego sin un segundo
jugador real: no usa la red, el bot corre en el mismo cliente con un
esquema de "huir de lo cercano, si no hay nada cerca ir al agujero más
cercano de los dos" (ver `js/bot.js`).

**Estética**: usa el sprite real de la nave (`parallax/cohete.webp` de
agustint96.github.io, copiado a `assets/` porque este es un repo separado)
y el fondo estrellado real, con la misma paleta de colores
(`--navy`/`--navy-mid`/`--accent`/`--accent2`). Como el sprite del cohete
tiene un esquema de color fijo, P1/P2 no se recolorea la nave: se
distinguen por un resplandor de color detrás (celeste para P1, rojo para
P2), que se usa igual para las piedras de cada lluvia.

## Próximos pasos

1. Choque nave-nave con rebote elástico.
2. Pulir sincronización (interpolación/extrapolación mejor que el suavizado
   simple actual) y manejo de desconexión.
3. Si el modo práctica se siente demasiado fácil o difícil, ajustar
   `RADIO_PELIGRO` y la agresividad del bot en `js/bot.js`.
4. Evaluar si la física de vuelo arcade actual se siente lo bastante
   parecida al juego real, o si conviene ajustarla más.

## Cómo correrlo

Es HTML/CSS/JS plano, sin build. Como usa PeerJS por CDN necesita servirse
por http (no `file://`):

```
npx http-server .
```

o cualquier servidor estático equivalente. Abrí la URL en dos pestañas (o
dos dispositivos), creá sala en una y unite con el código en la otra.
