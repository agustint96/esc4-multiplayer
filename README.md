# Escenario 4 · Multiplayer

Spin-off del minijuego del escenario 4 de [agustint96.github.io](https://github.com/agustint96/agustint96.github.io),
pensado como juego 1v1 aparte (no vive en el portfolio, necesita conexión en
tiempo real entre dos jugadores).

## Cómo se juega (diseño acordado)

- 2 jugadores, cada uno con su nave y su propia lluvia de piedras que lo
  persigue a él (reusa la idea de `PUNTERIA`/`BUSQUEDA`/`COMPROMISO` del
  juego original, una instancia por jugador).
- Piedras de **P1**: negras con borde **azul**. Piedras de **P2**: negras con
  borde **rojo**. El color indica de qué lluvia vienen, no a quién pueden
  lastimar.
- **Cualquier piedra golpea a cualquier nave que la toque**, sea o no la suya.
  Ahí está la táctica: atraer al rival a la zona donde cae tu propia lluvia.
- Al ser golpeada, una nave desaparece **3 segundos**: invulnerable, sin
  lluvia propia, fuera de juego del todo.
- Las naves chocan entre sí con **rebote elástico** (empujón mutuo, sin
  daño) — se puede usar como bloqueo físico para alejar al rival de un
  agujero.
- Se compite por agujeros negros (los cúmulos del juego original): el
  primero en tocar uno se lo lleva, por timestamp. Gana quien llegue a
  **10**.

## Estado actual

Prototipo jugable: lobby para crear/unirse a una sala P2P (WebRTC vía
[PeerJS](https://peerjs.com/), sin servidor propio), naves sincronizadas por
red con su lluvia homing y stun de 3s, y agujero negro con marcador a 10
(gana quien llegue primero, cuenta ascendente 1..10 como goles). El host
(quien crea la sala, P1) es la autoridad para el agujero y el marcador: sin
esto, sincronizar "quién llegó primero" entre dos relojes distintos sería
mucho más complicado. Limitación conocida: como el host resuelve por orden
de llegada del mensaje y no hay sincronización real de relojes, ante un
empate muy ajustado el host tiene una ligera ventaja de latencia.

También hay un **modo práctica contra una IA simple** (botón "Practicar
contra la PC" en el lobby) para poder probar el juego sin un segundo
jugador real: no usa la red, el bot corre en el mismo cliente y esquiva
piedras / va al agujero con un esquema de "huir de lo cercano, si no hay
nada cerca ir al objetivo" (ver `js/bot.js`).

**Estética**: reusa los sprites reales del juego original (`parallax/cohete.webp`,
`parallax/piedra.webp`, `parallax/piedra_2.webp`, `parallax/fondo-estrellado.webp`
de agustint96.github.io, copiados a `assets/` porque este es un repo
separado) y la misma paleta de colores (`--navy`/`--navy-mid`/`--accent`/
`--accent2` de `styles.css`). Como el sprite del cohete tiene un solo
esquema de color fijo, P1/P2 no se recolorea la nave: se distinguen por un
resplandor de color detrás (celeste `--accent2` para P1, rojo para P2), que
se usa igual para las piedras de cada lluvia.

Todavía **sin choque entre naves**.

## Próximos pasos

1. Choque nave-nave con rebote elástico.
2. Pulir sincronización (interpolación/extrapolación mejor que el suavizado
   simple actual) y manejo de desconexión.
3. Si el modo práctica se siente demasiado fácil o difícil, ajustar
   `RADIO_PELIGRO` y la agresividad del bot en `js/bot.js`.

## Cómo correrlo

Es HTML/CSS/JS plano, sin build. Como usa PeerJS por CDN necesita servirse
por http (no `file://`):

```
npx http-server .
```

o cualquier servidor estático equivalente. Abrí la URL en dos pestañas (o
dos dispositivos), creá sala en una y unite con el código en la otra.
