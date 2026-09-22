# Escenario 4 · contra la PC

El minijuego del escenario 4 de
[agustint96.github.io](https://github.com/agustint96/agustint96.github.io),
tal cual (mismo `esc4-game.js`, `script.js`, `styles.css`, sprites y sonidos,
copiados de ese repo), con una segunda nave manejada por la PC.

## Reglas

- Cada nave tiene su lluvia de piedras que la persigue: borde **azul** las
  tuyas, borde **rojo** las de la PC.
- **Cualquier piedra golpea a cualquier nave.** La golpeada cae, desaparece y
  a los **3 segundos** vuelve donde la golpearon, con los goles que tenía.
  Mientras está fuera de juego no le caen piedras y es invulnerable.
- Los **agujeros de gusano** aparecen de a pares, como siempre: el primero que
  entra a uno suma un gol y sale por el otro.
- Gana el primero en llegar a **10**. El marcador está en el cuadrado del
  medio (tus goles en blanco, los de la PC en rojo) y la voz cuenta 1, 2, 3…
- Si las naves se chocan, rebotan (nadie se lastima).
- Si ganás vos, se ve el final de siempre; si gana la PC, un cartel. En los
  dos casos arranca otra partida.

## Qué cambia respecto del sitio

- `script.js`: arranca directo en el escenario 4 (sin pasar por el index) y el
  escenario no tiene bordes de salida.
- `js/esc4-game.js`: la PC (bloque "Modo contra la PC"), las dos lluvias, el
  golpe con 3 s fuera de juego en vez de reiniciar la partida, el marcador y
  la voz contando para arriba.
- `styles.css`: colores del marcador y la nave oculta mientras está fuera de
  juego.

El resto es el sitio original sin tocar. Si cambiás el juego en el portfolio
y querés traer esos cambios acá, hay que volver a aplicar esas tres cosas.

## Cómo correrlo

Necesita servirse por http (no abriendo el `index.html` directo):

```
npx http-server .
```

y abrir `http://127.0.0.1:8080` en el navegador. Se juega con flechas/WASD
(Shift acelera, Espacio aleja la cámara), igual que en el sitio.
