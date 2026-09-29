// Escenario 4: caen polígonos irregulares desde arriba y hay que esquivarlos
// con la nave. Si uno la toca, la nave cae golpeada y el juego vuelve a empezar;
// el segundero cuenta cuánto tiempo se resiste sin chocar.
//
// Al entrar al escenario hay una intro, toda a color y con el fondo starry
// azul del sitio: entra volando la nave, el parallax 7 (la nave chica del
// escenario principal) ya está ahí, se le juntan otras y se van juntas hacia
// arriba a la izquierda mientras nuestra nave las mira. Cuando desaparecen cae
// una pantalla negra por encima de todo (la nave incluida): todo se oscurece a
// la vez. Con la pantalla toda negra la nave pasa a blanco y negro sin que se
// vea; recién ahí prende la luz, se levanta la pantalla negra y aparece en
// blanco y negro: arrancan las instrucciones (ver más abajo) y, cuando se
// terminan, empieza el juego (aparece el segundero, suena la música y, un
// momento después, caen los polígonos).
//
// Instrucciones: con la luz ya prendida, 2 s después (para que se oiga el
// sonido de luz on) suena game sound/nivel4_intro.m4a en bucle y aparece el primer
// paso, con la nave ya bajo control del jugador pero sin polígonos, sin
// agujeros y sin segundero: "Para moverte usa" y las cuatro flechas, que se
// iluminan mientras se aprietan de verdad (las WASD también valen). Cuando ya
// se apretó cada una y pasa 1 s el texto se desvanece y aparece el siguiente:
// "Usa shift para potenciar la velocidad" y por último "Podes usar espacio para
// ver mas lejos" (la barra espaciadora, o M: lo que aleja la cámara); cada uno
// se cierra igual, 1 s después de apretar la tecla. Cada paso trae su voz (una
// al azar de audio/Esc4/1- flechitas, 2- shift o 3- espacio, ver AYUDA_VOCES)
// y no se desvanece hasta que la voz termina. Tras el último suena un "listo"
// (4- listo): con él la música de intro se va con un fade out y, cuando termina
// de decirlo, arranca la del juego y empieza el segundero (y, tras la gracia,
// las piedras). Si hay un joystick conectado los pasos son los del joystick
// (stick izquierdo o cruceta, RB, LT; ver el bloque data-modo="joystick" de
// juego.html) y con sus propias voces (1- Analogico, 2- RB, 3- L2, ver
// AYUDA_VOCES_JOYSTICK); lo que se use, teclado o joystick, completa
// los pasos de las dos versiones. Solo pasa la primera vez: después de un
// choque no.
//
// Estrellas: se ven algunas estrellas blancas sobre el fondo, también en la
// intro y en el final (solo decoración, no se chocan). En distintos puntos del mapa aparecen agujeros de
// gusano de a pares: un circulito de estrellas con brillo girando muy rápido,
// con el centro negro. Al entrar en uno la nave sale por el otro, y cada pasaje
// la va pintando de color (sube la saturación de su filtro, ver --nave-sat
// en styles.css y aplicarColorNave) hasta quedar con todos sus
// colores: los agujeros hacen el mismo recorrido, arrancan blancos y terminan
// naranja (el del parallax 7). Al perder todo vuelve a blanco y negro.
//
// Rendimiento: los brillos (que son lo caro) se arman UNA sola vez en sprites;
// en cada cuadro solo se dibujan esos sprites rotados y con más o menos
// transparencia (el pasaje de blanco a naranja es un fundido entre dos sprites).
// La luz de la nave también es un sprite. Y el canvas no pasa de 1,5x de
// resolución.
//
// Todo el escenario acompaña a la nave: a medida que se colorea, el fondo negro
// va pasando al azul starry (--fondo-color en styles.css).
//
// Cuando la nave cruza el último agujero (victoria) el final tiene dos partes,
// seguidas y sin cortes: primero un zoom a la nave del jugador, ya toda de color
// (se van los polígonos, los cúmulos y el segundero), y enseguida, con ese mismo
// zoom, se repite la animación de la intro pero con los parallax 7 en blanco y
// negro (con sombra interna): llegan junto a la nave, que las mira, una de ellas
// putea en un globo de diálogo (*#$%!) y se escapan. Cuando se van, se vuelve al
// escenario principal (el nivel está completo).
//
// Música (game sound/nivel4.ogg, con game sound/nivel4.m4a de respaldo): arranca cuando
// terminan las instrucciones y suena en bucle mientras dura la partida,
// acelerando de a muy poquito. Se frena al chocar (queda en silencio lo que
// dura la caída de la nave) y arranca de nuevo desde el principio, a
// velocidad normal, cuando empieza la partida siguiente.
// Al perder suena game sound/stopgame.m4a (una vez, sin cortarlo al reiniciar: se
// oye un rato más, aunque ya haya vuelto la música).
// Cada pasaje por un agujero cuenta hacia atrás con la voz: 10, 9, ... 1
// (audio/Esc4/conteo; ver CONTEO_ARCHIVOS). Al perder el conteo vuelve a 10.
// En el último portal, tras el "1" (o en su lugar) suena una felicitación. Además,
// hay una voz de ánimo por partida (a los ~20 s, siempre) y de cansancio pasados
// los 30 s (a los 30, 45, 60..., cada una con un 25 % de chance).
// Todas comparten un canal y las de ánimo/cansancio no pisan a las de portal.
// Se reproduce con Web Audio (el archivo se decodifica una vez y se loopea el
// buffer): con un <audio loop> el bucle tenía un hueco al volver a empezar y
// al reiniciar con currentTime habíademora. Si Web Audio no está disponible
// o falla la carga, cae a un <audio> común.
//
// script.js registra el escenario (scenes.game) y llama a
// window.esc4Game.setActive(true/false) al entrar y salir. Fuera del
// escenario no hay ningún requestAnimationFrame corriendo. La nave la mueve
// script.js como siempre; acá solo se lee su transform para saber dónde está.
//
// Cámara: igual que el escenario 2, el mundo se ve con zoom anclado sobre la
// nave (script.js llama a setCamera con el zoom y el origen cada cuadro). Como
// el juego dibuja en un canvas -escalarlo por CSS lo pixelaría-, el zoom se
// aplica al dibujar. Todo el mundo (polígonos, velocidades, hitbox de la nave)
// va a la escala de la nave chica -ESCALA_MUNDO-, así con zoom se ve igual de
// jugable y en el mapa completo (M/Espacio) la nave queda chiquita.
(function () {
  // --- Dificultad (todo en px y segundos) ----------------------------------
  const GRACIA = 1.2; // segundos sin polígonos al empezar
  const SPAWN_INICIAL = 1.1; // segundos entre polígonos al empezar...
  const SPAWN_MIN = 0.35; // ...y lo mínimo a lo que baja
  const SPAWN_RAMPA = 0.025; // cuánto baja por cada segundo sobrevivido (llega al mínimo a los ~30 s)
  const VEL_INICIAL = 150; // velocidad de caída (px/s)...
  const VEL_MAX = 1000; // ...y lo máximo a lo que sube (lo alcanza a los ~34 s)
  const VEL_RAMPA = 25; // cuánto sube por cada segundo sobrevivido
  // Intro (segundos): llegan las otras naves, esperan juntas, y se van.
  const INTRO_LLEGADA = 2.2;
  const INTRO_ESPERA = 0.7;
  const INTRO_SALIDA = 2.0; // lo que tardan en irse (ya fuera de la vista al final)
  const INTRO_ESCALONADO = 0.12; // cada nave sale un poco después de la anterior
  const INTRO_FUNDIDO = 1; // lo que tarda en caer la pantalla negra (igual que la transición de .game-tapa.cae)
  const INTRO_OSCURO = 2.8; // desde que desaparecen hasta que la nave prende la luz: el fondo se funde a negro (1 s) y queda oscuridad total
  const INTRO_ENTRADA = 1.4; // lo que tarda la nave en entrar volando
  const NAVE_FLOTA = { x: 5, y: 7 }; // px del mundo: vaivén de la nave mientras espera
  const NAVE_BALANCEO = 3; // grados de balanceo al mirar a las navecitas
  const INTRO_ACELERACION = 380; // px/s² del mundo al irse
  const INTRO_DIR = { x: -0.75, y: -0.66 }; // arriba a la izquierda
  const INTRO_MIRADA_MAX = 75; // grados: lo máximo que gira la nave para mirar a las navecitas
  // Los sonidos del nivel (música, perder, nota) están en audio/Esc4/game sound;
  // las voces y los efectos de portal, en las otras carpetas de audio/Esc4.
  // Opus (el más liviano, bucle sin hueco) y, si el navegador no lo lee (Safari
  // viejo), la misma música en AAC. Se usa la primera que se pueda decodificar.
  const MUSICA_FUENTES = [
    {
      url: "audio/Esc4/game sound/nivel4.ogg",
      tipo: 'audio/ogg; codecs="opus"',
    },
    {
      url: "audio/Esc4/game sound/nivel4.m4a",
      tipo: 'audio/mp4; codecs="mp4a.40.2"',
    },
  ];
  const MUSICA_VOLUMEN = 0.1;
  // Mientras duran las instrucciones suena esta, en bucle, y se va con un fade
  // out cuando suena el "listo". Tiene el mismo volumen que la del juego.
  const INTRO_MUSICA_URL = "audio/Esc4/game sound/nivel4_intro.m4a";
  const INTRO_MUSICA_FUNDIDO = 1.2; // segundos que tarda en apagarse
  const AYUDA_RETRASO = 2; // segundos entre que la nave prende la luz y arrancan las instrucciones (con su música): así se oye el sonido de luz on
  const AYUDA_ESPERA = 1; // segundos que se espera, ya usadas las teclas, antes de desvanecer el paso
  const AYUDA_FUNDIDO = 0.6; // segundos que tarda en desvanecerse un paso (igual que la transición de .game-ayuda-paso en styles.css)
  const AYUDA_VOZ_MAX = 6; // segundos: si una voz no termina (ej. el audio está bloqueado) no se la espera más
  const LISTO_CARGA_MAX = 8; // segundos: lo más que se espera a que carguen las voces para decir "listo" (ver empezarArranque)
  // Qué teclas hay que apretar en cada paso (ver #game-ayuda en juego.html: cada
  // tecla dibujada tiene su data-tecla). Las flechas y WASD valen lo mismo, como
  // en script.js.
  const AYUDA_PASOS = [["up", "left", "down", "right"], ["shift"], ["space"]];
  // Voces de las instrucciones (audio/Esc4): al aparecer cada paso suena una de
  // las de su carpeta, al azar (una carpeta por paso, en el mismo orden), y el
  // paso no se desvanece hasta que termina. Al final, tras el último paso, suena
  // una de "4- listo" y recién cuando termina empieza el juego.
  // Solo se listan acá los archivos que existen de verdad en audio/Esc4/: el
  // "Supercommit" borró varias tomas de más (duplicadas) pero estas listas
  // habían quedado nombrándolas -alAzar() terminaba eligiendo una que ya no
  // estaba y esa vuelta se quedaba en silencio, sin avisar ni reintentar.
  const AYUDA_VOCES = [
    [
      "1- flechitas/Usalas_felchitasmp3.m4a",
      "1- flechitas/usa_las_flechitas_0mp3.m4a",
    ],
    [
      "2- shift/usa_shift_para_acelerarmp3.m4a",
      "2- shift/usa_shift_para_acelerar_0mp3.m4a",
      "2- shift/usa_shift_para_acelerar_3mp3.m4a",
    ],
    [
      "3- espacio/Con_espacio_podes_ver_mas_lejosmp3.m4a",
      "3- espacio/Con_espacio_podes_ver_mas_lejos_2mp3.m4a",
      "3- espacio/con_espacio_podes_ver_mas_lejos_4mp3.m4a",
    ],
  ];
  const AYUDA_LISTO = [
    "4- listo/listo01mp3.m4a",
    "4- listo/listo02mp3.m4a",
    "4- listo/listo1mp3.m4a",
    "4- listo/listo3mp3.m4a",
    "4- listo/listo4mp3.m4a",
    "4- listo/listo5mp3.m4a",
    "4- listo/listo9mp3.m4a",
  ];
  // Las del joystick (las de arriba nombran "flechitas", "shift" y "espacio"):
  // mismos pasos y mismo orden, una carpeta por paso. Una lista vacía haría que
  // ese paso no hable. El "listo" del final es el mismo.
  const AYUDA_VOCES_JOYSTICK = [
    [
      "1- Analogico/1mp3.m4a",
      "1- Analogico/4mp3.m4a",
      "1- Analogico/5mp3.m4a",
      "1- Analogico/6mp3.m4a",
    ],
    ["2- RB/r1mp3.m4a", "2- RB/r11mp3.m4a"],
    [
      "3- L2/l2mp3.m4a",
      "3- L2/l22mp3.m4a",
      "3- L2/l222mp3.m4a",
      "3- L2/l22222mp3.m4a",
      "3- L2/l22222222mp3.m4a",
    ],
  ];
  // Joystick (mapeo estándar del Gamepad API, el mismo que usa script.js): stick
  // izquierdo o cruceta para moverse, RB para el boost y LT (analógico) para
  // alejar la cámara. Cuentan como las teclas "up", "left", "down", "right",
  // "shift" y "space" de AYUDA_PASOS, así los dos controles completan los mismos
  // pasos.
  const PAD_CRUCETA = { up: 12, down: 13, left: 14, right: 15 };
  const PAD_RB = 5;
  const PAD_LB = 4; // con RB, en el menú cambian quién usa qué (ver cambiarControles)
  const PAD_LT = 6;
  const AYUDA_STICK_UMBRAL = 0.5; // cuánto hay que empujar el stick para que cuente una dirección (0 a 1)
  const AYUDA_STICK_RECORRIDO = 0.6; // em que se corre la palanca dibujada con el stick a fondo (ver .game-stick en styles.css)
  const AYUDA_GATILLO = 0.3; // cuánto hay que apretar un botón analógico (LT) para que cuente (0 a 1)
  const AYUDA_TECLAS = {
    ArrowUp: "up",
    KeyW: "up",
    ArrowLeft: "left",
    KeyA: "left",
    ArrowDown: "down",
    KeyS: "down",
    ArrowRight: "right",
    KeyD: "right",
    ShiftLeft: "shift",
    ShiftRight: "shift",
    Space: "space",
    KeyM: "space", // M y espacio alejan la cámara (ver script.js)
  };
  // La música acelera de a muy poquito mientras dura la partida (casi
  // imperceptible): sube MUSICA_ACEL por segundo hasta MUSICA_ACEL_MAX (0,0004
  // por segundo = +1,2 % a los 30 s), como fracción de la velocidad normal.
  const MUSICA_ACEL = 0.0004;
  const MUSICA_ACEL_MAX = 0.1;
  const PERDER_URL = "audio/Esc4/game sound/stopgame.m4a";
  const PERDER_VOLUMEN = 0.2;
  // Al entrar al último agujero de gusano (el que completa el color de la nave)
  // suena esta nota, una sola vez.
  const NOTA_URL = "audio/Esc4/game sound/mimayor.m4a";
  const NOTA_VOLUMEN = 0.1;
  // Cada vez que se abre un agujero de gusano nuevo (un par) suena este sonido.
  // Va aparte de las voces: no corta ni es cortado por ellas.
  const PORTAL_URL = "audio/Esc4/portales/nuevoportal.m4a";
  const PORTAL_VOLUMEN = 0.1;
  // Y este, cada vez que la nave cruza un agujero, con su propio volumen (más
  // fuerte que el de apertura).
  const PORTAL_CRUCE_URL = "audio/Esc4/portales/portal++.m4a";
  const PORTAL_CRUCE_VOLUMEN = 0.4;
  // Voces (audio/Esc4, una carpeta por momento: 1- a 4- las instrucciones, conteo,
  // animo, cansancio y 5- final). Todas comparten un solo canal: suena una a la vez, y las
  // de los portales (el conteo y las felicitaciones) tienen prioridad, cortan la
  // que esté sonando; las de ánimo y de cansancio, en cambio, nunca cortan a una
  // de un portal, esperan a que termine.
  const VOZ_URL = "audio/Esc4/";
  const VOZ_VOLUMEN = 0.16;
  const VOZ_CHANCE = 0.25; // probabilidad de que suene cada tirada de cansancio (25 %)
  // Ánimo: una voz por partida, siempre (sin chance), a estos segundos de juego
  // más o menos: a cada uno se le suma o resta al azar hasta VOZ_ANIMO_MARGEN
  // segundos, así no caen siempre en el mismo segundo. No se repite la voz (para
  // más de una por partida, sumar segundos a VOZ_ANIMO_EN).
  const VOZ_ANIMO = [
    "animo/vamos.m4a",
    "animo/concentrate.m4a",
    "animo/atencionmp3.m4a",
  ];
  const VOZ_ANIMO_EN = [20];
  const VOZ_ANIMO_MARGEN = 2;
  // Cansancio: cuando el juego ya va rápido y lleva mucho: la primera tirada a
  // los VOZ_CANSADO_DESDE segundos y otra cada VOZ_CANSADO_CADA mientras siga.
  const VOZ_CANSADO = [
    "cansancio/ufff.m4a",
    "cansancio/seeee.m4a",
    "cansancio/Que_rapidomp3.m4a",
    "cansancio/unpocomasmp3.m4a",
    "cansancio/vancadavezmasrapidomp3.m4a",
    "cansancio/wemp3.m4a",
    "cansancio/wowmp3.m4a",
  ];
  const VOZ_CANSADO_DESDE = 30;
  const VOZ_CANSADO_CADA = 15;
  // "Un poco más" (la de cansancio que dice que falta poco) solo puede sonar
  // cuando alguien, sea quien sea, ya metió VOZ_UN_POCO_MAS_GOLES goles.
  const VOZ_UN_POCO_MAS = "cansancio/unpocomasmp3.m4a";
  const VOZ_UN_POCO_MAS_GOLES = 8;
  // Felicitación: en el último portal, después del "1" o en lugar del "1".
  const VOZ_FELICITA = [
    "5- final/bien.m4a",
    "5- final/muy_bien.m4a",
    "5- final/buenisimoo.m4a",
    "5- final/siii.m4a",
  ];
  // Momentos de la partida con voz propia, con VOZ_HITO_CHANCE de sonar cada
  // vez: el gol número 9 de cualquiera de los dos ("uno más", en ultimopunto) y
  // el 9 a 9 ("empate"; ahí no suena la de "uno más", que ya no vale: el que
  // sigue decide).
  const VOZ_ULTIMO_PUNTO = [
    "ultimopunto/unomasmp3.m4a",
    "ultimopunto/unomas2.m4a",
    "ultimopunto/unomas3mp3.m4a",
    "ultimopunto/unomas4mp3.m4a",
  ];
  const VOZ_EMPATE = ["empate/peleadisimo.m4a", "empate/sedefine.m4a"];
  const VOZ_HITO_GOL = 9;
  const VOZ_HITO_CHANCE = 0.5;
  // Los números de los goles: cada vez que la nave entra a un agujero de
  // gusano suena el número del gol (ver decirGol), del 1 al 10. La lista va
  // del 10 al 1 (un pasaje por número: CUMULOS_PARA_COLOR tiene que ser igual
  // a la cantidad de números). De cada número hay una o más variantes
  // (audio/Esc4/conteo) y en cada pasaje suena una al azar.
  const CONTEO_URL = VOZ_URL + "conteo/";
  const CONTEO_ARCHIVOS = [
    ["10.m4a", "10 (1).m4a"],
    ["9.m4a", "nueve.m4a"],
    ["8.m4a"],
    ["7.m4a"],
    ["6.m4a"],
    ["5.m4a"],
    ["4.m4a"],
    ["3.m4a"],
    ["dos.m4a"],
    ["1.m4a"],
  ];
  const P7_ANCHO = 40; // px del mundo: ancho de la nave (chica, como la de la escena; ver ESCALA_MUNDO)
  // Posición de la nave que ya está ahí, relativa al ancho del mundo, y a
  // qué distancia del piso está: la misma altura a la que aparece el
  // parallax 7 en el escenario 1 (296 px sobre el borde de abajo).
  const P7_X = 0.72;
  const P7_ALTURA = 296;
  // Dónde arranca cada nave (siempre afuera de la vista: de la izquierda, de
  // la derecha y de abajo; la primera ya está en su lugar) y dónde se
  // acomoda, relativo al punto de encuentro (px del mundo). v = vista()
  // (rectángulo del mundo que se ve en pantalla, ver más abajo): mismo patrón
  // que FINAL_NAVES, así "afuera de la vista" es real sea cual sea el zoom de
  // la cámara (distinto en mobile) o el aspect ratio de la pantalla -antes
  // usaba window.innerWidth/innerHeight directo, que son px de pantalla, no
  // del mundo, y con la cámara ya haciendo zoom durante la intro (converge
  // rápido) esos números quedaban mal escalados y las navecitas quedaban
  // proporcionalmente raras, sobre todo en celulares (otro zoom y otro
  // aspect ratio que en desktop).
  const INTRO_NAVES = [
    { desde: (m) => ({ x: m.x, y: m.y }), a: { x: 0, y: 0 } },
    { desde: (m, v) => ({ x: v.x - 100, y: m.y + 150 }), a: { x: -50, y: 20 } },
    {
      desde: (m, v) => ({ x: v.x + v.w + 100, y: m.y - 220 }),
      a: { x: 46, y: -24 },
    },
    {
      desde: (m, v) => ({ x: m.x + 280, y: v.y + v.h + 100 }),
      a: { x: 10, y: 42 },
    },
  ];

  const POSICION_Y_INICIAL = 0.85; // dónde reaparece la nave: centrada en x, a esta fracción del alto (0 = arriba)
  // Con rival (PC, dos jugadores u online) cada nave arranca en su esquina de
  // abajo -la azul a la izquierda, la roja a la derecha- en vez de en el medio
  // (ver xEsquinaJugador/xEsquinaRival). Fracción del ancho desde cada borde.
  const ESQUINA_X = 0.25;
  const DURACION_CHOQUE = 1.5; // segundos que la nave cae, golpeada, antes de reiniciar
  const GRAVEDAD = 500; // px/s² del mundo con los que cae la nave golpeada
  const GOLPE_LATERAL = 120; // px/s del mundo: empujón de costado que le da la piedra
  const GOLPE_GIRO = 240; // grados/s de giro base que le da (según de qué lado la pegan)
  // Los polígonos intentan caerle a la nave: nacen apuntados a ella y, mientras
  // caen, se desvían hacia donde está (sino alcanza con quedarse parado en un
  // lugar sin piedras). Si además se queda quieta, la buscan con más fuerza.
  const PUNTERIA = 0.85; // fracción de los polígonos que nacen apuntados a la nave (el resto, al azar)
  const PUNTERIA_ANCHO = 200; // px del mundo: cuánto se abre el apuntado alrededor de la nave
  const COMPROMISO = 110; // px del mundo: a esta altura sobre la nave ya no corrigen y siguen derecho (así se puede esquivar a último momento)
  const BUSQUEDA_BASE = 0.6; // fuerza con la que buscan siempre (0..1; con la nave quieta sube a 1)
  const QUIETA_SEG = 3; // segundos sin moverse antes de que la busquen
  const QUIETA_MOV = 8; // px/s del mundo: por debajo de esto cuenta como quieta
  const BUSQUEDA_RAMPA = 2; // segundos hasta llegar a la fuerza completa con la nave quieta
  const BUSQUEDA_MAX = 0.5; // desvío horizontal máximo, como fracción de su velocidad de caída
  const BUSQUEDA_AGIL = 1.5; // 1/s: qué tan rápido corrigen el rumbo

  // --- Mundo y luz ----------------------------------------------------------
  const ESCALA_MUNDO = 0.55; // tamaño/velocidad del mundo respecto del juego "sin zoom"
  const MARGEN_SPAWN = 60; // px del mundo: los polígonos nacen un poco más allá de lo visible
  const LUZ_RADIO = 280; // px del mundo: alcance de la luz de la nave
  const LUZ_RGB_INICIO = [255, 255, 255]; // color de la luz con la nave en blanco y negro (tutorial, sin equipo)...
  // ...azul bien clarito o rojo bien clarito, para distinguir a quién le
  // pertenece cada linterna en los modos con rival (ver dibujarLuz).
  const LUZ_RGB_INICIO_JUGADOR = [197, 225, 255];
  const LUZ_RGB_INICIO_RIVAL = [255, 197, 197];
  const LUZ_RGB_FIN = [255, 159, 154]; // ...y con todo su color (el salmón del sitio, el de siempre)
  const LUZ_INTENSIDAD = 0.12; // opacidad del salmón en el centro de la luz (la misma que el ::before de la nave en styles.css)

  // --- Estrellas y cúmulos ---------------------------------------------------
  // El cielo del nivel: un tubo de "pantallas" de ancho que gira una pantalla
  // entera cada vez que las dos naves dan la vuelta juntas (ver "El fondo se
  // corre"); al dar la vuelta completa se vuelve a ver el mismo cielo. Dos
  // capas: la cercana y una lejana, más tenue, que gira menos (profundidad).
  // Los valores salieron de la página de prueba "Tubo de estrellas"; cada
  // nivel nuevo podría traer los suyos.
  const CIELO = {
    pantallas: 3,
    giroDura: 2.1, // s que tarda en girar una pantalla
    curvatura: 0.8, // 0 = plano; más alto: juntas y lentas en los costados, rápidas en el medio
    estrellas: 110, // por pantalla, en la capa cercana
    lejana: { gira: 0.5, brillo: 0.4, estrellas: 140 }, // gira: fracción del giro de la cercana
  };
  const CIELO_MARGEN = 0.12; // fracción del ancho que se dibuja de más a cada lado (la cámara con zoom ve un poco más allá)
  const ESTRELLA_SALMON = "#f19280"; // salmón del sitio (--accent en styles.css)
  const GRUPOS_SALMON = [1, 3]; // qué grupos de estrellas (ver GRUPOS_ESTRELLAS) son salmón en la intro y en el final
  // Los agujeros de gusano (cúmulos) arrancan blancos y terminan naranja (el
  // predominante del parallax 7) a medida que se colorea la nave.
  const CUMULO_COLOR_INICIO = "#ffffff";
  const CUMULO_COLOR_FIN = "#cb681a";
  const CUMULO_BRILLO = 6; // px del mundo: resplandor de cada estrella (se arma una sola vez en el sprite)
  // Cuántas veces se repinta cada estrella al armar el sprite: sube el brillo
  // sin tocar el tamaño (el resplandor llega igual de lejos, solo es más
  // intenso). Va junto con el "lighter" de dibujarAnilloSprite.
  const CUMULO_BRILLO_PASADAS = 3;
  const SPRITE_ESCALA = 4; // px de sprite por px del mundo (nítido con zoom y pantallas densas)
  const CUMULO_ANILLO = 16; // px del mundo: radio del circulito de estrellas (chico)
  const CUMULO_RADIO = 26; // px del mundo: zona de entrada (un poco más que el anillo)
  const CUMULO_ESTRELLAS = 28; // estrellas del anillo de afuera
  const CUMULO_INTERIOR = 14; // estrellas del anillo de adentro (giran para el otro lado)
  const CUMULO_ESTRELLA_R = 1.7; // px del mundo: radio de cada estrella. Todas iguales y casi pegadas: 28 x 3,4 px de diámetro ~ el perímetro del círculo (100 px)
  // El disco negro del medio, más grande que el anillo (antes medía justo
  // CUMULO_ANILLO y el resplandor del anillo de afuera asomaba la mitad para
  // afuera, sobre el fondo del juego: ahora el anillo entero queda sobre negro).
  const CUMULO_DISCO_RADIO = 1.15; // por CUMULO_ANILLO
  // El anillo de adentro, más lejos del centro que antes (era 0,55): así el
  // negro sin nada encima -el "fondo negro del medio"- es un círculo más grande
  // y se nota más, en vez de quedar tapado enseguida por el anillo chico.
  const CUMULO_INTERIOR_RADIO = 0.72; // por CUMULO_ANILLO
  const CUMULO_GIRO = 9; // radianes por segundo: giran muy rápido (más de una vuelta por segundo)
  const CUMULO_VIDA = 14; // segundos que dura el par de agujeros si no entran
  const CUMULO_DISTANCIA_PAR = 260; // px del mundo: separación mínima entre los dos agujeros del par
  const CUMULO_PRIMERO = 2.5; // segundos hasta el primer par
  const CUMULO_INTERVALO = [3, 6]; // segundos entre un par y el siguiente (al azar)
  const CUMULO_DISTANCIA_MIN = 160; // px del mundo: no aparecen encima de la nave
  // Pulso: el agujero se estira y vuelve a su tamaño una vez por compás de la
  // música (los dos del par a la vez). Solo es visual: la zona de entrada no
  // cambia. Importante: el pico (el disco en lo más alto del pulso) no puede
  // superar la zona real de entrada (CUMULO_RADIO, 26 px) -si no, se ve el
  // dibujo entrando en la piedra antes de que en verdad se pueda cruzar-. Por
  // eso no es un número suelto: CUMULO_PULSO_AMPLITUD sale de CUMULO_PICO_ORIGINAL
  // (el crecimiento de pulso de toda la vida, 1,4 = +40 %) dividido
  // CUMULO_DISCO_RADIO, así el pico queda siempre en los mismos 22,4 px de
  // siempre (16 × 1,4), lo agrande o no el disco.
  const CUMULO_PICO_ORIGINAL = 1.4;
  const CUMULO_PULSO_AMPLITUD = CUMULO_PICO_ORIGINAL / CUMULO_DISCO_RADIO - 1;
  const CUMULO_PULSO_TIEMPOS = 1.25; // lo que dura cada pulso (estirar y volver), en tiempos de la música
  const CUMULO_PULSO_ATAQUE = 0.25; // fracción del pulso que se dedica a estirar (el resto es volver)
  // La música del juego (nivel4.ogg) está en 5 tiempos: 145,6 BPM y el bucle son
  // exactamente 60 compases (123,62 s), y el archivo arranca en el primer tiempo
  // (ahí entra el bombo). Se midió sobre el audio; si se cambia la canción hay que
  // volver a medirlo.
  // Números de estrellas: al cruzar un agujero, en el de salida las estrellas del
  // cierre salen en todas direcciones (como las chispas de siempre), se acomodan
  // formando el número del pasaje (10, 9, 8... 1, como la voz), se quedan un
  // momento y caen achicándose. Son pocas estrellas (unas 30 o 40 para el 10, del
  // tamaño de las chispas) puestas a lo largo de la línea central de cada dígito,
  // a distancias parejas: se lee como un número dibujado con estrellas, no como
  // una grilla de puntos ni como una masa.
  const NUMERO_ALTO = 52; // px del mundo: alto de los dígitos
  const NUMERO_ESPACIO = 5.6; // px del mundo: distancia mínima entre estrellas (más chico = más estrellas)
  // Mismo radio que las estrellas cercanas del fondo (ver armarCielo): así el número
  // se ve hecho de las mismas estrellas que decoran el fondo, no de puntos más
  // grandes y aparte.
  const NUMERO_RADIO = [0.6, 1.7];
  // Titilan igual que las de fondo (ver dibujarEstrellas): cada una con su
  // propia velocidad y fase, siguiendo el mismo reloj.
  const NUMERO_TITILAR_VEL = [0.7, 2.1];
  // Que no quede perfecto, como dibujado a mano con estrellas: cada vez el número
  // sale con su propia inclinación y cada estrella se corre un poco de su lugar.
  const NUMERO_TEMBLOR = 1.7; // px del mundo: cuánto se corre cada estrella (al azar)
  const NUMERO_GIRO = 0.09; // radianes: cuánto puede girar el número entero (a cada lado)
  const NUMERO_CURSIVA = [-0.04, 0.12]; // cuánto se tumba hacia un costado (como letra cursiva)
  const NUMERO_CAE_A = 2.1; // segundos desde el cruce hasta que empiezan a caer (ya formado desde ~1 s)
  const NUMERO_CAIDA = 0.9; // segundos que tardan en caer y achicarse del todo
  const NUMERO_GRAVEDAD = 260; // px/s² del mundo
  const MUSICA_TIEMPOS_COMPAS = 5;
  const MUSICA_COMPASES_BUCLE = 60; // compases que dura el bucle entero
  const MUSICA_PULSO_TIEMPO = 0; // en qué tiempo del compás cae el pulso (0 = el primero, 4 = el último): para correrlo si se siente desfasado
  const MUSICA_COMPAS_RESPALDO = 2.0604; // segundos del compás a velocidad normal: se usa si no se puede saber dónde va la música
  // La batería entra al empezar el compás 7 (12,36 s; medido sobre el audio). En
  // el tutorial, cada partida arranca la música ahí, ya con la batería; al dar
  // la vuelta el bucle sigue desde el principio, como siempre.
  const MUSICA_BATERIA_COMPASES = 6;
  // Final (victoria): la intro otra vez, con los parallax 7 en blanco y negro,
  // junto a la nave del jugador (que las mira) y con el zoom a la nave. Los
  // tiempos son los de la intro (INTRO_LLEGADA, INTRO_SALIDA...), salvo la espera.
  const FINAL_NAVE_DUR = 2.6; // fase 1: segundos de zoom a la nave del jugador, ya a color (después llegan las navecitas)
  const FINAL_ZOOM_NAVE = 1.25; // zoom de esa fase (y se queda en la 2), encima del de la cámara del juego (que es el de la intro; 1 = igual que la intro)
  const FINAL_COLOR_SUAVIZADO = 3; // 1/s: en el final la nave termina de teñirse rápido (COLOR_SUAVIZADO es el del juego)
  const FINAL_ZOOM_FONDO = 0.5; // el fondo starry se acerca menos (fracción del zoom de las naves), así hay paralaje
  const FINAL_COLA = 0.3; // segundos entre que se va la última nave y se vuelve al escenario principal
  const FINAL_ESPERA = 1.7; // fase 2: segundos que esperan juntas antes de irse (más que en la intro, para que se alcance a leer el globo)
  const FINAL_DISTANCIA = 230; // px del mundo: a qué distancia (en horizontal) de la nave del jugador se juntan
  const FINAL_ELEVACION = 110; // px del mundo: y cuánto más arriba que ella
  // Globo de diálogo de una de las navecitas (índice en FINAL_NAVES).
  const FINAL_GLOBO = {
    nave: 3, // la que queda más arriba: el globo le sale por encima sin tapar a las otras
    texto: "*#$%!",
    desde: INTRO_LLEGADA - 0.4, // segundos de la fase 2 en que aparece (todavía llegando)...
    hasta: INTRO_LLEGADA + FINAL_ESPERA + 1.1, // ...y en que se va (ya se están escapando, el globo las sigue)
    fuente: 15, // px del mundo
  };
  // Cada nave: desde dónde entra (siempre afuera de lo que se ve, p = punto de
  // encuentro, v = vista) y dónde se acomoda, relativo al punto (px del mundo).
  const FINAL_NAVES = [
    { desde: (p, v) => ({ x: p.x - 60, y: v.y - 100 }), a: { x: -6, y: -4 } },
    { desde: (p, v) => ({ x: v.x - 100, y: p.y + 120 }), a: { x: -56, y: 30 } },
    {
      desde: (p, v) => ({ x: v.x + v.w + 100, y: p.y - 200 }),
      a: { x: 50, y: -30 },
    },
    {
      desde: (p, v) => ({ x: p.x + 240, y: v.y + v.h + 100 }),
      a: { x: 14, y: -50 },
    },
  ];
  const COLOR_PASOS = 40; // escalones en que se actualiza el filtro de color de la nave (0 a 1)
  const COLOR_SUAVIZADO = 0.8; // 1/s: cuánto tarda la nave en alcanzar el color nuevo (más bajo = más lento)
  const CUMULOS_PARA_COLOR = 10; // cuántos pasajes hacen falta para que la nave quede con todo su color (cada uno la pinta 1/10)
  const TIMER_COLOR_FIN = "#f19280"; // salmón del sitio (--accent en styles.css): el segundero pasa del blanco a este a medida que se colorea la nave
  const POLIGONO_COLOR_FIN = "#0d1b2e"; // azul starry (--navy en styles.css): el relleno de los polígonos pasa del negro a este a medida que se colorea la nave

  // --- Modo contra la PC ---------------------------------------------------
  // Una segunda nave (la PC) en el mismo mundo, con su propia lluvia de
  // piedras que la persigue a ella. Cualquier piedra golpea a cualquier nave;
  // la golpeada cae y queda fuera de juego STUN segundos (sin lluvia propia e
  // invulnerable), después reaparece donde la golpearon. Los agujeros de
  // gusano son la pelota: el primero que entra suma el gol y sale por el otro
  // del par. Gana el primero en llegar a CUMULOS_PARA_COLOR.
  const STUN = 3;
  const BORDE_JUGADOR = "#5aa9ff"; // piedras que persiguen al jugador
  const BORDE_RIVAL = "#ff5a5a"; // piedras que persiguen a la PC
  // La física de la nave del rival (jugador 2 o PC) no tiene números propios:
  // es window.naveFisica, la misma ficha con la que script.js mueve la del
  // jugador 1 (empuje, boost, freno, stick y cuánto se puede salir de la
  // pantalla). Ver moverRival.
  // La dificultad de la PC (se elige en el menú, ver cambiarDificultad). Se
  // mueve siempre con la misma física que el jugador: lo que cambia es cómo
  // decide (ver rumboRival y moverRival).
  // - atencion: s que tarda en salir a buscar un agujero nuevo (contra el
  //   jugador es una carrera por cada agujero: es lo que más se nota).
  // - reflejos: s que tarda en darse cuenta de una piedra que se le acerca.
  // - peligro: px del mundo desde los que una piedra la espanta.
  // - error: qué tan seguido se equivoca: va al agujero más lejano del par (el
  //   gol vale igual, pero tarda más) o duda un momento (DUDA_*).
  // - boost: acelera (como el jugador con Shift) cuando el agujero está a más
  //   de RIVAL_BOOST_DIST px y no hay piedras encima, con una energía que se
  //   gasta a "gasto" por segundo y vuelve a "recupera"; para volver a
  //   acelerar tiene que juntar RIVAL_BOOST_MIN. null: sin límite, como el
  //   jugador; false: no acelera nunca.
  const DIFICULTADES = {
    facil: {
      atencion: 1.5,
      reflejos: 1,
      peligro: 60,
      error: 0.5,
      boost: false,
    },
    regular: {
      atencion: 0.8,
      reflejos: 0.35,
      peligro: 130,
      error: 0.2,
      boost: { gasto: 0.4, recupera: 0.25 },
    },
    dificil: { atencion: 0, reflejos: 0, peligro: 180, error: 0, boost: null },
  };
  // A ciegas: con el centro fuera de la pantalla (abajo; por arriba no puede
  // salirse) la PC no ve dónde está, igual que el jugador cuando se le va la
  // nave. Solo ve las piedras que están en pantalla, y con los reflejos de
  // CIEGA_REFLEJOS s si los suyos son mejores. A los CIEGA_DARSE_CUENTA s se
  // da cuenta y vuelve a la pantalla antes de seguir con los agujeros. Igual
  // en todas las dificultades: no es habilidad, es que no ve.
  const CIEGA_REFLEJOS = 0.35;
  const CIEGA_DARSE_CUENTA = 0.3;
  const RIVAL_BOOST_DIST = 320;
  const RIVAL_BOOST_MIN = 0.4;
  const DUDA_POR_SEG = 0.5; // con error 1, dudas por segundo (con 0,35, una cada ~6 s)
  const DUDA_SEG = 0.5; // s que dura una duda
  // Sin agujeros la PC pasea (ver rumboRival): va a un punto al azar del mapa
  // y a los PASEO_SEG (o al llegar, a PASEO_LLEGO px) elige otro; los últimos
  // PASEO_FRENO px va frenando.
  const PASEO_SEG = [3, 6];
  const PASEO_LLEGO = 60;
  const PASEO_FRENO = 120;
  // Presión de la lluvia contra el que da vueltas al mapa (ver actualizar):
  // cada vuelta suma PRESION_POR_VUELTA (tope 1) y baja PRESION_BAJA por
  // segundo, así que dando una vuelta cada ~5 s o menos se mantiene alta.
  const PRESION_POR_VUELTA = 0.5;
  const PRESION_BAJA = 0.1;
  // Además, cada vez que una nave da la vuelta le caen VUELTA_PIEDRAS piedras
  // apuntadas a ella, VUELTA_PIEDRA_RAPIDEZ veces más rápidas que las normales.
  const VUELTA_PIEDRAS = 2;
  const VUELTA_PIEDRA_RAPIDEZ = 1.4;
  const BUSQUEDA_VUELTA_EXTRA = 0.6; // con presión 1, las piedras corrigen 60 % más rápido de costado
  const FIN_DURA = 4; // segundos con el cartel del ganador
  // Apenas alguien llega a 10 el juego no se frena de golpe: sigue FIN_LENTO_DURA
  // segundos más en cámara lenta (a FIN_LENTO de la velocidad normal), ya sin
  // que nadie pueda mover nada, y recién ahí queda quieto (ver animarFin).
  const FIN_LENTO_DURA = 1; // s de verdad
  const FIN_LENTO = 0.25;
  // Repulsión entre naves, medida en largos de nave (el dibujo, no la hitbox,
  // que es bastante más chica): empiezan a empujarse con los centros a
  // REPELER_ALCANCE largos, y nunca quedan a menos de REPELER_MINIMO. El empujón
  // crece al acercarse hasta REPELER_FUERZA px por cuadro² (más que el motor,
  // naveFisica.empuje, así que no se pueden encimar a propósito).
  const REPELER_ALCANCE = 2.2;
  const REPELER_MINIMO = 0.9;
  const REPELER_FUERZA = 1.5;
  // Al volver después de un golpe, la nave reaparece en el medio abajo (como al
  // reiniciar en el juego original) y parpadea INVULNERABLE segundos: en ese
  // rato no la golpea nada ni rebota con la otra nave.
  const INVULNERABLE = 2;
  // Con dos lluvias el campo se llenaba demasiado: cada una cae LLUVIA_MENOS
  // veces más espaciada que la del juego original.
  const LLUVIA_MENOS = 2;
  // Tope de color de la partida: el que en el juego original se tiene al pasar
  // el agujero 7 de 10.
  const COLOR_MAXIMO = 0.7;
  // Las dos naves van aparte del resto de la escena: no arrancan del todo en
  // blanco y negro sino con la mitad de su color, y con los goles llegan a
  // todo su color (en el tutorial a los 10 goles; con rival, cuando el que va
  // ganando llega a 10, aunque la escena se quede en COLOR_MAXIMO). La
  // presentación sigue como siempre: esto es desde que se elige un modo.
  const NAVES_COLOR_INICIO = 0.5;
  const NAVES_COLOR_SUAVIZADO = 3; // 1/s: lo que tardan en acompañar al color de la escena
  // Online, buscando rival: la nave (que se puede mover) parpadea de todo su
  // color al blanco y negro y vuelve, una vuelta cada BUSCANDO_PARPADEO
  // segundos, y a "buscando rival" se le escriben y se le borran los puntitos.
  const BUSCANDO_PARPADEO = 1.2;
  const BUSCANDO_PUNTOS = ["", ".", "..", "...", "..", "."];
  const BUSCANDO_PUNTO_DURA = 0.3; // s de cada paso de los puntitos
  // La nave de la PC se ve semitransparente, para no confundirla con la tuya.
  const RIVAL_OPACIDAD = 0.55;
  // Las dos naves se ven igual que en el tutorial (mismo blanco y negro, sin
  // ningún tinte de color): lo único que las diferencia en los modos con rival
  // es el halo -azul el que le toca al jugador (ver .multijugador en
  // styles.css), rojo el que le toca al rival-. Contra la PC y con dos
  // jugadores el rival siempre es el rojo; online puede ser cualquiera de los
  // dos según quién entró primero (ver esAzul), así que acá se elige entre
  // los dos halos en vez de tener uno fijo.
  const HALO_ROJO =
    "drop-shadow(0 0 5px rgba(255, 90, 90, 0.95)) drop-shadow(0 0 14px rgba(255, 90, 90, 0.55))";
  const HALO_AZUL =
    "drop-shadow(0 0 5px rgba(90, 169, 255, 0.95)) drop-shadow(0 0 14px rgba(90, 169, 255, 0.55))";
  // En calidad baja (js/calidad.js), solo el cercano, como la nave del jugador.
  const HALO_ROJO_BAJA = "drop-shadow(0 0 5px rgba(255, 90, 90, 0.95))";
  const HALO_AZUL_BAJA = "drop-shadow(0 0 5px rgba(90, 169, 255, 0.95))";
  const calidadBaja = () => !!window.calidad && window.calidad.nivel === "baja";

  const scene = document.getElementById("game-scene");
  const canvas = document.getElementById("game-canvas");
  const timerEl = document.getElementById("game-timer");
  const ship = document.getElementById("starry-cohete-pair");
  const tapa = document.getElementById("game-tapa"); // pantalla negra por encima de la nave
  const ayudaEl = document.getElementById("game-ayuda"); // instrucciones del arranque
  const modoEl = document.getElementById("game-modo"); // elección: contra la PC o dos jugadores
  if (!scene || !canvas || !timerEl || !ship || !ayudaEl) return;
  // Adentro del portfolio (agustint96.github.io lo muestra en un iframe en su
  // escenario 4): sin el logo de la presentación, que ya se está en el sitio, y
  // con "volver al sitio" en el menú (ver volverAlSitio). Suelto, esa opción no
  // va. El juego siempre corre adentro del marco (index.html), así que no
  // alcanza con mirar si hay una página de afuera: el marco avisa con
  // ?embebido=1 cuando a él lo tiene el portfolio.
  const embebido = new URLSearchParams(location.search).has("embebido");
  if (!embebido && modoEl) {
    const volver = modoEl.querySelector('[data-elegir="volver"]');
    if (volver) volver.remove();
  }
  // Las dos versiones de las instrucciones (ver #game-ayuda en juego.html), cada
  // una con sus pasos y con el dibujo de cada tecla o botón ("up", "shift"...).
  const modosAyuda = {};
  ayudaEl.querySelectorAll("[data-modo]").forEach((el) => {
    const teclas = {};
    el.querySelectorAll("[data-tecla]").forEach((t) => {
      teclas[t.dataset.tecla] = t;
    });
    modosAyuda[el.dataset.modo] = {
      el,
      pasos: [...el.querySelectorAll(".game-ayuda-paso")],
      teclas,
      palanca: el.querySelector(".game-stick-palanca"), // solo la del joystick
    };
  });
  if (!modosAyuda.teclado || !modosAyuda.joystick) return;
  const ctx = canvas.getContext("2d");

  // Hitbox de la nave: tres círculos sobre el sprite (cohete.webp, 203x300),
  // en px de la caja de 130x130 donde vive (el sprite queda pegado a la
  // izquierda: mide ~88px de ancho, de ahí el x = 44). Un poco más chicos
  // que el dibujo para que los roces no cuenten.
  const CAJA_NAVE = 130;
  const NAVE_CIRCULOS = [
    { x: 44, y: 30, r: 11 }, // punta
    { x: 44, y: 52, r: 15 }, // cuerpo
    { x: 44, y: 76, r: 20 }, // alas
  ];

  let cajaNave = CAJA_NAVE; // ancho de la caja de la nave (ver medirNave)
  let activo = false;
  let raf = 0;
  let ultimo = 0;
  let poligonos = [];
  let tiempo = 0;
  let acumSpawn = 0;
  let choque = false;
  let tChoque = 0;
  let ultimoTexto = "";
  let dpr = 1;
  let introT = -1; // segundos de intro (-1: sin intro)
  let gracia = GRACIA; // segundos sin polígonos desde que empieza a correr el tiempo
  let musicaIniciada = false; // ya se pidió cargar la música
  let audioCtx = null; // Web Audio
  let musicaBuffer = null; // música decodificada (ver MUSICA_FUENTES)
  let musicaGain = null;
  let perderGain = null;
  let perderBuffer = null; // audio/Esc4/game sound/stopgame.m4a decodificado
  let perderFuente = null; // fuente sonando ahora (o null)
  let notaGain = null;
  let notaBuffer = null; // audio/Esc4/game sound/mimayor.m4a decodificado
  let notaFuente = null; // fuente sonando ahora (o null)
  let nota = null; // <audio> de respaldo
  let portalGain = null;
  let portalBuffer = null; // audio/Esc4/portales/nuevoportal.m4a decodificado
  let portalFuente = null; // fuente sonando ahora (o null)
  let portal = null; // <audio> de respaldo
  let portalCruceGain = null;
  let portalCruceBuffer = null; // audio/Esc4/portales/portal++.m4a decodificado
  let portalCruceFuente = null; // fuente sonando ahora (o null)
  let portalCruce = null; // <audio> de respaldo
  // Cada voz es { url, buffer, audio }: el buffer decodificado, o un <audio> de
  // respaldo si falla Web Audio.
  const crearVoz = (url) => ({
    url: encodeURI(url),
    buffer: null,
    audio: null,
  });
  const conteo = CONTEO_ARCHIVOS.map((variantes) =>
    variantes.map((f) => crearVoz(CONTEO_URL + f)),
  ); // un elemento por número (10 a 1), con sus variantes
  const vocesAnimo = VOZ_ANIMO.map((f) => crearVoz(VOZ_URL + f));
  const vocesCansado = VOZ_CANSADO.map((f) => crearVoz(VOZ_URL + f));
  const vocesFelicita = VOZ_FELICITA.map((f) => crearVoz(VOZ_URL + f));
  const vocesUltimoPunto = VOZ_ULTIMO_PUNTO.map((f) => crearVoz(VOZ_URL + f));
  const vocesEmpate = VOZ_EMPATE.map((f) => crearVoz(VOZ_URL + f));
  const vocesAyuda = AYUDA_VOCES.map((paso) =>
    paso.map((f) => crearVoz(VOZ_URL + f)),
  ); // un elemento por paso de las instrucciones, con sus variantes
  const vocesAyudaJoystick = AYUDA_VOCES_JOYSTICK.map((paso) =>
    paso.map((f) => crearVoz(VOZ_URL + f)),
  );
  const vocesListo = AYUDA_LISTO.map((f) => crearVoz(VOZ_URL + f));
  let vozGain = null;
  let vozFuente = null; // fuente sonando ahora (o null)
  let vozAudio = null; // <audio> de respaldo sonando ahora (o null)
  let vozSonando = false; // hay una voz sonando
  let vozId = 0; // cambia con cada voz nueva o cortada (para ignorar el final de una vieja)
  let vozPendiente = null; // voz de ánimo/cansancio que espera a que se libere el canal
  let proxAnimo = []; // segundos de la partida en que tocan las voces de ánimo que faltan, en orden
  let animoDichas = []; // las voces de ánimo que ya sonaron en esta partida (para no repetir)
  let proxCansado = VOZ_CANSADO_DESDE; // segundo de la próxima tirada de cansancio
  let perder = null; // <audio> de respaldo
  let musicaFuente = null; // fuente sonando ahora (o null)
  let introBuffer = null; // audio/Esc4/game sound/nivel4_intro.m4a decodificado
  let introGain = null;
  let introFuente = null; // fuente sonando ahora (o null)
  // Se pidió la música del juego (o la de las instrucciones) antes de que
  // terminara de cargar -pasa al entrar a un modo apenas abierta la página, ver
  // reiniciarEnModo-: arranca apenas está (ver cargarMusica). frenarMusica y
  // frenarMusicaIntro lo cancelan.
  let musicaPendiente = false;
  let introPendiente = false;
  let vocesCargadas = false; // ya se decodificaron todas las voces
  let musicaIntro = null; // <audio> de respaldo
  // Instrucciones: null fuera de ellas, si no { modo, paso, fase, t, hechas }
  // (modo: la versión que se muestra, de modosAyuda). fase:
  // "antes" (esperando a que arranquen), "activa" (paso visible, esperando las
  // teclas), "hecha" (ya se usaron, esperando el segundo y a que termine la
  // voz), "saliendo" (el paso se está desvaneciendo) o "listo" (dice "listo" y
  // se espera a que termine). t = segundos en la fase; hechas = teclas ya
  // apretadas en el paso.
  let ayuda = null;
  const sostenidas = new Set(); // teclas de las instrucciones que están apretadas ahora
  let musicaT = 0; // segundos que lleva sonando la música (para acelerarla)
  // Dónde va la música dentro del bucle (segundos del audio original, sin la
  // aceleración) para que los agujeros pulsen a tiempo: Web Audio no lo informa,
  // así que se va sumando lo que avanza su reloj por la velocidad de reproducción.
  let musicaPos = 0;
  let musicaRelojPrev = 0; // audioCtx.currentTime en el cuadro anterior
  let musicaLatencia = 0; // segundos entre que el reloj avanza y se oye
  let musica = null; // <audio> de respaldo si falla Web Audio
  let spriteP7 = null; // imagen del parallax 7, se carga al entrar por primera vez
  let spriteP7BN = null; // el parallax 7 en blanco y negro con sombra interna (canvas)
  let final = null; // animación de la victoria ({ t }), o null
  let ganado = false; // ya se ganó esta partida (empezó el final)
  let oscuro = false; // ya empezó a caer la pantalla negra
  let negro = false; // la pantalla ya está toda negra (fondo y nave ya cambiaron a blanco y negro)
  let miradaGrados = 0; // hacia dónde mira la nave en la intro (queda fija cuando se van las navecitas)
  let reloj = 0; // segundos corridos (para el titilar de las estrellas)
  // Titilan de a grupos (uno por grupo, un solo fill cada uno) en vez de una por
  // una: se ve igual y cuesta 4 fills por capa en lugar de uno por estrella.
  const GRUPOS_ESTRELLAS = [
    { vel: 0.7, fase: 0 },
    { vel: 1.1, fase: 1.7 },
    { vel: 1.6, fase: 3.1 },
    { vel: 2.1, fase: 4.6 },
  ];
  // Dados con semilla (mulberry32): la misma semilla tira siempre los mismos
  // números, así la misma semilla arma siempre el mismo cielo. Online el
  // anfitrión le manda la suya al invitado (ver "cielo" en recibirOnline) y
  // los dos ven el mismo.
  function dados(semilla) {
    let a = semilla >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  // Cada capa es una tira fija con sus estrellas: p es el lugar en la tira, en
  // pantallas; fy, la altura como fracción de la pantalla (con margen, como
  // las x). La lejana gira "gira" de lo que gira la cercana, y su tira mide
  // eso mismo por el largo del tubo: así las dos vuelven juntas al principio.
  let semillaCielo = Math.floor(Math.random() * 1e9);
  let capasCielo = []; // [lejana, cercana]: { largo, gira, brillo, porGrupo }
  let cieloCorrido = 0; // pantallas que giró el cielo (+ hacia la derecha)
  function armarCielo(semilla) {
    semillaCielo = semilla;
    const azar = dados(semilla);
    const capa = (porPantalla, gira, brillo, rMin, rMax) => {
      const largo = CIELO.pantallas * gira;
      const porGrupo = GRUPOS_ESTRELLAS.map(() => []);
      const total = Math.round(porPantalla * largo);
      for (let i = 0; i < total; i++)
        porGrupo[i % porGrupo.length].push({
          p: azar() * largo,
          fy: -0.15 + azar() * 1.3,
          r: rMin + azar() * (rMax - rMin),
        });
      return { largo, gira, brillo, porGrupo };
    };
    const lejana = CIELO.lejana;
    capasCielo = [
      capa(lejana.estrellas, lejana.gira, lejana.brillo, 0.35, 0.8),
      capa(CIELO.estrellas, 1, 1, 0.6, 1.7),
    ];
  }
  armarCielo(semillaCielo);
  let gusanoSprites = null; // anillos de los agujeros ya dibujados con brillo (ver armarSprites)
  let luzSprites = null; // la luz de la nave ya dibujada (degradado), en blanco y en salmón
  let cumulos = []; // cúmulos de estrellas azules en el mapa
  let particulas = []; // chispas de cuando se choca un cúmulo
  let numeroEstrellas = []; // estrellas que forman el número del pasaje (ver crearNumeroEstrellas)
  let acumCumulo = 0;
  let proxCumulo = CUMULO_PRIMERO;
  let cumulosTomados = 0; // choques de esta partida
  let colorNave = 0; // 0 = blanco y negro ... 1 = todos sus colores (lo que se ve)
  let colorObjetivo = 0; // hacia dónde va colorNave
  let colorEscalon = 0; // último escalón aplicado al fondo (ver aplicarColorNave)
  let tinteNaves = 0; // el color de las dos naves, 0..1 (ver NAVES_COLOR_INICIO)
  let tinteEscalon = 0; // último escalón aplicado al filtro de la nave (ver aplicarTinteNaves)
  // Levantado de brillo del filtro de la nave con la luz prendida (styles.css,
  // .luz-on): cada canal pasa a slope * x + intercept. A color completo tiene
  // que quedar sin tocar (slope 1, intercept 0) para que se vea como el sprite
  // original, igual que en el index.
  const LUZ_SLOPE_GRIS = 1.4;
  const LUZ_INTERCEPT_GRIS = 0.1;
  let enCentro = false; // la partida arrancó recolocando la nave: se la sostiene en el medio durante la gracia
  let golpeadora = null; // la piedra que chocó a la nave: sigue de largo
  let naveCae = { x: 0, y: 0, giro: 0 }; // velocidad de la nave golpeada (px/s y grados/s)
  let tQuieta = 0; // segundos seguidos sin que la nave se mueva
  let navePrev = null; // centro de la nave en el cuadro anterior (mundo)
  // Modo contra la PC (ver STUN y compañía arriba).
  let rival = null; // { x, y, vx, vy, rot, stun, invul, t, cae, hx, hy } centro de la caja, en el mundo
  let poligonosRival = [];
  let idPoligono = 0; // online, para seguir cada piedra de un mensaje al otro
  // Lo que llega del rival se muestra unos segundos en el pasado (retrasoRed),
  // pasando de a poco entre los dos mensajes que rodean ese momento: así la
  // nave y las piedras se mueven parejo aunque los mensajes lleguen a
  // destiempo (a veces tarde, a veces dos juntos). Mostrar solo el último,
  // en cambio, las hace saltar hacia atrás con cada mensaje nuevo.
  // El retraso se adapta: con una conexión pareja es RETRASO_MIN; si los
  // mensajes llegan a los tirones, sube hasta cubrir el atraso más largo de
  // los últimos segundos (con tope en RETRASO_MAX).
  const RETRASO_MIN = 0.1;
  const RETRASO_MAX = 0.5;
  let retrasoRed = RETRASO_MIN;
  let atrasoRed = 0; // el atraso más largo reciente (s), que se va olvidando
  let estadosRival = []; // { t, x, y, rot, stun, tc, inv, p: Map id -> [x, y, vx, vy, ang, giro] }
  const piedrasRival = new Map(); // id -> la piedra que se dibuja (forma fija)
  let desfaseReloj = null; // reloj propio - reloj del rival, en s (sin la demora de más)
  let acumSpawnRival = 0;
  let golesRival = 0;
  let golDeOroHasta = 0; // hasta qué segundo de la partida se ve el cartel de GOL DE ORO (ver revisarFin)
  let cierres = []; // online, anfitrión: los pares cerrados hace poco (ver "Goles online")
  let stunJugador = 0; // segundos que le quedan fuera de juego a la nave del jugador
  let invulJugador = 0; // segundos que le quedan parpadeando (invulnerable)
  let reaparecer = null; // centro de la caja de la nave (pantalla) donde la golpearon
  let fin = null; // { t, ganador: "vos" | "pc" | "abandono" } alguien llegó a 10 (o se fue el rival online)
  // "tutorial": el juego del sitio sin segunda nave y sin las navecitas de la
  // intro ni del final: las instrucciones, una lluvia, el choque reinicia, la
  // cuenta de 10 a 1 y la nave se tiñe del todo; al llegar a 10, GANASTE y al
  // menú (ver esTutorial() en cada lugar donde se aparta del resto).
  // "pc": la segunda nave la maneja la PC; "dos": la maneja una persona, con el
  // joystick si hay uno o si no con las flechas y Shift derecho (ver
  // actualizarControles); "online": la maneja otra persona desde su PC (ver
  // "Online" más abajo). null mientras se elige, al arrancar.
  let modo = null;
  const esTutorial = () => modo === "tutorial";
  const teclasJ2 = {
    up: false,
    down: false,
    left: false,
    right: false,
    boost: false,
  };
  const TECLAS_J2 = {
    ArrowUp: "up",
    ArrowDown: "down",
    ArrowLeft: "left",
    ArrowRight: "right",
    ShiftRight: "boost",
  };
  // Los dos en el teclado con los lados dados vuelta (window.tecladoAlReves,
  // ver actualizarControles): el jugador 2 pasa a WASD y Shift izquierdo.
  const teclasJ2Wasd = {
    up: false,
    down: false,
    left: false,
    right: false,
    boost: false,
  };
  const TECLAS_J2_WASD = {
    KeyW: "up",
    KeyS: "down",
    KeyA: "left",
    KeyD: "right",
    ShiftLeft: "boost",
  };
  // En el menú de modos WASD hace lo mismo que las flechas: W y S suben y
  // bajan, A y D dan vuelta los lados de dos jugadores.
  const FLECHA_DE = {
    ArrowUp: "ArrowUp",
    ArrowDown: "ArrowDown",
    ArrowLeft: "ArrowLeft",
    ArrowRight: "ArrowRight",
    KeyW: "ArrowUp",
    KeyS: "ArrowDown",
    KeyA: "ArrowLeft",
    KeyD: "ArrowRight",
  };
  document.addEventListener("keydown", (ev) => {
    if (TECLAS_J2[ev.code]) teclasJ2[TECLAS_J2[ev.code]] = true;
    if (TECLAS_J2_WASD[ev.code]) teclasJ2Wasd[TECLAS_J2_WASD[ev.code]] = true;
    if (!activo) return;
    if (presenta) {
      // Cualquier tecla, pero no la que se repite por tenerla apretada: la de
      // la carátula saltearía también el logo.
      if (!ev.repeat) tocarPresentacion();
      return;
    }
    if (esperaToque) {
      // Ni Escape ni una tecla que se repite por tenerla apretada cuentan como
      // toque para el navegador: no desbloquean el audio.
      if (ev.code !== "Escape" && !ev.repeat) tocarEspera();
      return;
    }
    if (selector) {
      teclaSelector(ev);
      return;
    }
    if (claveAbierta()) {
      // Escribiendo la clave, con el campo sin foco (se hizo click afuera):
      // lo que se escribe en él no llega acá (ver claveCampo más abajo).
      if (ev.code === "Enter" || ev.code === "NumpadEnter") buscarConClave();
      else if (ev.code === "Escape") cancelarClave();
      else claveCampo.focus();
      return;
    }
    if (modo && ev.code === "Escape") {
      alternarPausa();
    } else if (!modo && ev.code === "Escape") {
      volverAlSitio(); // solo hace algo adentro del portfolio
    } else if (pausa === "salir") {
      // Online, el cartel de salir: las flechas pasan de una opción a la otra
      // (también mueven la nave: el juego sigue). Las opciones están una al
      // lado de la otra, pero valen las cuatro.
      const paso = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
      if (paso[ev.code]) apuntarSalir(salirApuntada + paso[ev.code]);
      else if (
        ev.code === "Enter" ||
        ev.code === "NumpadEnter" ||
        ev.code === "KeyE"
      )
        elegirSalir();
    } else if (!modo || pausa === "menu") {
      const MODOS = { 1: "tutorial", 2: "pc", 3: "dos", 4: "online" };
      if (embebido) MODOS[5] = "volver";
      const n = /^(?:Digit|Numpad)([1-5])$/.exec(ev.code);
      const flecha = FLECHA_DE[ev.code];
      if (n && MODOS[n[1]]) {
        sonarMenu("seleccion");
        elegirModo(MODOS[n[1]]);
      }
      else if (flecha === "ArrowUp" || flecha === "ArrowDown") {
        apuntarOpcion(opcionApuntada + (flecha === "ArrowDown" ? 1 : -1));
        ev.preventDefault(); // que no scrollee la página detrás
      } else if (flecha === "ArrowLeft" || flecha === "ArrowRight") {
        // Solo hace algo parado en dos jugadores o en contra la PC.
        cambiarControles(flecha === "ArrowRight" ? 1 : -1);
        ev.preventDefault();
      } else if (
        ev.code === "Enter" ||
        ev.code === "NumpadEnter" ||
        ev.code === "KeyE"
      )
        elegirApuntada();
    }
  });
  const menuEl = document.getElementById("game-menu");
  if (menuEl) menuEl.addEventListener("click", () => alternarPausa());

  // Volver a la elección del modo, desde cualquier modo. Se recarga la página:
  // así todo arranca limpio. Online es como irse: al rival le llega que se fue
  // (se cierra la conexión) y a él le aparece el cartel. Se vuelve directo al
  // menú, sin la presentación (ver CLAVE_AL_MENU en setActive); recargar la
  // página a mano sí la muestra. apuntar: el modo en el que arranca apuntado
  // el menú (al perder contra la PC, "contra la PC"); si no, el primero.
  const CLAVE_AL_MENU = "esc4-al-menu";
  function salirAlMenu(apuntar) {
    try {
      sessionStorage.setItem(CLAVE_AL_MENU, apuntar || "1");
    } catch (e) {}
    location.reload();
  }

  // Pausa, con Escape, el botón de menú de arriba a la izquierda o el del
  // joystick (ver pausaConJoystick). null jugando; si no:
  // - "menu" (tutorial, contra la PC y dos jugadores): todo queda quieto -el
  //   juego, la nave y los sonidos-, en blanco y negro, con el menú de modos en
  //   el medio; se lo recorre igual que al arrancar y lo que se elige arranca de
  //   cero (ver reiniciarEnModo). Otra vez Escape (o el botón) sigue jugando.
  // - "salir" (online): el rival sigue jugando, así que no se frena nada; solo
  //   aparece el cartel que pregunta si salir, con continuar y salir.
  let pausa = null;
  const salirEl = document.getElementById("game-salir");
  // Capa por encima de la nave (la nave va por encima de toda la escena): el
  // menú se muda ahí mientras dura la pausa y después vuelve a su lugar.
  const capaEl = document.getElementById("game-capa");
  let modoCasa = null; // { padre, siguiente }: dónde estaba el menú
  const opcionesSalir = salirEl
    ? [...salirEl.querySelectorAll("[data-salir]")]
    : [];
  let salirApuntada = 0;
  let padSalirLR = false; // si LB o RB venían apretados (cartel de salir)
  let padSalirCruceta = 0; // 1 derecha o abajo, -1 izquierda o arriba, 0 nada
  // leerJoystick ya junta el stick (con su zona muerta) y la cruceta.
  const crucetaSalir = () => {
    const t = leerJoystick().teclas;
    return t.has("right") || t.has("down")
      ? 1
      : t.has("left") || t.has("up")
        ? -1
        : 0;
  };
  let padSalirA = false; // si el botón A venía apretado (cartel de salir)
  // Los <audio> de respaldo que sonaban al pausar, para seguirlos después.
  let sonandoAntesDePausa = [];

  function alternarPausa() {
    if (pausa) cerrarPausa();
    else if (enLinea()) abrirSalir();
    else abrirPausa();
  }

  function abrirPausa() {
    pausa = "menu";
    // Sin el botón de menú de arriba: así la pausa se ve igual que el menú del
    // principio, que no lo tiene. Se sigue con Escape o con el joystick.
    if (menuEl) menuEl.hidden = true;
    window.juegoEnPausa = true; // script.js: sin luz ni zoom mientras tanto
    pausarSonidos(true);
    scene.classList.add("en-pausa");
    // El menú arranca apuntando al modo que se está jugando.
    apuntarOpcion(
      opcionesModo.findIndex((el) => el.dataset.elegir === modo),
      true,
    );
    sincronizarPadMenu();
    if (capaEl) capaEl.classList.add("velo");
    if (modoEl) {
      if (capaEl) {
        modoCasa = { padre: modoEl.parentNode, siguiente: modoEl.nextSibling };
        capaEl.appendChild(modoEl);
      }
      modoEl.classList.add("pausa");
      modoEl.hidden = false;
    }
  }

  function abrirSalir() {
    pausa = "salir";
    if (menuEl) menuEl.hidden = true; // como en la pausa
    apuntarSalir(0, true); // arranca en continuar
    const gp = primerJoystick();
    padSalirLR = !!gp && (botonPad(gp, PAD_LB) || botonPad(gp, PAD_RB));
    padSalirA = !!gp && botonPad(gp, PAD_A);
    padSalirCruceta = gp ? crucetaSalir() : 0;
    if (salirEl) salirEl.hidden = false;
    // Buscando rival, el "buscando rival" queda justo detrás del cartel y
    // asoma por arriba: se esconde mientras está abierto.
    if (modoEl) modoEl.style.visibility = "hidden";
  }

  function cerrarPausa() {
    if (pausa === "menu") {
      pausarSonidos(false);
      scene.classList.remove("en-pausa");
      if (capaEl) capaEl.classList.remove("velo");
      if (modoEl) {
        modoEl.classList.remove("pausa");
        modoEl.hidden = true;
        if (modoCasa) {
          modoCasa.padre.insertBefore(modoEl, modoCasa.siguiente);
          modoCasa = null;
        }
      }
    }
    if (salirEl) salirEl.hidden = true;
    if (modoEl) modoEl.style.removeProperty("visibility");
    if (menuEl && modo) menuEl.hidden = false;
    pausa = null;
    window.juegoEnPausa = false;
  }

  // Con Web Audio alcanza con suspender el contexto (se frena todo lo que
  // suena por ahí, y su reloj también); los <audio> de respaldo se pausan de a
  // uno y siguen solo los que venían sonando.
  function pausarSonidos(frenar) {
    if (frenar) {
      if (audioCtx) audioCtx.suspend().catch(() => {});
      sonandoAntesDePausa = [
        musica,
        musicaIntro,
        vozAudio,
        perder,
        nota,
        portal,
        portalCruce,
      ].filter((a) => a && !a.paused);
      for (const a of sonandoAntesDePausa) a.pause();
    } else {
      if (audioCtx) audioCtx.resume().catch(() => {});
      for (const a of sonandoAntesDePausa) a.play().catch(() => {});
      sonandoAntesDePausa = [];
    }
  }

  // Elegir un modo desde la pausa: se recarga la página (como salirAlMenu, así
  // todo arranca limpio) y al volver se entra directo a ese modo, con los
  // controles como se hayan dejado (ver setActive).
  const CLAVE_MODO_PAUSA = "esc4-modo-pausa";
  function reiniciarEnModo(m) {
    try {
      sessionStorage.setItem(
        CLAVE_MODO_PAUSA,
        JSON.stringify({ modo: m, cambiados: controlesCambiados }),
      );
    } catch (e) {}
    recargarTrasSeleccion();
  }

  // Recarga la página (salirAlMenu) después de dejar sonar la "seleccion".
  // Una sola vez: lo que se apriete mientras tanto no la vuelve a pedir.
  let recargando = false;
  function recargarTrasSeleccion() {
    if (recargando) return;
    recargando = true;
    setTimeout(salirAlMenu, SELECCION_ANTES_DE_RECARGAR);
  }

  // Las dos opciones del cartel de salir; da la vuelta. Con los mismos sonidos
  // que el menú de modos (callado al abrir el cartel).
  function apuntarSalir(i, callado) {
    const n = opcionesSalir.length;
    if (!n) return;
    const nueva = ((i % n) + n) % n;
    const cambio = nueva !== salirApuntada;
    salirApuntada = nueva;
    opcionesSalir.forEach((el, j) =>
      el.classList.toggle("elegida", j === salirApuntada),
    );
    if (cambio && !callado) sonarMenu("selector");
  }

  function elegirSalir() {
    const el = opcionesSalir[salirApuntada];
    if (!el) return;
    sonarMenu("seleccion");
    if (el.dataset.salir === "si") recargarTrasSeleccion();
    else cerrarPausa();
  }

  opcionesSalir.forEach((el, i) => {
    el.addEventListener("click", () => {
      apuntarSalir(i);
      elegirSalir();
    });
    el.addEventListener("pointerenter", () => apuntarSalir(i));
  });

  // Joystick en el cartel de salir, un cuadro a la vez: LB y RB, o la cruceta
  // o el stick para cualquier lado, pasan de una opción a la otra y A elige,
  // todo por flanco (un paso por empujón). El stick y la cruceta también mueven
  // la nave: el juego sigue.
  function navegarSalirJoystick() {
    const gp = primerJoystick();
    if (!gp) {
      padSalirLR = false;
      padSalirCruceta = 0;
      padSalirA = false;
      return;
    }
    const lb = botonPad(gp, PAD_LB);
    const rb = botonPad(gp, PAD_RB);
    if ((lb || rb) && !padSalirLR) apuntarSalir(salirApuntada + (rb ? 1 : -1));
    padSalirLR = lb || rb;
    const cruceta = crucetaSalir();
    if (cruceta && cruceta !== padSalirCruceta)
      apuntarSalir(salirApuntada + cruceta);
    padSalirCruceta = cruceta;
    const a = botonPad(gp, PAD_A);
    if (a && !padSalirA) elegirSalir();
    padSalirA = a;
  }

  // La pausa desde el joystick: el botón de menú (el de la derecha de los dos
  // del medio, el start de toda la vida) o el X (el de la izquierda de los
  // cuatro). Los números son los del mapeo estándar del navegador, que es el
  // que usan los joysticks de hoy. Por flanco, para que no se dispare en cada
  // cuadro mientras se lo tiene apretado, y vale tenga el joystick quien lo
  // tenga: con dos jugadores es del segundo, pero pausar es pausar.
  const PAD_START = 9;
  const PAD_X = 2;
  let padSalirAntes = false;
  const padSalirApretado = () => {
    const gp = primerJoystick();
    return !!gp && (botonPad(gp, PAD_START) || botonPad(gp, PAD_X));
  };
  function pausaConJoystick() {
    const apretado = padSalirApretado();
    if (apretado && !padSalirAntes) alternarPausa();
    padSalirAntes = apretado;
  }
  document.addEventListener("keyup", (ev) => {
    if (TECLAS_J2[ev.code]) teclasJ2[TECLAS_J2[ev.code]] = false;
    if (TECLAS_J2_WASD[ev.code]) teclasJ2Wasd[TECLAS_J2_WASD[ev.code]] = false;
  });
  // Al perder el foco no llega el keyup: se sueltan todas.
  window.addEventListener("blur", () => {
    for (const k in teclasJ2) teclasJ2[k] = false;
    for (const k in teclasJ2Wasd) teclasJ2Wasd[k] = false;
  });

  // El menú de modo se puede recorrer de tres maneras, todas sobre el mismo
  // estado (opcionApuntada): las flechas, el stick o la cruceta del joystick y
  // el mouse. Se elige con enter, con E, con el botón A del joystick, con click
  // o con el número de la opción (eso último es el atajo de siempre, que saltea
  // el apuntado). El botón A y la E también son la tecla de acción del sitio
  // (triggerAction en script.js), pero en este escenario no hay nada que
  // accionar, así que no se pisan.
  const PAD_A = 0;
  const opcionesModo = modoEl
    ? [...modoEl.querySelectorAll("[data-elegir]")]
    : [];
  // Sosteniendo el stick el menú sigue corriendo solo, como una tecla apretada:
  // un paso apenas se empuja, y si se lo sigue sosteniendo arranca a repetir.
  const MENU_PAD_ESPERA = 0.4; // s sostenido antes de empezar a repetir
  const MENU_PAD_REPITE = 0.11; // s entre paso y paso mientras se sostiene
  let opcionApuntada = 0;
  let padMenuY = 0; // hacia dónde está empujado el stick
  let padMenuT = 0; // lo que falta para el próximo paso, en s
  let padMenuA = false; // si el botón A venía apretado
  let padMenuLR = false; // si LB o RB venían apretados
  let padMenuLRT = 0; // lo que falta para el próximo cambio, en s
  // Con dos jugadores y un joystick conectado: false = el jugador 1 al teclado
  // y el 2 al joystick (como siempre), true = al revés. Se cambia en el menú
  // con LB o RB, parado en "dos jugadores" (ver cambiarControles).
  let controlesCambiados = false;

  // --- Sonidos del menú --------------------------------------------------------
  // "selector" suena al pasar de una opción a otra (flechas, stick, cruceta o
  // mouse; no cuando la apunta el juego solo) y "seleccion" al elegir una. Van
  // por un AudioContext propio: el del juego se suspende en la pausa (ver
  // pausarSonidos) y el menú de la pausa también tiene que sonar.
  const SONIDOS_MENU = {
    selector: {
      url: "audio/Esc4/game sound/selector.mp3",
      volumen: 0.12,
      desde: 0,
    },
    // El archivo arranca con ~0,25 s de silencio: se lo saltea, así suena
    // justo al elegir.
    seleccion: {
      url: "audio/Esc4/game sound/seleccion.mp3",
      volumen: 0.15,
      desde: 0.24,
    },
    // El ruidito del foquito del planeta del escenario 2, para el logo de la
    // presentación (ver PRESENTA_LOGO_SUENA). Va por acá porque suena apenas
    // hubo un toque (el de la carátula), aunque el juego todavía no cargó lo suyo.
    foquito: {
      url: "audio/Esc2/everyone.m4a",
      volumen: 0.5,
      desde: 0,
    },
  };
  // Elegir desde la pausa recarga la página (ver reiniciarEnModo): se espera
  // esto antes de recargar, para que "seleccion" llegue a sonar.
  const SELECCION_ANTES_DE_RECARGAR = 500; // ms
  let menuCtx = null;

  function cargarSonidosMenu() {
    const AC = window.AudioContext || window.webkitAudioContext;
    try {
      menuCtx = new AC();
    } catch (e) {
      return;
    }
    for (const sonido of Object.values(SONIDOS_MENU)) {
      sonido.gain = menuCtx.createGain();
      sonido.gain.gain.value = sonido.volumen;
      sonido.gain.connect(menuCtx.destination);
      fetch(sonido.url)
        .then((r) => r.arrayBuffer())
        .then((datos) => menuCtx.decodeAudioData(datos))
        .then((buffer) => (sonido.buffer = buffer))
        .catch(() => {});
    }
  }

  function sonarMenu(nombre) {
    const sonido = SONIDOS_MENU[nombre];
    if (!menuCtx || !sonido.buffer) return;
    if (menuCtx.state !== "running") {
      // Sin ningún toque en la página no se pide: si no, se encola y suena
      // todo junto con el primer toque (ver sinToque).
      if (!(navigator.userActivation && navigator.userActivation.hasBeenActive))
        return;
      menuCtx.resume().catch(() => {});
    }
    const fuente = menuCtx.createBufferSource();
    fuente.buffer = sonido.buffer;
    fuente.connect(sonido.gain);
    fuente.start(0, sonido.desde);
  }

  // Durante la presentación el menú se ve pero sin ninguna opción apuntada (ni
  // el renglón de abajo, que dice de qué se trata): recién cuando se va la nave
  // se apunta la primera, con su "selector" (ver terminarPresentacion).
  let menuApagado = false;
  function apagarMenu() {
    menuApagado = true;
    opcionesModo.forEach((el) => el.classList.remove("elegida"));
    if (modoEl) modoEl.classList.add("sin-elegir");
  }

  // Apunta una opción; da la vuelta en los dos sentidos (de la última a la
  // primera y al revés). Si cambia, suena el "selector", salvo callado (cuando
  // la apunta el juego y no la persona: al abrir la pausa, al volver al menú).
  function apuntarOpcion(i, callado) {
    const n = opcionesModo.length;
    if (!n) return;
    const nueva = ((i % n) + n) % n;
    const cambio = nueva !== opcionApuntada || menuApagado;
    opcionApuntada = nueva;
    menuApagado = false;
    if (modoEl) modoEl.classList.remove("sin-elegir");
    opcionesModo.forEach((el, j) =>
      el.classList.toggle("elegida", j === opcionApuntada),
    );
    if (cambio && !callado) sonarMenu("selector");
  }

  // callado: la elige el juego (al volver de la recarga con el modo que se
  // había elegido en la pausa, que ya sonó).
  function elegirApuntada(callado) {
    const el = opcionesModo[opcionApuntada];
    if (!el) return;
    if (!callado) sonarMenu("seleccion");
    elegirModo(el.dataset.elegir);
  }

  // Los costados del menú (LB y RB, el stick o la cruceta para los costados,
  // las flechas de los costados del teclado, A y D, o la ruedita del mouse).
  // dir: -1 izquierda, 1 derecha. Parado en "dos jugadores" dan vuelta quién
  // usa el joystick y quién el teclado (sin joystick, quién usa WASD y quién
  // las flechas); parado en "contra la PC" cambian la dificultad. El renglón
  // de abajo del menú lo muestra solo en el próximo cuadro (mostrarControles).
  function cambiarControles(dir) {
    const opcion = opcionesModo[opcionApuntada];
    if (!opcion) return;
    if (opcion.dataset.elegir === "dos") controlesCambiados = !controlesCambiados;
    else if (opcion.dataset.elegir === "pc") cambiarDificultad(dir);
  }

  // La ruedita del mouse también da vuelta los lados, con el menú a la vista.
  // Una vuelta de rueda manda muchos eventos seguidos: cuenta uno y los que
  // llegan en los próximos RUEDA_ESPERA ms se ignoran.
  const RUEDA_ESPERA = 250;
  let ruedaAntes = 0;
  window.addEventListener(
    "wheel",
    (ev) => {
      if (!activo || (modo && pausa !== "menu") || !ev.deltaY) return;
      if (ev.timeStamp - ruedaAntes < RUEDA_ESPERA) return;
      ruedaAntes = ev.timeStamp;
      cambiarControles(ev.deltaY > 0 ? 1 : -1);
    },
    { passive: true },
  );

  opcionesModo.forEach((el, i) => {
    el.addEventListener("click", () => {
      apuntarOpcion(i);
      elegirApuntada();
    });
    // El mouse manda: lo que toca pasa a ser lo apuntado, así las flechas y el
    // joystick siguen desde donde quedó el cursor y no desde otro lado.
    el.addEventListener("pointerenter", () => apuntarOpcion(i));
  });
  apuntarOpcion(0, true);

  // Lo que en el joystick da vuelta los lados (ver cambiarControles).
  // -1 (LB o izquierda), 1 (RB o derecha) o 0.
  const cambiaLados = (gp, joy) =>
    botonPad(gp, PAD_LB) || joy.teclas.has("left")
      ? -1
      : botonPad(gp, PAD_RB) || joy.teclas.has("right")
        ? 1
        : 0;

  // Joystick en el menú, un cuadro a la vez (lo llama cuadro() mientras no hay
  // modo elegido). El stick se comporta como una tecla: un paso al empujarlo y
  // después repite solo, dando la vuelta sin fin. El botón A no repite: cuenta
  // una vez por apretada y no en cada cuadro.
  function navegarMenuJoystick(dt) {
    const gp = primerJoystick();
    if (!gp) {
      padMenuY = 0;
      padMenuA = false;
      padMenuLR = false;
      return;
    }
    const joy = leerJoystick(); // ya trae la zona muerta y la cruceta
    const dir = joy.teclas.has("down") ? 1 : joy.teclas.has("up") ? -1 : 0;
    if (dir !== padMenuY) {
      // Recién empujado (o recién soltado): un paso ya, y a esperar lo largo.
      padMenuY = dir;
      padMenuT = MENU_PAD_ESPERA;
      if (dir) apuntarOpcion(opcionApuntada + dir);
    } else if (dir) {
      padMenuT -= dt;
      if (padMenuT <= 0) {
        apuntarOpcion(opcionApuntada + dir);
        padMenuT = MENU_PAD_REPITE;
      }
    }
    // LB o RB, o el stick o la cruceta para los costados: cambian de lado los
    // controles, y también repiten si se los deja apretados.
    const lr = cambiaLados(gp, joy);
    if (lr !== padMenuLR) {
      padMenuLR = lr;
      padMenuLRT = MENU_PAD_ESPERA;
      if (lr) cambiarControles(lr);
    } else if (lr) {
      padMenuLRT -= dt;
      if (padMenuLRT <= 0) {
        cambiarControles(lr);
        padMenuLRT = MENU_PAD_REPITE;
      }
    }
    const a = botonPad(gp, PAD_A);
    if (a && !padMenuA) elegirApuntada();
    padMenuA = a;
  }

  // Al abrir la pausa el stick seguramente viene empujado (se estaba jugando):
  // se toma como ya contado, si no el menú daría un paso solo apenas aparece.
  function sincronizarPadMenu() {
    const gp = primerJoystick();
    if (!gp) {
      padMenuY = 0;
      padMenuA = false;
      padMenuLR = false;
      return;
    }
    const joy = leerJoystick();
    padMenuY = joy.teclas.has("down") ? 1 : joy.teclas.has("up") ? -1 : 0;
    padMenuT = MENU_PAD_ESPERA;
    padMenuA = botonPad(gp, PAD_A);
    padMenuLR = cambiaLados(gp, joy);
    padMenuLRT = MENU_PAD_ESPERA;
  }

  // --- Clave del online -------------------------------------------------------
  // Al elegir online se pide una clave: el emparejador solo junta a los que
  // pusieron la misma (ver servidor/), y vacía es con cualquiera, como antes.
  // null mientras no se eligió (la pide elegirModo), "" sin clave. La última
  // que se usó queda escrita para la próxima (en este navegador).
  const claveEl = document.getElementById("game-modo-clave");
  const claveCampo = document.getElementById("game-clave");
  const CLAVE_GUARDADA = "esc4-clave";
  let clave = null;
  let padMenuB = false; // si el botón B venía apretado (escribiendo la clave)
  const claveAbierta = () => !!claveEl && !claveEl.hidden;

  // Minúsculas, solo letras y números (Spaceport no tiene tildes ni eñe),
  // hasta 16: lo mismo que hace el servidor, así se ve la clave tal cual viaja.
  function limpiarClave(s) {
    return (s || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
  }

  function abrirClave() {
    if (!claveEl || !claveCampo) {
      clave = "";
      elegirModo("online");
      return;
    }
    if (!claveCampo.value) {
      try {
        claveCampo.value = limpiarClave(localStorage.getItem(CLAVE_GUARDADA));
      } catch (e) {}
    }
    // Viene del selector de naves, que escondió el menú (y la clave está
    // adentro de él).
    modoEl.hidden = false;
    modoEl.classList.add("con-clave");
    claveEl.hidden = false;
    // El foco recién después de esta tecla: si no, la que abrió la clave (el
    // 4, la E) se escribiría en el campo.
    setTimeout(() => {
      if (!claveAbierta()) return;
      claveCampo.focus();
      claveCampo.select();
    }, 0);
    const gp = primerJoystick();
    padMenuB = !!gp && botonPad(gp, PAD_B);
  }

  function cerrarClave() {
    if (!claveAbierta()) return;
    claveEl.hidden = true;
    modoEl.classList.remove("con-clave");
    claveCampo.blur();
  }

  // Escape o B en la clave: de vuelta al menú, y si se vuelve a elegir online
  // se pasa de nuevo por el selector (por si se quiere otra nave).
  function cancelarClave() {
    navesElegidas = null;
    cerrarClave();
  }

  function buscarConClave() {
    clave = limpiarClave(claveCampo.value);
    try {
      localStorage.setItem(CLAVE_GUARDADA, clave);
    } catch (e) {}
    cerrarClave();
    elegirModo("online");
  }

  if (claveCampo) {
    claveCampo.addEventListener("input", () => {
      const limpia = limpiarClave(claveCampo.value);
      if (limpia !== claveCampo.value) claveCampo.value = limpia;
    });
    // Lo que se escribe es para la clave: no le llega al resto del juego (ni
    // al menú, que con los números elige un modo, ni a la nave).
    claveCampo.addEventListener("keydown", (ev) => {
      ev.stopPropagation();
      // (El enter del teclado del celular a veces llega sin code: por la key.)
      if (ev.code === "Enter" || ev.code === "NumpadEnter" || ev.key === "Enter") {
        sonarMenu("seleccion");
        buscarConClave();
      } else if (ev.code === "Escape") {
        sonarMenu("selector");
        cancelarClave();
      }
    });
  }

  // Los botones de la clave del celular (ver .game-clave-botones).
  document.querySelectorAll("[data-clave]").forEach((b) =>
    b.addEventListener("click", () => {
      if (!claveAbierta()) return;
      if (b.dataset.clave === "buscar") {
        sonarMenu("seleccion");
        buscarConClave();
      } else {
        sonarMenu("selector");
        cancelarClave();
      }
    }),
  );

  // Joystick escribiendo la clave: con él no se puede escribir, pero A busca
  // con lo que haya (vacía, con cualquiera) y B vuelve al menú. Por flanco.
  function navegarClaveJoystick() {
    const gp = primerJoystick();
    const a = !!gp && botonPad(gp, PAD_A);
    const b = !!gp && botonPad(gp, PAD_B);
    if (a && !padMenuA) {
      sonarMenu("seleccion");
      buscarConClave();
    } else if (b && !padMenuB) {
      sonarMenu("selector");
      cancelarClave();
    }
    padMenuA = a;
    padMenuB = b;
  }

  // Adentro del portfolio: le pide al sitio que cierre el juego y devuelva la
  // nave al escenario principal (ver abrirEsc4 en el script.js del sitio). Se
  // lo pide al marco (index.html), que se lo pasa al sitio.
  // Online es como irse: al cerrarse el iframe se cae la conexión y al rival
  // le aparece EL RIVAL SE FUE.
  function volverAlSitio() {
    if (!embebido) return;
    try {
      window.parent.postMessage({ tipo: "esc4-volver" }, location.origin);
    } catch (e) {}
  }

  // --- Dificultad de la PC ------------------------------------------------------
  // Se elige en el menú, parado en "contra la PC": los costados (LB y RB, el
  // stick o la cruceta, las flechas, A y D o la ruedita) la cambian, dando la
  // vuelta, y el renglón de abajo la muestra (ver PIE_MODO). Queda guardada en
  // este navegador.
  const DIFICULTAD_ORDEN = ["facil", "regular", "dificil"];
  const DIFICULTAD_GUARDADA = "esc4-dificultad";
  let dificultad = "regular";
  try {
    const guardada = localStorage.getItem(DIFICULTAD_GUARDADA);
    if (DIFICULTADES[guardada]) dificultad = guardada;
  } catch (e) {}

  function cambiarDificultad(dir) {
    const n = DIFICULTAD_ORDEN.length;
    const i = DIFICULTAD_ORDEN.indexOf(dificultad);
    dificultad = DIFICULTAD_ORDEN[(((i + dir) % n) + n) % n];
    try {
      localStorage.setItem(DIFICULTAD_GUARDADA, dificultad);
    } catch (e) {}
    sonarMenu("selector");
  }

  function elegirModo(m) {
    if (m === "volver") {
      volverAlSitio();
      return;
    }
    // Con un modo ya en juego, el menú solo se ve en la pausa: ahí elegir
    // arranca ese modo de cero.
    if (modo) {
      reiniciarEnModo(m);
      return;
    }
    // Contra la PC, con dos jugadores y online, primero la nave (ver "El
    // selector de naves"): al elegirla vuelve acá.
    if ((m === "pc" || m === "dos" || m === "online") && navesElegidas !== m) {
      abrirSelector(m);
      return;
    }
    // Online, primero la clave (ver abrirClave): al buscar vuelve acá.
    if (m === "online" && clave === null) {
      abrirClave();
      return;
    }
    modo = m;
    // La nave se había ido al terminar la presentación: vuelve con el modo, ya
    // con la mitad de su color.
    ship.classList.remove("game-sin-nave");
    tinteNaves = tinteMeta();
    aplicarTinteNaves();
    // Si el botón de salir ya venía apretado (se volvió al menú con él y se
    // eligió sin soltarlo), que no cuente como una apretada nueva y se salga
    // de nuevo apenas arranca.
    padSalirAntes = padSalirApretado();
    window.dosJugadores = m === "dos";
    // En todos los modos los costados dan la vuelta (script.js para la nave
    // propia, moverRival para la del rival). Solo frenan mientras se elige.
    window.vueltaCostados = true;
    window.vueltaMargen = margenVuelta(); // script.js da la vuelta con el mismo
    actualizarControles();
    if (menuEl) menuEl.hidden = false;
    if (m === "online") {
      // El color (azul o rojo) y la esquina se saben recién cuando el
      // servidor asigna el rol: ver "emparejado" en recibirOnline.
      ship.classList.remove("multijugador", "color-rival");
      // La elección queda en pantalla con el estado hasta que aparece un rival.
      conectarOnline();
      return;
    }
    // Contra la PC y con dos jugadores siempre sos el azul (ver
    // .multijugador en styles.css) y arrancás en tu esquina de abajo.
    ship.classList.toggle("multijugador", m !== "tutorial");
    ship.classList.remove("color-rival");
    centrarNave();
    if (modoEl) modoEl.hidden = true;
  }

  // Con dos jugadores, quién usa qué (lo lee script.js cada cuadro):
  // - con un joystick conectado, el jugador 1 tiene todo el teclado (como en el
  //   sitio) y el jugador 2 el joystick (window.j2Joystick), o al revés si se
  //   cambiaron los lados en el menú con LB o RB (controlesCambiados): ahí el
  //   joystick pasa a ser del jugador 1 y el 2 se queda con las flechas;
  // - sin joystick, el jugador 1 WASD y Shift izquierdo, y el jugador 2 las
  //   flechas y Shift derecho (window.j2Teclado), o al revés si se cambiaron
  //   los lados (window.tecladoAlReves: el 1 las flechas y el 2 WASD).
  // Se revisa en cada cuadro: si el joystick se conecta o se desconecta en el
  // medio de la partida, cambia solo.
  function actualizarControles() {
    const hayPad = modo === "dos" && !!primerJoystick();
    window.j2Joystick = hayPad && !controlesCambiados;
    window.j2Teclado = modo === "dos" && (!hayPad || controlesCambiados);
    // Para la luz del jugador 2 por teclado (ver toggleLuzRival en
    // script.js): con Q si el joystick se lo llevó el jugador 1 (ahí Q le
    // queda libre, no prende la suya), o con L si los dos están en el
    // teclado (ahí Q sigue siendo la del jugador 1).
    window.j1Joystick = hayPad && controlesCambiados;
    window.tecladoAlReves = modo === "dos" && !hayPad && controlesCambiados;
  }

  // El renglón de abajo del menú dice de qué se trata la opción apuntada. Solo
  // dos jugadores necesita explicar los controles, y ahí cambian según haya o
  // no un joystick conectado.
  //
  // Spaceport no tiene vocales con tilde ni eñe: con una tilde esa letra sola
  // cae a otra fuente y la palabra se ve partida al medio. Por eso los textos
  // van en infinitivo -"aprender", no "aprendé"-, que no lleva tilde y no
  // cambia de significado al sacársela (tampoco tiene comas ni paréntesis).
  //
  // Con dos jugadores, cada uno de su lado: J1 a la izquierda y J2 a la
  // derecha (ver .game-modo-lado en styles.css).
  const lados = (j1, j2) =>
    `<span class="game-modo-lado">${j1}</span>` +
    `<span class="game-modo-lado">${j2}</span>`;
  // Sin joystick no entra en un renglón por lado: se corta a mano, antes del
  // shift, para que no quede partido en cualquier lado.
  const CONTROLES_TECLADO = lados(
    "J1 WASD<br />shift izquierdo",
    "J2 flechas<br />shift derecho",
  );
  const CONTROLES_TECLADO_AL_REVES = lados(
    "J1 flechas<br />shift derecho",
    "J2 WASD<br />shift izquierdo",
  );
  const CONTROLES_JOYSTICK = lados("J1 teclado", "J2 joystick");
  const CONTROLES_JOYSTICK_AL_REVES = lados("J1 joystick", "J2 teclado");
  const PIE_MODO = {
    tutorial: () => "Aprender a jugar y practicar",
    // Contra la PC juega uno solo, y el teclado y el joystick andan los dos a la
    // vez: el renglón dice con qué está jugando. El navegador solo devuelve un
    // joystick después de que se lo tocó, así que si aparece es porque se lo
    // está usando de verdad.
    // Abajo, la dificultad (la elegida encendida): se cambia con los costados.
    pc: () =>
      '<span class="game-modo-pc"><span>' +
      (primerJoystick() ? "J1 joystick" : "J1 teclado") +
      '</span><span class="game-modo-dificultades">' +
      DIFICULTAD_ORDEN.map(
        (d) =>
          '<span class="game-modo-dif' +
          (d === dificultad ? " elegida" : "") +
          '">' +
          d +
          "</span>",
      ).join("") +
      "</span></span>",
    dos: () =>
      !primerJoystick()
        ? controlesCambiados
          ? CONTROLES_TECLADO_AL_REVES
          : CONTROLES_TECLADO
        : controlesCambiados
          ? CONTROLES_JOYSTICK_AL_REVES
          : CONTROLES_JOYSTICK,
    online: () => "Encontrar a alguien en red",
    volver: () => "Seguir en el portfolio",
  };
  let controlesMostrados = "";
  function mostrarControles() {
    const el = document.getElementById("game-modo-controles");
    const opcion = opcionesModo[opcionApuntada];
    const pie = opcion && PIE_MODO[opcion.dataset.elegir];
    const texto = pie ? pie() : "";
    if (!el || texto === controlesMostrados) return;
    controlesMostrados = texto;
    el.innerHTML = texto;
  }

  // Igual que stickShip en script.js, así el stick del jugador 2 responde como
  // el del 1: a fondo empuja igual que las flechas en cualquier dirección (en
  // diagonal también), con la zona muerta sobre la inclinación total. Devuelve
  // [x, y].
  // La nave de la PC se arma igual que la del jugador en juego.html: el sprite
  // de atrás, el fuego y el de adelante (cohete_on: en el juego la luz va
  // prendida), los tres en el mismo lienzo de 203x300.
  const cargarImagen = (src) => {
    const img = new Image();
    img.src = src;
    return img;
  };
  const imgRivalFondo = cargarImagen("parallax/cohete_fondo.webp");
  const imgRivalTop = cargarImagen("parallax/cohete_on.webp");
  const imgFuego = cargarImagen("parallax/cohete_fuego.webp");
  const lienzoFuegoRival = document.createElement("canvas");
  lienzoFuegoRival.width = 203;
  lienzoFuegoRival.height = 300;
  const lienzoRival = document.createElement("canvas"); // las tres capas juntas
  lienzoRival.width = 203;
  lienzoRival.height = 300;

  // --- Naves y fuegos ------------------------------------------------------------
  // Las naves que se pueden elegir (ver "El selector de naves") y los fuegos.
  // Todas vuelan igual y chocan con los mismos tres círculos (NAVE_CIRCULOS):
  // cambia solo el dibujo. Cada una tiene su sprite apagado y prendido de
  // 203x300 (el de las nuevas está en naves/nuevas/) y el de atrás, que lleva
  // el resplandor de la luz: el cohete tiene su silueta y las demás usan el
  // propio dibujo (misma forma).
  // Los vehículos con ruedas (costado: true) se ven desde arriba (el dibujo
  // del selector) yendo para arriba o para abajo, y de costado yendo para los
  // lados: tienen uno de perfil mirando a cada lado, _der y _izq, con la
  // trompa para arriba y el techo hacia donde queda arriba al girarlo para
  // ese lado, así el techo nunca queda abajo (ver ladoDeRumbo). Son dos
  // dibujos y no uno espejado para que lo escrito (el número del colectivo)
  // se lea derecho.
  const NAVES_JUEGO = [
    { id: "cohete", nombre: "Clasico" },
    { id: "atomica", nombre: "Atomica" },
    { id: "cuadros", nombre: "X-FLR6" },
    { id: "saturno", nombre: "Saturno V" },
    { id: "falcon", nombre: "Falcon 9" },
    { id: "alax", nombre: "X-Wing" },
    { id: "platillo", nombre: "Invasor" },
    { id: "iss", nombre: "ISS" },
    { id: "tie", nombre: "Caza TIE" },
    { id: "estrella", nombre: "Estrella de la Muerte" },
    { id: "van", nombre: "Breaking Bad", costado: true },
    { id: "delorean", nombre: "DeLorean", costado: true },
    { id: "colectivo", nombre: "Colectivo", costado: true },
  ].map((n) => {
    const dir = n.id === "cohete" ? "parallax/" : `naves/nuevas/${n.id}/`;
    const off = `${dir}${n.id}.webp`;
    const on = `${dir}${n.id}_on.webp`;
    // Cada lado del perfil, con los mismos datos que la nave: off, on, fondo e
    // img (las imágenes, recién al elegirla: ver cargarPerfiles).
    const perfil = (lado) => {
      const onLado = `${dir}${n.id}_${lado}_on.webp`;
      return { off: `${dir}${n.id}_${lado}.webp`, on: onLado, fondo: onLado, img: null, listo: false };
    };
    return {
      ...n,
      off,
      on,
      fondo: n.id === "cohete" ? "parallax/cohete_fondo.webp" : on,
      img: n.id === "cohete" ? imgRivalTop : cargarImagen(on),
      imgFondo: n.id === "cohete" ? imgRivalFondo : null,
      costado: n.costado ? { der: perfil("der"), izq: perfil("izq") } : null,
    };
  });
  // Cómo se ve un vehículo de costado yendo con ese giro (grados, 0 para
  // arriba y 90 a la derecha): "arriba" (desde arriba) a menos de
  // COSTADO_ENTRA grados de la vertical, para arriba o para abajo, y si no
  // "der" o "izq". Para volver a verse de costado tiene que pasar los
  // COSTADO_SALE grados (antes: cómo se veía), así cerca del borde no cambia
  // a cada rato.
  const COSTADO_ENTRA = Math.sin((25 * Math.PI) / 180);
  const COSTADO_SALE = Math.sin((35 * Math.PI) / 180);
  function ladoDeRumbo(rot, antes) {
    const s = Math.sin((rot * Math.PI) / 180);
    const umbral = antes === "arriba" ? COSTADO_SALE : COSTADO_ENTRA;
    if (s > umbral) return "der";
    if (s < -umbral) return "izq";
    return "arriba";
  }
  // Los perfiles de un vehículo de costado se cargan una sola vez y recién
  // cuando alguien lo elige (no al abrir la página), y se decodifican de
  // antemano (decode) para que cambiar de lado jugando sea instantáneo: hasta
  // que los dos (apagado y prendido) están listos, se sigue viendo desde arriba.
  function cargarPerfiles(n) {
    if (!n.costado || n.costado.der.img) return;
    for (const v of [n.costado.der, n.costado.izq]) {
      v.img = cargarImagen(v.on);
      Promise.all([v.img.decode(), cargarImagen(v.off).decode()]).then(
        () => (v.listo = true),
        () => {},
      );
    }
  }
  // La imagen de una nave para ese giro: si es de costado, la que toque (lo
  // guarda en quien.lado, para la próxima; a un perfil que no está listo no
  // se pasa); si no, la de siempre.
  function imgDeNave(n, quien) {
    if (!n.costado) return n.img;
    cargarPerfiles(n);
    const lado = ladoDeRumbo(quien.rot, quien.lado);
    if (lado === "arriba" || n.costado[lado].listo) quien.lado = lado;
    const v = n.costado[quien.lado];
    return v ? v.img : n.img;
  }
  // Los fuegos: el dibujo de cohete_fuego.webp tal cual (clásico) o
  // recoloreado (ver fuegoTenido): la parte de afuera y la de adentro (la
  // celeste) pasan cada una a un degradé de dos colores según lo clara que
  // sea, y el contorno oscuro queda igual. "Sin fuego" es una llama vacía
  // (FUEGO_VACIO): se anima y se dibuja igual, pero no se ve nada.
  const FUEGOS = [
    { id: "clasico", nombre: "clasico" },
    { id: "fuego", nombre: "fuego", afuera: ["#b8321c", "#ffb35c"], adentro: ["#ff8a1f", "#fff1a8"] },
    { id: "hielo", nombre: "hielo", afuera: ["#3f7fb8", "#d8f2ff"], adentro: ["#8fd8ff", "#ffffff"] },
    { id: "plasma", nombre: "plasma", afuera: ["#6a2bb0", "#e7a8ff"], adentro: ["#ff4fc0", "#ffe0f6"] },
    { id: "veneno", nombre: "veneno", afuera: ["#2f7f2a", "#b8f070"], adentro: ["#9be03c", "#f4ffc0"] },
    { id: "ninguno", nombre: "sin fuego" },
  ];
  const FUEGO_VACIO = Object.assign(document.createElement("canvas"), { width: 203, height: 300 });
  const naveDe = (id) => NAVES_JUEGO.find((n) => n.id === id) || NAVES_JUEGO[0];
  const fuegoDe = (id) => FUEGOS.find((f) => f.id === id) || FUEGOS[0];

  const fuegosTenidos = new Map(); // id -> lienzo de 203x300
  // El dibujo del fuego de ese tipo (el clásico es la imagen misma), o null
  // si todavía no cargó.
  function fuegoTenido(id) {
    const f = fuegoDe(id);
    if (f.id === "ninguno") return FUEGO_VACIO;
    if (!f.afuera) return imgFuego;
    if (fuegosTenidos.has(f.id)) return fuegosTenidos.get(f.id);
    if (!imgFuego.complete || !imgFuego.naturalWidth) return null;
    const lienzo = document.createElement("canvas");
    lienzo.width = imgFuego.naturalWidth;
    lienzo.height = imgFuego.naturalHeight;
    const c = lienzo.getContext("2d");
    c.drawImage(imgFuego, 0, 0);
    const datos = c.getImageData(0, 0, lienzo.width, lienzo.height);
    const px = datos.data;
    const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));
    const afuera = f.afuera.map(rgb);
    const adentro = f.adentro.map(rgb);
    for (let i = 0; i < px.length; i += 4) {
      if (!px[i + 3]) continue;
      const r = px[i];
      const g = px[i + 1];
      const b = px[i + 2];
      const luz = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
      if (luz < 0.22) continue; // el contorno
      const t = Math.min(1, (luz - 0.22) / 0.78);
      const [o, cl] = (g + b) / 2 > r + 8 ? adentro : afuera;
      for (let k = 0; k < 3; k++) px[i + k] = Math.round(o[k] + (cl[k] - o[k]) * t);
    }
    c.putImageData(datos, 0, 0);
    fuegosTenidos.set(f.id, lienzo);
    return lienzo;
  }

  // "Al azar": en el selector, la nave o el fuego se puede dejar al azar; se
  // sortea cada vez que se aplica (la de la PC, en cada partida).
  const AZAR = "azar";
  function sortearEleccion(e) {
    const al = (lista) => lista[Math.floor(Math.random() * lista.length)].id;
    return {
      nave: e && e.nave === AZAR ? al(NAVES_JUEGO) : e && e.nave,
      fuego: e && e.fuego === AZAR ? al(FUEGOS) : e && e.fuego,
    };
  }

  // Lo elegido la última vez (se arranca con eso en el selector).
  const NAVES_GUARDADAS = "esc4-naves";
  function naveGuardada() {
    const vacia = { j1: { nave: "cohete", fuego: "clasico" }, j2: { nave: "cohete", fuego: "clasico" } };
    try {
      const g = JSON.parse(localStorage.getItem(NAVES_GUARDADAS));
      // "azar" se guarda tal cual: se sortea al jugar (ver sortearEleccion).
      const id = (v, de) => (v === AZAR ? AZAR : de(v).id);
      for (const j of ["j1", "j2"])
        if (g && g[j]) vacia[j] = { nave: id(g[j].nave, naveDe), fuego: id(g[j].fuego, fuegoDe) };
    } catch (e) {}
    return vacia;
  }
  function guardarNaves(eleccion) {
    try {
      localStorage.setItem(NAVES_GUARDADAS, JSON.stringify(eleccion));
    } catch (e) {}
  }

  // La nave del jugador 1 (la de script.js, en el DOM): los sprites y el
  // fuego (window.naveJ1 y window.fuegoJ1, los lee script.js).
  let eleccionJ1 = { nave: "cohete", fuego: "clasico" };
  // Si es de costado, cómo se ve la del jugador: "arriba", "der" o "izq" (ver orientarNaveJugador).
  const ladoJ1 = { rot: 0, lado: "arriba" };
  let naveJugador = naveDe("cohete"); // la de eleccionJ1 (orientarNaveJugador la mira cada cuadro)
  function aplicarNaveJugador(eleccion) {
    eleccion = sortearEleccion(eleccion);
    eleccionJ1 = { nave: naveDe(eleccion.nave).id, fuego: fuegoDe(eleccion.fuego).id };
    naveJugador = naveDe(eleccionJ1.nave);
    cargarPerfiles(naveJugador); // mientras tanto están las instrucciones
    ladoJ1.lado = "arriba";
    ponerSpritesJugador();
    const f = fuegoDe(eleccionJ1.fuego);
    window.fuegoJ1 = f.id === "clasico" ? null : fuegoTenido(f.id);
    // Si el fuego todavía no se pudo teñir (no había cargado), en cuanto cargue.
    if (f.afuera && !window.fuegoJ1)
      imgFuego.addEventListener("load", () => aplicarNaveJugador(eleccionJ1), { once: true });
  }

  // Los sprites de la nave del jugador (y window.naveJ1, que script.js usa al
  // prender y apagar la luz): los de la nave (desde arriba), o los del perfil
  // que toque si es de costado y va para un lado.
  function ponerSpritesJugador() {
    const n = naveJugador;
    const v = (n.costado && n.costado[ladoJ1.lado]) || n;
    window.naveJ1 = n.id === "cohete" ? null : { off: v.off, on: v.on };
    const top = ship.querySelector(".starry-cohete-top");
    const fondo = ship.querySelector(".starry-cohete-fondo");
    if (top) top.src = ship.classList.contains("luz-on") ? v.on : v.off;
    if (fondo) fondo.src = v.fondo;
  }

  // Cada cuadro: si la del jugador es de costado y cambió cómo se ve
  // (según el giro que publica script.js), le cambian los sprites.
  function orientarNaveJugador() {
    const n = naveJugador;
    const p = window.shipPose;
    if (!n.costado || !p || !p.listo) return;
    const antes = ladoJ1.lado;
    ladoJ1.rot = p.rot;
    imgDeNave(n, ladoJ1);
    if (ladoJ1.lado !== antes) ponerSpritesJugador();
  }

  // La nave del rival (la de la PC, el jugador 2 u online), que dibuja este
  // archivo (ver dibujarRival y actualizarFuegoRival). Arranca como el cohete.
  const naveRival = { id: "cohete", img: imgRivalTop, fondo: imgRivalFondo, fuego: "clasico", costado: null };
  function aplicarNaveRival(eleccion) {
    eleccion = sortearEleccion(eleccion);
    const n = naveDe(eleccion && eleccion.nave);
    naveRival.id = n.id;
    naveRival.costado = n.costado;
    cargarPerfiles(n);
    naveRival.img = n.img;
    naveRival.fondo = n.imgFondo;
    naveRival.fuego = fuegoDe(eleccion && eleccion.fuego).id;
  }
  // Contra la PC: la nave y el fuego que se le eligieron en el selector; lo
  // que quedó "al azar" (de entrada, las dos cosas) se sortea en cada partida.
  let eleccionPC = { nave: AZAR, fuego: AZAR };

  const fuegoRival = { nivel: 0, fase: 0 };
  // Cámara (ver arriba): zoom y punto de la pantalla que queda fijo (la nave).
  const cam = { z: 1, ox: window.innerWidth / 2, oy: window.innerHeight / 2 };

  // --- Estela de la nave -----------------------------------------------------
  // Sale de los motores de la nave mientras se mueve y se sostiene el botón de
  // la estela: X (jugador 1) o M (jugador 2) en el teclado, y B en el joystick
  // (a quien lo tenga: casi siempre el jugador 1, y el 2 con dos jugadores si
  // el joystick le tocó a él, ver window.j2Joystick). Es una fila de bocanadas
  // blandas y transparentes que se ensanchan y se disuelven de a poco (7 a
  // 12 s). Siempre es del color de la nave: salmón del sitio en el tutorial, y
  // el de cada nave (azul o rojo, ver colorPropio y colorRival) con más de un
  // jugador. Viven en el mundo (el espacio), no en la pantalla: quedan donde las
  // soltó la nave y se mueven con la cámara igual que las piedras. La PC no tiene.
  //
  // Cada jugador tiene un tanque de ESTELA_TANQUE s de estela. Se gasta solo
  // mientras sale estela (botón apretado y nave en movimiento) y lo que queda
  // se guarda para la próxima vez. Recién cuando se vacía del todo se vuelve a
  // llenar, en ESTELA_RECARGA s, y mientras se llena no sale estela.
  const PAD_B = 1;
  const ESTELA_MAX = 2500; // bocanadas vivas como mucho
  const ESTELA_PASO = 3; // px del mundo entre una bocanada y la siguiente
  const ESTELA_MOTOR_Y = 112; // altura de donde nace la estela en la caja de la nave (130x130): la punta del fuego, para que no asome detrás de él
  const ESTELA_SALMON = "#f19280"; // salmón del sitio (--accent en styles.css)
  const ESTELA_TANQUE = 3; // s de estela con el tanque lleno
  const ESTELA_RECARGA = 3; // s que tarda en llenarse el tanque vacío
  const estela = [];
  // Dónde estaba el motor el cuadro anterior (x, y, ok), y el tanque: tanque es
  // lo que queda (s) y recargando, si se vació y se está llenando.
  const estelaJ1 = { x: 0, y: 0, ok: false, tanque: ESTELA_TANQUE, recargando: false };
  const estelaJ2 = { x: 0, y: 0, ok: false, tanque: ESTELA_TANQUE, recargando: false };
  const estelaTecla = { j1: false, j2: false };
  document.addEventListener("keydown", (ev) => {
    if (ev.code === "KeyX") estelaTecla.j1 = true;
    else if (ev.code === "KeyM") estelaTecla.j2 = true;
  });
  document.addEventListener("keyup", (ev) => {
    if (ev.code === "KeyX") estelaTecla.j1 = false;
    else if (ev.code === "KeyM") estelaTecla.j2 = false;
  });
  // Al perder el foco no llega el keyup: se sueltan.
  window.addEventListener("blur", () => {
    estelaTecla.j1 = estelaTecla.j2 = false;
  });
  let estelaT = 0;
  const estelaSprites = new Map(); // "#rrggbb" -> sprite blando de ese color
  function spriteEstela(hex) {
    let sp = estelaSprites.get(hex);
    if (sp) return sp;
    sp = document.createElement("canvas");
    sp.width = sp.height = 64;
    const g = sp.getContext("2d");
    const rgb = parseInt(hex.slice(1), 16);
    const c = (rgb >> 16) + "," + ((rgb >> 8) & 255) + "," + (rgb & 255);
    const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0, "rgba(" + c + ",1)");
    grad.addColorStop(0.4, "rgba(" + c + ",0.5)");
    grad.addColorStop(1, "rgba(" + c + ",0)");
    g.fillStyle = grad;
    g.fillRect(0, 0, 64, 64);
    estelaSprites.set(hex, sp);
    return sp;
  }
  function vaciarEstela() {
    estela.length = 0;
    for (const j of [estelaJ1, estelaJ2]) {
      j.ok = false;
      j.tanque = ESTELA_TANQUE;
      j.recargando = false;
    }
  }
  // El tanque vacío se llena de a poco; mientras, no hay estela.
  function recargarEstela(j, dt) {
    if (!j.recargando) return;
    j.tanque += (dt * ESTELA_TANQUE) / ESTELA_RECARGA;
    if (j.tanque >= ESTELA_TANQUE) {
      j.tanque = ESTELA_TANQUE;
      j.recargando = false;
    }
  }
  // ¿Está apretado el botón de la estela del jugador 1 o del 2?
  function quiereEstela(jugador) {
    const gp = primerJoystick();
    const b = !!gp && botonPad(gp, PAD_B);
    const padJ2 = !!window.j2Joystick; // con dos jugadores, el joystick lo tiene el 2
    // Con un solo jugador (tutorial, contra la PC, online) X y M son lo mismo.
    // En el celular, el botón de estela de la pantalla.
    if (jugador === 1)
      return (
        estelaTecla.j1 ||
        (modo !== "dos" && estelaTecla.j2) ||
        (b && !padJ2) ||
        (!!window.toque && window.toque.estela)
      );
    return modo === "dos" && (estelaTecla.j2 || (b && padJ2));
  }
  // Suelta bocanadas entre donde estaba el motor y donde está ahora, y gasta
  // del tanque el tiempo que salió estela (dt). lista: dónde van (la de la
  // órbita de la carátula tiene la suya).
  function sembrarEstela(prev, x, y, destino, esc, dt, lista = estela) {
    if (prev.ok) {
      const dx = x - prev.x;
      const dy = y - prev.y;
      const d = Math.hypot(dx, dy);
      if (d < 1) return; // quieta: no sale nada (ni se gasta)
      if (d < 300) {
        // (un salto grande es la vuelta de pantalla o una recolocada: no se une)
        prev.tanque -= dt;
        if (prev.tanque <= 0) {
          prev.tanque = 0;
          prev.recargando = true;
        }
        const spr = spriteEstela(destino);
        // En calidad baja, la mitad de bocanadas (el doble de separadas), cada
        // una con la opacidad de dos superpuestas: se ve igual de densa y se
        // dibuja la mitad.
        const baja = calidadBaja();
        const n = Math.max(1, Math.round(d / (ESTELA_PASO * (baja ? 2 : 1))));
        for (let i = 1; i <= n; i++) {
          const a0 = 0.07 + Math.random() * 0.04;
          lista.push({
            x: prev.x + (dx * i) / n,
            y: prev.y + (dy * i) / n,
            vx: (Math.random() - 0.5) * 0.1,
            vy: (Math.random() - 0.5) * 0.1,
            age: 0,
            life: 7 + Math.random() * 5,
            r0: (4 + Math.random() * 2) * esc,
            r1: (24 + Math.random() * 20) * esc,
            a0: baja ? 1 - (1 - a0) * (1 - a0) : a0,
            spr,
          });
        }
        if (lista.length > ESTELA_MAX)
          lista.splice(0, lista.length - ESTELA_MAX);
      }
    }
    prev.x = x;
    prev.y = y;
    prev.ok = true;
  }
  function emitirEstela(dt) {
    recargarEstela(estelaJ1, dt);
    recargarEstela(estelaJ2, dt);
    const jugando =
      modo && negro && !final && !choque && !ganado && !esperandoRival();
    const factor = cajaNave / CAJA_NAVE;
    const mitad = cajaNave / 2;
    // Los motores, en la caja de la nave y relativos a su centro.
    const px = 44 * factor - mitad;
    const py = ESTELA_MOTOR_Y * factor - mitad;

    // Jugador 1: el mismo cálculo que circulosNave (de la pantalla al mundo).
    const p = window.shipPose;
    if (
      jugando &&
      p &&
      p.listo &&
      !ship.classList.contains("fuera-de-juego") &&
      !estelaJ1.recargando &&
      quiereEstela(1)
    ) {
      const rad = (p.rot * Math.PI) / 180;
      const ma = p.escala * Math.cos(rad);
      const mb = p.escala * Math.sin(rad);
      const sx = ma * px - mb * py + p.x + mitad;
      const sy = mb * px + ma * py + p.y + mitad;
      sembrarEstela(
        estelaJ1,
        cam.ox + (sx - cam.ox) / cam.z,
        cam.oy + (sy - cam.oy) / cam.z,
        esTutorial() ? ESTELA_SALMON : colorPropio(),
        (factor * Math.abs(p.escala)) / cam.z,
        dt,
      );
    } else estelaJ1.ok = false;

    // Jugador 2 (solo con dos jugadores): el mismo cálculo que circulosRival.
    if (
      jugando &&
      modo === "dos" &&
      rival &&
      !(rival.stun > 0) &&
      !estelaJ2.recargando &&
      quiereEstela(2)
    ) {
      const k = escalaNaveMundo();
      const rad = (rival.rot * Math.PI) / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
        sembrarEstela(
        estelaJ2,
        rival.x + (px * cos - py * sin) * k,
        rival.y + (px * sin + py * cos) * k,
        colorRival(),
        factor * k,
        dt,
      );
    } else estelaJ2.ok = false;
  }
  function dibujarEstela() {
    const ahora = performance.now();
    const dt = Math.min(0.05, Math.max(0, (ahora - estelaT) / 1000));
    estelaT = ahora;
    emitirEstela(dt);
    if (!estela.length) return;
    // Se dibuja en el mundo, con el zoom de la cámara que ya tiene ctx (ver
    // dibujar): la estela queda en el espacio y la cámara la sigue como a todo.
    ctx.save();
    avanzarBocanadas(estela, dt, true);
    ctx.restore();
  }
  // Las bocanadas crecen, se corren y se apagan dt segundos (y las que se
  // terminaron se sacan de la lista); si dibujar, se dibujan con ctx como esté.
  function avanzarBocanadas(lista, dt, dibujar) {
    let j = 0;
    for (let i = 0; i < lista.length; i++) {
      const b = lista[i];
      b.age += dt;
      if (b.age >= b.life) continue;
      const t = b.age / b.life;
      b.vx += (Math.random() - 0.5) * 0.015 + 0.002;
      b.vy += (Math.random() - 0.5) * 0.015 - 0.001;
      b.vx *= 0.995;
      b.vy *= 0.995;
      b.x += b.vx * dt * 30;
      b.y += b.vy * dt * 30;
      if (dibujar) {
        const r = b.r0 + (b.r1 - b.r0) * Math.pow(t, 0.55);
        // Aparece de a poco (0,3 s): recién nacida no se ve una mancha pegada al fuego.
        ctx.globalAlpha = b.a0 * Math.pow(1 - t, 1.6) * Math.min(1, b.age / 0.3);
        ctx.drawImage(b.spr, b.x - r, b.y - r, r * 2, r * 2);
      }
      lista[j++] = b;
    }
    lista.length = j;
    ctx.globalAlpha = 1;
  }
  let luz = false; // luz de la nave prendida (la maneja script.js)
  let luzNivel = 0; // 0..1, sigue a luz suavizado
  // Con dos jugadores, la luz del rival (jugador 2): la prende y apaga él
  // mismo (Y del joystick, o Q/L del teclado según quién use qué, ver
  // toggleLuzRival en script.js). Contra la PC y online no hay a quién
  // prendérsela de verdad: dibujarRival la trata siempre como prendida.
  let luzRival = false;
  let luzNivelRival = 0; // 0..1, sigue a luzRival suavizado (como luzNivel)
  let presionJugador = 0; // 0..1, por dar vueltas al mapa (ver PRESION_POR_VUELTA)
  let presionRival = 0; // lo mismo, para la nave del rival
  let vueltasVistas = 0; // window.shipVueltas la última vez que se miró
  let vueltasRival = 0; // vueltas al mapa que dio la nave del rival (moverRival)
  let vueltasRivalVistas = 0; // vueltasRival la última vez que se miró

  // Rectángulo del mundo que se ve en pantalla. La pantalla lleva un punto
  // del mundo a ox + (p - ox) * z, así que la esquina (0, 0) es ox * (1 - 1/z).
  // extra = zoom que se aplica encima del de la cámara, también anclado en la
  // nave (el del final).
  function vista(extra = 1) {
    const z = cam.z * extra;
    const k = 1 - 1 / z;
    return {
      x: cam.ox * k,
      y: cam.oy * k,
      w: window.innerWidth / z,
      h: window.innerHeight / z,
    };
  }

  // Polígono irregular "estrellado": los vértices van ordenados por ángulo
  // alrededor del centro, así nunca se cruza consigo mismo.
  function crearPoligono(objetivo, rapida = false) {
    const d = (50 + Math.random() * 70) * ESCALA_MUNDO;
    const n = 4 + Math.floor(Math.random() * 3);
    const paso = (Math.PI * 2) / n;
    const verts = [];
    for (let i = 0; i < n; i++) {
      const ang = i * paso + (Math.random() - 0.5) * paso * 0.6;
      const r = (d / 2) * (0.6 + Math.random() * 0.6);
      verts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
    }
    const vel =
      Math.min(VEL_MAX, VEL_INICIAL + tiempo * VEL_RAMPA) * ESCALA_MUNDO;
    // Nacen justo arriba de lo que se ve ahora (no del mundo entero): con
    // zoom la vista es una fracción del mundo y el resto quedaría vacío.
    const v = vista();
    let x = v.x - MARGEN_SPAWN + Math.random() * (v.w + MARGEN_SPAWN * 2);
    // Casi todos nacen apuntados a la nave (con algo de dispersión).
    if (objetivo && Math.random() < PUNTERIA)
      x = objetivo.x + (Math.random() - 0.5) * PUNTERIA_ANCHO;
    else if (objetivo && !esTutorial())
      x = objetivo.x + (Math.random() - 0.5) * v.w;
    // Con dos naves, las de cada una nacen arriba de ella, a la misma
    // distancia para las dos (al menos 0,6 del alto de la vista, y nunca más
    // abajo del borde de arriba de la vista: no aparecen de la nada). Así
    // estar más arriba o más abajo en el mapa no le da ventaja a ninguna. En
    // el tutorial, como en el sitio: justo arriba de lo que se ve.
    const y =
      objetivo && !esTutorial() ? Math.min(v.y, objetivo.y - v.h * 0.6) : v.y;
    return {
      id: ++idPoligono,
      x,
      y: y - d,
      vx: 0, // solo se mueve de costado cuando busca a la nave
      ang: Math.random() * Math.PI * 2,
      giro: (Math.random() - 0.5) * 3,
      vy:
        vel *
        (0.75 + Math.random() * 0.55) *
        (rapida ? VUELTA_PIEDRA_RAPIDEZ : 1),
      radio: d * 0.6,
      verts,
      pts: [], // vértices en el mundo, se recalculan en cada cuadro
    };
  }

  // Los puntos se reescriben en el mismo array (sin crear objetos nuevos en cada
  // cuadro para cada polígono: menos basura para el recolector).
  function actualizarPuntos(p) {
    const cos = Math.cos(p.ang);
    const sin = Math.sin(p.ang);
    for (let i = 0; i < p.verts.length; i++) {
      const v = p.verts[i];
      const q = p.pts[i] || (p.pts[i] = { x: 0, y: 0 });
      q.x = p.x + v.x * cos - v.y * sin;
      q.y = p.y + v.x * sin + v.y * cos;
    }
  }

  // Centros de los círculos de la nave, en coordenadas del mundo. Sale del
  // transform que script.js le escribe cada cuadro (translate + rotate + scale
  // respecto del centro de su caja), así sigue bien la nave aunque esté
  // rotada; ese transform está en pantalla, se pasa al mundo deshaciendo el
  // zoom de la cámara.
  //
  // La pose la publica script.js en números (window.shipPose: posición, giro y
  // escala): antes se parseaba el texto del transform con un DOMMatrix nuevo y un
  // array nuevo en cada cuadro, y esa basura provocaba pausas de 35-50 ms del
  // recolector cada ~10 s. Ahora se reusan los mismos objetos: lo que devuelve
  // vale hasta el próximo cuadro (nadie lo guarda: quien necesita un punto de un
  // cuadro a otro, como navePrev, lo copia).
  const SIN_CIRCULOS = [];
  const circulosBuf = NAVE_CIRCULOS.map(() => ({ x: 0, y: 0, r: 0 }));
  function circulosNave() {
    const p = window.shipPose;
    if (!p || !p.listo) return SIN_CIRCULOS;
    // Matriz de translate(x, y) rotate(rot) scale(escala): a = escala cos,
    // b = escala sen, c = -b, d = a, e = x, f = y.
    const rad = (p.rot * Math.PI) / 180;
    const ma = p.escala * Math.cos(rad);
    const mb = p.escala * Math.sin(rad);
    const caja = cajaNave; // en mobile la caja es más chica
    const k = Math.abs(p.escala) / cam.z;
    const factor = caja / CAJA_NAVE;
    const mitad = caja / 2;
    for (let i = 0; i < NAVE_CIRCULOS.length; i++) {
      const c = NAVE_CIRCULOS[i];
      const px = c.x * factor - mitad;
      const py = c.y * factor - mitad;
      const sx = ma * px - mb * py + p.x + mitad;
      const sy = mb * px + ma * py + p.y + mitad;
      const o = circulosBuf[i];
      o.x = cam.ox + (sx - cam.ox) / cam.z;
      o.y = cam.oy + (sy - cam.oy) / cam.z;
      o.r = c.r * factor * k;
    }
    return circulosBuf;
  }

  // ¿El círculo toca el polígono? Sí si su centro está adentro o si algún
  // borde pasa a menos de r del centro.
  function circuloTocaPoligono(cx, cy, r, pts) {
    let dentro = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const a = pts[i];
      const b = pts[j];
      if (
        a.y > cy !== b.y > cy &&
        cx < ((b.x - a.x) * (cy - a.y)) / (b.y - a.y) + a.x
      )
        dentro = !dentro;
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const t = Math.max(
        0,
        Math.min(
          1,
          ((cx - a.x) * dx + (cy - a.y) * dy) / (dx * dx + dy * dy || 1),
        ),
      );
      const ex = a.x + t * dx - cx;
      const ey = a.y + t * dy - cy;
      if (ex * ex + ey * ey <= r * r) return true;
    }
    return dentro;
  }

  // Después de un choque (recolocar = true) la nave vuelve al medio (en x) y abajo de la
  // pantalla y se queda ahí quieta hasta que termina la gracia y
  // empieza de nuevo. Al entrar al escenario (conIntro = true) no se la
  // mueve: llega desde el borde y arranca donde está, con la intro.
  function reiniciar(recolocar, conIntro) {
    vaciarEstela();
    poligonos = [];
    tiempo = 0;
    rival = null; // se crea de nuevo cuando arranca el juego
    poligonosRival = [];
    estadosRival = [];
    piedrasRival.clear();
    formasPedidas.clear();
    desfaseReloj = null;
    retrasoRed = RETRASO_MIN;
    atrasoRed = 0;
    acumSpawnRival = 0;
    golesRival = 0;
    golDeOroHasta = 0;
    cierres = [];
    stunJugador = 0;
    invulJugador = 0;
    reaparecer = null;
    fin = null;
    limpiarFin();
    reclamados.clear();
    golesPredichos.clear();
    ship.classList.remove("fuera-de-juego", "invulnerable");
    // Con intro el segundero queda oculto y parado hasta que se van las naves y
    // terminan las instrucciones.
    introT = conIntro ? 0 : -1;
    gracia = GRACIA;
    timerEl.style.visibility = conIntro ? "hidden" : "";
    // La intro es a color y con el fondo starry (ver game-color en la nave y
    // game-intro en la escena, styles.css); sin intro (después de un choque)
    // ya es blanco y negro.
    cancelarAyuda();
    ship.classList.toggle("game-color", !!conIntro);
    scene.classList.toggle("game-intro", !!conIntro);
    levantarTapa(true);
    oscuro = !conIntro;
    negro = !conIntro;
    acumSpawn = 0;
    choque = false;
    tChoque = 0;
    tQuieta = 0;
    navePrev = null;
    golpeadora = null;
    // Nueva partida (no un mero recoloque tras un choque): la luz del
    // jugador 2 vuelve a apagada.
    if (conIntro) {
      luzRival = false;
      presionJugador = 0;
      presionRival = 0;
      vueltasVistas = window.shipVueltas || 0;
      vueltasRival = 0;
      vueltasRivalVistas = 0;
    }
    // Nueva partida: sin cúmulos y la nave vuelve a blanco y negro.
    cumulos = [];
    particulas = [];
    numeroEstrellas = [];
    acumCumulo = 0;
    proxCumulo = CUMULO_PRIMERO;
    cumulosTomados = 0;
    // Voces de la partida nueva: se corta lo que sonaba y vuelven a tirarse.
    cortarVoz();
    vozPendiente = null;
    proxAnimo = VOZ_ANIMO_EN.map(
      (t) => t + (Math.random() * 2 - 1) * VOZ_ANIMO_MARGEN,
    );
    animoDichas = [];
    proxCansado = VOZ_CANSADO_DESDE;
    colorObjetivo = 0;
    colorNave = 0;
    limpiarFinal();
    colorEscalon = -1; // fuerza a aplicar el 0
    aplicarColorNave();
    tinteNaves = tinteMeta(); // las naves vuelven a la mitad de su color
    tinteEscalon = -1;
    aplicarTinteNaves();
    enCentro = !!recolocar;
    if (enCentro) {
      centrarNave();
      iniciarMusica(); // la caída terminó: empieza otra partida
    }
    mostrarTiempo();
  }

  // Carga y decodifica la música y el sonido de perder una sola vez (al
  // entrar al escenario por primera vez, así están listos cuando termina la
  // intro).
  async function cargarMusica() {
    const AC = window.AudioContext || window.webkitAudioContext;
    try {
      audioCtx = new AC();
    } catch (e) {
      audioCtx = null;
    }
    const decodificar = async (url) =>
      audioCtx.decodeAudioData(await (await fetch(url)).arrayBuffer());
    const conGain = (volumen) => {
      const g = audioCtx.createGain();
      g.gain.value = volumen;
      g.connect(audioCtx.destination);
      return g;
    };
    if (audioCtx) {
      musicaGain = conGain(MUSICA_VOLUMEN);
      introGain = conGain(MUSICA_VOLUMEN);
      perderGain = conGain(PERDER_VOLUMEN);
      notaGain = conGain(NOTA_VOLUMEN);
      portalGain = conGain(PORTAL_VOLUMEN);
      portalCruceGain = conGain(PORTAL_CRUCE_VOLUMEN);
      vozGain = conGain(VOZ_VOLUMEN);
      // La de las instrucciones primero: es chica y es la que se necesita antes.
      try {
        introBuffer = await decodificar(INTRO_MUSICA_URL);
      } catch (e) {
        introBuffer = null;
      }
      if (introBuffer && introPendiente) iniciarMusicaIntro();
      for (const { url } of MUSICA_FUENTES) {
        try {
          musicaBuffer = await decodificar(url);
          break;
        } catch (e) {
          musicaBuffer = null;
        }
      }
      if (musicaBuffer && musicaPendiente) iniciarMusica();
      try {
        notaBuffer = await decodificar(NOTA_URL);
      } catch (e) {
        notaBuffer = null;
      }
      try {
        perderBuffer = await decodificar(PERDER_URL);
      } catch (e) {
        perderBuffer = null;
      }
      try {
        portalBuffer = await decodificar(PORTAL_URL);
      } catch (e) {
        portalBuffer = null;
      }
      try {
        portalCruceBuffer = await decodificar(PORTAL_CRUCE_URL);
      } catch (e) {
        portalCruceBuffer = null;
      }
    }
    if (!musicaBuffer) {
      const prueba = new Audio();
      const fuente =
        MUSICA_FUENTES.find((f) => prueba.canPlayType(f.tipo)) ||
        MUSICA_FUENTES[0];
      musica = new Audio(fuente.url);
      musica.loop = true;
      musica.volume = MUSICA_VOLUMEN;
    }
    if (!introBuffer) {
      musicaIntro = new Audio(INTRO_MUSICA_URL);
      musicaIntro.loop = true;
      musicaIntro.volume = MUSICA_VOLUMEN;
    }
    // Sin Web Audio (o si no se pudo decodificar), con los <audio> de respaldo.
    if (musicaPendiente) iniciarMusica();
    if (introPendiente) iniciarMusicaIntro();
    if (!perderBuffer) {
      perder = new Audio(PERDER_URL);
      perder.volume = PERDER_VOLUMEN;
    }
    if (!notaBuffer) {
      nota = new Audio(NOTA_URL);
      nota.volume = NOTA_VOLUMEN;
    }
    if (!portalBuffer) {
      portal = new Audio(PORTAL_URL);
      portal.volume = PORTAL_VOLUMEN;
    }
    if (!portalCruceBuffer) {
      portalCruce = new Audio(PORTAL_CRUCE_URL);
      portalCruce.volume = PORTAL_CRUCE_VOLUMEN;
    }
    const voces = [
      ...conteo.flat(),
      ...vocesAnimo,
      ...vocesCansado,
      ...vocesFelicita,
      ...vocesUltimoPunto,
      ...vocesEmpate,
      ...vocesAyuda.flat(),
      ...vocesAyudaJoystick.flat(),
      ...vocesListo,
    ];
    await Promise.all(
      voces.map(async (s) => {
        if (audioCtx) {
          try {
            s.buffer = await decodificar(s.url);
          } catch (e) {
            s.buffer = null;
          }
        }
        if (!s.buffer) {
          s.audio = new Audio(s.url);
          s.audio.volume = VOZ_VOLUMEN;
        }
      }),
    );
    vocesCargadas = true;
  }

  const alAzar = (lista) => lista[Math.floor(Math.random() * lista.length)];

  // Sin ningún toque en la página el navegador no deja sonar: el audio queda
  // suspendido y lo que se le pide se encola y salta todo junto con el primer
  // toque, cuando ya no tiene sentido. Por eso los sonidos sueltos (voces,
  // agujeros, nota, perder) no se piden si todavía no se puede sonar. La música
  // sí se deja en cola: arranca con el primer toque (ver desbloquearAudio).
  const sinToque = () =>
    !!audioCtx &&
    audioCtx.state === "suspended" &&
    !(navigator.userActivation && navigator.userActivation.hasBeenActive);

  // El primer toque (una tecla o un click) reanuda el audio. No en la pausa, que
  // lo suspende a propósito (ver pausarSonidos).
  const desbloquearAudio = (ev) => {
    if (ev.type === "keydown" && (ev.code === "Escape" || ev.repeat)) return;
    if (pausa || !audioCtx || audioCtx.state !== "suspended") return;
    audioCtx.resume().catch(() => {});
  };
  document.addEventListener("keydown", desbloquearAudio);
  document.addEventListener("pointerup", desbloquearAudio);

  // Corta la voz que esté sonando (y cancela lo que tenía encadenado).
  function cortarVoz() {
    vozId++;
    vozSonando = false;
    if (vozFuente) {
      try {
        vozFuente.stop();
      } catch (e) {}
      vozFuente.disconnect();
      vozFuente = null;
    }
    if (vozAudio) {
      vozAudio.pause();
      vozAudio = null;
    }
  }

  // Dice una voz cortando la que esté sonando; alTerminar (opcional) se llama
  // cuando termina sola (no si la cortan).
  function decirVoz(s, alTerminar) {
    cortarVoz();
    if (!s.buffer && !s.audio) return; // todavía no cargó
    if (s.buffer && sinToque()) return; // todavía no se puede sonar: no se encola
    vozSonando = true;
    const id = vozId;
    const fin = () => {
      if (id !== vozId) return;
      cortarVoz();
      if (alTerminar) alTerminar();
    };
    if (s.buffer) {
      // El navegador puede tenerla suspendida hasta la primera interacción.
      audioCtx.resume().catch(() => {});
      vozFuente = audioCtx.createBufferSource();
      vozFuente.buffer = s.buffer;
      vozFuente.connect(vozGain);
      vozFuente.onended = fin;
      vozFuente.start();
    } else {
      s.audio.currentTime = 0;
      s.audio.onended = fin;
      s.audio.play().catch(fin); // si el navegador la bloquea no se queda esperando
      vozAudio = s.audio;
    }
  }

  // La voz del gol n (1..10; en el gol de oro no hay número). conteo va de
  // "10" a "1", así que el gol n es conteo[10 - n]. Si ese gol gana la
  // partida, además felicita (y no va la de luego).
  // luego (opcional): otra voz que sigue al número (ver vozDeHito).
  // gana: por defecto, el 10 (en el tutorial y con una sola nave); con dos,
  // ver ganaria (un 10 que deja 10 a 10 no gana).
  function decirGol(n, luego, gana = n === CUMULOS_PARA_COLOR) {
    const despues = gana ? alAzar(vocesFelicita) : luego;
    const variantes = conteo[CUMULOS_PARA_COLOR - n];
    if (!variantes) {
      if (despues) decirVoz(despues);
      return;
    }
    decirVoz(alAzar(variantes), despues ? () => decirVoz(despues) : undefined);
  }

  // La voz de un momento clave (o null, porque no toca o porque no hay nada
  // que decir) después de un gol, con el marcador ya actualizado: el 9 a 9, o
  // el gol número 9 de quien lo hizo (anotoMio: si fue el jugador de esta
  // pantalla; si no, el rival, sea la PC, el jugador 2 u online).
  function vozDeHito(anotoMio) {
    const mios = cumulosTomados;
    const suyos = golesRival;
    // Empate en 10 o más (gol de oro): siempre "uno más". Online no: recién
    // se sabe al confirmarse el gol (ver revisarFin).
    if (mios === suyos && mios >= CUMULOS_PARA_COLOR)
      return enLinea() ? null : alAzar(vocesUltimoPunto);
    if (Math.random() >= VOZ_HITO_CHANCE) return null;
    if (mios === VOZ_HITO_GOL && suyos === VOZ_HITO_GOL)
      return alAzar(vocesEmpate);
    if ((anotoMio ? mios : suyos) === VOZ_HITO_GOL)
      return alAzar(vocesUltimoPunto);
    return null;
  }

  // Lo mismo para un gol del rival que no tiene voz de número (contra la PC y
  // online): si toca, dice solo la del momento.
  function decirHitoRival() {
    const hito = vozDeHito(false);
    if (hito) decirVoz(hito);
  }

  // Las voces de ánimo y de cansancio, según el segundo de la partida: las de
  // ánimo suenan siempre y las de cansancio tienen VOZ_CHANCE de sonar en cada
  // tirada. Si hay una voz de un portal sonando esperan a que termine.
  function actualizarVoces() {
    if (proxAnimo.length && tiempo >= proxAnimo[0]) {
      proxAnimo.shift();
      // Una que no haya sonado ya en esta partida (si se acabaron, cualquiera).
      const nuevas = vocesAnimo.filter((v) => !animoDichas.includes(v));
      const voz = alAzar(nuevas.length ? nuevas : vocesAnimo);
      animoDichas.push(voz);
      vozPendiente = voz;
    }
    if (tiempo >= proxCansado) {
      proxCansado += VOZ_CANSADO_CADA;
      if (!vozPendiente && Math.random() < VOZ_CHANCE) {
        const enJuego = Math.max(cumulosTomados, golesRival);
        const idxPocoMas = VOZ_CANSADO.indexOf(VOZ_UN_POCO_MAS);
        vozPendiente = alAzar(
          vocesCansado.filter(
            (_, i) => i !== idxPocoMas || enJuego >= VOZ_UN_POCO_MAS_GOLES,
          ),
        );
      }
    }
    if (vozPendiente && !vozSonando) {
      const s = vozPendiente;
      vozPendiente = null;
      decirVoz(s);
    }
  }

  // La nota del último agujero: suena una vez desde el principio.
  function sonarNota() {
    if (notaBuffer) {
      if (sinToque()) return; // todavía no se puede sonar
      audioCtx.resume().catch(() => {});
      notaFuente = audioCtx.createBufferSource();
      notaFuente.buffer = notaBuffer;
      notaFuente.connect(notaGain);
      notaFuente.start();
    } else if (nota) {
      nota.currentTime = 0;
      nota.play().catch(() => {});
    }
  }

  // El sonido de un agujero nuevo: suena una vez desde el principio.
  function sonarPortal() {
    if (portalBuffer) {
      if (sinToque()) return; // todavía no se puede sonar
      audioCtx.resume().catch(() => {});
      portalFuente = audioCtx.createBufferSource();
      portalFuente.buffer = portalBuffer;
      portalFuente.connect(portalGain);
      portalFuente.start();
    } else if (portal) {
      portal.currentTime = 0;
      portal.play().catch(() => {});
    }
  }

  // El sonido de cruzar un agujero: suena una vez desde el principio.
  function sonarCruce() {
    if (portalCruceBuffer) {
      if (sinToque()) return; // todavía no se puede sonar
      audioCtx.resume().catch(() => {});
      portalCruceFuente = audioCtx.createBufferSource();
      portalCruceFuente.buffer = portalCruceBuffer;
      portalCruceFuente.connect(portalCruceGain);
      portalCruceFuente.start();
    } else if (portalCruce) {
      portalCruce.currentTime = 0;
      portalCruce.play().catch(() => {});
    }
  }

  // El sonido de perder: suena una vez desde el principio.
  function sonarPerder() {
    if (perderBuffer) {
      if (sinToque()) return; // todavía no se puede sonar
      audioCtx.resume().catch(() => {});
      perderFuente = audioCtx.createBufferSource();
      perderFuente.buffer = perderBuffer;
      perderFuente.connect(perderGain);
      perderFuente.start();
    } else if (perder) {
      perder.currentTime = 0;
      perder.play().catch(() => {});
    }
  }

  function iniciarMusica() {
    frenarMusica();
    musicaT = 0;
    // Compases que se saltea (ver MUSICA_BATERIA_COMPASES): enteros, así los
    // agujeros siguen pulsando a tiempo.
    const compases = esTutorial() ? MUSICA_BATERIA_COMPASES : 0;
    if (musicaBuffer) {
      // El navegador puede tenerla suspendida hasta la primera interacción.
      audioCtx.resume().catch(() => {});
      musicaFuente = audioCtx.createBufferSource();
      musicaFuente.buffer = musicaBuffer;
      musicaFuente.loop = true;
      musicaFuente.connect(musicaGain);
      const desde =
        (compases * musicaBuffer.duration) / MUSICA_COMPASES_BUCLE;
      musicaFuente.start(0, desde);
      musicaPos = desde;
      musicaRelojPrev = audioCtx.currentTime;
      musicaLatencia = audioCtx.outputLatency || audioCtx.baseLatency || 0;
    } else if (musica) {
      musica.currentTime = compases * MUSICA_COMPAS_RESPALDO;
      musica.play().catch(() => {}); // puede bloquearla si aún no hubo interacción
    } else musicaPendiente = true; // todavía cargando: arranca al terminar
  }

  // Velocidad de la música según cuánto lleva sonando. Con Web Audio cambia
  // también un poco el tono (es tan poco que no se nota); con el <audio> de
  // respaldo el navegador conserva el tono.
  function acelerarMusica() {
    const velocidad = 1 + Math.min(MUSICA_ACEL_MAX, musicaT * MUSICA_ACEL);
    if (musicaFuente) musicaFuente.playbackRate.value = velocidad;
    else if (musica && !musica.paused) musica.playbackRate = velocidad;
  }

  // Se llama una vez por cuadro: suma lo que avanzó el reloj del audio (por la
  // velocidad de reproducción de ese momento, que sube de a poquito).
  function avanzarPosicionMusica() {
    if (!musicaFuente) return;
    const reloj = audioCtx.currentTime;
    musicaPos += (reloj - musicaRelojPrev) * musicaFuente.playbackRate.value;
    musicaRelojPrev = reloj;
  }

  // Dónde está la música dentro de su compás, en segundos del audio original:
  // { pos: segundos desde el pulso del compás, compas: lo que dura el compás }, o
  // null si no hay música sonando o no se puede saber dónde va (ahí los agujeros
  // pulsan con su propio reloj, ver dibujarCumulos).
  function compasMusica() {
    let pos, duracion;
    if (musicaFuente && musicaBuffer) {
      duracion = musicaBuffer.duration;
      // Lo que se está oyendo ahora es lo que sonó hace un rato (latencia de salida).
      pos = musicaPos - musicaLatencia * musicaFuente.playbackRate.value;
    } else if (musica && !musica.paused && musica.duration) {
      duracion = musica.duration;
      pos = musica.currentTime;
    } else return null;
    const compas = duracion / MUSICA_COMPASES_BUCLE;
    const tiempo = compas / MUSICA_TIEMPOS_COMPAS;
    pos -= MUSICA_PULSO_TIEMPO * tiempo;
    pos = ((pos % compas) + compas) % compas;
    return { pos, compas };
  }

  // La música de las instrucciones, en bucle.
  function iniciarMusicaIntro() {
    frenarMusicaIntro();
    if (introBuffer) {
      audioCtx.resume().catch(() => {});
      introGain.gain.cancelScheduledValues(0);
      introGain.gain.value = MUSICA_VOLUMEN;
      introFuente = audioCtx.createBufferSource();
      introFuente.buffer = introBuffer;
      introFuente.loop = true;
      introFuente.connect(introGain);
      introFuente.start();
    } else if (musicaIntro) {
      musicaIntro.currentTime = 0;
      musicaIntro.play().catch(() => {});
    } else introPendiente = true; // todavía cargando: arranca al terminar
  }

  // Con fundido = true se va apagando de a poco (al pasar a la música del
  // juego); si no, se corta de golpe.
  function frenarMusicaIntro(fundido) {
    introPendiente = false;
    const fuente = introFuente;
    introFuente = null;
    if (fuente) {
      const cortar = () => {
        try {
          fuente.stop();
        } catch (e) {}
        fuente.disconnect();
      };
      if (fundido) {
        // setTargetAtTime tiende a 0 sin llegar: a los 5 tau ya no se oye, y ahí
        // se corta. Un iniciarMusicaIntro() posterior le vuelve a subir el volumen.
        introGain.gain.setTargetAtTime(
          0,
          audioCtx.currentTime,
          INTRO_MUSICA_FUNDIDO / 5,
        );
        setTimeout(cortar, INTRO_MUSICA_FUNDIDO * 1000);
      } else cortar();
    }
    if (musicaIntro) musicaIntro.pause();
  }

  function frenarMusica() {
    musicaPendiente = false;
    if (musicaFuente) {
      try {
        musicaFuente.stop();
      } catch (e) {}
      musicaFuente.disconnect();
      musicaFuente = null;
    }
    if (musica) musica.pause();
  }

  // Al salir del escenario se corta todo, también el sonido de perder.
  function frenarSonidos() {
    frenarMusica();
    frenarMusicaIntro();
    if (perderFuente) {
      try {
        perderFuente.stop();
      } catch (e) {}
      perderFuente.disconnect();
      perderFuente = null;
    }
    if (perder) perder.pause();
    if (notaFuente) {
      try {
        notaFuente.stop();
      } catch (e) {}
      notaFuente.disconnect();
      notaFuente = null;
    }
    if (nota) nota.pause();
    if (portalFuente) {
      try {
        portalFuente.stop();
      } catch (e) {}
      portalFuente.disconnect();
      portalFuente = null;
    }
    if (portal) portal.pause();
    if (portalCruceFuente) {
      try {
        portalCruceFuente.stop();
      } catch (e) {}
      portalCruceFuente.disconnect();
      portalCruceFuente = null;
    }
    if (portalCruce) portalCruce.pause();
    cortarVoz();
    vozPendiente = null;
  }

  // --- Instrucciones del arranque (ver el comentario de arriba) ---------------
  // En celulares (táctil y sin mouse) las instrucciones no tienen sentido
  // -enseñan teclado o joystick- así que la intro pasa directo al juego, sin
  // tutorial. Por ahora este escenario ni siquiera es alcanzable en celulares
  // (ver requiresDesktop en scenes.main.edges.left, script.js), pero se deja
  // andando por si se vuelve a habilitar.
  const esCelular = () =>
    window.matchMedia("(hover: none) and (pointer: coarse)").matches;
  const tactil = esCelular(); // se juega con el dedo (ver "Controles táctiles")
  const apretada = (tecla) =>
    [...sostenidas].some((codigo) => AYUDA_TECLAS[codigo] === tecla);

  // Se siguen las teclas todo el tiempo que el escenario está activo (no solo
  // durante las instrucciones), así una tecla ya apretada cuando aparece el
  // paso cuenta y se ve iluminada. Se lleva por código de tecla y no por
  // "up"/"left"...: flecha y WASD dan lo mismo y soltar una no debe apagar a la
  // otra.
  function teclaAyuda(ev, abajo) {
    const tecla = AYUDA_TECLAS[ev.code];
    if (!tecla || !activo) return;
    if (abajo) {
      sostenidas.add(ev.code);
      // Un toque más corto que un cuadro no llegaría a verse en sostenidas.
      if (ayuda && ayuda.fase === "activa") ayuda.hechas.add(tecla);
    } else sostenidas.delete(ev.code);
    modosAyuda.teclado.teclas[tecla].classList.toggle(
      "pulsada",
      apretada(tecla),
    );
  }

  function soltarTeclas() {
    sostenidas.clear();
    for (const el of Object.values(modosAyuda.teclado.teclas))
      el.classList.remove("pulsada");
  }

  const primerJoystick = () => {
    const pads = navigator.getGamepads ? navigator.getGamepads() : [];
    for (const gp of pads) if (gp) return gp;
    return null;
  };
  const botonPad = (gp, i) => {
    const b = gp.buttons[i];
    return !!b && (b.pressed || b.value >= AYUDA_GATILLO);
  };

  // Qué se está haciendo con el joystick: las "teclas" que cuentan (ver
  // AYUDA_PASOS) y hacia dónde está empujado el stick (x, y de -1 a 1).
  function leerJoystick() {
    const teclas = new Set();
    const gp = primerJoystick();
    if (!gp) return { teclas, x: 0, y: 0 };
    let x = gp.axes[0] || 0;
    let y = gp.axes[1] || 0;
    if (botonPad(gp, PAD_CRUCETA.left)) x = -1;
    else if (botonPad(gp, PAD_CRUCETA.right)) x = 1;
    if (botonPad(gp, PAD_CRUCETA.up)) y = -1;
    else if (botonPad(gp, PAD_CRUCETA.down)) y = 1;
    if (x <= -AYUDA_STICK_UMBRAL) teclas.add("left");
    else if (x >= AYUDA_STICK_UMBRAL) teclas.add("right");
    if (y <= -AYUDA_STICK_UMBRAL) teclas.add("up");
    else if (y >= AYUDA_STICK_UMBRAL) teclas.add("down");
    if (botonPad(gp, PAD_RB)) teclas.add("shift");
    if (botonPad(gp, PAD_LT)) teclas.add("space");
    return { teclas, x, y };
  }

  // Ilumina en el dibujo del joystick lo que se aprieta y le da a la palanca la
  // posición del stick (sin salirse de la base).
  function pintarJoystick(joy) {
    const { teclas, palanca } = modosAyuda.joystick;
    for (const tecla in teclas)
      teclas[tecla].classList.toggle("pulsada", joy.teclas.has(tecla));
    const largo = Math.hypot(joy.x, joy.y);
    const k = (largo > 1 ? 1 / largo : 1) * AYUDA_STICK_RECORRIDO;
    palanca.style.transform = `translate(${(joy.x * k).toFixed(2)}em, ${(joy.y * k).toFixed(2)}em)`;
  }

  document.addEventListener("keydown", (ev) => teclaAyuda(ev, true));
  document.addEventListener("keyup", (ev) => teclaAyuda(ev, false));
  // Al perder el foco no llega el keyup: se sueltan todas.
  window.addEventListener("blur", soltarTeclas);

  // Corta las instrucciones donde estén: se apaga el texto y la música (al
  // empezar una partida nueva, sea la primera o después de un choque, y al
  // salir del escenario).
  function cancelarAyuda() {
    ayuda = null;
    soltarTeclas();
    pintarJoystick({ teclas: new Set(), x: 0, y: 0 });
    for (const modo of Object.values(modosAyuda)) {
      modo.el.hidden = modo !== modosAyuda.teclado;
      for (const paso of modo.pasos) paso.classList.remove("visible");
    }
    frenarMusicaIntro();
  }

  function empezarAyuda() {
    ayuda = {
      modo: modosAyuda.teclado,
      paso: 0,
      fase: "antes",
      t: 0,
      hechas: new Set(),
    };
  }

  // PC, dos jugadores y online: sin las instrucciones de moverse (ya se sabe
  // jugar) ni acercarse a ningún lado -las dos naves quedan en su esquina, ya
  // movibles-, pero con el mismo cierre que el tutorial: un "listo" y recién
  // ahí arranca la música y el resto del juego (caen los polígonos y aparecen
  // los agujeros, ver terminarAyuda). Reusa el mismo estado `ayuda` -por eso
  // esas dos cosas quedan en pausa mientras dura, ver actualizarAyuda-, ya en
  // su fase final.
  function empezarArranque() {
    if (!rival && !esTutorial()) crearRival();
    ayuda = { modo: null, paso: 0, fase: "listo", t: 0, hechas: new Set() };
    // Recién abierta la página (se eligió el modo desde la pausa, que recarga)
    // las voces pueden no haber cargado todavía: sin esperarlas, el "listo" no
    // sonaba y el juego arrancaba en el acto (ver actualizarAyuda).
    if (vocesCargadas) decirVoz(alAzar(vocesListo));
    else ayuda.esperaVoces = true;
  }

  function activarPaso() {
    ayuda.fase = "activa";
    ayuda.t = 0;
    ayuda.hechas = new Set();
    ayuda.modo.pasos[ayuda.paso].classList.add("visible");
    const voces = (
      ayuda.modo === modosAyuda.joystick ? vocesAyudaJoystick : vocesAyuda
    )[ayuda.paso];
    if (voces.length) decirVoz(alAzar(voces));
  }

  // Terminaron las instrucciones (ya dijo "listo" y la música de intro se fue
  // con un fade out): entra la música del juego, aparece el segundero y empieza
  // la partida (con su gracia sin polígonos).
  function terminarAyuda() {
    ayuda = null;
    timerEl.style.visibility = "";
    iniciarMusica();
  }

  // ¿terminó la voz de la fase? (o se cansó de esperarla: ver AYUDA_VOZ_MAX)
  const vozLibre = () => !vozSonando || ayuda.t >= AYUDA_VOZ_MAX;

  function actualizarAyuda(dt) {
    ayuda.t += dt;
    const joy = leerJoystick();
    if (ayuda.modo === modosAyuda.joystick) pintarJoystick(joy);
    if (ayuda.fase === "antes") {
      if (ayuda.t >= AYUDA_RETRASO) {
        // Si hay un joystick conectado se muestra la versión del joystick; si
        // no, la del teclado. Igual cuenta lo que se use de los dos.
        ayuda.modo = primerJoystick()
          ? modosAyuda.joystick
          : modosAyuda.teclado;
        for (const modo of Object.values(modosAyuda))
          modo.el.hidden = modo !== ayuda.modo;
        iniciarMusicaIntro();
        activarPaso();
      }
    } else if (ayuda.fase === "activa") {
      for (const codigo of sostenidas) ayuda.hechas.add(AYUDA_TECLAS[codigo]);
      for (const tecla of joy.teclas) ayuda.hechas.add(tecla);
      if (AYUDA_PASOS[ayuda.paso].every((tecla) => ayuda.hechas.has(tecla))) {
        ayuda.fase = "hecha";
        ayuda.t = 0;
      }
    } else if (ayuda.fase === "hecha") {
      // El texto se queda hasta que la voz termina de hablar.
      if (ayuda.t >= AYUDA_ESPERA && vozLibre()) {
        ayuda.modo.pasos[ayuda.paso].classList.remove("visible");
        ayuda.fase = "saliendo";
        ayuda.t = 0;
      }
    } else if (ayuda.fase === "saliendo") {
      if (ayuda.t >= AYUDA_FUNDIDO) {
        // Ya se desvaneció: sigue el otro paso, o el "listo" si era el último.
        ayuda.paso++;
        if (ayuda.paso < AYUDA_PASOS.length) activarPaso();
        else {
          ayuda.fase = "listo";
          ayuda.t = 0;
          frenarMusicaIntro(true); // fade out apenas suena el "listo"
          decirVoz(alAzar(vocesListo));
        }
      }
    } else if (ayuda.esperaVoces) {
      // Fase "listo" esperando que carguen las voces (ver empezarArranque).
      if (vocesCargadas || ayuda.t >= LISTO_CARGA_MAX) {
        ayuda.esperaVoces = false;
        ayuda.t = 0;
        decirVoz(alAzar(vocesListo));
      }
    } else if (vozLibre()) {
      terminarAyuda(); // fase "listo": ya lo dijo, empieza el juego
    }
  }

  // Sube o baja la pantalla negra; instantáneo = sin fundido (al salir del
  // escenario o al empezar una intro, para que no se vea sobre otra escena).
  function levantarTapa(instantaneo) {
    if (!tapa) return;
    if (instantaneo) tapa.style.transition = "none";
    tapa.classList.remove("cae");
    if (instantaneo) {
      void tapa.offsetWidth;
      tapa.style.transition = "";
    }
  }

  // Contra la PC no está la intro de las navecitas: se deja la intro recién
  // terminada (fondo negro, nave en blanco y negro, en el medio abajo) y en el
  // cuadro siguiente la nave prende la luz y arrancan las instrucciones, igual
  // que al final de la intro del sitio.
  function saltearIntro() {
    introT = INTRO_JUEGO;
    oscuro = true;
    negro = true;
    // De golpe: reiniciar acaba de poner el starry a pleno de la intro y, con
    // la transición, se lo veía fundirse a negro al abrir la página.
    fondoDeGolpe(() => scene.classList.remove("game-intro"));
    ship.classList.remove("game-color");
    centrarNave();
  }

  // Cambia el fondo starry (game-intro, --fondo-color) sin su fundido.
  function fondoDeGolpe(cambiar) {
    scene.classList.add("fondo-instantaneo");
    cambiar();
    void scene.offsetWidth;
    scene.classList.remove("fondo-instantaneo");
  }

  // --- Presentación -----------------------------------------------------------
  // Al abrir la página, antes del menú, en cuatro pantallas:
  // 1. Logo: el dibujo de "logo agus sin texto.png" con "creado por agustin
  //    tardella" abajo (en Spaceport) en el medio de la pantalla negra, que
  //    se prende como el foquito del planeta del escenario 2, con su ruidito
  //    (si el navegador ya deja sonar), y se funde (logoFoquito en
  //    styles.css). Una tecla lo saltea y pasa a la carátula.
  // 1b. Carátula (ver "La carátula" más abajo): una de seis, al azar; espera
  //    una tecla, un click o el botón A, y con eso se funde a negro.
  // 2. Entrada: el negro se aclara (no del todo: el fondo queda como con
  //    PRESENTA_FONDO) y en el medio se abre un agujero de gusano. Llega la nave
  //    desde la izquierda, a color, lo mira y se mete volando derecho: igual
  //    que en el juego, del mismo tamaño, sin achicarse ni girar. Al llegar a la
  //    zona de entrada (CUMULO_RADIO) desaparece de golpe por el agujero, con
  //    las chispas y el sonido de cruzar. Se funde a negro.
  // 3. Salida: otra pantalla, ya la del menú (fondo negro con sus estrellas).
  //    El menú ya está centrado, desde que se levanta la pantalla negra (no hay
  //    cámara que se mueva). Se abre otro agujero a la izquierda y la nave
  //    aparece en él de golpe, del mismo tamaño de siempre. Vuela hacia el menú
  //    y frena antes de llegar, gira y lo mira un momento, y después gira otra
  //    vez, acelera y se va por la derecha. No vuelve a verse hasta que se
  //    elige un modo.
  // Pasada la carátula, cualquier tecla, un click o el botón A saltean el
  // resto. Una sola vez por página.
  //
  // Los navegadores no dejan sonar nada hasta que la persona toca la página (una
  // tecla o un click). Con PRESENTA_PIDE_TOQUE en true, si todavía no se tocó, al
  // irse el logo la pantalla negra dice "presiona cualquier tecla" y sigue recién
  // con ese toque, así los agujeros suenan. En false (lo de ahora) no hay tal
  // pantalla: la presentación corre sola y, si el navegador no deja sonar, los
  // sonidos de antes del primer toque simplemente no suenan (ver sinToque). Si ya
  // se puede sonar, suena igual en los dos casos.
  //
  // Todo lo de la presentación se dibuja en coordenadas de pantalla.
  const PRESENTA_PIDE_TOQUE = false; // true: "presiona cualquier tecla" antes de la intro y antes de entrar a un modo desde la pausa
  const PRESENTA_LOGO_DURA = 4; // s del logo, lo que dura logoFoquito (styles.css)
  const PRESENTA_LOGO_SUENA = 0.5; // s en que suena el foquito: cuando empieza a parpadear
  const PRESENTA_ACLARA = 2.4; // lo que tarda en aclarar la pantalla de entrada
  const PRESENTA_FONDO = 2 / CUMULOS_PARA_COLOR; // el fondo como con 2 agujeros
  // (Los agujeros miden lo mismo que en el juego: 1 por el zoom de la cámara,
  // cam.z, ver escalaAgujeroPresentacion. La nave, también: shipZoom = 1.)
  const PRESENTA_AGUJERO_COLOR = 1; // 0 = blancos, 1 = naranjas (como al final del juego)
  const PRESENTA_ABRE = 0.5; // s que tarda un agujero en abrirse (o en cerrarse)
  const PRESENTA_AGUJERO_EN = 0.9; // cuándo se abre el agujero de entrada
  const PRESENTA_LLEGA_EN = 1.8; // cuándo empieza a entrar la nave
  const PRESENTA_LLEGADA = 2.6; // lo que tarda en llegar
  const PRESENTA_ENTRA_EN = 4.2; // cuándo se mete en el agujero: lo mira apenas (desde ~3,6 s, cuando casi llegó y se da vuelta hacia él)
  const PRESENTA_ENTRADA = 1.1; // lo que tarda en cruzar volando derecho hasta el centro del agujero (entra antes: al llegar a la zona de entrada)
  const PRESENTA_FUNDE = 0.7; // fundido a negro entre la entrada y la salida
  const PRESENTA_NEGRO_ENTRE = 0.3; // s de negro entre las dos pantallas
  const PRESENTA_LEVANTA = 0.6; // lo que tarda en verse la pantalla de salida
  const PRESENTA_SALE_EN = 0.9; // cuándo sale la nave del segundo agujero
  const PRESENTA_SALIDA = 0.5; // s desde que sale la nave hasta que el agujero empieza a cerrarse (con +0.4)
  const PRESENTA_VE_X = 0.4; // dónde frena a mirar el menú (fracción del ancho; el menú está en 0,5)
  const PRESENTA_VIAJE = 1.3; // s que tarda en llegar ahí desde el agujero (frena suave)
  const PRESENTA_MIRA = 1.3; // s que se queda mirando el menú antes de irse
  const PRESENTA_VELOCIDAD = 0.6; // pantallas por segundo que vuela hacia la derecha al irse
  const PRESENTA_ARRANQUE = 0.8; // s que tarda en llegar a esa velocidad
  const PRESENTA_CAIDA_SALTEO = 0.35; // fundido a negro al saltearla
  const PRESENTA_ESPERA_MAX = 3; // s de negro esperando el logo, como mucho
  const presentaLogo = document.getElementById("game-presenta-logo"); // el dibujo y la firma
  const presentaLogoImg = presentaLogo && presentaLogo.querySelector("img");
  const presentaToque = document.getElementById("game-presenta-toque");
  const caratulaTexto = document.getElementById("game-caratula-texto");
  // Un WAV mudo de 8 muestras: para probar si el navegador deja sonar.
  const SILENCIO =
    "data:audio/wav;base64,UklGRjQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YRAAAAAAAAAAAAAAAAAAAAAAAAAA";
  let presenta = null; // en curso: { fase, f, toque, agujeros, ... }
  let presentada = false;

  // ¿Puede sonar algo ya, sin que se haya tocado la página? (Promise de true o
  // false.) Si ya se la tocó, sí; si el navegador lo dice (Firefox), lo que
  // diga; si no, se prueba con un sonido mudo: el navegador que no deja lo
  // rechaza con NotAllowedError.
  function puedeSonar() {
    if (navigator.userActivation && navigator.userActivation.hasBeenActive)
      return Promise.resolve(true);
    if (navigator.getAutoplayPolicy)
      return Promise.resolve(
        navigator.getAutoplayPolicy("mediaelement") === "allowed",
      );
    const prueba = new Audio(SILENCIO);
    return prueba.play().then(
      () => {
        prueba.pause();
        return true;
      },
      (err) => !err || err.name !== "NotAllowedError",
    );
  }

  // Rotación de la nave para mirar hacia (dx, dy) (0° = nariz arriba).
  const rumbo = (dx, dy) => (Math.atan2(dy, dx) * 180) / Math.PI + 90;

  function empezarPresentacion() {
    if (!presentaLogo || !tapa) return;
    presentada = true;
    // Sin opción apuntada hasta que se vaya la nave (o se la saltee): ahí se
    // apunta la primera, con su "selector" (ver terminarPresentacion).
    apagarMenu();
    // fase: "logo", "caratula", "espera" (el toque para poder sonar),
    // "entrada" o "salida"; f: segundos desde que empezó la fase. toque: null
    // mientras se averigua si puede sonar, false esperando que toquen algo,
    // true si ya puede sonar. cae: cuándo termina el fundido a negro de
    // salteo (null si no se salteó). car: lo de la carátula.
    presenta = {
      fase: "logo",
      f: 0,
      espera: 0,
      listo: false,
      toque: null,
      cae: null,
      agujeros: [],
      pos: null,
      car: null,
    };
    const gp = primerJoystick();
    presenta.padA = !!gp && botonPad(gp, PAD_A);
    // Arranca en negro, por encima de todo (la nave incluida).
    tapa.style.transition = "none";
    tapa.classList.add("cae");
    void tapa.offsetWidth;
    if (modoEl) modoEl.hidden = true;
    ship.classList.add("game-color"); // a color toda la presentación
    window.shipLibre = true; // puede estar fuera de la pantalla
    mostrarNave(false); // todavía no se la ve
    particulas = [];
    // Que el logo no aparezca a medio cargar: se espera a que esté listo.
    const listo = () => {
      if (presenta) presenta.listo = true;
    };
    if (!presentaLogoImg) listo();
    else if (presentaLogoImg.decode) presentaLogoImg.decode().then(listo, listo);
    else if (presentaLogoImg.complete) listo();
    else presentaLogoImg.addEventListener("load", listo);
    presentaLogo.hidden = false;
    puedeSonar().then((puede) => {
      if (!presenta || presenta.toque !== null) return; // ya tocaron
      presenta.toque = puede;
    });
  }

  // Una tecla, un click o el botón A durante la presentación: si todavía no
  // se podía sonar, ahora sí (y si estaba esperando el toque, sigue); si ya se
  // podía, la saltea.
  function tocarPresentacion() {
    if (!presenta) return;
    if (presenta.fase === "logo") {
      saltarLogo();
      return;
    }
    if (presenta.fase === "caratula") {
      dejarCaratula();
      return;
    }
    if (!PRESENTA_PIDE_TOQUE || presenta.toque === true) {
      saltarPresentacion();
      return;
    }
    presenta.toque = true;
    if (presentaToque) presentaToque.hidden = true;
  }

  // La nave se ve o no se ve, siempre del tamaño del juego (shipZoom 1): en la
  // presentación no se achica ni se agranda, aparece y desaparece en los
  // agujeros como en el juego. (Sin el sprite: visibility, ver game-sin-nave en
  // styles.css.)
  function mostrarNave(visible) {
    window.shipZoom = 1;
    ship.classList.toggle("game-sin-nave", !visible);
  }

  function pasarFase(fase) {
    presenta.fase = fase;
    presenta.f = 0;
  }

  // Un agujero de la presentación en (x, y) del mundo, que se abre en abre
  // (segundos de la fase).
  function agujeroPresentacion(x, y, abre) {
    const a = { x, y, abre, cierra: null, ang: Math.random() * Math.PI * 2 };
    presenta.agujeros.push(a);
    return a;
  }

  function actualizarPresentacion(dt) {
    const p = presenta;
    // Botón A del joystick: como una tecla (solo al apretarlo, no si venía
    // apretado).
    const gp = primerJoystick();
    const a = !!gp && botonPad(gp, PAD_A);
    if (a && !p.padA) tocarPresentacion();
    p.padA = a;
    if (p.cae !== null) {
      // Salteada: se funde a negro con todo quieto y, ya en negro, termina.
      p.cae -= dt;
      if (p.cae <= 0) terminarPresentacion();
      return;
    }
    if (p.fase === "caratula") {
      actualizarCaratula(dt);
      return;
    }
    if (p.fase === "logo") {
      if (!p.listo) {
        p.espera += dt;
        if (p.espera < PRESENTA_ESPERA_MAX) return;
        p.listo = true;
      }
      // El foquito (logoFoquito en styles.css): aparece apagado, parpadea
      // con el ruidito, se queda prendido, se funde y se va.
      if (p.f === 0 && p.logoCae === undefined)
        presentaLogo.classList.add("foquito");
      p.f += dt;
      if (!p.logoSono && p.logoCae === undefined && p.f >= PRESENTA_LOGO_SUENA) {
        p.logoSono = true;
        sonarMenu("foquito");
      }
      if (p.logoCae !== undefined) p.logoCae -= dt;
      if (p.logoCae !== undefined ? p.logoCae <= 0 : p.f >= PRESENTA_LOGO_DURA)
        terminarLogo();
      return;
    }
    if (p.fase === "espera") {
      if (PRESENTA_PIDE_TOQUE && p.toque !== true) {
        // Todavía no puede sonar: lo pide (si todavía se está averiguando,
        // espera en negro sin decir nada).
        if (p.toque === false && presentaToque) presentaToque.hidden = false;
        return;
      }
      if (presentaToque) presentaToque.hidden = true;
      empezarEntrada();
    }
    p.f += dt;
    for (const h of p.agujeros) h.ang += CUMULO_GIRO * dt;
    moverChispas(dt);
    if (p.fase === "entrada") actualizarEntrada();
    else actualizarSalida();
    if (presenta) dibujarPresentacion(); // (si la nave ya se fue, terminó)
  }

  // Terminó el logo (o se lo salteó): la carátula.
  function terminarLogo() {
    presentaLogo.classList.remove("foquito", "visible");
    presentaLogo.style.transition = "";
    presentaLogo.style.opacity = "";
    presentaLogo.hidden = true;
    empezarCaratula();
  }

  // Una tecla durante el logo: se apaga rápido desde donde estaba y sigue la
  // carátula.
  const PRESENTA_LOGO_SALTEO = 0.3;
  function saltarLogo() {
    const p = presenta;
    if (p.logoCae !== undefined) return;
    p.logoCae = PRESENTA_LOGO_SALTEO;
    apagarLogo(PRESENTA_LOGO_SALTEO);
  }

  // El logo se va en dur segundos desde el brillo que tenía (aunque esté a
  // mitad del foquito).
  function apagarLogo(dur) {
    const opacidad = getComputedStyle(presentaLogo).opacity;
    presentaLogo.style.transition = "none";
    presentaLogo.style.opacity = opacidad;
    presentaLogo.classList.remove("foquito", "visible");
    void presentaLogo.offsetWidth;
    presentaLogo.style.transition = `opacity ${dur}s ease`;
    presentaLogo.style.opacity = "0";
  }

  // Pantalla de entrada: el starry apenas prendido, el agujero en el medio.
  function empezarEntrada() {
    const p = presenta;
    pasarFase("entrada");
    fondoDeGolpe(() =>
      scene.style.setProperty("--fondo-color", PRESENTA_FONDO.toFixed(3)),
    );
    tapa.style.transition = `opacity ${PRESENTA_ACLARA}s ease`;
    tapa.classList.remove("cae");
    const w = window.innerWidth;
    const h = window.innerHeight;
    const hueco = agujeroPresentacion(w / 2, h / 2, PRESENTA_AGUJERO_EN);
    // La nave se queda abajo a la izquierda del agujero, mirándolo.
    const lejos = Math.min(260, w * 0.3);
    p.destino = { x: hueco.x - lejos, y: hueco.y + lejos * 0.35 };
    p.desde = { x: -160, y: p.destino.y + 60 };
    mostrarNave(true); // arranca afuera de la pantalla, a la izquierda
    window.shipPlace(p.desde.x, p.desde.y);
  }

  function actualizarEntrada() {
    const p = presenta;
    const f = p.f;
    const hueco = p.agujeros[0];
    if (!p.abrio && f >= hueco.abre) {
      p.abrio = true;
      sonarPortal();
    }
    let pos;
    let mira;
    if (f < PRESENTA_ENTRA_EN) {
      // Llega rápido y frena suave; ya casi llegando, mira al agujero.
      const u = Math.max(
        0,
        Math.min(1, (f - PRESENTA_LLEGA_EN) / PRESENTA_LLEGADA),
      );
      const suave = 1 - Math.pow(1 - u, 3);
      const { desde, destino } = p;
      pos = {
        x:
          desde.x +
          (destino.x - desde.x) * suave +
          Math.sin(f * 1.7) * NAVE_FLOTA.x * suave,
        y:
          desde.y +
          (destino.y - desde.y) * suave +
          Math.sin(f * 2.3 + 1) * NAVE_FLOTA.y * suave,
      };
      mira =
        u < 0.7
          ? rumbo(destino.x - desde.x, destino.y - desde.y)
          : rumbo(hueco.x - pos.x, hueco.y - pos.y);
      p.pos = pos;
    } else {
      // Se mete: derecho hacia el centro del agujero, cada vez más rápido y
      // siempre del mismo tamaño. Al llegar a la zona de entrada (CUMULO_RADIO,
      // por el zoom: la misma que en el juego) desaparece de golpe y el agujero
      // se cierra con sus chispas.
      const u = Math.min(1, (f - PRESENTA_ENTRA_EN) / PRESENTA_ENTRADA);
      const k = u * u;
      pos = {
        x: p.pos.x + (hueco.x - p.pos.x) * k,
        y: p.pos.y + (hueco.y - p.pos.y) * k,
      };
      mira = rumbo(hueco.x - p.pos.x, hueco.y - p.pos.y);
      if (
        hueco.cierra === null &&
        Math.hypot(hueco.x - pos.x, hueco.y - pos.y) < CUMULO_RADIO * cam.z
      ) {
        p.cruzoEn = f;
        hueco.cierra = f;
        mostrarNave(false);
        chispas(hueco.x, hueco.y);
        sonarCruce();
      }
    }
    window.shipPlace(pos.x, pos.y, true);
    if (mira !== undefined) window.shipFace(mira);
    const negroEn = (p.cruzoEn || PRESENTA_ENTRA_EN + PRESENTA_ENTRADA) + 0.3;
    if (!p.funde && f >= negroEn) {
      p.funde = true;
      tapa.style.transition = `opacity ${PRESENTA_FUNDE}s ease`;
      tapa.classList.add("cae");
    }
    if (f >= negroEn + PRESENTA_FUNDE + PRESENTA_NEGRO_ENTRE) empezarSalida();
  }

  // Pantalla de salida: ya la del menú (fondo negro), con el menú ya en el
  // medio.
  function empezarSalida() {
    const p = presenta;
    pasarFase("salida");
    fondoDeGolpe(() => scene.style.setProperty("--fondo-color", "0"));
    particulas = [];
    const w = window.innerWidth;
    p.agujeros = [];
    const hueco = agujeroPresentacion(
      w * 0.2,
      window.innerHeight * POSICION_Y_INICIAL,
      0,
    );
    sonarPortal();
    p.x = hueco.x;
    mostrarNave(false); // aparece cuando sale del agujero (actualizarSalida)
    window.shipPlace(hueco.x, hueco.y);
    if (modoEl) {
      modoEl.inert = true; // se ve, pero todavía no se lo puede usar
      modoEl.hidden = false;
    }
    tapa.style.transition = `opacity ${PRESENTA_LEVANTA}s ease`;
    tapa.classList.remove("cae");
  }

  // Rotación de la nave para mirar al centro del menú desde (x, y).
  function rumboAlMenu(x, y) {
    const r = modoEl && modoEl.getBoundingClientRect();
    const cx = r && r.width ? r.left + r.width / 2 : window.innerWidth / 2;
    const cy = r && r.height ? r.top + r.height / 2 : window.innerHeight * 0.45;
    return rumbo(cx - x, cy - y);
  }

  function actualizarSalida() {
    const p = presenta;
    const w = window.innerWidth;
    const hueco = p.agujeros[0];
    // Sale de golpe, mirando para la derecha, y vuela hasta un punto antes del
    // menú (PRESENTA_VE_X) frenando suave. Ahí gira, lo mira PRESENTA_MIRA
    // segundos, vuelve a girar para la derecha y acelera hasta
    // PRESENTA_VELOCIDAD hasta salir de la pantalla. El menú no se mueve.
    const s = p.f - PRESENTA_SALE_EN;
    if (s >= 0 && !p.salio) {
      p.salio = true;
      mostrarNave(true); // aparece de golpe, del tamaño de siempre
      chispas(hueco.x, hueco.y);
      sonarCruce();
    }
    const veX = w * PRESENTA_VE_X;
    const seVa = PRESENTA_VIAJE + PRESENTA_MIRA; // cuándo empieza a irse
    let mira = rumbo(1, 0);
    if (s >= 0) {
      if (s < PRESENTA_VIAJE) {
        const u = s / PRESENTA_VIAJE;
        p.x = hueco.x + (veX - hueco.x) * (1 - Math.pow(1 - u, 3));
      } else if (s < seVa) {
        p.x = veX;
        if (p.miraAlMenu === undefined)
          p.miraAlMenu = rumboAlMenu(veX, hueco.y);
        mira = p.miraAlMenu;
      } else {
        const t = s - seVa;
        const v = PRESENTA_VELOCIDAD * w;
        p.x =
          veX +
          (t < PRESENTA_ARRANQUE
            ? (v * t * t) / (2 * PRESENTA_ARRANQUE)
            : v * (t - PRESENTA_ARRANQUE / 2));
      }
      // Ya afuera, el agujero se cierra.
      if (hueco.cierra === null && s >= PRESENTA_SALIDA + 0.4)
        hueco.cierra = p.f;
    }
    const y = hueco.y + Math.sin(p.f * 2.3) * NAVE_FLOTA.y;
    window.shipPlace(p.x, y, true);
    window.shipFace(mira);
    if (p.x > w + 160) terminarPresentacion(); // ya se fue
  }

  // Tamaño de un agujero de la presentación ahora: se abre y se cierra
  // achicándose, como en el juego, y en el medio pulsa con su propio reloj.
  function escalaAgujeroPresentacion(h, f) {
    const abierto = Math.min(
      Math.max(0, (f - h.abre) / PRESENTA_ABRE),
      h.cierra === null ? 1 : Math.max(0, 1 - (f - h.cierra) / PRESENTA_ABRE),
    );
    const compas = MUSICA_COMPAS_RESPALDO;
    return (
      cam.z * // el tamaño del juego: 1 por el zoom de su cámara
      abierto *
      (1 +
        CUMULO_PULSO_AMPLITUD *
          pulsoCumulo(f % compas, compas / MUSICA_TIEMPOS_COMPAS))
    );
  }

  function dibujarPresentacion() {
    const p = presenta;
    dibujarCieloPresentacion();
    for (const h of p.agujeros) {
      const esc = escalaAgujeroPresentacion(h, p.f);
      if (esc > 0.01)
        dibujarAgujero(h.x, h.y, h.ang, esc, PRESENTA_AGUJERO_COLOR);
    }
    dibujarChispas(PRESENTA_AGUJERO_COLOR);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Borra el lienzo y dibuja las estrellas; deja el lienzo en coordenadas de
  // pantalla.
  function dibujarCieloPresentacion() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // Las estrellas, con la cámara que va a tener el menú (ver dibujar): el
    // zoom del juego, anclado donde espera la nave (centrarNave), y no donde
    // anda ahora. Si no, al terminar cambiarían de tamaño y de lugar.
    const ox = window.innerWidth / 2;
    const oy = window.innerHeight * POSICION_Y_INICIAL;
    ctx.setTransform(
      dpr * cam.z,
      0,
      0,
      dpr * cam.z,
      dpr * ox * (1 - cam.z),
      dpr * oy * (1 - cam.z),
    );
    dibujarEstrellas();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- La carátula -------------------------------------------------------------
  // Después del logo, antes del agujero de gusano: una de nueve carátulas
  // minimalistas (las maquetas están en caratulas/), al azar cada vez que se
  // entra y nunca la misma dos veces seguidas (con ?caratula=N se elige una).
  // Todavía sin nombre del juego. Abajo, "cargando" hasta que están las
  // imágenes y después "presiona cualquier tecla": ese toque es el que deja
  // sonar al navegador. Cada una se mueve apenas:
  // 1. Anillo: el agujero blanco, solo, late con el tempo de la música (como los
  //    agujeros del juego).
  // 2. Duelo: las dos naves chiquitas frente a frente y un agujero entre ellas;
  //    las estrellas se corren muy despacio.
  // 3. Estelas: las dos naves casi cruzándose, cada una con su humo (el de la X
  //    o la B); el halo de cada una se aviva y se apaga tenue, 3 s cada una,
  //    medio superpuestas.
  // 4. Blanco y negro: la nave sola, con la llama a media potencia, pasa de
  //    blanco y negro a color.
  // 5. Lluvia: piedras finitas que caen y esquivan a la nave, que nunca recibe
  //    un golpe.
  // 6. Llegada: la nave con su humo va hacia un agujero chiquito que nunca
  //    alcanza; el cielo gira muy despacio.
  // 9. Órbita: la nave da vueltas alrededor de un agujero dejando la estela
  //    de verdad (la de la X, ver sembrarEstela): la órbita es su humo.
  // 11. Linterna: la nave con la luz prendida avanza muy despacio entre
  //    piedras que solo se ven cuando les llega la luz.
  // 13. Estrella: el caza TIE frente a la Estrella de la Muerte, grande y
  //    apenas visible; las estrellas se corren muy despacio.
  // Se dibujan en 1920x1080 (el mapa del juego) y se escalan a la pantalla (ver
  // transformarCaratula); las estrellas llenan la pantalla entera.
  const CARATULAS = [1, 2, 3, 4, 5, 6, 9, 11, 13];
  const CARATULA_ULTIMA = "esc4-caratula"; // la que salió la vez anterior
  const CARATULA_APARECE = 1.2; // s que tarda en aclararse desde el negro
  const CARATULA_SALE = 0.7; // s del fundido a negro con el toque
  const CARATULA_ESTRELLAS = 70; // en 1920x1080
  const CARATULA_AZUL = "90, 169, 255";
  const CARATULA_ROJO = "255, 90, 90";
  const CARATULA_DERIVA = 5; // 2: px/s que se corren las estrellas
  const CARATULA_GIRO_CIELO = 0.012; // 6: rad/s que gira el cielo
  const CARATULA_DESTELLO = 3; // 3: s que dura el destello de cada nave
  const CARATULA_COLOR = { desde: 1.5, dura: 4.5 }; // 4: cuándo empieza a colorearse la nave y cuánto tarda
  const CARATULA_PIEDRAS = 46; // 5
  const CARATULA_ESQUIVA = 60; // 5: px que dejan las piedras entre ellas y la nave
  const CARATULA_ORBITA = { x: 960, y: 500, radio: 250, alto: 60, vuelta: 7 }; // 9: vuelta en s (sentido del reloj)
  const CARATULA_ORBITA_PREVIA = 9; // 9: s de órbita que ya pasaron al aparecer (el humo ya está)
  const CARATULA_LINTERNA = { x: 960, y: 555, alto: 76, rot: -20, radio: 380, vel: 16 }; // 11: vel en px/s de las piedras
  const CARATULA_LUZ = "255, 244, 214"; // 11: el color de la luz
  const CARATULA_ROCAS = 16; // 11
  const CARATULA_ESTRELLA = { x: 1510, y: 580, radio: 420, alfa: 0.06 }; // 13: la Estrella de la Muerte (alfa: qué tanto se ve)
  const CARATULA_TIE = { x: 705, y: 615, alto: 90 }; // 13

  function elegirCaratula() {
    const pedida = Number(new URLSearchParams(location.search).get("caratula"));
    if (CARATULAS.includes(pedida)) return pedida;
    let ultima = 0;
    try {
      ultima = Number(localStorage.getItem(CARATULA_ULTIMA)) || 0;
    } catch (e) {}
    let n;
    do n = CARATULAS[Math.floor(Math.random() * CARATULAS.length)];
    while (n === ultima);
    try {
      localStorage.setItem(CARATULA_ULTIMA, String(n));
    } catch (e) {}
    return n;
  }

  // Escala y corrimiento de 1920x1080 a la pantalla (entra entera, centrada).
  function medidaCaratula() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (selector && tactil) {
      // En el celular el selector se acerca: entra lo que tiene algo (de
      // SEL_RECORTE_T), no los 1920x1080 enteros, así se lo puede tocar.
      const R = SEL_RECORTE_T;
      const u = Math.min(W / R.ancho, H / (R.y1 - R.y0));
      return { u, ox: (W - 1920 * u) / 2, oy: H / 2 - ((R.y0 + R.y1) / 2) * u };
    }
    const u = Math.min(W / 1920, H / 1080);
    return { u, ox: (W - 1920 * u) / 2, oy: (H - 1080 * u) / 2 };
  }
  function transformarCaratula() {
    const { u, ox, oy } = medidaCaratula();
    ctx.setTransform(dpr * u, 0, 0, dpr * u, dpr * ox, dpr * oy);
  }

  // Estrellas en un cuadrado que cubre la pantalla aunque gire (lado = la
  // diagonal), con la misma densidad que las maquetas.
  function crearEstrellasCaratula() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const lado = Math.hypot(W, H);
    const { u } = medidaCaratula();
    const n = Math.round(
      (CARATULA_ESTRELLAS * lado * lado) / (1920 * 1080 * u * u),
    );
    const estrellas = [];
    for (let i = 0; i < n; i++)
      estrellas.push({
        x: (Math.random() - 0.5) * lado,
        y: (Math.random() - 0.5) * lado,
        r: (0.6 + Math.random() * 1.1) * Math.max(u, 0.5),
        a: 0.15 + Math.random() * 0.4,
      });
    return estrellas;
  }

  // corrida: px que se corrieron a la izquierda; giro: radianes alrededor del
  // centro de la pantalla.
  function dibujarEstrellasCaratula(estrellas, corrida, giro) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const lado = Math.hypot(W, H);
    const cos = Math.cos(giro);
    const sin = Math.sin(giro);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = "#fff";
    for (const s of estrellas) {
      let x = s.x - corrida;
      x = ((((x + lado / 2) % lado) + lado) % lado) - lado / 2;
      const px = W / 2 + x * cos - s.y * sin;
      const py = H / 2 + x * sin + s.y * cos;
      if (px < -3 || px > W + 3 || py < -3 || py > H + 3) continue;
      ctx.globalAlpha = s.a;
      ctx.beginPath();
      ctx.arc(px, py, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // Un dibujo quieto (el humo) hecho una sola vez en un lienzo del tamaño de
  // la carátula en pantalla; dibujar(c) dibuja en 1920x1080.
  function lienzoCaratula(dibujar) {
    const { u } = medidaCaratula();
    const lienzo = document.createElement("canvas");
    lienzo.width = Math.max(1, Math.round(1920 * u * dpr));
    lienzo.height = Math.max(1, Math.round(1080 * u * dpr));
    const c = lienzo.getContext("2d");
    c.scale(u * dpr, u * dpr);
    dibujar(c);
    return lienzo;
  }

  // El humo de la estela del juego (X o B del joystick), con sus mismos
  // números (ver sembrarEstela y dibujarEstela): bocanadas del color de la
  // nave cada ~0,04 altos de nave, que nacen en la punta del fuego y crecen y
  // se apagan con la edad, 3 s de humo (lo que dura el tanque). camino: puntos
  // desde la punta del fuego hacia atrás; vel: altos de nave por segundo.
  function humoCaratula(c, camino, rgb, alto, vel = 2.6) {
    const spr = spriteEstela(
      "#" +
        rgb
          .split(",")
          .map((v) => Number(v).toString(16).padStart(2, "0"))
          .join(""),
    );
    const paso = alto * 0.042;
    const largoMax = vel * alto * ESTELA_TANQUE;
    const puntos = [];
    let hecho = 0;
    for (let i = 1; i < camino.length && hecho < largoMax; i++) {
      const [ax, ay] = camino[i - 1];
      const [bx, by] = camino[i];
      const d = Math.hypot(bx - ax, by - ay);
      for (let s = 0; s < d && hecho < largoMax; s += paso, hecho += paso)
        puntos.push([ax + ((bx - ax) * s) / d, ay + ((by - ay) * s) / d, hecho]);
    }
    // Las más viejas primero (quedan abajo).
    for (let i = puntos.length - 1; i >= 0; i--) {
      const [x, y, dist] = puntos[i];
      const edad = dist / (vel * alto);
      const t = edad / (7 + Math.random() * 5);
      const r0 = (alto * (4 + Math.random() * 2)) / 130;
      const r1 = (alto * (24 + Math.random() * 20)) / 130;
      const r = r0 + (r1 - r0) * Math.pow(t, 0.55);
      const deriva = edad * alto * 0.02;
      c.globalAlpha =
        (0.07 + Math.random() * 0.04) *
        Math.pow(1 - t, 1.6) *
        Math.min(1, edad / 0.3);
      c.drawImage(
        spr,
        x + (Math.random() - 0.5) * deriva - r,
        y + (Math.random() - 0.5) * deriva - r,
        r * 2,
        r * 2,
      );
    }
    c.globalAlpha = 1;
  }

  // Una curva (cuadrática) como lista de puntos.
  function curvaCaratula(a, b, c, n = 80) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const v = 1 - t;
      pts.push([
        v * v * a[0] + 2 * v * t * b[0] + t * t * c[0],
        v * v * a[1] + 2 * v * t * b[1] + t * t * c[1],
      ]);
    }
    return pts;
  }
  // La punta del fuego de una nave en (x, y) girada rot grados.
  function motorCaratula(x, y, alto, rot) {
    const a = (rot * Math.PI) / 180;
    return [x - Math.sin(a) * alto * 0.36, y + Math.cos(a) * alto * 0.36];
  }

  // Piedra finita de la lluvia (5): nace arriba (o en cualquier lugar, para
  // arrancar con la lluvia ya cayendo).
  function crearPiedraCaratula(arriba) {
    const r = 6 + Math.random() * 16;
    const n = 4 + Math.floor(Math.random() * 3);
    const verts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + (Math.random() - 0.5) * 0.8;
      const k = 0.6 + Math.random() * 0.6;
      verts.push({ x: Math.cos(a) * k, y: Math.sin(a) * k });
    }
    return {
      x: Math.random() * 1920,
      y: arriba ? -r * 2 - Math.random() * 300 : Math.random() * 1080,
      r,
      vx: 0,
      vy: 40 + Math.random() * 70,
      ang: Math.random() * Math.PI * 2,
      giro: (Math.random() - 0.5) * 1.2,
      alfa: 0.25 + Math.random() * 0.35,
      verts,
    };
  }

  // Piedra de la linterna (11): más grande, flotando despacio hacia atrás de
  // la nave. Nace en cualquier lugar alrededor o (adelante) del lado hacia
  // donde va la nave, afuera de lo que se ve.
  function crearRocaCaratula(adelante) {
    const L = CARATULA_LINTERNA;
    const roca = crearPiedraCaratula(false);
    const a = (L.rot * Math.PI) / 180;
    const fx = Math.sin(a);
    const fy = -Math.cos(a); // hacia donde va la nave
    const lejos = 560;
    if (adelante) {
      const lado = (Math.random() - 0.5) * 2 * lejos;
      roca.x = L.x + fx * lejos - fy * lado;
      roca.y = L.y + fy * lejos + fx * lado;
    } else {
      const ang = Math.random() * Math.PI * 2;
      const d = 90 + Math.sqrt(Math.random()) * (lejos - 90);
      roca.x = L.x + Math.cos(ang) * d;
      roca.y = L.y + Math.sin(ang) * d;
    }
    roca.r = 14 + Math.random() * 16;
    const vel = L.vel * (0.7 + Math.random() * 0.6);
    roca.vx = -fx * vel + (Math.random() - 0.5) * 6;
    roca.vy = -fy * vel + (Math.random() - 0.5) * 6;
    roca.giro = (Math.random() - 0.5) * 0.5;
    return roca;
  }

  // La nave de la órbita (9) da vueltas y va soltando su estela.
  function moverOrbitaCaratula(c, dt) {
    const O = CARATULA_ORBITA;
    c.ang += ((Math.PI * 2) / O.vuelta) * dt;
    const cos = Math.cos(c.ang);
    const sin = Math.sin(c.ang);
    c.x = O.x + O.radio * cos;
    c.y = O.y + O.radio * sin;
    c.rot = rumbo(-sin, cos);
    const [mx, my] = motorCaratula(c.x, c.y, O.alto, c.rot);
    sembrarEstela(c.motor, mx, my, c.color, O.alto / 130, dt, c.humo);
    c.motor.tanque = ESTELA_TANQUE; // acá el tanque no se acaba
  }

  // Las naves de las carátulas: dónde están (en 1920x1080), su alto y hacia
  // dónde miran. Las del humo (3 y 6) salen de su curva.
  const CARATULA_CURVA_AZUL = [[870, 590], [634, 820], [96, 900]];
  const CARATULA_CURVA_ROJA = [[1050, 410], [1286, 180], [1824, 100]];
  const CARATULA_LLEGADA = { x: 768, y: 522, alto: 66, desde: [0, 640] };

  function crearCaratula() {
    const n = elegirCaratula();
    const c = { n, lista: false, sale: null, estrellas: crearEstrellasCaratula() };
    const rumboA = (a, b) => rumbo(b[0] - a[0], b[1] - a[1]);
    if (n === 3) {
      const azul = curvaCaratula(...CARATULA_CURVA_AZUL);
      const roja = curvaCaratula(...CARATULA_CURVA_ROJA);
      c.naves = [
        { x: azul[0][0], y: azul[0][1], rot: rumboA(azul[3], azul[0]), rgb: CARATULA_AZUL, fase: 0 },
        { x: roja[0][0], y: roja[0][1], rot: rumboA(roja[3], roja[0]), rgb: CARATULA_ROJO, fase: CARATULA_DESTELLO / 2 },
      ];
      c.humo = lienzoCaratula((ctx2) => {
        for (const [nave, curva] of [
          [c.naves[0], CARATULA_CURVA_AZUL],
          [c.naves[1], CARATULA_CURVA_ROJA],
        ]) {
          const m = motorCaratula(nave.x, nave.y, 84, nave.rot);
          humoCaratula(ctx2, curvaCaratula(m, curva[1], curva[2]), nave.rgb, 84);
        }
      });
    } else if (n === 5) {
      c.piedras = [];
      for (let i = 0; i < CARATULA_PIEDRAS; i++)
        c.piedras.push(crearPiedraCaratula(false));
    } else if (n === 6) {
      const L = CARATULA_LLEGADA;
      c.rot = rumbo(L.x - L.desde[0], L.y - L.desde[1]);
      c.humo = lienzoCaratula((ctx2) => {
        const m = motorCaratula(L.x, L.y, L.alto, c.rot);
        const atras = [m[0] - (L.x - L.desde[0]) * 1.2, m[1] - (L.y - L.desde[1]) * 1.2];
        humoCaratula(ctx2, [m, atras], CARATULA_AZUL, L.alto);
      });
    } else if (n === 9) {
      // Arranca con unas vueltas ya dadas: el humo ya dibuja la órbita.
      c.ang = -Math.PI * 0.75;
      c.humo = [];
      c.motor = { x: 0, y: 0, ok: false, tanque: ESTELA_TANQUE, recargando: false };
      c.color =
        "#" + CARATULA_AZUL.split(",").map((v) => Number(v).toString(16).padStart(2, "0")).join("");
      const paso = 1 / 60;
      for (let f = 0; f < CARATULA_ORBITA_PREVIA; f += paso) {
        moverOrbitaCaratula(c, paso);
        avanzarBocanadas(c.humo, paso, false);
      }
    } else if (n === 11) {
      c.rocas = [];
      for (let i = 0; i < CARATULA_ROCAS; i++) c.rocas.push(crearRocaCaratula(false));
    } else if (n === 13) {
      c.tie = naveDe("tie").img;
      c.estrella = cargarImagen("naves/nuevas/estrella/estrella@2x.png");
      c.lienzoTie = Object.assign(document.createElement("canvas"), { width: 203, height: 300 });
    }
    return c;
  }

  // Después del logo: se aclara la carátula.
  function empezarCaratula() {
    const p = presenta;
    pasarFase("caratula");
    p.car = crearCaratula();
    particulas = [];
    fondoDeGolpe(() => scene.style.setProperty("--fondo-color", "0"));
    tapa.style.transition = `opacity ${CARATULA_APARECE}s ease`;
    tapa.classList.remove("cae");
    if (caratulaTexto) {
      caratulaTexto.textContent = "cargando";
      caratulaTexto.classList.add("cargando");
      caratulaTexto.style.opacity = "";
      caratulaTexto.hidden = false;
    }
  }

  // ¿Ya se puede dibujar todo? (Las naves, los anillos de los agujeros y lo
  // propio de cada carátula: el TIE y la Estrella.)
  function caratulaLista(c) {
    const cargada = (img) => img.complete && img.naturalWidth > 0;
    if (c.n === 13 && !(cargada(c.tie) && cargada(c.estrella))) return false;
    return (
      !!gusanoSprites &&
      cargada(imgRivalTop) &&
      cargada(imgRivalFondo) &&
      cargada(imgFuego)
    );
  }

  // El toque en la carátula: se funde a negro y sigue con el agujero de
  // gusano. Desde acá ya se puede sonar.
  function dejarCaratula() {
    const c = presenta.car;
    if (!c || c.sale !== null) return;
    c.sale = 0;
    presenta.toque = true;
    pedirPantallaCompleta();
    if (menuCtx) menuCtx.resume().catch(() => {});
    if (audioCtx) audioCtx.resume().catch(() => {});
    tapa.style.transition = `opacity ${CARATULA_SALE}s ease`;
    tapa.classList.add("cae");
    if (caratulaTexto) caratulaTexto.style.opacity = "0";
  }

  function actualizarCaratula(dt) {
    const p = presenta;
    const c = p.car;
    p.f += dt;
    if (!c.lista && caratulaLista(c)) {
      c.lista = true;
      if (caratulaTexto) {
        caratulaTexto.textContent = tactil ? "toca la pantalla" : "presiona cualquier tecla";
        caratulaTexto.classList.remove("cargando");
      }
    }
    if (c.sale !== null) {
      c.sale += dt;
      if (c.sale >= CARATULA_SALE + 0.25) {
        // Ya en negro: el agujero de gusano (ver "espera").
        if (caratulaTexto) caratulaTexto.hidden = true;
        pasarFase("espera");
        return;
      }
    }
    if (c.n === 5) moverPiedrasCaratula(c.piedras, dt);
    else if (c.n === 9) moverOrbitaCaratula(c, dt);
    else if (c.n === 11) moverRocasCaratula(c.rocas, dt);
    // El fuego de las naves: a media potencia en la 4 y en la 11 (la nave va
    // despacio), a pleno en las demás.
    actualizarFuegoRival(dt, c.n === 4 || c.n === 11 ? 40 : 65);
    dibujarCaratula(c, p.f, dt);
  }

  // Las piedras de la linterna flotan derecho y giran; nunca tocan la nave y
  // la que se va lejos vuelve a entrar por adelante.
  function moverRocasCaratula(rocas, dt) {
    const L = CARATULA_LINTERNA;
    rocas.forEach((s, i) => {
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.ang += s.giro * dt;
      const dx = s.x - L.x;
      const dy = s.y - L.y;
      const d = Math.hypot(dx, dy);
      const lejos = L.alto * 0.6 + s.r + CARATULA_ESQUIVA;
      if (d < lejos) {
        s.x = L.x + (dx * lejos) / (d || 1);
        s.y = L.y + (dy * lejos) / (d || 1);
      }
      if (d > 620) rocas[i] = crearRocaCaratula(true);
    });
  }

  // Caen derecho, pero al acercarse a la nave se corren de costado y la
  // rodean: nunca la tocan.
  function moverPiedrasCaratula(piedras, dt) {
    const nx = 960;
    const ny = 800;
    const radioNave = 45;
    for (const s of piedras) {
      const dx = s.x - nx;
      const dy = s.y - ny;
      const lejos = radioNave + s.r + CARATULA_ESQUIVA;
      const lado = dx >= 0 ? 1 : -1;
      // Se va apartando desde un poco antes de llegar.
      if (Math.abs(dx) < lejos && dy > -lejos * 3 && dy < lejos)
        s.vx += lado * 260 * dt * (1 - Math.abs(dx) / lejos);
      else s.vx *= 1 - Math.min(1, dt * 1.5);
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.ang += s.giro * dt;
      // Y por las dudas, nunca adentro del círculo de la nave.
      const d = Math.hypot(s.x - nx, s.y - ny);
      if (d < lejos) {
        const k = lejos / (d || 1);
        s.x = nx + (s.x - nx) * k;
        s.y = ny + (s.y - ny) * k;
      }
      if (s.y - s.r * 2 > 1080) Object.assign(s, crearPiedraCaratula(true));
    }
  }

  // La nave en (x, y) de 1920x1080: las tres capas juntas (atrás, fuego,
  // adelante) como la del rival (ver dibujarRival), con el filtro que se pida.
  function naveCaratula(x, y, alto, rot, filtro, lienzo = lienzoRival) {
    const lw = lienzo.width;
    const lh = lienzo.height;
    const ancho = (alto * lw) / lh;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    ctx.filter = filtro;
    ctx.drawImage(lienzo, -ancho / 2, -alto / 2, ancho, alto);
    ctx.restore();
  }
  // Halo de color de la nave; fuerza de 0 a 1 (1 = el de las maquetas).
  function haloCaratula(rgb, fuerza = 1) {
    const k = medidaCaratula().u * dpr;
    if (calidadBaja())
      return `drop-shadow(0 0 ${4 * k}px rgba(${rgb}, ${0.95 * fuerza}))`;
    return (
      `drop-shadow(0 0 ${4 * k}px rgba(${rgb}, ${0.95 * fuerza})) ` +
      `drop-shadow(0 0 ${12 * k}px rgba(${rgb}, ${0.45 * fuerza}))`
    );
  }

  function dibujarCaratula(c, t, dt) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    const { u } = medidaCaratula();
    dibujarEstrellasCaratula(
      c.estrellas,
      c.n === 2 || c.n === 13 ? t * CARATULA_DERIVA * u : 0,
      c.n === 6 ? t * CARATULA_GIRO_CIELO : 0,
    );
    if (!c.lista) return;
    transformarCaratula();
    // Las naves del lienzo del rival, con el fuego de este cuadro.
    const lc = lienzoRival.getContext("2d");
    lc.clearRect(0, 0, lienzoRival.width, lienzoRival.height);
    lc.drawImage(imgRivalFondo, 0, 0, lienzoRival.width, lienzoRival.height);
    lc.drawImage(lienzoFuegoRival, 0, 0);
    lc.drawImage(imgRivalTop, 0, 0, lienzoRival.width, lienzoRival.height);
    const compas = MUSICA_COMPAS_RESPALDO;
    const late =
      1 +
      CUMULO_PULSO_AMPLITUD *
        pulsoCumulo(t % compas, compas / MUSICA_TIEMPOS_COMPAS);
    const giroAgujero = t * CUMULO_GIRO * 0.3;

    if (c.n === 1) {
      dibujarAgujero(960, 470, giroAgujero * 0.5, 6.5 * late, 0);
    } else if (c.n === 2) {
      dibujarAgujero(960, 500, giroAgujero, 1.5, 1);
      naveCaratula(700, 500, 96, 90, haloCaratula(CARATULA_AZUL));
      naveCaratula(1220, 500, 96, -90, haloCaratula(CARATULA_ROJO));
    } else if (c.n === 3) {
      ctx.drawImage(c.humo, 0, 0, 1920, 1080);
      for (const n of c.naves) {
        // Destello tenue: sube y baja en CARATULA_DESTELLO s, y cada nave
        // arranca a la mitad del de la otra.
        const f = (((t - n.fase) % (CARATULA_DESTELLO * 2)) + CARATULA_DESTELLO * 2) % (CARATULA_DESTELLO * 2);
        const destello = f < CARATULA_DESTELLO ? Math.sin((f / CARATULA_DESTELLO) * Math.PI) : 0;
        naveCaratula(n.x, n.y, 84, n.rot, haloCaratula(n.rgb, 0.6 + 0.4 * destello));
      }
    } else if (c.n === 4) {
      const luz = ctx.createRadialGradient(960, 470, 0, 960, 470, 360);
      luz.addColorStop(0, "rgba(255, 244, 214, 0.10)");
      luz.addColorStop(1, "rgba(255, 244, 214, 0)");
      ctx.fillStyle = luz;
      ctx.fillRect(0, 0, 1920, 1080);
      const k = Math.max(
        0,
        Math.min(1, (t - CARATULA_COLOR.desde) / CARATULA_COLOR.dura),
      );
      const gris = 1 - k * k * (3 - 2 * k);
      naveCaratula(
        960,
        470,
        210,
        0,
        `grayscale(${gris.toFixed(3)}) brightness(${(1 + 0.1 * gris).toFixed(3)})`,
      );
    } else if (c.n === 5) {
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.2;
      ctx.fillStyle = "#000";
      for (const s of c.piedras) {
        const cos = Math.cos(s.ang);
        const sin = Math.sin(s.ang);
        ctx.strokeStyle = `rgba(255, 255, 255, ${s.alfa})`;
        ctx.beginPath();
        s.verts.forEach((v, i) => {
          const px = s.x + (v.x * cos - v.y * sin) * s.r;
          const py = s.y + (v.x * sin + v.y * cos) * s.r;
          if (i) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      naveCaratula(960, 800, 84, 0, haloCaratula(CARATULA_AZUL));
    } else if (c.n === 6) {
      const L = CARATULA_LLEGADA;
      dibujarAgujero(1306, 470, giroAgujero, 1.25, 1);
      ctx.drawImage(c.humo, 0, 0, 1920, 1080);
      naveCaratula(L.x, L.y, L.alto, c.rot, haloCaratula(CARATULA_AZUL, 0.8));
    } else if (c.n === 9) {
      const O = CARATULA_ORBITA;
      ctx.save();
      avanzarBocanadas(c.humo, dt, true);
      ctx.restore();
      dibujarAgujero(O.x, O.y, giroAgujero, 1.5, 1);
      naveCaratula(c.x, c.y, O.alto, c.rot, haloCaratula(CARATULA_AZUL, 0.8));
    } else if (c.n === 11) {
      const L = CARATULA_LINTERNA;
      // La luz respira apenas.
      const respira = 1 + 0.06 * Math.sin(t * 1.3);
      const luz = ctx.createRadialGradient(L.x, L.y, 0, L.x, L.y, L.radio * respira);
      luz.addColorStop(0, `rgba(${CARATULA_LUZ}, 0.11)`);
      luz.addColorStop(0.5, `rgba(${CARATULA_LUZ}, 0.05)`);
      luz.addColorStop(1, `rgba(${CARATULA_LUZ}, 0)`);
      ctx.fillStyle = luz;
      ctx.fillRect(0, 0, 1920, 1080);
      // Piedras negras que tapan la luz; el borde se ve según cuánta luz les
      // llega.
      ctx.lineJoin = "round";
      ctx.lineWidth = 1.6;
      ctx.fillStyle = "#000";
      for (const s of c.rocas) {
        const d = Math.hypot(s.x - L.x, s.y - L.y);
        const alfa = 0.9 * Math.max(0, Math.min(1, (L.radio * 1.2 * respira - d) / 200));
        if (alfa <= 0.01) continue;
        const cos = Math.cos(s.ang);
        const sin = Math.sin(s.ang);
        ctx.strokeStyle = `rgba(${CARATULA_LUZ}, ${alfa.toFixed(3)})`;
        ctx.beginPath();
        s.verts.forEach((v, i) => {
          const px = s.x + (v.x * cos - v.y * sin) * s.r;
          const py = s.y + (v.x * sin + v.y * cos) * s.r;
          if (i) ctx.lineTo(px, py);
          else ctx.moveTo(px, py);
        });
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
      naveCaratula(L.x, L.y, L.alto, L.rot, haloCaratula(CARATULA_LUZ, 0.8));
    } else if (c.n === 13) {
      // La Estrella de la Muerte (el dibujo de la nave sin los motores de
      // abajo), grande y apenas visible. En el dibujo (406x600) la esfera
      // tiene el centro en (203, 239) y mide 306 de ancho.
      const E = CARATULA_ESTRELLA;
      const k = (E.radio * 2) / 306;
      ctx.save();
      ctx.beginPath();
      ctx.arc(E.x, E.y, E.radio + 4, 0, Math.PI * 2);
      ctx.clip();
      ctx.globalAlpha = E.alfa;
      ctx.drawImage(c.estrella, E.x - 203 * k, E.y - 239 * k, 406 * k, 600 * k);
      ctx.restore();
      // El TIE: su dibujo con el fuego de este cuadro, mirando a la Estrella.
      const lt = c.lienzoTie.getContext("2d");
      lt.clearRect(0, 0, 203, 300);
      lt.drawImage(lienzoFuegoRival, 0, 0);
      lt.drawImage(c.tie, 0, 0, 203, 300);
      const T = CARATULA_TIE;
      naveCaratula(T.x, T.y, T.alto, rumbo(E.x - T.x, E.y - T.y), haloCaratula(CARATULA_ROJO), c.lienzoTie);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // --- El selector de naves --------------------------------------------------------
  // Contra la PC, con dos jugadores y online, después de elegir el modo y antes
  // de las instrucciones: "Elegí tu nave", estilo arcade (las maquetas están en
  // naves/). Debajo de la nave grande, una cinta infinita con los retratos de
  // todas las naves y "al azar": la elegida queda siempre en el medio, con el
  // marco del color del jugador ("1P" azul, "2P" rojo, "PC"), y la cinta corre
  // al cambiar. Arriba se la ve grande, con su halo y su fuego. Al elegir otra,
  // esa sale de su retrato y viene hacia el frente: crece y navega hasta su
  // lugar y, un momento después, sale a volar sola por la pantalla (como con
  // el mouse encima, ver actualizarVueloSel); la anterior se achica y se apaga
  // volviendo a su retrato desde donde esté. "Al azar"
  // (nave o fuego) se sortea al jugar. Con un jugador: A/D o las flechas de
  // los costados cambian de nave, W/S o las de arriba y abajo cambian el fuego
  // (hay "sin fuego"), E, enter o espacio siguen y Escape vuelve (con el
  // joystick: la cruceta o el stick, A y B). Contra la PC, después de la tuya
  // se elige la de la PC (arranca en "al azar"), con las mismas teclas; Escape
  // vuelve a la tuya. Con dos jugadores cada uno tiene su nave grande y su
  // cinta (el 1 a la izquierda con WASD y E, el 2 a la derecha con las flechas
  // y enter; el joystick, del que lo tenga en el juego: ver
  // actualizarControles); cada uno dice "listo" y, cuando están los dos,
  // arranca. Se dibuja en el canvas, en
  // 1920x1080 como las carátulas (ver transformarCaratula). Todas las naves
  // vuelan igual: lo dice abajo.
  let selector = null; // abierto: { modo, lados: [...], pc, estrellas, t, ... }
  let navesElegidas = null; // modo para el que ya se eligió (ver elegirModo)
  const SEL_AZUL = "90, 169, 255";
  const SEL_ROJO = "255, 90, 90";
  const SEL_LLEGA = 0.6; // s que tarda la elegida en venir desde su retrato
  const SEL_VUELVE = 0.3; // s que tarda la anterior en volver al suyo
  const SEL_RETRATO = { ancho: 84, alto: 100, sep: 10 }; // los de la cinta
  const SEL_CORRE = 10; // qué tan rápido corre la cinta hasta la elegida (1/s)
  const SEL_ACOMODA = 7; // qué tan rápido va la nave grande a su lugar si cambia (1/s)
  const SEL_AZAR_CADA = 0.14; // s que se ve cada nave (o fuego) en "al azar"
  const SEL_SALE_A_VOLAR = 0.5; // s que se queda en su lugar antes de salir a volar
  const SEL_ARRANCA = 0.5; // s entre que están los dos listos y arranca
  // En la cinta y en los fuegos, "al azar" va después del último: su índice
  // es el largo de la lista.
  const selNaves = () => NAVES_JUEGO.length + 1;
  const selFuegos = () => FUEGOS.length + 1;
  const azarNave = (i) => i >= NAVES_JUEGO.length;
  const azarFuego = (i) => i >= FUEGOS.length;

  // Un lado del selector: quién elige, con qué color y etiqueta.
  function ladoSel(nave, fuego, rgb, etiqueta) {
    return {
      nave, // índice en NAVES_JUEGO (o azarNave)
      fuego, // índice en FUEGOS (o azarFuego)
      pos: nave, // dónde va la cinta (corre suave hasta nave)
      llega: 0, // 0 a 1: la elegida viniendo desde su retrato (ver SEL_LLEGA)
      sale: null, // { nave, t, x, y, alto, rot }: la anterior volviendo al suyo
      pose: null, // dónde se dibujó la elegida el último cuadro
      lugar: null, // { x, y, alto }: dónde va la nave grande (se acomoda suave)
      enLugar: 0, // s que lleva en su lugar desde que llegó (ver SEL_SALE_A_VOLAR)
      borde: null, // por dónde vuela (su mitad de la pantalla con dos lados)
      listo: false,
      rgb,
      etiqueta,
      llama: { nivel: 0, fase: Math.random() * 10 },
      lienzoLlama: Object.assign(document.createElement("canvas"), { width: 203, height: 300 }),
      lienzoNave: Object.assign(document.createElement("canvas"), { width: 203, height: 300 }),
      vuelo: { modo: null, nave: 0 }, // la nave volando con el mouse encima (ver actualizarVueloSel)
    };
  }

  function abrirSelector(m) {
    const guardada = naveGuardada();
    const indice = (lista, id) => (id === AZAR ? lista.length : lista.findIndex((x) => x.id === id));
    const lado = (j, rgb, etiqueta) =>
      ladoSel(indice(NAVES_JUEGO, guardada[j].nave), indice(FUEGOS, guardada[j].fuego), rgb, etiqueta);
    const lados = m === "dos" ? [lado("j1", SEL_AZUL, "1P"), lado("j2", SEL_ROJO, "2P")] : [lado("j1", SEL_AZUL, "1P")];
    const gp = primerJoystick();
    selector = {
      modo: m,
      lados,
      pc: false, // contra la PC: eligiendo la de la PC (lados[1])
      estrellas: crearEstrellasCaratula(),
      t: 0,
      arranca: null,
      pad: gp ? leerPadSelector(gp) : null,
    };
    if (modoEl) modoEl.hidden = true;
  }

  // Contra la PC, después de la tuya: la de la PC, arrancando en "al azar".
  function abrirPasoPC() {
    const s = selector;
    s.lados[0].listo = true;
    s.lados.push(ladoSel(NAVES_JUEGO.length, FUEGOS.length, SEL_ROJO, "PC"));
    s.pc = true;
  }
  function cerrarPasoPC() {
    const s = selector;
    s.lados.pop();
    s.lados[0].listo = false;
    s.pc = false;
  }

  function cerrarSelector(jugar) {
    const s = selector;
    selector = null;
    if (!jugar) {
      // Vuelve al menú, como estaba.
      if (modoEl) modoEl.hidden = false;
      sincronizarPadMenu();
      return;
    }
    const eleccionDe = (l) => ({
      nave: azarNave(l.nave) ? AZAR : NAVES_JUEGO[l.nave].id,
      fuego: azarFuego(l.fuego) ? AZAR : FUEGOS[l.fuego].id,
    });
    const eleccion = naveGuardada();
    eleccion.j1 = eleccionDe(s.lados[0]);
    if (s.modo === "dos") eleccion.j2 = eleccionDe(s.lados[1]);
    guardarNaves(eleccion);
    aplicarNaveJugador(eleccion.j1);
    if (s.modo === "dos") aplicarNaveRival(eleccion.j2);
    if (s.modo === "pc") eleccionPC = eleccionDe(s.lados[1]);
    navesElegidas = s.modo;
    sonarMenu("seleccion");
    sincronizarPadMenu();
    elegirModo(s.modo);
  }

  // Una acción de un jugador (i: 0 el 1, 1 el 2): "arriba", "abajo",
  // "izquierda", "derecha", "ok" o "volver". Eligiendo la de la PC, todo es
  // para ella.
  function accionSelector(i, accion) {
    const s = selector;
    if (s && s.pc) i = 1;
    const l = s && s.lados[i];
    if (!l) return;
    if (accion === "volver") {
      if (s.pc) {
        cerrarPasoPC();
        sonarMenu("selector");
      } else cerrarSelector(false);
      return;
    }
    if (accion === "ok") {
      if (s.modo === "dos") {
        l.listo = !l.listo;
        sonarMenu(l.listo ? "seleccion" : "selector");
      } else if (s.modo === "pc" && !s.pc) {
        abrirPasoPC();
        sonarMenu("seleccion");
      } else cerrarSelector(true);
      return;
    }
    if (l.listo) return; // listo: no cambia hasta que se saque el listo
    if (accion === "arriba" || accion === "abajo") {
      const paso = accion === "abajo" ? 1 : -1;
      l.fuego = (l.fuego + paso + selFuegos()) % selFuegos();
    } else {
      const paso = accion === "derecha" ? 1 : -1;
      cambiarNaveSel(l, (l.nave + paso + selNaves()) % selNaves());
    }
    sonarMenu("selector");
  }

  // Cambia la nave de un lado: la que estaba vuelve a su retrato desde donde
  // iba (volando o en su lugar) y la nueva sale del suyo.
  function cambiarNaveSel(l, nueva) {
    const v = l.vuelo;
    if (v.modo) {
      l.sale = { nave: l.nave, t: 0, x: v.x, y: v.y, alto: medidasSel().altoNave[0], rot: v.rot };
      v.modo = null;
    } else if (l.pose) l.sale = { nave: l.nave, t: 0, ...l.pose };
    l.nave = nueva;
    l.llega = 0;
  }

  // Con el dedo (o el mouse): tocar un retrato o un fuego lo elige, deslizar
  // de costado corre la cinta de ese lado y los botones de abajo (en el
  // celular) siguen o vuelven. Lo que se puede tocar lo anota cada cuadro el
  // dibujo (zonaSel), en 1920x1080.
  let selToque = null; // { id, x, y }: el dedo que se apoyó
  function zonaSel(x, y, w, h, hacer) {
    selector.zonas.push({ x, y, w, h, hacer });
  }
  document.addEventListener("pointerdown", (ev) => {
    if (selector) selToque = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
  });
  document.addEventListener("pointerup", (ev) => {
    const s = selector;
    const t = selToque;
    selToque = null;
    if (!s || !t || t.id !== ev.pointerId || !s.zonas) return;
    const { u, ox, oy } = medidaCaratula();
    const x = (ev.clientX - ox) / u;
    const y = (ev.clientY - oy) / u;
    const dx = ev.clientX - t.x;
    const dy = ev.clientY - t.y;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.5) {
      // Deslizó: la cinta corre para ese lado (hacia la izquierda, la de la
      // derecha pasa al medio).
      const i = s.lados.length === 1 || s.pc ? s.lados.length - 1 : x < 960 ? 0 : 1;
      accionSelector(i, dx < 0 ? "derecha" : "izquierda");
      return;
    }
    for (let k = s.zonas.length - 1; k >= 0; k--) {
      const z = s.zonas[k];
      if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) {
        z.hacer();
        return;
      }
    }
  });
  function tocarRetratoSel(i, j) {
    const l = selector.lados[i];
    if (l.listo || j === l.nave) return;
    cambiarNaveSel(l, j);
    sonarMenu("selector");
  }
  function tocarFuegoSel(i, j) {
    const l = selector.lados[i];
    if (l.listo || j === l.fuego) return;
    l.fuego = j;
    sonarMenu("selector");
  }

  // Las teclas del selector (ver el keydown): true si la usó.
  const SEL_TECLAS_UNO = {
    KeyW: "arriba", ArrowUp: "arriba", KeyS: "abajo", ArrowDown: "abajo",
    KeyA: "izquierda", ArrowLeft: "izquierda", KeyD: "derecha", ArrowRight: "derecha",
    KeyE: "ok", Enter: "ok", NumpadEnter: "ok", Space: "ok",
  };
  const SEL_TECLAS_J1 = { KeyW: "arriba", KeyS: "abajo", KeyA: "izquierda", KeyD: "derecha", KeyE: "ok" };
  const SEL_TECLAS_J2 = {
    ArrowUp: "arriba", ArrowDown: "abajo", ArrowLeft: "izquierda", ArrowRight: "derecha",
    Enter: "ok", NumpadEnter: "ok",
  };
  function teclaSelector(ev) {
    if (ev.code === "Escape" || ev.code === "Backspace") {
      accionSelector(0, "volver");
      return;
    }
    if (ev.repeat && /Enter|KeyE|Space/.test(ev.code)) return;
    if (selector.modo !== "dos") {
      if (SEL_TECLAS_UNO[ev.code]) accionSelector(0, SEL_TECLAS_UNO[ev.code]);
    } else {
      // Con los lados dados vuelta en el menú (y sin joystick) las flechas son
      // del 1 y WASD del 2, como en el juego (tecladoAlReves).
      const alReves = controlesCambiados && !primerJoystick();
      if (SEL_TECLAS_J1[ev.code]) accionSelector(alReves ? 1 : 0, SEL_TECLAS_J1[ev.code]);
      else if (SEL_TECLAS_J2[ev.code]) accionSelector(alReves ? 0 : 1, SEL_TECLAS_J2[ev.code]);
    }
    ev.preventDefault();
  }

  // El joystick: la cruceta o el stick, A y B, contando solo lo recién
  // apretado. Con dos jugadores es del 2, salvo que se hayan cambiado los
  // lados en el menú (como en el juego).
  function leerPadSelector(gp) {
    const joy = leerJoystick();
    return {
      arriba: joy.teclas.has("up"),
      abajo: joy.teclas.has("down"),
      izquierda: joy.teclas.has("left"),
      derecha: joy.teclas.has("right"),
      ok: botonPad(gp, PAD_A),
      volver: botonPad(gp, PAD_B),
    };
  }
  function padSelector() {
    const s = selector;
    const gp = primerJoystick();
    if (!gp) {
      s.pad = null;
      return;
    }
    const ahora = leerPadSelector(gp);
    const antes = s.pad || ahora;
    s.pad = ahora;
    const i = s.modo === "dos" && !controlesCambiados ? 1 : 0;
    for (const accion of ["arriba", "abajo", "izquierda", "derecha", "ok", "volver"])
      if (ahora[accion] && !antes[accion]) {
        accionSelector(i, accion);
        if (!selector) return; // se cerró
      }
  }

  // Las medidas de ahora (un lado o dos: con dos jugadores y eligiendo la de
  // la PC) y el centro del lado i.
  const medidasSel = () => (selector.lados.length === 1 ? SEL_UNO : SEL_DOS);
  const centroSel = (i) => (selector.lados.length === 1 ? 960 : SEL_DOS.cx[i]);

  function actualizarSelector(dt) {
    const s = selector;
    s.t += dt;
    padSelector();
    if (!selector) return;
    const m = medidasSel();
    s.lados.forEach((l, i) => {
      l.llega = Math.min(1, l.llega + dt / SEL_LLEGA);
      l.enLugar = l.llega >= 1 ? l.enLugar + dt : 0;
      if (l.sale && (l.sale.t += dt) >= SEL_VUELVE) l.sale = null;
      // Vuela por toda la pantalla; con dos lados, cada uno por su mitad.
      // (En el celular, dentro de lo que se ve: ver SEL_RECORTE_T.)
      const b = tactil ? { ...SEL_VUELO.borde, y0: 170, y1: 720 } : SEL_VUELO.borde;
      l.borde = s.lados.length === 1 ? b : i ? { ...b, x0: 1020 } : { ...b, x1: 900 };
      // La cinta corre hasta la elegida, por el camino corto.
      l.pos += difCircular(l.nave - l.pos, selNaves()) * (1 - Math.exp(-dt * SEL_CORRE));
      // La nave grande va a su lugar (cambia al pasar de uno a dos lados).
      const meta = { x: centroSel(i), y: m.yNave, alto: m.altoNave[0] };
      if (!l.lugar) l.lugar = meta;
      const k = 1 - Math.exp(-dt * SEL_ACOMODA);
      for (const c of ["x", "y", "alto"]) l.lugar[c] += (meta[c] - l.lugar[c]) * k;
      actualizarVueloSel(l, centroSel(i), m, dt);
      // El fuego: a pleno en su lugar; volando, según lo rápido que va.
      const v = l.vuelo;
      const vel = v.modo ? 15 + Math.hypot(v.vx, v.vy) * 0.12 : 65;
      animarFuego(l.llama, l.lienzoLlama, fuegoTenido(FUEGOS[fuegoMostradoSel(l)].id), dt, vel);
    });
    if (s.modo === "dos") {
      if (s.lados.every((l) => l.listo)) {
        s.arranca = (s.arranca || 0) + dt;
        if (s.arranca >= SEL_ARRANCA) {
          cerrarSelector(true);
          return;
        }
      } else s.arranca = null;
    }
    dibujarSelector();
  }

  // La diferencia d llevada al camino más corto en una ronda de n.
  function difCircular(d, n) {
    return ((((d + n / 2) % n) + n) % n) - n / 2;
  }

  // "Al azar" muestra las naves (o los fuegos) pasando, en un orden mezclado:
  // cuál se ve ahora. Cada lado arranca en otra.
  const SEL_ORDEN_AZAR = NAVES_JUEGO.map((_, i) => i).sort(() => Math.random() - 0.5);
  function naveMostradaSel(l, i = 0) {
    if (!azarNave(l.nave)) return l.nave;
    const k = Math.floor(selector.t / SEL_AZAR_CADA) + i * 5;
    return SEL_ORDEN_AZAR[k % SEL_ORDEN_AZAR.length];
  }
  function fuegoMostradoSel(l) {
    if (!azarFuego(l.fuego)) return l.fuego;
    return Math.floor(selector.t / (SEL_AZAR_CADA * 2)) % FUEGOS.length;
  }

  function textoSel(t, x, y, tam, color, alinear = "center", espacio = 0.12) {
    ctx.font = `${tam}px Spaceport, ui-monospace, Consolas, monospace`;
    ctx.fillStyle = color;
    ctx.textAlign = alinear;
    ctx.textBaseline = "middle";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${tam * espacio}px`;
    ctx.fillText(t, x, y);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }

  // Un título que empieza con "Elegí" (t lo trae como "Elegi"), centrado en
  // y. Spaceport no tiene la í (con la tilde esa letra caería a otra fuente,
  // ver mostrarControles): se tapa el punto de la i y se le dibuja la tilde, un trazo
  // inclinado del grosor del palo de la i. Las medidas son de la i de
  // Spaceport, en fracciones del tamaño de la letra.
  function tituloSel(t, y, tam) {
    const esp = tam * 0.14;
    ctx.font = `${tam}px Spaceport, ui-monospace, Consolas, monospace`;
    ctx.textAlign = "left";
    ctx.textBaseline = "alphabetic";
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${esp}px`;
    const x0 = 960 - (ctx.measureText(t).width - esp) / 2;
    const base = y + tam * 0.375; // las mayúsculas miden 0,75: quedan centradas en y
    ctx.fillStyle = "#fff";
    ctx.fillText(t, x0, base);
    const i = x0 + ctx.measureText("Eleg").width; // donde empieza la i
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    ctx.fillStyle = "#000";
    ctx.fillRect(i + tam * 0.05, base - tam * 0.83, tam * 0.14, tam * 0.16);
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.moveTo(i + tam * 0.06, base - tam * 0.69);
    ctx.lineTo(i + tam * 0.17, base - tam * 0.69);
    ctx.lineTo(i + tam * 0.3, base - tam * 0.88);
    ctx.lineTo(i + tam * 0.19, base - tam * 0.88);
    ctx.closePath();
    ctx.fill();
  }

  // Un signo de pregunta ("al azar") de alto alto centrado en (x, y), con
  // trazos rectos como la letra del juego (Spaceport no tiene "?").
  function preguntaSel(x, y, alto, color) {
    const a = alto;
    const g = a * 0.13; // grosor
    ctx.save();
    ctx.translate(x - a * 0.3, y - a * 0.5);
    ctx.strokeStyle = color;
    ctx.fillStyle = color;
    ctx.lineWidth = g;
    ctx.lineJoin = "miter";
    ctx.lineCap = "butt";
    ctx.beginPath();
    ctx.moveTo(g / 2, a * 0.28);
    ctx.lineTo(g / 2, g / 2);
    ctx.lineTo(a * 0.6 - g / 2, g / 2);
    ctx.lineTo(a * 0.6 - g / 2, a * 0.48);
    ctx.lineTo(a * 0.3, a * 0.48);
    ctx.lineTo(a * 0.3, a * 0.72);
    ctx.stroke();
    ctx.fillRect(a * 0.3 - g / 2, a * 0.84, g, g);
    ctx.restore();
  }

  // Los retratos de la cinta: el dibujo de cada nave recortado a lo que tiene
  // dibujo, a color y apagado (se arman una vez, al estar cargado).
  const retratosSel = new Map(); // índice de la nave -> { color, gris, x, y, w, h }
  function retratoSel(i) {
    if (azarNave(i)) return null;
    let r = retratosSel.get(i);
    if (r) return r;
    const img = NAVES_JUEGO[i].img;
    if (!img.complete || !img.naturalWidth) return null;
    const c = Object.assign(document.createElement("canvas"), { width: 203, height: 300 });
    const g = c.getContext("2d");
    g.drawImage(img, 0, 0, 203, 300);
    const px = g.getImageData(0, 0, 203, 300).data;
    let x0 = 203, y0 = 300, x1 = 0, y1 = 0;
    for (let y = 0; y < 300; y++)
      for (let x = 0; x < 203; x++)
        if (px[(y * 203 + x) * 4 + 3] > 20) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
    const w = Math.max(1, x1 - x0 + 1);
    const h = Math.max(1, y1 - y0 + 1);
    const hacer = (filtro) => {
      const k = Object.assign(document.createElement("canvas"), { width: w, height: h });
      const kg = k.getContext("2d");
      kg.filter = filtro;
      kg.drawImage(c, x0, y0, w, h, 0, 0, w, h);
      return k;
    };
    r = { color: hacer("none"), gris: hacer("grayscale(0.8) brightness(0.75)"), x: x0, y: y0, w, h };
    retratosSel.set(i, r);
    return r;
  }

  // El retrato j de la cinta de un lado (centrada en cx): su caja, dónde está
  // respecto de la elegida (d, en retratos) y cómo entra el dibujo en ella
  // (esc, y dónde queda el centro de la nave entera de 203x300, para que la
  // elegida salga justo de ahí).
  function cajaRetratoSel(l, j, cx, m) {
    const R = SEL_RETRATO;
    const d = difCircular(j - l.pos, selNaves());
    const x = cx + d * (R.ancho + R.sep) - R.ancho / 2;
    const y = m.yFila;
    const ccx = x + R.ancho / 2;
    const ccy = y + R.alto / 2;
    const r = retratoSel(azarNave(j) ? naveMostradaSel(l) : j);
    if (!r) return { x, y, d, cx: ccx, cy: ccy, esc: 0.25, nx: ccx, ny: ccy };
    const esc = Math.min((R.ancho - 16) / r.w, (R.alto - 16) / r.h);
    return {
      x, y, d, cx: ccx, cy: ccy, esc,
      nx: ccx - (r.x + r.w / 2 - 101.5) * esc,
      ny: ccy - (r.y + r.h / 2 - 150) * esc,
    };
  }

  // La cinta de un lado: los retratos alrededor de la elegida, que se apagan
  // hacia los bordes, con una flechita a cada lado.
  function cintaSel(l, cx, m, i) {
    const R = SEL_RETRATO;
    const medio = m.medioCinta; // retratos que se ven a cada lado
    for (let j = 0; j < selNaves(); j++) {
      const c = cajaRetratoSel(l, j, cx, m);
      const lejos = Math.abs(c.d);
      if (lejos > medio + 0.5) continue;
      const alfa = Math.max(0, Math.min(1, medio + 0.5 - lejos));
      const elegida = j === l.nave;
      if (alfa > 0.3) zonaSel(c.x, c.y, R.ancho, R.alto, () => tocarRetratoSel(i, j));
      ctx.globalAlpha = alfa;
      ctx.beginPath();
      ctx.roundRect(c.x, c.y, R.ancho, R.alto, 8);
      ctx.fillStyle = elegida ? `rgba(${l.rgb}, 0.1)` : "rgba(255, 255, 255, 0.035)";
      ctx.fill();
      if (azarNave(j)) {
        preguntaSel(c.cx, c.cy, R.alto * 0.5, elegida ? `rgb(${l.rgb})` : "rgba(255, 255, 255, 0.6)");
      } else {
        const r = retratoSel(j);
        if (r) {
          ctx.globalAlpha = alfa * (elegida ? 1 : 0.6);
          ctx.drawImage(elegida ? r.color : r.gris, c.cx - (r.w * c.esc) / 2, c.cy - (r.h * c.esc) / 2, r.w * c.esc, r.h * c.esc);
          ctx.globalAlpha = alfa;
        }
      }
      if (!elegida) {
        ctx.beginPath();
        ctx.roundRect(c.x, c.y, R.ancho, R.alto, 8);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.22)";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      } else {
        // El marco del jugador y su etiqueta arriba.
        ctx.save();
        ctx.beginPath();
        ctx.roundRect(c.x - 1.5, c.y - 1.5, R.ancho + 3, R.alto + 3, 9);
        ctx.strokeStyle = `rgb(${l.rgb})`;
        ctx.lineWidth = 3;
        if (!calidadBaja()) {
          ctx.shadowColor = `rgba(${l.rgb}, 0.8)`;
          ctx.shadowBlur = 14 * medidaCaratula().u * dpr;
        }
        ctx.stroke();
        ctx.restore();
        etiquetaSel(l.etiqueta, c.cx, c.y - 16, l.rgb);
      }
      ctx.globalAlpha = 1;
    }
    // Las flechitas: se puede seguir para los dos lados sin fin.
    const a = (medio + 0.95) * (R.ancho + R.sep);
    for (const dir of [-1, 1]) {
      const x = cx + dir * a;
      const y = m.yFila + R.alto / 2;
      zonaSel(x - 30, y - 40, 60, 80, () => accionSelector(i, dir > 0 ? "derecha" : "izquierda"));
      ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
      ctx.beginPath();
      ctx.moveTo(x + dir * 7, y);
      ctx.lineTo(x - dir * 5, y - 8);
      ctx.lineTo(x - dir * 5, y + 8);
      ctx.closePath();
      ctx.fill();
    }
  }
  function etiquetaSel(t, x, y, rgb) {
    ctx.beginPath();
    ctx.roundRect(x - 17, y - 10, 34, 20, 5);
    ctx.fillStyle = `rgb(${rgb})`;
    ctx.fill();
    textoSel(t, x, y + 1, 13, "#000", "center", 0.05);
  }

  const suave = (p) => 1 - Math.pow(1 - p, 3);
  // Crece pasándose un poquito y vuelve (como si frenara al llegar).
  const conRebote = (p) => 1 + 2.4 * Math.pow(p - 1, 3) + 1.4 * Math.pow(p - 1, 2);

  // La nave grande de un lado, con su fuego y su halo; o, si recién la
  // eligieron, viniendo desde su retrato: crece y navega hacia el frente (con
  // la nariz hacia donde va). Antes, la anterior volviendo al suyo.
  function grandeSel(l, i, cx, m) {
    const s = selector;
    if (l.sale) {
      const q = Math.min(1, l.sale.t / SEL_VUELVE);
      const e = q * q * q;
      const c = cajaRetratoSel(l, l.sale.nave, cx, m);
      naveGrandeSel(
        l, l.sale.nave,
        l.sale.x + (c.nx - l.sale.x) * e,
        l.sale.y + (c.ny - l.sale.y) * e,
        l.sale.alto + (300 * c.esc - l.sale.alto) * e,
        l.sale.rot * (1 - e), 0, 1 - q, false, i,
      );
    }
    const c = cajaRetratoSel(l, l.nave, cx, m);
    const p = l.llega;
    const e = suave(p);
    const lugar = l.lugar || { x: cx, y: m.yNave, alto: m.altoNave[0] };
    const x = lugar.x;
    const y = lugar.y + Math.sin(s.t * 1.6 + i) * 4 * e;
    const pose = {
      x: c.nx + (x - c.nx) * e,
      y: c.ny + (y - c.ny) * e,
      alto: 300 * c.esc + (lugar.alto - 300 * c.esc) * conRebote(p),
      rot: rumbo(x - c.nx, y - c.ny) * Math.sin(Math.PI * p),
    };
    l.pose = pose;
    if (l.vuelo.modo) return; // está volando (ver dibujarVueloSel)
    naveGrandeSel(l, l.nave, pose.x, pose.y, pose.alto, pose.rot, e, 1, true, i);
  }

  // Una nave de 203x300 centrada en (x, y), girada rot grados, con el halo
  // del jugador (halo de 0 a 1) y, si fuego, con su fuego. "Al azar": las
  // naves pasando, tenues, con un signo de pregunta adelante.
  function naveGrandeSel(l, n, x, y, alto, rot, halo, alfa, fuego, i) {
    const azar = azarNave(n);
    const img = NAVES_JUEGO[azar ? naveMostradaSel(l, i) : n].img;
    if (!img.complete || !img.naturalWidth || alfa <= 0) return;
    const ancho = (alto * 203) / 300;
    let dibujo = img;
    if (fuego) {
      const c = l.lienzoNave.getContext("2d");
      c.clearRect(0, 0, 203, 300);
      c.drawImage(l.lienzoLlama, 0, 0);
      c.drawImage(img, 0, 0, 203, 300);
      dibujo = l.lienzoNave;
    }
    ctx.save();
    ctx.globalAlpha = alfa * (azar ? 0.35 : 1);
    ctx.translate(x, y);
    ctx.rotate((rot * Math.PI) / 180);
    const k = medidaCaratula().u * dpr;
    const brillo = (h) =>
      calidadBaja()
        ? `drop-shadow(0 0 ${4 * k}px rgba(${l.rgb}, ${0.95 * h}))`
        : `drop-shadow(0 0 ${4 * k}px rgba(${l.rgb}, ${0.95 * h})) drop-shadow(0 0 ${12 * k}px rgba(${l.rgb}, ${0.5 * h}))`;
    if (halo > 0.01 && !azar) ctx.filter = brillo(halo);
    ctx.drawImage(dibujo, -ancho / 2, -alto / 2, ancho, alto);
    if (azar) {
      ctx.globalAlpha = alfa;
      if (halo > 0.01) ctx.filter = brillo(halo);
      preguntaSel(0, -alto * 0.05, alto * 0.42, `rgb(${l.rgb})`);
    }
    ctx.restore();
  }

  // El ícono de un fuego: su llama, recortada del dibujo ("sin fuego": un
  // círculo tachado; "al azar": un signo de pregunta).
  function fuegoSel(f, x, y, alto, alfa) {
    if (azarFuego(f)) {
      preguntaSel(x, y, alto * 0.62, `rgba(255, 255, 255, ${alfa * 0.85})`);
      return;
    }
    if (FUEGOS[f].id === "ninguno") {
      const r = alto * 0.26;
      ctx.strokeStyle = `rgba(255, 255, 255, ${alfa * 0.85})`;
      ctx.lineWidth = Math.max(1.5, alto * 0.07);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.moveTo(x - r * 0.7, y + r * 0.7);
      ctx.lineTo(x + r * 0.7, y - r * 0.7);
      ctx.stroke();
      return;
    }
    const fuente = fuegoTenido(FUEGOS[f].id);
    if (!fuente) return;
    const ancho = (alto * FUEGO_W) / (FUEGO_BOTTOM - FUEGO_TOP);
    ctx.globalAlpha = alfa;
    ctx.drawImage(fuente, FUEGO_X, FUEGO_TOP, FUEGO_W, FUEGO_BOTTOM - FUEGO_TOP, x - ancho / 2, y - alto / 2, ancho, alto);
    ctx.globalAlpha = 1;
  }

  // La fila de fuegos de un lado: "fuego", todos (el elegido más grande, "al
  // azar" al final) y su nombre.
  function fuegosSel(l, cx, y, tam, i) {
    const n = selFuegos();
    const paso = tam * 2.5;
    const x0 = cx - ((n - 1) * paso) / 2;
    const nombre = azarFuego(l.fuego) ? "al azar" : FUEGOS[l.fuego].nombre;
    textoSel("fuego", x0 - paso * 0.9, y, tam, "rgba(255, 255, 255, 0.55)", "right");
    textoSel(nombre, x0 + (n - 1) * paso + paso * 0.9, y, tam, "rgba(255, 255, 255, 0.85)", "left");
    for (let j = 0; j < n; j++) {
      const elegido = j === l.fuego;
      fuegoSel(j, x0 + j * paso, y, elegido ? tam * 2 : tam * 1.1, elegido ? 1 : 0.5);
      zonaSel(x0 + j * paso - paso / 2, y - tam * 1.4, paso, tam * 2.8, () => tocarFuegoSel(i, j));
    }
  }

  // En el celular, en vez de las teclas: botones para tocar (items: { texto,
  // hacer, rgb? }), en fila y centrados en y.
  function botonesSel(items, y) {
    const tam = 22;
    const alto = 64;
    const sep = 36;
    ctx.font = `${tam}px Spaceport, ui-monospace, Consolas, monospace`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = `${tam * 0.14}px`;
    const anchos = items.map((b) => ctx.measureText(b.texto).width + 56);
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    let x = 960 - (anchos.reduce((a, b) => a + b, 0) + sep * (items.length - 1)) / 2;
    items.forEach((b, k) => {
      const w = anchos[k];
      const rgb = b.rgb || "255, 255, 255";
      ctx.beginPath();
      ctx.roundRect(x, y - alto / 2, w, alto, 8);
      ctx.fillStyle = `rgba(${rgb}, 0.08)`;
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb}, 0.7)`;
      ctx.lineWidth = 2;
      ctx.stroke();
      textoSel(b.texto, x + w / 2, y + 1, tam, `rgb(${rgb})`, "center", 0.14);
      zonaSel(x, y - alto / 2, w, alto, b.hacer);
      x += w + sep;
    });
  }

  const nombreSel = (l) => (azarNave(l.nave) ? "al azar" : NAVES_JUEGO[l.nave].nombre);

  // Las teclas de abajo: cajitas con la tecla y lo que hace.
  function ayudaSel(items, y) {
    const tam = 15;
    ctx.font = `${tam}px Spaceport, ui-monospace, Consolas, monospace`;
    if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
    const caja = (t) => Math.max(26, ctx.measureText(t).width + 12);
    const medidas = items.map(({ teclas, texto }) => {
      const cajas = teclas.map(caja);
      return { cajas, ancho: cajas.reduce((a, b) => a + b + 5, 0) + 6 + ctx.measureText(texto).width };
    });
    const sep = 34;
    let x = 960 - (medidas.reduce((a, m) => a + m.ancho, 0) + sep * (items.length - 1)) / 2;
    items.forEach(({ teclas, texto }, i) => {
      teclas.forEach((t, k) => {
        const w = medidas[i].cajas[k];
        ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(x, y - 13, w, 26, 4);
        ctx.stroke();
        textoSel(t, x + w / 2, y + 1, 14, "rgba(255, 255, 255, 0.7)", "center", 0.05);
        x += w + 5;
      });
      textoSel(texto, x + 3, y + 1, tam, "rgba(255, 255, 255, 0.6)", "left", 0.12);
      ctx.font = `${tam}px Spaceport, ui-monospace, Consolas, monospace`;
      if ("letterSpacing" in ctx) ctx.letterSpacing = "3px";
      x += 6 + ctx.measureText(texto).width + sep;
    });
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
  }

  // La nave elegida (la grande), un momento después de llegar a su lugar,
  // sale a volar sola con su fuego: va a puntos al azar de la pantalla (con
  // dos lados, de su mitad) y en cada uno frena, gira y mira a la flechita
  // del mouse. Al cambiar de nave vuelve a su retrato desde donde iba (ver
  // accionSelector); con "listo" vuelve a su lugar. Todo en 1920x1080, como el
  // resto del selector.
  const SEL_VUELO = {
    vel: 900, // px/s como mucho, volando
    agil: 3, // qué tan rápido corrige hacia donde quiere ir (1/s)
    frena: 260, // px antes del punto desde los que va frenando
    mira: [0.7, 1.5], // s que se queda mirando al mouse en cada punto
    sale: 2600, // px/s al irse
    entra: 1400, // px/s al entrar
    borde: { x0: 140, x1: 1780, y0: 140, y1: 940 }, // adónde puede ir
  };
  let selMouse = null; // { x, y } en pantalla, o null si no está sobre la página
  document.addEventListener("mousemove", (ev) => {
    selMouse = { x: ev.clientX, y: ev.clientY };
  });
  document.addEventListener("mouseleave", () => {
    selMouse = null;
  });

  // El mouse en 1920x1080, o null.
  function mouseSel() {
    if (!selMouse) return null;
    const { u, ox, oy } = medidaCaratula();
    return { x: (selMouse.x - ox) / u, y: (selMouse.y - oy) / u };
  }

  function puntoAlAzarSel(l) {
    const b = (l && l.borde) || SEL_VUELO.borde;
    return {
      x: b.x0 + Math.random() * (b.x1 - b.x0),
      y: b.y0 + Math.random() * (b.y1 - b.y0),
    };
  }

  // Gira rot (grados) hacia meta, un poco por cuadro, por el camino corto.
  function girarSel(rot, meta, dt, rapidez = 6) {
    let d = meta - rot;
    d = ((((d + 180) % 360) + 360) % 360) - 180;
    return rot + d * (1 - Math.exp(-dt * rapidez));
  }

  // v: el vuelo de un lado; cx, m: dónde está su lugar (la nave grande).
  function actualizarVueloSel(l, cx, m, dt) {
    const v = l.vuelo;
    if (azarNave(l.nave)) {
      v.modo = null; // "al azar" no vuela
      return;
    }
    const mouse = mouseSel();
    // Sale a volar sola un momento después de llegar, como si tuviera el
    // mouse encima; con "listo" vuelve a su lugar.
    const hover = !l.listo && l.enLugar >= SEL_SALE_A_VOLAR;
    const lugar = { x: cx, y: m.yNave };
    if (!v.modo) {
      v.nave = l.nave;
      if (!hover) return;
      Object.assign(v, { modo: "vuela", x: cx, y: m.yNave, vx: 0, vy: 0, rot: 0, meta: puntoAlAzarSel(l), mira: 0 });
    }
    // Cambió la nave: la que vuela se va (y después entra la otra).
    if (v.nave !== l.nave && v.modo !== "sale") v.modo = "sale";
    if (v.modo === "sale") {
      let dx = v.x - 960;
      let dy = v.y - 540;
      const d = Math.hypot(dx, dy) || 1;
      dx /= d;
      dy /= d;
      v.vx += (dx * SEL_VUELO.sale - v.vx) * (1 - Math.exp(-dt * 8));
      v.vy += (dy * SEL_VUELO.sale - v.vy) * (1 - Math.exp(-dt * 8));
      v.x += v.vx * dt;
      v.y += v.vy * dt;
      v.rot = girarSel(v.rot, rumbo(v.vx, v.vy), dt, 12);
      if (v.x < -250 || v.x > 2170 || v.y < -250 || v.y > 1330) {
        // Afuera: entra la nueva desde un borde al azar, derecho hacia adentro.
        v.nave = l.nave;
        const lado = Math.floor(Math.random() * 4);
        const p = puntoAlAzarSel(l);
        v.x = lado === 0 ? -200 : lado === 1 ? 2120 : p.x;
        v.y = lado === 2 ? -200 : lado === 3 ? 1280 : p.y;
        v.meta = hover ? puntoAlAzarSel(l) : lugar;
        const ex = v.meta.x - v.x;
        const ey = v.meta.y - v.y;
        const e = Math.hypot(ex, ey) || 1;
        v.vx = (ex / e) * SEL_VUELO.entra;
        v.vy = (ey / e) * SEL_VUELO.entra;
        v.rot = rumbo(v.vx, v.vy);
        v.mira = 0;
        v.modo = hover ? "vuela" : "vuelve";
      }
      return;
    }
    if (hover && v.modo === "vuelve") {
      v.modo = "vuela";
      v.meta = puntoAlAzarSel(l);
    } else if (!hover && v.modo === "vuela") {
      v.modo = "vuelve";
    }
    const meta = v.modo === "vuelve" ? lugar : v.meta;
    const dx = meta.x - v.x;
    const dy = meta.y - v.y;
    const d = Math.hypot(dx, dy);
    // Va hacia el punto y frena al llegar.
    const quiere = Math.min(SEL_VUELO.vel, (SEL_VUELO.vel * d) / SEL_VUELO.frena);
    const qx = d > 0.5 ? (dx / d) * quiere : 0;
    const qy = d > 0.5 ? (dy / d) * quiere : 0;
    const k = 1 - Math.exp(-dt * SEL_VUELO.agil);
    v.vx += (qx - v.vx) * k;
    v.vy += (qy - v.vy) * k;
    v.x += v.vx * dt;
    v.y += v.vy * dt;
    const rapidez = Math.hypot(v.vx, v.vy);
    if (v.modo === "vuelve") {
      // De vuelta en su lugar, mirando para arriba: se queda ahí.
      v.rot = girarSel(v.rot, rapidez > 80 ? rumbo(v.vx, v.vy) : 0, dt);
      const derecha = ((((v.rot % 360) + 540) % 360) - 180);
      if (d < 4 && rapidez < 30 && Math.abs(derecha) < 3) v.modo = null;
      return;
    }
    if (d < 24 && rapidez < 120) {
      // Llegó: mira a la flechita un rato y elige otro punto.
      if (!v.mira)
        v.mira = SEL_VUELO.mira[0] + Math.random() * (SEL_VUELO.mira[1] - SEL_VUELO.mira[0]);
      v.mira -= dt;
      if (mouse) v.rot = girarSel(v.rot, rumbo(mouse.x - v.x, mouse.y - v.y), dt);
      if (v.mira <= 0) {
        v.mira = 0;
        v.meta = puntoAlAzarSel(l);
      }
    } else {
      v.rot = girarSel(v.rot, rumbo(v.vx, v.vy), dt);
    }
  }

  // La nave que vuela, encima de todo, con su fuego y su halo.
  function dibujarVueloSel(l, m) {
    const v = l.vuelo;
    if (!v.modo) return;
    const img = imgDeNave(NAVES_JUEGO[v.nave], v);
    if (!img.complete || !img.naturalWidth) return;
    const alto = m.altoNave[0];
    const ancho = (alto * 203) / 300;
    const c = l.lienzoNave.getContext("2d");
    c.clearRect(0, 0, 203, 300);
    c.drawImage(l.lienzoLlama, 0, 0);
    c.drawImage(img, 0, 0, 203, 300);
    const k = medidaCaratula().u * dpr;
    ctx.save();
    ctx.translate(v.x, v.y);
    ctx.rotate((v.rot * Math.PI) / 180);
    ctx.filter = calidadBaja()
      ? `drop-shadow(0 0 ${4 * k}px rgba(${l.rgb}, 0.95))`
      : `drop-shadow(0 0 ${4 * k}px rgba(${l.rgb}, 0.95)) drop-shadow(0 0 ${12 * k}px rgba(${l.rgb}, 0.5))`;
    ctx.drawImage(l.lienzoNave, -ancho / 2, -alto / 2, ancho, alto);
    ctx.restore();
  }

  // Medidas (en 1920x1080) al tamaño del menú principal: letras de 16 a 22
  // px y todo en un bloque centrado. yFila: arriba de la cinta; medioCinta:
  // retratos que se ven a cada lado de la elegida.
  // En el celular, más juntas (y el selector se acerca a lo que ocupan:
  // SEL_RECORTE_T, ver medidaCaratula), con los botones de abajo.
  const SEL_UNO = tactil
    ? {
        yTitulo: 150, ySub: 186,
        yNave: 330, altoNave: [200], yNombre: 460, tamNombre: 24,
        yFuego: 510, tamFuego: 18, yFila: 552, medioCinta: 4.5, yNota: 686, yAyuda: 748,
      }
    : {
        yTitulo: 200, ySub: 236,
        yNave: 405, altoNave: [260], yNombre: 580, tamNombre: 22,
        yFuego: 635, tamFuego: 17, yFila: 700, medioCinta: 4.5, yNota: 850, yAyuda: 905,
      };
  const SEL_DOS = tactil
    ? {
        yTitulo: 130, cx: [560, 1360], yJ: 185,
        yNave: 300, altoNave: [180], yNombre: 420, tamNombre: 22,
        yFuego: 468, tamFuego: 17, yEstado: 512, yFila: 548, medioCinta: 2.8, yNota: 684, yAyuda: 748,
      }
    : {
        yTitulo: 165, cx: [560, 1360], yJ: 240,
        yNave: 375, altoNave: [220], yNombre: 525, tamNombre: 20,
        yFuego: 580, tamFuego: 16, yEstado: 638, yFila: 715, medioCinta: 2.8, yNota: 862, yAyuda: 915,
      };
  const SEL_RECORTE_T = { ancho: 1520, y0: 100, y1: 792 };

  function dibujarSelector() {
    const s = selector;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    dibujarEstrellasCaratula(s.estrellas, s.t * 3 * medidaCaratula().u, 0);
    transformarCaratula();
    s.zonas = [];
    const gris = "rgba(255, 255, 255, 0.45)";
    const nota = () => textoSel("todas con la misma velocidad y el mismo impacto", 960, medidasSel().yNota, 15, gris);
    if (s.lados.length === 1) {
      const m = SEL_UNO;
      const l = s.lados[0];
      tituloSel("Elegi tu nave", m.yTitulo, 30);
      textoSel(s.modo === "online" ? "online" : "contra la PC", 960, m.ySub, 16, "rgba(255, 255, 255, 0.55)");
      textoSel(nombreSel(l), 960, m.yNombre, m.tamNombre, "#fff");
      fuegosSel(l, 960, m.yFuego, m.tamFuego, 0);
      cintaSel(l, 960, m, 0);
      nota();
      if (tactil)
        botonesSel([
          { texto: "volver", hacer: () => accionSelector(0, "volver") },
          { texto: s.modo === "pc" ? "seguir" : "jugar", rgb: l.rgb, hacer: () => accionSelector(0, "ok") },
        ], m.yAyuda);
      else
        ayudaSel([
          { teclas: ["A", "D"], texto: "nave" },
          { teclas: ["W", "S"], texto: "fuego" },
          { teclas: ["E"], texto: s.modo === "pc" ? "seguir" : "jugar" },
          { teclas: ["esc"], texto: "volver" },
        ], m.yAyuda);
      grandeSel(l, 0, 960, m);
      dibujarVueloSel(l, m);
    } else {
      const m = SEL_DOS;
      tituloSel(s.pc ? "Elegi la nave de la PC" : "Elegi tu nave", m.yTitulo, 30);
      textoSel("vs", 960, m.yNave, 26, "rgba(255, 255, 255, 0.35)");
      s.lados.forEach((l, i) => {
        const cx = m.cx[i];
        textoSel(i ? (s.pc ? "PC" : "J2") : "J1", cx, m.yJ, 22, `rgb(${l.rgb})`);
        textoSel(nombreSel(l), cx, m.yNombre, m.tamNombre, "#fff");
        fuegosSel(l, cx, m.yFuego, m.tamFuego, i);
        if (s.pc) {
          // Contra la PC la tuya ya está: sin cinta, con "lista".
          if (!i) textoSel("lista", cx, m.yEstado, 18, `rgb(${l.rgb})`);
          else cintaSel(l, cx, m, i);
        } else {
          textoSel(l.listo ? "listo" : "eligiendo", cx, m.yEstado, 18, l.listo ? `rgb(${l.rgb})` : gris);
          cintaSel(l, cx, m, i);
        }
      });
      nota();
      if (tactil && s.pc) {
        botonesSel([
          { texto: "volver", hacer: () => accionSelector(1, "volver") },
          { texto: "jugar", rgb: s.lados[1].rgb, hacer: () => accionSelector(1, "ok") },
        ], m.yAyuda);
      } else if (tactil) {
        botonesSel([
          { texto: "J1 listo", rgb: s.lados[0].rgb, hacer: () => accionSelector(0, "ok") },
          { texto: "volver", hacer: () => accionSelector(0, "volver") },
          { texto: "J2 listo", rgb: s.lados[1].rgb, hacer: () => accionSelector(1, "ok") },
        ], m.yAyuda);
      } else if (s.pc) {
        ayudaSel([
          { teclas: ["A", "D"], texto: "nave" },
          { teclas: ["W", "S"], texto: "fuego" },
          { teclas: ["E"], texto: "jugar" },
          { teclas: ["esc"], texto: "volver a la tuya" },
        ], m.yAyuda);
      } else {
        const alReves = controlesCambiados && !primerJoystick();
        ayudaSel([
          { teclas: ["W", "A", "S", "D"], texto: alReves ? "J2" : "J1" },
          { teclas: ["▲", "◀", "▼", "▶"], texto: alReves ? "J1" : "J2" },
          { teclas: ["E"], texto: alReves ? "J2 listo" : "J1 listo" },
          { teclas: ["enter"], texto: alReves ? "J1 listo" : "J2 listo" },
          { teclas: ["esc"], texto: "volver" },
        ], m.yAyuda);
      }
      s.lados.forEach((l, i) => grandeSel(l, i, m.cx[i], m));
      for (const l of s.lados) dibujarVueloSel(l, m);
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // Funde a negro (dur segundos) y, ya en negro, termina.
  function caerPresentacion(dur) {
    presenta.cae = dur;
    tapa.style.transition = `opacity ${dur}s ease`;
    tapa.classList.add("cae");
    if (presentaLogo && !presentaLogo.hidden) apagarLogo(dur);
  }

  function saltarPresentacion() {
    if (presenta && presenta.cae === null)
      caerPresentacion(PRESENTA_CAIDA_SALTEO);
  }
  document.addEventListener("pointerdown", tocarPresentacion);

  // --- Entrar a un modo elegido desde la pausa, con sonido ----------------------
  // Elegir un modo desde la pausa recarga la página (ver reiniciarEnModo) y al
  // volver se entra directo a ese modo. Pero el toque que lo eligió quedó en la
  // página de antes: la nueva no tiene ninguno y el navegador no deja sonar
  // nada hasta que lo haya, así que la música, las voces y los agujeros
  // quedaban mudos toda la partida (con una recarga común no pasaba: ahí la
  // presentación espera un toque). Igual que ella, si no se puede sonar se
  // espera en la pantalla negra un toque -una tecla, un click o el botón A- y
  // recién ahí arranca el modo. Si ya se puede sonar, entra sin más. (Todo esto
  // solo con PRESENTA_PIDE_TOQUE en true; si no, entra directo y la música, que
  // queda en cola en el audio suspendido, arranca con el primer toque: ver
  // desbloquearAudio.)
  let esperaToque = null; // mientras espera: { entrar, padA }; si no, null

  // ¿Puede sonar el audio del juego (Web Audio) sin que se toque nada? Se lo
  // prueba reanudándolo: el navegador que no deja deja la promesa colgada
  // (Chrome) o la rechaza (Safari), así que se mira el estado a los 300 ms.
  function audioPuedeSonar() {
    if (!audioCtx) return puedeSonar();
    if (audioCtx.state === "running") return Promise.resolve(true);
    return new Promise((listo) => {
      const ver = () => listo(audioCtx.state === "running");
      audioCtx.resume().then(ver, ver);
      setTimeout(ver, 300);
    });
  }

  function entrarConSonido(entrar) {
    if (!PRESENTA_PIDE_TOQUE) {
      entrar(); // sin pantalla de toque: ver PRESENTA_PIDE_TOQUE
      return;
    }
    // Pantalla negra, sin menú ni nave, mientras se averigua (si ya se puede
    // sonar, ni se nota: la escena ya es negra).
    if (modoEl) modoEl.hidden = true;
    ship.classList.add("game-sin-nave");
    if (tapa) {
      tapa.style.transition = "none";
      tapa.classList.add("cae");
      void tapa.offsetWidth;
    }
    const gp = primerJoystick();
    esperaToque = { entrar, padA: !!gp && botonPad(gp, PAD_A) };
    audioPuedeSonar().then((puede) => {
      if (!esperaToque || esperaToque.entrar !== entrar) return; // ya tocaron
      if (puede) seguirConSonido(true);
      else if (presentaToque) presentaToque.hidden = false; // "presiona cualquier tecla"
    });
  }

  function tocarEspera() {
    if (esperaToque) seguirConSonido(false);
  }

  function seguirConSonido(instantaneo) {
    const { entrar } = esperaToque;
    esperaToque = null;
    if (presentaToque) presentaToque.hidden = true;
    if (audioCtx) audioCtx.resume().catch(() => {});
    if (tapa) {
      tapa.style.transition = "";
      levantarTapa(instantaneo); // con el toque, la pantalla se aclara de a poco
    }
    // Vuelve el menú como estaba: elegirModo lo esconde (salvo online, que lo
    // deja con el estado de la búsqueda).
    if (modoEl) modoEl.hidden = false;
    entrar();
  }
  document.addEventListener("pointerup", tocarEspera);

  // Termina (se fue la nave, o ya en negro al saltearla): todo vuelve a como
  // estaba (fondo negro, nave en blanco y negro en el medio abajo, pero sin
  // verse hasta que se elija un modo) y queda el menú.
  function terminarPresentacion() {
    presenta = null;
    window.shipLibre = false;
    window.shipZoom = 1;
    particulas = [];
    if (presentaLogo) {
      presentaLogo.hidden = true;
      presentaLogo.classList.remove("visible", "foquito");
      presentaLogo.style.opacity = "";
    }
    if (presentaToque) presentaToque.hidden = true;
    if (caratulaTexto) caratulaTexto.hidden = true;
    ship.classList.remove("game-color");
    ship.classList.add("game-sin-nave");
    colorEscalon = -1; // fuerza a aplicar el color (0) a la nave y al fondo
    fondoDeGolpe(aplicarColorNave);
    tinteNaves = tinteMeta();
    tinteEscalon = -1;
    aplicarTinteNaves();
    centrarNave();
    if (modoEl) {
      modoEl.style.transform = "";
      modoEl.inert = false;
      modoEl.hidden = false;
    }
    sincronizarPadMenu(); // que el A que la salteó no elija la primera opción
    // Se fue la nave (o se salteó): recién ahora se apunta la primera opción,
    // con su "selector" (callado si es porque se sale del escenario).
    apuntarOpcion(0, !activo);
    tapa.style.transition = "";
    levantarTapa(false);
  }

  function centrarNave() {
    // Sin rival (todavía sin modo elegido, o tutorial) va al medio, como
    // siempre; con rival (PC, dos jugadores u online) a su esquina.
    const conRival = modo && modo !== "tutorial";
    if (window.shipPlace)
      window.shipPlace(
        conRival ? xEsquinaJugador() : window.innerWidth / 2,
        window.innerHeight * POSICION_Y_INICIAL,
      );
  }

  // Línea de tiempo de la intro: empiezan a irse las naves (INTRO_INICIO), ya
  // se fue la última y se apaga todo (INTRO_FUERA) y, tras la oscuridad, la
  // nave prende la luz y empieza el juego (INTRO_JUEGO: aparece el segundero,
  // suena la música).
  const INTRO_INICIO = INTRO_LLEGADA + INTRO_ESPERA;
  const INTRO_FUERA =
    INTRO_INICIO + INTRO_SALIDA + INTRO_ESCALONADO * (INTRO_NAVES.length - 1);
  const INTRO_JUEGO = INTRO_FUERA + INTRO_OSCURO;

  // Punto de encuentro de las naves de la intro (mundo). x es una fracción de
  // lo que se ve ahora (v.w, no window.innerWidth: con zoom la vista es una
  // fracción del mundo) y el clamp de y va relativo a v.y/v.h por lo mismo
  // -mismo patrón que iniciarFinal() más abajo con final.punto-.
  function puntoEncuentro() {
    const v = vista();
    return {
      x: v.x + v.w * P7_X,
      y: Math.max(v.y + v.h * 0.3, v.y + v.h - P7_ALTURA),
    };
  }

  // Dónde está la nave durante la intro: entra volando desde la derecha hasta
  // el lugar por donde entra al escenario y ahí flota con un vaivén suave (no
  // se queda clavada). Coordenadas de pantalla (centro de la nave).
  function posicionNaveIntro(t) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const u = Math.min(1, t / INTRO_ENTRADA);
    const suave = 1 - Math.pow(1 - u, 3);
    const desde = { x: w + 90, y: h * 0.9 };
    const destino = { x: w - 85, y: h * 0.75 };
    return {
      x:
        desde.x +
        (destino.x - desde.x) * suave +
        Math.sin(t * 1.7) * NAVE_FLOTA.x * suave,
      y:
        desde.y +
        (destino.y - desde.y) * suave +
        Math.sin(t * 2.3 + 1) * NAVE_FLOTA.y * suave,
    };
  }

  // Durante la intro la nave mira a las navecitas: hacia donde se juntan y,
  // cuando se van, siguiéndolas (0° es mirar derecho arriba; negativo, a la
  // izquierda).
  function mirarNaves(centro, naves, t) {
    if (!centro || !window.shipFace) return;
    // Cuando ya no hay navecitas se queda mirando hacia donde se fueron.
    if (naves.length) {
      const objetivo = {
        x: naves.reduce((a, n) => a + n.x, 0) / naves.length,
        y: naves.reduce((a, n) => a + n.y, 0) / naves.length,
      };
      const grados =
        (Math.atan2(objetivo.y - centro.y, objetivo.x - centro.x) * 180) /
          Math.PI +
        90;
      const norm = ((grados + 540) % 360) - 180;
      miradaGrados = Math.max(
        -INTRO_MIRADA_MAX,
        Math.min(INTRO_MIRADA_MAX, norm),
      );
    }
    window.shipFace(miradaGrados + Math.sin(t * 1.3) * NAVE_BALANCEO);
  }

  // Naves de la intro en el mundo, según el segundo de intro. Fuera de la
  // intro (o cuando ya se fueron) devuelve una lista vacía.
  function navesIntro(t) {
    if (t < 0 || t > INTRO_FUERA) return [];
    const v = vista();
    const { x: mx, y: my } = puntoEncuentro();
    const u = Math.min(1, t / INTRO_LLEGADA);
    const suave = 1 - Math.pow(1 - u, 3);
    return INTRO_NAVES.map((n, i) => {
      const d0 = n.desde({ x: mx, y: my }, v);
      let x = d0.x + (mx + n.a.x - d0.x) * suave;
      let y = d0.y + (my + n.a.y - d0.y) * suave;
      y += Math.sin(t * 3 + i * 1.7) * 3; // flotan un poco
      let esc = 1;
      const ts = t - INTRO_INICIO - i * INTRO_ESCALONADO;
      if (ts > 0) {
        const d = 0.5 * INTRO_ACELERACION * ts * ts;
        x += INTRO_DIR.x * d;
        y += INTRO_DIR.y * d;
        esc = 1 - 0.5 * Math.min(1, ts / INTRO_SALIDA);
      }
      return { x, y, esc };
    });
  }

  // El sprite del parallax 7 ocupa solo un rincón del PNG (992x700): se recorta.
  const P7_RECORTE = { x: 58, y: 11, w: 111, h: 83 };
  const P7_MARGEN = 8; // px del PNG alrededor del sprite, para que la sombra interna cierre en los bordes
  const P7_RESOLUCION = 2;
  const P7_SOMBRA = { difusion: 7, dx: 1.5, dy: 3, pasadas: 3 }; // sombra interna, en px del PNG

  // El parallax 7 en blanco y negro con sombra interna, armado una sola vez en
  // un canvas (el filtro SVG de la nave no se puede usar dentro del canvas en
  // todos los navegadores).
  function armarSpriteP7BN(img) {
    const r = P7_RECORTE;
    const k = P7_RESOLUCION;
    const w = (r.w + P7_MARGEN * 2) * k;
    const h = (r.h + P7_MARGEN * 2) * k;
    const recorte = (c) =>
      c.drawImage(
        img,
        r.x - P7_MARGEN,
        r.y - P7_MARGEN,
        w / k,
        h / k,
        0,
        0,
        w,
        h,
      );
    const nave = document.createElement("canvas");
    nave.width = w;
    nave.height = h;
    const c = nave.getContext("2d");
    // Gris: se desatura con un relleno gris en modo "saturation" y se vuelve a
    // recortar con la silueta (el relleno también pinta lo transparente).
    recorte(c);
    c.globalCompositeOperation = "saturation";
    c.fillStyle = "#808080";
    c.fillRect(0, 0, w, h);
    c.globalCompositeOperation = "destination-in";
    recorte(c);
    // Sombra interna: todo lo que NO es nave, difuminado y corrido, dibujado
    // solo encima de la nave. La imagen en sí se tira lejos de la vista y
    // queda solo su sombra.
    const fuera = document.createElement("canvas");
    fuera.width = w;
    fuera.height = h;
    const f = fuera.getContext("2d");
    f.fillStyle = "#000";
    f.fillRect(0, 0, w, h);
    f.globalCompositeOperation = "destination-out";
    recorte(f);
    c.globalCompositeOperation = "source-atop";
    c.shadowColor = "#000";
    c.shadowBlur = P7_SOMBRA.difusion * k;
    c.shadowOffsetX = w * 2 + P7_SOMBRA.dx * k;
    c.shadowOffsetY = P7_SOMBRA.dy * k;
    for (let i = 0; i < P7_SOMBRA.pasadas; i++) c.drawImage(fuera, -w * 2, 0);
    return nave;
  }

  // Final (victoria), en dos fases seguidas (final.fase), con el mismo zoom
  // anclado en la nave del jugador y sin pantalla negra en el medio:
  // 1. Zoom a la nave del jugador, que termina de teñirse y se ve toda de color
  //    (sobre su propio centro: la escala de la nave, window.shipZoom, y todo el
  //    resto acercándose a ella). Se van los cúmulos, los polígonos y el
  //    segundero.
  // 2. Con ese zoom ya hecho llegan las naves parallax 7 en blanco y negro junto
  //    a la nave (que las mira), una putea en un globo de diálogo y se escapan
  //    (alejándose de la nave). final.t sigue corriendo: la fase 2 empieza en
  //    FINAL_NAVE_DUR.
  function iniciarFinal() {
    ganado = true;
    final = { t: 0, fase: 1 };
    cumulos = [];
    particulas = [];
    poligonos = [];
    poligonosRival = [];
    colorObjetivo = 1;
    timerEl.style.visibility = "hidden";
    ship.classList.add("game-luz-index"); // con la luz prendida, como en el index
    // Dónde se juntan las naves, a un costado de la nave del jugador (del lado
    // donde hay más pantalla) y un poco más arriba, y hacia dónde se escapan
    // (alejándose de ella y hacia arriba, como en la intro). Se decide una vez.
    const v = vista(FINAL_ZOOM_NAVE);
    const lado = cam.ox < window.innerWidth / 2 ? 1 : -1;
    const dist = Math.min(FINAL_DISTANCIA, v.w * 0.3);
    final.punto = {
      x: cam.ox + lado * dist,
      y: Math.max(
        v.y + v.h * 0.42,
        Math.min(v.y + v.h * 0.75, cam.oy - FINAL_ELEVACION),
      ),
    };
    final.dir = { x: lado * Math.abs(INTRO_DIR.x), y: INTRO_DIR.y };
  }

  // Pasa de la fase 1 a la 2: no cambia nada de la cámara ni de la nave, solo
  // aparecen las naves.
  function pasarAFaseNaves() {
    final.fase = 2;
  }

  // Vuelve todo a como estaba antes del final (al empezar una partida y al salir
  // del escenario).
  function limpiarFinal() {
    final = null;
    ganado = false;
    window.shipZoom = 1;
    ship.classList.remove("game-luz-index");
    scene.style.removeProperty("--fondo-zoom");
    scene.style.removeProperty("--fondo-origen");
  }

  // Zoom a la nave, suave, hasta FINAL_ZOOM_NAVE (después se queda ahí).
  function zoomNave() {
    const u = Math.min(1, final.t / FINAL_NAVE_DUR);
    return 1 + (FINAL_ZOOM_NAVE - 1) * u * u * (3 - 2 * u);
  }

  // Línea de tiempo de la fase 2 (segundos desde que empieza): igual que la de
  // la intro, pero esperan más juntas.
  const FINAL_INICIO = INTRO_LLEGADA + FINAL_ESPERA;
  const FINAL_FUERA =
    FINAL_INICIO + INTRO_SALIDA + INTRO_ESCALONADO * (FINAL_NAVES.length - 1);

  // Igual que navesIntro (mismos tiempos, salvo la espera), pero con otros
  // orígenes, otro lugar de encuentro y la salida alejándose de la nave del
  // jugador. t = segundos de la fase 2.
  function navesFinal(t) {
    if (t < 0 || t > FINAL_FUERA) return [];
    const v = vista(FINAL_ZOOM_NAVE);
    const p = final.punto;
    const u = Math.min(1, t / INTRO_LLEGADA);
    const suave = 1 - Math.pow(1 - u, 3);
    return FINAL_NAVES.map((n, i) => {
      const d0 = n.desde(p, v);
      let x = d0.x + (p.x + n.a.x - d0.x) * suave;
      let y = d0.y + (p.y + n.a.y - d0.y) * suave;
      y += Math.sin(t * 3 + i * 1.7) * 3; // flotan un poco
      let esc = 1;
      const ts = t - FINAL_INICIO - i * INTRO_ESCALONADO;
      if (ts > 0) {
        const d = 0.5 * INTRO_ACELERACION * ts * ts;
        x += final.dir.x * d;
        y += final.dir.y * d;
        esc = 1 - 0.5 * Math.min(1, ts / INTRO_SALIDA);
      }
      return { x, y, esc };
    });
  }

  // Globo de diálogo (como los de historieta, en blanco y negro como las
  // naves): sale de arriba de una nave y aparece con un pequeño rebote. n = esa
  // nave (posición y escala), alto = alto del sprite, t = segundos de la fase 2.
  function dibujarGlobo(n, alto, t) {
    const g = FINAL_GLOBO;
    if (t < g.desde || t > g.hasta) return;
    const entra = Math.min(1, (t - g.desde) / 0.25);
    const sale = Math.min(1, (g.hasta - t) / 0.2);
    // Rebote al aparecer (se pasa de 1 y vuelve).
    const q = entra - 1;
    const k = entra < 1 ? 1 + 2.7 * q * q * q + 1.7 * q * q : 1;
    const pad = g.fuente * 0.55;
    ctx.save();
    ctx.font =
      "700 " + g.fuente + 'px "DM Mono", ui-monospace, Consolas, monospace';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const w = ctx.measureText(g.texto).width + pad * 2;
    const h = g.fuente + pad * 2;
    // La punta de la cola toca a la nave y el globo queda arriba, un poco
    // corrido hacia la derecha de la cola.
    ctx.translate(n.x, n.y - (alto * n.esc) / 2 - 3);
    ctx.scale(k * n.esc, k * n.esc);
    ctx.globalAlpha = Math.max(0, sale) * Math.min(1, entra * 2);
    const cola = g.fuente * 0.9;
    const x0 = -w * 0.4;
    const x1 = x0 + w;
    const y0 = -cola - h;
    const y1 = y0 + h;
    const r = h * 0.4;
    const base = cola * 0.45; // medio ancho de la cola donde se une al globo
    // Un solo contorno: el globo con la cola metida en el borde de abajo.
    ctx.beginPath();
    ctx.moveTo(x0 + r, y0);
    ctx.arcTo(x1, y0, x1, y1, r);
    ctx.arcTo(x1, y1, x0, y1, r);
    ctx.lineTo(base, y1);
    ctx.lineTo(0, 0);
    ctx.lineTo(-base, y1);
    ctx.arcTo(x0, y1, x0, y0, r);
    ctx.arcTo(x0, y0, x1, y0, r);
    ctx.closePath();
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#000";
    ctx.stroke();
    // El texto tiembla un poquito, de la bronca.
    ctx.fillStyle = "#000";
    ctx.fillText(
      g.texto,
      x0 + w / 2 + Math.sin(t * 60) * 0.6,
      y0 + h / 2 + 1 + Math.cos(t * 47) * 0.6,
    );
    ctx.restore();
  }

  function dibujarFinal() {
    if (!final || final.fase !== 2 || !spriteP7BN) return;
    const t = final.t - FINAL_NAVE_DUR;
    const ancho = (P7_ANCHO * (P7_RECORTE.w + P7_MARGEN * 2)) / P7_RECORTE.w;
    const alto = (ancho * spriteP7BN.height) / spriteP7BN.width;
    const naves = navesFinal(t);
    for (const n of naves) {
      ctx.drawImage(
        spriteP7BN,
        n.x - (ancho * n.esc) / 2,
        n.y - (alto * n.esc) / 2,
        ancho * n.esc,
        alto * n.esc,
      );
    }
    if (naves.length) dibujarGlobo(naves[FINAL_GLOBO.nave], alto, t);
  }

  function dibujarIntro() {
    if (!spriteP7 || !spriteP7.naturalWidth) return;
    const r = P7_RECORTE;
    const ancho = P7_ANCHO;
    const alto = (P7_ANCHO * r.h) / r.w;
    for (const n of navesIntro(introT)) {
      ctx.drawImage(
        spriteP7,
        r.x,
        r.y,
        r.w,
        r.h,
        n.x - (ancho * n.esc) / 2,
        n.y - (alto * n.esc) / 2,
        ancho * n.esc,
        alto * n.esc,
      );
    }
  }

  // Contra la PC el cuadrado del medio muestra el marcador en vez del
  // segundero: tus goles en azul y los de la PC en rojo, los colores de cada
  // nave (ver .marcador-jugador en styles.css). En el tutorial sigue siendo el
  // segundero de siempre, que se tiñe con la nave. Spaceport no tiene tildes:
  // "GANO".
  function mostrarTiempo() {
    // El azul es siempre el jugador 1 y va a la izquierda; el rojo, a la
    // derecha. Online a vos te puede tocar el rojo (ver esAzul): tus goles
    // salen con el color que te tocó y el marcador sigue con el azul primero.
    const claseMia = esAzul() ? "marcador-jugador" : "marcador-rival";
    const claseRival = esAzul() ? "marcador-rival" : "marcador-jugador";
    const celda = (clase, n) => '<span class="' + clase + '">' + n + "</span>";
    const goles = esAzul()
      ? celda(claseMia, cumulosTomados) +
        '<span class="marcador-separador"></span>' +
        celda(claseRival, golesRival)
      : celda(claseRival, golesRival) +
        '<span class="marcador-separador"></span>' +
        celda(claseMia, cumulosTomados);
    // Un cartel (el del final, el de GOL DE ORO) va arriba del marcador, con
    // la misma letra, sin moverlo ni achicarlo (ver .marcador-cartel).
    const conResultado = (cartel) =>
      '<span class="marcador-cartel">' + cartel + "</span>" + goles;
    // En el tutorial, el segundero del sitio (y GANASTE al completar los 10).
    const texto = esTutorial()
      ? fin
        ? "GANASTE"
        : tiempo.toFixed(1)
      : fin
        ? fin.ganador === "abandono"
          ? conResultado("EL RIVAL SE FUE")
          : fin.ganador === "vos"
            ? conResultado(
                celda(claseMia, modo === "dos" ? "GANO J1" : "GANASTE"),
              )
            : conResultado(
                celda(
                  claseRival,
                  modo === "dos"
                    ? "GANO J2"
                    : enLinea()
                      ? "GANO EL RIVAL"
                      : "GANO LA PC",
                ),
              )
        : golDeOroHasta > tiempo
          ? conResultado(celda("marcador-oro", "GOL DE ORO"))
          : goles;
    if (texto === ultimoTexto) return;
    ultimoTexto = texto;
    timerEl.innerHTML = texto;
  }

  // Saturación de la nave (0 = gris, 1 = con todos sus colores). Cambiar el
  // filtro de la nave obliga al navegador a repintarla entera, y hacerlo en
  // cada cuadro mientras se tiñe (varios segundos por pasaje) tiraba los cuadros
  // por segundo: por eso solo se toca cuando el valor cambia de escalón
  // (COLOR_PASOS escalones en total, imperceptibles uno a uno). La nave va con
  // tinteNaves; el resto de la escena, con colorNave (ver aplicarColorNave).
  function aplicarTinteNaves() {
    const escalon = Math.round(tinteNaves * COLOR_PASOS);
    if (escalon === tinteEscalon) return;
    tinteEscalon = escalon;
    ship.style.setProperty("--nave-sat", (escalon / COLOR_PASOS).toFixed(3));
    // slope * x + intercept con los filtros de CSS: contrast(c) es
    // c * x + (1 - c) / 2 y brightness(b) multiplica por b, así que con
    // b = slope + 2 * intercept y c = slope / b queda justo esa cuenta (y
    // contrast nunca se sale de 0..1, así que no recorta antes de tiempo).
    const gris = 1 - escalon / COLOR_PASOS;
    const slope = 1 + (LUZ_SLOPE_GRIS - 1) * gris;
    const brillo = slope + 2 * LUZ_INTERCEPT_GRIS * gris;
    ship.style.setProperty("--nave-luz-b", brillo.toFixed(4));
    ship.style.setProperty("--nave-luz-c", (slope / brillo).toFixed(4));
    // El sprite de atrás (el resplandor) también: su gris lo lee de esta variable
    // (ver scenes.game.light en script.js).
    ship.style.setProperty("--nave-gris", gris.toFixed(3));
  }

  // Hacia dónde va tinteNaves: fuera de un modo (la presentación y el menú),
  // como la escena; en un modo, de NAVES_COLOR_INICIO a todo su color a medida
  // que la escena llega a su tope.
  function tinteMeta() {
    if (!modo) return colorNave;
    const tope = esTutorial() ? 1 : COLOR_MAXIMO;
    const avance = Math.max(0, Math.min(1, colorNave / tope));
    return NAVES_COLOR_INICIO + (1 - NAVES_COLOR_INICIO) * avance;
  }

  // Cada cuadro: online, buscando rival, parpadea (arranca a todo color); si
  // no, acompaña al color de la escena.
  function actualizarTinte(dt) {
    if (esperandoRival()) {
      const fase = (reloj / BUSCANDO_PARPADEO) * Math.PI * 2;
      tinteNaves = 0.5 + 0.5 * Math.cos(fase);
    } else {
      tinteNaves +=
        (tinteMeta() - tinteNaves) * Math.min(1, dt * NAVES_COLOR_SUAVIZADO);
    }
    aplicarTinteNaves();
  }

  function aplicarColorNave() {
    const escalon = Math.round(colorNave * COLOR_PASOS);
    if (escalon === colorEscalon) return;
    colorEscalon = escalon;
    const valor = (escalon / COLOR_PASOS).toFixed(3);
    // La luz también: empieza blanca y va pasando al salmón (los halos y el
    // degradado de la nave, ver --luz-rgb en styles.css; el del canvas lo mezcla
    // dibujar).
    ship.style.setProperty(
      "--luz-rgb",
      LUZ_RGB_INICIO.map((a, i) =>
        Math.round(a + (LUZ_RGB_FIN[i] - a) * (escalon / COLOR_PASOS)),
      ).join(","),
    );
    // El fondo starry sube con el color de la nave (la transición del CSS suaviza
    // el salto de un escalón al siguiente).
    scene.style.setProperty("--fondo-color", valor);
    // Y el segundero pasa del blanco al salmón del sitio.
    timerEl.style.color = mezclarColores(
      "#ffffff",
      TIMER_COLOR_FIN,
      escalon / COLOR_PASOS,
    );
  }

  // Un agujero de gusano nuevo en un punto al azar, lejos de las naves y (si se
  // pasa) del otro agujero del par.
  function crearCumulo(objetivo, otro) {
    // Con dos naves, en cualquier lugar del mapa y no solo donde mira la cámara
    // del jugador (o del anfitrión, que es quien los crea online): si no,
    // siempre le quedarían cerca a él. En el tutorial, como en el sitio: en lo
    // que se ve.
    const v = esTutorial()
      ? vista()
      : { x: 0, y: 0, w: window.innerWidth, h: window.innerHeight };
    // Lejos de las dos naves por igual (no solo de la de esta pantalla).
    const naves = [objetivo];
    if (rival && !esTutorial()) naves.push({ x: rival.x, y: rival.y });
    const margen = 90;
    for (let intento = 0; intento < 20; intento++) {
      const x = v.x + margen + Math.random() * Math.max(1, v.w - margen * 2);
      const y = v.y + margen + Math.random() * Math.max(1, v.h - margen * 2);
      if (
        naves.some(
          (n) => n && Math.hypot(x - n.x, y - n.y) < CUMULO_DISTANCIA_MIN,
        )
      )
        continue;
      if (otro && Math.hypot(x - otro.x, y - otro.y) < CUMULO_DISTANCIA_PAR)
        continue;
      return {
        id: ++idCumulo, // online, para que el invitado diga a cuál entró
        x,
        y,
        t: 0,
        ang: Math.random() * Math.PI * 2,
        par: null, // el otro agujero: por ahí sale la nave
      };
    }
    return null;
  }

  // Un par de agujeros de gusano, cada uno apuntando al otro.
  // Online los crea el anfitrión y al invitado le llegan un rato después (lo
  // que tarda el mensaje, más la espera hasta el próximo estado): para que no
  // los vea antes, en su pantalla se prenden recién a esa edad (prendeT, en s):
  // hasta ahí no se ven, no suenan y no se puede entrar. Así aparecen a la vez
  // en las dos pantallas.
  function crearPar(objetivo) {
    const a = crearCumulo(objetivo, null);
    if (!a) return;
    const b = crearCumulo(objetivo, a);
    if (!b) return;
    a.par = b;
    b.par = a;
    const prendeT = enLinea()
      ? latenciaRed() / 1000 + ENVIO_CADA / 2 // en s
      : 0;
    a.prendeT = b.prendeT = prendeT;
    cumulos.push(a, b);
    if (!prendeT) sonarPortal(); // si no, suena al prenderse (ver actualizarCumulos)
  }

  // Si ya se ve y se puede entrar (ver prendeT en crearPar).
  const prendido = (c) => !c.prendeT || c.t >= c.prendeT;

  // Dónde van las estrellas de un número, relativas a su centro (px del mundo):
  // se dibuja el número en un canvas aparte con una tipografía sans-serif en
  // negrita, se queda con la franja central del trazo (los píxeles más alejados
  // del borde: la línea del dígito) y ahí se reparten las estrellas a distancias
  // parejas (nunca a menos de NUMERO_ESPACIO una de otra). Se arma una vez por
  // número (ver prepararNumeros) y queda guardado.
  const numerosGuardados = {};
  function puntosNumero(numero) {
    if (numerosGuardados[numero]) return numerosGuardados[numero];
    const K = 4; // píxeles del canvas por px del mundo (para muestrear con precisión)
    const texto = String(numero);
    const familia = 'Arial, Helvetica, "Helvetica Neue", sans-serif';
    const c = document.createElement("canvas");
    const g = c.getContext("2d", { willReadFrequently: true });
    // Tamaño de letra para que los dígitos midan NUMERO_ALTO de alto.
    g.font = "bold 100px " + familia;
    const m0 = g.measureText("0");
    const tam =
      (100 * NUMERO_ALTO * K) /
      Math.max(1, m0.actualBoundingBoxAscent + m0.actualBoundingBoxDescent);
    const fuente = "bold " + tam + "px " + familia;
    g.font = fuente;
    const m = g.measureText(texto);
    const borde = 4;
    const izq = m.actualBoundingBoxLeft;
    const arr = m.actualBoundingBoxAscent;
    const w = Math.ceil(izq + m.actualBoundingBoxRight) + borde * 2;
    const h = Math.ceil(arr + m.actualBoundingBoxDescent) + borde * 2;
    c.width = w;
    c.height = h;
    g.font = fuente; // al cambiar el tamaño del canvas se pierde
    g.fillStyle = "#000";
    g.fillText(texto, borde + izq, borde + arr);
    const datos = g.getImageData(0, 0, w, h).data;
    // Distancia de cada píxel del trazo al borde más cercano (dos pasadas).
    const dist = new Float32Array(w * h);
    for (let i = 0; i < w * h; i++) dist[i] = datos[i * 4 + 3] > 128 ? 1e9 : 0;
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const i = y * w + x;
        if (dist[i])
          dist[i] = Math.min(
            dist[i],
            dist[i - 1] + 1,
            dist[i - w] + 1,
            dist[i - w - 1] + 1.414,
            dist[i - w + 1] + 1.414,
          );
      }
    for (let y = h - 2; y > 0; y--)
      for (let x = w - 2; x > 0; x--) {
        const i = y * w + x;
        if (dist[i])
          dist[i] = Math.min(
            dist[i],
            dist[i + 1] + 1,
            dist[i + w] + 1,
            dist[i + w - 1] + 1.414,
            dist[i + w + 1] + 1.414,
          );
      }
    // El trazo de la negrita mide ~0,14 del tamaño de letra: su mitad es lo más que
    // puede valer la distancia al borde. Se toma la franja del medio (>= la mitad).
    const umbral = tam * 0.035;
    const candidatos = [];
    for (let i = 0; i < w * h; i++) if (dist[i] >= umbral) candidatos.push(i);
    // Se prueban primero los más centrados en el trazo (con un poco de azar, para
    // que no sea siempre igual): las estrellas quedan sobre la línea del dígito.
    const orden = new Map(
      candidatos.map((i) => [i, dist[i] * (0.8 + 0.4 * Math.random())]),
    );
    candidatos.sort((p, q) => orden.get(q) - orden.get(p));
    const minimo = NUMERO_ESPACIO * K;
    const puntos = [];
    for (const i of candidatos) {
      const px = i % w;
      const py = (i - px) / w;
      let libre = true;
      for (const p of puntos) {
        const dx = p.px - px;
        const dy = p.py - py;
        if (dx * dx + dy * dy < minimo * minimo) {
          libre = false;
          break;
        }
      }
      if (libre) puntos.push({ px, py });
    }
    return (numerosGuardados[numero] = {
      puntos: puntos.map((p) => ({
        dx: (p.px - w / 2) / K,
        dy: (p.py - h / 2) / K,
      })),
      ancho: w / K,
      alto: h / K,
    });
  }

  // Los 10 números, armados al entrar al escenario (así el primer cruce no tiene
  // que armarlo).
  function prepararNumeros() {
    setTimeout(() => {
      for (let n = 1; n <= CUMULOS_PARA_COLOR; n++) puntosNumero(n);
    }, 0);
  }

  // Las estrellas del número salen de (x, y) -el agujero de salida, ver el
  // llamado más abajo- y se acomodan ahí mismo: son el cierre de ese agujero
  // (antes, sin el número, ahí mismo chorreaban las chispas de siempre; ver
  // chispas() y su llamado en el de entrada). El clamp solo evita que el
  // número se recorte si el agujero queda pegado al borde de lo que se ve.
  function crearNumeroEstrellas(x, y, numero, color = "#ffffff") {
    const { puntos, ancho, alto } = puntosNumero(numero);
    const v = vista();
    const margen = 14;
    const cx = Math.max(
      v.x + ancho / 2 + margen,
      Math.min(v.x + v.w - ancho / 2 - margen, x),
    );
    const cy = Math.max(
      v.y + alto / 2 + margen,
      Math.min(v.y + v.h - alto / 2 - margen, y),
    );
    // Cada número sale distinto: gira un poco, se tumba un poco y se corre un poco.
    const giro = (Math.random() * 2 - 1) * NUMERO_GIRO;
    const cursiva =
      NUMERO_CURSIVA[0] +
      Math.random() * (NUMERO_CURSIVA[1] - NUMERO_CURSIVA[0]);
    const cos = Math.cos(giro);
    const sen = Math.sin(giro);
    const desx = (Math.random() - 0.5) * 6;
    const desy = (Math.random() - 0.5) * 4;
    for (const p of puntos) {
      // Salen en todas direcciones, como las chispas, y un resorte las lleva a su lugar.
      const ang = Math.random() * Math.PI * 2;
      const vel = 60 + Math.random() * 90;
      const inclx = p.dx - p.dy * cursiva; // tumbado hacia un costado
      const rx = inclx * cos - p.dy * sen;
      const ry = inclx * sen + p.dy * cos;
      // El corrimiento de cada estrella, en un círculo (no en un cuadrado).
      const ta = Math.random() * Math.PI * 2;
      const td = Math.sqrt(Math.random()) * NUMERO_TEMBLOR;
      numeroEstrellas.push({
        x,
        y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
        tx: cx + desx + rx + Math.cos(ta) * td,
        ty: cy + desy + ry + Math.sin(ta) * td,
        r:
          NUMERO_RADIO[0] + Math.random() * (NUMERO_RADIO[1] - NUMERO_RADIO[0]),
        t: -Math.random() * 0.08, // salen apenas escalonadas
        cae: false,
        color, // del jugador que hizo el gol (ver dibujarCumulos)
        // Para titilar como las de fondo (ver dibujarEstrellas): cada una a su
        // propia velocidad y arrancando en un punto distinto del seno.
        titVel:
          NUMERO_TITILAR_VEL[0] +
          Math.random() * (NUMERO_TITILAR_VEL[1] - NUMERO_TITILAR_VEL[0]),
        titFase: Math.random() * Math.PI * 2,
      });
    }
  }

  // Salen disparadas y el resorte (un poco subamortiguado: se pasan y vuelven) las
  // acomoda en su lugar; después caen con gravedad.
  function actualizarNumeroEstrella(e, dt) {
    e.t += dt;
    if (e.t < 0) return;
    if (e.t < NUMERO_CAE_A) {
      const K = 130;
      const C = 2 * Math.sqrt(K) * 0.7;
      for (let resto = dt; resto > 0; resto -= 1 / 120) {
        const h = Math.min(resto, 1 / 120);
        e.vx += (K * (e.tx - e.x) - C * e.vx) * h;
        e.vy += (K * (e.ty - e.y) - C * e.vy) * h;
        e.x += e.vx * h;
        e.y += e.vy * h;
      }
    } else {
      if (!e.cae) {
        e.cae = true;
        e.vx = (Math.random() - 0.5) * 30;
        e.vy = 0;
      }
      e.vy += NUMERO_GRAVEDAD * dt;
      e.x += e.vx * dt;
      e.y += e.vy * dt;
    }
  }

  // Chispas en un punto (al entrar y al salir).
  function chispas(x, y) {
    for (let i = 0; i < 16; i++) {
      const ang = (i / 16) * Math.PI * 2 + Math.random() * 0.4;
      const vel = 40 + Math.random() * 70;
      particulas.push({
        x,
        y,
        vx: Math.cos(ang) * vel,
        vy: Math.sin(ang) * vel,
        t: 0,
      });
    }
  }

  // Las chispas salen disparadas, se frenan y se apagan.
  function moverChispas(dt) {
    for (const p of particulas) {
      p.t += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= 1 - 2 * dt;
      p.vy *= 1 - 2 * dt;
    }
    particulas = particulas.filter((p) => p.t < 0.7);
  }

  // Agujeros de gusano: aparecen de a pares cada tanto, giran rápido y se apagan
  // si no entran. Al entrar en uno la nave sale por el otro y gana color.
  function actualizarCumulos(dt, circulos) {
    if (enLinea() && soyAnfitrion()) resolverCierres();
    acumCumulo += dt;
    // Online los crea solo el anfitrión: el invitado los recibe.
    const creaAgujeros = !enLinea() || soyAnfitrion();
    if (
      creaAgujeros &&
      cumulos.length === 0 &&
      !ganado &&
      acumCumulo >= proxCumulo
    ) {
      acumCumulo = 0;
      proxCumulo =
        CUMULO_INTERVALO[0] +
        Math.random() * (CUMULO_INTERVALO[1] - CUMULO_INTERVALO[0]);
      crearPar(circulos[1]);
    }
    let recienPrendido = false;
    for (const c of cumulos) {
      const antes = prendido(c);
      c.t += dt;
      c.ang += CUMULO_GIRO * dt;
      if (!antes && prendido(c)) recienPrendido = true;
    }
    if (recienPrendido) sonarPortal();
    cumulos = cumulos.filter((c) => c.t < CUMULO_VIDA);
    // Fuera de juego (golpeada) la nave no puede entrar a un agujero, y a uno
    // que todavía no se prendió tampoco.
    let entrado =
      stunJugador <= 0 &&
      cumulos.find(
        (c) =>
          prendido(c) &&
          circulos.some(
            (n) => Math.hypot(n.x - c.x, n.y - c.y) < n.r + CUMULO_RADIO,
          ),
      );
    if (entrado && enLinea() && !soyAnfitrion()) {
      // Invitado: no decide el gol, avisa que entró (una vez por agujero) y
      // sale por el otro sin esperar; el anfitrión después lo confirma (ver
      // recibirGol).
      if (!reclamados.has(entrado.id)) {
        reclamados.add(entrado.id);
        enviarOnline({ tipo: "entre", id: entrado.id });
        predecirGolPropio(entrado);
      }
      entrado = null;
    }
    // Online los goles del rival los avisa él (ver golInvitado). Si las dos
    // llegan en el mismo cuadro al mismo par (al mismo agujero o cada una a
    // uno de los dos), es gol para las dos (y si queda 10 a 10, gol de oro:
    // ver revisarFin). A pares distintos, la del rival entra en el cuadro
    // siguiente.
    let deRival = null;
    if (!enLinea() && rival && rival.stun <= 0) {
      const circ = circulosRival();
      deRival =
        cumulos.find((c) =>
          circ.some(
            (n) => Math.hypot(n.x - c.x, n.y - c.y) < n.r + CUMULO_RADIO,
          ),
        ) || null;
      if (deRival && entrado && deRival !== entrado && deRival !== entrado.par)
        deRival = null;
    }
    // Online, el anfitrión puede llegar a un par que el invitado cerró hace
    // menos de EMPATE_MS: también es gol (ver empateTardio).
    if (!entrado && enLinea() && soyAnfitrion() && stunJugador <= 0)
      empateTardio(circulos);
    if (entrado) cumulosTomados++;
    if (deRival) golesRival++;
    if (entrado) golPropio(entrado);
    if (deRival) golRival(deRival, !!entrado); // si fueron juntas, habla la del jugador
    if (entrado && enLinea()) anotarCierreAnfitrion(entrado);
    else if ((entrado || deRival) && !esTutorial()) revisarFin();
    moverChispas(dt);
    for (const e of numeroEstrellas) actualizarNumeroEstrella(e, dt);
    numeroEstrellas = numeroEstrellas.filter(
      (e) => e.t < NUMERO_CAE_A + NUMERO_CAIDA,
    );
  }

  // Un gol de la nave del jugador (ya contado en cumulosTomados): desaparece
  // por este agujero y aparece por el otro (ambos se cierran con chispas), y
  // se pinta un poco más.
  function golPropio(entrado) {
    const salida = entrado.par || entrado;
    chispas(entrado.x, entrado.y);
    if (window.shipPlace) window.shipPlace(salida.x, salida.y, true);
    cumulos = cumulos.filter((c) => c !== entrado && c !== salida);
    if (esTutorial()) {
      // Como en los otros modos: en el de salida las estrellas forman el
      // número del pasaje, 1 en el primero ... 10 en el último (como la voz),
      // y la nave se pinta 1/10 por pasaje. Con el último, en vez del final
      // de las navecitas, GANASTE (con la nota) y después al menú.
      // Blancas al principio y, a medida que se cuentan pasajes, cada vez más
      // salmón (el del sitio), como el segundero.
      crearNumeroEstrellas(
        salida.x,
        salida.y,
        cumulosTomados,
        mezclarHex(
          "#ffffff",
          TIMER_COLOR_FIN,
          (cumulosTomados - 1) / (CUMULOS_PARA_COLOR - 1),
        ),
      );
      sonarCruce();
      decirGol(cumulosTomados);
      colorObjetivo = Math.min(1, cumulosTomados / CUMULOS_PARA_COLOR);
      if (cumulosTomados >= CUMULOS_PARA_COLOR) terminarPartida("vos");
    } else {
      // En el de salida las estrellas del cierre forman el número de goles:
      // con dos naves se cuentan para arriba, 1 en el primero ... 10 en el último.
      // Del color que le tocó al jugador (el mismo del halo de su nave).
      crearNumeroEstrellas(salida.x, salida.y, cumulosTomados, colorPropio());
      sonarCruce();
      // Online el gol todavía se confirma: la voz del final va en revisarFin.
      decirGol(
        cumulosTomados,
        vozDeHito(true),
        !enLinea() && ganaria(cumulosTomados, golesRival),
      );
      mostrarTiempo();
      actualizarColor();
    }
  }

  // --- Empates y gol de oro --------------------------------------------------
  // Si las dos naves llegan al mismo par casi juntas (menos de EMPATE_MS entre
  // una y otra), es gol para las dos. Se gana llegando a 10 con más goles que
  // el otro: si queda 10 a 10, gol de oro (el próximo gol gana; si ese
  // también es de las dos, se sigue).
  const EMPATE_MS = 50;
  const GOL_DE_ORO_AVISO = 2.5; // s con el cartel GOL DE ORO en el marcador

  // ¿Ese gol (con a goles contra b) gana la partida?
  const ganaria = (a, b) => a >= CUMULOS_PARA_COLOR && a > b;

  // Después de cada gol (o de dos a la vez): si alguien llegó a 10 y va
  // ganando, termina; si están iguales, gol de oro. Online, el anfitrión
  // espera a que se resuelvan sus goles a confirmar (ver resolverCierres).
  function revisarFin() {
    if (fin || esTutorial()) return;
    if (enLinea() && soyAnfitrion() && cierres.some((c) => c.pendiente)) return;
    const mios = cumulosTomados;
    const suyos = golesRival;
    if (Math.max(mios, suyos) < CUMULOS_PARA_COLOR) return;
    if (mios === suyos) {
      golDeOroHasta = tiempo + GOL_DE_ORO_AVISO;
      mostrarTiempo();
      // "Uno más": sin online ya la dijo el gol (ver vozDeHito); online, recién
      // acá se sabe que es empate. Después de la voz que esté sonando.
      if (enLinea()) vozPendiente = alAzar(vocesUltimoPunto);
      return;
    }
    const gano = mios > suyos ? "vos" : "pc";
    // Online la felicitación espera a que el gol quede confirmado (sin online
    // ya la dijo el gol, ver decirGol).
    if (enLinea() && gano === "vos") vozPendiente = alAzar(vocesFelicita);
    terminarPartida(gano);
  }

  // Fuerza con la que una lluvia busca a su nave, la misma cuenta para las dos:
  // siempre BUSQUEDA_BASE, y sube hasta 1 a partir de los QUIETA_SEG segundos
  // sin moverse o mientras haya presión por dar vueltas al mapa; con presión,
  // además, corrigen más rápido de costado (BUSQUEDA_VUELTA_EXTRA).
  function fuerzaBusqueda(segQuieta, presion) {
    const quieta = Math.max(
      0,
      Math.min(1, (segQuieta - QUIETA_SEG) / BUSQUEDA_RAMPA),
    );
    return (
      (BUSQUEDA_BASE + (1 - BUSQUEDA_BASE) * Math.max(quieta, presion)) *
      (1 + BUSQUEDA_VUELTA_EXTRA * presion)
    );
  }

  function actualizar(dt, circulos) {
    if (!ganado) tiempo += dt; // al ganar el segundero queda parado
    if (!ganado) actualizarVoces();

    if (!rival && !ganado && !esTutorial()) crearRival();

    // En el tutorial es una sola lluvia, como en el sitio.
    const intervalo =
      Math.max(SPAWN_MIN, SPAWN_INICIAL - tiempo * SPAWN_RAMPA) *
      (esTutorial() ? 1 : LLUVIA_MENOS);
    if (tiempo > gracia && !ganado) {
      // Cada nave tiene su lluvia; la de la golpeada se corta mientras está
      // fuera de juego y mientras parpadea (las que ya venían siguen cayendo).
      if (stunJugador <= 0 && invulJugador <= 0) {
        acumSpawn += dt;
        if (acumSpawn >= intervalo) {
          acumSpawn = 0;
          poligonos.push(crearPoligono(circulos[1]));
        }
      }
      // Online la lluvia del rival la maneja su PC y llega por la red.
      if (!enLinea() && rival && rival.stun <= 0 && rival.invul <= 0) {
        acumSpawnRival += dt;
        if (acumSpawnRival >= intervalo) {
          acumSpawnRival = 0;
          poligonosRival.push(crearPoligono(rival));
        }
      }
    }

    actualizarCumulos(dt, circulos);

    const v = vista();
    const abajo = v.y + v.h;
    // Dar la vuelta al mapa una y otra vez no es una forma de esconderse: cada
    // vuelta suma presión (baja sola con el tiempo) y, mientras la haya, la
    // lluvia de esa nave busca como si estuviera quieta y además corrige más
    // rápido de costado (ver BUSQUEDA_VUELTA_EXTRA).
    const vueltas = window.shipVueltas || 0;
    // Y cada vuelta trae piedras extra, apuntadas a esa nave y más rápidas
    // (a la del jugador, si no está fuera de juego; a la del rival, ídem).
    const nuevasJugador = Math.max(0, vueltas - vueltasVistas);
    const nuevasRival = Math.max(0, vueltasRival - vueltasRivalVistas);
    vueltasRivalVistas = vueltasRival;
    if (circulos[1] && stunJugador <= 0)
      for (let i = 0; i < nuevasJugador * VUELTA_PIEDRAS; i++)
        poligonos.push(crearPoligono(circulos[1], true));
    if (rival && rival.stun <= 0)
      for (let i = 0; i < nuevasRival * VUELTA_PIEDRAS; i++)
        poligonosRival.push(crearPoligono(rival, true));
    if (vueltas !== vueltasVistas) {
      anotarVuelta("jugador", window.shipVueltaLado);
      presionJugador = Math.min(
        1,
        presionJugador +
          PRESION_POR_VUELTA * Math.max(0, vueltas - vueltasVistas),
      );
      vueltasVistas = vueltas;
    }
    presionJugador = Math.max(0, presionJugador - PRESION_BAJA * dt);
    presionRival = Math.max(0, presionRival - PRESION_BAJA * dt);
    const busqueda = fuerzaBusqueda(tQuieta, presionJugador);
    const busquedaRival = fuerzaBusqueda(rival ? rival.quieta : 0, presionRival);
    // Fuera de juego o parpadeando, la nave no es el foco de su lluvia: las
    // que ya venían dejan de corregir y siguen derecho.
    const focoJugador =
      stunJugador > 0 || invulJugador > 0 ? null : circulos[1];
    const focoRival =
      rival && rival.stun <= 0 && rival.invul <= 0 ? rival : null;
    moverPoligonos(poligonos, focoJugador, busqueda, dt);
    if (enLinea()) seguirRivalOnline(dt);
    else moverPoligonos(poligonosRival, focoRival, busquedaRival, dt);
    // Se descartan los que ya salieron por abajo, compactando el mismo array.
    // Nunca antes de haber pasado la nave, aunque esté más abajo de lo que se ve
    // (la nave puede salirse un poco de la pantalla): así no se puede esconder
    // ahí y pasarse el minutero sin chocar.
    const suelo = circulos.reduce((m, c) => Math.max(m, c.y + c.r), abajo);
    descartarPasados(poligonos, suelo);
    if (!enLinea())
      descartarPasados(
        poligonosRival,
        rival ? Math.max(abajo, rival.y + 80) : abajo,
      );

    actualizarRival(dt, circulos);

    // Durante el final (ya completó el color) no se choca: el nivel está ganado.
    if (!ganado && esTutorial()) {
      // Como en el sitio: la piedra golpea, la nave cae y la partida reinicia.
      const golpe = piedraQueToca(poligonos, circulos);
      if (golpe) chocar(golpe.p, golpe.c);
    } else if (!ganado) {
      // Cualquier piedra golpea a cualquier nave, sea de la lluvia que sea.
      if (stunJugador <= 0 && invulJugador <= 0) {
        const golpe =
          piedraQueToca(poligonos, circulos) ||
          piedraQueToca(poligonosRival, circulos);
        if (golpe) golpearJugador(golpe.p, golpe.c);
      }
      // Online a la nave del rival la golpea (o no) su PC: llega en su estado.
      if (!enLinea() && rival && rival.stun <= 0 && rival.invul <= 0) {
        const circ = circulosRival();
        const golpe =
          piedraQueToca(poligonos, circ) || piedraQueToca(poligonosRival, circ);
        if (golpe) golpearRival(golpe.p, golpe.c);
      }
      repelerNaves(circulos, dt);
    }
    mostrarTiempo();
  }

  // Mueve una lluvia: se desvían hacia su nave mientras estén más arriba que
  // COMPROMISO; más cerca ya no corrigen (siguen con el rumbo que traen, se
  // puede esquivar) y las que ya pasaron siguen derecho.
  // En todos los modos el mapa es un cilindro: las naves dan la vuelta por
  // los costados (ver script.js y moverRival), así que las piedras
  // también: te buscan por el camino más corto de costado (aunque sea cruzando
  // el borde) y, si lo cruzan, reaparecen del otro lado. Si no, salirse por un
  // costado alcanzaba para que nunca te llegaran. El largo de la vuelta es el
  // mismo que el de la nave (el ancho más el margen de cada lado).
  const MUNDO_VUELTA_MARGEN = 100;
  // Cuánto se pueden salir del mapa antes de dar la vuelta: con dos jugadores se
  // ve el mapa entero y pueden pasar el borde; en el resto (contra la PC, el
  // tutorial y online) la cámara hace zoom y lo que se sale queda fuera de la
  // vista (contra la PC, donde solo la IA sabe qué pasa: ventaja para ella),
  // así que ahí dan la vuelta justo en el borde.
  function margenVuelta() {
    return modo === "dos" ? MUNDO_VUELTA_MARGEN : 0;
  }

  // La diferencia horizontal dx llevada al camino más corto de los dos (entre
  // -largo/2 y largo/2) en el mapa que da la vuelta.
  function difVuelta(dx) {
    const largo = window.innerWidth + margenVuelta() * 2;
    return ((((dx + largo / 2) % largo) + largo) % largo) - largo / 2;
  }

  function moverPoligonos(lista, centro, busqueda, dt) {
    const vuelta = !!window.vueltaCostados;
    const W = window.innerWidth;
    const margen = margenVuelta();
    const largo = W + margen * 2;
    for (const p of lista) {
      let objetivo = p.vx;
      if (centro && p.y < centro.y - COMPROMISO) {
        const max = p.vy * BUSQUEDA_MAX * busqueda;
        const dx = vuelta ? difVuelta(centro.x - p.x) : centro.x - p.x;
        objetivo = Math.max(-max, Math.min(max, dx * 2));
      } else if (!centro || p.y >= centro.y) {
        objetivo = 0;
      }
      p.vx += (objetivo - p.vx) * Math.min(1, dt * BUSQUEDA_AGIL);
      p.x += p.vx * dt;
      if (vuelta) {
        if (p.x < -margen) p.x += largo;
        else if (p.x > W + margen) p.x -= largo;
      }
      p.y += p.vy * dt;
      p.ang += p.giro * dt;
      actualizarPuntos(p);
    }
  }

  function descartarPasados(lista, suelo) {
    let quedan = 0;
    for (const p of lista) if (p.y - p.radio < suelo) lista[quedan++] = p;
    lista.length = quedan;
  }

  // La primera piedra de la lista que toca alguno de los círculos, o null.
  // Descarte rápido: si el círculo está más lejos que el radio del polígono
  // (todos sus vértices caen dentro de p.radio del centro) no hace falta probar
  // borde por borde.
  function piedraQueToca(lista, circulos) {
    for (const p of lista) {
      const c = circulos.find((c) => {
        const dx = c.x - p.x;
        const dy = c.y - p.y;
        const rr = p.radio + c.r;
        return (
          dx * dx + dy * dy <= rr * rr &&
          circuloTocaPoligono(c.x, c.y, c.r, p.pts)
        );
      });
      if (c) return { p, c };
    }
    return null;
  }

  // El golpe: la nave sale despedida hacia abajo (con parte de lo que traía la
  // piedra) y para el lado opuesto al que le pegaron, girando, como siempre.
  // Pero no se reinicia la partida: cae un rato, desaparece y a los STUN
  // segundos vuelve donde la golpearon, con los goles que tenía.
  function caidaPorGolpe(p, tocado) {
    const lado = tocado.x >= p.x ? 1 : -1;
    const fuerza = Math.min(1, Math.abs(tocado.x - p.x) / p.radio);
    return {
      x: lado * GOLPE_LATERAL * (0.4 + 0.6 * fuerza),
      y: p.vy * 0.7,
      giro: lado * GOLPE_GIRO * (0.7 + Math.random() * 0.6),
    };
  }

  // El choque del juego del sitio (tutorial): todo se frena, la nave cae
  // golpeada y a los DURACION_CHOQUE segundos arranca otra partida (ver el
  // "if (choque)" del cuadro).
  function chocar(p, tocado) {
    choque = true;
    tChoque = 0;
    golpeadora = p;
    frenarMusica();
    cortarVoz();
    vozPendiente = null;
    sonarPerder();
    naveCae = caidaPorGolpe(p, tocado);
  }

  function golpearJugador(p, tocado) {
    stunJugador = STUN;
    tChoque = 0;
    naveCae = caidaPorGolpe(p, tocado);
    const pose = window.shipPose;
    reaparecer = pose
      ? { x: pose.x + cajaNave / 2, y: pose.y + cajaNave / 2 }
      : null;
    sonarPerder();
  }

  function golpearRival(p, tocado) {
    rival.stun = STUN;
    rival.t = 0;
    rival.hx = rival.x;
    rival.hy = rival.y;
    rival.cae = caidaPorGolpe(p, tocado);
    rival.vx = 0;
    rival.vy = 0;
    chispas(tocado.x, tocado.y);
    sonarPerder(); // el mismo ruido que cuando golpean a la nave del jugador
  }

  // Mientras la nave del jugador está fuera de juego: primero cae golpeada
  // (DURACION_CHOQUE), después queda oculta y quieta, y al final reaparece.
  function actualizarStunJugador(dt) {
    stunJugador -= dt;
    tChoque += dt;
    if (tChoque < DURACION_CHOQUE) {
      naveCae.y += GRAVEDAD * dt;
      if (window.shipMove)
        window.shipMove(naveCae.x * dt, naveCae.y * dt, naveCae.giro * dt);
    } else {
      ship.classList.add("fuera-de-juego");
      if (window.shipMove) window.shipMove(0, 0); // sin control mientras tanto
    }
    if (stunJugador <= 0) {
      // Vuelve donde la golpearon y parpadea un rato sin que nada la afecte.
      stunJugador = 0;
      ship.classList.remove("fuera-de-juego");
      if (reaparecer && window.shipPlace)
        window.shipPlace(reaparecer.x, reaparecer.y);
      reaparecer = null;
      invulJugador = INVULNERABLE;
      ship.classList.add("invulnerable");
    }
  }

  function actualizarInvulJugador(dt) {
    if (invulJugador <= 0) return;
    invulJugador -= dt;
    if (invulJugador <= 0) {
      invulJugador = 0;
      ship.classList.remove("invulnerable");
    }
  }

  // --- La PC -----------------------------------------------------------------

  function crearRival() {
    if (modo === "pc") aplicarNaveRival(eleccionPC);
    // En su esquina de abajo, la contraria a la del jugador (ver
    // xEsquinaRival): online la pisa enseguida la posición real que llega del
    // rival, pero hasta que llega el primer estado que se vea en su lugar.
    rival = {
      x: xEsquinaRival(),
      y: window.innerHeight * POSICION_Y_INICIAL,
      vx: 0,
      vy: 0,
      rot: 0,
      stun: 0,
      invul: 0,
      t: 0,
      cae: null,
      hx: 0, // donde la golpearon (ahí reaparece)
      hy: 0,
      energia: 1, // para acelerar, solo la PC (ver RIVAL_BOOST_*)
      boosteando: false,
      quieta: 0, // segundos seguidos sin moverse (como tQuieta del jugador)
    };
  }

  // Tamaño de la nave en el mundo: la del jugador vive en pantalla (su caja
  // mide cajaNave px, escalada por shipPose.escala) y el mundo es la pantalla
  // sin el zoom de la cámara. La PC se dibuja y choca del mismo tamaño.
  function escalaNaveMundo() {
    const p = window.shipPose;
    return (p && p.listo ? Math.abs(p.escala) : 1) / cam.z;
  }

  const circulosRivalBuf = NAVE_CIRCULOS.map(() => ({ x: 0, y: 0, r: 0 }));
  function circulosRival() {
    if (!rival) return SIN_CIRCULOS;
    const k = escalaNaveMundo();
    const factor = cajaNave / CAJA_NAVE;
    const mitad = cajaNave / 2;
    const rad = (rival.rot * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    for (let i = 0; i < NAVE_CIRCULOS.length; i++) {
      const c = NAVE_CIRCULOS[i];
      const px = (c.x * factor - mitad) * k;
      const py = (c.y * factor - mitad) * k;
      const o = circulosRivalBuf[i];
      o.x = rival.x + px * cos - py * sin;
      o.y = rival.y + px * sin + py * cos;
      o.r = c.r * factor * k;
    }
    return circulosRivalBuf;
  }

  // Hacia dónde quiere ir la PC (un vector, no hace falta que mida 1): se
  // escapa de las piedras que se le vienen encima (de cualquiera de las dos
  // lluvias) y, si no hay peligro, va a un agujero; sin agujeros, pasea por el
  // mapa. Qué tan bien lo hace depende de la dificultad (ver DIFICULTADES).
  // suave (opcional): desde cuántos px del destino va frenando.
  function rumboRival(dt) {
    const dif = DIFICULTADES[dificultad] || DIFICULTADES.regular;
    const H = window.innerHeight;
    // A ciegas (ver CIEGA_*): cuánto hace que tiene el centro fuera de la pantalla.
    const ciega = rival.y > H;
    rival.ciegaT = ciega ? (rival.ciegaT || 0) + dt : 0;
    const reflejos = ciega
      ? Math.max(dif.reflejos, CIEGA_REFLEJOS)
      : dif.reflejos;
    let dx = 0;
    let dy = 0;
    const huir = (p) => {
      const ddx = difVuelta(rival.x - p.x);
      const ddy = rival.y - p.y;
      // Las que ya pasaron por debajo no asustan.
      if (ddy < -p.radio) return;
      const dist = Math.hypot(ddx, ddy) || 1;
      // A ciegas, las que están fuera de la pantalla no las ve.
      const fuera = p.y - p.radio > H || p.y + p.radio < 0;
      if (dist >= dif.peligro + p.radio || (ciega && fuera)) {
        p.vistaPC = 0;
        return;
      }
      // Reflejos: se da cuenta recién cuando lleva esos s cerca.
      p.vistaPC = (p.vistaPC || 0) + dt;
      if (p.vistaPC < reflejos) return;
      const peso = (dif.peligro + p.radio - dist) / dif.peligro;
      // Sobre todo para el costado: esquivar para arriba contra una piedra
      // que cae no sirve de mucho.
      dx += (ddx / dist) * peso * 2;
      dy += (ddy / dist) * peso * 0.6;
    };
    for (const p of poligonos) huir(p);
    for (const p of poligonosRival) huir(p);
    if (Math.hypot(dx, dy) > 0.25) return { x: dx, y: dy, boost: false };

    // Se dio cuenta de que está fuera de la pantalla: primero vuelve (derecho
    // para arriba, esquivando de costado lo que vea).
    if (rival.ciegaT >= CIEGA_DARSE_CUENTA)
      return { x: dx, y: -1, boost: false };

    // Dudas: de vez en cuando (más cuanto más fácil) se queda un momento sin
    // decidir adónde ir (a las piedras las sigue esquivando).
    rival.duda = Math.max(0, (rival.duda || 0) - dt);
    if (!rival.duda && Math.random() < dif.error * DUDA_POR_SEG * dt)
      rival.duda = DUDA_SEG;
    if (rival.duda) return { x: dx, y: dy, boost: false };

    // El agujero al que va: el más cercano, contando también el camino por el
    // costado (el mapa da la vuelta), recién cuando se dio cuenta de que está
    // (dif.atencion s después de que aparece). Con errores, a veces elige el
    // otro del par, el más lejano. Lo elige una vez y va a ese hasta que se
    // cierra.
    const vistos = cumulos.filter(
      (c) => prendido(c) && c.t - (c.prendeT || 0) >= dif.atencion,
    );
    let meta = vistos.find((c) => c.id === rival.meta);
    if (!meta && vistos.length) {
      let dMejor = Infinity;
      for (const c of vistos) {
        const d = Math.hypot(difVuelta(c.x - rival.x), c.y - rival.y);
        if (d < dMejor) {
          dMejor = d;
          meta = c;
        }
      }
      if (meta.par && Math.random() < dif.error) meta = meta.par;
      rival.meta = meta.id;
    }
    if (meta) {
      const mx = difVuelta(meta.x - rival.x);
      const my = meta.y - rival.y;
      return {
        x: mx + dx * 40,
        y: my + dy * 40,
        // Con el agujero lejos y sin piedras encima, acelera (ver RIVAL_BOOST_DIST).
        boost: Math.hypot(mx, my) > RIVAL_BOOST_DIST,
      };
    }

    // Sin agujeros, pasea por su cuenta: va a un punto al azar del mapa (no
    // muy arriba, de donde vienen las piedras) y al llegar, o a los
    // PASEO_SEG, elige otro.
    const W = window.innerWidth;
    const p = rival.paseo;
    if (
      !p ||
      tiempo > p.hasta ||
      Math.hypot(difVuelta(p.x - rival.x), p.y - rival.y) < PASEO_LLEGO
    ) {
      rival.paseo = {
        x: W * (0.1 + Math.random() * 0.8),
        y: H * (0.3 + Math.random() * 0.55),
        hasta:
          tiempo +
          PASEO_SEG[0] +
          Math.random() * (PASEO_SEG[1] - PASEO_SEG[0]),
      };
    }
    const q = rival.paseo;
    return {
      x: difVuelta(q.x - rival.x) + dx * 40,
      y: q.y - rival.y + dy * 40,
      boost: false,
      suave: PASEO_FRENO,
    };
  }

  function actualizarRival(dt, circulos) {
    if (!rival) return;
    if (enLinea()) return; // ver seguirRivalOnline

    // La luz de la PC: prendida mientras haya agujeros en juego (cuando hay
    // algo que buscar), apagada el resto del tiempo. Es solo lo que se ve.
    if (modo === "pc") luzRival = cumulos.length > 0;
    const antesX = rival.x;
    const antesY = rival.y;
    moverRival(dt, circulos);
    // El fuego se guía por lo que se movió de verdad (como el de la nave del
    // jugador), en px/s de pantalla.
    // Un salto grande en un cuadro es un teletransporte, no velocidad.
    const dist = Math.hypot(rival.x - antesX, rival.y - antesY) * cam.z;
    actualizarFuegoRival(dt, dt > 0 && dist < 250 ? dist / dt : 0);
  }

  // Fuego de la PC: el mismo de la nave del jugador (updateShipFire en
  // script.js, mismos números), dibujado en su propio lienzo de 203x300. Quieta
  // arde bajito; al moverse se alarga y se agita. Cada franja horizontal del
  // dibujo se corre de costado (más cuanto más cerca de la punta), el largo
  // parpadea y el ancho respira. La PC no usa boost.
  const FUEGO_TOP = 196;
  const FUEGO_BOTTOM = 270;
  const FUEGO_X = 60;
  const FUEGO_W = 90;
  const FUEGO_CX = 102;
  const FUEGO_FRANJA = 2;
  function actualizarFuegoRival(dt, velocidad) {
    animarFuego(fuegoRival, lienzoFuegoRival, fuegoTenido(naveRival.fuego), dt, velocidad);
  }

  // Un fuego (f: { nivel, fase }) dibujado en lienzo (203x300) desde fuente
  // (el dibujo de cohete_fuego, tal cual o teñido: ver fuegoTenido).
  function animarFuego(f, lienzo, fuente, dt, velocidad) {
    const meta = Math.max(0, Math.min(1, (velocidad - 15) / (75 - 15)));
    const tau = meta > f.nivel ? 0.08 : 0.6;
    f.nivel += (meta - f.nivel) * (1 - Math.exp(-dt / tau));
    if (f.nivel < 0.004 && meta === 0) f.nivel = 0;
    f.fase += dt * (0.35 + 0.65 * f.nivel);
    if (!fuente || (fuente === imgFuego && (!imgFuego.complete || !imgFuego.naturalWidth)))
      return;
    const s = f.fase;
    const amp = 0.15 + 0.85 * f.nivel;
    const largo =
      (0.55 + 0.45 * f.nivel) *
      (1 +
        amp *
          (0.1 * Math.sin(s * 23) +
            0.06 * Math.sin(s * 37 + 1) +
            0.04 * Math.sin(s * 11 + 2)));
    const ancho = 1 + amp * 0.06 * Math.sin(s * 29 + 0.5);
    const c = lienzo.getContext("2d");
    c.clearRect(0, 0, lienzo.width, lienzo.height);
    for (let sy = FUEGO_TOP; sy < FUEGO_BOTTOM; sy += FUEGO_FRANJA) {
      const p = (sy - FUEGO_TOP) / (FUEGO_BOTTOM - FUEGO_TOP); // 0 motores .. 1 punta
      const sh = Math.min(FUEGO_FRANJA, FUEGO_BOTTOM - sy);
      const dy = FUEGO_TOP + (sy - FUEGO_TOP) * largo;
      const dh = sh * largo + 0.6;
      const vaiven =
        amp *
        8 *
        p *
        p *
        (Math.sin(s * 14 - p * 7) * 0.7 + Math.sin(s * 23 - p * 11 + 1) * 0.3);
      const dx = FUEGO_CX + (FUEGO_X - FUEGO_CX) * ancho + vaiven;
      c.drawImage(
        fuente,
        FUEGO_X,
        sy,
        FUEGO_W,
        sh,
        dx,
        dy,
        FUEGO_W * ancho,
        dh,
      );
    }
  }

  function moverRival(dt, circulos) {
    if (rival.stun > 0) {
      rival.quieta = 0; // como la del jugador: golpeada no cuenta como quieta
      rival.stun -= dt;
      rival.t += dt;
      if (rival.cae && rival.t < DURACION_CHOQUE) {
        rival.cae.y += GRAVEDAD * dt;
        rival.x += rival.cae.x * dt;
        rival.y += rival.cae.y * dt;
        rival.rot += rival.cae.giro * dt;
      }
      if (rival.stun <= 0) {
        // Vuelve donde la golpearon, derecha y quieta, y parpadea un rato.
        rival.stun = 0;
        rival.cae = null;
        rival.x = rival.hx;
        rival.y = rival.hy;
        rival.vx = 0;
        rival.vy = 0;
        rival.rot = 0;
        rival.invul = INVULNERABLE;
      }
      return;
    }
    if (rival.invul > 0) rival.invul = Math.max(0, rival.invul - dt);

    // Misma física que la nave del jugador 1 (window.naveFisica, de script.js):
    // empuje constante en la dirección elegida y freno exponencial, en
    // subpasos de ~1 cuadro de 60 Hz.
    const fisica = window.naveFisica;
    if (!fisica) return;
    let gx = 0;
    let gy = 0;
    let empuje = fisica.empuje;
    const pad = window.j2Joystick ? primerJoystick() : null;
    if (modo === "dos" && pad) {
      // La maneja el jugador 2 con el joystick, igual que el joystick a la nave
      // del jugador 1 en script.js: stick con zona muerta, la cruceta lo pisa y
      // RB acelera.
      [gx, gy] = fisica.stick(pad.axes[0] || 0, pad.axes[1] || 0);
      const apretado = (i) => !!(pad.buttons[i] && pad.buttons[i].pressed);
      if (apretado(PAD_CRUCETA.left)) gx = -1;
      else if (apretado(PAD_CRUCETA.right)) gx = 1;
      if (apretado(PAD_CRUCETA.up)) gy = -1;
      else if (apretado(PAD_CRUCETA.down)) gy = 1;
      if (apretado(PAD_RB)) empuje = fisica.empujeBoost;
    } else if (modo === "dos") {
      // La maneja el jugador 2 con las flechas (o WASD, con los lados dados
      // vuelta), igual que las flechas a la nave del jugador 1 en script.js
      // (cada eje -1/0/1, sin normalizar la diagonal).
      const t = window.tecladoAlReves ? teclasJ2Wasd : teclasJ2;
      gx = (t.right ? 1 : 0) - (t.left ? 1 : 0);
      gy = (t.down ? 1 : 0) - (t.up ? 1 : 0);
      if (t.boost) empuje = fisica.empujeBoost;
    } else {
      // A fondo hacia donde quiere ir, como un stick a fondo o las flechas:
      // del círculo al cuadrado (en diagonal, (1, 1) y no (0,7, 0,7)), así en
      // diagonal va tan rápido como el jugador con dos flechas apretadas.
      const r = rumboRival(dt);
      const m = Math.max(Math.abs(r.x), Math.abs(r.y), r.suave || 0);
      gx = m > 1e-3 ? r.x / m : 0;
      gy = m > 1e-3 ? r.y / m : 0;
      // Acelera con energía limitada (ver RIVAL_BOOST_*): arranca si tiene la
      // mínima y sigue mientras le quede.
      const boost = (DIFICULTADES[dificultad] || DIFICULTADES.regular).boost;
      let e = rival.energia ?? 1;
      const quiere =
        r.boost &&
        boost !== false &&
        (!boost || (rival.boosteando ? e > 0 : e >= RIVAL_BOOST_MIN));
      rival.boosteando = quiere;
      if (boost) e += (quiere ? -boost.gasto : boost.recupera) * dt;
      rival.energia = Math.max(0, Math.min(1, e));
      if (quiere) empuje = fisica.empujeBoost;
    }
    if (fin) {
      // Terminó la partida: nadie la maneja, sigue con lo que traía.
      gx = 0;
      gy = 0;
    }
    const cuadros = dt * 60;
    const subpasos = Math.max(1, Math.round(cuadros));
    const paso = cuadros / subpasos;
    const freno = Math.pow(fisica.freno, paso);
    for (let i = 0; i < subpasos; i++) {
      rival.vx += gx * empuje * paso;
      rival.vy += gy * empuje * paso;
      rival.vx *= freno;
      rival.vy *= freno;
      rival.x += rival.vx * paso;
      rival.y += rival.vy * paso;
    }
    // Quieta, con la misma vara que la del jugador (QUIETA_MOV px/s; durante la
    // gracia no cuenta): sus piedras la buscan con más fuerza (fuerzaBusqueda).
    const vel = Math.hypot(rival.vx, rival.vy) * 60; // px por cuadro -> px/s
    rival.quieta =
      tiempo >= gracia && vel < QUIETA_MOV ? rival.quieta + dt : 0;
    const margen = 40;
    if (modo === "dos" || modo === "pc") {
      // Los costados no frenan, dan la vuelta (igual que la nave del
      // jugador, ver el clamp de script.js): reaparece del otro lado con la
      // misma velocidad, más allá del viewport y no pegada a su borde.
      const minX = -margenVuelta();
      const maxX = window.innerWidth + margenVuelta();
      if (rival.x < minX) {
        rival.x = maxX - (minX - rival.x);
        vueltasRival++;
        anotarVuelta("rival", -1);
        presionRival = Math.min(1, presionRival + PRESION_POR_VUELTA);
      } else if (rival.x > maxX) {
        rival.x = minX + (rival.x - maxX);
        vueltasRival++;
        anotarVuelta("rival", 1);
        presionRival = Math.min(1, presionRival + PRESION_POR_VUELTA);
      }
    } else {
      rival.x = Math.max(margen, Math.min(window.innerWidth - margen, rival.x));
    }
    // Llega tan lejos como la del jugador 1: arriba frena con el centro en el
    // borde y abajo puede salirse un poco de la pantalla (la flecha de su
    // color muestra dónde quedó, ver dibujarPunteros). Al frenar pierde la
    // velocidad hacia ese lado, como la del jugador en script.js.
    const yMin = -fisica.fueraArriba;
    const yMax = window.innerHeight + fisica.fueraAbajo;
    if (rival.y < yMin) {
      rival.y = yMin;
      rival.vy = Math.max(0, rival.vy);
    } else if (rival.y > yMax) {
      rival.y = yMax;
      rival.vy = Math.min(0, rival.vy);
    }

    // Gira igual que la nave del jugador con las flechas en script.js: hacia
    // donde se la empuja (0° = nariz arriba), un 25 % de lo que falta por
    // cuadro de 60 Hz, y sin empuje se queda mirando para donde estaba.
    if (gx !== 0 || gy !== 0) {
      const meta = (Math.atan2(gy, gx) * 180) / Math.PI + 90;
      let d = meta - rival.rot;
      d = ((((d + 180) % 360) + 360) % 360) - 180;
      rival.rot += d * (1 - Math.pow(1 - 0.25, cuadros));
    }
  }

  // Cerca una de la otra, las naves se repelen: cada una recibe un empujón
  // para su lado, más fuerte cuanto más cerca (pegadas le gana al motor, así
  // que no llegan a chocarse). Ninguna se lastima y ninguna pierde el control.
  function repelerNaves(circulos, dt) {
    if (!rival || rival.stun > 0 || stunJugador > 0) return;
    if (rival.invul > 0 || invulJugador > 0) return; // parpadeando no la afecta
    const a = circulos[1];
    const b = circulosRival()[1];
    if (!a || !b) return;
    const dx = b.x - a.x;
    const dy = b.y - a.y;
    const dist = Math.hypot(dx, dy) || 1;
    const largoNave = cajaNave * escalaNaveMundo();
    const alcance = largoNave * REPELER_ALCANCE;
    if (dist >= alcance) return;
    const k = (alcance - dist) / alcance; // 0 en el borde del alcance .. 1 pegadas
    const empuje = REPELER_FUERZA * k * k * dt * 60; // px por cuadro de 60 Hz
    const nx = dx / dist;
    const ny = dy / dist;
    // La velocidad de la nave del jugador está en px de pantalla por cuadro,
    // que para ella es lo mismo que px del mundo (la cámara está anclada ahí).
    if (window.shipPush) window.shipPush(-nx * empuje, -ny * empuje);
    // Online a la nave del rival la empuja su propia PC (hace esta misma
    // cuenta del otro lado).
    if (enLinea()) return;
    rival.vx += nx * empuje;
    rival.vy += ny * empuje;
    // Si igual se llegaron a encimar (venían las dos a toda velocidad de frente),
    // se corre la PC lo que falta: nunca quedan una encima de la otra.
    const minimo = largoNave * REPELER_MINIMO;
    if (dist < minimo) {
      rival.x += nx * (minimo - dist);
      rival.y += ny * (minimo - dist);
    }
  }

  // Un gol de la nave del rival, PC o jugador 2 (ya contado en golesRival).
  // callado: si fue a la vez que el del jugador, habla solo la de él.
  function golRival(entrado, callado) {
    const salida = entrado.par || entrado;
    chispas(entrado.x, entrado.y);
    chispas(salida.x, salida.y);
    rival.x = salida.x; // sale por el otro, con el rumbo que traía
    rival.y = salida.y;
    cumulos = cumulos.filter((c) => c !== entrado && c !== salida);
    // Igual que el gol propio, pero del color que le tocó al rival (PC o
    // jugador 2: el mismo del halo de esa nave).
    crearNumeroEstrellas(salida.x, salida.y, golesRival, colorRival());
    actualizarColor();
    sonarCruce();
    // Con dos jugadores la voz también le cuenta los goles al jugador 2.
    if (callado) {
      // (habla la del jugador)
    } else if (modo === "dos") {
      decirGol(golesRival, vozDeHito(false), ganaria(golesRival, cumulosTomados));
    } else {
      decirHitoRival();
    }
    mostrarTiempo();
  }

  // El color de la partida (las dos naves, el fondo, las piedras, los agujeros
  // y el marcador) lo marca el que va ganando: avanza cuando alguno llega
  // primero a un número de goles, y como mucho llega a COLOR_MAXIMO, repartido
  // en los 10 goles.
  function actualizarColor() {
    const goles = Math.max(cumulosTomados, golesRival);
    colorObjetivo = COLOR_MAXIMO * Math.min(1, goles / CUMULOS_PARA_COLOR);
  }

  // Alguien llegó a 10: la música se corta, suena la nota de victoria (si
  // ganaste; la voz ya felicita con el último gol) o el sonido de perder, y
  // queda todo quieto con el cartel FIN_DURA segundos. Sin el final de las
  // navecitas del sitio: acá arranca otra partida.
  function terminarPartida(ganador) {
    fin = { t: 0, ganador };
    // Nadie mueve más nada: la nave del jugador sigue de largo con lo que
    // traía, en cámara lenta (script.js), y la del rival igual (moverRival).
    window.shipSinControl = true;
    window.shipLento = FIN_LENTO;
    // Si perdiste, el fondo pasa a blanco y negro; si ganaste queda a color.
    // Con dos jugadores siempre gana alguien de los que están mirando (igual
    // que la nota de abajo), y que el rival se vaya online no es perder.
    scene.classList.toggle("fin-perdiste", ganador === "pc" && modo !== "dos");
    ship.classList.toggle("fin-perdiste", ganador === "pc" && modo !== "dos");
    frenarMusica();
    // Con dos jugadores siempre gana alguien de carne y hueso: suena la nota.
    if (ganador === "vos" || modo === "dos") {
      sonarNota();
    } else {
      cortarVoz();
      vozPendiente = null;
      sonarPerder();
    }
    cumulos = [];
    mostrarTiempo();
  }

  // Vuelve todo a como estaba antes del final de la partida.
  function limpiarFin() {
    window.shipSinControl = false;
    window.shipLento = 1;
    scene.classList.remove("fin-perdiste");
    ship.classList.remove("fin-perdiste");
  }

  // El segundo en cámara lenta del final: las piedras que venían siguen su
  // camino (ya sin buscar a nadie), la nave del rival sigue de largo y las
  // chispas y los números terminan de caer, todo con el dt ya ralentizado. No
  // cae nada nuevo ni golpea nada: la partida ya terminó.
  function animarFin(dt, circulos) {
    // La voz que quedó en espera (online, la felicitación: ver revisarFin).
    if (vozPendiente && !vozSonando) {
      const s = vozPendiente;
      vozPendiente = null;
      decirVoz(s);
    }
    actualizarCumulos(dt, circulos); // ya sin agujeros: solo chispas y números
    moverPoligonos(poligonos, null, 0, dt);
    if (enLinea()) seguirRivalOnline(dt);
    else moverPoligonos(poligonosRival, null, 0, dt);
    actualizarRival(dt, circulos);
  }

  // --- Online -----------------------------------------------------------------
  // Contra otra persona en otra PC, a través del emparejador (servidor/ en este
  // repo, un Worker de Cloudflare): junta de a dos a los que buscan y reenvía
  // lo que manda cada uno. Cada PC maneja su nave y su lluvia, y le manda al
  // otro ENVIO_CADA segundos dónde está, sus piedras y si está golpeada; cada
  // una se fija sola si a su nave la golpea una piedra (suya o del otro). Los
  // agujeros y los goles los decide el anfitrión (el que estaba esperando):
  // el invitado solo avisa "entré a este" y espera que se lo confirme.
  //
  // Las pantallas pueden ser de distinto tamaño: las posiciones viajan como
  // fracción de la pantalla (0 a 1), así los dos ven lo mismo en su lugar.
  // ?servidor=ws://127.0.0.1:8787/buscar para probar con `wrangler dev`.
  const SERVIDOR =
    new URLSearchParams(location.search).get("servidor") ||
    "wss://esc4-emparejador.agustintardella7.workers.dev/buscar";
  const ENVIO_CADA = 0.05; // 20 veces por segundo
  let red = null; // { ws, rol: "anfitrion" | "invitado" | null, estado, pc, canales }
  let acumEnvio = 0;
  let idCumulo = 0; // para que el invitado sepa a qué agujero entró
  const reclamados = new Set(); // agujeros a los que el invitado ya avisó que entró
  // El gol lo confirma el anfitrión, así que entre que el invitado entra a un
  // agujero y le vuelve la confirmación pasa una ida y vuelta entera: el
  // anfitrión lo siente al toque y el invitado no. Para emparejarlos, el
  // invitado sale por el otro agujero ya mismo y cierra el par, y mientras
  // espera la confirmación no le hace caso al anfitrión en eso (que todavía
  // manda el par abierto y el marcador sin ese gol). Si la confirmación no
  // llega (el anfitrión entró primero a ese mismo par), a los PREDICHO_VENCE
  // segundos manda lo que diga él.
  const PREDICHO_VENCE = 3; // s
  const golesPredichos = new Map(); // id del agujero de entrada -> { t, ids: [entrada, salida] }

  function vencerPredichos() {
    const ahora = performance.now();
    for (const [id, g] of golesPredichos)
      if (ahora - g.t > PREDICHO_VENCE * 1000) golesPredichos.delete(id);
  }

  // Los dos agujeros de cada par ya cerrado acá, para no volver a mostrarlos.
  function idsPredichos() {
    const ids = new Set();
    for (const g of golesPredichos.values())
      for (const id of g.ids) ids.add(id);
    return ids;
  }

  // Invitado: el gol que acaba de hacer, sin esperar al anfitrión. Todo lo de
  // siempre menos terminar la partida: el final lo decide él.
  function predecirGolPropio(entrado) {
    const salida = entrado.par || entrado;
    golesPredichos.set(entrado.id, {
      t: performance.now(),
      ids: [entrado.id, salida.id],
    });
    cumulos = cumulos.filter((c) => c !== entrado && c !== salida);
    chispas(entrado.x, entrado.y);
    if (window.shipPlace) window.shipPlace(salida.x, salida.y, true);
    cumulosTomados++;
    crearNumeroEstrellas(salida.x, salida.y, cumulosTomados, colorPropio());
    sonarCruce();
    decirGol(cumulosTomados, vozDeHito(true), false); // el final, en revisarFin
    mostrarTiempo();
    actualizarColor();
  }
  // Para el medidor de ?perf=1 (js/perf-debug.js): por dónde llega el estado
  // del rival, cuántos llegaron y el hueco más largo entre dos (los pone en 0
  // el medidor), y la ida y vuelta de un ping.
  const infoRed = (window.esc4Red = {
    via: "-",
    recibidos: 0,
    huecoMax: 0,
    ultimo: 0,
    ping: null,
    retraso: 0,
  });
  let acumPing = 0;
  // El latido mantiene despierto el WebSocket cuando la conexión directa se
  // llevó todo el juego y por él ya no pasa nada (hay redes que cortan lo que
  // está ocioso). Es un mensaje más: el servidor lo reenvía al rival, que lo
  // ignora, y así cada socket tiene algo de ida (el latido propio) y de vuelta
  // (el del rival). El silencio es cuánto se aguanta sin saber nada del rival
  // antes de darlo por ido: con 20 estados por segundo, tanto silencio es que
  // del otro lado ya no hay nadie.
  const LATIDO_CADA = 20; // s
  const SILENCIO_RIVAL = 10; // s
  let acumLatido = 0;
  const soyAnfitrion = () => !!red && red.rol === "anfitrion";
  const enLinea = () => modo === "online";
  // Contra la PC y con dos jugadores el azul es siempre el jugador. Online el
  // color lo decide quién entró primero: el anfitrión (el que esperaba) es el
  // azul, el invitado el rojo -mismo color en las dos pantallas, ver
  // "emparejado" en recibirOnline-.
  function esAzul() {
    return !enLinea() || soyAnfitrion();
  }
  // Esquina de abajo que le toca a cada nave (ver ESQUINA_X): la azul a la
  // izquierda, la roja a la derecha.
  function xEsquinaJugador() {
    return window.innerWidth * (esAzul() ? ESQUINA_X : 1 - ESQUINA_X);
  }
  function xEsquinaRival() {
    return window.innerWidth * (esAzul() ? 1 - ESQUINA_X : ESQUINA_X);
  }
  // El color de cada uno (piedras, número de goles): el propio y el del
  // rival, según a quién le toque el azul.
  function colorPropio() {
    return esAzul() ? BORDE_JUGADOR : BORDE_RIVAL;
  }
  function colorRival() {
    return esAzul() ? BORDE_RIVAL : BORDE_JUGADOR;
  }
  // Buscando rival o sin conexión: la partida todavía no arranca.
  const esperandoRival = () =>
    enLinea() &&
    (!red || (red.estado !== "jugando" && red.estado !== "se-fue"));

  const r4 = (v) => Math.round(v * 1e4) / 1e4; // fracciones de pantalla
  const r1 = (v) => Math.round(v * 10) / 10; // px y ángulos

  // --- El mapa del online ---------------------------------------------------------
  // El juego se mueve en píxeles (la nave, las piedras, las distancias), así
  // que online los dos tienen que jugar en un mapa del mismo tamaño: si no, el
  // de la pantalla chica tiene todo más cerca y lo cruza más rápido. Al
  // emparejarse cada uno le manda al otro el tamaño de su ventana
  // ("pantalla") y los dos calculan lo mismo: la forma de la ventana más
  // angosta (así ninguno ve más mapa que el otro) y el alto de la más alta
  // (así en la chica el juego se achica, que se ve mejor que agrandarlo). El
  // marco (index.html) pone el juego de ese tamaño y lo escala a la ventana;
  // lo que sobra son franjas de estrellas. Fuera del online el juego ocupa
  // toda la ventana, como siempre.
  const MAPA_ESPERA_OTRO = 3000; // ms: si el otro no manda su pantalla (una versión vieja), se juega con la propia
  const MAPA_ESPERA_MARCO = 1500; // ms: si el marco no cambia el tamaño, se juega igual

  function acordarMapa() {
    if (red.mapa) return;
    const yo = { w: window.innerWidth, h: window.innerHeight };
    const otro = red.otraPantalla;
    const forma = Math.min(yo.w / yo.h, otro.w / otro.h);
    const h = Math.max(yo.h, otro.h);
    const w = Math.round(h * forma);
    red.mapa = { w, h, hasta: performance.now() + MAPA_ESPERA_MARCO };
    // Suelto, sin el marco (juego.html abierto directo), no hay quién lo
    // cambie: se juega con la ventana.
    if (window.parent === window) {
      empezarOnline();
      return;
    }
    window.parent.postMessage({ tipo: "esc4-mapa", w, h }, location.origin);
  }

  // Cada cuadro mientras se mide: arranca cuando el juego ya tiene el tamaño
  // acordado (o si se cansó de esperar).
  function revisarMapa() {
    if (!red || red.estado !== "midiendo") return;
    const ahora = performance.now();
    const m = red.mapa;
    if (m) {
      const listo =
        window.innerWidth === m.w && window.innerHeight === m.h;
      if (listo || ahora > m.hasta) empezarOnline();
    } else if (ahora > red.midiendoHasta) {
      empezarOnline();
    }
  }

  function empezarOnline() {
    red.estado = "jugando";
    if (modoEl) modoEl.hidden = true;
    centrarNave(); // en su esquina del mapa ya acordado
  }

  // La dirección del emparejador, con la clave si hay (ver abrirClave).
  function urlServidor() {
    if (!clave) return SERVIDOR;
    const url = new URL(SERVIDOR);
    url.searchParams.set("clave", clave);
    return url.href;
  }

  function conectarOnline() {
    red = { ws: null, rol: null, estado: "conectando" };
    infoRed.ultimo = 0; // el silencio se cuenta desde el primer estado que llegue
    acumLatido = 0;
    mostrarEstadoOnline();
    let ws;
    try {
      ws = new WebSocket(urlServidor());
    } catch (e) {
      red.estado = "sin-conexion";
      mostrarEstadoOnline();
      return;
    }
    red.ws = ws;
    ws.onmessage = (ev) => {
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      if (m.tipo === "estado") infoRed.via = "servidor";
      recibirOnline(m);
    };
    ws.onclose = () => {
      if (!red) return;
      if (red.estado === "jugando") {
        // Con la conexión directa andando, el servidor ya cumplió (los
        // presentó) y este socket no lleva nada: que se caiga (hay redes que
        // cortan lo que está ocioso) no quiere decir que el rival se haya ido.
        // Eso se nota porque deja de llegar su estado (ver vigilarRival).
        if (!directoVivo()) rivalSeFue();
      } else if (red.estado !== "se-fue") {
        red.estado = "sin-conexion";
        mostrarEstadoOnline();
      }
    };
  }

  // La conexión directa está lista (el canal de eventos es el que no pierde
  // nada; el de estado se abre junto con él).
  const directoVivo = () =>
    !!red && !!red.canales && red.canales.eventos.readyState === "open";

  // Si ya está la conexión directa (ver conectarDirecto) va por ahí: el estado
  // por el canal que no reenvía lo perdido (uno perdido ya no sirve, llega
  // otro enseguida) y el resto (goles) por el que sí. Si no, por el servidor.
  function enviarOnline(m) {
    if (!red) return;
    const canal =
      red.canales && red.canales[m.tipo === "estado" ? "estado" : "eventos"];
    if (canal && canal.readyState === "open") canal.send(JSON.stringify(m));
    else if (red.ws && red.ws.readyState === 1) red.ws.send(JSON.stringify(m));
  }

  // --- Conexión directa (WebRTC) ----------------------------------------------
  // El servidor de emparejamiento está lejos (en Miami: Cloudflare no tiene
  // Durable Objects en Sudamérica), así que pasar todo por él suma mucha
  // demora. Una vez emparejados, se usa solo para presentarlos (las ofertas y
  // candidatos de WebRTC viajan como mensajes "rtc") y el juego va directo de
  // una PC a la otra. Si la conexión directa no se logra (hay redes que no la
  // dejan), todo sigue por el servidor como antes. El WebSocket queda abierto:
  // por él llega "rival-se-fue".
  const SERVIDORES_STUN = [
    { urls: "stun:stun.cloudflare.com:3478" },
    { urls: "stun:stun.l.google.com:19302" },
  ];

  function conectarDirecto() {
    if (typeof RTCPeerConnection === "undefined") return;
    let pc;
    try {
      pc = new RTCPeerConnection({ iceServers: SERVIDORES_STUN });
    } catch (e) {
      return;
    }
    red.pc = pc;
    red.iceEnEspera = []; // candidatos que llegan antes que la oferta o la respuesta
    // Los dos canales se arman igual de los dos lados (negotiated), sin
    // esperar a que el otro los anuncie.
    red.canales = {
      estado: pc.createDataChannel("estado", {
        negotiated: true,
        id: 0,
        ordered: false,
        maxRetransmits: 0,
      }),
      eventos: pc.createDataChannel("eventos", { negotiated: true, id: 1 }),
    };
    for (const canal of Object.values(red.canales)) {
      canal.onmessage = (ev) => {
        let m;
        try {
          m = JSON.parse(ev.data);
        } catch (e) {
          return;
        }
        if (m.tipo === "estado") infoRed.via = "directo";
        recibirOnline(m);
      };
    }
    red.canales.eventos.onopen = () =>
      console.info("[online] conexión directa con el rival");
    pc.onicecandidate = (ev) => {
      if (ev.candidate) enviarPorServidor({ tipo: "rtc", ice: ev.candidate });
    };
    pc.onconnectionstatechange = () => {
      if (pc.connectionState !== "failed" && pc.connectionState !== "closed")
        return;
      // Si el servidor sigue ahí, se vuelve a pasar todo por él (ver
      // enviarOnline); si tampoco está, no queda camino: el rival se fue.
      if (red && red.ws && red.ws.readyState === 1)
        console.info("[online] sin conexión directa: sigue por el servidor");
      else if (red && red.estado === "jugando") rivalSeFue();
    };
    if (soyAnfitrion()) {
      pc.createOffer()
        .then((oferta) => pc.setLocalDescription(oferta))
        .then(() =>
          enviarPorServidor({ tipo: "rtc", sdp: pc.localDescription }),
        )
        .catch(() => {});
    }
  }

  function enviarPorServidor(m) {
    if (red && red.ws && red.ws.readyState === 1)
      red.ws.send(JSON.stringify(m));
  }

  function recibirRtc(m) {
    const pc = red && red.pc;
    if (!pc) return;
    if (m.sdp) {
      pc.setRemoteDescription(m.sdp)
        .then(() => {
          for (const c of red.iceEnEspera)
            pc.addIceCandidate(c).catch(() => {});
          red.iceEnEspera = [];
          if (m.sdp.type !== "offer") return;
          return pc
            .createAnswer()
            .then((respuesta) => pc.setLocalDescription(respuesta))
            .then(() =>
              enviarPorServidor({ tipo: "rtc", sdp: pc.localDescription }),
            );
        })
        .catch(() => {});
    } else if (m.ice) {
      if (pc.remoteDescription) pc.addIceCandidate(m.ice).catch(() => {});
      else red.iceEnEspera.push(m.ice);
    }
  }

  function mostrarEstadoOnline() {
    if (!modoEl) return;
    const el = document.getElementById("game-modo-estado");
    if (!el) return;
    modoEl.classList.add("buscando");
    el.hidden = false;
    const textos = {
      conectando: "conectando",
      midiendo: "rival encontrado",
      esperando: clave
        ? BUSCANDO_HTML + "<br /><small>con la clave " +
          clave +
          "<br />esc para cancelar</small>"
        : BUSCANDO_HTML + "<br /><small>esc para cancelar</small>",
      "sin-conexion":
        "sin conexion con el servidor<br /><small>esc para volver</small>",
    };
    el.innerHTML = textos[red.estado] || "";
  }

  // "buscando rival" con los puntitos que se escriben y se borran (ver
  // BUSCANDO_PUNTOS): van aparte, pegados a la derecha, así el texto no se
  // corre del centro mientras cambian.
  const BUSCANDO_HTML =
    '<span class="game-buscando">buscando rival<span class="game-puntos"></span></span>';
  function animarPuntosOnline() {
    const el = modoEl && modoEl.querySelector(".game-puntos");
    if (!el) return;
    const paso = Math.floor(reloj / BUSCANDO_PUNTO_DURA) % BUSCANDO_PUNTOS.length;
    if (el.textContent !== BUSCANDO_PUNTOS[paso])
      el.textContent = BUSCANDO_PUNTOS[paso];
  }

  function recibirOnline(m) {
    if (m.tipo === "esperando") {
      red.estado = "esperando";
      mostrarEstadoOnline();
    } else if (m.tipo === "emparejado") {
      red.rol = m.rol;
      // Recién acá se sabe el color: el anfitrión (el que esperaba) es el
      // azul, el invitado el rojo (ver esAzul) -y con él, la esquina.
      ship.classList.toggle("multijugador", soyAnfitrion());
      ship.classList.toggle("color-rival", !soyAnfitrion());
      conectarDirecto();
      // La nave y el fuego que eligió cada uno (ver "El selector de naves").
      enviarOnline({ tipo: "nave", nave: eleccionJ1.nave, fuego: eleccionJ1.fuego });
      // El mismo cielo en las dos pantallas: la semilla del anfitrión.
      if (soyAnfitrion()) enviarOnline({ tipo: "cielo", semilla: semillaCielo });
      // Antes de jugar, el mapa (ver "El mapa del online").
      red.estado = "midiendo";
      red.midiendoHasta = performance.now() + MAPA_ESPERA_OTRO;
      mostrarEstadoOnline();
      enviarOnline({
        tipo: "pantalla",
        w: window.innerWidth,
        h: window.innerHeight,
      });
      if (red.otraPantalla) acordarMapa();
    } else if (m.tipo === "pantalla") {
      if (m.w > 0 && m.h > 0) {
        red.otraPantalla = { w: m.w, h: m.h };
        if (red.estado === "midiendo") acordarMapa();
      }
    } else if (m.tipo === "nave") {
      aplicarNaveRival({ nave: m.nave, fuego: m.fuego });
    } else if (m.tipo === "cielo") {
      if (!soyAnfitrion() && Number.isFinite(m.semilla)) armarCielo(m.semilla);
    } else if (m.tipo === "rtc") {
      recibirRtc(m);
    } else if (m.tipo === "latido") {
      // El latido del rival (ver LATIDO_CADA): no hay nada que hacer, con que
      // haya pasado algo por el socket alcanza.
    } else if (m.tipo === "ping") {
      enviarOnline({ tipo: "pong", t: m.t });
    } else if (m.tipo === "pong") {
      infoRed.ping = performance.now() - m.t;
    } else if (m.tipo === "rival-se-fue") {
      rivalSeFue();
    } else if (m.tipo === "fondo") {
      if (!soyAnfitrion()) correrFondo(m.lado === -1 ? -1 : 1);
    } else if (m.tipo === "formas") {
      recibirFormas(m);
    } else if (m.tipo === "formas?") {
      reenviarFormas(m.ids);
    } else if (m.tipo === "estado") {
      recibirEstadoRival(m);
    } else if (m.tipo === "entre") {
      if (soyAnfitrion()) golInvitado(m.id);
    } else if (m.tipo === "gol") {
      if (!soyAnfitrion()) recibirGol(m);
    }
  }

  // Que se fuera el rival lo avisa el servidor, pero si este ya no está (se
  // cayó el socket y la partida sigue por la conexión directa) no hay quien
  // avise: se nota porque deja de llegar el estado del rival, que llega 20
  // veces por segundo. Con el servidor todavía ahí no se mira, así que quedarse
  // un rato en otra pestaña no cuenta como irse.
  function vigilarRival() {
    if (!infoRed.ultimo || !red || red.estado !== "jugando") return;
    if (red.ws && red.ws.readyState === 1) return;
    if (performance.now() - infoRed.ultimo > SILENCIO_RIVAL * 1000)
      rivalSeFue();
  }

  function rivalSeFue() {
    if (!red || red.estado === "se-fue") return;
    red.estado = "se-fue";
    // Con el cartel un rato y después, de vuelta a la elección.
    fin = { t: 0, ganador: "abandono" };
    frenarMusica();
    cumulos = [];
    mostrarTiempo();
  }

  // Lo que se le manda al rival cada ENVIO_CADA: la nave (centro de su caja en
  // el mundo, giro, si está golpeada o parpadeando) y las piedras propias; el
  // anfitrión, además, los agujeros y el marcador.
  function enviarEstado() {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pose = window.shipPose;
    if (!pose || !pose.listo) return;
    const sx = pose.x + cajaNave / 2;
    const sy = pose.y + cajaNave / 2;
    const m = {
      tipo: "estado",
      ts: Math.round(performance.now()), // ms, en el reloj de quien lo manda
      x: r4((cam.ox + (sx - cam.ox) / cam.z) / W),
      y: r4((cam.oy + (sy - cam.oy) / cam.z) / H),
      rot: r1(pose.rot),
      stun: r1(stunJugador * 10) / 10,
      tc: r1(tChoque * 10) / 10,
      inv: r1(invulJugador * 10) / 10,
      p: poligonos.map((p) => [
        p.id,
        r4(p.x / W),
        r4(p.y / H),
        r4(p.vx / W),
        r4(p.vy / H),
        r1(p.ang * 100) / 100,
        r1(p.giro * 100) / 100,
      ]),
    };
    enviarFormas();
    if (soyAnfitrion()) {
      m.c = cumulos.map((c) => [
        c.id,
        r4(c.x / W),
        r4(c.y / H),
        r1(c.t * 10) / 10,
        c.par ? c.par.id : 0,
      ]);
      m.g = golesConfirmados(); // goles del anfitrión y del invitado
    }
    enviarOnline(m);
  }

  // La forma de una piedra (sus puntas y su radio) no cambia nunca, así que
  // viaja una sola vez, apenas nace, y por el canal que no pierde nada: en el
  // estado, veinte veces por segundo, va solo dónde está. Antes cada estado
  // repetía las puntas de todas las piedras y el que las recibía las tiraba.
  function enviarFormas() {
    const nuevas = poligonos.filter((p) => !p.formaEnviada);
    if (!nuevas.length) return;
    for (const p of nuevas) p.formaEnviada = true;
    enviarOnline({
      tipo: "formas",
      f: nuevas.map((p) => [
        p.id,
        r1(p.radio),
        p.verts.map((v) => [r1(v.x), r1(v.y)]),
      ]),
    });
  }

  // Las formas de las piedras del rival. Puede llegar justo después del estado
  // que ya las nombraba (son dos caminos distintos): esa piedra se dibuja un
  // cuadro más tarde, cuando se sabe cómo es (ver seguirRivalOnline).
  function recibirFormas(m) {
    for (const [id, radio, verts] of m.f) {
      if (piedrasRival.has(id)) continue;
      piedrasRival.set(id, {
        id,
        x: 0,
        y: 0,
        vx: 0,
        vy: 0,
        ang: 0,
        giro: 0,
        radio,
        verts: verts.map(([a, b]) => ({ x: a, y: b })),
        pts: [],
      });
    }
  }

  // Red de seguridad: si un estado nombra una piedra que no se sabe cómo es
  // (cada uno reinicia la partida en su momento, y el que arranca antes olvida
  // las formas que el otro ya dio por mandadas), se la pide y el otro la
  // vuelve a mandar. No se pide la misma dos veces en un segundo: hasta que
  // llegue la respuesta siguen entrando estados que la nombran.
  const formasPedidas = new Map(); // id -> cuándo se pidió (ms)

  function pedirFormasQueFaltan(m) {
    const ahora = performance.now();
    const faltan = [];
    for (const [id] of m.p) {
      if (
        piedrasRival.has(id) ||
        ahora - (formasPedidas.get(id) || -1e9) < 1000
      )
        continue;
      formasPedidas.set(id, ahora);
      faltan.push(id);
    }
    if (faltan.length) enviarOnline({ tipo: "formas?", ids: faltan });
  }

  // El rival pide formas que se le perdieron: se marcan para que salgan de
  // nuevo con el próximo estado.
  function reenviarFormas(ids) {
    const pedidas = new Set(ids);
    for (const p of poligonos) if (pedidas.has(p.id)) p.formaEnviada = false;
  }

  function recibirEstadoRival(m) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (!rival) crearRival();
    const ahora = performance.now();
    if (infoRed.ultimo)
      infoRed.huecoMax = Math.max(infoRed.huecoMax, ahora - infoRed.ultimo);
    infoRed.ultimo = ahora;
    infoRed.recibidos++;
    const t = m.ts / 1000;
    // El desfase de relojes es el más chico visto (el de un mensaje que llegó
    // sin demoras de más); sube despacito por si la conexión se vuelve más lenta.
    const d = performance.now() / 1000 - t;
    desfaseReloj =
      desfaseReloj == null ? d : Math.min(d, desfaseReloj + 0.0005);
    // Cuánto más tarde que el más rápido llegó este (se olvida a la mitad en
    // unos 2 s, a 20 mensajes por segundo).
    atrasoRed = Math.max(d - desfaseReloj, atrasoRed * 0.983);
    const p = new Map();
    for (const [id, x, y, vx, vy, ang, giro] of m.p)
      p.set(id, [x * W, y * H, vx * W, vy * H, ang, giro]);
    pedirFormasQueFaltan(m);
    const ultimo = estadosRival[estadosRival.length - 1];
    if (ultimo && t <= ultimo.t) return; // llegó desordenado: ya hay uno más nuevo
    // Dio la vuelta por un costado: saltó de un lado de la pantalla al otro.
    if (ultimo && Math.abs(m.x * W - ultimo.x) > W / 2)
      anotarVuelta("rival", m.x * W < ultimo.x ? 1 : -1);
    estadosRival.push({
      t,
      x: m.x * W,
      y: m.y * H,
      rot: m.rot,
      stun: m.stun,
      tc: m.tc,
      inv: m.inv,
      p,
    });
    if (!soyAnfitrion() && m.c) {
      // Los agujeros del anfitrión (conservando el giro de los que ya estaban,
      // para que no salten). Si aparece uno nuevo, suena como siempre.
      vencerPredichos();
      const ocultos = idsPredichos(); // los de un par ya cerrado acá
      const crudos = ocultos.size
        ? m.c.filter(([id]) => !ocultos.has(id))
        : m.c;
      const previos = new Map(cumulos.map((c) => [c.id, c]));
      let nuevo = false;
      const lista = crudos.map(([id, x, y, t]) => {
        let c = previos.get(id);
        if (!c) {
          c = { id, ang: Math.random() * Math.PI * 2 };
          nuevo = true;
        }
        c.x = x * W;
        c.y = y * H;
        c.t = t;
        c.par = null;
        return c;
      });
      const porId = new Map(lista.map((c) => [c.id, c]));
      crudos.forEach((d, i) => (lista[i].par = porId.get(d[4]) || null));
      cumulos = lista;
      if (nuevo) sonarPortal();
    }
    if (!soyAnfitrion() && m.g && !fin) {
      vencerPredichos();
      // Con un gol adelantado sin confirmar, el marcador del anfitrión todavía
      // no lo tiene: no se baja el número que ya se mostró.
      cumulosTomados = golesPredichos.size
        ? Math.max(m.g[1], cumulosTomados)
        : m.g[1];
      golesRival = m.g[0];
      actualizarColor();
    }
  }

  // Cada cuadro: la nave y las piedras del rival como estaban hace
  // retrasoRed (ver arriba). Si se quedó sin mensajes nuevos, la nave y las
  // piedras siguen un poco con la velocidad que traían.
  function seguirRivalOnline(dt) {
    if (!rival || !estadosRival.length) return;
    // El retraso va hacia el que hace falta: rápido si hay que subirlo (si
    // no, la nave se queda sin mensajes y se frena) y despacio si hay que
    // bajarlo (el rival se ve apenas más rápido un rato, sin saltos).
    const meta = Math.min(RETRASO_MAX, Math.max(RETRASO_MIN, atrasoRed + 0.03));
    retrasoRed += Math.max(-0.1 * dt, Math.min(0.5 * dt, meta - retrasoRed));
    const t = performance.now() / 1000 - desfaseReloj - retrasoRed;
    infoRed.retraso = retrasoRed;
    while (estadosRival.length > 2 && estadosRival[1].t <= t)
      estadosRival.shift();
    let a = estadosRival[0];
    let b = estadosRival[1];
    if (b && b.t <= t) {
      a = b;
      b = null;
    }
    const f = b ? Math.max(0, Math.min(1, (t - a.t) / (b.t - a.t))) : 0;

    const antesX = rival.x;
    const antesY = rival.y;
    const primera = !rival.visto;
    rival.visto = true;
    if (!b) {
      // Sin mensajes nuevos: sigue un poco con la velocidad que traía (la de
      // los dos últimos), en vez de quedarse clavada hasta que llegue otro.
      const prev = estadosRival.length > 1 ? estadosRival[0] : null;
      const hueco = prev ? a.t - prev.t : 0;
      const s = Math.min(Math.max(0, t - a.t), 0.3);
      if (prev && hueco > 0 && Math.hypot(a.x - prev.x, a.y - prev.y) < 250) {
        rival.x = a.x + ((a.x - prev.x) / hueco) * s;
        rival.y = a.y + ((a.y - prev.y) / hueco) * s;
      } else {
        rival.x = a.x;
        rival.y = a.y;
      }
      rival.rot = a.rot;
    } else if (Math.hypot(b.x - a.x, b.y - a.y) > 250) {
      // Un salto grande es un teletransporte (salió por un agujero): no se suaviza.
      const e = f < 0.5 ? a : b;
      rival.x = e.x;
      rival.y = e.y;
      rival.rot = e.rot;
    } else {
      rival.x = a.x + (b.x - a.x) * f;
      rival.y = a.y + (b.y - a.y) * f;
      let d = b.rot - a.rot;
      d = ((((d + 180) % 360) + 360) % 360) - 180;
      rival.rot = a.rot + d * f;
    }
    const e = b && f >= 1 ? b : a;
    const antes = rival.stun;
    rival.stun = e.stun;
    rival.t = e.tc;
    rival.invul = e.inv;
    // Lo acaba de golpear una piedra: el mismo ruido y las chispas de siempre.
    if (antes <= 0 && rival.stun > 0) {
      sonarPerder();
      chispas(rival.x, rival.y);
    }
    const dist = primera
      ? 0
      : Math.hypot(rival.x - antesX, rival.y - antesY) * cam.z;
    actualizarFuegoRival(dt, dt > 0 && dist < 250 ? dist / dt : 0);

    // Las piedras: las que están en el mensaje más nuevo (las que ya no están
    // salieron por abajo). Una recién nacida se ubica hacia atrás con su velocidad.
    const lista = [];
    const ultimo = b || a;
    for (const [id, q] of ultimo.p) {
      const piedra = piedrasRival.get(id);
      if (!piedra) continue;
      const r = b && a.p.get(id);
      if (r) {
        piedra.x = r[0] + (q[0] - r[0]) * f;
        piedra.y = r[1] + (q[1] - r[1]) * f;
        piedra.ang = r[4] + (q[4] - r[4]) * f;
      } else {
        const s = Math.max(-0.5, Math.min(0.5, t - ultimo.t));
        piedra.x = q[0] + q[2] * s;
        piedra.y = q[1] + q[3] * s;
        piedra.ang = q[4] + q[5] * s;
      }
      piedra.vx = q[2];
      piedra.vy = q[3];
      actualizarPuntos(piedra);
      lista.push(piedra);
    }
    poligonosRival = lista;
    // Las formas de las que ya no están en ningún mensaje guardado, fuera.
    if (piedrasRival.size > lista.length + 50)
      for (const id of piedrasRival.keys())
        if (!estadosRival.some((s) => s.p.has(id))) piedrasRival.delete(id);
  }

  // --- Goles online sin ventaja para el anfitrión -------------------------------
  // El anfitrión decide los goles, pero su llegada a un agujero se ve al
  // instante y la del invitado le llega tarde (lo que tarda el mensaje). Para
  // que eso no le dé ventaja:
  // - A cada llegada del invitado se le descuenta el viaje del mensaje
  //   (latenciaRed: la mitad de la ida y vuelta del ping).
  // - El gol del anfitrión se ve enseguida, pero queda a confirmar un rato
  //   (lo que tarda un mensaje, más EMPATE_MS y un margen): si en ese rato
  //   llega el invitado al mismo par, con menos de EMPATE_MS de diferencia es
  //   gol para los dos, y si llegó claramente antes, es solo suyo.
  // - Si el invitado cerró un par y el anfitrión llega ahí menos de EMPATE_MS
  //   después, también es gol para los dos (ver empateTardio).
  // Cada par cerrado queda anotado un rato en "cierres": { ids, agujeros, t0
  // (cuándo llegó el primero, en el reloj de acá), anfitrion e invitado
  // ({ e, s }: por dónde entró y salió cada uno, o null), pendiente, hasta }.
  const EMPATE_MARGEN = 30; // ms de más por si un mensaje se demora

  function latenciaRed() {
    return infoRed.ping ? infoRed.ping / 2 : 40; // ms
  }

  const cierreDe = (id) => cierres.find((c) => c.ids.includes(id));

  // Los goles que ya puede saber el invitado: sin los del anfitrión que
  // todavía están a confirmar.
  function golesConfirmados() {
    const aConfirmar = cierres.filter((c) => c.pendiente && c.anfitrion).length;
    return [cumulosTomados - aConfirmar, golesRival];
  }

  // Anfitrión: entró a un agujero (el gol ya se vio, ver golPropio). Queda a
  // confirmar hasta que ya no pueda llegar un aviso del invitado que cambie algo.
  function anotarCierreAnfitrion(entrado) {
    const salida = entrado.par || entrado;
    const ahora = performance.now();
    cierres.push({
      ids: [entrado.id, salida.id],
      agujeros: [entrado, salida],
      t0: ahora,
      anfitrion: { e: entrado, s: salida },
      invitado: null,
      pendiente: true,
      hasta: ahora + latenciaRed() + EMPATE_MS + EMPATE_MARGEN,
    });
  }

  // Cada cuadro: los goles del anfitrión que ya pasaron su rato se confirman.
  function resolverCierres() {
    const ahora = performance.now();
    for (const c of cierres) {
      if (!c.pendiente || ahora < c.hasta) continue;
      c.pendiente = false;
      enviarGolOnline(c);
      revisarFin();
    }
    cierres = cierres.filter((c) => c.pendiente || ahora - c.t0 < 5000);
  }

  // Anfitrión: el invitado avisa que entró a un agujero.
  function golInvitado(id) {
    if (fin || ganado) return;
    const llego = performance.now() - latenciaRed(); // cuándo entró, en el reloj de acá
    const cierre = cierreDe(id);
    if (cierre) {
      // Un par que ya cerró el anfitrión (si lo cerró el invitado, es un aviso
      // repetido).
      if (!cierre.anfitrion || cierre.invitado) return;
      const dif = llego - cierre.t0; // positivo: el invitado llegó después
      if (dif > EMPATE_MS) return; // tarde: el par era del anfitrión
      const entrado = cierre.agujeros.find((h) => h.id === id);
      const salida = cierre.agujeros.find((h) => h !== entrado) || entrado;
      cierre.invitado = { e: entrado, s: salida };
      golesRival++;
      if (dif < -EMPATE_MS && cierre.pendiente) {
        // Llegó claramente antes: el gol del anfitrión no cuenta.
        cierre.anfitrion = null;
        cumulosTomados--;
      }
      mostrarGolInvitado(entrado, salida);
      // Si el del anfitrión ya estaba confirmado (el aviso se demoró de más),
      // queda como empate y se avisa ya; si no, al confirmarse.
      if (!cierre.pendiente) {
        enviarGolOnline(cierre, "invitado");
        revisarFin();
      }
      return;
    }
    const entrado = cumulos.find((c) => c.id === id);
    if (!entrado) return;
    const salida = entrado.par || entrado;
    cumulos = cumulos.filter((c) => c !== entrado && c !== salida);
    golesRival++;
    const nuevo = {
      ids: [entrado.id, salida.id],
      agujeros: [entrado, salida],
      t0: llego,
      anfitrion: null,
      invitado: { e: entrado, s: salida },
      pendiente: false,
      hasta: 0,
    };
    cierres.push(nuevo);
    mostrarGolInvitado(entrado, salida);
    enviarGolOnline(nuevo);
    revisarFin();
  }

  // El gol del invitado, del lado del anfitrión: del color que le tocó al
  // rival (acá siempre el rojo: el anfitrión es siempre el azul).
  function mostrarGolInvitado(entrado, salida) {
    chispas(entrado.x, entrado.y);
    chispas(salida.x, salida.y);
    crearNumeroEstrellas(salida.x, salida.y, golesRival, colorRival());
    actualizarColor();
    sonarCruce();
    decirHitoRival();
    mostrarTiempo();
  }

  // Anfitrión: llega a un par que el invitado cerró hace menos de EMPATE_MS
  // (acá ya no se ve, pero estaba ahí): gol para los dos.
  function empateTardio(circulos) {
    const ahora = performance.now();
    for (const c of cierres) {
      if (c.anfitrion || !c.invitado || ahora > c.t0 + EMPATE_MS) continue;
      const tocado = c.agujeros.find((h) =>
        circulos.some(
          (n) => Math.hypot(n.x - h.x, n.y - h.y) < n.r + CUMULO_RADIO,
        ),
      );
      if (!tocado) continue;
      c.anfitrion = { e: tocado, s: tocado.par || tocado };
      cumulosTomados++;
      golPropio(tocado);
      enviarGolOnline(c, "anfitrion");
      revisarFin();
      return;
    }
  }

  // Le cuenta al invitado cómo quedó un par: de quién fue el gol ("anfitrion",
  // "invitado" o "ambos"), por dónde entró y salió cada uno y el marcador.
  function enviarGolOnline(
    c,
    quien = c.anfitrion && c.invitado
      ? "ambos"
      : c.anfitrion
        ? "anfitrion"
        : "invitado",
  ) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const pos = (h) => [r4(h.x / W), r4(h.y / H)];
    const m = { tipo: "gol", quien, g: golesConfirmados() };
    if (quien !== "anfitrion") {
      m.id = c.invitado.e.id;
      m.e = pos(c.invitado.e);
      m.s = pos(c.invitado.s);
    }
    if (quien !== "invitado") {
      m.a = [pos(c.anfitrion.e), pos(c.anfitrion.s)];
      if (quien === "anfitrion") {
        m.id = c.anfitrion.e.id;
        m.e = m.a[0];
        m.s = m.a[1];
      }
    }
    enviarOnline(m);
  }

  // Invitado: el anfitrión confirma un gol, del invitado ("invitado"), suyo
  // ("anfitrion") o de los dos a la vez ("ambos", ver "Goles online").
  function recibirGol(m) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    const aPx = (p) => ({ x: p[0] * W, y: p[1] * H });
    // Se cierra el par acá mismo (el próximo estado del anfitrión igual lo saca).
    const cerca = (c, p) => Math.hypot(c.x - p.x, c.y - p.y) < 2;
    const puntos = [m.e, m.s, ...(m.a || [])].filter(Boolean).map(aPx);
    cumulos = cumulos.filter((c) => !puntos.some((p) => cerca(c, p)));
    cumulosTomados = m.g[1];
    golesRival = m.g[0];
    if (m.quien !== "anfitrion") {
      // Gol mío. Si es el que ya se adelantó (ver predecirGolPropio), esto
      // solo lo confirma: la nave ya salió y el par ya se cerró.
      if (!golesPredichos.delete(m.id)) {
        const e = aPx(m.e);
        const s = aPx(m.s);
        chispas(e.x, e.y);
        if (window.shipPlace) window.shipPlace(s.x, s.y, true);
        crearNumeroEstrellas(s.x, s.y, cumulosTomados, colorPropio());
        decirGol(cumulosTomados, vozDeHito(true), false); // el final, en revisarFin
        sonarCruce();
      }
    }
    if (m.quien !== "invitado") {
      // Gol del anfitrión: del lado del invitado es el rival.
      const [e, s] = (m.a || [m.e, m.s]).map(aPx);
      chispas(e.x, e.y);
      chispas(s.x, s.y);
      crearNumeroEstrellas(s.x, s.y, golesRival, colorRival());
      sonarCruce();
      if (m.quien === "anfitrion") decirHitoRival();
    }
    actualizarColor();
    mostrarTiempo();
    revisarFin();
  }

  function dibujarRival() {
    if (!rival || ganado) return;
    if (enLinea() && !rival.visto) return; // todavía no llegó dónde está
    if (rival.stun > 0 && rival.t >= DURACION_CHOQUE) return; // fuera de juego: no se ve
    const img = imgDeNave(naveRival, rival); // si es de costado, el lado lo guarda rival.lado
    if (!img.complete || !img.naturalWidth) return;
    const w = lienzoRival.width;
    const h = lienzoRival.height;
    // Las tres capas juntas (atrás, fuego, adelante), como la nave del jugador.
    const c = lienzoRival.getContext("2d");
    c.clearRect(0, 0, w, h);
    const fondo = naveRival.fondo;
    if (fondo && fondo.complete && fondo.naturalWidth)
      c.drawImage(fondo, 0, 0, w, h);
    c.drawImage(lienzoFuegoRival, 0, 0);
    c.drawImage(img, 0, 0, w, h);

    const k = escalaNaveMundo();
    const lado = cajaNave;
    const ancho = (lado * lienzoRival.width) / lienzoRival.height;
    ctx.save();
    ctx.translate(rival.x, rival.y);
    ctx.rotate((rival.rot * Math.PI) / 180);
    ctx.scale(k, k);
    // Recién vuelta de un golpe parpadea (igual que la del jugador, ver
    // .invulnerable en styles.css).
    // La de la PC, más transparente que la del jugador para no confundirlas;
    // la del jugador 2 se ve entera (es de alguien que la está manejando).
    ctx.globalAlpha =
      (modo === "dos" ? 1 : RIVAL_OPACIDAD) *
      (rival.invul > 0 ? parpadeo(rival.invul) : 1);
    // Igual que la nave del jugador en el juego: en blanco y negro, con el
    // levantado de brillo de la luz prendida (0,35, el mismo de siempre). Con
    // dos jugadores lo prende y apaga el jugador 2 y contra la PC lo decide la
    // IA (luzRival, ver actualizarRival); online la nave del rival queda
    // siempre "iluminada". Se va tiñendo con sus goles y, encima, su halo: rojo o
    // azul según le haya tocado (ver esAzul).
    const gris = 1 - Math.min(1, tinteNaves);
    const iluminada = modo === "dos" || modo === "pc" ? luzRival : true;
    ctx.filter =
      "grayscale(" +
      gris.toFixed(3) +
      ") brightness(" +
      (1 + (iluminada ? 0.35 : 0) * gris).toFixed(3) +
      ") " +
      (calidadBaja()
        ? esAzul()
          ? HALO_ROJO_BAJA
          : HALO_AZUL_BAJA
        : esAzul()
          ? HALO_ROJO
          : HALO_AZUL);
    // El sprite va pegado a la izquierda de su caja.
    ctx.drawImage(lienzoRival, -lado / 2, -lado / 2, ancho, lado);
    ctx.restore();
  }

  // Opacidad del parpadeo: baja a 0.35 y vuelve, 0.3 s por vuelta (mismo ritmo
  // que la animación CSS de la nave del jugador).
  function parpadeo(t) {
    return 0.35 + 0.65 * (0.5 + 0.5 * Math.cos((t / 0.3) * Math.PI * 2));
  }

  function dibujarPoligonos(lista, borde) {
    ctx.strokeStyle = borde;
    for (const p of lista) {
      ctx.beginPath();
      const pts = p.pts;
      ctx.moveTo(pts[0].x, pts[0].y);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }
  }

  // --- El fondo se corre ------------------------------------------------------
  // Si las dos naves dan la vuelta por el mismo costado casi a la vez (las dos
  // yendo para el mismo lado), el cielo gira una pantalla entera sobre su tubo
  // para ese lado (ver CIELO y dibujarEstrellas), como si juntas hubieran
  // avanzado; al dar la vuelta al tubo reaparece el mismo cielo. Es solo el
  // fondo: las piedras y los agujeros siguen donde están. Online lo decide el
  // anfitrión y le avisa al invitado ("fondo"), así las dos pantallas giran
  // juntas. En el tutorial se está solo: gira con cada vuelta de la nave.
  const FONDO_JUNTAS = 1.2; // s que puede haber entre las dos vueltas
  const vueltaDe = { jugador: null, rival: null }; // la última de cada nave: { lado, t }
  let fondoCorre = null; // { desde, hasta, t (0 a 1) } mientras se corre

  // lado: 1 si salió por la derecha, -1 por la izquierda.
  function anotarVuelta(quien, lado) {
    if (!lado || (enLinea() && !soyAnfitrion())) return;
    if (esTutorial()) {
      correrFondo(lado);
      return;
    }
    const otra = vueltaDe[quien === "jugador" ? "rival" : "jugador"];
    if (otra && otra.lado === lado && reloj - otra.t <= FONDO_JUNTAS) {
      vueltaDe.jugador = vueltaDe.rival = null;
      correrFondo(lado);
      if (enLinea()) enviarOnline({ tipo: "fondo", lado });
    } else {
      vueltaDe[quien] = { lado, t: reloj };
    }
  }

  // Si ya se estaba girando, la pantalla nueva se suma a la que faltaba.
  function correrFondo(lado) {
    const meta = fondoCorre ? fondoCorre.hasta : cieloCorrido;
    fondoCorre = { desde: cieloCorrido, hasta: meta + lado, t: 0 };
  }

  // Arranca y frena suave (smoothstep): no pega un tirón al empezar. Al
  // terminar se lo lleva adentro del tubo (es lo mismo girar 4 que 1).
  function moverFondo(dt) {
    if (!fondoCorre) return;
    const f = fondoCorre;
    f.t = Math.min(1, f.t + dt / CIELO.giroDura);
    const k = f.t * f.t * (3 - 2 * f.t);
    cieloCorrido = f.desde + (f.hasta - f.desde) * k;
    if (f.t < 1) return;
    const n = CIELO.pantallas;
    cieloCorrido = ((f.hasta % n) + n) % n;
    fondoCorre = null;
  }

  // Estrellas del fondo (decoración, no se chocan). Se ven siempre: en el juego,
  // en la intro y en el final, sobre el fondo negro o el starry. Son blancas, y
  // en la intro y en el final algunas (ciertos grupos) son salmón. 4 fills por
  // capa (uno por grupo, cada grupo con su titilar).
  //
  // Cada capa es un tubo (ver armarCielo) y la pantalla muestra una pantalla
  // de él, pintada sobre un cilindro: con CIELO.curvatura el borde de la
  // pantalla queda a curvatura * 90° del centro, así las estrellas se juntan
  // hacia los costados y, al girar, entran lentas, aceleran en el medio y
  // frenan al irse. Con 0 queda plano.
  function dibujarEstrellas() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const conSalmon = !negro || ganado; // intro y final
    const tope = CIELO.curvatura * (Math.PI / 2);
    const curva = tope > 0.001 ? Math.sin(tope) : 0;
    for (const capa of capasCielo) {
      const corrida = cieloCorrido * capa.gira;
      for (let g = 0; g < GRUPOS_ESTRELLAS.length; g++) {
        const grupo = GRUPOS_ESTRELLAS[g];
        ctx.fillStyle =
          conSalmon && GRUPOS_SALMON.includes(g) ? ESTRELLA_SALMON : "#fff";
        ctx.globalAlpha =
          capa.brillo *
          (0.3 + 0.6 * (0.5 + 0.5 * Math.sin(reloj * grupo.vel + grupo.fase)));
        ctx.beginPath();
        for (const e of capa.porGrupo[g]) {
          // d: dónde cae en la pantalla (0 el borde izquierdo, 1 el derecho).
          let d = (((e.p - corrida) % capa.largo) + capa.largo) % capa.largo;
          if (d > capa.largo - CIELO_MARGEN) d -= capa.largo; // asoma por la izquierda
          if (d > 1 + CIELO_MARGEN) continue; // está en otra parte del tubo
          let u = d * 2 - 1; // -1 a 1 del borde izquierdo al derecho
          if (curva) {
            const ang = u * tope;
            if (Math.abs(ang) >= Math.PI / 2) continue; // del otro lado del cilindro
            u = Math.sin(ang) / curva;
          }
          const x = (u + 1) * 0.5 * w;
          const y = e.fy * h;
          ctx.moveTo(x + e.r, y);
          ctx.arc(x, y, e.r, 0, Math.PI * 2);
        }
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;
  }

  // Un anillo de estrellas con brillo, dibujado en un canvas aparte (una sola
  // vez): el resplandor (shadowBlur) es lo caro, así no se recalcula por cuadro.
  function armarAnillo(radio, cantidad, r, color) {
    const K = SPRITE_ESCALA;
    const lado = Math.ceil((radio + r + CUMULO_BRILLO * 2) * 2 * K);
    const lienzo = document.createElement("canvas");
    lienzo.width = lienzo.height = lado;
    const c = lienzo.getContext("2d");
    c.translate(lado / 2, lado / 2);
    c.fillStyle = color;
    c.shadowColor = color;
    c.shadowBlur = CUMULO_BRILLO * K;
    for (let i = 0; i < cantidad; i++) {
      const a = (i / cantidad) * Math.PI * 2;
      // Varias pasadas: el resplandor se refuerza y se nota más, sin correrse
      // ni un píxel (el sprite mide lo mismo, ver CUMULO_BRILLO_PASADAS).
      for (let k = 0; k < CUMULO_BRILLO_PASADAS; k++) {
        c.beginPath();
        c.arc(
          Math.cos(a) * radio * K,
          Math.sin(a) * radio * K,
          r * K,
          0,
          Math.PI * 2,
        );
        c.fill();
      }
    }
    return lienzo;
  }

  // Todo lo caro de dibujar se arma acá, una sola vez (al entrar al escenario).
  function armarSprites() {
    // Los dos anillos de los agujeros, cada uno en blanco y en naranja.
    gusanoSprites = {
      afuera: [CUMULO_COLOR_INICIO, CUMULO_COLOR_FIN].map((color) =>
        armarAnillo(CUMULO_ANILLO, CUMULO_ESTRELLAS, CUMULO_ESTRELLA_R, color),
      ),
      adentro: [CUMULO_COLOR_INICIO, CUMULO_COLOR_FIN].map((color) =>
        armarAnillo(
          CUMULO_ANILLO * CUMULO_INTERIOR_RADIO,
          CUMULO_INTERIOR,
          CUMULO_ESTRELLA_R * 0.75,
          color,
        ),
      ),
    };
    // La luz de la nave: el mismo degradado que el resto de la página (el
    // ::before de .starry-cohete-pair en styles.css). Se arranca en un color
    // según de quién es (blanco en el tutorial, que no tiene equipo; azul o
    // rojo bien clarito con rival, para distinguir de quién es cada linterna,
    // ver dibujarLuz) y termina en salmón, como la nave se va coloreando; en
    // cada cuadro los dos sprites solo se estiran a su tamaño y se mezclan
    // según el color de la nave, con la intensidad.
    const n = 256;
    const armarLuzSprite = (rgb) => {
      const sprite = document.createElement("canvas");
      sprite.width = sprite.height = n;
      const c = sprite.getContext("2d");
      const g = c.createRadialGradient(n / 2, n / 2, 0, n / 2, n / 2, n / 2);
      g.addColorStop(0, `rgba(${rgb},1)`);
      g.addColorStop(0.2, `rgba(${rgb},0.65)`);
      g.addColorStop(0.5, `rgba(${rgb},0.25)`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      c.fillStyle = g;
      c.fillRect(0, 0, n, n);
      return sprite;
    };
    luzSprites = {
      blanco: armarLuzSprite(LUZ_RGB_INICIO),
      azul: armarLuzSprite(LUZ_RGB_INICIO_JUGADOR),
      rojo: armarLuzSprite(LUZ_RGB_INICIO_RIVAL),
      fin: armarLuzSprite(LUZ_RGB_FIN),
    };
  }

  // Dibuja un sprite de anillo rotado. Como los anillos de estrellas son
  // parejos, rotar el sprite se ve igual que mover cada estrella.
  function dibujarAnilloSprite(sprite, x, y, giro, esc, alfa) {
    if (alfa <= 0.01) return;
    const lado = (sprite.width / SPRITE_ESCALA) * esc;
    ctx.save();
    // Los anillos son luz: se suman a lo que hay detrás en vez de taparlo
    // ("lighter"). El agujero se ve bastante más luminoso sin ocupar ni un
    // píxel más -lo que crece es el brillo, no el tamaño-.
    ctx.globalCompositeOperation = "lighter";
    ctx.translate(x, y);
    ctx.rotate(giro);
    ctx.globalAlpha = alfa;
    ctx.drawImage(sprite, -lado / 2, -lado / 2, lado, lado);
    ctx.restore();
  }

  // Color intermedio entre el de inicio y el de fin de los agujeros (para las
  // chispas, que se dibujan directo).
  function mezclarColores(desde, hasta, k) {
    const a = parseInt(desde.slice(1), 16);
    const b = parseInt(hasta.slice(1), 16);
    const canal = (sh) =>
      Math.round(((a >> sh) & 255) * (1 - k) + ((b >> sh) & 255) * k);
    return "rgb(" + canal(16) + "," + canal(8) + "," + canal(0) + ")";
  }

  // El resplandor de una luz de nave prendida (ver luzNivel/luzNivelRival),
  // centrado en (x, y), con esa intensidad (0..1). Empieza blanca y pasa al
  // salmón con el color de la nave -un fundido entre los dos sprites, como en
  // los agujeros-.
  function dibujarLuz(x, y, nivel, inicio) {
    if (nivel <= 0.01 || !luzSprites) return;
    const k = Math.max(0, Math.min(1, colorNave));
    const sprites = [luzSprites[inicio], luzSprites.fin];
    for (let v = 0; v < 2; v++) {
      const alfa = LUZ_INTENSIDAD * nivel * (v === 0 ? 1 - k : k);
      // El que no se ve (opacidad casi 0) no se dibuja: es una imagen grande y
      // rellenarla cada cuadro cuesta.
      if (alfa < 0.002) continue;
      ctx.globalAlpha = alfa;
      ctx.drawImage(
        sprites[v],
        x - LUZ_RADIO,
        y - LUZ_RADIO,
        LUZ_RADIO * 2,
        LUZ_RADIO * 2,
      );
    }
    ctx.globalAlpha = 1;
  }

  // Lo mismo que mezclarColores pero devuelve "#rrggbb" (para poder seguir
  // mezclándolo, como el color de las estrellas de los números). Los hex tienen
  // que venir de seis dígitos: parseInt("fff", 16) no es blanco.
  function mezclarHex(desde, hasta, k) {
    const a = parseInt(desde.slice(1), 16);
    const b = parseInt(hasta.slice(1), 16);
    const canal = (sh) =>
      Math.round(((a >> sh) & 255) * (1 - k) + ((b >> sh) & 255) * k);
    return (
      "#" +
      ((1 << 24) | (canal(16) << 16) | (canal(8) << 8) | canal(0))
        .toString(16)
        .slice(1)
    );
  }

  function mezclaAgujeros(k) {
    return mezclarColores(CUMULO_COLOR_INICIO, CUMULO_COLOR_FIN, k);
  }

  // Agujeros de gusano: un circulito de estrellas con brillo girando muy rápido,
  // con otro anillo más chico girando para el otro lado y el centro negro (el
  // "agujero"). Empiezan blancos y, a medida que se colorea la nave, pasan a
  // naranja: son dos sprites (blanco y naranja) que se funden con colorNave.
  // Y las chispas de cuando se entra o se sale.
  // 0..1: qué tanto se está estirando el agujero. pos = segundos desde el pulso
  // del compás y tiempo = lo que dura un tiempo de la música (los dos en segundos
  // del audio original). Sube rápido (el "estirón", que arranca justo con el
  // bombo) y baja más despacio, los dos con suavizado.
  function pulsoCumulo(pos, tiempo) {
    const u = pos / (CUMULO_PULSO_TIEMPOS * tiempo);
    if (u >= 1) return 0;
    const s =
      u < CUMULO_PULSO_ATAQUE
        ? u / CUMULO_PULSO_ATAQUE
        : 1 - (u - CUMULO_PULSO_ATAQUE) / (1 - CUMULO_PULSO_ATAQUE);
    return s * s * (3 - 2 * s);
  }

  // Un agujero en (x, y), girado ang, de tamaño esc (1 = el del juego) y con
  // el color k (0 = blanco, 1 = naranja).
  function dibujarAgujero(x, y, ang, esc, k) {
    // El agujero: un disco negro que tapa lo que hay detrás (la luz, las
    // estrellas del fondo) y deja bien visible el "pozo" del medio.
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(x, y, CUMULO_ANILLO * CUMULO_DISCO_RADIO * esc, 0, Math.PI * 2);
    ctx.fill();
    for (let v = 0; v < 2; v++) {
      // v = 0: blanco (se apaga con k); v = 1: naranja (aparece con k).
      const alfa = v === 0 ? 1 - k : k;
      dibujarAnilloSprite(gusanoSprites.afuera[v], x, y, ang, esc, alfa);
      dibujarAnilloSprite(
        gusanoSprites.adentro[v],
        x,
        y,
        -ang * 1.7,
        esc,
        alfa,
      );
    }
    ctx.globalAlpha = 1;
  }

  // Las chispas de entrar y salir de los agujeros, del color k de los agujeros.
  function dibujarChispas(k) {
    if (!particulas.length) return;
    ctx.fillStyle = mezclaAgujeros(k);
    ctx.beginPath();
    for (const p of particulas) {
      const r = 2 * (1 - p.t / 0.7);
      ctx.moveTo(p.x + r, p.y);
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  function dibujarCumulos() {
    const k = Math.max(0, Math.min(1, colorNave));
    // Dónde va la música en su compás (todos los agujeros pulsan a la vez, al
    // compás). Sin música que seguir (audio bloqueado o sin cargar) pulsan con su
    // propio reloj, a la velocidad normal.
    const ritmo = compasMusica();
    for (const c of cumulos) {
      if (!prendido(c)) continue; // todavía no (ver prendeT en crearPar)
      const compas = ritmo ? ritmo.compas : MUSICA_COMPAS_RESPALDO;
      const pos = ritmo ? ritmo.pos : c.t % compas;
      // Aparecen y se van achicándose (no con transparencia); en el medio
      // pulsan (ver pulsoCumulo).
      const esc =
        Math.min(1, (c.t - (c.prendeT || 0)) / 0.5, (CUMULO_VIDA - c.t) / 1.5) *
        (1 +
          CUMULO_PULSO_AMPLITUD *
            pulsoCumulo(pos, compas / MUSICA_TIEMPOS_COMPAS));
      dibujarAgujero(c.x, c.y, c.ang, esc, k);
    }
    dibujarChispas(k);
    if (numeroEstrellas.length) {
      // Titilan igual que las estrellas de fondo (ver dibujarEstrellas): por
      // eso no van todas en un solo trazo como las chispas, cada una necesita
      // su propia opacidad. Las más prendidas (brillo alto) quedan blanco
      // puro; las apagadas se van tiñendo del color del jugador que hizo el
      // gol (en el tutorial, que no tiene rival, del blanco al salmón a medida
      // que se cuentan pasajes). Al caer dejan de titilar: quedan fijas en su
      // opacidad y en el color que tenían justo antes de caer (se achican pero
      // no se desvanecen, como siempre).
      for (const e of numeroEstrellas) {
        if (e.t < 0) continue;
        const cayendo = e.t - NUMERO_CAE_A;
        const r =
          e.r * (cayendo > 0 ? Math.max(0, 1 - cayendo / NUMERO_CAIDA) : 1);
        if (r <= 0.05) continue;
        // Cayendo, el reloj se congela en el instante en que empezó la caída.
        const brillo =
          0.5 +
          0.5 * Math.sin((reloj - Math.max(0, cayendo)) * e.titVel + e.titFase);
        // El blanco puro queda solo para el pico del brillo (elevado a una
        // potencia): la mayoría del tiempo, aun bastante prendidas, se ven
        // del color del gol.
        const prendida = brillo * brillo * brillo * brillo;
        ctx.globalAlpha = cayendo > 0 ? 1 : 0.3 + 0.6 * brillo;
        ctx.fillStyle = mezclarColores("#ffffff", e.color, 1 - prendida);
        ctx.beginPath();
        ctx.moveTo(e.x + r, e.y);
        ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
  }

  function dibujar(centro) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    // De acá en más se dibuja en coordenadas del mundo, con el zoom aplicado.
    ctx.setTransform(
      dpr * cam.z,
      0,
      0,
      dpr * cam.z,
      dpr * cam.ox * (1 - cam.z),
      dpr * cam.oy * (1 - cam.z),
    );
    if (final) {
      // Zoom del final (todo lo que sigue se acerca a la nave del jugador, y
      // ahí se queda en la fase 2). El fondo starry, que es CSS, acompaña con
      // menos zoom.
      const z = zoomNave();
      ctx.translate(cam.ox, cam.oy);
      ctx.scale(z, z);
      ctx.translate(-cam.ox, -cam.oy);
      scene.style.setProperty(
        "--fondo-zoom",
        (1 + (z - 1) * FINAL_ZOOM_FONDO).toFixed(4),
      );
      scene.style.setProperty("--fondo-origen", cam.ox + "px " + cam.oy + "px");
    }

    dibujarEstrellas();

    // La luz de la nave sobre el fondo, debajo de los polígonos: como son
    // negros y opacos, contra ese resplandor se ven como siluetas. Solo en el
    // juego: en la intro y en el final la nave prendida se ve como en el index
    // (sin esta luz grande; ver game-color y game-luz-index en styles.css). Con
    // dos jugadores, la del jugador 2 (rival) es la misma luz, en su nave.
    if (negro && !final) {
      // Con game-color o game-luz-index la luz ya la pone el CSS (el ::before
      // de la nave, ver styles.css): las dos juntas se verían como un halo
      // doble, con el del canvas unos px más arriba (52 contra 58 de la caja).
      const luzCss =
        ship.classList.contains("game-color") ||
        ship.classList.contains("game-luz-index");
      if (centro && !luzCss)
        dibujarLuz(
          centro.x,
          centro.y,
          luzNivel,
          esTutorial() ? "blanco" : esAzul() ? "azul" : "rojo",
        );
      if (rival && (modo === "dos" || modo === "pc"))
        dibujarLuz(rival.x, rival.y, luzNivelRival, esAzul() ? "rojo" : "azul");
    }

    dibujarEstela();
    dibujarCumulos();
    dibujarIntro();

    ctx.lineWidth = 1.6; // ~3.5px en pantalla con el zoom normal
    ctx.lineJoin = "round";
    // Relleno: del negro al azul starry a medida que se colorea la nave (igual
    // que el fondo y los agujeros). El borde dice de qué lluvia es cada piedra:
    // azul la que persigue al jugador, rojo la que persigue a la PC.
    ctx.fillStyle = mezclarColores(
      "#000000",
      POLIGONO_COLOR_FIN,
      Math.max(0, Math.min(1, colorNave)),
    );
    // En el tutorial, con el borde blanco del sitio (no hay otra lluvia).
    dibujarPoligonos(poligonos, esTutorial() ? "#fff" : colorPropio());
    dibujarPoligonos(poligonosRival, colorRival());
    dibujarRival();
    dibujarFinal();
    // Lo que sigue va en pantalla, sin el zoom de la cámara.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dibujarPunteros();
  }

  // --- Punteros de las naves que quedaron fuera de la pantalla -------------
  // Contra la PC y online la cámara va pegada a la nave del jugador, así que la
  // del rival puede irse de la pantalla y uno se queda sin saber dónde está.
  // Entonces se la marca con una flecha del color de esa nave, pegada al borde
  // por el que se fue y en la posición donde estaría: si se fue por el costado,
  // a la altura que tiene; si se fue por arriba o por abajo, a lo ancho donde
  // está. Si se fue en diagonal queda en la esquina, apuntando a ella.
  //
  // Con dos jugadores la cámara muestra el mapa completo (ver camera.zoom en
  // script.js), pero las naves igual pueden salirse un poco por arriba y por
  // abajo: ahí también va la flecha de cada una.
  const PUNTERO_BORDE = 24; // px del borde de la pantalla a la punta del triángulo
  const PUNTERO_LADO = 22; // px: lado del triángulo equilátero

  function dibujarPunteros() {
    // Ni en el tutorial (no hay rival), ni con la intro corriendo (la nave
    // entra desde afuera), ni con el final en curso.
    if (esTutorial() || ganado || final || introT >= 0) return;
    // El rival, cuando está en juego: las mismas condiciones que dibujarRival,
    // así la flecha aparece exactamente cuando la nave se vería.
    if (
      rival &&
      !(enLinea() && !rival.visto) &&
      !(rival.stun > 0 && rival.t >= DURACION_CHOQUE)
    )
      puntero(
        aPantalla(rival.x, cam.ox),
        aPantalla(rival.y, cam.oy),
        colorRival(),
      );
    // Y la del jugador. shipPose viene en pantalla y pegada a la izquierda de
    // su caja (ver circulosNave), así que el centro es media caja más allá.
    const p = window.shipPose;
    const yo = p && p.listo ? { x: p.x + cajaNave / 2, y: p.y + cajaNave / 2 } : null;
    if (yo && !ship.classList.contains("fuera-de-juego"))
      puntero(yo.x, yo.y, colorPropio());
    // Los agujeros aparecen en cualquier lugar del mapa (ver crearCumulo):
    // cada uno que quede fuera de la pantalla lleva su flecha en el borde,
    // que se ve como un agujero: negra por dentro y con el borde y el brillo
    // del color de su anillo (blanco al principio y cada vez más salmón, como
    // ellos). Así siempre se sabe dónde están los dos.
    const colorAgujero = mezclaAgujeros(Math.max(0, Math.min(1, colorNave)));
    for (const c of cumulos)
      if (prendido(c))
        puntero(aPantalla(c.x, cam.ox), aPantalla(c.y, cam.oy), colorAgujero, "#000");
  }

  // Del mundo a la pantalla: la inversa de lo que hace circulosNave, y lo mismo
  // que el transform del canvas (ver dibujar).
  const aPantalla = (v, origen) => origen + (v - origen) * cam.z;

  // relleno (opcional): el de adentro, y color queda para el borde y el
  // resplandor (la de los agujeros); si no, toda del color.
  function puntero(sx, sy, color, relleno) {
    const W = window.innerWidth;
    const H = window.innerHeight;
    if (sx >= 0 && sx <= W && sy >= 0 && sy <= H) return; // se ve: no hay nada que marcar
    const m = PUNTERO_BORDE;
    const px = Math.max(m, Math.min(W - m, sx));
    const py = Math.max(m, Math.min(H - m, sy));
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(Math.atan2(sy - py, sx - px)); // mira hacia donde quedó la nave
    // Rellena sólida y con su resplandor, el mismo de los halos de las naves
    // (en calidad baja, sin resplandor: el shadowBlur es caro).
    if (!calidadBaja()) {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
    }
    ctx.fillStyle = relleno || color;
    // Equilátero: los tres lados miden PUNTERO_LADO (la punta y la base
    // quedan a 2/3 y 1/3 de la altura del centroide, que es el punto que se
    // clava en el borde).
    const alto = PUNTERO_LADO * (Math.sqrt(3) / 2);
    const punta = (alto * 2) / 3;
    const base = -alto / 3;
    ctx.beginPath();
    ctx.moveTo(punta, 0);
    ctx.lineTo(base, -PUNTERO_LADO / 2);
    ctx.lineTo(base, PUNTERO_LADO / 2);
    ctx.closePath();
    ctx.fill();
    if (relleno) {
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.strokeStyle = color;
      ctx.stroke();
    }
    ctx.restore();
  }

  function cuadro(ahora) {
    raf = requestAnimationFrame(cuadro);
    // Tope al dt: al volver de otra pestaña no debe caer todo de golpe. Y
    // nunca negativo: el timestamp del primer cuadro puede ser anterior al
    // performance.now() de setActive, y un dt < 0 dejaba introT en negativo
    // (la intro se salteaba entera).
    const intervalo = ahora - ultimo;
    const dt = Math.max(0, Math.min(intervalo / 1000, 0.05));
    ultimo = ahora;
    avanzarPosicionMusica();

    if (modo) {
      // Con un modo ya elegido, el joystick puede pausar en cualquier momento
      // (jugando, buscando rival o con el cartel del final), igual que Escape
      // y que el botón de arriba a la izquierda.
      pausaConJoystick();
      if (pausa === "menu") {
        // En pausa no avanza nada ni se vuelve a dibujar (el canvas queda con
        // el último cuadro): la nave quieta y el joystick recorre el menú.
        if (window.shipMove) window.shipMove(0, 0);
        navegarMenuJoystick(dt);
        mostrarControles();
        return;
      }
      if (pausa === "salir") navegarSalirJoystick();
    }
    orientarNaveJugador();

    if (presenta) {
      actualizarPresentacion(dt);
      return;
    }
    if (esperaToque) {
      // Esperando el toque para poder sonar (ver entrarConSonido): el botón A
      // del joystick también vale; el teclado y el mouse tienen sus eventos.
      const gp = primerJoystick();
      const a = !!gp && botonPad(gp, PAD_A);
      if (a && !esperaToque.padA) seguirConSonido(false);
      else esperaToque.padA = a;
      return;
    }
    if (selector) {
      actualizarSelector(dt);
      return;
    }
    const circulos = circulosNave();
    reloj += dt;
    moverFondo(dt);
    if (!modo) {
      // Eligiendo el modo: todo espera, con la nave quieta en el medio abajo.
      if (window.shipMove) window.shipMove(0, 0);
      if (claveAbierta()) navegarClaveJoystick();
      else navegarMenuJoystick(dt);
      mostrarControles();
      dibujar(circulos[1]);
      return;
    }
    if (esperandoRival()) {
      // Online, buscando rival: sin piedras ni agujeros, pero con la nave
      // suelta (parpadeando, ver actualizarTinte), hasta que el emparejador
      // junta a los dos y se acuerda el mapa (ver revisarMapa).
      revisarMapa();
      actualizarTinte(dt);
      animarPuntosOnline();
      dibujar(circulos[1]);
      return;
    }
    actualizarControles();
    // La nave va ganando color de a poco (no de golpe) hacia colorObjetivo, y
    // muy despacio: cada pasaje tarda varios segundos en terminar de teñirla.
    if (Math.abs(colorObjetivo - colorNave) > 0.0005) {
      const suavizado = final ? FINAL_COLOR_SUAVIZADO : COLOR_SUAVIZADO;
      colorNave += (colorObjetivo - colorNave) * Math.min(1, dt * suavizado);
      aplicarColorNave();
    }
    actualizarTinte(dt);
    if (final) {
      final.t += dt;
      // Se deja quieta a la nave del jugador donde está (sin control, como en la
      // intro) para que no salga del escenario sin querer.
      if (window.shipMove) window.shipMove(0, 0);
      // Zoom a la nave (ya a color); cuando termina, sin cortes, llegan las
      // naves.
      window.shipZoom = zoomNave();
      if (final.fase === 1) {
        if (final.t >= FINAL_NAVE_DUR) pasarAFaseNaves();
      } else {
        // La nave del jugador mira a las navecitas, como en la intro.
        const t = final.t - FINAL_NAVE_DUR;
        mirarNaves(circulos[1], navesFinal(t), t);
      }
      if (
        final.fase === 2 &&
        !final.salio &&
        final.t - FINAL_NAVE_DUR > FINAL_FUERA + FINAL_COLA
      ) {
        // Terminó la animación del final. Ya no se usa (acá no está el final de
        // las navecitas, ver terminarPartida), pero si llegara: al menú.
        final.salio = true;
        salirAlMenu();
      }
    }
    if (choque) {
      tChoque += dt;
      // El resto del campo queda quieto. La piedra que chocó sigue de largo
      // y la nave, golpeada, cae acelerando y girando (el desplazamiento va
      // en px del mundo: la cámara está anclada a la nave).
      if (golpeadora) {
        golpeadora.y += golpeadora.vy * dt;
        golpeadora.ang += golpeadora.giro * dt;
        actualizarPuntos(golpeadora);
      }
      naveCae.y += GRAVEDAD * dt;
      if (window.shipMove)
        window.shipMove(naveCae.x * dt, naveCae.y * dt, naveCae.giro * dt);
      if (tChoque >= DURACION_CHOQUE) reiniciar(true);
    } else if (introT >= 0 && introT < INTRO_JUEGO) {
      // Intro: todavía no corre el tiempo ni caen polígonos, y el jugador no
      // controla la nave (hace su entrada, flota y mira a las navecitas) hasta
      // que arranca el segundero.
      introT += dt;
      if (!oscuro && introT >= INTRO_FUERA) {
        // Desaparecieron las navecitas: cae la pantalla negra por encima de
        // todo, la nave incluida (sigue a color mientras se oscurece).
        oscuro = true;
        if (tapa) tapa.classList.add("cae");
      }
      if (!negro && introT >= INTRO_FUERA + INTRO_FUNDIDO) {
        // Ya está toda negra: el fondo y la nave pasan a blanco y negro sin
        // que se vea.
        negro = true;
        scene.classList.remove("game-intro");
        ship.classList.remove("game-color");
      }
      tQuieta = 0;
      navePrev = null;
      if (window.shipPlace) {
        // Sin control del jugador: la nave hace su propia entrada y flota.
        const p = posicionNaveIntro(introT);
        window.shipPlace(p.x, p.y, true);
      }
      mirarNaves(circulos[1], navesIntro(introT), introT);
    } else {
      if (introT >= 0) {
        introT = -1; // termina la intro
        // Pasada la oscuridad la nave prende la luz (con su sonido), se levanta
        // la pantalla negra y la nave aparece en blanco y negro, ya bajo el
        // control del jugador; empiezan las instrucciones.
        levantarTapa(false);
        if (window.shipLightSet) window.shipLightSet(true);
        // En celulares se saltea todo esto (ver esCelular arriba): arranca el
        // juego directo, como si ya hubiera terminado. Las instrucciones de
        // moverse son solo del tutorial; contra la PC, con dos jugadores y
        // online no hacen falta, pero las dos naves igual se acercan al medio
        // y dicen "listo" antes de arrancar (ver empezarArranque).
        if (esCelular()) terminarAyuda();
        else if (esTutorial()) empezarAyuda();
        else empezarArranque();
      }
      if (ayuda) actualizarAyuda(dt);
      if (ayuda) {
        // Instrucciones: el tiempo no corre (sin segundero ni polígonos ni
        // agujeros) y la nave se mueve libre. Con rival (el "listo" antes de
        // arrancar), la otra nave también: la PC, el jugador 2 o, online, la
        // del otro tal como llega (si no, una arrancaba adelantada).
        tQuieta = 0;
        navePrev = null;
        if (!esTutorial()) {
          if (enLinea()) seguirRivalOnline(dt);
          else actualizarRival(dt, circulos);
        }
        // Las vueltas de ahora corren el fondo pero no traen piedras ni presión
        // (ver actualizar): se dan por vistas, si no caían todas juntas al
        // arrancar.
        const vueltas = window.shipVueltas || 0;
        if (vueltas !== vueltasVistas) {
          anotarVuelta("jugador", window.shipVueltaLado);
          vueltasVistas = vueltas;
        }
        vueltasRivalVistas = vueltasRival;
      } else {
        // La música del juego acelera de a muy poquito.
        if (musicaFuente || (musica && !musica.paused)) {
          musicaT += dt;
          acelerarMusica();
        }
        const centro = circulos[1];
        if (centro && navePrev && dt > 0) {
          const vel =
            Math.hypot(centro.x - navePrev.x, centro.y - navePrev.y) / dt;
          tQuieta = vel < QUIETA_MOV ? tQuieta + dt : 0;
        }
        navePrev = centro ? { x: centro.x, y: centro.y } : null;
        if (tiempo < gracia) {
          // Quieta por la gracia: no cuenta para las piedras que buscan a la nave.
          tQuieta = 0;
          // En el tutorial la nave se sostiene en el medio durante la gracia.
          // Con rival no: las dos vienen moviéndose libres desde el "listo" y
          // sostener solo esta la dejaba atrás.
          if (enCentro && esTutorial()) centrarNave();
        }
        if (fin) {
          // Alguien llegó a 10: el cartel, un segundo más en cámara lenta y
          // después todo quieto hasta la otra partida.
          fin.t += dt;
          if (fin.t < FIN_LENTO_DURA) {
            animarFin(dt * FIN_LENTO, circulos);
          } else {
            window.shipLento = 1;
            if (window.shipMove) window.shipMove(0, 0);
          }
          // Si se fue el rival online, de vuelta a la elección; contra la PC
          // (gane quien gane), al menú parado en "contra la PC" (con la
          // dificultad que se venía jugando, que queda guardada); si no, otra
          // partida (online, con el mismo rival).
          if (fin.t >= FIN_DURA) {
            if (fin.ganador === "abandono" || esTutorial()) salirAlMenu();
            else if (modo === "pc") salirAlMenu("pc");
            else reiniciar(true);
          }
        } else {
          actualizarInvulJugador(dt);
          if (stunJugador > 0) {
            tQuieta = 0;
            actualizarStunJugador(dt);
          }
          actualizar(dt, circulos);
        }
      }
    }
    luzNivel += ((luz ? 1 : 0) - luzNivel) * Math.min(1, dt * 6);
    luzNivelRival +=
      (((modo === "dos" || modo === "pc") && luzRival ? 1 : 0) -
        luzNivelRival) *
      Math.min(1, dt * 6);
    // Jugando: la calidad automática mide cuánto tardan los cuadros (si cambia
    // de nivel, el canvas se reajusta acá mismo, antes de dibujar).
    if (window.calidad) window.calidad.cuadro(intervalo);
    dibujar(circulos[1]); // la luz sale del cuerpo de la nave
    // Online: lo que ve el rival de esta nave, 20 veces por segundo.
    if (enLinea() && red && red.estado === "jugando") {
      acumEnvio += dt;
      if (acumEnvio >= ENVIO_CADA) {
        // Se descuenta (no se pone en 0) para que sean 20 por segundo de verdad
        // y no uno cada 4 cuadros; el tope, por si hubo un cuadro muy largo.
        acumEnvio = Math.min(acumEnvio - ENVIO_CADA, ENVIO_CADA);
        enviarEstado();
      }
      acumPing += dt;
      if (acumPing >= 1) {
        acumPing = 0;
        enviarOnline({ tipo: "ping", t: performance.now() });
      }
      acumLatido += dt;
      if (acumLatido >= LATIDO_CADA) {
        acumLatido = 0;
        enviarPorServidor({ tipo: "latido" });
      }
      vigilarRival();
    }
  }

  // Leer offsetWidth obliga al navegador a recalcular estilos y layout en el
  // momento (y la nave cambia de estilo en cada cuadro), así que se lee una vez
  // por cambio de tamaño de ventana y no en cada cuadro.
  function medirNave() {
    cajaNave = ship.offsetWidth || CAJA_NAVE;
  }

  function ajustarCanvas() {
    medirNave();
    // Tope de 1,5x: en pantallas muy densas (2x o más) el canvas de 2x tiene el
    // doble de píxeles que cuesta rellenar en cada cuadro y el juego, casi todo
    // negro con formas chicas, no gana nada.
    // La calidad (js/calidad.js) lo baja a 1x en las PCs que no llegan y lo
    // sube a 2x en las pantallas muy densas que andan sobradas.
    dpr = window.calidad
      ? window.calidad.dpr()
      : Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  }

  window.addEventListener("resize", () => {
    if (activo) ajustarCanvas();
  });
  if (window.calidad)
    window.calidad.alCambiar(() => {
      if (activo) ajustarCanvas();
    });

  // --- Controles táctiles ------------------------------------------------------
  // En el celular (tactil) se juega con el dedo: en la mitad izquierda de la
  // pantalla, un stick que aparece donde se apoya el pulgar (y se queda
  // quieto, tenue, abajo a la izquierda mientras no se lo toca), y a la
  // derecha los botones de impulso y estela (mientras se los tiene
  // apretados) y el de la luz (prende y apaga). Se ven solo jugando. Todo va
  // a window.toque, que script.js lee como un joystick más (el stick y el
  // impulso) y quiereEstela como la X; la luz, como la Q (alternarLuzJ1).
  // Arriba a la derecha, el zoom: abierto (window.toque.zoomAbierto: la
  // cámara se aleja mientras la nave se mueve y se acerca cuando se queda
  // quieta, ver script.js) o cerrado (siempre cerca, como en la PC sin
  // Espacio). Se recuerda para la próxima vez.
  // Las pantallas del juego (menú, selector, clave, pausa) se tocan
  // directamente. La pantalla completa se pide con el toque de la carátula.
  // Si el marco achica el juego (index.html lo pone del tamaño de una
  // pantalla de compu), los controles se agrandan lo mismo (--tactil-escala):
  // quedan del tamaño de siempre para el dedo.
  const TOQUE_RADIO = 55; // px de la pantalla de verdad: hasta dónde se corre la perilla
  const ZOOM_GUARDADO = "esc4-zoom-celular";
  let zoomAbierto = true;
  try {
    zoomAbierto = localStorage.getItem(ZOOM_GUARDADO) !== "cerrado";
  } catch (e) {}
  window.toque = { x: 0, y: 0, activo: false, impulso: false, estela: false, zoomAbierto };
  const tactilEl = document.getElementById("game-tactil");
  if (tactil && tactilEl) {
    document.documentElement.classList.add("tactil");
    window.toqueControles = true;
    if (presentaToque) presentaToque.textContent = "toca la pantalla";
    const zona = document.getElementById("game-tactil-zona");
    const stick = document.getElementById("game-tactil-stick");
    const perilla = document.getElementById("game-tactil-perilla");
    const botones = [...tactilEl.querySelectorAll("[data-toque]")];
    const botonZoom = document.getElementById("game-tactil-zoom");
    const mostrarZoom = () => {
      botonZoom.textContent = window.toque.zoomAbierto ? "zoom abierto" : "zoom cerrado";
    };
    mostrarZoom();
    botonZoom.addEventListener("pointerdown", (ev) => {
      ev.preventDefault();
      window.toque.zoomAbierto = !window.toque.zoomAbierto;
      try {
        localStorage.setItem(ZOOM_GUARDADO, window.toque.zoomAbierto ? "abierto" : "cerrado");
      } catch (e) {}
      mostrarZoom();
      botonZoom.classList.add("apretado");
    });
    for (const tipo of ["pointerup", "pointercancel", "pointerleave"])
      botonZoom.addEventListener(tipo, () => botonZoom.classList.remove("apretado"));
    let dedo = null; // { id, x, y }: el pulgar del stick
    let escala = 1; // cuánto se agrandan los controles (ver --tactil-escala)
    const medirEscala = () => {
      const k = window.calidad ? window.calidad.escalaMarco() : 1;
      escala = 1 / k;
      document.documentElement.style.setProperty("--tactil-escala", escala.toFixed(4));
    };
    const reposo = () => {
      stick.style.left = 110 * escala + "px";
      stick.style.top = window.innerHeight - 110 * escala + "px";
    };
    const soltarStick = () => {
      dedo = null;
      window.toque.activo = false;
      window.toque.x = window.toque.y = 0;
      perilla.style.transform = "";
      stick.classList.remove("activo");
      reposo();
    };
    const moverStick = (ev) => {
      let dx = ev.clientX - dedo.x;
      let dy = ev.clientY - dedo.y;
      const d = Math.hypot(dx, dy);
      const radio = TOQUE_RADIO * escala;
      if (d > radio) {
        dx *= radio / d;
        dy *= radio / d;
      }
      perilla.style.transform = `translate(${dx}px, ${dy}px)`;
      window.toque.x = dx / radio;
      window.toque.y = dy / radio;
      window.toque.activo = true;
    };
    zona.addEventListener("pointerdown", (ev) => {
      if (dedo) return;
      ev.preventDefault();
      dedo = { id: ev.pointerId, x: ev.clientX, y: ev.clientY };
      zona.setPointerCapture(ev.pointerId);
      stick.style.left = ev.clientX + "px";
      stick.style.top = ev.clientY + "px";
      stick.classList.add("activo");
      moverStick(ev);
    });
    zona.addEventListener("pointermove", (ev) => {
      if (dedo && ev.pointerId === dedo.id) moverStick(ev);
    });
    for (const tipo of ["pointerup", "pointercancel", "lostpointercapture"])
      zona.addEventListener(tipo, (ev) => {
        if (dedo && ev.pointerId === dedo.id) soltarStick();
      });
    const soltarBoton = (b) => {
      b.classList.remove("apretado");
      if (b.dataset.toque !== "luz") window.toque[b.dataset.toque] = false;
    };
    for (const b of botones) {
      b.addEventListener("pointerdown", (ev) => {
        ev.preventDefault();
        b.setPointerCapture(ev.pointerId);
        b.classList.add("apretado");
        if (b.dataset.toque === "luz") {
          if (window.alternarLuzJ1) window.alternarLuzJ1();
        } else window.toque[b.dataset.toque] = true;
      });
      for (const tipo of ["pointerup", "pointercancel", "lostpointercapture"])
        b.addEventListener(tipo, () => soltarBoton(b));
    }
    medirEscala();
    reposo();
    window.addEventListener("resize", () => {
      medirEscala();
      if (!dedo) reposo();
    });
    // Se ven solo jugando (ni en el menú, ni en el selector, ni en la pausa,
    // ni con el final): al esconderse se suelta todo.
    (function mirarTactil() {
      const ver = !!modo && !pausa && !final && !ganado && !selector && !presenta && !claveAbierta();
      if (tactilEl.hidden === ver) {
        tactilEl.hidden = !ver;
        if (!ver) {
          soltarStick();
          botones.forEach(soltarBoton);
        }
      }
      requestAnimationFrame(mirarTactil);
    })();
  }

  // En el celular, al tocar la carátula: pantalla completa y acostada (donde
  // se pueda; si no, se sigue igual). Adentro del marco (index.html) la pide
  // la página de afuera: si la pidiera este documento, el marco quedaría en
  // pantalla completa del tamaño del celular y se perdería la pantalla de
  // compu achicada (ver mapaCelular en index.html).
  function pedirPantallaCompleta() {
    if (!tactil) return;
    let ventana = window;
    try {
      if (window.parent !== window && window.parent.document) ventana = window.parent;
    } catch (e) {} // (otro origen: se queda con esta)
    const doc = ventana.document;
    const el = doc.documentElement;
    if (doc.fullscreenElement || !el.requestFullscreen) return;
    el.requestFullscreen({ navigationUI: "hide" })
      .then(() => {
        const o = ventana.screen.orientation;
        if (o && o.lock) return o.lock("landscape");
      })
      .catch(() => {});
  }

  window.esc4Game = {
    // script.js: zoom de la cámara y punto de la pantalla que queda fijo.
    setCamera(z, x, y) {
      cam.z = z;
      cam.ox = x;
      cam.oy = y;
    },
    // script.js: luz de la nave prendida/apagada.
    setLight(valor) {
      luz = valor;
    },
    // script.js: con dos jugadores, el jugador 2 prende/apaga su luz (Y del
    // joystick, o Q/L del teclado; ver toggleLuzRival en script.js). Solo
    // tiene efecto en dibujarRival mientras modo === "dos".
    toggleLuzRival() {
      luzRival = !luzRival;
    },
    // script.js: ¿se muestra la barra de aviso de que la nave se va del escenario?
    // No durante la intro (la nave entra desde afuera) ni en el final.
    avisoSalida() {
      return negro && !ganado;
    },
    // script.js: ¿está bloqueado alejar la cámara (M/Espacio/LT/rueda)? Sí en la
    // intro, en el final y con el menú de modos a la vista (al arrancar o en
    // la pausa: ahí la rueda da vuelta los lados de dos jugadores).
    sinZoom() {
      return introT >= 0 || ganado || !modo || pausa === "menu";
    },
    setActive(valor) {
      if (valor === activo) return;
      activo = valor;
      if (valor) {
        ajustarCanvas();
        if (!gusanoSprites) armarSprites(); // brillos y luz: se arman una sola vez
        prepararNumeros(); // los números de estrellas (una sola vez por número)
        if (!musicaIniciada) {
          musicaIniciada = true;
          cargarMusica(); // que esté lista cuando termina la intro
          cargarSonidosMenu();
        }
        reiniciar(false, true);
        saltearIntro();
        modo = null; // se elige de nuevo cada vez que se entra
        window.dosJugadores = false;
        window.vueltaCostados = false;
        window.vueltaMargen = 0;
        window.j2Joystick = false;
        window.j2Teclado = false;
        window.tecladoAlReves = false;
        if (modoEl) modoEl.hidden = false;
        apuntarOpcion(0, true); // el menú arranca de nuevo en la primera opción
        padMenuY = 0;
        padMenuT = 0;
        padMenuA = false;
        padMenuLR = false;
        controlesCambiados = false;
        // Se eligió un modo desde la pausa (ver reiniciarEnModo): se entra
        // directo, sin pasar por el menú. Una sola vez: si no, cada recarga
        // volvería a ese modo.
        let dePausa = null;
        // Se volvió al menú (ver salirAlMenu): sin presentación. "1", o el
        // modo en el que arranca apuntado.
        let alMenu = null;
        try {
          dePausa = JSON.parse(sessionStorage.getItem(CLAVE_MODO_PAUSA));
          sessionStorage.removeItem(CLAVE_MODO_PAUSA);
          alMenu = sessionStorage.getItem(CLAVE_AL_MENU);
          sessionStorage.removeItem(CLAVE_AL_MENU);
        } catch (e) {}
        const i = dePausa
          ? opcionesModo.findIndex((el) => el.dataset.elegir === dePausa.modo)
          : -1;
        // Sin modo no hay nave: ni en el menú ni en el selector de naves (la
        // de la presentación la maneja ella, ver mostrarNave). Vuelve al
        // elegir un modo (ver elegirModo).
        ship.classList.add("game-sin-nave");
        if (i >= 0) {
          controlesCambiados = !!dePausa.cambiados;
          apuntarOpcion(i, true);
          entrarConSonido(() => elegirApuntada(true));
        } else if (alMenu) {
          // Como después de la presentación.
          const j = opcionesModo.findIndex((el) => el.dataset.elegir === alMenu);
          if (j >= 0) apuntarOpcion(j, true);
        } else if (!presentada && !embebido) {
          empezarPresentacion();
        }
        ultimo = performance.now();
        raf = requestAnimationFrame(cuadro);
      } else {
        cancelAnimationFrame(raf);
        if (presenta) terminarPresentacion();
        if (esperaToque) {
          esperaToque = null;
          if (presentaToque) presentaToque.hidden = true;
        }
        if (pausa) cerrarPausa();
        if (modoEl) modoEl.hidden = true;
        if (menuEl) menuEl.hidden = true;
        frenarSonidos();
        cancelarAyuda();
        limpiarFin();
        limpiarFinal(); // la nave vuelve a verse en el resto de los escenarios
        ship.classList.remove("game-color", "game-sin-nave");
        ship.style.removeProperty("--luz-rgb"); // en el resto de los escenarios la luz es la de siempre
        scene.classList.remove("game-intro");
        levantarTapa(true);
      }
    },
  };
})();
