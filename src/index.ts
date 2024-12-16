import { HttpServer } from "@/http-server/HttpServer";
import { WsServer } from "@/ws-server/ws-server";
import process from "process";

const HTTP_PORT = process.env.PORT ?? 8181;
const WS_PORT = 3000;
const httpServer = new HttpServer();
const webSocketServer = new WsServer(WS_PORT);

function main() {
  webSocketServer.start();
  httpServer.start(HTTP_PORT);
}

main();
