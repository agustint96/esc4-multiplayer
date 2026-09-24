// Calidad automática: el juego mide cuánto tardan sus cuadros mientras se juega
// y, según eso, elige uno de tres niveles. En una PC que ya anda bien no cambia
// nada: arranca (y se queda) en "media", que es el juego de siempre.
//   baja   para las PCs que no llegan: el canvas a 1x, un solo halo en vez de
//          dos y la estela con la mitad de bocanadas
//          (cada una más opaca, así se ve igual de densa).
//   media  el juego de siempre (canvas hasta 1,5x).
//   alta   solo en pantallas muy densas (más de 1,5x): el canvas a 2x, más
//          nítido. Se prueba unos segundos y, si los cuadros se resienten, se
//          vuelve a media y no se intenta más en esa PC.
// Lo elegido se guarda (localStorage), así la próxima vez arranca directo en
// el nivel que le va. Una PC que quedó en baja vuelve a probar media a la
// semana, por si aquella vez fue algo pasajero.
// Para probar a mano: ?calidad=baja, ?calidad=media o ?calidad=alta en la URL
// (fija el nivel y apaga lo automático).
// Lo usan js/esc4-game.js (canvas, halos, estela: le pasa los cuadros con
// calidad.cuadro) y styles.css (html[data-calidad="baja"]).
(function () {
  const NIVELES = ["baja", "media", "alta"];
  const CLAVE = "esc4-calidad";
  const VENTANA_MS = 2000; // cada cuánto se saca el promedio
  const CALENTANDO_MS = 2500; // al arrancar o cambiar de nivel: no se mide
  const LENTO_MS = 25; // promedio de más de 25 ms por cuadro = menos de 40 fps
  const LENTAS_PARA_BAJAR = 2; // ventanas lentas seguidas para bajar un nivel
  const RAPIDO_MS = 20; // promedio de menos de 20 ms = 50 fps o más
  const RAPIDAS_PARA_ALTA = 4; // ventanas rápidas seguidas para probar alta
  const PRUEBA_VENTANAS = 3; // ventanas que dura la prueba de alta
  const PRUEBA_TOLERANCIA = 1.2; // en alta, hasta 20% más lento que en media
  const REPROBAR_BAJA_MS = 7 * 24 * 3600 * 1000;

  const densa = (window.devicePixelRatio || 1) > 1.5;
  const forzado = /[?&]calidad=(baja|media|alta)\b/.exec(location.search);

  let guardado = {};
  try {
    guardado = JSON.parse(localStorage.getItem(CLAVE)) || {};
  } catch (e) {}
  function guardar() {
    try {
      localStorage.setItem(CLAVE, JSON.stringify(guardado));
    } catch (e) {}
  }

  let nivel = "media";
  if (forzado) nivel = forzado[1];
  else if (guardado.nivel === "alta" && densa) nivel = "alta";
  else if (
    guardado.nivel === "baja" &&
    Date.now() - (guardado.fecha || 0) < REPROBAR_BAJA_MS
  )
    nivel = "baja";

  const avisos = [];
  let suma = 0;
  let cuenta = 0;
  let calentando = CALENTANDO_MS;
  let lentas = 0;
  let rapidas = 0;
  let prueba = null; // probando alta: { base, ventanas }
  let altaProbada = false; // una vez por sesión como mucho

  function poner(nuevo) {
    if (nuevo === nivel) return;
    nivel = nuevo;
    calidad.nivel = nivel;
    document.documentElement.dataset.calidad = nivel;
    suma = cuenta = lentas = rapidas = 0;
    calentando = CALENTANDO_MS;
    for (const fn of avisos) fn(nivel);
  }

  function cerrarVentana(prom) {
    if (prueba) {
      if (prom > LENTO_MS || prom > prueba.base * PRUEBA_TOLERANCIA) {
        // Alta le queda grande a esta PC: de vuelta a media, para siempre.
        prueba = null;
        guardado = { nivel: "media", altaNo: true };
        guardar();
        poner("media");
      } else if (++prueba.ventanas >= PRUEBA_VENTANAS) {
        prueba = null;
        guardado = { nivel: "alta" };
        guardar();
      }
      return;
    }
    if (prom > LENTO_MS) {
      rapidas = 0;
      if (++lentas >= LENTAS_PARA_BAJAR && nivel !== "baja") {
        const menor = NIVELES[NIVELES.indexOf(nivel) - 1];
        guardado = {
          nivel: menor,
          fecha: Date.now(),
          altaNo: guardado.altaNo || nivel === "alta",
        };
        guardar();
        poner(menor);
      }
      return;
    }
    lentas = 0;
    if (prom < RAPIDO_MS) rapidas++;
    else rapidas = 0;
    if (
      nivel === "media" &&
      densa &&
      !guardado.altaNo &&
      !altaProbada &&
      rapidas >= RAPIDAS_PARA_ALTA
    ) {
      altaProbada = true;
      prueba = { base: prom, ventanas: 0 };
      poner("alta");
    }
  }

  const calidad = {
    nivel,
    // Resolución del canvas del juego para este nivel.
    dpr() {
      const d = window.devicePixelRatio || 1;
      return Math.min(d, nivel === "baja" ? 1 : nivel === "alta" ? 2 : 1.5);
    },
    alCambiar(fn) {
      avisos.push(fn);
    },
    // ms desde el cuadro anterior, solo mientras se juega (lo llama el juego).
    cuadro(ms) {
      if (forzado) return;
      // Un hueco muy largo no es lentitud del juego: se volvió de otra pestaña,
      // se cargó algo, etc. Esa ventana no cuenta.
      if (ms > 250) {
        suma = cuenta = 0;
        return;
      }
      if (calentando > 0) {
        calentando -= ms;
        return;
      }
      suma += ms;
      cuenta++;
      if (suma >= VENTANA_MS) {
        const prom = suma / cuenta;
        suma = cuenta = 0;
        cerrarVentana(prom);
      }
    },
  };
  document.documentElement.dataset.calidad = nivel;
  window.calidad = calidad;
})();
