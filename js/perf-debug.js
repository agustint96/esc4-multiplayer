// Medidor de rendimiento: solo se carga si la URL trae ?perf=1 (ver el script del
// final de index.html). Arriba a la izquierda muestra, cada medio segundo:
//   fps        cuadros por segundo (promedio)
//   peor       el cuadro más lento de ese medio segundo (ms): lo que se siente como tirón
//   tareas     tareas largas (>50 ms) acumuladas: cantidad y ms totales
//   heap       memoria de JS (solo Chrome/Edge)
//   escena     el escenario en el que está la nave
//   red, recib, hueco, ping   solo online: ver red() abajo
// Para comparar antes/después de un cambio: mismo recorrido, mismo navegador.
(function () {
  const box = document.createElement("pre");
  box.style.cssText =
    "position:fixed;top:8px;left:8px;z-index:100000;margin:0;padding:6px 8px;" +
    "font:12px/1.4 monospace;color:#9f9;background:rgba(0,0,0,.7);" +
    "pointer-events:none;white-space:pre";
  document.body.appendChild(box);

  let frames = 0;
  let peor = 0;
  let ultimo = performance.now();
  let desde = ultimo;
  let largas = 0;
  let largasMs = 0;

  try {
    new PerformanceObserver((lista) => {
      for (const e of lista.getEntries()) {
        largas++;
        largasMs += e.duration;
      }
    }).observe({ entryTypes: ["longtask"] });
  } catch (e) {}

  // Online (lo llena js/esc4-game.js en window.esc4Red): por dónde llega el
  // rival (directo o servidor), cuántos estados por segundo (deberían ser 20),
  // el hueco más largo entre dos, la ida y vuelta de un ping y cuánto en el
  // pasado se muestra al rival (sube solo si la conexión va a los tirones).
  function red(ms) {
    const r = window.esc4Red;
    if (!r || r.via === "-") return "";
    const texto =
      "\nred    " + r.via +
      "\nrecib  " + ((r.recibidos * 1000) / ms).toFixed(0) + "/s" +
      "\nhueco  " + Math.round(r.huecoMax) + " ms" +
      "\nping   " + (r.ping == null ? "?" : Math.round(r.ping) + " ms") +
      "\natraso " + Math.round(r.retraso * 1000) + " ms";
    r.recibidos = 0;
    r.huecoMax = 0;
    return texto;
  }

  function cuadroMedidor(ahora) {
    frames++;
    peor = Math.max(peor, ahora - ultimo);
    ultimo = ahora;
    if (ahora - desde >= 500) {
      const heap = performance.memory
        ? (performance.memory.usedJSHeapSize / 1048576).toFixed(1) + " MB"
        : "n/d";
      const escena = typeof currentSceneId === "string" ? currentSceneId : "?";
      box.textContent =
        "fps    " + ((frames * 1000) / (ahora - desde)).toFixed(0) +
        "\npeor   " + peor.toFixed(1) + " ms" +
        "\ntareas " + largas + " (" + Math.round(largasMs) + " ms)" +
        "\nheap   " + heap +
        "\nescena " + escena +
        red(ahora - desde);
      frames = 0;
      peor = 0;
      desde = ahora;
    }
    requestAnimationFrame(cuadroMedidor);
  }
  requestAnimationFrame(cuadroMedidor);
})();
