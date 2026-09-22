// Emparejador del escenario 4 online. El juego se conecta por WebSocket a
// /buscar: si no hay nadie esperando, queda esperando; si hay alguien, se los
// junta (uno es el "anfitrion", que decide agujeros y goles, y el otro el
// "invitado") y desde ahí todo lo que manda uno le llega al otro, tal cual.
// El servidor no entiende el juego: solo junta y reenvía.

export default {
  async fetch(req, env) {
    const url = new URL(req.url);
    if (url.pathname === "/buscar") {
      if (req.headers.get("Upgrade") !== "websocket")
        return new Response("Se esperaba un WebSocket", { status: 426 });
      const sala = env.SALA.get(env.SALA.idFromName("global"));
      return sala.fetch(req);
    }
    return new Response("Emparejador del escenario 4", { status: 200 });
  },
};

export class Emparejador {
  constructor() {
    this.esperando = null; // el que está buscando rival (uno por vez)
    this.pareja = new Map(); // cada socket -> el de su rival
  }

  async fetch() {
    const [cliente, servidor] = Object.values(new WebSocketPair());
    servidor.accept();
    this.entrar(servidor);
    return new Response(null, { status: 101, webSocket: cliente });
  }

  entrar(ws) {
    ws.addEventListener("message", (ev) => {
      const rival = this.pareja.get(ws);
      if (rival) enviar(rival, ev.data);
    });
    const salir = () => this.salir(ws);
    ws.addEventListener("close", salir);
    ws.addEventListener("error", salir);

    if (this.esperando) {
      const otro = this.esperando;
      this.esperando = null;
      this.pareja.set(otro, ws);
      this.pareja.set(ws, otro);
      enviar(otro, JSON.stringify({ tipo: "emparejado", rol: "anfitrion" }));
      enviar(ws, JSON.stringify({ tipo: "emparejado", rol: "invitado" }));
    } else {
      this.esperando = ws;
      enviar(ws, JSON.stringify({ tipo: "esperando" }));
    }
  }

  salir(ws) {
    if (this.esperando === ws) this.esperando = null;
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

function enviar(ws, datos) {
  try {
    ws.send(datos);
  } catch (e) {}
}
