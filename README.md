# Escenario 4 · contra la PC

El minijuego del escenario 4 de
[agustint96.github.io](https://github.com/agustint96/agustint96.github.io),
tal cual (mismo `esc4-game.js`, `script.js`, `styles.css`, sprites y sonidos,
copiados de ese repo), con una segunda nave manejada por la PC.

## Reglas

- Tu nave lleva un halo **azul** y la de la PC uno **rojo**; las dos tienen
  su fuego.
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
- Si las naves se chocan, rebotan (nadie se lastima).
- Al terminar aparece un cartel (GANASTE o GANO LA PC) y arranca otra
  partida.

## Qué cambia respecto del sitio

- `script.js`: arranca directo en el escenario 4 (sin pasar por el index) y el
  escenario no tiene bordes de salida.
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

y abrir `http://127.0.0.1:8080` en el navegador. Se juega con flechas/WASD
(Shift acelera, Espacio aleja la cámara), igual que en el sitio.
