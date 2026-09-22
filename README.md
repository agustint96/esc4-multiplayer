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

Prototipo mínimo: lobby para crear/unirse a una sala P2P (WebRTC vía
[PeerJS](https://peerjs.com/), sin servidor propio) y dos naves moviéndose
sincronizadas por red. Todavía **sin piedras, sin agujeros, sin choque**.

## Próximos pasos

1. Piedras: lluvia homing por jugador + colisión cruzada (cualquiera golpea
   a cualquiera) + stun de 3s.
2. Agujeros negros / cúmulos + marcador a 10.
3. Choque nave-nave con rebote elástico.
4. Pulir sincronización (interpolación/extrapolación mejor que el suavizado
   simple actual) y manejo de desconexión.

## Cómo correrlo

Es HTML/CSS/JS plano, sin build. Como usa PeerJS por CDN necesita servirse
por http (no `file://`):

```
npx http-server .
```

o cualquier servidor estático equivalente. Abrí la URL en dos pestañas (o
dos dispositivos), creá sala en una y unite con el código en la otra.
