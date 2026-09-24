// Emparejador del escenario 4 online. El juego se conecta por WebSocket a
// /buscar: si no hay nadie esperando, queda esperando; si hay alguien, se los
// junta (uno es el "anfitrion", que decide agujeros y goles, y el otro el
// "invitado") y desde ahí todo lo que manda uno le llega al otro, tal cual.
// El servidor no entiende el juego: solo junta y reenvía.
//
// Con /buscar?clave=algo solo se juntan los que pusieron la misma clave: hay
// una espera por clave, y la de sin clave ("") es la de cualquiera.

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/buscar" || url.pathname === "/donde") {
      if (url.pathname === "/buscar" && req.headers.get("Upgrade") !== "websocket")
        return new Response("Se esperaba un WebSocket", { status: 426 });
      return sala(env).fetch(req);
    }
    return new Response("Emparejador del escenario 4", { status: 200 });
  },
};

// La sala, en Sudamérica: los mensajes de cada pareja pasan por ella, así que
// conviene que esté cerca de los que juegan. Cloudflare usa la sugerencia de
// lugar solo al crear el Durable Object (después queda donde nació), por eso
// tiene un nombre nuevo: la de nombre "global" ya existía en otro lado.
function sala(env) {
  const id = env.SALA.idFromName("sudamerica");
  return env.SALA.get(id, { locationHint: "sam" });
}

export class Emparejador {
  constructor() {
    this.esperando = new Map(); // clave -> el que está buscando rival con ella
    this.pareja = new Map(); // cada socket -> el de su rival
  }

  async fetch(req) {
    // /donde: en qué centro de datos de Cloudflare quedó la sala (el "colo"
    // de la traza es el de donde corre este código, no el del que pregunta).
    if (new URL(req.url).pathname === "/donde") {
      const traza = await (await fetch("https://cloudflare.com/cdn-cgi/trace")).text();
      const colo = (traza.match(/^colo=(.*)$/m) || [])[1] || "?";
      return new Response("La sala está en " + colo + "\n");
    }
    const [cliente, servidor] = Object.values(new WebSocketPair());
    servidor.accept();
    const clave = limpiarClave(new URL(req.url).searchParams.get("clave"));
    this.entrar(servidor, clave);
    return new Response(null, { status: 101, webSocket: cliente });
  }

  entrar(ws, clave) {
    ws.addEventListener("message", (ev) => {
      const rival = this.pareja.get(ws);
      if (rival) enviar(rival, ev.data);
    });
    const salir = () => this.salir(ws);
    ws.addEventListener("close", salir);
    ws.addEventListener("error", salir);

    const otro = this.esperando.get(clave);
    if (otro) {
      this.esperando.delete(clave);
      this.pareja.set(otro, ws);
      this.pareja.set(ws, otro);
      enviar(otro, JSON.stringify({ tipo: "emparejado", rol: "anfitrion" }));
      enviar(ws, JSON.stringify({ tipo: "emparejado", rol: "invitado" }));
    } else {
      this.esperando.set(clave, ws);
      enviar(ws, JSON.stringify({ tipo: "esperando" }));
    }
  }

  salir(ws) {
    for (const [clave, w] of this.esperando)
      if (w === ws) this.esperando.delete(clave);
    const rival = this.pareja.get(ws);
    this.pareja.delete(ws);
    if (rival) {
      this.pareja.delete(rival);
      enviar(rival, JSON.stringify({ tipo: "rival-se-fue" }));
      try {
        rival.close(1000, "el rival se fue");
      } catch (e) {}
    }
  }
}

// La misma limpieza que hace el juego (ver limpiarClave en esc4-game.js):
// minúsculas, solo letras y números, hasta 16.
function limpiarClave(clave) {
  return (clave || "").toLowerCase().replace(/[^a-z0-9]/g, "").slice(0, 16);
}

function enviar(ws, datos) {
  try {
    ws.send(datos);
  } catch (e) {}
}
