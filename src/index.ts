import { HttpServer } from "@/http-server/HttpServer";
import { WSServer } from "@/ws-server/WSServer";
import process from "process";

const HTTP_PORT = process.env.PORT ?? 8181;
const httpServer = new HttpServer();
const webSocketServer = new WSServer();

function main() {
  webSocketServer.start();
  httpServer.start(HTTP_PORT);
}

main();
